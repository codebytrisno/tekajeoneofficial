"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { CldUploadWidget } from "next-cloudinary"
import { useAuth } from "@/lib/auth"

const initialMemories = [
  {
    title: "Malam Perpisahan 2026",
    subtitle: "32 Foto Terlampir",
    category: "Acara Formal",
    author: "Andi Dermawan",
    initials: "AD",
    date: "15 Okt 2026",
    status: "Published" as const,
    statusClass: "bg-green-100 text-green-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9fTGOddoTUuqIK1TwlqdiW-jQw1CoIe7KRHfpTTUaFwqFFp5qOlhFGrtwZseLEu4ihbFm7ewdoA3NoGEYqJrRKRwe8QV5TTjVi8ThIBbzxvSxHX_YcRtP5LSWyzKqIrUCoxaXGCC9runKDd_6eATjnXUmNXULg8vYPyAw_Bh_md9Re3L6B5TmNThC-fT4gJmDlJwkRjbQnhYkkglNgpdtPcTSk53x650ibCy7WiVZ2AlFETzhu4SxovjVzFyw6q3bWvEwxsmWBrcW",
  },
  {
    title: "Kantin & Gelak Tawa",
    subtitle: "Cerita & 5 Foto",
    category: "Keseharian",
    author: "Budi Santoso",
    initials: "BS",
    date: "12 Okt 2026",
    status: "Draft" as const,
    statusClass: "bg-surface-container-highest text-on-surface-variant",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhi1daFGswyulCi1ex2CamvyPe44GtzlYyACmIjGcDXI0h0wAtHqGva6dquHJPH5AHtMQHXy2AdDns0lbBfmVtKt8cROCvOic_NoPMfjqDI2lXWrG2aXDE-bKnC_L26RAlo5eaK04Xu1cnGVm9JYjAlLeelPVKcNhutUCL6koeHUN8orF7dy4oRngJnq7g6OcQz5Juzi4tIeaSKCm1v-5svRZGvYQmgXF-zq5OfqZwp9zbNWCJCeau17rJrNuU_Fgm1pvYGXUPTRXC",
  },
  {
    title: "Pojok Lapangan Basket",
    subtitle: "Koleksi Seni",
    category: "Galeri Seni",
    author: "Citra Rahayu",
    initials: "CR",
    date: "08 Okt 2026",
    status: "Published" as const,
    statusClass: "bg-green-100 text-green-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDokQmQX0MuuhtFg6k7rcWk-YmJZENAeQpxV-k1I1c-jNTcAhDfE9WX-yN4BUU6uvxFj7OghXxEZKQTdFCVz_UyTody8eJ1d8S3u1Py41Lt-QjjQPteNao_JR1_ttLWEIkJEGwt4tIdw_HfRY3Jn11-ghTJpHvD6peDBUEILApob2oP7q9s8N1-eBhgKAjlFVVu49Uhk3L6P4fqH7korBLROa-EIUhmycPoRdRhO7VfWnuezp7QYiR5lVNm-Mj-nwsntNdANZM3R2ld",
  },
]

interface Memory {
  title: string
  subtitle: string
  category: string
  author: string
  initials: string
  date: string
  status: "Published" | "Draft"
  statusClass: string
  img: string
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [showModal, setShowModal] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleUploadSuccess = useCallback((result: any) => {
    if (result?.info?.secure_url) {
      setUploadedUrl(result.info.secure_url)
    }
  }, [])

