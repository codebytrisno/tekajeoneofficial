"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth"
import { Skeleton, SkeletonTableRow } from "@/components/Skeleton"

interface Activity {
  id: string
  type: "add" | "delete"
  collection: string
  itemId: string
  itemTitle: string
  createdAt: Timestamp
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [totalKenangan, setTotalKenangan] = useState<number | null>(null)
  const [totalSiswa, setTotalSiswa] = useState<number | null>(null)
  const [totalGaleri, setTotalGaleri] = useState<number | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classMemories"), (snap) => {
      setTotalKenangan(snap.size)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), (snap) => {
      setTotalSiswa(snap.size)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "galleryItems"), (snap) => {
      setTotalGaleri(snap.size)
    })
    return unsub
  }, [])

  useEffect(() => {
    const q = query(collection(db, "activityLog"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Activity)))
      setDataLoading(false)
    })
    return unsub
  }, [])

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
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container shadow-sm flex flex-col py-2 z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
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
      </aside>
      <main className="lg:ml-64 min-h-screen w-full">
        <header className="flex justify-between items-center w-full px-4 sm:px-6 h-14 sm:h-16 sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 z-30">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 -ml-1 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div className="relative w-full hidden sm:block max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-[14px] sm:text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-on-surface-variant/50" placeholder="Cari data..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 border-r border-outline-variant/30 pr-3 sm:pr-6">
              <button className="text-on-surface-variant hover:text-primary transition-all duration-300 active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-all duration-300 active:scale-95">
                <span className="material-symbols-outlined">history_edu</span>
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary truncate max-w-[120px]">{user.email}</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Admin</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm bg-primary/10 flex items-center justify-center text-primary font-bold text-[14px] sm:text-[16px]">
                {(user.email?.[0] || "A").toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <section className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 sm:space-y-8 pb-20">
          <div className="pt-8">
            <h2 className="font-headline text-[22px] sm:text-[28px] lg:text-[32px] leading-[1.3] font-semibold text-primary">
              Selamat Datang di Dashboard, Admin.
            </h2>
            <p className="font-body text-[15px] sm:text-[18px] leading-[1.6] text-on-surface-variant mt-2 max-w-2xl italic opacity-80">
              &ldquo;Setiap arsip yang Anda simpan hari ini adalah jembatan nostalgia bagi mereka di masa depan.&rdquo;
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-surface-container-low p-4 sm:p-6 rounded-xl border border-outline-variant/20 card-texture hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="font-[600] text-[12px] sm:text-[13px] leading-[1.2] tracking-[0.05em] text-on-surface-variant">Kenangan Kelas</p>
                  <h3 className="font-headline text-[28px] sm:text-[36px] lg:text-[48px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mt-2 group-hover:scale-105 transition-transform origin-left">{totalKenangan ?? <Skeleton className="h-8 sm:h-12 w-12 sm:w-16 inline-block align-middle" />}</h3>
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px] sm:text-[32px] opacity-40 flex-shrink-0">auto_stories</span>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[11px] sm:text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">photo</span>
                <span>Foto kenangan</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 sm:p-6 rounded-xl border border-outline-variant/20 card-texture hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="font-[600] text-[12px] sm:text-[13px] leading-[1.2] tracking-[0.05em] text-on-surface-variant">Total Siswa</p>
                  <h3 className="font-headline text-[28px] sm:text-[36px] lg:text-[48px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mt-2 group-hover:scale-105 transition-transform origin-left">{totalSiswa ?? <Skeleton className="h-8 sm:h-12 w-12 sm:w-16 inline-block align-middle" />}</h3>
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px] sm:text-[32px] opacity-40 flex-shrink-0">group</span>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[11px] sm:text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">badge</span>
                <span>Data siswa</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 sm:p-6 rounded-xl border border-outline-variant/20 card-texture hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="font-[600] text-[12px] sm:text-[13px] leading-[1.2] tracking-[0.05em] text-on-surface-variant">Album Galeri</p>
                  <h3 className="font-headline text-[28px] sm:text-[36px] lg:text-[48px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mt-2 group-hover:scale-105 transition-transform origin-left">{totalGaleri ?? <Skeleton className="h-8 sm:h-12 w-12 sm:w-16 inline-block align-middle" />}</h3>
                </div>
                <span className="material-symbols-outlined text-secondary text-[24px] sm:text-[32px] opacity-40 flex-shrink-0">photo_library</span>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[11px] sm:text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">cloud_upload</span>
                <span>Upload via Cloudinary</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-outline-variant/20 bg-surface-container-low/50">
              <h4 className="font-headline text-[20px] sm:text-[24px] leading-[1.4] font-semibold text-primary">Aktivitas Terbaru</h4>
              <p className="font-body text-[14px] sm:text-[16px] leading-[1.6] text-on-surface-variant">Riwayat penambahan dan penghapusan data.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-outline-variant/10 text-on-surface-variant font-[600] text-[13px] leading-[1.2] tracking-[0.05em] uppercase tracking-wider">
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">Tipe</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">Halaman</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">Item</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-body text-[16px] leading-[1.6]">
                  {dataLoading && (
                    <>
                      <SkeletonTableRow cols={4} />
                      <SkeletonTableRow cols={4} />
                      <SkeletonTableRow cols={4} />
                      <SkeletonTableRow cols={4} />
                    </>
                  )}
                  {activities.map((a) => {
                    const isAdd = a.type === "add"
                    const colLabel =
                      a.collection === "classMemories" ? "Kenangan Kelas"
                      : a.collection === "students" ? "Siswa"
                      : "Galeri"
                    return (
                      <tr key={a.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold rounded-full uppercase tracking-tight ${isAdd ? "bg-green-100 text-green-800" : "bg-error/10 text-error"}`}>
                            {isAdd ? "Tambah" : "Hapus"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-[13px] sm:text-[16px] text-on-surface-variant">{colLabel}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-primary truncate max-w-[120px] sm:max-w-[200px]">{a.itemTitle}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-[12px] sm:text-sm text-on-surface-variant">
                          {a.createdAt?.toDate?.()?.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) || "-"}
                        </td>
                      </tr>
                    )
                  })}
                  {!dataLoading && activities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-on-surface-variant">
                        Belum ada aktivitas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
