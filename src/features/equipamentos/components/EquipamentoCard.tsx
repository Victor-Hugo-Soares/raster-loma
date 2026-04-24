import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Unlink } from 'lucide-react'
import type { Equipamento, StatusEquipamento } from '@/types/domain.types'
import { listarTecnicos } from '@/infra/supabase/repositories/tecnicos.repository'
import { listarInstalacoes } from '@/infra/supabase/repositories/instalacoes.repository'
import { useAtualizarEquipamento } from '../hooks/useEquipamentoMutations'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface EquipamentoCardProps {
  equipamento: Equipamento
  open: boolean
  onOpenChange: (o: boolean) => void
}

const STATUS_CONFIG: Record<StatusEquipamento, { label: string; className: string }> = {
  disponivel:  { label: 'DISPONÍVEL',  className: 'bg-emerald-700/15 text-emerald-300 border-emerald-600/40' },
  utilizado:   { label: 'UTILIZADO',   className: 'bg-blue-700/15 text-blue-300 border-blue-600/40' },
  reservado:   { label: 'RESERVADO',   className: 'bg-amber-700/15 text-amber-300 border-amber-600/40' },
  defeito:     { label: 'DEFEITO',     className: 'bg-red-700/15 text-red-300 border-red-600/40' },
  para_remover:{ label: 'PARA REMOVER',className: 'bg-zinc-700/15 text-zinc-400 border-zinc-600/40' },
}

function StatusBadgeEq({ status }: { status: StatusEquipamento }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn('inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold tracking-widest', cfg.className)}
      style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
    >
      {cfg.label}
    </span>
  )
}

function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-right text-sm', mono && 'font-mono')}>{value || '—'}</span>
    </div>
  )
}

export default function EquipamentoCard({ equipamento, open, onOpenChange }: EquipamentoCardProps) {
  const atualizar = useAtualizarEquipamento()
  const [editingStatus, setEditingStatus] = useState(false)

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos', 'ativos'],
    queryFn: () => listarTecnicos(true),
    enabled: open,
  })

  const { data: instalacoes = [] } = useQuery({
    queryKey: ['instalacoes', { pageSize: 200 }],
    queryFn: () => listarInstalacoes({ pageSize: 200 }),
    select: (r) => r.data,
    enabled: open,
  })

  function vincularTecnico(tecnico_id: string | null) {
    atualizar.mutate({ id: equipamento.id, dados: { tecnico_id } })
  }

  function vincularServico(instalacao_id: string | null) {
    if (!instalacao_id) {
      atualizar.mutate({ id: equipamento.id, dados: { placa_atual: null, status: 'disponivel' } })
      return
    }
    const inst = instalacoes.find((i) => i.id === instalacao_id)
    atualizar.mutate({
      id: equipamento.id,
      dados: { placa_atual: inst?.placa ?? null, status: 'utilizado' },
    })
  }

  function mudarStatus(status: StatusEquipamento) {
    atualizar.mutate({ id: equipamento.id, dados: { status } })
    setEditingStatus(false)
  }

  const tecnicoAtual = tecnicos.find((t) => t.id === equipamento.tecnico_id)
  const servicoAtual = instalacoes.find((i) => i.placa === equipamento.placa_atual)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-2 pr-6">
            <div>
              <SheetTitle className="font-mono text-base text-primary">{equipamento.imei}</SheetTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">{equipamento.modelo} · {equipamento.tecnologia ?? '4G'}</p>
            </div>
            <StatusBadgeEq status={equipamento.status} />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-5">

            {/* Status rápido */}
            <div className="pt-4">
              {editingStatus ? (
                <Select onValueChange={(v) => mudarStatus(v as StatusEquipamento)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="utilizado">Utilizado</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="defeito">Defeito</SelectItem>
                    <SelectItem value="para_remover">Para remover</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditingStatus(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Alterar status
                </Button>
              )}
            </div>

            <Separator />

            {/* Dados */}
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dados</p>
              <div className="divide-y divide-border/50">
                <DetailRow label="IMEI" value={equipamento.imei} mono />
                <DetailRow label="Linha" value={equipamento.numero_linha} mono />
                <DetailRow label="Modelo" value={equipamento.modelo} />
                <DetailRow label="Tecnologia" value={equipamento.tecnologia} />
                <DetailRow label="Placa vinculada" value={equipamento.placa_atual} mono />
              </div>
            </div>

            <Separator />

            {/* Vincular técnico */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Técnico</p>
              {tecnicoAtual ? (
                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{tecnicoAtual.nome}</p>
                    {tecnicoAtual.regiao && <p className="text-xs text-muted-foreground">{tecnicoAtual.regiao}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-destructive"
                    onClick={() => vincularTecnico(null)}
                    disabled={atualizar.isPending}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Desvincular
                  </Button>
                </div>
              ) : (
                <Select onValueChange={(v) => vincularTecnico(v === 'none' ? null : v)} disabled={atualizar.isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vincular a um técnico..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem técnico</SelectItem>
                    {tecnicos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}{t.regiao ? ` · ${t.regiao}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Separator />

            {/* Vincular serviço */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Serviço vinculado</p>
              {servicoAtual ? (
                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{servicoAtual.nome_cliente}</p>
                    <p className="font-mono text-xs text-primary">{servicoAtual.placa}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-destructive"
                    onClick={() => vincularServico(null)}
                    disabled={atualizar.isPending}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Desvincular
                  </Button>
                </div>
              ) : (
                <Select onValueChange={(v) => vincularServico(v === 'none' ? null : v)} disabled={atualizar.isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vincular a um serviço..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem serviço</SelectItem>
                    {instalacoes.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        <span className="font-mono">{i.placa}</span> — {i.nome_cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Link manual (placa) para serviços sem instalacao correspondente */}
            {equipamento.placa_atual && !servicoAtual && (
              <p className="text-xs text-muted-foreground">
                Vinculado à placa <span className="font-mono">{equipamento.placa_atual}</span> (serviço não encontrado na lista atual)
              </p>
            )}

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
