import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  limit,
  getCountFromServer,
} from 'firebase/firestore'
import { db } from '../client'
import type { NotificacaoAlerta } from '@/types/domain.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNotificacao(id: string, data: Record<string, any>): NotificacaoAlerta {
  return {
    id,
    instalacao_id: data.instalacao_id,
    nivel: data.nivel,
    dias_atraso: data.dias_atraso,
    enviada_em: data.enviada_em ?? new Date().toISOString(),
    lida: data.lida ?? false,
    lida_por: data.lida_por ?? null,
    lida_em: data.lida_em ?? null,
    canal: data.canal ?? 'web',
    justificativa: data.justificativa ?? null,
  }
}

export async function listarNotificacoes(apenasNaoLidas = false) {
  let q = query(
    collection(db, 'notificacoesAlertas'),
    orderBy('enviada_em', 'desc'),
    limit(100)
  )
  if (apenasNaoLidas) {
    q = query(
      collection(db, 'notificacoesAlertas'),
      where('lida', '==', false),
      orderBy('enviada_em', 'desc'),
      limit(100)
    )
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => toNotificacao(d.id, d.data()))
}

export async function contarNaoLidas() {
  const q = query(collection(db, 'notificacoesAlertas'), where('lida', '==', false))
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function marcarComoLida(id: string, userId: string) {
  const now = new Date().toISOString()
  await updateDoc(doc(db, 'notificacoesAlertas', id), {
    lida: true,
    lida_por: userId,
    lida_em: now,
  })
  const snap = await getDocs(
    query(collection(db, 'notificacoesAlertas'), where('lida', '==', true), limit(1))
  )
  // Return updated document by re-fetching via listarNotificacoes filter
  const all = await listarNotificacoes()
  const updated = all.find((n) => n.id === id)
  if (!updated) throw new Error('Notificação não encontrada')
  return updated
}

export async function marcarTodasComoLidas(userId: string) {
  const q = query(collection(db, 'notificacoesAlertas'), where('lida', '==', false))
  const snap = await getDocs(q)
  const now = new Date().toISOString()
  await Promise.all(
    snap.docs.map((d) =>
      updateDoc(doc(db, 'notificacoesAlertas', d.id), { lida: true, lida_por: userId, lida_em: now })
    )
  )
}
