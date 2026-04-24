import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { db } from '../client'
import type { CicloFaturamentoModel, ItemFaturamento } from '@/types/domain.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCiclo(id: string, data: Record<string, any>): CicloFaturamentoModel {
  return {
    id,
    ciclo: data.ciclo,
    mes: data.mes,
    ano: data.ano,
    data_fechamento: data.data_fechamento,
    total_pago: data.total_pago ?? null,
    fechado: data.fechado ?? false,
    criado_em: data.criado_em ?? new Date().toISOString(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toItem(id: string, data: Record<string, any>): ItemFaturamento {
  const km = data.valor_km ?? 0
  const inst = data.valor_instalacao ?? 0
  const ped = data.valor_pedagio ?? 0
  return {
    id,
    ciclo_id: data.ciclo_id,
    instalacao_id: data.instalacao_id,
    tecnico_id: data.tecnico_id,
    valor_km: km,
    valor_instalacao: inst,
    valor_pedagio: ped,
    valor_total: data.valor_total ?? km + inst + ped,
    tipo_ocorrencia: data.tipo_ocorrencia ?? 'normal',
    observacao: data.observacao ?? null,
    criado_em: data.criado_em ?? new Date().toISOString(),
  }
}

export async function listarCiclos() {
  const snap = await getDocs(
    query(collection(db, 'ciclosFaturamento'), orderBy('ano', 'desc'), orderBy('mes', 'desc'))
  )
  return snap.docs.map((d) => toCiclo(d.id, d.data()))
}

export async function criarCiclo(dados: {
  ciclo: 'dia_10' | 'dia_20'
  mes: number
  ano: number
  data_fechamento: string
}) {
  const now = new Date().toISOString()
  const payload = { ...dados, fechado: false, total_pago: null, criado_em: now }
  const ref = await addDoc(collection(db, 'ciclosFaturamento'), payload)
  return toCiclo(ref.id, payload)
}

export async function fecharCiclo(id: string) {
  await updateDoc(doc(db, 'ciclosFaturamento', id), { fechado: true })
  const snap = await getDoc(doc(db, 'ciclosFaturamento', id))
  return toCiclo(snap.id, snap.data()!)
}

export async function listarItensCiclo(cicloId: string) {
  const snap = await getDocs(
    query(collection(db, 'itensFaturamento'), where('ciclo_id', '==', cicloId), orderBy('criado_em'))
  )
  return snap.docs.map((d) => toItem(d.id, d.data()))
}

export async function adicionarItemCiclo(dados: {
  ciclo_id: string
  instalacao_id: string
  tecnico_id: string
  valor_km: number
  valor_instalacao: number
  valor_pedagio: number
  tipo_ocorrencia?: string
  observacao?: string | null
}) {
  const now = new Date().toISOString()
  const payload = {
    ...dados,
    valor_total: dados.valor_km + dados.valor_instalacao + dados.valor_pedagio,
    tipo_ocorrencia: dados.tipo_ocorrencia ?? 'normal',
    observacao: dados.observacao ?? null,
    criado_em: now,
  }
  const ref = await addDoc(collection(db, 'itensFaturamento'), payload)
  return toItem(ref.id, payload)
}

export async function totalPorTecnico(cicloId: string) {
  const snap = await getDocs(
    query(collection(db, 'itensFaturamento'), where('ciclo_id', '==', cicloId))
  )
  const totais: Record<string, number> = {}
  snap.docs.forEach((d) => {
    const data = d.data()
    const km = data.valor_km ?? 0
    const inst = data.valor_instalacao ?? 0
    const ped = data.valor_pedagio ?? 0
    const total = data.valor_total ?? km + inst + ped
    totais[data.tecnico_id] = (totais[data.tecnico_id] ?? 0) + total
  })
  return totais
}
