import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
} from 'firebase/firestore'
import { db, isMockMode } from '../client'
import type { Pagamento, StatusPagamento } from '@/types/domain.types'
import { MOCK_PAGAMENTOS, MOCK_TECNICOS } from '@/infra/mock/mockData'

export type CriarPagamentoData = {
  numero_nf?: string | null
  valor: number
  tecnico_id: string
  cnpj?: string | null
  status: StatusPagamento
  data_vencimento?: string | null
  data_pagamento?: string | null
  observacoes?: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPagamento(id: string, data: Record<string, any>): Pagamento {
  return {
    id,
    numero_nf: data.numero_nf ?? null,
    valor: data.valor ?? 0,
    tecnico_id: data.tecnico_id,
    tecnico_nome: data.tecnico_nome ?? null,
    cnpj: data.cnpj ?? null,
    status: (data.status ?? 'a_pagar') as StatusPagamento,
    data_vencimento: data.data_vencimento ?? null,
    data_pagamento: data.data_pagamento ?? null,
    observacoes: data.observacoes ?? null,
    criado_em: data.criado_em ?? new Date().toISOString(),
    atualizado_em: data.atualizado_em ?? new Date().toISOString(),
  }
}

function newId() {
  return 'pag-' + Math.random().toString(36).slice(2, 10)
}

let mockStore = [...MOCK_PAGAMENTOS]

export async function listarPagamentos() {
  if (isMockMode) return [...mockStore].sort((a, b) => b.criado_em.localeCompare(a.criado_em))
  const snap = await getDocs(collection(db, 'pagamentos'))
  return snap.docs.map((d) => toPagamento(d.id, d.data()))
}

export async function criarPagamento(dados: CriarPagamentoData) {
  const tec = isMockMode
    ? MOCK_TECNICOS.find((t) => t.id === dados.tecnico_id)
    : null

  if (isMockMode) {
    const now = new Date().toISOString()
    const item: Pagamento = {
      id: newId(),
      numero_nf: dados.numero_nf ?? null,
      valor: dados.valor,
      tecnico_id: dados.tecnico_id,
      tecnico_nome: tec?.nome ?? null,
      cnpj: dados.cnpj ?? tec?.cnpj ?? null,
      status: dados.status,
      data_vencimento: dados.data_vencimento ?? null,
      data_pagamento: dados.data_pagamento ?? null,
      observacoes: dados.observacoes ?? null,
      criado_em: now,
      atualizado_em: now,
    }
    mockStore = [item, ...mockStore]
    return item
  }

  let tecnico_nome: string | null = null
  const tecSnap = await getDoc(doc(db, 'tecnicos', dados.tecnico_id))
  if (tecSnap.exists()) tecnico_nome = (tecSnap.data().nome as string) ?? null

  const now = new Date().toISOString()
  const payload = { ...dados, tecnico_nome, criado_em: now, atualizado_em: now }
  const ref = await addDoc(collection(db, 'pagamentos'), payload)
  return toPagamento(ref.id, payload)
}

export async function atualizarPagamento(id: string, dados: Partial<CriarPagamentoData>) {
  if (isMockMode) {
    const idx = mockStore.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Pagamento não encontrado')
    const updated: Pagamento = {
      ...mockStore[idx],
      ...dados,
      status: (dados.status ?? mockStore[idx].status) as StatusPagamento,
      atualizado_em: new Date().toISOString(),
    }
    mockStore = mockStore.map((p) => (p.id === id ? updated : p))
    return updated
  }
  const patch = { ...dados, atualizado_em: new Date().toISOString() }
  await updateDoc(doc(db, 'pagamentos', id), patch)
  const snap = await getDoc(doc(db, 'pagamentos', id))
  return toPagamento(snap.id, snap.data()!)
}

export async function marcarComoPago(id: string) {
  return atualizarPagamento(id, {
    status: 'pago',
    data_pagamento: new Date().toISOString().split('T')[0],
  })
}
