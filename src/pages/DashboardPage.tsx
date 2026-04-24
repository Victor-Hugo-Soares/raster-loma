import { useNavigate } from 'react-router-dom'
import {
  Wrench, Clock, Smartphone, CheckCircle, Flame, TrendingUp, ArrowRight,
} from 'lucide-react'
import { useEstatisticasStatus } from '@/features/instalacoes/hooks/useInstalacoes'
import { useInstalacoes } from '@/features/instalacoes/hooks/useInstalacoes'
import { useRealtimeInstalacoes } from '@/shared/hooks/useRealtime'
import AlertaBadge from '@/features/instalacoes/components/AlertaBadge'
import { formatarData } from '@/shared/utils/dateUtils'
import type { InstalacaoComAtraso, NivelAlerta, StatusInstalacao } from '@/types/domain.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  onClick,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color: string
  onClick?: () => void
}) {
  return (
    <Card
      className={cn('cursor-pointer transition-colors hover:border-border/80', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className={cn('mt-1.5 text-3xl font-bold tabular-nums', color)}>{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={cn('rounded-md p-2', `bg-[${color}]/10`)}>
            <Icon className={cn('h-5 w-5', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  useRealtimeInstalacoes()

  const { data: stats, isLoading: loadingStats } = useEstatisticasStatus()
  const { data: criticasData, isLoading: loadingCriticas } = useInstalacoes({
    nivel_alerta: 'critico',
    pageSize: 5,
  })
  const { data: recentesData, isLoading: loadingRecentes } = useInstalacoes({ pageSize: 6 })

  const counts = stats?.counts
  const criticos = stats?.criticos ?? 0
  const criticasRecentes = criticasData?.data ?? []
  const recentes = recentesData?.data ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold uppercase tracking-wide text-foreground" style={{ fontFamily: 'Oswald, system-ui, sans-serif' }}>
          Painel de Controle
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Central Rastreio — visão geral do sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard
              icon={Wrench}
              label="Pendentes"
              value={
                (counts?.pendente ?? 0) +
                (counts?.aguardando_instalacao ?? 0) +
                (counts?.enviar_equipamento ?? 0) +
                (counts?.rastreador_enviado ?? 0)
              }
              sub="aguardando instalação"
              color="text-orange-400"
              onClick={() => navigate('/instalacoes')}
            />
            <StatCard
              icon={Flame}
              label="Críticos (15d+)"
              value={criticos}
              sub="ação urgente necessária"
              color="text-red-400"
              onClick={() => navigate('/instalacoes?nivel=critico')}
            />
            <StatCard
              icon={Smartphone}
              label="Sem acesso APP"
              value={counts?.instalado_sem_acesso ?? 0}
              sub="aguardando envio"
              color="text-blue-400"
              onClick={() => navigate('/instalacoes?status=instalado_sem_acesso')}
            />
            <StatCard
              icon={CheckCircle}
              label="Instalados OK"
              value={counts?.instalado_ok ?? 0}
              sub="concluídos"
              color="text-emerald-400"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Críticos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Flame className="h-4 w-4 text-red-400" />
                Instalações Críticas
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => navigate('/instalacoes')}
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingCriticas ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : criticasRecentes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 opacity-30" />
                <p className="text-sm">Nenhuma instalação crítica</p>
              </div>
            ) : (
              <div className="space-y-1">
                {criticasRecentes.map((inst) => (
                  <MiniRow key={inst.id} inst={inst} onClick={() => navigate('/instalacoes')} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recentes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                Adicionadas Recentemente
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => navigate('/instalacoes')}
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRecentes ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {recentes.map((inst) => (
                  <MiniRow key={inst.id} inst={inst} onClick={() => navigate('/instalacoes')} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status bar */}
      {!loadingStats && counts && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Distribuição de Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBar counts={counts} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MiniRow({ inst, onClick }: { inst: InstalacaoComAtraso; onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <span className="font-mono text-xs font-semibold text-primary w-[80px] shrink-0">
        {inst.placa}
      </span>
      <span className="flex-1 truncate text-xs">{inst.nome_cliente}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {inst.nivel_alerta && (
          <AlertaBadge
            nivel={inst.nivel_alerta as NivelAlerta}
            dias={inst.dias_pendente}
            compact
          />
        )}
        <span className="text-[10px] text-muted-foreground font-mono">
          {formatarData(inst.data_os)}
        </span>
      </div>
    </button>
  )
}

function StatusBar({
  counts,
}: {
  counts: Record<StatusInstalacao, number>
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total === 0) return null

  const bars: { key: StatusInstalacao; label: string; color: string }[] = [
    { key: 'pendente', label: 'Pendente', color: 'bg-zinc-500' },
    { key: 'agendado', label: 'Agendado', color: 'bg-sky-500' },
    { key: 'aguardando_instalacao', label: 'Aguardando', color: 'bg-blue-500' },
    { key: 'enviar_equipamento', label: 'Enviar equip.', color: 'bg-amber-500' },
    { key: 'rastreador_enviado', label: 'Rastreador enviado', color: 'bg-violet-500' },
    { key: 'instalado_sem_acesso', label: 'Sem acesso APP', color: 'bg-yellow-500' },
    { key: 'instalado_ok', label: 'Instalado OK', color: 'bg-emerald-500' },
    { key: 'pago', label: 'Pago', color: 'bg-teal-500' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full gap-0.5">
        {bars.map(({ key, color }) => {
          const pct = (counts[key] / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={key}
              className={cn('h-full rounded-full transition-all', color)}
              style={{ width: `${pct}%` }}
              title={`${counts[key]} (${pct.toFixed(1)}%)`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-4">
        {bars.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={cn('h-2.5 w-2.5 rounded-sm', color)} />
            <span>{label}</span>
            <span className="font-mono font-medium text-foreground">{counts[key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
