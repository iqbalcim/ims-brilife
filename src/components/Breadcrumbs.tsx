import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Route label mapping
const routeLabels: Record<string, string> = {
  policies: 'Polis',
  'insured-persons': 'Tertanggung',
  'premium-payments': 'Pembayaran Premi',
  agents: 'Agen',
  beneficiaries: 'Penerima Manfaat',
  new: 'Baru',
  edit: 'Edit',
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation()

  // Auto-generate breadcrumbs from path if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbs(location.pathname)

  if (breadcrumbItems.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}
    >
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4" />
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // Skip IDs in the path (they look like POL-001, INS-001, etc.)
    const isId = /^[A-Z]{2,}-\d+$/.test(segment) || segment.length > 20

    if (isId) {
      // For IDs, show a shortened version or "Detail"
      items.push({
        label: 'Detail',
        href: currentPath,
      })
    } else {
      items.push({
        label: routeLabels[segment] || capitalize(segment),
        href: currentPath,
      })
    }
  }

  return items
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
