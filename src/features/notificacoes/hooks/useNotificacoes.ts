import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listarNotificacoes,
  contarNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas,
} from '@/infra/supabase/repositories/notificacoes.repository'
import { useAuth } from '@/shared/hooks/useAuth'

export function useNotificacoes() {
  return useQuery({
    queryKey: ['notificacoes'],
    queryFn: () => listarNotificacoes(),
    staleTime: 1000 * 30,
  })
}

export function useNotificacoesNaoLidas() {
  const { data: count = 0 } = useQuery({
    queryKey: ['notificacoes-count'],
    queryFn: contarNaoLidas,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 30,
  })
  return { count }
}

export function useMarcarLida() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (id: string) => marcarComoLida(id, user?.id ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificacoes'] })
      qc.invalidateQueries({ queryKey: ['notificacoes-count'] })
    },
    onError: (err: Error) => toast.error('Erro', { description: err.message }),
  })
}

export function useMarcarTodasLidas() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: () => marcarTodasComoLidas(user?.id ?? ''),
    onSuccess: () => {
      toast.success('Todas as notificações marcadas como lidas')
      qc.invalidateQueries({ queryKey: ['notificacoes'] })
      qc.invalidateQueries({ queryKey: ['notificacoes-count'] })
    },
    onError: (err: Error) => toast.error('Erro', { description: err.message }),
  })
}
