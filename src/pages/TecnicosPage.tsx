import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, Plus, Phone, MapPin, Power, CreditCard, Building2, Wrench, Home } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listarTecnicos,
  criarTecnico,
  atualizarTecnico,
  contarInstalacoesPorTecnico,
} from '@/infra/supabase/repositories/tecnicos.repository'
import type { Tecnico } from '@/types/domain.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatarMoeda } from '@/shared/utils/currencyUtils'

const tecnicoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().min(1, 'Telefone obrigatório'),
  regiao: z.string().optional().nullable(),
  pix: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  valor_instalacao: z.coerce.number().min(0).optional().nullable(),
  valor_km: z.coerce.number().min(0).optional().nullable(),
  ponto_fixo: z.boolean().default(false),
})
type TecnicoFormData = z.infer<typeof tecnicoSchema>

export default function TecnicosPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Tecnico | null>(null)

  const { data: tecnicos = [], isLoading } = useQuery({
    queryKey: ['tecnicos'],
    queryFn: () => listarTecnicos(),
  })

  const { data: contagens = {} } = useQuery({
    queryKey: ['tecnicos-contagens'],
    queryFn: contarInstalacoesPorTecnico,
  })

  const ativos = tecnicos.filter((t) => t.ativo)
  const inativos = tecnicos.filter((t) => !t.ativo)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-bold">Técnicos</h1>
            <p className="text-sm text-muted-foreground">
              {ativos.length} ativo{ativos.length !== 1 ? 's' : ''}
              {inativos.length > 0 && ` · ${inativos.length} inativo${inativos.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => { setEditing(null); setFormOpen(true) }}
        >
          <Plus className="h-4 w-4" />
          Novo técnico
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {ativos.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ativos ({ativos.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ativos.map((t) => (
                  <TecnicoCard
                    key={t.id}
                    tecnico={t}
                    contagem={contagens[t.id]}
                    onEdit={() => { setEditing(t); setFormOpen(true) }}
                  />
                ))}
              </div>
            </div>
          )}
          {inativos.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Inativos ({inativos.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {inativos.map((t) => (
                  <TecnicoCard
                    key={t.id}
                    tecnico={t}
                    contagem={contagens[t.id]}
                    onEdit={() => { setEditing(t); setFormOpen(true) }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TecnicoDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tecnico={editing}
      />
    </div>
  )
}

function TecnicoCard({
  tecnico,
  contagem,
  onEdit,
}: {
  tecnico: Tecnico
  contagem?: { total: number; pendentes: number; concluidas: number }
  onEdit: () => void
}) {
  const initials = tecnico.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Card className={cn(!tecnico.ativo && 'opacity-75')}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{tecnico.nome}</p>
            {tecnico.regiao && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{tecnico.regiao}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={tecnico.ativo ? 'success' : 'secondary'} className="text-[10px]">
              {tecnico.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
            {tecnico.ponto_fixo && (
              <span
                className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-primary"
                style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
              >
                <Home className="h-2.5 w-2.5" />
                FIXO
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {tecnico.telefone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="font-mono">{tecnico.telefone}</span>
            </div>
          )}
          {tecnico.pix && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-3 w-3 shrink-0" />
              <span className="truncate font-mono">{tecnico.pix}</span>
            </div>
          )}
          {tecnico.cnpj && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="font-mono">{tecnico.cnpj}</span>
            </div>
          )}
          {(tecnico.valor_instalacao != null || tecnico.valor_km != null) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wrench className="h-3 w-3 shrink-0" />
              <span>
                {tecnico.valor_instalacao != null && `${formatarMoeda(tecnico.valor_instalacao)}/inst`}
                {tecnico.valor_instalacao != null && tecnico.valor_km != null && ' · '}
                {tecnico.valor_km != null && `${formatarMoeda(tecnico.valor_km)}/km`}
              </span>
            </div>
          )}
        </div>

        {contagem && (
          <div className="flex gap-3 pt-1 border-t border-border/50">
            <div className="text-center">
              <p className="font-mono text-sm font-bold">{contagem.total}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-sm font-bold text-orange-400">{contagem.pendentes}</p>
              <p className="text-[10px] text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-sm font-bold text-emerald-400">{contagem.concluidas}</p>
              <p className="text-[10px] text-muted-foreground">Concluídas</p>
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={onEdit}>
          Editar
        </Button>
      </CardContent>
    </Card>
  )
}

function TecnicoDialog({
  open,
  onOpenChange,
  tecnico,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  tecnico: Tecnico | null
}) {
  const qc = useQueryClient()
  const isEdit = !!tecnico

  const criar = useMutation({
    mutationFn: criarTecnico,
    onSuccess: () => {
      toast.success('Técnico criado')
      qc.invalidateQueries({ queryKey: ['tecnicos'] })
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error('Erro', { description: err.message }),
  })

  const atualizar = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Parameters<typeof atualizarTecnico>[1] }) =>
      atualizarTecnico(id, dados),
    onSuccess: () => {
      toast.success('Técnico atualizado')
      qc.invalidateQueries({ queryKey: ['tecnicos'] })
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error('Erro', { description: err.message }),
  })

  const toggleAtivo = useMutation({
    mutationFn: () => atualizarTecnico(tecnico!.id, { ativo: !tecnico!.ativo }),
    onSuccess: () => {
      toast.success(tecnico?.ativo ? 'Técnico desativado' : 'Técnico reativado')
      qc.invalidateQueries({ queryKey: ['tecnicos'] })
      onOpenChange(false)
    },
  })

  const form = useForm<TecnicoFormData>({
    resolver: zodResolver(tecnicoSchema),
    defaultValues: {
      nome: tecnico?.nome ?? '',
      telefone: tecnico?.telefone ?? '',
      regiao: tecnico?.regiao ?? null,
      pix: tecnico?.pix ?? null,
      endereco: tecnico?.endereco ?? null,
      cnpj: tecnico?.cnpj ?? null,
      valor_instalacao: tecnico?.valor_instalacao ?? null,
      valor_km: tecnico?.valor_km ?? null,
      ponto_fixo: tecnico?.ponto_fixo ?? false,
    },
    values: {
      nome: tecnico?.nome ?? '',
      telefone: tecnico?.telefone ?? '',
      regiao: tecnico?.regiao ?? null,
      pix: tecnico?.pix ?? null,
      endereco: tecnico?.endereco ?? null,
      cnpj: tecnico?.cnpj ?? null,
      valor_instalacao: tecnico?.valor_instalacao ?? null,
      valor_km: tecnico?.valor_km ?? null,
      ponto_fixo: tecnico?.ponto_fixo ?? false,
    },
  })

  function onSubmit(data: TecnicoFormData) {
    const payload = {
      nome: data.nome,
      telefone: data.telefone || null,
      regiao: data.regiao || null,
      pix: data.pix || null,
      endereco: data.endereco || null,
      cnpj: data.cnpj || null,
      valor_instalacao: data.valor_instalacao ?? null,
      valor_km: data.valor_km ?? null,
      ponto_fixo: data.ponto_fixo,
    }
    if (isEdit && tecnico) {
      atualizar.mutate({ id: tecnico.id, dados: payload })
    } else {
      criar.mutate(payload)
    }
  }

  const isPending = criar.isPending || atualizar.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar técnico' : 'Novo técnico'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* ── Identificação ── */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome *</FormLabel>
                    <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        className="font-mono"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="regiao"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Região</FormLabel>
                    <FormControl>
                      <Input placeholder="SP Capital / Interior / Outro estado" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* ── Financeiro ── */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Financeiro
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="valor_instalacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor instalação (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="120,00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valor_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor por km (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="1,20"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pix"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Chave PIX</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CPF, e-mail, telefone ou chave aleatória"
                          className="font-mono"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0001-00"
                          className="font-mono"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* ── Endereço ── */}
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, cidade - UF" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Ponto Fixo ── */}
            <FormField
              control={form.control}
              name="ponto_fixo"
              render={({ field }) => (
                <FormItem>
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-sm border px-4 py-3 text-sm transition-colors text-left',
                      field.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-transparent text-muted-foreground hover:border-border/80 hover:text-foreground'
                    )}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-colors',
                      field.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                    )}>
                      <Home className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className={cn('font-medium text-sm', field.value && 'text-foreground')}
                        style={{ fontFamily: 'Oswald, system-ui, sans-serif' }}
                      >
                        PONTO FIXO
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Técnico atende apenas no próprio local
                      </p>
                    </div>
                    <div className={cn(
                      'ml-auto h-2 w-2 rounded-full shrink-0',
                      field.value ? 'bg-primary' : 'bg-border'
                    )} />
                  </button>
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col gap-2 sm:flex-row pt-2">
              {isEdit && tecnico && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => toggleAtivo.mutate()}
                  disabled={toggleAtivo.isPending}
                >
                  <Power className="h-3.5 w-3.5" />
                  {tecnico.ativo ? 'Desativar' : 'Reativar'}
                </Button>
              )}
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar técnico'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
