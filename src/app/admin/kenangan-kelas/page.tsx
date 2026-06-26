"use client"

import { useState, useEffect } from "react"
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp, serverTimestamp, query, orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminLayout from "@/components/AdminLayout"
import { CldUploadWidget } from "next-cloudinary"

interface Memory {
  id: string
  title: string
  desc: string
  category: string
  author: string
  date: string
  status: "Published" | "Draft"
  imageUrl: string
  createdAt: Timestamp
}

export default function KenanganKelasPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Memory | null>(null)
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [date, setDate] = useState("")
  const [status, setStatus] = useState<"Published" | "Draft">("Published")

  useEffect(() => {
    const q = query(collection(db, "classMemories"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setMemories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Memory)))
    })
    return unsub
  }, [])

  const resetForm = () => {
    setTitle("")
    setDesc("")
    setCategory("")
    setImageUrl("")
    setDate("")
    setStatus("Published")
    setEditing(null)
    setShowModal(false)
  }

  const openCreate = () => {
    resetForm()
    setShowModal(true)
  }

  function toInputDate(dateStr: string) {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return d.toISOString().split("T")[0]
  }

  function toDisplayDate(dateStr: string) {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  const openEdit = (m: Memory) => {
    setEditing(m)
    setTitle(m.title)
    setDesc(m.desc)
    setCategory(m.category)
    setImageUrl(m.imageUrl)
    setStatus(m.status)
    setDate(toInputDate(m.date))
    setShowModal(true)
  }

  const handleUploadSuccess = (result: any) => {
    if (result?.info?.secure_url) setImageUrl(result.info.secure_url)
  }

  const handleSave = async () => {
    if (!title || !imageUrl) return
    const data = {
      title,
      desc: desc || "—",
      category: category || "Lainnya",
      author: "Admin",
      date: date ? toDisplayDate(date) : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      status,
      imageUrl,
      createdAt: serverTimestamp(),
    }
    if (editing) {
      await updateDoc(doc(db, "classMemories", editing.id), data)
    } else {
      await addDoc(collection(db, "classMemories"), data)
    }
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Hapus memori ini?")) {
      await deleteDoc(doc(db, "classMemories", id))
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">Kenangan Kelas</h2>
          <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">Manajemen arsip foto dan cerita kolektif alumni.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-[600] text-[13px] leading-[1.2] tracking-[0.05em]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Memori
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/10 text-on-surface-variant font-[600] text-[13px] leading-[1.2] tracking-[0.05em] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Judul Memori</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-body text-[16px] leading-[1.6]">
              {memories.map((m) => (
                <tr key={m.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded border border-outline-variant/20 overflow-hidden bg-surface-variant flex-shrink-0">
                        <img className="w-full h-full object-cover" src={m.imageUrl} alt="" />
                      </div>
                      <p className="font-bold text-primary">{m.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{m.category}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{m.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-tight ${m.status === "Published" ? "bg-green-100 text-green-800" : "bg-surface-container-highest text-on-surface-variant"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(m)} className="p-2 hover:bg-secondary/10 text-secondary rounded transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-2 hover:bg-error/10 text-error rounded transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {memories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    Belum ada data kenangan kelas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center text-on-surface-variant text-sm">
          <p>Menampilkan {memories.length} entri</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary mb-6">
              {editing ? "Edit Memori" : "Tambah Memori Baru"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                  placeholder="Nama memori..."
                />
              </div>
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Deskripsi</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none resize-none"
                  rows={3}
                  placeholder="Cerita singkat tentang momen ini..."
                />
              </div>
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Kategori</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                  placeholder="Acara Formal, Keseharian, ..."
                />
              </div>
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Published" | "Draft")}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
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
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Foto</label>
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                  onSuccess={handleUploadSuccess}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="w-full border-2 border-dashed border-outline-variant rounded-lg py-8 px-4 text-center hover:bg-surface-container-low transition-colors group"
                    >
                      {imageUrl ? (
                        <div className="space-y-2">
                          <img src={imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
                          <p className="text-sm text-green-600 font-bold">Upload berhasil!</p>
                        </div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary transition-colors">cloud_upload</span>
                          <p className="text-sm text-on-surface-variant mt-2">Klik untuk upload foto</p>
                        </>
                      )}
                    </button>
                  )}
                </CldUploadWidget>
              </div>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={resetForm} className="px-6 py-2 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!title || !imageUrl}
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
