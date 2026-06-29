"use client"

import { useState, useEffect } from "react"
import { Skeleton, SkeletonCard } from "@/components/Skeleton"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Navbar from "@/components/Navbar"
import { optimizeCld } from "@/lib/cloudinary"

interface GalleryItem {
  id: string
  title: string
  date: string
  coverImageUrl?: string
  photos?: string[]
  imageUrl?: string
  pinned?: boolean
}

interface LightboxData {
  img: string
  title: string
  meta: string
}

const aspects = ["aspect-[3/4]", "aspect-square", "aspect-[4/3]", "aspect-video"]

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryItem | null>(null)
  const [lightbox, setLightbox] = useState<LightboxData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "galleryItems"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem))
      const sorted = [...raw].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return 0
      })
      setItems(sorted)
      setLoading(false)
    })
    return unsub
  }, [])

  const getPhotos = (item: GalleryItem): string[] => {
    if (item.photos && item.photos.length > 0) return item.photos
    if (item.imageUrl) return [item.imageUrl]
    return []
  }

  const getCover = (item: GalleryItem): string => {
    return item.coverImageUrl || item.imageUrl || ""
  }

  const [lightboxIdx, setLightboxIdx] = useState(-1)

  const goNext = () => {
    if (!selectedAlbum) return
    const photos = getPhotos(selectedAlbum)
    setLightboxIdx((prev) => (prev + 1) % photos.length)
  }

  const goPrev = () => {
    if (!selectedAlbum) return
    const photos = getPhotos(selectedAlbum)
    setLightboxIdx((prev) => (prev - 1 + photos.length) % photos.length)
  }

  useEffect(() => {
    if (lightboxIdx < 0 || !selectedAlbum) return
    const photos = getPhotos(selectedAlbum)
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxIdx((prev) => (prev + 1) % photos.length)
      else if (e.key === "ArrowLeft") setLightboxIdx((prev) => (prev - 1 + photos.length) % photos.length)
      else if (e.key === "Escape") setLightboxIdx(-1)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightboxIdx, selectedAlbum])

  if (selectedAlbum) {
    const albumPhotos = getPhotos(selectedAlbum)
    const lightboxUrl = lightboxIdx >= 0 ? albumPhotos[lightboxIdx] : null

    return (
      <>
        <Navbar />
        <div className="fixed inset-0 paper-texture opacity-10 z-[100] pointer-events-none" />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <button
            onClick={() => { setSelectedAlbum(null); setLightboxIdx(-1) }}
            className="flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-6 sm:mb-8 font-[600] text-[14px]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali ke Galeri
          </button>

          <section className="text-center mb-12">
            <h1 className="font-headline text-[28px] sm:text-[34px] lg:text-[40px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mb-2">
              {selectedAlbum.title}
            </h1>
            <p className="font-body text-[14px] sm:text-[16px] leading-[1.6] text-on-surface-variant">
              {selectedAlbum.date} &bull; {albumPhotos.length} foto
            </p>
          </section>

          {albumPhotos.length === 0 ? (
            <p className="text-center text-on-surface-variant font-body">Belum ada foto dalam album ini.</p>
          ) : (
            <div className="masonry-grid">
              {albumPhotos.map((url, i) => (
                <div
                  key={url}
                  className="gallery-item group cursor-pointer"
                  onClick={() => setLightboxIdx(i)}
                >
                  <div className="polaroid-border bg-white p-2 transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]">
                    <div className={`relative overflow-hidden ${aspects[i % aspects.length]}`}>
                      <img className="w-full h-full object-cover" src={optimizeCld(url, 600)} alt={`${selectedAlbum.title} - ${i + 1}`} />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-4xl">zoom_in</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {lightboxUrl && (
          <div className="fixed inset-0 z-[200] bg-primary/95 flex items-center justify-center p-8 backdrop-blur-xl" onClick={() => setLightboxIdx(-1)}>
            <button className="absolute top-8 right-8 text-white hover:text-secondary transition-colors z-10" onClick={() => setLightboxIdx(-1)}>
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-3 rounded-full transition-all z-10"
            >
              <span className="material-symbols-outlined text-4xl">chevron_left</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-3 rounded-full transition-all z-10"
            >
              <span className="material-symbols-outlined text-4xl">chevron_right</span>
            </button>
            <div className="max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                className="max-h-[80vh] object-contain mb-8 rounded-lg shadow-2xl border-4 border-white/10"
                src={optimizeCld(lightboxUrl, 1200)}
                alt={selectedAlbum.title}
              />
              <div className="text-center">
                <h3 className="font-headline text-[32px] leading-[1.3] font-semibold text-white mb-2">{selectedAlbum.title}</h3>
                <p className="font-body text-[16px] leading-[1.6] text-on-primary-container">{lightboxIdx + 1} / {albumPhotos.length}</p>
              </div>
            </div>
          </div>
        )}

        <footer className="w-full mt-12 sm:mt-20 bg-surface-container border-t border-outline-variant">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 px-4 sm:px-6 py-8 sm:py-10 max-w-[1200px] mx-auto opacity-90 hover:opacity-100 transition-all">
            <p className="font-body text-[13px] sm:text-[14px] leading-[1.5]">&copy; 2026 TekajeOneOfficial</p>
          </div>
        </footer>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="fixed inset-0 paper-texture opacity-10 z-[100] pointer-events-none" />
      <main className="max-w-[1200px] mx-auto px-6 py-20">
        <section className="text-center mb-16">
          <h1 className="font-headline text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mb-3 sm:mb-4">
            Galeri Kenangan Abadi
          </h1>
          <p className="font-body text-[15px] sm:text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
            Buku tempel digital dari perjalanan bersama kita. Setiap bingkai menceritakan sebuah kisah,
            setiap senyuman mengabadikan momen dari tahun-tahun tak terlupakan kita bersama.
          </p>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-on-surface-variant font-body">Belum ada album galeri.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => {
              const photoCount = getPhotos(item).length
              return (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedAlbum(item)}
                >
                  <div className="polaroid-border bg-white p-2 transition-all duration-500 group-hover:-rotate-1 group-hover:scale-[1.02] group-hover:shadow-xl">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img className="w-full h-full object-cover" src={optimizeCld(getCover(item), 600)} alt={item.title} />
                      <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-4xl">photo_library</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-primary/70 text-white text-[12px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">photo</span>
                        {photoCount}
                      </div>
                    </div>
                    <div className="pt-3 pb-1 px-1 text-center">
                      <p className="font-headline text-[16px] leading-[1.3] font-semibold text-primary">{item.title}</p>
                      <p className="font-[600] text-[12px] leading-[1.2] tracking-[0.05em] text-secondary italic mt-0.5">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="w-full mt-20 bg-surface-container border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 px-6 py-10 max-w-[1200px] mx-auto opacity-90 hover:opacity-100 transition-all">
          <p className="font-body text-[14px] leading-[1.5]">&copy; 2026 TekajeOneOfficial</p>
        </div>
      </footer>
    </>
  )
}
