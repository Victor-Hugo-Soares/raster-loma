import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCheck, AlertTriangle, Clock, Flame } from 'lucide-react'
import { useNotificacoes, useMarcarLida, useMarcarTodasLidas } from '../hooks/useNotificacoes'
import type { NivelAlerta } from '@/types/domain.types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const NIVEL_CONFIG: Record<NivelAlerta, { label: string; icon: React.ElementType; className: string }> = {
  amarelo: { label: 'Atenção', icon: Clock, className: 'text-yellow-400' },
  laranja: { label: 'Atrasado', icon: AlertTriangle, className: 'text-orange-400' },
  vermelho: { label: 'Crítico', icon: AlertTriangle, className: 'text-red-400' },
  critico: { label: 'CRÍTICO', icon: Flame, className: 'text-red-300' },
}

export default function NotificacaoFeed() {
  const { data: notificacoes = [], isLoading } = useNotificacoes()
  const marcarLida = useMarcarLida()
  const marcarTodas = useMarcarTodasLidas()

  const naoLidas = notificacoes.filter((n) => !n.lida)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {naoLidas.length} não lida{naoLidas.length !== 1 ? 's' : ''}
        </p>
        {naoLidas.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => marcarTodas.mutate()}
            disabled={marcarTodas.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notificacoes.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <CheckCheck className="h-10 w-10 opacity-30" />
          <p className="text-sm">Nenhuma notificação</p>
        </div>
      )}

      <div className="space-y-2">
        {notificacoes.map((n) => {
          const nivel = n.nivel as NivelAlerta
          const config = NIVEL_CONFIG[nivel]
          const Icon = config.icon

          return (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                n.lida
                  ? 'border-border/50 bg-card opacity-60'
                  : 'border-border bg-card hover:bg-accent/30',
                nivel === 'critico' && !n.lida && 'border-red-500/30 bg-red-950/10'
              )}
            >
              <div className={cn('mt-0.5 shrink-0', config.className)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Instalação com{' '}
                  <span className="font-mono font-bold">{n.dias_atraso} dias</span>{' '}
                  pendente
                  {' — '}
                  <span className={cn('font-semibold', config.className)}>{config.label}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                  ID: {n.instalacao_id.slice(0, 8)}…
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(n.enviada_em), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              {!n.lida && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 opacity-60 hover:opacity-100"
                  onClick={() => marcarLida.mutate(n.id)}
                  title="Marcar como lida"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
