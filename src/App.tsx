import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import MasterDataPage from '@/pages/MasterDataPage'
import AssetsPage from '@/pages/AssetsPage'
import InventarisasiPage from '@/pages/InventarisasiPage'
import PeminjamanPage from '@/pages/PeminjamanPage'
import PemeliharaanPage from '@/pages/PemeliharaanPage'
import MutasiPage from '@/pages/MutasiPage'
import PenghapusanPage from '@/pages/PenghapusanPage'
import LaporanPage from '@/pages/LaporanPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="master-data" element={<MasterDataPage />} />
        <Route path="aset" element={<AssetsPage />} />
        <Route path="inventarisasi" element={<InventarisasiPage />} />
        <Route path="peminjaman" element={<PeminjamanPage />} />
        <Route path="pemeliharaan" element={<PemeliharaanPage />} />
        <Route path="mutasi" element={<MutasiPage />} />
        <Route path="penghapusan" element={<PenghapusanPage />} />
        <Route path="laporan" element={<LaporanPage />} />
      </Route>
    </Routes>
  )
}
