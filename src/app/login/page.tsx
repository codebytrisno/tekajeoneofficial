"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      router.push("/admin/dashboard")
    } catch {
      setError("Email atau password salah.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f6f0] relative overflow-x-hidden font-body text-on-surface">
      <div className="paper-texture" />
      <style>{`
        .paper-texture::before {
          content: "";
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          opacity: 0.03;
          pointer-events: none;
          background-image: url(https://www.transparenttextures.com/patterns/natural-paper.png);
          z-index: 10;
        }
        .bg-nostalgia {
          background-image: linear-gradient(rgba(249,246,240,0.92), rgba(249,246,240,0.92)),
            url(https://lh3.googleusercontent.com/aida-public/AB6AXuAJwlbyLJjXsDFilkyqK9_z7XuhoDVeOx6hAjf-EOGsRIab5q61s1PclLnhsU3nY5x-efREXWsZ1I3AhQBid22V9ZaOixFcVz3bTFVnI_PXoCaTfC0jGoAsoah2tPhEUB1o3xGv-0orxq0UtGXmYDW_DXnK5L2hPIlqHqzM9GXCvJ-Vb2ZOIN-63W1neL6_MN_0BS7F7hq-MCH1GkuDC5y3rNkR2f8YKsyW5dD4MCJN-ZVJoWDeqQz7XEFrqocXnvzjCd8Q-G5Iny8E);
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        .login-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border: 1px solid #e4e2e2;
          box-shadow: 0 10px 40px -10px rgba(26,46,68,0.08);
        }
        .input-underline {
          border: none;
          border-bottom: 1px solid #74777d;
          background: transparent;
          transition: all 0.3s ease;
        }
        .input-underline:focus {
          border-bottom: 2px solid #735c00;
          box-shadow: none;
          outline: none;
        }
        .btn-hover-lift {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
        }
        .btn-hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(115,92,0,0.2);
        }
      `}</style>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-transparent">
        <div />
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors font-[600] text-[13px] leading-[1.2] tracking-[0.05em] uppercase tracking-widest">HOME</Link>
          <Link href="/gallery" className="text-on-surface-variant hover:text-primary transition-colors font-[600] text-[13px] leading-[1.2] tracking-[0.05em] uppercase tracking-widest">GALLERY</Link>
        </nav>
      </header>
      <main className="flex-grow flex items-center justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 bg-nostalgia">
        <div className="w-full max-w-md login-card rounded-xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
          <div className="text-center mb-10">
            <h1 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary mb-2">
              Login Admin
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="relative">
              <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1 uppercase tracking-tighter" htmlFor="email">
                EMAIL
              </label>
              <div className="relative group">
                <input
                  className="w-full input-underline py-2 pr-10 text-primary placeholder:text-outline-variant focus:placeholder:opacity-0"
                  id="email"
                  type="email"
                  placeholder="admin@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-0 bottom-2 text-outline-variant group-focus-within:text-secondary">
                  person
                </span>
              </div>
            </div>
            <div className="relative">
              <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1 uppercase tracking-tighter" htmlFor="password">
                PASSWORD
              </label>
              <div className="relative group">
                <input
                  className="w-full input-underline py-2 pr-10 text-primary placeholder:text-outline-variant focus:placeholder:opacity-0"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-0 bottom-2 text-outline-variant group-focus-within:text-secondary">
                  lock
                </span>
              </div>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-secondary text-[#241a00] py-4 rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] uppercase tracking-widest btn-hover-lift flex items-center justify-center gap-2"
              >
                MASUK KE ARSIP
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
          <div className="mt-10 pt-6 border-t border-surface-variant text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-on-surface-variant hover:text-primary transition-colors group"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">
                keyboard_backspace
              </span>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
      <footer className="w-full max-w-7xl mx-auto px-8 py-10 flex justify-center text-on-surface-variant">
        <p className="font-body text-[14px] leading-[1.5]">&copy; 2026 TekajeOneOfficial</p>
      </footer>
      <ParallaxEffect />
    </div>
  )
}

function ParallaxEffect() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      const card = document.querySelector<HTMLElement>(".login-card")
      if (card) {
        card.style.transform = `translate(${(x - 0.5) * 10}px, ${(y - 0.5) * 10}px)`
      }
    }
    document.addEventListener("mousemove", handler)
    return () => document.removeEventListener("mousemove", handler)
  }, [])
  return null
}
