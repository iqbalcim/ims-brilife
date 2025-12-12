import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Polis', href: '/policies', icon: FileText },
  { title: 'Tertanggung', href: '/insured-persons', icon: Users },
  { title: 'Pembayaran', href: '/premium-payments', icon: CreditCard },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className={cn('relative flex flex-col border-r bg-card transition-all duration-300', isCollapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          {!isCollapsed && <span className="text-lg font-bold">BRI Life IMS</span>}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : 'text-muted-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Toggle */}
      <div className="p-2">
        <Button variant="ghost" size="sm" onClick={onToggle} className={cn('w-full', isCollapsed && 'px-2')}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="mr-2 h-4 w-4" /><span>Tutup</span></>}
        </Button>
      </div>
    </aside>
  )
}
