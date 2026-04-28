import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db, isMockMode } from '../client'

export async function salvarPushToken(userId: string, token: string) {
  if (isMockMode) return
  await setDoc(doc(db, 'pushTokens', userId), {
    token,
    userId,
    atualizado_em: new Date().toISOString(),
  })
}

export async function removerPushToken(userId: string) {
  if (isMockMode) return
  await deleteDoc(doc(db, 'pushTokens', userId))
}
