import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/apiClient'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import type { Incident } from '@/types'

interface StatCardProps {
  label: string
  count: number
  icon: React.ReactNode
  colorClass: string
}

function StatCard({ label, count, icon, colorClass }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5 flex items-center gap-4">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', colorClass)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient.incidents.findAll()
      .then(setIncidents)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    OPEN:        incidents.filter(i => i.status === 'OPEN').length,
    IN_PROGRESS: incidents.filter(i => i.status === 'IN_PROGRESS').length,
    RESOLVED:    incidents.filter(i => i.status === 'RESOLVED').length,
    CLOSED:      incidents.filter(i => i.status === 'CLOSED').length,
  }

  const recent = [...incidents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vue d'ensemble de tous les incidents</p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Ouverts"   count={counts.OPEN}        icon={<AlertTriangle size={20} className="text-blue-600" />}    colorClass="bg-blue-50" />
        <StatCard label="En cours"  count={counts.IN_PROGRESS} icon={<Clock size={20} className="text-orange-600" />}          colorClass="bg-orange-50" />
        <StatCard label="Résolus"   count={counts.RESOLVED}    icon={<CheckCircle2 size={20} className="text-green-600" />}    colorClass="bg-green-50" />
        <StatCard label="Fermés"    count={counts.CLOSED}      icon={<XCircle size={20} className="text-neutral-400" />}       colorClass="bg-neutral-100" />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Incidents récents</h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-muted-foreground text-center">Chargement…</div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground text-center">Aucun incident pour l'instant.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Créé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map(incident => (
                <tr
                  key={incident.id}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  className="cursor-pointer hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{incident.code}</td>
                  <td className="px-6 py-3 font-medium text-foreground">{incident.title}</td>
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
