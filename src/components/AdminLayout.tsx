"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

const navLinks = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/home-cards", icon: "style", label: "Kartu Home" },
  { href: "/admin/kenangan-kelas", icon: "auto_stories", label: "Kenangan Kelas" },
  { href: "/admin/direktori-siswa", icon: "group", label: "Direktori Siswa" },
  { href: "/admin/galeri-kenangan", icon: "auto_awesome_motion", label: "Galeri Kenangan" },
  { href: "/admin/pengaturan", icon: "settings", label: "Pengaturan" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    setSidebarOpen(false) // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname])

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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-container shadow-sm flex flex-col py-2 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}>
        <div className="px-6 mb-6 mt-4 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary leading-none">
              <Link href="/" className="hover:text-secondary transition-colors">
                TekajeOne <div>Official</div>
              </Link>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-2 opacity-70">
              Portal Administrasi
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
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

      <main className="min-h-screen w-full lg:ml-64">
        <header className="flex justify-between items-center w-full px-4 sm:px-6 h-14 sm:h-16 sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 z-40">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-primary hover:text-secondary transition-colors"
              aria-label="Buka menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-[14px] leading-[1.5] focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-on-surface-variant/50" placeholder="Cari..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 border-r border-outline-variant/30 pr-3 sm:pr-6">
              <button className="text-on-surface-variant hover:text-primary transition-all duration-300 active:scale-95">
                <span className="material-symbols-outlined text-[22px] sm:text-[24px]">notifications</span>
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-all duration-300 active:scale-95">
                <span className="material-symbols-outlined text-[22px] sm:text-[24px]">history_edu</span>
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="text-right hidden sm:block">
                <p className="font-[600] text-[12px] sm:text-[13px] leading-[1.2] tracking-[0.05em] text-primary truncate max-w-[120px]">{user.email}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Admin</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm bg-primary/10 flex items-center justify-center text-primary font-bold text-[14px] sm:text-[16px] flex-shrink-0">
                {(user.email?.[0] || "A").toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <section className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 sm:space-y-8 pb-20">
          {children}
        </section>
      </main>
    </div>
  )
}
