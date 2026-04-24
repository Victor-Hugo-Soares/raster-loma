import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSign, Plus } from 'lucide-react'
import { useCiclos, useCriarCiclo } from '@/features/financeiro/hooks/useCicloFaturamento'
import CicloFaturamentoCard from '@/features/financeiro/components/CicloFaturamentoCard'
import { cicloSchema, type CicloFormData } from '@/features/financeiro/schemas/faturamento.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export default function FinanceiroPage() {
  const [open, setOpen] = useState(false)
  const { data: ciclos = [], isLoading } = useCiclos()

  const abertos = ciclos.filter((c) => !c.fechado)
  const fechados = ciclos.filter((c) => c.fechado)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-bold">Financeiro</h1>
            <p className="text-sm text-muted-foreground">Ciclos de faturamento dia 10 e dia 20</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo ciclo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {abertos.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Em aberto ({abertos.length})
              </p>
              <div className="space-y-3">
                {abertos.map((c) => (
                  <CicloFaturamentoCard key={c.id} ciclo={c} />
                ))}
              </div>
            </div>
          )}
          {fechados.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fechados ({fechados.length})
              </p>
              <div className="space-y-3">
                {fechados.map((c) => (
                  <CicloFaturamentoCard key={c.id} ciclo={c} />
                ))}
              </div>
            </div>
          )}
          {ciclos.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <DollarSign className="h-10 w-10 opacity-30" />
              <p className="text-sm">Nenhum ciclo criado ainda</p>
              <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                Criar primeiro ciclo
              </Button>
            </div>
          )}
        </div>
      )}

      <NovoCicloDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

function NovoCicloDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const criar = useCriarCiclo()
  const now = new Date()

  const form = useForm<CicloFormData>({
    resolver: zodResolver(cicloSchema),
    defaultValues: {
      ciclo: 'dia_10',
      mes: now.getMonth() + 1,
      ano: now.getFullYear(),
      data_fechamento: new Date(now.getFullYear(), now.getMonth(), 10)
        .toISOString()
        .split('T')[0],
    },
  })

  function onSubmit(data: CicloFormData) {
    criar.mutate(
      { ...data, ciclo: data.ciclo as 'dia_10' | 'dia_20' },
      { onSuccess: () => { onOpenChange(false); form.reset() } }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo ciclo de faturamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ciclo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciclo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="dia_10">Dia 10</SelectItem>
                      <SelectItem value="dia_20">Dia 20</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="mes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={12} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input type="number" min={2020} max={2100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="data_fechamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de fechamento</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={criar.isPending}>
                {criar.isPending ? 'Criando...' : 'Criar ciclo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
