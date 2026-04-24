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
import { db, isMockMode } from '../client'
import type { Tecnico } from '@/types/domain.types'
import { MOCK_TECNICOS, MOCK_INSTALACOES } from '@/infra/mock/mockData'

let mockTecnicos = [...MOCK_TECNICOS]

function newId() {
  return 'mock-tec-' + Math.random().toString(36).slice(2, 10)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTecnico(id: string, data: Record<string, any>): Tecnico {
  return {
    id,
    nome: data.nome,
    nome_normalizado: data.nome_normalizado ?? data.nome.toLowerCase().trim(),
    telefone: data.telefone ?? null,
    regiao: data.regiao ?? null,
    pix: data.pix ?? null,
    endereco: data.endereco ?? null,
    cnpj: data.cnpj ?? null,
    valor_instalacao: data.valor_instalacao ?? null,
    valor_km: data.valor_km ?? null,
    ponto_fixo: data.ponto_fixo ?? false,
    ativo: data.ativo ?? true,
    criado_em: data.criado_em ?? new Date().toISOString(),
    atualizado_em: data.atualizado_em ?? new Date().toISOString(),
  }
}

export async function listarTecnicos(apenasAtivos = false) {
  if (isMockMode) {
    let result = [...mockTecnicos].sort((a, b) => a.nome.localeCompare(b.nome))
    if (apenasAtivos) result = result.filter((t) => t.ativo)
    return result
  }

  let q = query(collection(db, 'tecnicos'), orderBy('nome'))
  if (apenasAtivos) q = query(collection(db, 'tecnicos'), where('ativo', '==', true), orderBy('nome'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => toTecnico(d.id, d.data()))
}

export async function buscarTecnico(id: string) {
  if (isMockMode) {
    const tec = mockTecnicos.find((t) => t.id === id)
    if (!tec) throw new Error('Técnico não encontrado')
    return tec
  }
  const snap = await getDoc(doc(db, 'tecnicos', id))
  if (!snap.exists()) throw new Error('Técnico não encontrado')
  return toTecnico(snap.id, snap.data())
}

export async function criarTecnico(dados: {
  nome: string
  telefone?: string | null
  regiao?: string | null
  pix?: string | null
  endereco?: string | null
  cnpj?: string | null
  valor_instalacao?: number | null
  valor_km?: number | null
  ponto_fixo?: boolean
}) {
  if (isMockMode) {
    const now = new Date().toISOString()
    const newTec: Tecnico = {
      id: newId(),
      nome: dados.nome,
      nome_normalizado: dados.nome.toLowerCase().trim(),
      telefone: dados.telefone ?? null,
      regiao: dados.regiao ?? null,
      pix: dados.pix ?? null,
      endereco: dados.endereco ?? null,
      cnpj: dados.cnpj ?? null,
      valor_instalacao: dados.valor_instalacao ?? null,
      valor_km: dados.valor_km ?? null,
      ponto_fixo: dados.ponto_fixo ?? false,
      ativo: true,
      criado_em: now,
      atualizado_em: now,
    }
    mockTecnicos = [...mockTecnicos, newTec]
    return newTec
  }

  const now = new Date().toISOString()
  const payload = {
    ...dados,
    nome_normalizado: dados.nome.toLowerCase().trim(),
    ativo: true,
    criado_em: now,
    atualizado_em: now,
  }
  const ref = await addDoc(collection(db, 'tecnicos'), payload)
  return toTecnico(ref.id, payload)
}

export async function atualizarTecnico(
  id: string,
  dados: Partial<{
    nome: string
    telefone: string | null
    regiao: string | null
    pix: string | null
    endereco: string | null
    cnpj: string | null
    valor_instalacao: number | null
    valor_km: number | null
    ponto_fixo: boolean
    ativo: boolean
  }>
) {
  if (isMockMode) {
    const idx = mockTecnicos.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Técnico não encontrado')
    const updated: Tecnico = {
      ...mockTecnicos[idx],
      ...dados,
      nome_normalizado: dados.nome
        ? dados.nome.toLowerCase().trim()
        : mockTecnicos[idx].nome_normalizado,
      atualizado_em: new Date().toISOString(),
    }
    mockTecnicos = mockTecnicos.map((t) => (t.id === id ? updated : t))
    return updated
  }

  const patch = {
    ...dados,
    ...(dados.nome ? { nome_normalizado: dados.nome.toLowerCase().trim() } : {}),
    atualizado_em: new Date().toISOString(),
  }
  await updateDoc(doc(db, 'tecnicos', id), patch)
  const snap = await getDoc(doc(db, 'tecnicos', id))
  return toTecnico(snap.id, snap.data()!)
}

export async function contarInstalacoesPorTecnico() {
  if (isMockMode) {
    const counts: Record<string, { total: number; pendentes: number; concluidas: number }> = {}
    MOCK_INSTALACOES.forEach((i) => {
      if (!i.tecnico_id) return
      if (!counts[i.tecnico_id]) counts[i.tecnico_id] = { total: 0, pendentes: 0, concluidas: 0 }
      counts[i.tecnico_id].total++
      if (['pendente', 'aguardando_instalacao', 'enviar_equipamento', 'rastreador_enviado'].includes(i.status)) counts[i.tecnico_id].pendentes++
      else counts[i.tecnico_id].concluidas++
    })
    return counts
  }

  const snap = await getDocs(collection(db, 'instalacoes'))
  const counts: Record<string, { total: number; pendentes: number; concluidas: number }> = {}
  snap.docs.forEach((d) => {
    const data = d.data()
    const tid = data.tecnico_id as string | null
    if (!tid) return
    if (!counts[tid]) counts[tid] = { total: 0, pendentes: 0, concluidas: 0 }
    counts[tid].total++
    if (['pendente', 'aguardando_instalacao', 'enviar_equipamento', 'rastreador_enviado'].includes(data.status)) counts[tid].pendentes++
    else counts[tid].concluidas++
  })
  return counts
}
