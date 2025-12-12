import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks'

export function MainLayout() {
  // Use custom hook for persistent sidebar state
  const [isCollapsed, setIsCollapsed] = useLocalStorage('brilife_sidebar_collapsed', false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar isCollapsed={false} onToggle={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          showMenuButton
          onMenuClick={() => setIsMobileOpen(true)}
        />
        <main
          className={cn(
            'flex-1 overflow-auto p-4 md:p-6',
            'bg-gray-50'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
