import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listarCiclos,
  criarCiclo,
  fecharCiclo,
  listarItensCiclo,
  totalPorTecnico,
} from '@/infra/supabase/repositories/faturamento.repository'

export function useCiclos() {
  return useQuery({
    queryKey: ['ciclos'],
    queryFn: listarCiclos,
  })
}

export function useItensCiclo(cicloId: string | null) {
  return useQuery({
    queryKey: ['ciclo-itens', cicloId],
    queryFn: () => listarItensCiclo(cicloId!),
    enabled: !!cicloId,
  })
}

export function useTotalPorTecnico(cicloId: string | null) {
  return useQuery({
    queryKey: ['ciclo-totais', cicloId],
    queryFn: () => totalPorTecnico(cicloId!),
    enabled: !!cicloId,
  })
}

export function useCriarCiclo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: criarCiclo,
    onSuccess: () => {
      toast.success('Ciclo criado com sucesso')
      qc.invalidateQueries({ queryKey: ['ciclos'] })
    },
    onError: (err: Error) => toast.error('Erro ao criar ciclo', { description: err.message }),
  })
}

export function useFecharCiclo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fecharCiclo(id),
    onSuccess: () => {
      toast.success('Ciclo fechado')
      qc.invalidateQueries({ queryKey: ['ciclos'] })
    },
    onError: (err: Error) => toast.error('Erro ao fechar ciclo', { description: err.message }),
  })
}
