export type StatusInstalacao =
  | 'pendente'
  | 'agendado'
  | 'aguardando_instalacao'
  | 'enviar_equipamento'
  | 'rastreador_enviado'
  | 'instalado_sem_acesso'
  | 'instalado_ok'
  | 'pago'

export type TipoServico =
  | 'instalacao'
  | 'substituicao'
  | 'instalacao_vistoria'
  | 'vistoria'
  | 'retirada'
  | 'manutencao'

export type StatusEquipamento =
  | 'disponivel'
  | 'utilizado'
  | 'reservado'
  | 'defeito'
  | 'para_remover'

export type NivelAlerta = 'amarelo' | 'laranja' | 'vermelho' | 'critico'

export type CicloFaturamento = 'dia_10' | 'dia_20'

export type RoleUsuario = 'admin' | 'operador' | 'financeiro' | 'tecnico'

export interface Tecnico {
  id: string
  nome: string
  nome_normalizado: string
  telefone: string | null
  regiao: string | null
  pix: string | null
  endereco: string | null
  cnpj: string | null
  valor_instalacao: number | null
  valor_km: number | null
  ponto_fixo: boolean
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Equipamento {
  id: string
  imei: string
  numero_linha: string | null
  modelo: string
  tecnologia: string | null
  status: StatusEquipamento
  tecnico_id: string | null
  placa_atual: string | null
  criado_em: string
  atualizado_em: string
}

export interface Instalacao {
  id: string
  card_externo: string | null
  nome_cliente: string
  telefone_cliente: string | null
  endereco_cliente: string | null
  placa: string
  modelo_veiculo: string | null
  cidade: string | null
  uf: string | null
  responsavel: string | null
  data_os: string | null
  data_agendamento: string | null
  tipo_servico: TipoServico
  status: StatusInstalacao
  data_instalacao: string | null
  tecnico_id: string | null
  local_instalacao: string | null
  imei: string | null
  // Envio de equipamento remoto
  data_envio: string | null
  codigo_rastreio: string | null
  // Custos
  custo_km: number | null
  custo_instalacao: number | null
  custo_pedagio: number | null
  // App
  app_enviado: boolean
  app_enviado_em: string | null
  diluido: boolean
  observacoes: string | null
  prioridade: boolean
  faturado: boolean
  criado_em: string
  atualizado_em: string
  criado_por: string | null
}

export interface InstalacaoComAtraso extends Instalacao {
  tecnico_nome: string | null
  dias_pendente: number | null
  nivel_alerta: NivelAlerta | null
}

export interface CicloFaturamentoModel {
  id: string
  ciclo: CicloFaturamento
  mes: number
  ano: number
  data_fechamento: string
  total_pago: number | null
  fechado: boolean
  criado_em: string
}

export interface ItemFaturamento {
  id: string
  ciclo_id: string
  instalacao_id: string
  tecnico_id: string
  valor_km: number
  valor_instalacao: number
  valor_pedagio: number
  valor_total: number
  tipo_ocorrencia: string
  observacao: string | null
  criado_em: string
}

export interface NotificacaoAlerta {
  id: string
  instalacao_id: string
  nivel: NivelAlerta
  dias_atraso: number
  enviada_em: string
  lida: boolean
  lida_por: string | null
  lida_em: string | null
  canal: string
  justificativa: string | null
}

export interface PerfilUsuario {
  id: string
  nome: string
  role: RoleUsuario
  tecnico_id: string | null
  ativo: boolean
  criado_em: string
}
