import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import DashboardPage from '@/pages/DashboardPage'

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function App() {
  return (
    <AuthGuard>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="incidents" element={<PlaceholderPage title="Incidents" description="La liste des incidents, avec des filtres et tout" />} />
        <Route path="incidents/new" element={<PlaceholderPage title="Nouvel incident" description="Le formulaire pour créer un incident, à faire" />} />
      </Route>
    </Routes>
    </AuthGuard>
  )
}

export default App
