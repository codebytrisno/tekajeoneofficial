"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

const navLinks = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/kenangan-kelas", icon: "auto_stories", label: "Kenangan Kelas" },
  { href: "/admin/direktori-siswa", icon: "group", label: "Direktori Siswa" },
  { href: "/admin/galeri-kenangan", icon: "auto_awesome_motion", label: "Galeri Kenangan" },
  { href: "/admin/pengaturan", icon: "settings", label: "Pengaturan" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

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
            <Link href="/" className="hover:text-secondary transition-colors">
              TekajeOne <div>Official</div>
            </Link>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-2 opacity-70">
            Portal Administrasi
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold active-nav-shadow"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="font-body text-[16px] leading-[1.6]">{link.label}</span>
              </Link>
            )
          })}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-error hover:bg-error/10 transition-colors duration-200 px-4 py-3 rounded-lg mt-2"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body text-[16px] leading-[1.6]">Keluar</span>
          </button>
        </nav>
      </aside>
      <main className="ml-64 min-h-screen w-full">
        <header className="flex justify-between items-center w-full px-6 h-16 sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-on-surface-variant/50" placeholder="Cari..." type="text" />
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
          {children}
        </section>
      </main>
    </div>
  )
}
