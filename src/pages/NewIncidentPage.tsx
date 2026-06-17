import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { apiClient, getCurrentUserId } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Category, Site, IncidentStatus, IncidentPriority } from '@/types'

interface FormState {
  code: string
  name: string
  title: string
  description: string
  estimateDuration: string
  siteId: string
  categoryId: string
  status: IncidentStatus
  priority: IncidentPriority
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  )
}

export default function NewIncidentPage() {
  const navigate = useNavigate()
  const userId = getCurrentUserId()
  const [categories, setCategories] = useState<Category[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    code: '',
    name: '',
    title: '',
    description: '',
    estimateDuration: '',
    siteId: '',
    categoryId: '',
    status: 'OPEN',
    priority: 'MEDIUM',
  })

  useEffect(() => {
    Promise.all([apiClient.categories.findAll(), apiClient.sites.findAll()])
      .then(([cats, sites]) => {
        setCategories(cats)
        setSites(sites)
      })
      .catch(() => {})
  }, [])

  function set(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const duration = parseInt(form.estimateDuration, 10)
    if (isNaN(duration) || duration <= 0) {
      setError('La durée estimée doit être un nombre positif.')
      return
    }

    setIsSubmitting(true)
    try {
      const incident = await apiClient.incidents.create({
        code: form.code,
        name: form.name,
        title: form.title,
        description: form.description,
        estimateDuration: duration,
        siteId: parseInt(form.siteId, 10),
        categoryId: parseInt(form.categoryId, 10),
        status: form.status,
        priority: form.priority,
        createdBy: userId!,
      })
      navigate(`/incidents/${incident.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nouvel incident</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Remplissez les informations pour créer un incident</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card px-8 py-7 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <FieldLabel required>Code</FieldLabel>
            <Input
              placeholder="INC-001"
              value={form.code}
              onChange={e => set('code', e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel required>Nom</FieldLabel>
            <Input
              placeholder="Panne réseau ligne 5"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <FieldLabel required>Titre</FieldLabel>
          <Input
            placeholder="Description courte de l'incident"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
          />
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            placeholder="Détails supplémentaires…"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            className="flex w-full rounded-xl border border-input bg-[hsl(0_0%_98%)] px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <FieldLabel required>Site</FieldLabel>
            <Select
              value={form.siteId}
              onChange={e => set('siteId', e.target.value)}
              required
            >
              <option value="">Sélectionner un site</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel required>Catégorie</FieldLabel>
            <Select
              value={form.categoryId}
              onChange={e => set('categoryId', e.target.value)}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div>
            <FieldLabel required>Priorité</FieldLabel>
            <Select value={form.priority} onChange={e => set('priority', e.target.value as IncidentPriority)}>
              <option value="LOW">Faible</option>
              <option value="MEDIUM">Moyen</option>
              <option value="HIGH">Élevé</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </div>
          <div>
            <FieldLabel required>Statut initial</FieldLabel>
            <Select value={form.status} onChange={e => set('status', e.target.value as IncidentStatus)}>
              <option value="OPEN">Ouvert</option>
              <option value="IN_PROGRESS">En cours</option>
            </Select>
          </div>
          <div>
            <FieldLabel required>Durée estimée (min)</FieldLabel>
            <Input
              type="number"
              min={1}
              placeholder="60"
              value={form.estimateDuration}
              onChange={e => set('estimateDuration', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/incidents')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Création…</> : 'Créer l\'incident'}
          </Button>
        </div>
      </form>
    </div>
  )
}
