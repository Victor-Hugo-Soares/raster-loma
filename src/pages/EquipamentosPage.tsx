import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Cpu, Plus, Upload, Search } from 'lucide-react'
import { listarEquipamentos, type FiltrosEquipamento } from '@/infra/supabase/repositories/equipamentos.repository'
import { listarTecnicos } from '@/infra/supabase/repositories/tecnicos.repository'
import type { Equipamento, StatusEquipamento } from '@/types/domain.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import EquipamentoCard from '@/features/equipamentos/components/EquipamentoCard'
import ImportarPlanilhaDialog from '@/features/equipamentos/components/ImportarPlanilhaDialog'
import { useCriarEquipamento } from '@/features/equipamentos/hooks/useEquipamentoMutations'

const STATUS_CONFIG: Record<StatusEquipamento, { label: string; className: string }> = {
  disponivel:   { label: 'DISPONÍVEL',   className: 'bg-emerald-700/15 text-emerald-300 border-emerald-600/40' },
  utilizado:    { label: 'UTILIZADO',    className: 'bg-blue-700/15 text-blue-300 border-blue-600/40' },
  reservado:    { label: 'RESERVADO',    className: 'bg-amber-700/15 text-amber-300 border-amber-600/40' },
  defeito:      { label: 'DEFEITO',      className: 'bg-red-700/15 text-red-300 border-red-600/40' },
  para_remover: { label: 'PARA REMOVER', className: 'bg-zinc-700/15 text-zinc-400 border-zinc-600/40' },
}

function StatusBadge({ status }: { status: StatusEquipamento }) {
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

const novoSchema = z.object({
  imei: z.string().min(14, 'IMEI deve ter ao menos 14 dígitos').max(20),
  numero_linha: z.string().optional().nullable(),
  modelo: z.string().default('N4P'),
})
type NovoFormData = z.infer<typeof novoSchema>

function NovoEquipamentoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const criar = useCriarEquipamento()
  const form = useForm<NovoFormData>({
    resolver: zodResolver(novoSchema),
    defaultValues: { imei: '', numero_linha: null, modelo: 'N4P' },
  })

  async function onSubmit(data: NovoFormData) {
    await criar.mutateAsync({ imei: data.imei, numero_linha: data.numero_linha, modelo: data.modelo })
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo equipamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="imei"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMEI *</FormLabel>
                  <FormControl>
                    <Input className="font-mono" placeholder="000000000000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numero_linha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de linha</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-0000" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="N4P" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={criar.isPending}>
                {criar.isPending ? 'Salvando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function EquipamentosPage() {
  const [filtros, setFiltros] = useState<FiltrosEquipamento>({})
  const [busca, setBusca] = useState('')
  const [selected, setSelected] = useState<Equipamento | null>(null)
  const [novoOpen, setNovoOpen] = useState(false)
  const [importarOpen, setImportarOpen] = useState(false)

  const { data: equipamentos = [], isLoading } = useQuery({
    queryKey: ['equipamentos', filtros],
    queryFn: () => listarEquipamentos({ ...filtros, busca: busca || undefined }),
  })

  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos', 'ativos'],
    queryFn: () => listarTecnicos(true),
  })

  function aplicarBusca(e: React.FormEvent) {
    e.preventDefault()
    setFiltros((f) => ({ ...f, busca: busca || undefined }))
  }

  const counts = {
    total: equipamentos.length,
    disponiveis: equipamentos.filter((e) => e.status === 'disponivel').length,
    utilizados: equipamentos.filter((e) => e.status === 'utilizado').length,
    defeito: equipamentos.filter((e) => e.status === 'defeito').length,
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold" style={{ fontFamily: 'Oswald, system-ui', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Equipamentos
            </h1>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">Rastreadores cadastrados no sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setImportarOpen(true)}>
            <Upload className="h-4 w-4" />
            Importar planilha
          </Button>
          <Button className="gap-2" onClick={() => setNovoOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo equipamento
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'text-foreground' },
          { label: 'Disponíveis', value: counts.disponiveis, color: 'text-emerald-400' },
          { label: 'Em uso', value: counts.utilizados, color: 'text-blue-400' },
          { label: 'Com defeito', value: counts.defeito, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <form onSubmit={aplicarBusca} className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Buscar IMEI, linha..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onBlur={() => setFiltros((f) => ({ ...f, busca: busca || undefined }))}
          />
        </form>

        <Select
          value={filtros.status ?? 'todos'}
          onValueChange={(v) => setFiltros((f) => ({ ...f, status: v === 'todos' ? undefined : (v as StatusEquipamento) }))}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="disponivel">Disponível</SelectItem>
            <SelectItem value="utilizado">Utilizado</SelectItem>
            <SelectItem value="reservado">Reservado</SelectItem>
            <SelectItem value="defeito">Defeito</SelectItem>
            <SelectItem value="para_remover">Para remover</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filtros.tecnico_id ?? 'todos'}
          onValueChange={(v) => setFiltros((f) => ({ ...f, tecnico_id: v === 'todos' ? undefined : v }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os técnicos</SelectItem>
            {tecnicos.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contagem */}
      <p className="text-xs text-muted-foreground -mt-3">
        {isLoading ? 'Carregando...' : `${equipamentos.length} equipamento(s)`}
      </p>

      {/* Tabela */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              {['IMEI', 'Linha', 'Modelo', 'Técnico', 'Placa vinculada', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {equipamentos.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nenhum equipamento encontrado
                </td>
              </tr>
            )}
            {equipamentos.map((eq) => {
              const tec = tecnicos.find((t) => t.id === eq.tecnico_id)
              return (
                <tr
                  key={eq.id}
                  className="cursor-pointer transition-colors hover:bg-accent/40"
                  onClick={() => setSelected(eq)}
                >
                  <td className="px-4 py-3 font-mono text-primary">{eq.imei}</td>
                  <td className="px-4 py-3 font-mono text-xs">{eq.numero_linha ?? '—'}</td>
                  <td className="px-4 py-3">{eq.modelo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tec?.nome ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{eq.placa_atual ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={eq.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <NovoEquipamentoDialog open={novoOpen} onOpenChange={setNovoOpen} />
      <ImportarPlanilhaDialog open={importarOpen} onOpenChange={setImportarOpen} />
      {selected && (
        <EquipamentoCard
          equipamento={selected}
          open={!!selected}
          onOpenChange={(o) => { if (!o) setSelected(null) }}
        />
      )}
    </div>
  )
}
