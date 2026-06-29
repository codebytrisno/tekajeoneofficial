"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/Skeleton"
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, Timestamp, serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminLayout from "@/components/AdminLayout"
import ConfirmDialog from "@/components/ConfirmDialog"
import Toast from "@/components/Toast"
import { addActivity } from "@/lib/activity"
import { optimizeCld } from "@/lib/cloudinary"

interface HomeCard {
  id: string
  photoUrl: string
  label: string
  order: number
  createdAt: Timestamp
}

export default function HomeCardsPage() {
  const [cards, setCards] = useState<HomeCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)
  const [editing, setEditing] = useState<HomeCard | null>(null)
  const [label, setLabel] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" | "info" })

  const [allGalleryItems, setAllGalleryItems] = useState<{ id: string; title: string; photos?: string[]; imageUrl?: string }[]>([])
  const [allStudents, setAllStudents] = useState<{ id: string; name: string; photo: string; photos?: string[] }[]>([])
  const [sourceTab, setSourceTab] = useState<"gallery" | "students">("gallery")
  const [selectedAlbum, setSelectedAlbum] = useState<string | "all">("all")
  const [selectedStudent, setSelectedStudent] = useState<string | "all">("all")
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "homeCards"), orderBy("order", "asc")),
      (snap) => {
        setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() } as HomeCard)))
        setLoading(false)
      },
    )
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "galleryItems"), orderBy("createdAt", "desc")),
      (snap) => setAllGalleryItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any))),
    )
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "students"), orderBy("createdAt", "desc")),
      (snap) => setAllStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any))),
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

  const allPhotos = allGalleryItems.flatMap((g) => {
    const photos = getPhotos(g)
    if (photos.length === 0) return []
    return photos.map((url) => ({ url, albumId: g.id, albumTitle: g.title }))
  })

  const filteredPhotos = selectedAlbum === "all" ? allPhotos : allPhotos.filter((p) => p.albumId === selectedAlbum)
  const filteredStudentPhotos = selectedStudent === "all" ? allStudentPhotos : allStudentPhotos.filter((p) => p.studentId === selectedStudent)

  const togglePhoto = (url: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  const handleAdd = () => {
    setEditing(null)
    setLabel("")
    setSelectedPhotos(new Set())
    setShowPicker(true)
  }

  const confirmAdd = async () => {
    if (selectedPhotos.size === 0 || !label) return
    let order = cards.reduce((max, c) => Math.max(max, c.order), 0)
    for (const url of selectedPhotos) {
      order++
      await addDoc(collection(db, "homeCards"), {
        photoUrl: url,
        label,
        order,
        createdAt: serverTimestamp(),
      })
    }
    addActivity("add", "homeCards", "", label)
    setShowPicker(false)
    setSelectedPhotos(new Set())
    setLabel("")
    setToast({ open: true, message: `${selectedPhotos.size} kartu berhasil ditambahkan`, type: "success" })
  }

  const handleSaveLabel = async (card: HomeCard) => {
    await updateDoc(doc(db, "homeCards", card.id), { label })
    setEditing(null)
    setToast({ open: true, message: "Label berhasil diupdate", type: "success" })
  }

  const handleDelete = async (id: string) => {
    const item = cards.find((c) => c.id === id)
    await deleteDoc(doc(db, "homeCards", id))
    setConfirmDelete(null)
    setToast({ open: true, message: "Kartu berhasil dihapus", type: "success" })
    if (item) addActivity("delete", "homeCards", id, item.label)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const a = cards[index]
    const b = cards[index - 1]
    updateDoc(doc(db, "homeCards", a.id), { order: b.order })
    updateDoc(doc(db, "homeCards", b.id), { order: a.order })
  }

  const moveDown = (index: number) => {
    if (index === cards.length - 1) return
    const a = cards[index]
    const b = cards[index + 1]
    updateDoc(doc(db, "homeCards", a.id), { order: b.order })
    updateDoc(doc(db, "homeCards", b.id), { order: a.order })
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">Kartu Home</h2>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
            Kelola kartu polaroid di halaman utama. Foto dari Galeri Kenangan atau foto siswa.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-[600] text-[13px] leading-[1.2] tracking-[0.05em]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Kartu
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-outline-variant/10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-4 h-4 rounded" />
                </div>
                <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">style</span>
            <p>Belum ada kartu. Klik &ldquo;Tambah Kartu&rdquo; untuk menambah.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {cards.map((card, i) => (
              <div key={card.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low/50 transition-colors group">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed leading-none">
                    <span className="material-symbols-outlined text-[16px]">expand_less</span>
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === cards.length - 1} className="text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed leading-none">
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                </div>
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-variant flex-shrink-0">
                  <img className="w-full h-full object-cover" src={optimizeCld(card.photoUrl, 160)} alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  {editing?.id === card.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleSaveLabel(card)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Simpan">
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1.5 text-error hover:bg-error/10 rounded transition-colors" title="Batal">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <p className="font-bold text-primary truncate">{card.label}</p>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => { setEditing(card); setLabel(card.label) }}
                    className="p-2 hover:bg-secondary/10 text-secondary rounded transition-colors"
                    title="Edit label"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(card.id)}
                    className="p-2 hover:bg-error/10 text-error rounded transition-colors"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="p-4 bg-surface-container-low/30 border-t border-outline-variant/10 text-on-surface-variant text-sm">
          <p>Menampilkan {cards.length} kartu</p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Kartu"
        message="Apakah kamu yakin ingin menghapus kartu ini?"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">
                {editing ? "Edit Kartu" : "Tambah Kartu Baru"}
              </h3>
              <button onClick={() => { setShowPicker(false); setSelectedPhotos(new Set()) }} className="p-2 hover:bg-surface-container rounded transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Label</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                  placeholder="Contoh: 7 Mei 2024"
                />
              </div>

              {photoUrl && (
                <div>
                  <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Foto Terpilih</label>
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-outline-variant/20">
                    <img className="w-full h-full object-cover" src={optimizeCld(photoUrl, 200)} alt="" />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-2">Pilih Foto</label>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => { setSourceTab("gallery"); setSelectedPhotos(new Set()) }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${sourceTab === "gallery" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_library</span>
                    Dari Galeri
                  </button>
                  <button
                    onClick={() => { setSourceTab("students"); setSelectedPhotos(new Set()) }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${sourceTab === "students" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    Dari Siswa
                  </button>
                </div>

                {sourceTab === "gallery" ? (
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <button onClick={() => setSelectedAlbum("all")}
                      className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${selectedAlbum === "all" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                    >Semua Album</button>
                    {allGalleryItems.map((g) => (
                      <button key={g.id} onClick={() => setSelectedAlbum(g.id)}
                        className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${selectedAlbum === g.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                      >{g.title}</button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <button onClick={() => setSelectedStudent("all")}
                      className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${selectedStudent === "all" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                    >Semua Siswa</button>
                    {allStudents.map((s) => (
                      <button key={s.id} onClick={() => setSelectedStudent(s.id)}
                        className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${selectedStudent === s.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                      >{s.name}</button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {(sourceTab === "gallery" ? filteredPhotos : filteredStudentPhotos).map((p) => (
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
                      </div>
                    </div>
                  ))}
                  {(sourceTab === "gallery" ? filteredPhotos : filteredStudentPhotos).length === 0 && (
                    <p className="col-span-full text-center text-on-surface-variant py-12">
                      Tidak ada foto.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
              <p className="text-on-surface-variant text-sm">{selectedPhotos.size} foto dipilih</p>
              <div className="flex gap-3">
                <button onClick={() => { setShowPicker(false); setSelectedPhotos(new Set()) }} className="px-6 py-2 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors">Batal</button>
                <button
                  onClick={confirmAdd}
                  disabled={selectedPhotos.size === 0 || !label}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >Simpan {selectedPhotos.size > 0 ? `(${selectedPhotos.size})` : ""}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
