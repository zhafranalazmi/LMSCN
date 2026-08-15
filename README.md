# LMS SMK Citra Negara

Tahap 1: setup project Next.js + MongoDB + login dengan 5 role (Admin, Guru,
Kepala Sekolah, Kurikulum, Siswa). Belum ada fitur di luar auth & kerangka
dashboard — sesuai rencana, fitur ditambah bertahap.

## Yang sudah ada

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Login dengan NextAuth.js (Credentials provider, password di-hash pakai bcrypt)
- Model User di MongoDB (Mongoose) dengan field `role` dan `jurusan`
- Middleware yang otomatis memblokir akses dashboard role lain
  (misal siswa gak bisa buka `/dashboard/admin`)
- Halaman dashboard kosong untuk tiap role, siap diisi fitur

## Setup

1. Install dependency:
   ```bash
   npm install
   ```

2. Copy `.env.example` jadi `.env.local`, lalu isi:
   - `MONGODB_URI` — connection string dari MongoDB Atlas (atau MongoDB lokal)
   - `NEXTAUTH_SECRET` — generate dengan `openssl rand -base64 32`
   - `NEXTAUTH_URL` — biarkan `http://localhost:3000` untuk development

3. Seed akun awal (1 akun per role, password sama semua: `password123`):
   ```bash
   npm run seed
   ```

4. Jalankan development server:
   ```bash
   npm run dev
   ```

5. Buka `http://localhost:3000`, klik "Masuk", login pakai salah satu akun
   hasil seed, misalnya:
   - `admin@citranegara.sch.id` / `password123`
   - `guru@citranegara.sch.id` / `password123`
   - `siswa@citranegara.sch.id` / `password123`

   Setelah login akan otomatis diarahkan ke dashboard sesuai role.

## Struktur folder penting

```
app/
  page.tsx                  → landing page
  login/page.tsx             → halaman login
  api/auth/[...nextauth]/    → endpoint NextAuth
  dashboard/
    layout.tsx                → cek session, header, tombol logout
    admin/page.tsx
    guru/page.tsx
    kepsek/page.tsx
    kurikulum/page.tsx
    siswa/page.tsx
lib/
  mongodb.ts                 → koneksi MongoDB (cached)
  auth.ts                    → konfigurasi NextAuth
models/
  User.ts                    → schema User (role, jurusan, kelas)
middleware.ts                 → proteksi route per role
scripts/seed.mjs              → bikin akun awal untuk testing
```

## Rencana tahap selanjutnya

- CRUD manajemen kelas, siswa, guru (fitur Admin)
- Upload materi & tugas (fitur Guru)
- Asesmen/kuis online + penilaian
- Rekap & download nilai (Kurikulum/Kepsek)
- Upload tugas siswa
