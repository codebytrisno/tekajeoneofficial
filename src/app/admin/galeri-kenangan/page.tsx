"use client"

import { useState, useEffect } from "react"
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp, serverTimestamp, query, orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminLayout from "@/components/AdminLayout"
import { CldUploadWidget } from "next-cloudinary"

interface GalleryItem {
  id: string
  title: string
  category: string
  date: string
  coverImageUrl?: string
  photos?: string[]
  imageUrl?: string
  createdAt: Timestamp
}

const categories = ["study-tour", "daily-class", "special-events"]

export default function GaleriKenanganPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("daily-class")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    const q = query(collection(db, "galleryItems"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem)))
    })
    return unsub
  }, [])

  const resetForm = () => {
    setTitle("")
    setCategory("daily-class")
    setCoverImageUrl("")
    setPhotos([])
    setEditing(null)
    setShowModal(false)
  }

  const openCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (item: GalleryItem) => {
    setEditing(item)
    setTitle(item.title)
    setCategory(item.category)
    setCoverImageUrl(item.coverImageUrl || item.imageUrl || "")
    setPhotos(item.photos || (item.imageUrl ? [item.imageUrl] : []))
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!title || !coverImageUrl) return
    const data = {
      title,
      category,
      date: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      coverImageUrl,
      photos,
      createdAt: serverTimestamp(),
    }
    if (editing) {
      await updateDoc(doc(db, "galleryItems", editing.id), data)
    } else {
      await addDoc(collection(db, "galleryItems"), data)
    }
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Hapus album galeri ini?")) {
      await deleteDoc(doc(db, "galleryItems", id))
    }
  }

  const addPhoto = (url: string) => {
    if (!photos.includes(url)) {
      const next = [...photos, url]
      setPhotos(next)
      if (!coverImageUrl) setCoverImageUrl(url)
    }
  }

  const removePhoto = (url: string) => {
    const next = photos.filter((p) => p !== url)
    setPhotos(next)
    if (coverImageUrl === url) {
      setCoverImageUrl(next[0] || "")
    }
  }

  const getPhotoCount = (item: GalleryItem) => {
    if (item.photos) return item.photos.length
    if (item.imageUrl) return 1
    return 0
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">Galeri Kenangan</h2>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">Manajemen album foto galeri kenangan.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-[600] text-[13px] leading-[1.2] tracking-[0.05em]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Album
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/10 text-on-surface-variant font-[600] text-[13px] leading-[1.2] tracking-[0.05em] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Sampul</th>
                <th className="px-6 py-4 font-semibold">Judul</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Foto</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-body text-[16px] leading-[1.6]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded border border-outline-variant/20 overflow-hidden bg-surface-variant">
                      <img className="w-full h-full object-cover" src={item.coverImageUrl || item.imageUrl || ""} alt="" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{item.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-tight bg-secondary/10 text-secondary">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {getPhotoCount(item)} foto
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{item.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)} className="p-2 hover:bg-secondary/10 text-secondary rounded transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-error/10 text-error rounded transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    Belum ada data galeri.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center text-on-surface-variant text-sm">
          <p>Menampilkan {items.length} entri</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary mb-6">
              {editing ? "Edit Album" : "Tambah Album Baru"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Judul Album</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                  placeholder="Judul album..."
                />
              </div>
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Foto-Foto</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                  {photos.map((url, i) => (
                    <div key={url} className="relative group/photo aspect-square rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-variant">
                      <img className="w-full h-full object-cover" src={url} alt={`Foto ${i + 1}`} />
                      <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/40 transition-colors flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCoverImageUrl(url)}
                          className={`p-1 rounded-full transition-all opacity-0 group-hover/photo:opacity-100 ${coverImageUrl === url ? "bg-secondary text-white" : "bg-white/80 text-primary hover:bg-white"}`}
                          title="Jadikan sampul"
                        >
                          <span className="material-symbols-outlined text-[16px]">photo_frame</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhoto(url)}
                          className="p-1 rounded-full bg-white/80 text-error hover:bg-white transition-all opacity-0 group-hover/photo:opacity-100"
                          title="Hapus foto"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                      {coverImageUrl === url && (
                        <span className="absolute top-1 left-1 bg-secondary text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">Sampul</span>
                      )}
                    </div>
                  ))}
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                    onSuccess={(result: any) => {
                      if (result?.info?.secure_url) addPhoto(result.info.secure_url)
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="aspect-square rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                        <span className="text-[10px] font-bold">Tambah Foto</span>
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
                <p className="text-[12px] text-on-surface-variant">
                  {photos.length === 0
                    ? "Belum ada foto. Klik tombol di atas untuk menambah foto."
                    : `Foto sampul adalah foto yang bertanda "Sampul". Klik ikon bingkai untuk mengganti sampul.`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={resetForm} className="px-6 py-2 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors">Batal</button>
              <button
                onClick={handleSave}
                disabled={!title || !coverImageUrl}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editing ? "Update" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
