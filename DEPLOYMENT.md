# Deployment ke Vercel

## Persiapan environment

1. Salin `.env.example` ke `.env.local` untuk pengembangan lokal.
2. Isi semua nilai environment yang diperlukan.
3. Pastikan `MONGODB_URI` mengarah ke database MongoDB yang dapat diakses dari Vercel.
4. Buka MongoDB Atlas, tambahkan IP `0.0.0.0/0` atau gunakan network access yang sesuai.

## Deploy ke Vercel

1. Push proyek ini ke repository GitHub.
2. Buka dashboard Vercel dan pilih **Add New Project**.
3. Impor repository tersebut.
4. Pada bagian **Environment Variables**, tambahkan setiap variabel dari `.env.example`.
5. Untuk `NEXTAUTH_SECRET`, gunakan nilai acak yang panjang, misalnya hasil dari:

   ```bash
   openssl rand -base64 32
   ```

6. Set `NEXTAUTH_URL` ke URL domain Vercel yang akan digunakan. Untuk preview deployment, Vercel akan menyediakan URL secara otomatis dan nilai ini dapat diisi pada setiap environment.
7. Jalankan deploy.

## Verifikasi setelah deploy

- Buka halaman utama dan pastikan aplikasi tersedia.
- Coba login menggunakan akun yang sudah tersimpan di MongoDB.
- Coba upload PDF melalui halaman materi atau tugas.
- Periksa log Vercel jika terjadi error pada API atau koneksi database.

> Gunakan MongoDB Atlas atau MongoDB Community yang dapat diakses dari Vercel. Pastikan variabel `NEXTAUTH_SECRET` dan `MONGODB_URI` tidak pernah menjadi nilai kosong atau ditempatkan sebagai public setting.
