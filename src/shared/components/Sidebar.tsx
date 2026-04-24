import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Wrench,
  Users,
  DollarSign,
  Bell,
  LogOut,
  Cpu,
} from 'lucide-react'
import Logo from './Logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/shared/hooks/useAuth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotificacoesNaoLidas } from '@/features/notificacoes/hooks/useNotificacoes'
import { toast } from 'sonner'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/instalacoes', icon: Wrench, label: 'Serviços' },
  { to: '/tecnicos', icon: Users, label: 'Técnicos' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/alertas', icon: Bell, label: 'Alertas' },
] as const

export default function Sidebar() {
  const { perfil, signOut } = useAuth()
  const navigate = useNavigate()
  const { count: alertCount } = useNotificacoesNaoLidas()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch {
      toast.error('Erro ao sair')
    }
  }

  const initials = perfil?.nome
    ? perfil.nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="sidebar-bg flex h-full w-[260px] shrink-0 flex-col">
      {/* Logo */}
      <div className="px-5 py-5">
        <Logo />
      </div>

      <div className="mx-4 mb-3 h-px bg-border/50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-0.5 py-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-sm bg-primary" />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'group-hover:text-foreground'
                    )}
                    strokeWidth={1.5}
                  />
                  <span
                    className="font-medium tracking-wide"
                    style={{ fontFamily: 'Libre Franklin, system-ui, sans-serif' }}
                  >
                    {label}
                  </span>
                  {label === 'Alertas' && alertCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-sm bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
                      style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
                    >
                      {alertCount > 99 ? '99+' : alertCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-1 my-3 h-px bg-border/50" />

        <nav className="flex flex-col gap-0.5 pb-2">
          <NavLink
            to="/equipamentos"
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-sm bg-primary" />
                )}
                <Cpu className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span className="font-medium tracking-wide">Equipamentos</span>
              </>
            )}
          </NavLink>
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="mx-4 mb-3 h-px bg-border/50" />
      <div className="flex items-center gap-2 px-3 pb-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-accent text-xs font-semibold text-foreground"
          style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {perfil?.nome ?? 'Usuário'}
          </p>
          <p className="truncate text-[10px] capitalize text-muted-foreground"
            style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
          >
            {perfil?.role ?? '—'}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Sair"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
