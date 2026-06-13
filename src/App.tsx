import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

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
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PlaceholderPage title="Dashboard" description="La page d'accueil, on verra les stats et les incidents récents ici" />} />
        <Route path="incidents" element={<PlaceholderPage title="Incidents" description="La liste des incidents, avec des filtres et tout" />} />
        <Route path="incidents/new" element={<PlaceholderPage title="Nouvel incident" description="Le formulaire pour créer un incident, à faire" />} />
      </Route>
    </Routes>
  )
}

export default App
