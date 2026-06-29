"use client"

import { useState, useEffect, useMemo } from "react"
import { Skeleton, SkeletonCard } from "@/components/Skeleton"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Navbar from "@/components/Navbar"
import { optimizeCld } from "@/lib/cloudinary"

interface Student {
  id: string
  name: string
  quote: string
  photo: string
  photos?: string[]
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Student | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)))
      setLoading(false)
    })
    return unsub
  }, [])

  const filtered = useMemo(() => {
    const f = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.quote.toLowerCase().includes(search.toLowerCase())
    )
    return [...f].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [students, search, sortDir])

  const getPhotos = (s: Student): string[] => s.photos || []

  return (
    <>
      <Navbar />
      <div className="fixed inset-0 paper-texture opacity-5 z-50 pointer-events-none" />
      <main className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="font-headline text-[48px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mb-4">
            Direktori Siswa
          </h1>
          <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant">
            Menelusuri jejak perjalanan bersama kita. Kumpulan wajah yang mendefinisikan generasi kita.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="relative w-full max-w-md">
              <input
                className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:border-secondary focus:ring-0 px-4 py-3 rounded-t-lg transition-all"
                placeholder="Search by name or quote..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="material-symbols-outlined absolute right-4 top-3.5 text-outline">search</span>
            </div>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="flex items-center gap-1.5 px-4 py-3 border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary hover:border-primary transition-colors font-[600] text-[13px] leading-[1.2] tracking-[0.05em]"
              title="Sort by name"
            >
              <span className="material-symbols-outlined text-[18px]">sort_by_alpha</span>
              {sortDir === "asc" ? "A-Z" : "Z-A"}
            </button>
          </div>
        </div>

        {selected ? (
          <section>
            <button
              onClick={() => { setSelected(null); setLightbox(null) }}
              className="flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-8 font-[600] text-[14px]"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Kembali ke Direktori
            </button>

            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-surface-variant mx-auto md:mx-0">
                  <img className="w-full h-full object-cover" src={optimizeCld(selected.photo, 200)} alt={selected.name} />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="font-headline text-[36px] leading-[1.2] font-bold text-primary mb-2">{selected.name}</h2>
                <p className="font-body text-[18px] leading-[1.6] italic text-on-surface-variant mb-4">
                  &ldquo;{selected.quote}&rdquo;
                </p>
                <p className="font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-secondary">
                  {getPhotos(selected).length} foto dalam galeri
                </p>
              </div>
            </div>

            {getPhotos(selected).length === 0 ? (
              <p className="text-center text-on-surface-variant font-body py-12">Belum ada foto galeri untuk siswa ini.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {getPhotos(selected).map((url, i) => (
                  <div
                    key={url}
                    className="group cursor-pointer aspect-square rounded-xl overflow-hidden border border-outline-variant/10 bg-surface-variant shadow-sm hover:shadow-lg transition-all"
                    onClick={() => setLightbox(url)}
                  >
                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={optimizeCld(url, 400)} alt={`${selected.name} - ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="bento-grid">
            {loading ? (
              <div className="bento-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="font-body text-on-surface-variant col-span-full text-center">Belum ada data siswa.</p>
            ) : (
              filtered.map((student) => (
                <div key={student.id} className="student-card group cursor-pointer" onClick={() => setSelected(student)}>
                    <div className="polaroid-frame transition-all duration-500">
                      <div className="overflow-hidden rounded-lg">
                        <img
                          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                          src={optimizeCld(student.photo, 400)}
                          alt={student.name}
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="font-headline text-[16px] leading-[1.3] font-semibold text-primary">
                          {student.name}
                        </h3>
                        <p className="font-body text-[13px] leading-[1.5] italic text-on-surface-variant mt-1 line-clamp-2">
                          &ldquo;{student.quote}&rdquo;
                        </p>
                        {getPhotos(student).length > 0 && (
                          <p className="mt-1.5 text-[11px] font-[600] text-secondary">
                            {getPhotos(student).length} foto
                          </p>
                        )}
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-primary/95 flex items-center justify-center p-8 backdrop-blur-xl" onClick={() => setLightbox(null)}>
          <button className="absolute top-8 right-8 text-white hover:text-secondary transition-colors" onClick={() => setLightbox(null)}>
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img className="max-h-[85vh] w-full object-contain rounded-lg shadow-2xl" src={optimizeCld(lightbox, 1200)} alt="" />
          </div>
        </div>
      )}

      <footer className="w-full mt-20 bg-surface-container border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 px-6 py-10 max-w-[1200px] mx-auto">
          <p className="font-body text-[14px] leading-[1.5]">&copy; 2026 TekajeOneOfficial</p>
        </div>
      </footer>
    </>
  )
}
