import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db, isMockMode } from '../client'
import type { Equipamento, StatusEquipamento } from '@/types/domain.types'
import { MOCK_EQUIPAMENTOS, MOCK_TECNICOS } from '@/infra/mock/mockData'

export interface FiltrosEquipamento {
  status?: StatusEquipamento | 'todos'
  tecnico_id?: string
  busca?: string
}

export type CriarEquipamentoData = {
  imei: string
  numero_linha?: string | null
  modelo?: string
  tecnologia?: string | null
  status?: StatusEquipamento
  tecnico_id?: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEquipamento(id: string, data: Record<string, any>): Equipamento {
  return {
    id,
    imei: data.imei,
    numero_linha: data.numero_linha ?? null,
    modelo: data.modelo ?? 'N4P',
    tecnologia: data.tecnologia ?? null,
    status: (data.status ?? 'disponivel') as StatusEquipamento,
    tecnico_id: data.tecnico_id ?? null,
    placa_atual: data.placa_atual ?? null,
    criado_em: data.criado_em ?? new Date().toISOString(),
    atualizado_em: data.atualizado_em ?? new Date().toISOString(),
  }
}

function newId() {
  return 'eq-' + Math.random().toString(36).slice(2, 10)
}

let mockStore = [...MOCK_EQUIPAMENTOS]

function applyFilters(items: Equipamento[], filtros: FiltrosEquipamento) {
  let result = [...items]
  const { busca, status, tecnico_id } = filtros
  if (status && status !== 'todos') result = result.filter((e) => e.status === status)
  if (tecnico_id) result = result.filter((e) => e.tecnico_id === tecnico_id)
  if (busca) {
    const q = busca.toLowerCase()
    result = result.filter(
      (e) =>
        e.imei.toLowerCase().includes(q) ||
        (e.numero_linha ?? '').toLowerCase().includes(q) ||
        e.modelo.toLowerCase().includes(q)
    )
  }
  return result
}

export async function listarEquipamentos(filtros: FiltrosEquipamento = {}) {
  if (isMockMode) return applyFilters(mockStore, filtros)
  const snap = await getDocs(collection(db, 'equipamentos'))
  const all = snap.docs.map((d) => toEquipamento(d.id, d.data()))
  return applyFilters(all, filtros)
}

export async function buscarEquipamento(id: string) {
  if (isMockMode) {
    const item = mockStore.find((e) => e.id === id)
    if (!item) throw new Error('Equipamento não encontrado')
    return item
  }
  const snap = await getDoc(doc(db, 'equipamentos', id))
  if (!snap.exists()) throw new Error('Equipamento não encontrado')
  return toEquipamento(snap.id, snap.data())
}

export async function criarEquipamento(dados: CriarEquipamentoData) {
  if (isMockMode) {
    const now = new Date().toISOString()
    const tec = MOCK_TECNICOS.find((t) => t.id === dados.tecnico_id)
    const item: Equipamento = {
      id: newId(),
      imei: dados.imei,
      numero_linha: dados.numero_linha ?? null,
      modelo: dados.modelo ?? 'N4P',
      tecnologia: dados.tecnologia ?? null,
      status: dados.status ?? 'disponivel',
      tecnico_id: dados.tecnico_id ?? null,
      placa_atual: null,
      criado_em: now,
      atualizado_em: now,
    }
    void tec
    mockStore = [item, ...mockStore]
    return item
  }

  const now = new Date().toISOString()
  const payload = {
    imei: dados.imei,
    numero_linha: dados.numero_linha ?? null,
    modelo: dados.modelo ?? 'N4P',
    tecnologia: dados.tecnologia ?? null,
    status: dados.status ?? 'disponivel',
    tecnico_id: dados.tecnico_id ?? null,
    placa_atual: null,
    criado_em: now,
    atualizado_em: now,
  }
  const ref = await addDoc(collection(db, 'equipamentos'), payload)
  return toEquipamento(ref.id, payload)
}

export async function criarEquipamentosEmMassa(lista: CriarEquipamentoData[]) {
  if (isMockMode) {
    const now = new Date().toISOString()
    const items: Equipamento[] = lista.map((dados) => ({
      id: newId(),
      imei: dados.imei,
      numero_linha: dados.numero_linha ?? null,
      modelo: dados.modelo ?? 'N4P',
      tecnologia: dados.tecnologia ?? null,
      status: 'disponivel' as StatusEquipamento,
      tecnico_id: null,
      placa_atual: null,
      criado_em: now,
      atualizado_em: now,
    }))
    mockStore = [...items, ...mockStore]
    return items
  }

  const now = new Date().toISOString()
  const chunks: CriarEquipamentoData[][] = []
  for (let i = 0; i < lista.length; i += 499) chunks.push(lista.slice(i, i + 499))

  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach((dados) => {
      const ref = doc(collection(db, 'equipamentos'))
      batch.set(ref, {
        imei: dados.imei,
        numero_linha: dados.numero_linha ?? null,
        modelo: dados.modelo ?? 'N4P',
        tecnologia: dados.tecnologia ?? null,
        status: 'disponivel',
        tecnico_id: null,
        placa_atual: null,
        criado_em: now,
        atualizado_em: now,
      })
    })
    await batch.commit()
  }
}

export async function atualizarEquipamento(
  id: string,
  dados: Partial<CriarEquipamentoData & { placa_atual: string | null; status: StatusEquipamento }>
) {
  if (isMockMode) {
    const idx = mockStore.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Equipamento não encontrado')
    const updated: Equipamento = {
      ...mockStore[idx],
      ...dados,
      modelo: dados.modelo ?? mockStore[idx].modelo,
      status: (dados.status ?? mockStore[idx].status) as StatusEquipamento,
      atualizado_em: new Date().toISOString(),
    }
    mockStore = mockStore.map((e) => (e.id === id ? updated : e))
    return updated
  }

  const patch = { ...dados, atualizado_em: new Date().toISOString() }
  await updateDoc(doc(db, 'equipamentos', id), patch)
  const snap = await getDoc(doc(db, 'equipamentos', id))
  return toEquipamento(snap.id, snap.data()!)
}
