import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Incident, Site } from '@/types'

export default function SitesPage() {
  const navigate = useNavigate()
  const [sites, setSites] = useState<Site[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([apiClient.sites.findAll(), apiClient.incidents.findAll()])
      .then(([sites, incidents]) => {
        setSites(sites)
        setIncidents(incidents)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const incidentCountBySite = incidents.reduce<Record<number, number>>((acc, incident) => {
    acc[incident.siteId] = (acc[incident.siteId] ?? 0) + 1
    return acc
  }, {})

  const filtered = sites.filter(site => {
    if (!search) return true
    const q = search.toLowerCase()
    return site.name.toLowerCase().includes(q) || site.city.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sites</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sites.length} site{sites.length !== 1 ? 's' : ''} au total</p>
        </div>
        <Button onClick={() => navigate('/sites/new')} className="gap-2">
          <Plus size={16} />
          Nouveau site
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-sm text-muted-foreground text-center">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-sm text-muted-foreground text-center">
            {sites.length === 0 ? 'Aucun site pour l\'instant.' : 'Aucun résultat pour cette recherche.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Adresse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Incidents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(site => {
                  const count = incidentCountBySite[site.id] ?? 0
                  return (
                    <tr key={site.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-6 py-3 font-medium text-foreground">{site.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{site.address}</td>
                      <td className="px-6 py-3 text-muted-foreground">{site.city}</td>
                      <td className="px-6 py-3 text-muted-foreground">{site.contactName ?? '—'}</td>
                      <td className="px-6 py-3">
                        <span className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          count > 0
                            ? 'bg-orange-50 text-orange-600 border-orange-100'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                        )}>
                          {count}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
