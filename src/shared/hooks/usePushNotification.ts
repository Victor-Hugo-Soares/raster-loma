import { useEffect } from 'react'
import { toast } from 'sonner'
import { requestPushPermission, onForegroundMessage } from '@/infra/firebase/messaging'
import { salvarPushToken } from '@/infra/supabase/repositories/pushTokens.repository'
import { useAuth } from './useAuth'
import { isMockMode } from '@/infra/supabase/client'

export function usePushNotification() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || isMockMode) return
    if (!('Notification' in window)) return

    async function init() {
      try {
        const token = await requestPushPermission()
        if (token && user) {
          await salvarPushToken(user.id, token)
        }
      } catch (err) {
        console.warn('Push notification setup falhou:', err)
      }
    }

    init()

    const unsub = onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {}
      if (title) {
        toast.warning(title, {
          description: body,
          duration: 8000,
          action: {
            label: 'Ver',
            onClick: () => window.location.assign('/instalacoes?nivel_alerta=critico'),
          },
        })
      }
    })

    return unsub
  }, [user?.id])
}
