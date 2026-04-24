export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Rel = {
  foreignKeyName: string
  columns: string[]
  referencedRelation: string
  referencedColumns: string[]
}

export interface Database {
  public: {
    Tables: {
      instalacoes: {
        Row: {
          id: string; card_externo: string | null; nome_cliente: string; placa: string
          modelo_veiculo: string | null; cidade: string; uf: string | null; responsavel: string | null
          data_os: string; tipo_servico: string; status: string; data_instalacao: string | null
          tecnico_id: string | null; local_instalacao: string | null; imei: string | null
          custo_km: number | null; custo_instalacao: number | null; custo_pedagio: number | null
          app_enviado: boolean; app_enviado_em: string | null; diluido: boolean
          observacoes: string | null; prioridade: boolean; faturado: boolean
          criado_em: string; atualizado_em: string; criado_por: string | null
        }
        Insert: {
          id?: string; card_externo?: string | null; nome_cliente: string; placa: string
          modelo_veiculo?: string | null; cidade: string; uf?: string | null; responsavel?: string | null
          data_os: string; tipo_servico?: string; status?: string; data_instalacao?: string | null
          tecnico_id?: string | null; local_instalacao?: string | null; imei?: string | null
          custo_km?: number | null; custo_instalacao?: number | null; custo_pedagio?: number | null
          app_enviado?: boolean; app_enviado_em?: string | null; diluido?: boolean
          observacoes?: string | null; prioridade?: boolean; faturado?: boolean
          criado_em?: string; atualizado_em?: string; criado_por?: string | null
        }
        Update: {
          id?: string; card_externo?: string | null; nome_cliente?: string; placa?: string
          modelo_veiculo?: string | null; cidade?: string; uf?: string | null; responsavel?: string | null
          data_os?: string; tipo_servico?: string; status?: string; data_instalacao?: string | null
          tecnico_id?: string | null; local_instalacao?: string | null; imei?: string | null
          custo_km?: number | null; custo_instalacao?: number | null; custo_pedagio?: number | null
          app_enviado?: boolean; app_enviado_em?: string | null; diluido?: boolean
          observacoes?: string | null; prioridade?: boolean; faturado?: boolean
          criado_em?: string; atualizado_em?: string; criado_por?: string | null
        }
        Relationships: Rel[]
      }
      tecnicos: {
        Row: {
          id: string; nome: string; nome_normalizado: string; telefone: string | null
          email: string | null; regiao: string | null; ativo: boolean
          criado_em: string; atualizado_em: string
        }
        Insert: {
          id?: string; nome: string; telefone?: string | null; email?: string | null
          regiao?: string | null; ativo?: boolean; criado_em?: string; atualizado_em?: string
        }
        Update: {
          id?: string; nome?: string; telefone?: string | null; email?: string | null
          regiao?: string | null; ativo?: boolean; criado_em?: string; atualizado_em?: string
        }
        Relationships: Rel[]
      }
      equipamentos: {
        Row: {
          id: string; imei: string; numero_linha: string | null; modelo: string
          tecnologia: string | null; status: string; tecnico_id: string | null
          placa_atual: string | null; criado_em: string; atualizado_em: string
        }
        Insert: {
          id?: string; imei: string; numero_linha?: string | null; modelo: string
          tecnologia?: string | null; status?: string; tecnico_id?: string | null
          placa_atual?: string | null; criado_em?: string; atualizado_em?: string
        }
        Update: {
          imei?: string; numero_linha?: string | null; modelo?: string
          tecnologia?: string | null; status?: string; tecnico_id?: string | null
          placa_atual?: string | null; atualizado_em?: string
        }
        Relationships: Rel[]
      }
      ciclos_faturamento: {
        Row: {
          id: string; ciclo: string; mes: number; ano: number
          data_fechamento: string; total_pago: number | null; fechado: boolean; criado_em: string
        }
        Insert: {
          id?: string; ciclo: string; mes: number; ano: number
          data_fechamento: string; total_pago?: number | null; fechado?: boolean; criado_em?: string
        }
        Update: {
          ciclo?: string; mes?: number; ano?: number; data_fechamento?: string
          total_pago?: number | null; fechado?: boolean
        }
        Relationships: Rel[]
      }
      itens_faturamento: {
        Row: {
          id: string; ciclo_id: string; instalacao_id: string; tecnico_id: string
          valor_km: number; valor_instalacao: number; valor_pedagio: number; valor_total: number
          tipo_ocorrencia: string; observacao: string | null; criado_em: string
        }
        Insert: {
          id?: string; ciclo_id: string; instalacao_id: string; tecnico_id: string
          valor_km?: number; valor_instalacao?: number; valor_pedagio?: number
          tipo_ocorrencia?: string; observacao?: string | null; criado_em?: string
        }
        Update: {
          valor_km?: number; valor_instalacao?: number; valor_pedagio?: number
          tipo_ocorrencia?: string; observacao?: string | null
        }
        Relationships: Rel[]
      }
      notificacoes_alertas: {
        Row: {
          id: string; instalacao_id: string; nivel: string; dias_atraso: number
          enviada_em: string; lida: boolean; lida_por: string | null; lida_em: string | null
          canal: string; justificativa: string | null
        }
        Insert: {
          id?: string; instalacao_id: string; nivel: string; dias_atraso: number
          enviada_em?: string; lida?: boolean; lida_por?: string | null; lida_em?: string | null
          canal?: string; justificativa?: string | null
        }
        Update: {
          lida?: boolean; lida_por?: string | null; lida_em?: string | null; justificativa?: string | null
        }
        Relationships: Rel[]
      }
      perfis_usuario: {
        Row: {
          id: string; nome: string; role: string; tecnico_id: string | null
          ativo: boolean; criado_em: string
        }
        Insert: {
          id: string; nome: string; role?: string; tecnico_id?: string | null
          ativo?: boolean; criado_em?: string
        }
        Update: {
          nome?: string; role?: string; tecnico_id?: string | null; ativo?: boolean
        }
        Relationships: Rel[]
      }
    }
    Views: {
      instalacoes_com_atraso: {
        Row: {
          id: string; card_externo: string | null; nome_cliente: string; placa: string
          modelo_veiculo: string | null; cidade: string; uf: string | null; responsavel: string | null
          data_os: string; tipo_servico: string; status: string; data_instalacao: string | null
          tecnico_id: string | null; local_instalacao: string | null; imei: string | null
          custo_km: number | null; custo_instalacao: number | null; custo_pedagio: number | null
          app_enviado: boolean; app_enviado_em: string | null; diluido: boolean
          observacoes: string | null; prioridade: boolean; faturado: boolean
          criado_em: string; atualizado_em: string; criado_por: string | null
          tecnico_nome: string | null; dias_pendente: number | null; nivel_alerta: string | null
        }
        Relationships: Rel[]
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
