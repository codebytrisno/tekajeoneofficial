import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full mt-20 bg-surface-container border-t border-outline-variant">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 px-6 py-10 max-w-[1200px] mx-auto text-on-surface-variant">
        <p className="font-body text-[16px] leading-[1.6]">
          &copy; 2026 TekajeOneOfficial. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-primary transition-colors text-[14px]">
            Home
          </Link>
          <Link href="/gallery" className="hover:text-primary transition-colors text-[14px]">
            Gallery
          </Link>
          <Link href="/students" className="hover:text-primary transition-colors text-[14px]">
            Students
          </Link>
        </div>
      </div>
    </footer>
  )
}
