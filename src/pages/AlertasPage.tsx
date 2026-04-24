import { Bell } from 'lucide-react'
import NotificacaoFeed from '@/features/notificacoes/components/NotificacaoFeed'
import { useNotificacoesNaoLidas } from '@/features/notificacoes/hooks/useNotificacoes'

export default function AlertasPage() {
  const { count } = useNotificacoesNaoLidas()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-bold">Alertas</h1>
          <p className="text-sm text-muted-foreground">
            {count > 0
              ? `${count} notificação${count !== 1 ? 'ões' : ''} não lida${count !== 1 ? 's' : ''}`
              : 'Nenhuma notificação não lida'}
          </p>
        </div>
      </div>
      <NotificacaoFeed />
    </div>
  )
}
