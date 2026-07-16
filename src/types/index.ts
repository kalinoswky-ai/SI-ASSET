export type AppRole = 'admin' | 'pengurus_barang' | 'auditor' | 'pimpinan'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: AppRole
  bidang_id: string | null
  is_active: boolean
  created_at: string
}

export interface AssetCategory {
  id: string
  code: string
  name: string
  description: string | null
  created_at: string
}

export interface Bidang {
  id: string
  name: string
  head_name: string | null
  created_at: string
}

export interface Room {
  id: string
  name: string
  building: string | null
  floor: string | null
  bidang_id: string | null
  created_at: string
}

export interface Supplier {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export type AssetCondition = 'baik' | 'rusak_ringan' | 'rusak_berat'
export type AssetStatus = 'aktif' | 'dipinjam' | 'dalam_pemeliharaan' | 'dihapus'

export interface Asset {
  id: string
  asset_code: string
  register_number: string
  name: string
  brand_type: string | null
  serial_number: string | null
  category_id: string
  acquisition_year: number
  acquisition_value: number
  funding_source: string | null
  room_id: string | null
  responsible_person_id: string | null
  photo_url: string | null
  qr_code_value: string
  condition: AssetCondition
  status: AssetStatus
  created_at: string
  updated_at: string
  // Relasi (diisi lewat join)
  category?: AssetCategory
  room?: Room
  responsible_person?: Profile
}

export type LoanStatus = 'diajukan' | 'disetujui' | 'ditolak' | 'dikembalikan'

export interface AssetLoan {
  id: string
  asset_id: string
  borrower_id: string
  approved_by: string | null
  loan_date: string
  expected_return_date: string
  actual_return_date: string | null
  purpose: string
  status: LoanStatus
  notes: string | null
  created_at: string
  asset?: Asset
  borrower?: Profile
}

export interface AssetMaintenance {
  id: string
  asset_id: string
  scheduled_date: string
  completed_date: string | null
  vendor_id: string | null
  cost: number
  description: string
  proof_url: string | null
  created_at: string
  asset?: Asset
  vendor?: Supplier
}

export interface AssetMutation {
  id: string
  asset_id: string
  from_room_id: string | null
  to_room_id: string | null
  from_bidang_id: string | null
  to_bidang_id: string | null
  from_user_id: string | null
  to_user_id: string | null
  reason: string
  mutation_date: string
  approved_by: string | null
  created_at: string
  asset?: Asset
}

export type DisposalType = 'rusak_berat' | 'hibah' | 'pemusnahan'

export interface AssetDisposal {
  id: string
  asset_id: string
  disposal_type: DisposalType
  disposal_date: string
  reason: string
  official_document_url: string | null
  approved_by: string | null
  created_at: string
  asset?: Asset
}

export interface InventoryCheck {
  id: string
  asset_id: string
  checked_by: string
  check_date: string
  location_matched: boolean
  condition_found: AssetCondition
  notes: string | null
  created_at: string
  asset?: Asset
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: string | null
  created_at: string
  user?: Profile
}

export interface DashboardStats {
  totalAssets: number
  totalValue: number
  activeAssets: number
  loanedAssets: number
  damagedAssets: number
  byCategory: { name: string; value: number }[]
  byRoom: { name: string; value: number }[]
  byCondition: { name: string; value: number }[]
  byYear: { year: string; value: number }[]
}
