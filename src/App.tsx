import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Bientôt disponible.</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PlaceholderPage title="Dashboard" />} />
        <Route path="incidents" element={<PlaceholderPage title="Incidents" />} />
        <Route path="incidents/new" element={<PlaceholderPage title="Nouvel incident" />} />
      </Route>
    </Routes>
  )
}

export default App
