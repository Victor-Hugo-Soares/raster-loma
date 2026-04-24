import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign, Plus, CheckCircle2, Clock, TrendingUp, Check } from 'lucide-react'
import {
  listarPagamentos,
  criarPagamento,
  marcarComoPago,
} from '@/infra/supabase/repositories/pagamentos.repository'
import { listarTecnicos } from '@/infra/supabase/repositories/tecnicos.repository'
import type { Pagamento } from '@/types/domain.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

function formatarMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function StatusBadge({ status }: { status: 'pago' | 'a_pagar' }) {
  return status === 'pago' ? (
    <span
      className="inline-flex items-center gap-1 rounded-sm border border-emerald-600/40 bg-emerald-700/15 px-2 py-0.5 text-[10px] font-bold tracking-widest text-emerald-300"
      style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
    >
      PAGO
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 rounded-sm border border-amber-600/40 bg-amber-700/15 px-2 py-0.5 text-[10px] font-bold tracking-widest text-amber-300"
      style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
    >
      A PAGAR
    </span>
  )
}

const pagamentoSchema = z.object({
  numero_nf: z.string().optional().nullable(),
  valor: z.coerce.number().min(0.01, 'Valor obrigatório'),
  tecnico_id: z.string().min(1, 'Selecione um técnico'),
  cnpj: z.string().optional().nullable(),
  status: z.enum(['pago', 'a_pagar']).default('a_pagar'),
  data_vencimento: z.string().optional().nullable(),
  data_pagamento: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})
type PagamentoFormData = z.infer<typeof pagamentoSchema>

function NovoPagamentoDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient()
  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos', 'ativos'],
    queryFn: () => listarTecnicos(true),
    enabled: open,
  })

  const criar = useMutation({
    mutationFn: (d: PagamentoFormData) => criarPagamento({
      ...d,
      valor: d.valor,
      tecnico_id: d.tecnico_id,
      status: d.status as 'pago' | 'a_pagar',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagamentos'] })
      onOpenChange(false)
      form.reset()
    },
  })

  const form = useForm<PagamentoFormData>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      numero_nf: null,
      valor: undefined,
      tecnico_id: '',
      cnpj: null,
      status: 'a_pagar',
      data_vencimento: null,
      data_pagamento: null,
      observacoes: null,
    },
  })

  const status = form.watch('status')

  // Preenche CNPJ automaticamente ao selecionar técnico
  function onTecnicoChange(id: string) {
    form.setValue('tecnico_id', id)
    const tec = tecnicos.find((t) => t.id === id)
    if (tec?.cnpj) form.setValue('cnpj', tec.cnpj)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo pagamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => criar.mutate(d))} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tecnico_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Técnico *</FormLabel>
                    <Select value={field.value} onValueChange={onTecnicoChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecionar técnico" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {tecnicos.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0001-00" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_nf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº da NF</FormLabel>
                    <FormControl>
                      <Input placeholder="NF-000123" className="font-mono" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Status</FormLabel>
                    <div className="flex gap-2">
                      {(['a_pagar', 'pago'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => field.onChange(s)}
                          className={cn(
                            'flex-1 rounded-md border py-2 text-sm font-medium transition-colors',
                            field.value === s
                              ? s === 'pago'
                                ? 'border-emerald-500/60 bg-emerald-700/20 text-emerald-300'
                                : 'border-amber-500/60 bg-amber-700/20 text-amber-300'
                              : 'border-border text-muted-foreground hover:bg-accent/40'
                          )}
                        >
                          {s === 'pago' ? 'Pago' : 'A pagar'}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {status === 'pago' && (
                <FormField
                  control={form.control}
                  name="data_pagamento"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Data de pagamento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Informações adicionais..." {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={criar.isPending}>
                {criar.isPending ? 'Salvando...' : 'Criar pagamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function PagamentoRow({ pagamento }: { pagamento: Pagamento }) {
  const qc = useQueryClient()
  const pagar = useMutation({
    mutationFn: () => marcarComoPago(pagamento.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pagamentos'] }),
  })

  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-accent/30">
      <td className="px-4 py-3">
        <p className="text-sm font-medium">{pagamento.tecnico_nome ?? '—'}</p>
        {pagamento.cnpj && <p className="font-mono text-xs text-muted-foreground">{pagamento.cnpj}</p>}
      </td>
      <td className="px-4 py-3 font-mono text-sm">{pagamento.numero_nf ?? '—'}</td>
      <td className="px-4 py-3 text-sm font-semibold text-primary">{formatarMoeda(pagamento.valor)}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{formatarData(pagamento.data_vencimento)}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{formatarData(pagamento.data_pagamento)}</td>
      <td className="px-4 py-3"><StatusBadge status={pagamento.status} /></td>
      <td className="px-4 py-3">
        {pagamento.status === 'a_pagar' && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs"
            onClick={() => pagar.mutate()}
            disabled={pagar.isPending}
          >
            <Check className="h-3 w-3" />
            Marcar pago
          </Button>
        )}
      </td>
    </tr>
  )
}

export default function FinanceiroPage() {
  const [novoOpen, setNovoOpen] = useState(false)
  const [filtro, setFiltro] = useState<'todos' | 'a_pagar' | 'pago'>('todos')

  const { data: pagamentos = [], isLoading } = useQuery({
    queryKey: ['pagamentos'],
    queryFn: listarPagamentos,
  })

  const visíveis = filtro === 'todos' ? pagamentos : pagamentos.filter((p) => p.status === filtro)

  const totalPago = pagamentos.filter((p) => p.status === 'pago').reduce((s, p) => s + p.valor, 0)
  const totalAPagar = pagamentos.filter((p) => p.status === 'a_pagar').reduce((s, p) => s + p.valor, 0)
  const total = pagamentos.reduce((s, p) => s + p.valor, 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold" style={{ fontFamily: 'Oswald, system-ui', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Financeiro
            </h1>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">Pagamentos aos técnicos</p>
        </div>
        <Button className="gap-2" onClick={() => setNovoOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo pagamento
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Total geral</span>
          </div>
          <p className="text-2xl font-bold">{formatarMoeda(total)}</p>
        </div>
        <div className="rounded-lg border border-emerald-600/30 bg-emerald-700/10 p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">Pago</span>
          </div>
          <p className="text-2xl font-bold text-emerald-300">{formatarMoeda(totalPago)}</p>
        </div>
        <div className="rounded-lg border border-amber-600/30 bg-amber-700/10 p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">A pagar</span>
          </div>
          <p className="text-2xl font-bold text-amber-300">{formatarMoeda(totalAPagar)}</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {(['todos', 'a_pagar', 'pago'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
              filtro === f
                ? 'border-primary/60 bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent/40'
            )}
          >
            {f === 'todos' ? 'Todos' : f === 'a_pagar' ? 'A pagar' : 'Pagos'}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted-foreground">
          {isLoading ? 'Carregando...' : `${visíveis.length} registro(s)`}
        </span>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              {['Técnico / CNPJ', 'NF', 'Valor', 'Vencimento', 'Pgto', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visíveis.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">
                  Nenhum pagamento encontrado
                </td>
              </tr>
            )}
            {visíveis.map((p) => <PagamentoRow key={p.id} pagamento={p} />)}
          </tbody>
        </table>
      </div>

      <NovoPagamentoDialog open={novoOpen} onOpenChange={setNovoOpen} />
    </div>
  )
}
