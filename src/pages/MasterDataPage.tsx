import * as Tabs from '@radix-ui/react-tabs'
import { Database, Tag, DoorOpen, Building2, Truck } from 'lucide-react'
import { CrudTable } from '@/components/master/CrudTable'
import { FormField } from '@/components/shared/FormField'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn } from '@/lib/utils'
import type { AssetCategory, Bidang, Room, Supplier } from '@/types'

const tabs = [
  { value: 'kategori', label: 'Kategori Aset', icon: Tag },
  { value: 'ruangan', label: 'Ruangan', icon: DoorOpen },
  { value: 'bidang', label: 'Bidang', icon: Building2 },
  { value: 'supplier', label: 'Supplier / Vendor', icon: Truck },
]

export default function MasterDataPage() {
  return (
    <div>
      <PageHeader
        title="Master Data"
        description="Kelola data referensi yang dipakai di seluruh modul aset"
        icon={Database}
        crumbs={[{ label: 'Master Data' }]}
      />

      <Tabs.Root defaultValue="kategori">
        <Tabs.List
          className="mb-4 flex flex-wrap gap-1.5 rounded-2xl border p-1.5 backdrop-blur-xl"
          style={{ background: 'var(--surface)', borderColor: 'var(--surface-border)' }}
        >
          {tabs.map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} asChild>
              <button
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200',
                  'data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue data-[state=active]:to-brand-indigo data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-brand-indigo/25',
                  'data-[state=inactive]:hover:bg-white/[0.06]'
                )}
                style={{ color: 'var(--text-muted)' }}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="kategori" className="eams-fade-in">
          <CrudTable<AssetCategory>
            tableName="asset_categories"
            title="Kategori Aset"
            description="Contoh: Elektronik, Furnitur, Kendaraan, Peralatan Kantor"
            columns={[
              { key: 'code', label: 'Kode' },
              { key: 'name', label: 'Nama Kategori' },
              { key: 'description', label: 'Keterangan' },
            ]}
            emptyForm={{ code: '', name: '', description: '' }}
            renderForm={(value, setValue) => (
              <>
                <FormField label="Kode Kategori" value={value.code ?? ''} onChange={(e) => setValue({ ...value, code: e.target.value.toUpperCase() })} placeholder="Contoh: ELK" required />
                <FormField label="Nama Kategori" value={value.name ?? ''} onChange={(e) => setValue({ ...value, name: e.target.value })} required />
                <FormField label="Keterangan" value={value.description ?? ''} onChange={(e) => setValue({ ...value, description: e.target.value })} />
              </>
            )}
          />
        </Tabs.Content>

        <Tabs.Content value="ruangan" className="eams-fade-in">
          <CrudTable<Room>
            tableName="rooms"
            title="Ruangan"
            description="Lokasi fisik penempatan aset"
            columns={[
              { key: 'name', label: 'Nama Ruangan' },
              { key: 'building', label: 'Gedung' },
              { key: 'floor', label: 'Lantai' },
            ]}
            emptyForm={{ name: '', building: '', floor: '' }}
            renderForm={(value, setValue) => (
              <>
                <FormField label="Nama Ruangan" value={value.name ?? ''} onChange={(e) => setValue({ ...value, name: e.target.value })} required />
                <FormField label="Gedung" value={value.building ?? ''} onChange={(e) => setValue({ ...value, building: e.target.value })} />
                <FormField label="Lantai" value={value.floor ?? ''} onChange={(e) => setValue({ ...value, floor: e.target.value })} />
              </>
            )}
          />
        </Tabs.Content>

        <Tabs.Content value="bidang" className="eams-fade-in">
          <CrudTable<Bidang>
            tableName="bidang"
            title="Bidang"
            description="Unit kerja di lingkungan Inspektorat"
            columns={[
              { key: 'name', label: 'Nama Bidang' },
              { key: 'head_name', label: 'Kepala Bidang' },
            ]}
            emptyForm={{ name: '', head_name: '' }}
            renderForm={(value, setValue) => (
              <>
                <FormField label="Nama Bidang" value={value.name ?? ''} onChange={(e) => setValue({ ...value, name: e.target.value })} required />
                <FormField label="Kepala Bidang" value={value.head_name ?? ''} onChange={(e) => setValue({ ...value, head_name: e.target.value })} />
              </>
            )}
          />
        </Tabs.Content>

        <Tabs.Content value="supplier" className="eams-fade-in">
          <CrudTable<Supplier>
            tableName="suppliers"
            title="Supplier / Vendor"
            description="Pemasok barang dan vendor jasa pemeliharaan"
            columns={[
              { key: 'name', label: 'Nama' },
              { key: 'contact_person', label: 'Kontak' },
              { key: 'phone', label: 'Telepon' },
            ]}
            emptyForm={{ name: '', contact_person: '', phone: '', address: '' }}
            renderForm={(value, setValue) => (
              <>
                <FormField label="Nama Supplier" value={value.name ?? ''} onChange={(e) => setValue({ ...value, name: e.target.value })} required />
                <FormField label="Nama Kontak" value={value.contact_person ?? ''} onChange={(e) => setValue({ ...value, contact_person: e.target.value })} />
                <FormField label="Telepon" value={value.phone ?? ''} onChange={(e) => setValue({ ...value, phone: e.target.value })} />
                <FormField label="Alamat" value={value.address ?? ''} onChange={(e) => setValue({ ...value, address: e.target.value })} />
              </>
            )}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
