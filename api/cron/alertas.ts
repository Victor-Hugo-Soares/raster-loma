import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

const STATUSES_PENDENTES = [
  'pendente',
  'aguardando_instalacao',
  'enviar_equipamento',
  'rastreador_enviado',
]

function diasPendente(dataOs: string): number {
  return Math.floor((Date.now() - new Date(dataOs).getTime()) / 86400000)
}

function initAdmin() {
  if (getApps().length) return
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)
  initializeApp({ credential: cert(serviceAccount) })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    initAdmin()
    const db = getFirestore()
    const messaging = getMessaging()

    // Buscar instalações críticas (15+ dias pendentes)
    const instSnap = await db.collection('instalacoes').get()
    const criticos = instSnap.docs.filter((d) => {
      const data = d.data()
      if (!STATUSES_PENDENTES.includes(data.status)) return false
      return diasPendente(data.data_os) >= 15
    })

    if (criticos.length === 0) {
      return res.json({ sent: false, reason: 'Nenhuma instalação crítica' })
    }

    // Buscar tokens registrados
    const tokensSnap = await db.collection('pushTokens').get()
    const tokens = tokensSnap.docs.map((d) => d.data().token as string).filter(Boolean)

    if (tokens.length === 0) {
      return res.json({ sent: false, reason: 'Nenhum dispositivo registrado' })
    }

    const plural = criticos.length > 1
    const titulo = `⚠️ ${criticos.length} instalação${plural ? 'ões' : ''} crítica${plural ? 's' : ''}`
    const corpo = `${plural ? 'Existem' : 'Existe'} ${criticos.length} serviço${plural ? 's' : ''} com mais de 15 dias sem conclusão.`

    // Enviar para todos os tokens em lotes de 500 (limite FCM)
    const lotes = []
    for (let i = 0; i < tokens.length; i += 500) {
      lotes.push(tokens.slice(i, i + 500))
    }

    let totalSucesso = 0
    for (const lote of lotes) {
      const result = await messaging.sendEachForMulticast({
        tokens: lote,
        notification: {
          title: titulo,
          body: corpo,
        },
        webpush: {
          notification: {
            icon: '/favicon.svg',
            requireInteraction: true,
          },
          fcmOptions: {
            link: '/instalacoes?nivel_alerta=critico',
          },
        },
      })
      totalSucesso += result.successCount
    }

    return res.json({ sent: true, criticos: criticos.length, notificados: totalSucesso })
  } catch (err) {
    console.error('Erro no cron de alertas:', err)
    return res.status(500).json({ error: String(err) })
  }
}
