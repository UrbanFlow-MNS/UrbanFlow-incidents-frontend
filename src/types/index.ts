export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Category {
  id: number
  name: string
  isActive: boolean
}

export interface Site {
  id: number
  name: string
  address: string
  city: string
  zipcode: string
  latitude: number
  longitude: number
  contactName?: string
  contactPhone?: string
  createdAt: string
  updatedAt: string
}

export interface Incident {
  id: number
  code: string
  name: string
  title: string
  description: string
  estimateDuration: number
  status: IncidentStatus
  priority: IncidentPriority
  createdAt: string
  updatedAt: string
  resolutionDate?: string
  siteId: number
  site?: Site
  categoryId: number
  category?: Category
  createdBy: number
}

export interface CreateIncidentDto {
  code: string
  name: string
  title: string
  description: string
  estimateDuration: number
  siteId: number
  categoryId: number
  status: IncidentStatus
  priority: IncidentPriority
  createdBy: number
}

export type UpdateIncidentDto = Partial<CreateIncidentDto>

export interface CreateSiteDto {
  name: string
  address: string
  city: string
  zipcode: string
  latitude: number
  longitude: number
  contactName?: string
  contactPhone?: string
}
