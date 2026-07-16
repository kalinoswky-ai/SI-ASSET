import * as Tabs from '@radix-ui/react-tabs'
import { CrudTable } from '@/components/master/CrudTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AssetCategory, Bidang, Room, Supplier } from '@/types'

const tabTriggerClass = (active: boolean) =>
  cn(
    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
  )

export default function MasterDataPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Master Data</h1>
        <p className="text-muted-foreground text-sm">Kelola data referensi yang dipakai di seluruh modul aset</p>
      </div>

      <Tabs.Root defaultValue="kategori">
        <Tabs.List className="flex flex-wrap gap-2 border-b pb-3 mb-4">
          {[
            { value: 'kategori', label: 'Kategori Aset' },
            { value: 'ruangan', label: 'Ruangan' },
            { value: 'bidang', label: 'Bidang' },
            { value: 'supplier', label: 'Supplier / Vendor' },
          ].map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} asChild>
              <button className={tabTriggerClass(false)}>{t.label}</button>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="kategori">
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
                <div className="space-y-1.5">
                  <Label>Kode Kategori</Label>
                  <Input value={value.code ?? ''} onChange={(e) => setValue({ ...value, code: e.target.value.toUpperCase() })} placeholder="Contoh: ELK" />
                </div>
                <div className="space-y-1.5">
                  <Label>Nama Kategori</Label>
                  <Input value={value.name ?? ''} onChange={(e) => setValue({ ...value, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Keterangan</Label>
                  <Input value={value.description ?? ''} onChange={(e) => setValue({ ...value, description: e.target.value })} />
                </div>
              </>
            )}
          />
        </Tabs.Content>

        <Tabs.Content value="ruangan">
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
                <div className="space-y-1.5">
                  <Label>Nama Ruangan</Label>
                  <Input value={value.name ?? ''} onChange={(e) => setValue({ ...value, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Gedung</Label>
                  <Input value={value.building ?? ''} onChange={(e) => setValue({ ...value, building: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Lantai</Label>
                  <Input value={value.floor ?? ''} onChange={(e) => setValue({ ...value, floor: e.target.value })} />
                </div>
              </>
            )}
          />
        </Tabs.Content>

        <Tabs.Content value="bidang">
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
                <div className="space-y-1.5">
                  <Label>Nama Bidang</Label>
                  <Input value={value.name ?? ''} onChange={(e) => setValue({ ...value, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Kepala Bidang</Label>
                  <Input value={value.head_name ?? ''} onChange={(e) => setValue({ ...value, head_name: e.target.value })} />
                </div>
              </>
            )}
          />
        </Tabs.Content>

        <Tabs.Content value="supplier">
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
                <div className="space-y-1.5">
                  <Label>Nama Supplier</Label>
                  <Input value={value.name ?? ''} onChange={(e) => setValue({ ...value, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nama Kontak</Label>
                  <Input value={value.contact_person ?? ''} onChange={(e) => setValue({ ...value, contact_person: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Telepon</Label>
                  <Input value={value.phone ?? ''} onChange={(e) => setValue({ ...value, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Alamat</Label>
                  <Input value={value.address ?? ''} onChange={(e) => setValue({ ...value, address: e.target.value })} />
                </div>
              </>
            )}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
