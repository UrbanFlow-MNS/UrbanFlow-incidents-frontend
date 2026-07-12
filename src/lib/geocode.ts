// Nominatim (OpenStreetMap) - gratuit, pas de clé API nécessaire
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

export interface ReverseGeocodeResult {
  address: string
  city: string
  zipcode: string
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  const res = await fetch(`${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lon}`)
  if (!res.ok) return null
  const data = await res.json()
  const a = data.address ?? {}
  return {
    address: [a.house_number, a.road].filter(Boolean).join(' '),
    city: a.city || a.town || a.village || a.municipality || '',
    zipcode: a.postcode || '',
  }
}

export async function forwardGeocode(query: string): Promise<[number, number] | null> {
  const res = await fetch(`${NOMINATIM_URL}/search?format=json&limit=1&q=${encodeURIComponent(query)}`)
  if (!res.ok) return null
  const data = await res.json()
  if (!data[0]) return null
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
}
