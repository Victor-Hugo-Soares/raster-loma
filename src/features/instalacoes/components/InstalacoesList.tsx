import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Star } from 'lucide-react'
import { useInstalacoes } from '../hooks/useInstalacoes'
import FiltrosInstalacoes from './FiltrosInstalacoes'
import AlertaBadge from './AlertaBadge'
import InstalacaoCard from './InstalacaoCard'
import InstalacaoForm from './InstalacaoForm'
import StatusBadge from '@/shared/components/StatusBadge'
import { formatarData } from '@/shared/utils/dateUtils'
import type { InstalacaoComAtraso, NivelAlerta, StatusInstalacao } from '@/types/domain.types'
import type { FiltrosInstalacao } from '@/infra/supabase/repositories/instalacoes.repository'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 50

export default function InstalacoesList() {
  const [filtros, setFiltros] = useState<FiltrosInstalacao>({ page: 0, pageSize: PAGE_SIZE })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [novaOpen, setNovaOpen] = useState(false)

  const { data, isLoading } = useInstalacoes(filtros)
  const instalacoes = data?.data ?? []
  const total = data?.count ?? 0
  const page = filtros.page ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const selected = instalacoes.find((i) => i.id === selectedId) ?? null

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FiltrosInstalacoes filtros={filtros} onChange={setFiltros} />
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setNovaOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo serviço
        </Button>
      </div>

      {/* Contagem */}
      <p className="text-xs text-muted-foreground">
        {isLoading ? 'Carregando...' : `${total.toLocaleString('pt-BR')} registro${total !== 1 ? 's' : ''}`}
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[200px]">Cliente</TableHead>
              <TableHead className="w-[100px]">Placa</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead className="w-[110px]">Data OS</TableHead>
              <TableHead className="w-[140px]">Alerta / Dias</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : instalacoes.map((inst) => (
                  <InstalacaoRow
                    key={inst.id}
                    inst={inst}
                    onSelect={() => setSelectedId(inst.id)}
                  />
                ))}

            {!isLoading && instalacoes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Nenhuma instalação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page === 0}
              onClick={() => setFiltros((f) => ({ ...f, page: (f.page ?? 0) - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setFiltros((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail sheet */}
      {selected && (
        <InstalacaoCard
          instalacao={selected}
          open={!!selectedId}
          onOpenChange={(o) => { if (!o) setSelectedId(null) }}
        />
      )}

      {/* New installation dialog */}
      <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo serviço</DialogTitle>
          </DialogHeader>
          <InstalacaoForm onSuccess={() => setNovaOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InstalacaoRow({
  inst,
  onSelect,
}: {
  inst: InstalacaoComAtraso
  onSelect: () => void
}) {
  const nivel = inst.nivel_alerta as NivelAlerta | null

  return (
    <TableRow
      className={cn(
        'cursor-pointer',
        nivel === 'critico' && 'bg-red-950/20 hover:bg-red-950/30',
        nivel === 'vermelho' && 'bg-red-950/10',
        inst.prioridade && 'border-l-2 border-l-yellow-500'
      )}
      onClick={onSelect}
    >
      <TableCell>
        <div className="flex items-center gap-1.5">
          {inst.prioridade && (
            <Star className="h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500" />
          )}
          <span className="truncate max-w-[180px] text-sm font-medium">{inst.nome_cliente}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs text-primary font-semibold">{inst.placa}</span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">
          {inst.cidade}{inst.uf ? `/${inst.uf}` : ''}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-xs">{inst.tecnico_nome ?? '—'}</span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs">{formatarData(inst.data_os)}</span>
      </TableCell>
      <TableCell>
        {nivel ? (
          <AlertaBadge nivel={nivel} dias={inst.dias_pendente} />
        ) : (
          inst.dias_pendente != null ? (
            <span className="font-mono text-xs text-muted-foreground">{inst.dias_pendente}d</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
        )}
      </TableCell>
      <TableCell>
        <StatusBadge status={inst.status as StatusInstalacao} />
      </TableCell>
    </TableRow>
  )
}
