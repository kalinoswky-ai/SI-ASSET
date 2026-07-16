-- =========================================================
-- SI-ASSET | Skema Database Awal
-- Inspektorat Kabupaten Sumba Barat
-- Jalankan file ini di Supabase SQL Editor (project baru)
-- =========================================================

-- ---------- ENUM TYPES ----------
create type app_role as enum ('admin', 'pengurus_barang', 'auditor', 'pimpinan');
create type asset_condition as enum ('baik', 'rusak_ringan', 'rusak_berat');
create type asset_status as enum ('aktif', 'dipinjam', 'dalam_pemeliharaan', 'dihapus');
create type loan_status as enum ('diajukan', 'disetujui', 'ditolak', 'dikembalikan');
create type disposal_type as enum ('rusak_berat', 'hibah', 'pemusnahan');

-- ---------- MASTER DATA ----------
create table bidang (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  head_name text,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role app_role not null default 'pengurus_barang',
  bidang_id uuid references bidang(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table asset_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  building text,
  floor text,
  bidang_id uuid references bidang(id) on delete set null,
  created_at timestamptz not null default now()
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- ---------- ASET ----------
create table assets (
  id uuid primary key default gen_random_uuid(),
  asset_code text not null unique,
  register_number text not null,
  name text not null,
  brand_type text,
  serial_number text,
  category_id uuid not null references asset_categories(id),
  acquisition_year int not null,
  acquisition_value numeric(16,2) not null default 0,
  funding_source text,
  room_id uuid references rooms(id) on delete set null,
  responsible_person_id uuid references profiles(id) on delete set null,
  photo_url text,
  qr_code_value text not null unique,
  condition asset_condition not null default 'baik',
  status asset_status not null default 'aktif',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_assets_category on assets(category_id);
create index idx_assets_room on assets(room_id);
create index idx_assets_status on assets(status);

-- ---------- PEMINJAMAN ----------
create table asset_loans (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  borrower_id uuid not null references profiles(id),
  approved_by uuid references profiles(id),
  loan_date date not null,
  expected_return_date date not null,
  actual_return_date date,
  purpose text not null,
  status loan_status not null default 'diajukan',
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- PEMELIHARAAN ----------
create table asset_maintenance (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  scheduled_date date not null,
  completed_date date,
  vendor_id uuid references suppliers(id),
  cost numeric(16,2) not null default 0,
  description text not null,
  proof_url text,
  created_at timestamptz not null default now()
);

-- ---------- MUTASI ----------
create table asset_mutations (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  from_room_id uuid references rooms(id),
  to_room_id uuid references rooms(id),
  from_bidang_id uuid references bidang(id),
  to_bidang_id uuid references bidang(id),
  from_user_id uuid references profiles(id),
  to_user_id uuid references profiles(id),
  reason text not null,
  mutation_date date not null,
  approved_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- PENGHAPUSAN ----------
create table asset_disposals (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  disposal_type disposal_type not null,
  disposal_date date not null,
  reason text not null,
  official_document_url text,
  approved_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- INVENTARISASI ----------
create table inventory_checks (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  checked_by uuid not null references profiles(id),
  check_date timestamptz not null default now(),
  location_matched boolean not null default true,
  condition_found asset_condition not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- NOTIFIKASI & AUDIT TRAIL ----------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- TRIGGER: auto-update `updated_at` pada tabel assets
-- =========================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_assets_updated_at
before update on assets
for each row execute function set_updated_at();

-- =========================================================
-- TRIGGER: buat profile otomatis saat user baru mendaftar
-- =========================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'pengurus_barang'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table bidang enable row level security;
alter table asset_categories enable row level security;
alter table rooms enable row level security;
alter table suppliers enable row level security;
alter table assets enable row level security;
alter table asset_loans enable row level security;
alter table asset_maintenance enable row level security;
alter table asset_mutations enable row level security;
alter table asset_disposals enable row level security;
alter table inventory_checks enable row level security;
alter table notifications enable row level security;
alter table activity_logs enable row level security;

-- Helper: cek role user yang sedang login
create or replace function current_role_is(roles app_role[])
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = any(roles) and is_active = true
  );
$$ language sql stable security definer;

-- Semua pengguna login boleh MEMBACA data referensi & aset
create policy "read_all_authenticated_profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_bidang" on bidang for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_categories" on asset_categories for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_rooms" on rooms for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_suppliers" on suppliers for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_assets" on assets for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_loans" on asset_loans for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_maintenance" on asset_maintenance for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_mutations" on asset_mutations for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_disposals" on asset_disposals for select using (auth.role() = 'authenticated');
create policy "read_all_authenticated_checks" on inventory_checks for select using (auth.role() = 'authenticated');
create policy "read_own_notifications" on notifications for select using (user_id = auth.uid());
create policy "read_all_authenticated_logs" on activity_logs for select using (auth.role() = 'authenticated');

-- Pengguna boleh update profil miliknya sendiri
create policy "update_own_profile" on profiles for update using (id = auth.uid());

-- Admin & Pengurus Barang boleh kelola master data + aset
create policy "manage_bidang" on bidang for all using (current_role_is(array['admin','pengurus_barang']::app_role[]));
create policy "manage_categories" on asset_categories for all using (current_role_is(array['admin','pengurus_barang']::app_role[]));
create policy "manage_rooms" on rooms for all using (current_role_is(array['admin','pengurus_barang']::app_role[]));
create policy "manage_suppliers" on suppliers for all using (current_role_is(array['admin','pengurus_barang']::app_role[]));
create policy "manage_assets" on assets for all using (current_role_is(array['admin','pengurus_barang']::app_role[]));
create policy "manage_maintenance" on asset_maintenance for all using (current_role_is(array['admin','pengurus_barang']::app_role[]));
create policy "manage_mutations" on asset_mutations for all using (current_role_is(array['admin','pengurus_barang']::app_role[]));
create policy "manage_disposals" on asset_disposals for all using (current_role_is(array['admin','pengurus_barang']::app_role[]));
create policy "manage_checks" on inventory_checks for all using (auth.role() = 'authenticated');

-- Peminjaman: siapa saja yang login boleh mengajukan; hanya admin/pengurus barang yang approve/update
create policy "create_own_loan" on asset_loans for insert with check (borrower_id = auth.uid());
create policy "manage_loans" on asset_loans for update using (current_role_is(array['admin','pengurus_barang']::app_role[]) or borrower_id = auth.uid());
create policy "delete_loans" on asset_loans for delete using (current_role_is(array['admin','pengurus_barang']::app_role[]));

-- Notifikasi: sistem (service role) yang insert, user hanya update status baca miliknya
create policy "update_own_notifications" on notifications for update using (user_id = auth.uid());

-- Log aktivitas: insert oleh siapa saja yang login (dicatat dari aplikasi)
create policy "insert_activity_logs" on activity_logs for insert with check (auth.role() = 'authenticated');

-- =========================================================
-- STORAGE BUCKETS (foto aset, bukti servis, berita acara)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('asset-photos', 'asset-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('asset-documents', 'asset-documents', true)
on conflict (id) do nothing;

create policy "public_read_asset_photos" on storage.objects for select using (bucket_id = 'asset-photos');
create policy "authenticated_upload_asset_photos" on storage.objects for insert with check (bucket_id = 'asset-photos' and auth.role() = 'authenticated');
create policy "public_read_asset_documents" on storage.objects for select using (bucket_id = 'asset-documents');
create policy "authenticated_upload_asset_documents" on storage.objects for insert with check (bucket_id = 'asset-documents' and auth.role() = 'authenticated');
