import { getApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging'
import { isMockMode } from '@/infra/supabase/client'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined

export function getMessagingInstance() {
  if (isMockMode || !VAPID_KEY) return null
  try {
    return getMessaging(getApp())
  } catch {
    return null
  }
}

export async function requestPushPermission(): Promise<string | null> {
  if (isMockMode || !VAPID_KEY) return null
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  const messaging = getMessagingInstance()
  if (!messaging) return null

  const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
  return token || null
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  const messaging = getMessagingInstance()
  if (!messaging) return () => {}
  return onMessage(messaging, callback)
}
