import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Incident, IncidentStatus, IncidentPriority } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function IncidentsPage() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<IncidentPriority | ''>('')

  useEffect(() => {
    
    apiClient.incidents.findAll()
      .then(setIncidents)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = incidents.filter(incident => {
    if (statusFilter && incident.status !== statusFilter) return false
    if (priorityFilter && incident.priority !== priorityFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        incident.code.toLowerCase().includes(q) ||
        incident.title.toLowerCase().includes(q) ||
        incident.name.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incidents</h1>
          <p className="mt-1 text-sm text-muted-foreground">{incidents.length} incident{incidents.length !== 1 ? 's' : ''} au total</p>
        </div>
        <Button onClick={() => navigate('/incidents/new')} className="gap-2">
          <Plus size={16} />
          Nouvel incident
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as IncidentStatus | '')}
          className="w-40"
        >
          <option value="">Tous les statuts</option>
          <option value="OPEN">Ouvert</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="RESOLVED">Résolu</option>
          <option value="CLOSED">Fermé</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as IncidentPriority | '')}
          className="w-40"
        >
          <option value="">Toutes priorités</option>
          <option value="LOW">Faible</option>
          <option value="MEDIUM">Moyen</option>
          <option value="HIGH">Élevé</option>
          <option value="URGENT">Urgent</option>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-sm text-muted-foreground text-center">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-sm text-muted-foreground text-center">
            {incidents.length === 0 ? 'Aucun incident pour l\'instant.' : 'Aucun résultat pour ces filtres.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Créé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(incident => (
                <tr
                  key={incident.id}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  className="cursor-pointer hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{incident.code}</td>
                  <td className="px-6 py-3 font-medium text-foreground">{incident.title}</td>
                  <td className="px-6 py-3 text-muted-foreground">{incident.category?.name ?? '—'}</td>
                  <td className="px-6 py-3 text-muted-foreground">{incident.site?.name ?? '—'}</td>
                  <td className="px-6 py-3"><PriorityBadge priority={incident.priority} /></td>
                  <td className="px-6 py-3"><StatusBadge status={incident.status} /></td>
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(incident.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
