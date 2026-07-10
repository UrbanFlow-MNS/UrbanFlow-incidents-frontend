import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import DashboardPage from '@/pages/DashboardPage'
import IncidentsPage from '@/pages/IncidentsPage'
import NewIncidentPage from '@/pages/NewIncidentPage'
import IncidentDetailPage from '@/pages/IncidentDetailPage'
import SitesPage from '@/pages/SitesPage'
import NewSitePage from '@/pages/NewSitePage'

function App() {
  return (
    <AuthGuard>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="incidents/new" element={<NewIncidentPage />} />
          <Route path="incidents/:id" element={<IncidentDetailPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="sites/new" element={<NewSitePage />} />
        </Route>
      </Routes>
    </AuthGuard>
  )
}

export default App
