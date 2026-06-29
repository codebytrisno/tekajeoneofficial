# TekajeOneOfficial

Website kenangan alumni TekajeOneOfficial Angkatan 2024/2025 — dibangun dengan Next.js, Firebase, Cloudinary, dan Tailwind CSS.

## Fitur

- **Beranda** — Hero section dengan polaroid interaktif otomatis (real-time dari Firestore), kenangan kelas dalam marquee cards
- **Galeri Kenangan Abadi** — Album foto multi-gambar dengan masonry grid 4 kolom, lightbox dengan navigasi prev/next & keyboard, EXIF date
- **Direktori Siswa** — Profil siswa dengan galeri foto pribadi, grid 5 kolom, sort A-Z/Z-A
- **Kenangan Kelas** — Arsip foto dan cerita kolektif dengan filter status Published/Draft, picker foto multi-source (Galeri + Siswa) dengan deduplikasi URL
- **Kartu Home** — CRUD kartu foto dengan label untuk tampilan polaroid di beranda, photo picker multi-source, reorder
- **Admin Panel** — CRUD untuk semua konten dengan upload Cloudinary, real-time via Firestore onSnapshot, loading skeleton, konfirmasi dialog & toast notifications
- **Responsive Design** — Grid menyesuaikan kolom di setiap breakpoint, ukuran teks proporsional

## Tech Stack

- [Next.js](https://nextjs.org) — React framework
- [Firebase](https://firebase.google.com) — Firestore database & Auth
- [Cloudinary](https://cloudinary.com) — Image hosting & upload
- [Tailwind CSS v4](https://tailwindcss.com) — Styling

## Memulai

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Variables

Buat `.env.local` dengan:

| Key | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
