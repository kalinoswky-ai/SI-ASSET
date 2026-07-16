# SI-ASSET
### Sistem Informasi Manajemen Aset Inspektorat Kabupaten Sumba Barat

Aplikasi web manajemen aset (Barang Milik Daerah) berbasis **React + TypeScript + Vite + Tailwind CSS**, dengan backend **Supabase** (Auth, Database, Storage) dan hosting di **Vercel**.

---

## 1. Fitur yang Sudah Tersedia

- **Login** berbasis peran (Admin, Pengurus Barang, Auditor, Pimpinan) memakai Supabase Auth
- **Dashboard** interaktif (total aset, nilai aset, grafik kategori/ruangan/kondisi/tahun)
- **Master Data**: Kategori Aset, Ruangan, Bidang, Supplier/Vendor
- **Data Aset**: tambah aset, generate kode barang otomatis, QR Code otomatis
- **Inventarisasi**: pindai QR Code lewat kamera, update kondisi & validasi lokasi
- **Peminjaman**: pengajuan → persetujuan → pengembalian
- **Pemeliharaan**: jadwal servis, vendor, biaya
- **Mutasi Barang**: perpindahan antar ruangan
- **Penghapusan**: rusak berat / hibah / pemusnahan
- **Laporan**: export Excel & PDF (KIB, rekap kondisi, peminjaman, pemeliharaan, mutasi, penghapusan)
- Mode gelap, desain responsif desktop & mobile

> Modul di atas adalah **fondasi fungsional** yang bisa langsung dijalankan dan dikembangkan lagi (misalnya menambah upload foto aset ke Storage, notifikasi otomatis H-7 jadwal pemeliharaan, dsb).

---

## 2. Menjalankan di Komputer Lokal

Pastikan **Node.js 18+** sudah terpasang.

```bash
# 1. Masuk ke folder project
cd si-asset

# 2. Install dependencies
npm install

# 3. Salin file environment dan isi kredensial Supabase (lihat Bagian 3)
cp .env.example .env

# 4. Jalankan mode development
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

---

## 3. Setup Supabase (Database, Auth, Storage)

### 3.1 Buat Project
1. Buka https://supabase.com → **New Project**.
2. Pilih nama project (mis. `si-asset-sumba-barat`), buat password database, pilih region terdekat (Singapore).
3. Tunggu hingga project selesai dibuat.

### 3.2 Jalankan Skema Database
1. Buka menu **SQL Editor** di dashboard Supabase.
2. Buka file `supabase/migrations/0001_init_schema.sql` dari project ini, salin seluruh isinya.
3. Tempel di SQL Editor, lalu klik **Run**.
4. (Opsional) Lakukan hal yang sama untuk `supabase/seed.sql` agar ada data contoh kategori, ruangan, dan supplier.

### 3.3 Ambil Kredensial API
1. Buka **Project Settings → API**.
2. Salin **Project URL** dan **anon public key**.
3. Isi ke file `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3.4 Buat Akun Pengguna Pertama (Admin)
1. Buka **Authentication → Users → Add User** di dashboard Supabase.
2. Isi email & password untuk akun admin pertama.
3. Setelah user dibuat, buka **Table Editor → profiles**, cari baris dengan email tersebut (otomatis dibuat oleh trigger), lalu ubah kolom `role` menjadi `admin`.
4. Gunakan email & password ini untuk login pertama kali ke aplikasi.

### 3.5 Storage
Bucket `asset-photos` dan `asset-documents` sudah dibuat otomatis oleh skema SQL di atas (bagian akhir file migrasi), lengkap dengan policy publik untuk membaca dan upload oleh pengguna yang login.

---

## 4. Upload ke GitHub

Karena project ini dibuat di lingkungan tanpa akses internet, langkah upload perlu dilakukan dari komputer Anda:

```bash
cd si-asset
git init
git add .
git commit -m "Initial commit - SI-ASSET"

# Buat repository baru terlebih dahulu di https://github.com/new
# lalu jalankan (ganti URL sesuai repo Anda):
git branch -M main
git remote add origin https://github.com/USERNAME/si-asset.git
git push -u origin main
```

> Pastikan file `.env` **tidak ikut ter-upload** (sudah otomatis diabaikan lewat `.gitignore`).

---

## 5. Deploy ke Vercel

### Opsi A — Lewat Dashboard (paling mudah)
1. Buka https://vercel.com → **Add New → Project**.
2. Pilih **Import Git Repository**, arahkan ke repo `si-asset` yang baru di-push.
3. Vercel otomatis mendeteksi framework **Vite** — biarkan default (`Build Command: npm run build`, `Output Directory: dist`).
4. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy**. Setelah selesai, aplikasi bisa diakses di URL `*.vercel.app` yang diberikan.

### Opsi B — Lewat CLI
```bash
npm install -g vercel
cd si-asset
vercel login
vercel          # ikuti wizard, pilih project
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

---

## 6. Struktur Project

```
si-asset/
├── src/
│   ├── components/
│   │   ├── ui/          # Komponen dasar (Button, Card, Dialog, Select, dst — gaya shadcn/ui)
│   │   ├── layout/       # Sidebar, Topbar, AppLayout, ProtectedRoute
│   │   └── master/       # CrudTable generik untuk Master Data
│   ├── contexts/         # AuthContext (Supabase Auth + role)
│   ├── pages/            # Semua halaman modul (Dashboard, Aset, Peminjaman, dst)
│   ├── lib/              # supabase.ts (client), utils.ts (formatter)
│   └── types/            # Tipe domain & tipe skema database
├── supabase/
│   ├── migrations/0001_init_schema.sql   # Skema database lengkap + RLS
│   └── seed.sql                          # Data contoh opsional
├── vercel.json           # Konfigurasi SPA routing di Vercel
└── .env.example
```

---

## 7. Pengembangan Lanjutan yang Disarankan

Sesuai dokumen aktualisasi, beberapa fitur berikut bisa ditambahkan bertahap:

- Upload foto aset & dokumen berita acara ke Supabase Storage (bucket sudah disiapkan)
- Peta lokasi aset (integrasi Leaflet/Google Maps)
- Notifikasi otomatis (Supabase Edge Function + cron) untuk jadwal pemeliharaan yang mendekati
- Audit trail otomatis di setiap modul (insert ke `activity_logs` pada setiap create/update/delete)
- Role-based access yang lebih granular di level UI (saat ini sudah ada helper `hasRole()` di `AuthContext`, tinggal diterapkan di lebih banyak tempat)

---

## 8. Bantuan

Jika ada error saat `npm install` atau build, jalankan:
```bash
node -v   # pastikan versi 18 ke atas
npm run build
```
dan periksa pesan error yang muncul di terminal.
