import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { can } from '@/lib/permissions'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Category, Incident, IncidentStatus, IncidentPriority, Site, TripRoute } from '@/types'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1.5">{children}</label>
  )
}

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const canEdit = can.editIncident()

  const [incident, setIncident] = useState<Incident | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [routes, setRoutes] = useState<TripRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    estimateDuration: '',
    siteId: '',
    categoryId: '',
    status: '' as IncidentStatus,
    priority: '' as IncidentPriority,
    affectedRouteIds: [] as number[],
  })

  useEffect(() => {
    if (!id) return
    Promise.all([
      apiClient.incidents.findOne(parseInt(id, 10)),
      apiClient.categories.findAll(),
      apiClient.sites.findAll(),
      apiClient.routes.findAll(),
    ])
      .then(([inc, cats, s, r]) => {
        setIncident(inc)
        setCategories(cats)
        setSites(s)
        setRoutes(r)
        setForm({
          title: inc.title,
          description: inc.description,
          estimateDuration: String(inc.estimateDuration),
          siteId: String(inc.siteId),
          categoryId: String(inc.categoryId),
          status: inc.status,
          priority: inc.priority,
          affectedRouteIds: inc.affectedRouteIds ?? [],
        })
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function set(field: keyof Omit<typeof form, 'affectedRouteIds'>, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setSuccess(false)
  }

  function toggleRoute(routeId: number) {
    setForm(f => ({
      ...f,
      affectedRouteIds: f.affectedRouteIds.includes(routeId)
        ? f.affectedRouteIds.filter(id => id !== routeId)
        : [...f.affectedRouteIds, routeId],
    }))
    setSuccess(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSaving(true)
    try {
      const updated = await apiClient.incidents.update(parseInt(id!, 10), {
        title: form.title,
        description: form.description,
        estimateDuration: parseInt(form.estimateDuration, 10),
        siteId: parseInt(form.siteId, 10),
        categoryId: parseInt(form.categoryId, 10),
        status: form.status,
        priority: form.priority,
        affectedRouteIds: form.affectedRouteIds,
      })
      setIncident(updated)
      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cet incident définitivement ?')) return
    setIsDeleting(true)
    try {
      await apiClient.incidents.remove(parseInt(id!, 10))
      navigate('/incidents')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={15} className="animate-spin" /> Chargement…
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-destructive">{error ?? 'Incident introuvable.'}</div>
        <Button variant="outline" onClick={() => navigate('/incidents')}>Retour</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/incidents')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground truncate">{incident.title}</h1>
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground font-mono">{incident.code}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
          Modifications enregistrées.
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card px-5 py-7 sm:px-8 space-y-5">
        <div>
          <FieldLabel>Titre</FieldLabel>
          <Input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            disabled={!canEdit}
            required
          />
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            disabled={!canEdit}
            className="flex w-full rounded-xl border border-input bg-[hsl(0_0%_98%)] px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 resize-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>Site</FieldLabel>
            <Select value={form.siteId} onChange={e => set('siteId', e.target.value)} disabled={!canEdit}>
              <option value="">Sélectionner un site</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel>Catégorie</FieldLabel>
            <Select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} disabled={!canEdit}>
              <option value="">Sélectionner une catégorie</option>
              {categories.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <FieldLabel>Priorité</FieldLabel>
            <Select value={form.priority} onChange={e => set('priority', e.target.value as IncidentPriority)} disabled={!canEdit}>
              <option value="LOW">Faible</option>
              <option value="MEDIUM">Moyen</option>
              <option value="HIGH">Élevé</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </div>
          <div>
            <FieldLabel>Statut</FieldLabel>
            <Select value={form.status} onChange={e => set('status', e.target.value as IncidentStatus)} disabled={!canEdit}>
              <option value="OPEN">Ouvert</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="RESOLVED">Résolu</option>
              <option value="CLOSED">Fermé</option>
            </Select>
          </div>
          <div>
            <FieldLabel>Durée estimée (min)</FieldLabel>
            <Input
              type="number"
              min={1}
              value={form.estimateDuration}
              onChange={e => set('estimateDuration', e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Lignes affectées</FieldLabel>
          {routes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune ligne disponible.</p>
          ) : (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-input bg-[hsl(0_0%_98%)] p-3 space-y-2">
              {routes.map(route => (
                <label key={route.routeId} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.affectedRouteIds.includes(route.routeId)}
                    onChange={() => toggleRoute(route.routeId)}
                    disabled={!canEdit}
                    className="rounded border-input"
                  />
                  {route.routeShortName ? `${route.routeShortName} — ` : ''}
                  {route.routeLongName ?? `Ligne #${route.routeId}`}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          {can.deleteIncident() ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="text-destructive hover:text-destructive hover:bg-destructive/8 gap-2"
            >
              {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Supprimer
            </Button>
          ) : <span />}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/incidents')}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              {canEdit ? 'Annuler' : 'Retour'}
            </Button>
            {canEdit && (
              <Button type="submit" disabled={isSaving || isDeleting} className="flex-1 sm:flex-none">
                {isSaving ? <><Loader2 size={15} className="animate-spin" /> Enregistrement…</> : 'Enregistrer'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
