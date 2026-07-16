-- =========================================================
-- SI-ASSET | Data Contoh (opsional, untuk uji coba)
-- Jalankan setelah 0001_init_schema.sql
-- =========================================================

insert into bidang (name, head_name) values
  ('Sekretariat', 'Kepala Sekretariat'),
  ('Inspektur Pembantu I', 'Irban I'),
  ('Inspektur Pembantu II', 'Irban II');

insert into asset_categories (code, name, description) values
  ('ELK', 'Elektronik', 'Komputer, printer, AC, dan perangkat elektronik lain'),
  ('FUR', 'Furnitur', 'Meja, kursi, lemari, dan perabot kantor'),
  ('KDR', 'Kendaraan', 'Kendaraan dinas roda dua dan roda empat'),
  ('POK', 'Peralatan Kantor', 'Alat tulis kantor dan peralatan pendukung');

insert into rooms (name, building, floor) values
  ('Ruang Inspektur', 'Gedung Utama', '1'),
  ('Ruang Sekretariat', 'Gedung Utama', '1'),
  ('Ruang Irban I', 'Gedung Utama', '2'),
  ('Ruang Arsip', 'Gedung Utama', '1');

insert into suppliers (name, contact_person, phone, address) values
  ('CV Sumba Teknik', 'Bapak Yulius', '081234567890', 'Jl. Waikabubak No. 12'),
  ('Toko Meubel Barat', 'Ibu Marlin', '081298765432', 'Jl. Sudirman No. 5');

-- Catatan: tabel `assets` membutuhkan category_id & room_id yang valid.
-- Setelah baris di atas berhasil dibuat, Anda bisa menambah data aset
-- contoh langsung lewat aplikasi (menu Data Aset), karena kode aset
-- dan QR value dibuat otomatis oleh aplikasi saat submit.
