import { useState } from 'react'
import { Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { formatarData } from '@/shared/utils/dateUtils'
import { formatarMoeda } from '@/shared/utils/currencyUtils'
import { useFecharCiclo, useItensCiclo } from '../hooks/useCicloFaturamento'
import type { CicloFaturamentoModel } from '@/types/domain.types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import TotalPorTecnico from './TotalPorTecnico'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface CicloFaturamentoCardProps {
  ciclo: CicloFaturamentoModel
}

export default function CicloFaturamentoCard({ ciclo }: CicloFaturamentoCardProps) {
  const [expanded, setExpanded] = useState(false)
  const fechar = useFecharCiclo()
  const { data: itens = [] } = useItensCiclo(expanded ? ciclo.id : null)

  const totalItens = itens.reduce((s, i) => s + i.valor_total, 0)
  const cicloLabel = ciclo.ciclo === 'dia_10' ? 'Dia 10' : 'Dia 20'

  return (
    <Card className={ciclo.fechado ? 'opacity-75' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-bold">
              {cicloLabel}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {MESES[ciclo.mes - 1]} {ciclo.ano}
              </p>
              <p className="text-xs text-muted-foreground">
                Fechamento: {formatarData(ciclo.data_fechamento)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ciclo.fechado ? (
              <Badge variant="success" className="gap-1">
                <Lock className="h-3 w-3" />
                Fechado
              </Badge>
            ) : (
              <Badge variant="warning">Em aberto</Badge>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          <Separator className="mb-4" />

          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total do ciclo</p>
              <p className="text-xl font-bold text-primary">{formatarMoeda(ciclo.total_pago ?? totalItens)}</p>
              <p className="text-xs text-muted-foreground">{itens.length} instalações</p>
            </div>
            {!ciclo.fechado && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fechar.mutate(ciclo.id)}
                disabled={fechar.isPending}
              >
                <Lock className="h-3.5 w-3.5" />
                Fechar ciclo
              </Button>
            )}
          </div>

          <TotalPorTecnico cicloId={ciclo.id} />
        </CardContent>
      )}
    </Card>
  )
}
