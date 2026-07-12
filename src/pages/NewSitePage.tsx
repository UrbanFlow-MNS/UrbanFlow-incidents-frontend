import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { forwardGeocode, reverseGeocode } from '@/lib/geocode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const markerIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const DEFAULT_CENTER: [number, number] = [49.1196964, 6.1763552]

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  )
}

function LocationPicker({ position, onPick }: { position: [number, number]; onPick: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng])
    },
  })
  return <Marker position={position} icon={markerIcon} />
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])
  return null
}

export default function NewSitePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState<[number, number]>(DEFAULT_CENTER)
  const skipGeocode = useRef(false)

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    zipcode: '',
    contactName: '',
    contactPhone: '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleMapPick(pos: [number, number]) {
    setPosition(pos)
    const result = await reverseGeocode(pos[0], pos[1])
    if (result) {
      skipGeocode.current = true
      setForm(f => ({
        ...f,
        address: result.address || f.address,
        city: result.city || f.city,
        zipcode: result.zipcode || f.zipcode,
      }))
    }
  }

  useEffect(() => {
    if (skipGeocode.current) {
      skipGeocode.current = false
      return
    }
    if (!form.address || !form.city) return

    const timeout = setTimeout(async () => {
      setIsGeocoding(true)
      const result = await forwardGeocode(`${form.address}, ${form.zipcode} ${form.city}`)
      if (result) setPosition(result)
      setIsGeocoding(false)
    }, 900)

    return () => clearTimeout(timeout)
  }, [form.address, form.city, form.zipcode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await apiClient.sites.create({
        name: form.name,
        address: form.address,
        city: form.city,
        zipcode: form.zipcode,
        latitude: position[0],
        longitude: position[1],
        contactName: form.contactName || undefined,
        contactPhone: form.contactPhone || undefined,
      })
      navigate('/sites')
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
          onClick={() => navigate('/sites')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nouveau site</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Clique sur la carte pour placer le site</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card px-5 py-7 sm:px-8 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel required>Nom</FieldLabel>
            <Input
              placeholder="Dépôt Toulon Centre"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel required>Adresse</FieldLabel>
            <Input
              placeholder="12 Avenue de la République"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel required>Ville</FieldLabel>
            <Input
              placeholder="Toulon"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel required>Code postal</FieldLabel>
            <Input
              placeholder="83000"
              value={form.zipcode}
              onChange={e => set('zipcode', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>Contact</FieldLabel>
            <Input
              placeholder="Marc Dubois"
              value={form.contactName}
              onChange={e => set('contactName', e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Téléphone</FieldLabel>
            <Input
              placeholder="0494123456"
              value={form.contactPhone}
              onChange={e => set('contactPhone', e.target.value)}
            />
          </div>
        </div>

        <div>
          <FieldLabel required>Position</FieldLabel>
          <div className="h-72 w-full overflow-hidden rounded-xl border border-input">
            <MapContainer center={DEFAULT_CENTER} zoom={12} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker position={position} onPick={handleMapPick} />
              <RecenterMap position={position} />
            </MapContainer>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {isGeocoding ? 'Recherche de l\'adresse…' : `${position[0].toFixed(5)}, ${position[1].toFixed(5)}`}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/sites')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Création…</> : 'Créer le site'}
          </Button>
        </div>
      </form>
    </div>
  )
}
