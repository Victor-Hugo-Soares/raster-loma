import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotificacoesNaoLidas } from '../hooks/useNotificacoes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotificacaoBell() {
  const navigate = useNavigate()
  const { count } = useNotificacoesNaoLidas()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate('/alertas')}
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white',
            count > 0 ? 'bg-destructive' : 'hidden'
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  )
}
