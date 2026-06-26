"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="w-full top-0 sticky bg-background/80 backdrop-blur-md shadow-sm z-50">
      <div className="flex justify-between items-center px-6 py-4 max-w-[1200px] mx-auto">
        <Link
          href="/"
          className="font-headline text-[32px] leading-[1.3] font-semibold text-primary italic"
        >
          TekajeOneOfficial
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link
            href="/"
            className={
              isActive("/")
                ? "text-secondary border-b-2 border-secondary font-bold transition-all duration-300"
                : "text-on-surface-variant hover:text-primary transition-all duration-300"
            }
          >
            Home
          </Link>
          <Link
            href="/students"
            className={
              isActive("/students")
                ? "text-secondary border-b-2 border-secondary font-bold transition-all duration-300"
                : "text-on-surface-variant hover:text-primary transition-all duration-300"
            }
          >
            Students
          </Link>
          <Link
            href="/gallery"
            className={
              isActive("/gallery")
                ? "text-secondary border-b-2 border-secondary font-bold transition-all duration-300"
                : "text-on-surface-variant hover:text-primary transition-all duration-300"
            }
          >
            Gallery
          </Link>
        </div>
        <Link
          href="/login"
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all inline-block"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}
