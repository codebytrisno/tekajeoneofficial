"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

interface Memory {
  id: string
  title: string
  desc: string
  category: string
  date: string
  imageUrl: string
}

export default function HomePage() {
  const [memories, setMemories] = useState<Memory[]>([])

  useEffect(() => {
    const q = query(collection(db, "classMemories"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setMemories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Memory)))
    })
    return unsub
  }, [])

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-24 md:pb-32 min-h-[600px] flex items-center">
        <div className="absolute inset-0 z-0 pointer-events-none marquee-container overflow-hidden">
          <div className="animate-marquee flex gap-8 py-12">
            {[1, 2].map((set) =>
              [
                "https://lh3.googleusercontent.com/aida/AP1WRLt2-jTb27WUUTtWv8qWB0ILfPQ8_tdb60CeJCSEbXhKBYFBPJrxBF4eHXQ8VrhF_YY9NICU9jrwSsdLZPO25OtKVNOBFtQPLMP4QEys4N8AROw9vQda_EyUGhWeIXck1N08wYE1vlDxMsLypB78ua3ZST56drcmCKCLlgZN_EpDGd5WSvSV0c1bFqknZPRLKF6Ljd0OZmKplnLJKDcdni3yzokwAzEnokRhR52kk2w5dx-25CXsMquA4A6c",
                "https://lh3.googleusercontent.com/aida/AP1WRLtyOtfEF9lEbVr9dtIagND3X0Tv8DLHFbga5Rt6FKHADNoUJ4RGUg_1NA1NOlbGcz_XZB2Pjire6g1QKBgvNTbqivo6pCDSZtpLahS8nj7M9xhAv8W15UKGTHo-eTTZHWpSPkcjpf5oLx3aWlF8jRhkF0HMrGqkgbedDDbMRsd-hbNJgtc3MtrcMY1SwVS85Bw43gTUmJCs2duRl-1h1kUaWvmtAGn2UntYQbQ_kLiZn-xqA3KB_XhgseMI",
                "https://lh3.googleusercontent.com/aida/AP1WRLv-jzohIZ9Eh5XoUGc5Yg8BTuD74UxToNlxpwNOBOE9d3HAvFwTUS0W_TAu9M9oGAnre2lJe9E_6LgGLU3OvPUt1qB37LpTbUw1vAKWB9hqGsCWCkLvKfGglSlaimjuAExBVknZMm9t300HbNcgHuWUykCqbxfC7HkpQtRaz_t1WLhOwlve58DbRNPa5qK18W7qNAGiq79Tlk_3RCw4YtwSuOkRHlltVW6wz2NYeibdf5YdATZtjqG0LLGR",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDS4iWjrzPcMNLwibVN9OSPuZWuI3Or7JNTCjnL-gZxQEAT1oBz0vUJZe9x2_MDKognLKTyvbQgoNnrJnlOSh-dZOH-3m-BJXM8hw-K7Y9ikuRnpXYSwT6esJgaVGF7ZXI3lcvSNe2dnmBlNzdgVU8OPLkkb5qDCHa1Haq_cAKH2w8ShcLCSqczyyJCbOUOYCFC_48lm9ad1krVZk4KPV3_nfOe_I8BVYJaEprg9rvLLpdyC_vQtysqGxBtyeHkGb60D47e7d29K3r2",
              ].map((src, i) => (
                <img
                  key={`${set}-${i}`}
                  alt="Memory"
                  className="h-[400px] w-auto nostalgic-photo rounded-xl object-cover"
                  src={src}
                />
              ))
            )}
          </div>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        </div>
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="font-headline text-[48px] leading-[1.2] font-bold tracking-[-0.02em] text-primary mb-6">
              Mengenang Kenangan
              <br />
              <span className="text-secondary italic">
                TekajeOneOfficial Angkatan2024/2025
              </span>
            </h1>
            <p className="font-body text-[18px] leading-[1.6] text-on-surface-variant mb-8 max-w-lg">
              Website untuk merayakan setiap tawa, mengabadikan setiap momen, dan
              menjaga erat tali persahabatan yang telah kita jalin bersama di masa
              sekolah.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/gallery"
                className="bg-primary text-on-primary px-8 py-4 rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] flex items-center gap-2 hover:translate-y-[-2px] transition-transform"
              >
                Eksplor Galeri
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
              <a
                href="/students"
                className="border border-primary text-primary px-8 py-4 rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-primary/5 transition-colors"
              >
                Tentang Kami
              </a>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <div className="polaroid z-20 w-64 md:w-80 absolute -translate-x-12 -translate-y-8 rotate-[-6deg]">
              <img
                className="w-full aspect-square object-cover mb-4"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwRdkm7JPdn-HS5Tpee0s0Copx_GSj3c-JiU_0D3iaec0doFggW4yRME4ZKtX7wr62r7vdkLqEqVvScHvjG1GxcuFbL8YUV4ONq5FjkwAh365nfCf3PMrrAwZHq6acKY2C46YgH2NolWkZ3UvLCuTpE-SQaGW2F3m4mWCI1k6lnnaVbJrko_EC8GAPO3MlnV8KcZkXKLrUsil0_27UHrdBG8H5BkfP0EElA6BOD7pCGmQJZlCTwJXlFOnBtLqZuKhueinRBiv_ptq5"
              />
              <div className="font-headline text-[24px] leading-[1.4] font-semibold text-primary text-center">
                Kelas XI-B, 2024
              </div>
            </div>
            <div className="polaroid z-10 w-64 md:w-80 translate-x-12 translate-y-8 rotate-[4deg]">
              <img
                className="w-full aspect-square object-cover mb-4"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBPN0HntyCJe19Ifav_njl7nA8BuPT21BfzNLac0MNQijkHA8VsRL-Uk5J_T_9ArtL04ETsnDscA1BFPfqP9RCHxquf0_xdlccKBmyxIxPn2ZOC4aTG18Q43BcVRaMcXIp5-3z4a8TqC7Uv1JYqLHZ2QSyeaIlmlWteo806OajfS2XFGi3vTV7QKy8cvfQrSc470M5JvnnOoTb9d-y5dT15EN9OZSWHlPIREdDyWgCqL8s8sdoCm6_nSXtVFN6FLj5sgKWfbUhv2Tz"
              />
              <div className="font-headline text-[24px] leading-[1.4] font-semibold text-primary text-center">
                Impian 2026
              </div>
            </div>
            <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl -z-0" />
          </div>
        </div>
      </section>
      <section className="py-20 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-12 flex justify-between items-end">
          <div>
            <h2 className="font-headline text-[32px] leading-[1.3] font-semibold text-primary mb-2">
              Kenangan Kelas
            </h2>
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              Kilas balik momen-momen terbaik kita
            </p>
          </div>
        </div>
        <div className="cards-marquee-container overflow-hidden w-full relative">
          <div className="animate-cards-marquee flex gap-8 px-6">
            {memories.length === 0 ? (
              <p className="font-body text-on-surface-variant px-6">Belum ada kenangan.</p>
            ) : (
              [...memories, ...memories].map((m, i) => (
                <div key={`${m.id}-${i}`} className="flex-none w-80 md:w-96">
                  <div className="paper-card bg-white rounded-xl overflow-hidden group h-full">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={m.imageUrl}
                        alt={m.title}
                      />
                      <div className="absolute top-4 right-4 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[12px] font-[600] text-[13px] leading-[1.2] tracking-[0.05em]">
                        {m.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary mb-2">
                        {m.title}
                      </h3>
                      <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-4 line-clamp-2">
                        {m.desc}
                      </p>
                      <div className="flex items-center gap-2 text-secondary">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        <span className="font-[600] text-[13px] leading-[1.2] tracking-[0.05em]">{m.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
