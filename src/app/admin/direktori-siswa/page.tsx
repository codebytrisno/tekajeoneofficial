"use client"

import { useState, useEffect } from "react"
import { Skeleton, SkeletonTableRow } from "@/components/Skeleton"
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp, serverTimestamp, query, orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminLayout from "@/components/AdminLayout"
import { CldUploadWidget } from "next-cloudinary"
import ConfirmDialog from "@/components/ConfirmDialog"
import Toast from "@/components/Toast"
import { addActivity } from "@/lib/activity"
import { optimizeCld } from "@/lib/cloudinary"

interface Student {
  id: string
  name: string
  quote: string
  photo: string
  date?: string
  photos?: string[]
  createdAt: Timestamp
}

export default function DirektoriSiswaPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [allGalleryItems, setAllGalleryItems] = useState<{ id: string; title?: string; photos?: string[]; imageUrl?: string }[]>([])
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const [pickerAlbum, setPickerAlbum] = useState<string | "all">("all")
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [name, setName] = useState("")
  const [quote, setQuote] = useState("")
  const [photo, setPhoto] = useState("")
  const [date, setDate] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" | "info" })

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)))
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const q = query(collection(db, "galleryItems"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setAllGalleryItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; title?: string; photos?: string[]; imageUrl?: string })))
    })
    return unsub
  }, [])

  const pickerAllPhotos = allGalleryItems.flatMap((g) => g.photos || (g.imageUrl ? [g.imageUrl] : []))
  const pickerFiltered = pickerAlbum === "all" ? pickerAllPhotos : allGalleryItems.find((g) => g.id === pickerAlbum)?.photos || []

  function toInputDate(dateStr?: string) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return d.toISOString().split("T")[0]
  }

  function toDisplayDate(dateStr: string) {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  const resetForm = () => {
    setName("")
    setQuote("")
    setPhoto("")
    setDate("")
    setPhotos([])
    setEditing(null)
    setShowModal(false)
  }

  const openCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (s: Student) => {
    setEditing(s)
    setName(s.name)
    setQuote(s.quote)
    setPhoto(s.photo)
    setDate(toInputDate(s.date))
    setPhotos(s.photos || [])
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!name || !photo) return
    const data = {
      name,
      quote: quote || "—",
      photo,
      date: date ? toDisplayDate(date) : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      photos,
      createdAt: serverTimestamp(),
    }
    if (editing) {
      await updateDoc(doc(db, "students", editing.id), data)
      addActivity("add", "students", editing.id, name)
    } else {
      const ref = await addDoc(collection(db, "students"), data)
      addActivity("add", "students", ref.id, name)
    }
    resetForm()
    setToast({ open: true, message: editing ? "Siswa berhasil diupdate" : "Siswa berhasil ditambahkan", type: "success" })
  }

  const handleDelete = async (id: string) => {
    const item = students.find((s) => s.id === id)
    await deleteDoc(doc(db, "students", id))
    setConfirmDelete(null)
    setToast({ open: true, message: "Siswa berhasil dihapus", type: "success" })
    if (item) addActivity("delete", "students", id, item.name)
  }

  const addPhoto = (url: string) => {
    setPhotos((prev) => {
      if (prev.includes(url)) return prev
      return [...prev, url]
    })
  }

  const removePhoto = (url: string) => {
    setPhotos(photos.filter((p) => p !== url))
    if (photo === url) {
      setPhoto(photos.find((p) => p !== url) || "")
    }
  }

  const getPhotoCount = (s: Student) => {
    if (s.photos) return s.photos.length
    return 0
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">Direktori Siswa</h2>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">Manajemen data siswa dan alumni.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-[600] text-[13px] leading-[1.2] tracking-[0.05em]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Siswa
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/10 text-on-surface-variant font-[600] text-[13px] leading-[1.2] tracking-[0.05em] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Foto</th>
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">Quote</th>
                <th className="px-6 py-4 font-semibold">Galeri</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-body text-[16px] leading-[1.6]">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-full border border-outline-variant/20 overflow-hidden bg-surface-variant">
                      <img className="w-full h-full object-cover" src={optimizeCld(s.photo, 128)} alt="" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant italic max-w-xs truncate">{s.quote}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{getPhotoCount(s)} foto</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)} className="p-2 hover:bg-secondary/10 text-secondary rounded transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => setConfirmDelete(s.id)} className="p-2 hover:bg-error/10 text-error rounded transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    Belum ada data siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center text-on-surface-variant text-sm">
          <p>Menampilkan {students.length} entri</p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Siswa"
        message="Apakah kamu yakin ingin menghapus siswa ini?"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary mb-6">
              {editing ? "Edit Siswa" : "Tambah Siswa Baru"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Nama</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                  placeholder="Nama lengkap..."
                />
              </div>
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Quote</label>
                <input
                  type="text"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                  placeholder='"Motto hidup..."'
                />
              </div>
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                />
              </div>
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Foto Profil</label>
                <div className="flex gap-3">
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                    onSuccess={(result: any) => {
                      if (result?.info?.secure_url) setPhoto(result.info.secure_url)
                    }}
                  >
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="flex-1 border-2 border-dashed border-outline-variant rounded-lg py-6 px-4 text-center hover:bg-surface-container-low transition-colors group">
                        {photo ? (
                          <div className="space-y-2">
                            <img src={optimizeCld(photo, 200)} alt="Preview" className="w-20 h-20 object-cover rounded-full mx-auto" />
                            <p className="text-sm text-green-600 font-bold">Upload berhasil!</p>
                          </div>
                        ) : (
                          <><span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary transition-colors">cloud_upload</span><p className="text-sm text-on-surface-variant mt-2">Upload foto</p></>
                        )}
                      </button>
                    )}
                  </CldUploadWidget>
                  <button
                    type="button"
                    onClick={() => setShowPhotoPicker(true)}
                    className="flex-1 border-2 border-dashed border-outline-variant rounded-lg py-6 px-4 text-center hover:bg-surface-container-low transition-colors group"
                  >
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary transition-colors">photo_library</span>
                    <p className="text-sm text-on-surface-variant mt-2">Pilih dari Galeri</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Galeri Foto</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                  {photos.map((url, i) => (
                    <div key={url} className="relative group/photo aspect-square rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-variant">
                      <img className="w-full h-full object-cover" src={optimizeCld(url, 200)} alt={`Foto ${i + 1}`} />
                      <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/40 transition-colors flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removePhoto(url)}
                          className="p-1 rounded-full bg-white/80 text-error hover:bg-white transition-all opacity-0 group-hover/photo:opacity-100"
                          title="Hapus foto"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <CldUploadWidget
                    options={{ multiple: true }}
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
                        <span className="text-[10px] font-bold">Tambah Foto (Banyak)</span>
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
                <p className="text-[12px] text-on-surface-variant">
                  {photos.length === 0 ? "Belum ada foto galeri. Klik tombol di atas untuk menambah foto." : `${photos.length} foto dalam galeri`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={resetForm} className="px-6 py-2 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors">Batal</button>
              <button
                onClick={handleSave}
                disabled={!name || !photo}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                    {editing ? "Update" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          )}

      {showPhotoPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">
                Pilih Foto dari Galeri
              </h3>
              <button onClick={() => setShowPhotoPicker(false)} className="p-2 hover:bg-surface-container rounded transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                onClick={() => setPickerAlbum("all")}
                className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${pickerAlbum === "all" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
              >
                Semua Album
              </button>
              {allGalleryItems.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setPickerAlbum(g.id)}
                  className={`px-4 py-2 rounded-lg font-[600] text-[12px] leading-[1.2] tracking-[0.05em] transition-colors ${pickerAlbum === g.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
                >
                  {g.title}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
              {pickerFiltered.map((url) => (
                <div
                  key={url}
                  onClick={() => { setPhoto(url); setShowPhotoPicker(false) }}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-outline-variant/20 cursor-pointer hover:border-secondary/50 transition-all"
                >
                  <img className="w-full h-full object-cover" src={optimizeCld(url, 200)} alt="" />
                </div>
              ))}
              {pickerFiltered.length === 0 && (
                <p className="col-span-full text-center text-on-surface-variant py-12">
                  Tidak ada foto di album ini.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
