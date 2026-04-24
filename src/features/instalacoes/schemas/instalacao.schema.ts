import { z } from 'zod'

const TIPOS_SERVICO = [
  'instalacao',
  'substituicao',
  'instalacao_vistoria',
  'vistoria',
  'retirada',
  'manutencao',
] as const

const STATUS_LIST = [
  'pendente',
  'agendado',
  'aguardando_instalacao',
  'enviar_equipamento',
  'rastreador_enviado',
  'instalado_sem_acesso',
  'instalado_ok',
  'pago',
] as const

export const instalacaoSchema = z.object({
  // Obrigatórios
  nome_cliente: z.string().min(1, 'Nome obrigatório').max(200),
  telefone_cliente: z.string().optional().nullable(),
  endereco_cliente: z.string().optional().nullable(),
  placa: z
    .string()
    .min(7, 'Placa inválida')
    .max(8)
    .transform((v) => v.toUpperCase().trim()),

  // Identificação
  card_externo: z.string().optional().nullable(),
  modelo_veiculo: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  responsavel: z.string().optional().nullable(),

  // OS
  data_os: z.string().optional().nullable(),
  data_agendamento: z.string().optional().nullable(),
  tipo_servico: z.enum(TIPOS_SERVICO).default('instalacao'),
  status: z.enum(STATUS_LIST).default('pendente'),

  // Técnico
  tecnico_id: z.string().optional().nullable(),

  // Envio de equipamento (remoto)
  data_envio: z.string().optional().nullable(),
  imei: z.string().optional().nullable(),
  codigo_rastreio: z.string().optional().nullable(),

  // Instalação
  data_instalacao: z.string().optional().nullable(),
  local_instalacao: z.string().optional().nullable(),

  // Custos
  custo_km: z.coerce.number().min(0).optional().nullable(),
  custo_instalacao: z.coerce.number().min(0).optional().nullable(),
  custo_pedagio: z.coerce.number().min(0).optional().nullable(),
  diluido: z.boolean().default(false),

  // Extra
  observacoes: z.string().optional().nullable(),
  prioridade: z.boolean().default(false),
})

export type InstalacaoFormData = z.infer<typeof instalacaoSchema>
