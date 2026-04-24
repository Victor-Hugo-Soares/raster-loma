import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  criarEquipamento,
  criarEquipamentosEmMassa,
  atualizarEquipamento,
  type CriarEquipamentoData,
} from '@/infra/supabase/repositories/equipamentos.repository'
import type { StatusEquipamento } from '@/types/domain.types'

export function useCriarEquipamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dados: CriarEquipamentoData) => criarEquipamento(dados),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipamentos'] }) },
  })
}

export function useCriarEquipamentosEmMassa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lista: CriarEquipamentoData[]) => criarEquipamentosEmMassa(lista),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipamentos'] }) },
  })
}

export function useAtualizarEquipamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<CriarEquipamentoData & { placa_atual: string | null; status: StatusEquipamento }> }) =>
      atualizarEquipamento(id, dados),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipamentos'] }) },
  })
}
