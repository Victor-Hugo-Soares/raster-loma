import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { collection, onSnapshot } from 'firebase/firestore'
import { db, isMockMode } from '@/infra/supabase/client'

export function useRealtimeInstalacoes() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isMockMode) return

    const unsub = onSnapshot(collection(db, 'instalacoes'), () => {
      queryClient.invalidateQueries({ queryKey: ['instalacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    })

    return unsub
  }, [queryClient])
}
