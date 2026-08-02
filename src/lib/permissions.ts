import { getCurrentUserRole } from '@/lib/apiClient'
import type { UserRole } from '@/types'

const WRITE_ROLES: UserRole[] = [
  'TECHNICIAN',
  'ADMIN_TECHNICIAN',
  'USER_CITY',
  'ADMIN_USER_CITY',
  'SUPERADMIN',
]

const DELETE_ROLES: UserRole[] = ['ADMIN_TECHNICIAN', 'ADMIN_USER_CITY', 'SUPERADMIN']

function hasRole(allowed: UserRole[]) {
  const role = getCurrentUserRole()
  if (!role) return true
  return allowed.includes(role)
}

export const can = {
  createIncident: () => hasRole(WRITE_ROLES),
  editIncident: () => hasRole(WRITE_ROLES),
  deleteIncident: () => hasRole(DELETE_ROLES),
  manageSites: () => hasRole(WRITE_ROLES),
}
