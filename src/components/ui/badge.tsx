import { cn } from '@/lib/utils'
import type { IncidentStatus, IncidentPriority } from '@/types'

const statusConfig: Record<IncidentStatus, { label: string; className: string }> = {
  OPEN:        { label: 'Ouvert',       className: 'bg-blue-50 text-blue-600 border-blue-100' },
  IN_PROGRESS: { label: 'En cours',     className: 'bg-orange-50 text-orange-600 border-orange-100' },
  RESOLVED:    { label: 'Résolu',       className: 'bg-green-50 text-green-600 border-green-100' },
  CLOSED:      { label: 'Fermé',        className: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
}

const priorityConfig: Record<IncidentPriority, { label: string; className: string }> = {
  LOW:    { label: 'Faible',   className: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
  MEDIUM: { label: 'Moyen',   className: 'bg-blue-50 text-blue-600 border-blue-100' },
  HIGH:   { label: 'Élevé',   className: 'bg-orange-50 text-orange-600 border-orange-100' },
  URGENT: { label: 'Urgent',  className: 'bg-red-50 text-red-600 border-red-100' },
}

interface StatusBadgeProps {
  status: IncidentStatus
  className?: string
}

interface PriorityBadgeProps {
  priority: IncidentPriority
  className?: string
}

function badgeBase(className?: string) {
  return cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
    className
  )
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={badgeBase(cn(config.className, className))}>
      {config.label}
    </span>
  )
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <span className={badgeBase(cn(config.className, className))}>
      {config.label}
    </span>
  )
}
