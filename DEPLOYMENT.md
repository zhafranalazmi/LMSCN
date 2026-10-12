# MongoDB Atlas dan Cloudinary

## Environment variables

Salin `.env.example` menjadi `.env.local`, lalu isi nilainya. Jangan commit `.env.local` atau membagikan API secret.

- `MONGODB_URI`: connection string Atlas dari **Database > Connect > Drivers**. Ganti username, password, cluster, dan nama database. Encode karakter khusus pada password sesuai URL.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: ambil dari **Cloudinary Dashboard > Product Environment Credentials**. Semua kredensial Cloudinary hanya digunakan server-side.
- `NEXTAUTH_SECRET`: secret acak yang panjang.
- `NEXTAUTH_URL`: URL lokal saat development atau URL deployment saat production.

## Memindahkan MongoDB ke Atlas

1. Buat cluster Atlas dan database user dengan hak akses minimum yang diperlukan.
2. Tambahkan alamat IP server aplikasi di **Network Access**. Untuk development, izinkan IP publik saat ini; hindari `0.0.0.0/0` untuk production bila memungkinkan.
3. Jika sudah ada database MongoDB, salin seluruh database ke Atlas menggunakan MongoDB Database Tools (`mongodump` lalu `mongorestore`), termasuk koleksi GridFS `uploads.files` dan `uploads.chunks`. Jangan letakkan kredensial langsung di perintah yang disimpan atau dibagikan.
4. Ganti `MONGODB_URI` di `.env.local` dengan connection string Atlas. Aplikasi dan skrip seed menggunakan variabel ini.
5. File PDF GridFS yang sudah ada akan tetap disajikan dari Atlas. Unggahan PDF baru menggunakan Cloudinary.

## Menyiapkan Cloudinary

1. Buat akun Cloudinary dan salin kredensialnya ke variabel environment lokal.
2. PDF baru diunggah sebagai aset `authenticated`; aplikasi membuat URL unduhan bertanda tangan yang berlaku 5 menit setelah pengguna login.
3. Jalankan aplikasi dan coba unggah PDF sebagai guru maupun siswa.

## Deploy ke Vercel

1. Push proyek ini ke repository GitHub.
2. Buka dashboard Vercel dan pilih **Add New Project**.
3. Impor repository tersebut.
4. Pada bagian **Environment Variables**, tambahkan seluruh variabel dari `.env.example` untuk setiap environment yang digunakan.
5. Untuk `NEXTAUTH_SECRET`, gunakan nilai acak yang panjang, misalnya hasil dari:

   ```bash
   openssl rand -base64 32
   ```

6. Set `NEXTAUTH_URL` ke URL domain deployment yang akan digunakan.
7. Pastikan Atlas mengizinkan koneksi dari deployment Vercel sesuai kebijakan jaringan Anda.
8. Jalankan deploy.

## Verifikasi setelah deploy

- Buka halaman utama dan pastikan aplikasi tersedia.
- Coba login menggunakan akun yang sudah tersimpan di MongoDB.
- Coba upload PDF melalui halaman materi atau tugas guru maupun pengumpulan tugas siswa.
- Periksa log Vercel jika terjadi error pada API atau koneksi database.

> Pastikan `NEXTAUTH_SECRET`, `MONGODB_URI`, dan kredensial Cloudinary tidak pernah kosong atau ditempatkan sebagai public setting.
