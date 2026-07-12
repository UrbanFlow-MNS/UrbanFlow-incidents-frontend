import { NavLink } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle, PlusCircle, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.png'

const nav = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/incidents',     icon: AlertTriangle,   label: 'Incidents' },
  { to: '/incidents/new', icon: PlusCircle,      label: 'Nouvel incident' },
  { to: '/sites',         icon: MapPin,          label: 'Sites' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: Props) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-card px-3 py-5 transition-transform duration-200 md:relative md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="mb-8 flex items-center gap-2 px-2">
        <img src={logo} alt="UrbanFlow" className="h-7 w-auto rounded-lg" />
        <span className="text-sm font-semibold">Incidents</span>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
