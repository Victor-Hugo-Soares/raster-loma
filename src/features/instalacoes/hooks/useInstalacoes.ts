import { useQuery } from '@tanstack/react-query'
import {
  listarInstalacoes,
  contarPorStatus,
  contarCriticos,
  type FiltrosInstalacao,
} from '@/infra/supabase/repositories/instalacoes.repository'

export function useInstalacoes(filtros: FiltrosInstalacao = {}) {
  return useQuery({
    queryKey: ['instalacoes', filtros],
    queryFn: () => listarInstalacoes(filtros),
  })
}

export function useEstatisticasStatus() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [counts, criticos] = await Promise.all([contarPorStatus(), contarCriticos()])
      return { counts, criticos }
    },
    staleTime: 1000 * 30,
  })
}
