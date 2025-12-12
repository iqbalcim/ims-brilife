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
  UserCog,
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
  { title: 'Agen', href: '/agents', icon: UserCog },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className={cn('relative flex h-full flex-col border-r bg-card transition-all duration-300', isCollapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4 bg-gray-50/50 backdrop-blur-sm">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg p-1.5 shadow-md">
            <Shield className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              BRI Life IMS
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1.5 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
                  'hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm',
                  isActive 
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:text-white' 
                    : 'text-gray-500',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0 transition-colors", !isActive && "text-gray-400 group-hover:text-blue-600")} />
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
