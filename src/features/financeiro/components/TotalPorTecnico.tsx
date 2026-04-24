import { useQuery } from '@tanstack/react-query'
import { useTotalPorTecnico } from '../hooks/useCicloFaturamento'
import { listarTecnicos } from '@/infra/supabase/repositories/tecnicos.repository'
import { formatarMoeda } from '@/shared/utils/currencyUtils'
import { Skeleton } from '@/components/ui/skeleton'

interface TotalPorTecnicoProps {
  cicloId: string
}

export default function TotalPorTecnico({ cicloId }: TotalPorTecnicoProps) {
  const { data: totais = {}, isLoading: loadingTotais } = useTotalPorTecnico(cicloId)
  const { data: tecnicos = [] } = useQuery({
    queryKey: ['tecnicos'],
    queryFn: () => listarTecnicos(),
  })

  const tecnicoMap = Object.fromEntries(tecnicos.map((t) => [t.id, t.nome]))
  const entries = Object.entries(totais).sort((a, b) => b[1] - a[1])

  if (loadingTotais) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        Nenhum item neste ciclo
      </p>
    )
  }

  const max = Math.max(...entries.map(([, v]) => v))

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Por técnico
      </p>
      {entries.map(([tecnicoId, valor]) => (
        <div key={tecnicoId} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium truncate max-w-[200px]">
              {tecnicoMap[tecnicoId] ?? tecnicoId}
            </span>
            <span className="font-mono font-semibold text-primary">{formatarMoeda(valor)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(valor / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
