import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
} from 'firebase/firestore'
import { db, isMockMode } from '../client'
import type { InstalacaoComAtraso, StatusInstalacao, TipoServico, NivelAlerta } from '@/types/domain.types'
import {
  MOCK_INSTALACOES,
  MOCK_TECNICOS,
  mockContarPorStatus,
  mockContarCriticos,
} from '@/infra/mock/mockData'

export interface FiltrosInstalacao {
  status?: StatusInstalacao | 'todos'
  tecnico_id?: string
  nivel_alerta?: string
  cidade?: string
  busca?: string
  page?: number
  pageSize?: number
}

// Statuses que ainda não foram instalados (contam para atraso)
const STATUSES_PENDENTES: StatusInstalacao[] = [
  'pendente',
  'aguardando_instalacao',
  'enviar_equipamento',
  'rastreador_enviado',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeDiasPendente(dataOs: string | null, status: string): number | null {
  if (!dataOs || !STATUSES_PENDENTES.includes(status as StatusInstalacao)) return null
  const diffMs = Date.now() - new Date(dataOs).getTime()
  return Math.max(0, Math.floor(diffMs / 86400000))
}

function computeNivelAlerta(dias: number | null): NivelAlerta | null {
  if (dias == null) return null
  if (dias >= 15) return 'critico'
  if (dias >= 10) return 'vermelho'
  if (dias >= 7) return 'laranja'
  if (dias >= 5) return 'amarelo'
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toInstalacaoComAtraso(id: string, data: Record<string, any>): InstalacaoComAtraso {
  const dias = computeDiasPendente(data.data_os ?? null, data.status)
  return {
    id,
    card_externo: data.card_externo ?? null,
    nome_cliente: data.nome_cliente,
    telefone_cliente: data.telefone_cliente ?? null,
    endereco_cliente: data.endereco_cliente ?? null,
    placa: data.placa,
    data_agendamento: data.data_agendamento ?? null,
    modelo_veiculo: data.modelo_veiculo ?? null,
    cidade: data.cidade ?? null,
    uf: data.uf ?? null,
    responsavel: data.responsavel ?? null,
    data_os: data.data_os ?? null,
    tipo_servico: (data.tipo_servico ?? 'instalacao') as TipoServico,
    status: data.status as StatusInstalacao,
    data_instalacao: data.data_instalacao ?? null,
    tecnico_id: data.tecnico_id ?? null,
    tecnico_nome: data.tecnico_nome ?? null,
    local_instalacao: data.local_instalacao ?? null,
    imei: data.imei ?? null,
    data_envio: data.data_envio ?? null,
    codigo_rastreio: data.codigo_rastreio ?? null,
    custo_km: data.custo_km ?? null,
    custo_instalacao: data.custo_instalacao ?? null,
    custo_pedagio: data.custo_pedagio ?? null,
    app_enviado: data.app_enviado ?? false,
    app_enviado_em: data.app_enviado_em ?? null,
    diluido: data.diluido ?? false,
    observacoes: data.observacoes ?? null,
    prioridade: data.prioridade ?? false,
    faturado: data.faturado ?? false,
    criado_em: data.criado_em ?? new Date().toISOString(),
    atualizado_em: data.atualizado_em ?? new Date().toISOString(),
    criado_por: data.criado_por ?? null,
    dias_pendente: dias,
    nivel_alerta: computeNivelAlerta(dias),
  }
}

function applyFilters(items: InstalacaoComAtraso[], filtros: FiltrosInstalacao) {
  const { busca, status, tecnico_id, nivel_alerta } = filtros
  let result = [...items]
  if (status && status !== 'todos') result = result.filter((i) => i.status === status)
  if (tecnico_id) result = result.filter((i) => i.tecnico_id === tecnico_id)
  if (nivel_alerta && nivel_alerta !== 'todos') result = result.filter((i) => i.nivel_alerta === nivel_alerta)
  if (busca) {
    const q = busca.toLowerCase()
    result = result.filter(
      (i) =>
        i.nome_cliente.toLowerCase().includes(q) ||
        i.placa.toLowerCase().includes(q) ||
        (i.card_externo ?? '').toLowerCase().includes(q)
    )
  }
  result.sort((a, b) => {
    if (b.prioridade !== a.prioridade) return Number(b.prioridade) - Number(a.prioridade)
    if ((b.dias_pendente ?? 0) !== (a.dias_pendente ?? 0))
      return (b.dias_pendente ?? 0) - (a.dias_pendente ?? 0)
    if (a.data_os && b.data_os) return b.data_os.localeCompare(a.data_os)
    return 0
  })
  return result
}

// ─── Mock store ───────────────────────────────────────────────────────────────
let mockStore = [...MOCK_INSTALACOES]

function filterMock(filtros: FiltrosInstalacao) {
  const { page = 0, pageSize = 50 } = filtros
  const result = applyFilters(mockStore, filtros)
  return { data: result.slice(page * pageSize, (page + 1) * pageSize), count: result.length }
}

function newId() {
  return 'mock-' + Math.random().toString(36).slice(2, 10)
}

// ─── Exported functions ───────────────────────────────────────────────────────
export async function listarInstalacoes(filtros: FiltrosInstalacao = {}) {
  if (isMockMode) return filterMock(filtros)

  const { page = 0, pageSize = 50 } = filtros
  const snap = await getDocs(collection(db, 'instalacoes'))
  const all = snap.docs.map((d) => toInstalacaoComAtraso(d.id, d.data()))
  const filtered = applyFilters(all, filtros)
  return {
    data: filtered.slice(page * pageSize, (page + 1) * pageSize),
    count: filtered.length,
  }
}

export async function buscarInstalacao(id: string) {
  if (isMockMode) {
    const item = mockStore.find((i) => i.id === id)
    if (!item) throw new Error('Instalação não encontrada')
    return item
  }
  const snap = await getDoc(doc(db, 'instalacoes', id))
  if (!snap.exists()) throw new Error('Instalação não encontrada')
  return toInstalacaoComAtraso(snap.id, snap.data())
}

export type CriarInstalacaoData = {
  nome_cliente: string
  telefone_cliente?: string | null
  endereco_cliente?: string | null
  placa: string
  status?: string
  data_agendamento?: string | null
  card_externo?: string | null
  modelo_veiculo?: string | null
  responsavel?: string | null
  data_os?: string | null
  tipo_servico?: string
  tecnico_id?: string | null
  data_envio?: string | null
  imei?: string | null
  codigo_rastreio?: string | null
  data_instalacao?: string | null
  local_instalacao?: string | null
  custo_km?: number | null
  custo_instalacao?: number | null
  custo_pedagio?: number | null
  observacoes?: string | null
  prioridade?: boolean
  diluido?: boolean
}

export async function criarInstalacao(dados: CriarInstalacaoData) {
  if (isMockMode) {
    const tec = MOCK_TECNICOS.find((t) => t.id === dados.tecnico_id)
    const now = new Date().toISOString()
    const status = (dados.status ?? (dados.tecnico_id ? 'aguardando_instalacao' : 'pendente')) as StatusInstalacao
    const newItem: InstalacaoComAtraso = {
      id: newId(),
      card_externo: dados.card_externo ?? null,
      nome_cliente: dados.nome_cliente,
      telefone_cliente: dados.telefone_cliente ?? null,
      endereco_cliente: dados.endereco_cliente ?? null,
      placa: dados.placa,
      data_agendamento: dados.data_agendamento ?? null,
      modelo_veiculo: dados.modelo_veiculo ?? null,
      cidade: null,
      uf: null,
      responsavel: dados.responsavel ?? null,
      data_os: dados.data_os ?? null,
      tipo_servico: (dados.tipo_servico ?? 'instalacao') as TipoServico,
      status,
      data_instalacao: dados.data_instalacao ?? null,
      tecnico_id: dados.tecnico_id ?? null,
      tecnico_nome: tec?.nome ?? null,
      local_instalacao: dados.local_instalacao ?? null,
      imei: dados.imei ?? null,
      data_envio: dados.data_envio ?? null,
      codigo_rastreio: dados.codigo_rastreio ?? null,
      custo_km: dados.custo_km ?? null,
      custo_instalacao: dados.custo_instalacao ?? null,
      custo_pedagio: dados.custo_pedagio ?? null,
      app_enviado: false,
      app_enviado_em: null,
      diluido: dados.diluido ?? false,
      observacoes: dados.observacoes ?? null,
      prioridade: dados.prioridade ?? false,
      faturado: false,
      criado_em: now,
      atualizado_em: now,
      criado_por: null,
      dias_pendente: null,
      nivel_alerta: null,
    }
    mockStore = [newItem, ...mockStore]
    return newItem
  }

  let tecnico_nome: string | null = null
  if (dados.tecnico_id) {
    const tecSnap = await getDoc(doc(db, 'tecnicos', dados.tecnico_id))
    if (tecSnap.exists()) tecnico_nome = (tecSnap.data().nome as string) ?? null
  }

  const status = dados.status ?? (dados.tecnico_id ? 'aguardando_instalacao' : 'pendente')
  const now = new Date().toISOString()
  const payload = {
    ...dados,
    status,
    tecnico_nome,
    app_enviado: false,
    faturado: false,
    criado_em: now,
    atualizado_em: now,
  }
  const ref = await addDoc(collection(db, 'instalacoes'), payload)
  return toInstalacaoComAtraso(ref.id, payload)
}

export async function atualizarInstalacao(
  id: string,
  dados: Partial<CriarInstalacaoData & { app_enviado: boolean; app_enviado_em: string | null }>
) {
  if (isMockMode) {
    const idx = mockStore.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Instalação não encontrada')
    const tec = dados.tecnico_id
      ? MOCK_TECNICOS.find((t) => t.id === dados.tecnico_id)
      : undefined
    const updated: InstalacaoComAtraso = {
      ...mockStore[idx],
      ...dados,
      tipo_servico: (dados.tipo_servico ?? mockStore[idx].tipo_servico) as TipoServico,
      status: (dados.status ?? mockStore[idx].status) as StatusInstalacao,
      tecnico_nome: tec ? tec.nome : mockStore[idx].tecnico_nome,
      atualizado_em: new Date().toISOString(),
    }
    mockStore = mockStore.map((i) => (i.id === id ? updated : i))
    return updated
  }

  let extra: Record<string, string | null> = {}
  if (dados.tecnico_id !== undefined) {
    let tecnico_nome: string | null = null
    if (dados.tecnico_id) {
      const tecSnap = await getDoc(doc(db, 'tecnicos', dados.tecnico_id))
      if (tecSnap.exists()) tecnico_nome = (tecSnap.data().nome as string) ?? null
    }
    extra = { tecnico_nome }
  }

  const patch = { ...dados, ...extra, atualizado_em: new Date().toISOString() }
  await updateDoc(doc(db, 'instalacoes', id), patch)
  const snap = await getDoc(doc(db, 'instalacoes', id))
  return toInstalacaoComAtraso(snap.id, snap.data()!)
}

export async function atualizarStatus(id: string, status: StatusInstalacao) {
  return atualizarInstalacao(id, { status })
}

export async function marcarAppEnviado(id: string) {
  return atualizarInstalacao(id, {
    app_enviado: true,
    app_enviado_em: new Date().toISOString(),
    status: 'instalado_ok',
  })
}

export async function contarPorStatus() {
  if (isMockMode) return mockContarPorStatus()

  const snap = await getDocs(collection(db, 'instalacoes'))
  const counts: Record<StatusInstalacao, number> = {
    pendente: 0,
    aguardando_instalacao: 0,
    enviar_equipamento: 0,
    rastreador_enviado: 0,
    instalado_sem_acesso: 0,
    instalado_ok: 0,
    pago: 0,
  }
  snap.docs.forEach((d) => {
    const key = d.data().status as StatusInstalacao
    if (key in counts) counts[key]++
  })
  return counts
}

export async function contarCriticos() {
  if (isMockMode) return mockContarCriticos()

  const snap = await getDocs(collection(db, 'instalacoes'))
  let count = 0
  snap.docs.forEach((d) => {
    const data = d.data()
    const dias = computeDiasPendente(data.data_os ?? null, data.status)
    if (computeNivelAlerta(dias) === 'critico') count++
  })
  return count
}
