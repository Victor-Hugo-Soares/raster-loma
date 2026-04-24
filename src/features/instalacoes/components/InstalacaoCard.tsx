import { useState } from 'react'
import { Smartphone, Star, Pencil } from 'lucide-react'
import { formatarData } from '@/shared/utils/dateUtils'
import { formatarMoeda } from '@/shared/utils/currencyUtils'
import StatusBadge from '@/shared/components/StatusBadge'
import AlertaBadge from './AlertaBadge'
import InstalacaoForm from './InstalacaoForm'
import {
  useAtualizarStatus,
  useMarcarAppEnviado,
} from '../hooks/useInstalacaoMutations'
import type { InstalacaoComAtraso, NivelAlerta, StatusInstalacao } from '@/types/domain.types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface InstalacaoCardProps {
  instalacao: InstalacaoComAtraso
  open: boolean
  onOpenChange: (o: boolean) => void
}

function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-right text-sm', mono && 'font-mono')}>{value || '—'}</span>
    </div>
  )
}

const ALL_STATUSES: { label: string; value: StatusInstalacao }[] = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Agendado', value: 'agendado' },
  { label: 'Aguardando instalação', value: 'aguardando_instalacao' },
  { label: 'Enviar equipamento', value: 'enviar_equipamento' },
  { label: 'Rastreador enviado', value: 'rastreador_enviado' },
  { label: 'Instalado (sem acesso APP)', value: 'instalado_sem_acesso' },
  { label: 'Instalado OK', value: 'instalado_ok' },
  { label: 'Pago', value: 'pago' },
]

export default function InstalacaoCard({ instalacao, open, onOpenChange }: InstalacaoCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const atualizarStatus = useAtualizarStatus()
  const marcarApp = useMarcarAppEnviado()

  const custoTotal =
    (instalacao.custo_km ?? 0) +
    (instalacao.custo_instalacao ?? 0) +
    (instalacao.custo_pedagio ?? 0)

  const nextStatuses = ALL_STATUSES.filter((s) => s.value !== instalacao.status)

  const showEnvioSection =
    instalacao.status === 'enviar_equipamento' || instalacao.status === 'rastreador_enviado'

  const showInstalacaoSection =
    instalacao.status === 'instalado_sem_acesso' ||
    instalacao.status === 'instalado_ok' ||
    instalacao.status === 'pago'

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-start justify-between gap-2 pr-6">
              <div>
                <SheetTitle className="text-base font-semibold leading-tight">
                  {instalacao.nome_cliente}
                </SheetTitle>
                <p className="mt-0.5 font-mono text-sm text-primary font-medium">{instalacao.placa}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={instalacao.status as StatusInstalacao} />
                {instalacao.nivel_alerta && (
                  <AlertaBadge
                    nivel={instalacao.nivel_alerta as NivelAlerta}
                    dias={instalacao.dias_pendente}
                  />
                )}
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 pb-6 space-y-5">
              {/* Ações rápidas */}
              <div className="flex gap-2 pt-4">
                {!instalacao.app_enviado && instalacao.status === 'instalado_sem_acesso' && (
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => marcarApp.mutate(instalacao.id)}
                    disabled={marcarApp.isPending}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Marcar APP enviado
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Mudar status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Alterar para</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {nextStatuses.map((s) => (
                      <DropdownMenuItem
                        key={s.value}
                        onClick={() =>
                          atualizarStatus.mutate({ id: instalacao.id, status: s.value })
                        }
                      >
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>

              {/* APP enviado toggle */}
              {(instalacao.status === 'instalado_sem_acesso' || instalacao.status === 'instalado_ok') && (
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Acesso APP enviado</p>
                    <p className="text-xs text-muted-foreground">
                      {instalacao.app_enviado
                        ? `Enviado em ${formatarData(instalacao.app_enviado_em)}`
                        : 'Aguardando envio'}
                    </p>
                  </div>
                  <Switch
                    checked={instalacao.app_enviado}
                    onCheckedChange={() => {
                      if (!instalacao.app_enviado) marcarApp.mutate(instalacao.id)
                    }}
                    disabled={instalacao.app_enviado}
                  />
                </div>
              )}

              <Separator />

              {/* Dados OS */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dados da OS
                </p>
                <div className="divide-y divide-border/50">
                  <DetailRow label="Card externo" value={instalacao.card_externo} mono />
                  <DetailRow label="Tipo de serviço" value={instalacao.tipo_servico?.replace(/_/g, ' ')} />
                  <DetailRow label="Data OS" value={formatarData(instalacao.data_os)} />
                  <DetailRow label="Responsável" value={instalacao.responsavel} />
                  {instalacao.modelo_veiculo && (
                    <DetailRow label="Modelo" value={instalacao.modelo_veiculo} />
                  )}
                </div>
              </div>

              <Separator />

              {/* Técnico */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Técnico
                </p>
                <div className="divide-y divide-border/50">
                  <DetailRow label="Nome" value={instalacao.tecnico_nome} />
                </div>
              </div>

              {/* Envio de equipamento */}
              {showEnvioSection && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Envio de equipamento
                    </p>
                    <div className="divide-y divide-border/50">
                      <DetailRow label="Data de envio" value={formatarData(instalacao.data_envio)} />
                      <DetailRow label="IMEI" value={instalacao.imei} mono />
                      <DetailRow label="Cód. rastreio" value={instalacao.codigo_rastreio} mono />
                    </div>
                  </div>
                </>
              )}

              {/* Instalação */}
              {showInstalacaoSection && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Instalação
                    </p>
                    <div className="divide-y divide-border/50">
                      <DetailRow label="Data instalação" value={formatarData(instalacao.data_instalacao)} />
                      <DetailRow label="Local" value={instalacao.local_instalacao} />
                      <DetailRow label="IMEI" value={instalacao.imei} mono />
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Financeiro */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Financeiro
                </p>
                <div className="divide-y divide-border/50">
                  <DetailRow label="Custo km" value={formatarMoeda(instalacao.custo_km)} />
                  <DetailRow label="Custo instalação" value={formatarMoeda(instalacao.custo_instalacao)} />
                  <DetailRow label="Pedágio" value={formatarMoeda(instalacao.custo_pedagio)} />
                  <DetailRow
                    label="Total"
                    value={
                      <span className="font-semibold text-primary">
                        {formatarMoeda(custoTotal)}
                      </span>
                    }
                  />
                  <DetailRow label="Diluído" value={instalacao.diluido ? 'Sim' : 'Não'} />
                  <DetailRow
                    label="Faturado"
                    value={
                      <span className={instalacao.faturado ? 'text-emerald-400' : 'text-muted-foreground'}>
                        {instalacao.faturado ? 'Sim' : 'Não'}
                      </span>
                    }
                  />
                </div>
              </div>

              {instalacao.observacoes && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Observações
                    </p>
                    <p className="rounded-md bg-accent/50 p-3 text-sm text-foreground">
                      {instalacao.observacoes}
                    </p>
                    {instalacao.prioridade && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-yellow-400">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        Marcado como prioridade
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar instalação</DialogTitle>
          </DialogHeader>
          <InstalacaoForm
            instalacao={instalacao}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
