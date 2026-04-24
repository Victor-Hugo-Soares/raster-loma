import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function AppShell() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
