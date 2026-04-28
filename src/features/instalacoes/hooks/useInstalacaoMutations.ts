import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  criarInstalacao,
  atualizarInstalacao,
  atualizarStatus,
  marcarAppEnviado,
  type CriarInstalacaoData,
} from '@/infra/supabase/repositories/instalacoes.repository'
import type { StatusInstalacao } from '@/types/domain.types'

function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['instalacoes'] })
    qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
  }
}

export function useCriarInstalacao() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (dados: CriarInstalacaoData) => criarInstalacao(dados),
    onSuccess: () => {
      toast.success('Instalação criada com sucesso')
      invalidate()
    },
    onError: (err: Error) => {
      toast.error('Erro ao criar instalação', { description: err.message })
    },
  })
}

export function useAtualizarInstalacao() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<CriarInstalacaoData> }) =>
      atualizarInstalacao(id, dados),
    onSuccess: () => {
      toast.success('Instalação atualizada')
      invalidate()
    },
    onError: (err: Error) => {
      toast.error('Erro ao atualizar', { description: err.message })
    },
  })
}

export function useAtualizarStatus() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, status, justificativa }: { id: string; status: StatusInstalacao; justificativa?: string }) =>
      atualizarStatus(id, status, justificativa),
    onSuccess: () => {
      toast.success('Status atualizado')
      invalidate()
    },
    onError: (err: Error) => {
      toast.error('Erro ao atualizar status', { description: err.message })
    },
  })
}

export function useMarcarAppEnviado() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => marcarAppEnviado(id),
    onSuccess: () => {
      toast.success('APP marcado como enviado ✓')
      invalidate()
    },
    onError: (err: Error) => {
      toast.error('Erro', { description: err.message })
    },
  })
}
