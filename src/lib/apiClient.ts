const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:5173'

export function getCurrentUserId(): number | null {
  const token = localStorage.getItem('uf_token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { sub: number; exp?: number }
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload.sub
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('uf_token')
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    if (import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true') {
      throw new Error('Unauthorized')
    }
    const redirect = encodeURIComponent(window.location.href)
    window.location.href = `${AUTH_URL}/login?app=incident&redirect=${redirect}`
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  incidents: {
    findAll: () => request<import('@/types').Incident[]>('/incidents'),
    findOne: (id: number) => request<import('@/types').Incident>(`/incidents/${id}`),
    create: (dto: import('@/types').CreateIncidentDto) =>
      request<import('@/types').Incident>('/incidents', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    update: (id: number, dto: import('@/types').UpdateIncidentDto) =>
      request<import('@/types').Incident>(`/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
    remove: (id: number) =>
      request<void>(`/incidents/${id}`, { method: 'DELETE' }),
  },
  categories: {
    findAll: () => request<import('@/types').Category[]>('/categories'),
  },
  sites: {
    findAll: () => request<import('@/types').Site[]>('/sites'),
    create: (dto: import('@/types').CreateSiteDto) =>
      request<import('@/types').Site>('/sites', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
  },
  routes: {
    findAll: () => request<import('@/types').TripRoute[]>('/routes/all'),
  },
}