  const addMemory = () => {
    if (!newTitle || !uploadedUrl) return
    const initial = user?.email?.[0]?.toUpperCase() || "A"
    setMemories([
      {
        title: newTitle,
        subtitle: "1 Foto",
        category: newCategory || "Lainnya",
        author: user?.email || "Admin",
        initials: initial,
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        status: "Published",
        statusClass: "bg-green-100 text-green-800",
        img: uploadedUrl,
      },
      ...memories,
    ])
    setShowModal(false)
    setUploadedUrl("")
    setNewTitle("")
    setNewCategory("")
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-body text-on-surface-variant">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface antialiased overflow-x-hidden">
      <style>{`
        body { background-color: #fbf9f8; background-image: url('https://www.transparenttextures.com/patterns/natural-paper.png'); background-blend-mode: multiply; font-family: 'Plus Jakarta Sans', sans-serif; }
        .serif { font-family: 'Libre Caslon Text', serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f5f3f3; }
        ::-webkit-scrollbar-thumb { background: #c4c6cd; border-radius: 10px; }
      `}</style>
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container shadow-sm flex flex-col py-2 z-50">
        <div className="px-6 mb-10 mt-4">
          <h1 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary leading-none">
            <a href="/" className="hover:text-secondary transition-colors">
              TekajeOne <div>Official</div>
            </a>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-2 opacity-70">
            Portal Administrasi
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
          <a className="flex items-center gap-3 bg-primary-container text-on-primary-container font-bold rounded-lg px-4 py-3 active-nav-shadow transition-transform active:scale-[0.98]" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body text-[16px] leading-[1.6]">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 px-4 py-3 rounded-lg" href="/admin/kenangan-kelas">
            <span className="material-symbols-outlined">auto_stories</span>
            <span className="font-body text-[16px] leading-[1.6]">Kenangan Kelas</span>
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 px-4 py-3 rounded-lg" href="/admin/direktori-siswa">
            <span className="material-symbols-outlined">group</span>
            <span className="font-body text-[16px] leading-[1.6]">Direktori Siswa</span>
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 px-4 py-3 rounded-lg" href="/admin/galeri-kenangan">
            <span className="material-symbols-outlined">auto_awesome_motion</span>
            <span className="font-body text-[16px] leading-[1.6]">Galeri Kenangan</span>
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 px-4 py-3 rounded-lg mt-auto" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body text-[16px] leading-[1.6]">Pengaturan</span>
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-error hover:bg-error/10 transition-colors duration-200 px-4 py-3 rounded-lg mt-2"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body text-[16px] leading-[1.6]">Keluar</span>
          </button>
        </nav>
        <div className="px-4 mt-8">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-[600] text-[13px] leading-[1.2] tracking-[0.05em] group"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Tambah Memori Baru</span>
          </button>
        </div>
      </aside>
      <main className="ml-64 min-h-screen w-full">
        <header className="flex justify-between items-center w-full px-6 h-16 sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-on-surface-variant/50" placeholder="Cari kenangan, siswa, atau data alumni..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-outline-variant/30 pr-6">
              <button className="text-on-surface-variant hover:text-primary transition-all duration-300 active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-all duration-300 active:scale-95">
                <span className="material-symbols-outlined">history_edu</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary leading-none">{user.email}</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(user.email?.[0] || "A").toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <section className="p-6 max-w-[1200px] mx-auto space-y-8 pb-20">
          <div className="pt-8">
            <h2 className="font-headline text-[32px] leading-[1.3] font-semibold text-primary">
              Selamat Datang di Dashboard TKJOneOfficial, Admin.
            </h2>
            <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mt-2 max-w-2xl italic opacity-80">
              &ldquo;Setiap arsip yang Anda simpan hari ini adalah jembatan nostalgia bagi mereka di masa depan.&rdquo;
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 card-texture hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-on-surface-variant">Total Memories</p>
                  <h3 className="font-headline text-[48px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mt-2 group-hover:scale-105 transition-transform origin-left">{memories.length}</h3>
                </div>
                <span className="material-symbols-outlined text-secondary text-[32px] opacity-40">auto_stories</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-green-700 font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+{memories.filter(m => m.status === "Published").length} publik</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 card-texture hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-on-surface-variant">Gallery Uploads</p>
                  <h3 className="font-headline text-[48px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mt-2 group-hover:scale-105 transition-transform origin-left">{memories.length}</h3>
                </div>
                <span className="material-symbols-outlined text-secondary text-[32px] opacity-40">photo_library</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                <span>Upload via Cloudinary</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
              <div>
                <h4 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary">Daftar Kenangan Kelas</h4>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">Manajemen arsip foto dan cerita kolektif alumni.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-outline-variant/10 text-on-surface-variant font-[600] text-[13px] leading-[1.2] tracking-[0.05em] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Judul Memori</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Pengirim</th>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-body text-[16px] leading-[1.6]">
                  {memories.map((m, i) => (
                    <tr
                      key={i}
                      className="hover:bg-surface-container-low/50 transition-colors group"
                      style={{ transform: hoveredRow === i ? "translateX(8px)" : "translateX(0)", transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded border border-outline-variant/20 overflow-hidden bg-surface-variant flex-shrink-0">
                            <img className="w-full h-full object-cover grayscale-[0.3]" src={m.img} alt="" />
                          </div>
                          <div>
                            <p className="font-bold text-primary">{m.title}</p>
                            <p className="text-sm text-on-surface-variant/70 italic">{m.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{m.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{m.initials}</div>
                          <span>{m.author}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{m.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-tight ${m.statusClass}`}>{m.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-secondary/10 text-secondary rounded transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button className="p-2 hover:bg-error/10 text-error rounded transition-colors" title="Delete">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center text-on-surface-variant text-sm">
              <p>Menampilkan 1-{memories.length} dari {memories.length} entri</p>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-surface-variant rounded disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="px-3 py-1 bg-primary text-on-primary font-bold rounded">1</span>
                <button className="p-1 hover:bg-surface-variant rounded">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary mb-6">Tambah Memori Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Judul</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                  placeholder="Nama memori..."
                />
              </div>
              <div>
                <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Kategori</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                  placeholder="Olahraga, Akademik, Festival..."
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
                      {uploadedUrl ? (
                        <div className="space-y-2">
                          <img src={uploadedUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
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
              <button
                onClick={() => { setShowModal(false); setUploadedUrl(""); setNewTitle(""); setNewCategory("") }}
                className="px-6 py-2 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                onClick={addMemory}
                disabled={!newTitle || !uploadedUrl}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
