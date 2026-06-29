"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/Skeleton"
import {
  collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, Timestamp, serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminLayout from "@/components/AdminLayout"
import ConfirmDialog from "@/components/ConfirmDialog"
import Toast from "@/components/Toast"
import { addActivity } from "@/lib/activity"
import { optimizeCld } from "@/lib/cloudinary"

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
  const [loading, setLoading] = useState(true)
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
  const [allStudents, setAllStudents] = useState<{ id: string; name: string; photo: string; photos?: string[] }[]>([])
  const [sourceTab, setSourceTab] = useState<"gallery" | "students">("gallery")
  const [selectedStudent, setSelectedStudent] = useState<string | "all">("all")

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "classMemories"), orderBy("createdAt", "desc")),
      (snap) => {
        setMemories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassMemory)))
        setLoading(false)
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

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "students"), orderBy("createdAt", "desc")),
      (snap) => {
        setAllStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; name: string; photo: string; photos?: string[] })))
      },
    )
    return unsub
  }, [])

  const getPhotos = (item: { photos?: string[]; imageUrl?: string }): string[] => {
    if (item.photos && item.photos.length > 0) return item.photos
    if (item.imageUrl) return [item.imageUrl]
    return []
  }

  const allStudentPhotos = allStudents.flatMap((s) => {
    const seen = new Set<string>()
    const urls: string[] = []
    if (s.photo && !seen.has(s.photo)) { seen.add(s.photo); urls.push(s.photo) }
    if (s.photos) s.photos.forEach((u) => { if (!seen.has(u)) { seen.add(u); urls.push(u) } })
    if (urls.length === 0) return []
    return urls.map((url) => ({ url, studentId: s.id, studentName: s.name }))
  })

  const filteredStudentPhotos =
    selectedStudent === "all" ? allStudentPhotos : allStudentPhotos.filter((p) => p.studentId === selectedStudent)

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
      let srcTitle = ""
      let srcId = ""
      if (sourceTab === "gallery") {
        const src = allGalleryItems.find((g) => getPhotos(g).includes(photoUrl))
        srcTitle = src?.title || ""
        srcId = src?.id || ""
      } else {
        const src = allStudents.find((s) => (s.photo === photoUrl || (s.photos || []).includes(photoUrl)))
        srcTitle = src?.name || ""
        srcId = src?.id || ""
      }
      const ref = await addDoc(collection(db, "classMemories"), {
        photoUrl,
        sourceAlbumId: srcId,
        sourceAlbumTitle: srcTitle,
        caption: "",
        createdAt: serverTimestamp(),
      })
      addActivity("add", "classMemories", ref.id, srcTitle || "Foto kenangan")
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-headline text-[20px] sm:text-[24px] leading-[1.4] font-semibold text-primary">Kenangan Kelas</h2>
          <p className="font-body text-[14px] sm:text-[16px] leading-[1.6] text-on-surface-variant">
            Kelola foto kenangan kelas. Pilih foto dari Galeri Kenangan atau dari foto siswa.
          </p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
              className="flex items-center gap-2 bg-secondary text-on-secondary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:shadow-lg transition-all font-[600] text-[12px] sm:text-[13px] leading-[1.2] tracking-[0.05em] self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add_photo_alternate</span>
              Tambah Foto
        </button>
      </div>

      <div>
        <h3 className="font-headline text-[20px] leading-[1.4] font-semibold text-primary mb-4">
          Foto Kenangan ({memories.length})
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <Skeleton className="w-full h-full rounded-none" />
              </div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">photo_library</span>
            <p>Belum ada foto kenangan. Klik &ldquo;Tambah Foto&rdquo; untuk memilih foto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {memories.map((m) => (
              <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-variant shadow-sm">
                <img className="w-full h-full object-cover" src={optimizeCld(m.photoUrl, 400)} alt={m.sourceAlbumTitle} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[11px] font-bold truncate">{m.sourceAlbumTitle}</p>
                </div>
                <button
                  onClick={() => setConfirmDelete(m.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-error hover:bg-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
          <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="font-headline text-[20px] sm:text-[24px] leading-[1.4] font-semibold text-primary">
                Pilih Foto
              </h3>
              <button onClick={() => { setShowPicker(false); setSelectedPhotos(new Set()); setSourceTab("gallery") }} className="p-1 sm:p-2 hover:bg-surface-container rounded transition-colors">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">close</span>
              </button>
            </div>

            <div className="flex gap-2 sm:gap-3 mb-6 flex-wrap">
              <button
                onClick={() => { setSourceTab("gallery"); setSelectedPhotos(new Set()); setSelectedAlbum("all") }}
                className={`flex items-center gap-1 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg font-[600] text-[11px] sm:text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${sourceTab === "gallery" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
              >
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">photo_library</span>
                Dari Galeri
              </button>
              <button
                onClick={() => { setSourceTab("students"); setSelectedPhotos(new Set()); setSelectedStudent("all") }}
                className={`flex items-center gap-1 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg font-[600] text-[11px] sm:text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${sourceTab === "students" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
              >
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">group</span>
                Dari Siswa
              </button>
            </div>

            {sourceTab === "gallery" ? (
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
            ) : (
              <div className="flex gap-3 mb-6 flex-wrap">
                <button
                  onClick={() => setSelectedStudent("all")}
                  className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${selectedStudent === "all" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                >
                  Semua Siswa
                </button>
                {allStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s.id)}
                    className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${selectedStudent === s.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-6">
              {(sourceTab === "gallery" ? filteredPhotos : filteredStudentPhotos).map((p, pi) => (
                <div
                  key={p.url}
                  onClick={() => togglePhoto(p.url)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedPhotos.has(p.url) ? "border-secondary shadow-md shadow-secondary/20 scale-[1.02]" : "border-outline-variant/20 hover:border-secondary/50"}`}
                >
                  <div className="relative w-full h-full">
                    <img className="w-full h-full object-cover" src={optimizeCld(p.url, 200)} alt="" />
                    {selectedPhotos.has(p.url) && (
                      <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-3xl bg-secondary rounded-full p-1">check_circle</span>
                      </div>
                    )}
                    {sourceTab === "students" && !selectedPhotos.has(p.url) && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <p className="text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded truncate text-center">
                          {(p as { studentName: string }).studentName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(sourceTab === "gallery" ? filteredPhotos : filteredStudentPhotos).length === 0 && (
                <p className="col-span-full text-center text-on-surface-variant py-12">
                  {sourceTab === "gallery" ? "Tidak ada foto di album ini." : "Tidak ada foto siswa."}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-outline-variant/20 pt-4 gap-3">
              <p className="text-on-surface-variant text-[13px] sm:text-sm text-center sm:text-left">
                {selectedPhotos.size} foto dipilih
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => { setShowPicker(false); setSelectedPhotos(new Set()); setSourceTab("gallery") }}
                  className="px-4 sm:px-6 py-2 border border-outline-variant rounded-lg font-[600] text-[12px] sm:text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={addSelectedPhotos}
                  disabled={selectedPhotos.size === 0}
                  className="px-4 sm:px-6 py-2 bg-secondary text-on-secondary rounded-lg font-[600] text-[12px] sm:text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
