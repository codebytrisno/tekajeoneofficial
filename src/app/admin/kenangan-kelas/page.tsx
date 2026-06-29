"use client"

import { useState, useEffect } from "react"
import {
  collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, Timestamp, serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminLayout from "@/components/AdminLayout"
import ConfirmDialog from "@/components/ConfirmDialog"
import Toast from "@/components/Toast"
import { addActivity } from "@/lib/activity"

interface ClassMemory {
  id: string
  photoUrl: string
  sourceAlbumId: string
  sourceAlbumTitle: string
  caption: string
  createdAt: Timestamp
}

export default function KenanganKelasPage() {
  const [memories, setMemories] = useState<ClassMemory[]>([])
  const [allGalleryItems, setAllGalleryItems] = useState<{
    id: string
    title: string
    date: string
    photos?: string[]
    imageUrl?: string
    createdAt: Timestamp
  }[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<string | "all">("all")
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" | "info" })

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "classMemories"), orderBy("createdAt", "desc")),
      (snap) => {
        setMemories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassMemory)))
      },
    )
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "galleryItems"), orderBy("createdAt", "desc")),
      (snap) => {
        setAllGalleryItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)))
      },
    )
    return unsub
  }, [])

  const getPhotos = (item: { photos?: string[]; imageUrl?: string }): string[] => {
    if (item.photos && item.photos.length > 0) return item.photos
    if (item.imageUrl) return [item.imageUrl]
    return []
  }

  const togglePhoto = (url: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  const addSelectedPhotos = async () => {
    for (const photoUrl of selectedPhotos) {
      const src = allGalleryItems.find((g) => getPhotos(g).includes(photoUrl))
      const ref = await addDoc(collection(db, "classMemories"), {
        photoUrl,
        sourceAlbumId: src?.id || "",
        sourceAlbumTitle: src?.title || "",
        caption: "",
        createdAt: serverTimestamp(),
      })
      addActivity("add", "classMemories", ref.id, src?.title || "Foto kenangan")
    }
    setSelectedPhotos(new Set())
    setShowPicker(false)
    setToast({ open: true, message: `${selectedPhotos.size} foto ditambahkan ke kenangan`, type: "success" })
  }

  const deleteMemory = async (id: string) => {
    const item = memories.find((m) => m.id === id)
    await deleteDoc(doc(db, "classMemories", id))
    setConfirmDelete(null)
    setToast({ open: true, message: "Kenangan berhasil dihapus", type: "success" })
    if (item) addActivity("delete", "classMemories", id, item.sourceAlbumTitle)
  }

  const allPhotos = allGalleryItems.flatMap((g) => {
    const photos = getPhotos(g)
    if (photos.length === 0) return []
    return photos.map((url) => ({ url, albumId: g.id, albumTitle: g.title, albumDate: g.date }))
  })

  const filteredPhotos =
    selectedAlbum === "all" ? allPhotos : allPhotos.filter((p) => p.albumId === selectedAlbum)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">Kenangan Kelas</h2>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
            Kelola foto kenangan kelas. Pilih foto dari Galeri Kenangan.
          </p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-[600] text-[13px] leading-[1.2] tracking-[0.05em]"
        >
          <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
          Tambah dari Galeri
        </button>
      </div>

      <div>
        <h3 className="font-headline text-[20px] leading-[1.4] font-semibold text-primary mb-4">
          Foto Kenangan ({memories.length})
        </h3>
        {memories.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">photo_library</span>
            <p>Belum ada foto kenangan. Klik "Tambah dari Galeri" untuk memilih foto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {memories.map((m) => (
              <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-variant shadow-sm">
                <img className="w-full h-full object-cover" src={m.photoUrl} alt={m.sourceAlbumTitle} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[11px] font-bold truncate">{m.sourceAlbumTitle}</p>
                </div>
                <button
                  onClick={() => setConfirmDelete(m.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-error hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  title="Hapus"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Kenangan"
        message="Apakah kamu yakin ingin menghapus kenangan ini?"
        onConfirm={() => confirmDelete && deleteMemory(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">
                Pilih Foto dari Galeri
              </h3>
              <button onClick={() => { setShowPicker(false); setSelectedPhotos(new Set()) }} className="p-2 hover:bg-surface-container rounded transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedAlbum("all")}
                className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${selectedAlbum === "all" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
              >
                Semua Album
              </button>
              {allGalleryItems.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedAlbum(g.id)}
                  className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${selectedAlbum === g.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                >
                  {g.title}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
              {filteredPhotos.map((p) => (
                <div
                  key={p.url}
                  onClick={() => togglePhoto(p.url)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedPhotos.has(p.url) ? "border-secondary shadow-md shadow-secondary/20 scale-[1.02]" : "border-outline-variant/20 hover:border-secondary/50"}`}
                >
                  <div className="relative w-full h-full">
                    <img className="w-full h-full object-cover" src={p.url} alt="" />
                    {selectedPhotos.has(p.url) && (
                      <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-3xl bg-secondary rounded-full p-1">check_circle</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredPhotos.length === 0 && (
                <p className="col-span-full text-center text-on-surface-variant py-12">
                  Tidak ada foto di album ini.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
              <p className="text-on-surface-variant text-sm">
                {selectedPhotos.size} foto dipilih
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPicker(false); setSelectedPhotos(new Set()) }}
                  className="px-6 py-2 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={addSelectedPhotos}
                  disabled={selectedPhotos.size === 0}
                  className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Tambahkan ke Kenangan ({selectedPhotos.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
