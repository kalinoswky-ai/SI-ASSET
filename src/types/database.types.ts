// Tipe ini merupakan versi ringkas dari skema database.
// Setelah project Supabase dibuat dan migrasi dijalankan, Anda bisa
// men-generate ulang tipe otomatis dengan Supabase CLI:
//   supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'pengurus_barang' | 'auditor' | 'pimpinan'
          bidang_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; email: string; full_name: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      asset_categories: {
        Row: { id: string; code: string; name: string; description: string | null; created_at: string }
        Insert: Partial<Database['public']['Tables']['asset_categories']['Row']> & { code: string; name: string }
        Update: Partial<Database['public']['Tables']['asset_categories']['Row']>
      }
      bidang: {
        Row: { id: string; name: string; head_name: string | null; created_at: string }
        Insert: Partial<Database['public']['Tables']['bidang']['Row']> & { name: string }
        Update: Partial<Database['public']['Tables']['bidang']['Row']>
      }
      rooms: {
        Row: { id: string; name: string; building: string | null; floor: string | null; bidang_id: string | null; created_at: string }
        Insert: Partial<Database['public']['Tables']['rooms']['Row']> & { name: string }
        Update: Partial<Database['public']['Tables']['rooms']['Row']>
      }
      suppliers: {
        Row: { id: string; name: string; contact_person: string | null; phone: string | null; address: string | null; created_at: string }
        Insert: Partial<Database['public']['Tables']['suppliers']['Row']> & { name: string }
        Update: Partial<Database['public']['Tables']['suppliers']['Row']>
      }
      assets: {
        Row: {
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
          condition: 'baik' | 'rusak_ringan' | 'rusak_berat'
          status: 'aktif' | 'dipinjam' | 'dalam_pemeliharaan' | 'dihapus'
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['assets']['Row']> & {
          asset_code: string
          register_number: string
          name: string
          category_id: string
          acquisition_year: number
          acquisition_value: number
          qr_code_value: string
        }
        Update: Partial<Database['public']['Tables']['assets']['Row']>
      }
      asset_loans: {
        Row: {
          id: string
          asset_id: string
          borrower_id: string
          approved_by: string | null
          loan_date: string
          expected_return_date: string
          actual_return_date: string | null
          purpose: string
          status: 'diajukan' | 'disetujui' | 'ditolak' | 'dikembalikan'
          notes: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['asset_loans']['Row']> & {
          asset_id: string
          borrower_id: string
          loan_date: string
          expected_return_date: string
          purpose: string
        }
        Update: Partial<Database['public']['Tables']['asset_loans']['Row']>
      }
      asset_maintenance: {
        Row: {
          id: string
          asset_id: string
          scheduled_date: string
          completed_date: string | null
          vendor_id: string | null
          cost: number
          description: string
          proof_url: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['asset_maintenance']['Row']> & {
          asset_id: string
          scheduled_date: string
          description: string
        }
        Update: Partial<Database['public']['Tables']['asset_maintenance']['Row']>
      }
      asset_mutations: {
        Row: {
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
        }
        Insert: Partial<Database['public']['Tables']['asset_mutations']['Row']> & {
          asset_id: string
          reason: string
          mutation_date: string
        }
        Update: Partial<Database['public']['Tables']['asset_mutations']['Row']>
      }
      asset_disposals: {
        Row: {
          id: string
          asset_id: string
          disposal_type: 'rusak_berat' | 'hibah' | 'pemusnahan'
          disposal_date: string
          reason: string
          official_document_url: string | null
          approved_by: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['asset_disposals']['Row']> & {
          asset_id: string
          disposal_type: 'rusak_berat' | 'hibah' | 'pemusnahan'
          disposal_date: string
          reason: string
        }
        Update: Partial<Database['public']['Tables']['asset_disposals']['Row']>
      }
      inventory_checks: {
        Row: {
          id: string
          asset_id: string
          checked_by: string
          check_date: string
          location_matched: boolean
          condition_found: 'baik' | 'rusak_ringan' | 'rusak_berat'
          notes: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['inventory_checks']['Row']> & {
          asset_id: string
          checked_by: string
          check_date: string
          condition_found: 'baik' | 'rusak_ringan' | 'rusak_berat'
        }
        Update: Partial<Database['public']['Tables']['inventory_checks']['Row']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          user_id: string
          title: string
          message: string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['activity_logs']['Row']> & {
          action: string
          entity_type: string
        }
        Update: Partial<Database['public']['Tables']['activity_logs']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
