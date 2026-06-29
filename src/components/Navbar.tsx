"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const links = [
    { href: "/", label: "Home" },
    { href: "/students", label: "Students" },
    { href: "/gallery", label: "Gallery" },
  ]

  return (
    <nav className="w-full top-0 sticky bg-background/80 backdrop-blur-md shadow-sm z-50">
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 max-w-[1200px] mx-auto">
        <Link
          href="/"
          className="font-headline text-[22px] sm:text-[28px] md:text-[32px] leading-[1.3] font-semibold text-primary italic truncate"
        >
          TekajeOneOfficial
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex gap-6 lg:gap-8 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] leading-[1.5] ${
                  isActive(link.href)
                    ? "text-secondary border-b-2 border-secondary font-bold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/login"
            className="bg-primary text-on-primary px-4 sm:px-6 py-2 rounded-lg font-[600] text-[12px] sm:text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all whitespace-nowrap"
          >
            Login
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-primary hover:text-secondary transition-colors"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          >
            <span className="material-symbols-outlined text-[28px]">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-background/95 backdrop-blur-md">
          <div className="flex flex-col px-4 py-4 gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-[16px] leading-[1.6] transition-colors ${
                  isActive(link.href)
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-on-surface-variant hover:bg-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
