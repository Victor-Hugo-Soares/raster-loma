import type { InstalacaoComAtraso, Tecnico, Equipamento, Pagamento } from '@/types/domain.types'

// ─── Técnicos mock ────────────────────────────────────────────────────────────
export const MOCK_TECNICOS: Tecnico[] = [
  { id: 'tec-01', nome: 'Carlos Mendes', nome_normalizado: 'carlos mendes', telefone: '(11) 98765-1234', regiao: 'SP Capital', pix: 'carlos@loma.local', endereco: 'Rua das Flores, 123 - SP', cnpj: '12.345.678/0001-90', valor_instalacao: 120.00, valor_km: 1.20, ponto_fixo: false, ativo: true, criado_em: '2024-01-10T08:00:00Z', atualizado_em: '2024-01-10T08:00:00Z' },
  { id: 'tec-02', nome: 'Fábio Rocha', nome_normalizado: 'fabio rocha', telefone: '(11) 91234-5678', regiao: 'SP Interior', pix: '11912345678', endereco: null, cnpj: null, valor_instalacao: 100.00, valor_km: 1.00, ponto_fixo: false, ativo: true, criado_em: '2024-02-05T08:00:00Z', atualizado_em: '2024-02-05T08:00:00Z' },
  { id: 'tec-03', nome: 'Ana Souza', nome_normalizado: 'ana souza', telefone: '(19) 99876-5432', regiao: 'Campinas', pix: null, endereco: null, cnpj: null, valor_instalacao: null, valor_km: null, ponto_fixo: true, ativo: true, criado_em: '2024-03-01T08:00:00Z', atualizado_em: '2024-03-01T08:00:00Z' },
  { id: 'tec-04', nome: 'Roberto Lima', nome_normalizado: 'roberto lima', telefone: '(13) 97654-3210', regiao: 'Baixada Santista', pix: null, endereco: null, cnpj: null, valor_instalacao: 120.00, valor_km: 1.50, ponto_fixo: false, ativo: true, criado_em: '2024-03-20T08:00:00Z', atualizado_em: '2024-03-20T08:00:00Z' },
  { id: 'tec-05', nome: 'Juliana Costa', nome_normalizado: 'juliana costa', telefone: '(12) 98888-7777', regiao: 'Vale do Paraíba', pix: null, endereco: null, cnpj: null, valor_instalacao: null, valor_km: null, ponto_fixo: false, ativo: false, criado_em: '2024-04-01T08:00:00Z', atualizado_em: '2024-08-01T08:00:00Z' },
]

// ─── Helper para datas relativas ─────────────────────────────────────────────
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// ─── Instalações mock ─────────────────────────────────────────────────────────
export const MOCK_INSTALACOES: InstalacaoComAtraso[] = [
  // ── Críticas (15+ dias pendentes) ─────────────────────────────────────────
  {
    id: 'inst-01', card_externo: 'CARD-001', nome_cliente: 'Transportadora Rápida Ltda', telefone_cliente: null, endereco_cliente: null, placa: 'ABC-1234',
    modelo_veiculo: 'Volkswagen Delivery', cidade: 'São Paulo', uf: 'SP', responsavel: 'João Silva',
    data_agendamento: null, data_os: daysAgo(18), tipo_servico: 'instalacao', status: 'aguardando_instalacao',
    data_instalacao: null, tecnico_id: 'tec-01', tecnico_nome: 'Carlos Mendes',
    local_instalacao: null, imei: null, data_envio: null, codigo_rastreio: null,
    custo_km: 45.00, custo_instalacao: 120.00, custo_pedagio: 15.00,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: 'Cliente solicita instalação urgente — veículo parado', prioridade: true, faturado: false,
    criado_em: `${daysAgo(18)}T10:00:00Z`, atualizado_em: `${daysAgo(18)}T10:00:00Z`, criado_por: null,
    dias_pendente: 18, nivel_alerta: 'critico',
  },
  {
    id: 'inst-02', card_externo: 'CARD-002', nome_cliente: 'Logística Express S/A', telefone_cliente: null, endereco_cliente: null, placa: 'DEF-5678',
    modelo_veiculo: 'Mercedes Actros', cidade: 'Guarulhos', uf: 'SP', responsavel: 'Maria Oliveira',
    data_agendamento: null, data_os: daysAgo(20), tipo_servico: 'substituicao', status: 'aguardando_instalacao',
    data_instalacao: null, tecnico_id: 'tec-02', tecnico_nome: 'Fábio Rocha',
    local_instalacao: null, imei: null, data_envio: null, codigo_rastreio: null,
    custo_km: 80.00, custo_instalacao: 180.00, custo_pedagio: 30.00,
    app_enviado: false, app_enviado_em: null, diluido: true,
    observacoes: null, prioridade: false, faturado: false,
    criado_em: `${daysAgo(20)}T09:00:00Z`, atualizado_em: `${daysAgo(20)}T09:00:00Z`, criado_por: null,
    dias_pendente: 20, nivel_alerta: 'critico',
  },
  {
    id: 'inst-03', card_externo: 'CARD-003', nome_cliente: 'Frigorífico Norte S/A', telefone_cliente: null, endereco_cliente: null, placa: 'GHI-9012',
    modelo_veiculo: 'Ford Cargo', cidade: 'Campinas', uf: 'SP', responsavel: 'Pedro Santos',
    data_agendamento: null, data_os: daysAgo(16), tipo_servico: 'instalacao', status: 'aguardando_instalacao',
    data_instalacao: null, tecnico_id: 'tec-03', tecnico_nome: 'Ana Souza',
    local_instalacao: null, imei: null, data_envio: null, codigo_rastreio: null,
    custo_km: 60.00, custo_instalacao: 150.00, custo_pedagio: 20.00,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: null, prioridade: false, faturado: false,
    criado_em: `${daysAgo(16)}T11:00:00Z`, atualizado_em: `${daysAgo(16)}T11:00:00Z`, criado_por: null,
    dias_pendente: 16, nivel_alerta: 'critico',
  },
  // ── Vermelhos (10–14 dias) ─────────────────────────────────────────────────
  {
    id: 'inst-04', card_externo: 'CARD-004', nome_cliente: 'Construtora Horizonte', telefone_cliente: null, endereco_cliente: null, placa: 'JKL-3456',
    modelo_veiculo: 'Hyundai HR', cidade: 'Santo André', uf: 'SP', responsavel: 'Lucas Ferreira',
    data_agendamento: null, data_os: daysAgo(12), tipo_servico: 'instalacao', status: 'aguardando_instalacao',
    data_instalacao: null, tecnico_id: 'tec-01', tecnico_nome: 'Carlos Mendes',
    local_instalacao: null, imei: null, data_envio: null, codigo_rastreio: null,
    custo_km: 35.00, custo_instalacao: 120.00, custo_pedagio: 0,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: null, prioridade: false, faturado: false,
    criado_em: `${daysAgo(12)}T14:00:00Z`, atualizado_em: `${daysAgo(12)}T14:00:00Z`, criado_por: null,
    dias_pendente: 12, nivel_alerta: 'vermelho',
  },
  {
    id: 'inst-05', card_externo: 'CARD-005', nome_cliente: 'Distribuidora Central', telefone_cliente: null, endereco_cliente: null, placa: 'MNO-7890',
    modelo_veiculo: 'Fiat Ducato', cidade: 'São Bernardo do Campo', uf: 'SP', responsavel: 'Fernanda Lima',
    data_agendamento: null, data_os: daysAgo(11), tipo_servico: 'manutencao', status: 'aguardando_instalacao',
    data_instalacao: null, tecnico_id: 'tec-04', tecnico_nome: 'Roberto Lima',
    local_instalacao: null, imei: null, data_envio: null, codigo_rastreio: null,
    custo_km: 55.00, custo_instalacao: 100.00, custo_pedagio: 10.00,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: 'Equipamento com defeito — substituição necessária', prioridade: true, faturado: false,
    criado_em: `${daysAgo(11)}T08:30:00Z`, atualizado_em: `${daysAgo(11)}T08:30:00Z`, criado_por: null,
    dias_pendente: 11, nivel_alerta: 'vermelho',
  },
  // ── Laranja (7–9 dias) ────────────────────────────────────────────────────
  {
    id: 'inst-06', card_externo: 'CARD-006', nome_cliente: 'Auto Peças Melo', telefone_cliente: null, endereco_cliente: null, placa: 'PQR-1122',
    modelo_veiculo: 'Renault Master', cidade: 'Barueri', uf: 'SP', responsavel: 'André Costa',
    data_agendamento: null, data_os: daysAgo(8), tipo_servico: 'instalacao', status: 'enviar_equipamento',
    data_instalacao: null, tecnico_id: 'tec-02', tecnico_nome: 'Fábio Rocha',
    local_instalacao: null, imei: null, data_envio: null, codigo_rastreio: null,
    custo_km: 40.00, custo_instalacao: 120.00, custo_pedagio: 5.00,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: 'Técnico remoto — aguardando separação do equipamento', prioridade: false, faturado: false,
    criado_em: `${daysAgo(8)}T15:00:00Z`, atualizado_em: `${daysAgo(8)}T15:00:00Z`, criado_por: null,
    dias_pendente: 8, nivel_alerta: 'laranja',
  },
  // ── Amarelo (5–6 dias) ────────────────────────────────────────────────────
  {
    id: 'inst-07', card_externo: 'CARD-007', nome_cliente: 'Empresa de Táxis União', telefone_cliente: null, endereco_cliente: null, placa: 'STU-3344',
    modelo_veiculo: 'Toyota Corolla', cidade: 'São Paulo', uf: 'SP', responsavel: 'Marcos Rocha',
    data_agendamento: null, data_os: daysAgo(5), tipo_servico: 'instalacao', status: 'rastreador_enviado',
    data_instalacao: null, tecnico_id: 'tec-01', tecnico_nome: 'Carlos Mendes',
    local_instalacao: null, imei: '351756000000001', data_envio: daysAgo(3), codigo_rastreio: 'BR987654321BR',
    custo_km: 25.00, custo_instalacao: 120.00, custo_pedagio: 0,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: null, prioridade: false, faturado: false,
    criado_em: `${daysAgo(5)}T10:00:00Z`, atualizado_em: `${daysAgo(5)}T10:00:00Z`, criado_por: null,
    dias_pendente: 5, nivel_alerta: 'amarelo',
  },
  // ── Sem alerta (recentes) ─────────────────────────────────────────────────
  {
    id: 'inst-08', card_externo: 'CARD-008', nome_cliente: 'Supermercados Boa Oferta', telefone_cliente: null, endereco_cliente: null, placa: 'VWX-5566',
    modelo_veiculo: 'VW Constellation', cidade: 'Ribeirão Preto', uf: 'SP', responsavel: 'Cláudia Neves',
    data_agendamento: null, data_os: daysAgo(3), tipo_servico: 'instalacao', status: 'pendente',
    data_instalacao: null, tecnico_id: null, tecnico_nome: null,
    local_instalacao: null, imei: null, data_envio: null, codigo_rastreio: null,
    custo_km: null, custo_instalacao: null, custo_pedagio: null,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: null, prioridade: false, faturado: false,
    criado_em: `${daysAgo(3)}T09:00:00Z`, atualizado_em: `${daysAgo(3)}T09:00:00Z`, criado_por: null,
    dias_pendente: 3, nivel_alerta: null,
  },
  // ── Instalado sem acesso APP ──────────────────────────────────────────────
  {
    id: 'inst-09', card_externo: 'CARD-009', nome_cliente: 'Padaria Trigo Dourado', telefone_cliente: null, endereco_cliente: null, placa: 'YZA-7788',
    modelo_veiculo: 'Fiat Fiorino', cidade: 'São Paulo', uf: 'SP', responsavel: null,
    data_agendamento: null, data_os: daysAgo(15), tipo_servico: 'instalacao', status: 'instalado_sem_acesso',
    data_instalacao: daysAgo(10), tecnico_id: 'tec-01', tecnico_nome: 'Carlos Mendes',
    local_instalacao: 'Painel central', imei: '123456789012343', data_envio: null, codigo_rastreio: null,
    custo_km: 20.00, custo_instalacao: 120.00, custo_pedagio: 0,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: 'Aguardando cliente criar conta no app', prioridade: false, faturado: false,
    criado_em: `${daysAgo(15)}T11:00:00Z`, atualizado_em: `${daysAgo(10)}T16:00:00Z`, criado_por: null,
    dias_pendente: null, nivel_alerta: null,
  },
  {
    id: 'inst-10', card_externo: 'CARD-010', nome_cliente: 'Lavanderia Express', telefone_cliente: null, endereco_cliente: null, placa: 'BCD-9900',
    modelo_veiculo: 'Chevrolet S10', cidade: 'Sorocaba', uf: 'SP', responsavel: 'Tiago Martins',
    data_agendamento: null, data_os: daysAgo(20), tipo_servico: 'instalacao', status: 'instalado_sem_acesso',
    data_instalacao: daysAgo(14), tecnico_id: 'tec-04', tecnico_nome: 'Roberto Lima',
    local_instalacao: 'Sob o banco', imei: '123456789012344', data_envio: null, codigo_rastreio: null,
    custo_km: 90.00, custo_instalacao: 120.00, custo_pedagio: 25.00,
    app_enviado: false, app_enviado_em: null, diluido: false,
    observacoes: null, prioridade: false, faturado: false,
    criado_em: `${daysAgo(20)}T09:00:00Z`, atualizado_em: `${daysAgo(14)}T17:00:00Z`, criado_por: null,
    dias_pendente: null, nivel_alerta: null,
  },
  // ── Instalado OK ──────────────────────────────────────────────────────────
  {
    id: 'inst-11', card_externo: 'CARD-011', nome_cliente: 'Empreiteira Construmax', telefone_cliente: null, endereco_cliente: null, placa: 'EFG-1122',
    modelo_veiculo: 'Ford Ranger', cidade: 'Santos', uf: 'SP', responsavel: 'Beatriz Alves',
    data_agendamento: null, data_os: daysAgo(30), tipo_servico: 'instalacao', status: 'instalado_ok',
    data_instalacao: daysAgo(25), tecnico_id: 'tec-04', tecnico_nome: 'Roberto Lima',
    local_instalacao: 'Painel frontal', imei: '123456789012345', data_envio: null, codigo_rastreio: null,
    custo_km: 110.00, custo_instalacao: 120.00, custo_pedagio: 35.00,
    app_enviado: true, app_enviado_em: `${daysAgo(22)}T10:00:00Z`, diluido: false,
    observacoes: null, prioridade: false, faturado: false,
    criado_em: `${daysAgo(30)}T08:00:00Z`, atualizado_em: `${daysAgo(22)}T10:00:00Z`, criado_por: null,
    dias_pendente: null, nivel_alerta: null,
  },
  {
    id: 'inst-12', card_externo: 'CARD-012', nome_cliente: 'Clínica Vida Saudável', telefone_cliente: null, endereco_cliente: null, placa: 'HIJ-3344',
    modelo_veiculo: 'Peugeot Expert', cidade: 'Campinas', uf: 'SP', responsavel: 'Dr. Rafael Gomes',
    data_agendamento: null, data_os: daysAgo(25), tipo_servico: 'instalacao_vistoria', status: 'instalado_ok',
    data_instalacao: daysAgo(20), tecnico_id: 'tec-03', tecnico_nome: 'Ana Souza',
    local_instalacao: 'Cabine traseira', imei: '123456789012346', data_envio: null, codigo_rastreio: null,
    custo_km: 60.00, custo_instalacao: 200.00, custo_pedagio: 15.00,
    app_enviado: true, app_enviado_em: `${daysAgo(18)}T14:00:00Z`, diluido: false,
    observacoes: 'Vistoria solicitada pela seguradora', prioridade: false, faturado: true,
    criado_em: `${daysAgo(25)}T10:00:00Z`, atualizado_em: `${daysAgo(18)}T14:00:00Z`, criado_por: null,
    dias_pendente: null, nivel_alerta: null,
  },
  // ── Pago ──────────────────────────────────────────────────────────────────
  {
    id: 'inst-13', card_externo: 'CARD-013', nome_cliente: 'Escola de Idiomas Verba', telefone_cliente: null, endereco_cliente: null, placa: 'KLM-5566',
    modelo_veiculo: 'Toyota Hilux SW4', cidade: 'São Paulo', uf: 'SP', responsavel: 'Sandra Pinto',
    data_agendamento: null, data_os: daysAgo(60), tipo_servico: 'instalacao', status: 'pago',
    data_instalacao: daysAgo(55), tecnico_id: 'tec-01', tecnico_nome: 'Carlos Mendes',
    local_instalacao: 'Central console', imei: '123456789012347', data_envio: null, codigo_rastreio: null,
    custo_km: 30.00, custo_instalacao: 120.00, custo_pedagio: 0,
    app_enviado: true, app_enviado_em: `${daysAgo(53)}T09:00:00Z`, diluido: false,
    observacoes: null, prioridade: false, faturado: true,
    criado_em: `${daysAgo(60)}T08:00:00Z`, atualizado_em: `${daysAgo(40)}T08:00:00Z`, criado_por: null,
    dias_pendente: null, nivel_alerta: null,
  },
  {
    id: 'inst-14', card_externo: 'CARD-014', nome_cliente: 'Marmoraria Arte em Pedra', telefone_cliente: null, endereco_cliente: null, placa: 'NOP-7788',
    modelo_veiculo: 'Scania R 450', cidade: 'São Paulo', uf: 'SP', responsavel: 'Henrique Dias',
    data_agendamento: null, data_os: daysAgo(45), tipo_servico: 'substituicao', status: 'pago',
    data_instalacao: daysAgo(40), tecnico_id: 'tec-02', tecnico_nome: 'Fábio Rocha',
    local_instalacao: 'Cabine superior', imei: '123456789012348', data_envio: null, codigo_rastreio: null,
    custo_km: 25.00, custo_instalacao: 180.00, custo_pedagio: 0,
    app_enviado: true, app_enviado_em: `${daysAgo(38)}T11:00:00Z`, diluido: true,
    observacoes: null, prioridade: false, faturado: true,
    criado_em: `${daysAgo(45)}T10:00:00Z`, atualizado_em: `${daysAgo(30)}T10:00:00Z`, criado_por: null,
    dias_pendente: null, nivel_alerta: null,
  },
]

// ─── Contagens derivadas dos dados mock ───────────────────────────────────────
export function mockContarPorStatus() {
  const counts = {
    pendente: 0,
    agendado: 0,
    aguardando_instalacao: 0,
    enviar_equipamento: 0,
    rastreador_enviado: 0,
    instalado_sem_acesso: 0,
    instalado_ok: 0,
    pago: 0,
  }
  MOCK_INSTALACOES.forEach((i) => {
    const k = i.status as keyof typeof counts
    if (k in counts) counts[k]++
  })
  return counts
}

export function mockContarCriticos() {
  return MOCK_INSTALACOES.filter((i) => i.nivel_alerta === 'critico').length
}

// ─── Equipamentos mock ────────────────────────────────────────────────────────
export const MOCK_EQUIPAMENTOS: Equipamento[] = [
  { id: 'eq-01', imei: '358000000000001', numero_linha: '(11) 91234-0001', modelo: 'N4P', tecnologia: '4G', status: 'utilizado', tecnico_id: 'tec-01', placa_atual: 'ABC-1234', criado_em: '2024-01-15T10:00:00Z', atualizado_em: '2024-06-01T10:00:00Z' },
  { id: 'eq-02', imei: '358000000000002', numero_linha: '(11) 91234-0002', modelo: 'N4P', tecnologia: '4G', status: 'utilizado', tecnico_id: 'tec-02', placa_atual: 'DEF-5678', criado_em: '2024-01-15T10:00:00Z', atualizado_em: '2024-06-15T10:00:00Z' },
  { id: 'eq-03', imei: '358000000000003', numero_linha: '(11) 91234-0003', modelo: 'N4P', tecnologia: '4G', status: 'disponivel', tecnico_id: null, placa_atual: null, criado_em: '2024-02-01T10:00:00Z', atualizado_em: '2024-02-01T10:00:00Z' },
  { id: 'eq-04', imei: '358000000000004', numero_linha: '(11) 91234-0004', modelo: 'N4P', tecnologia: '4G', status: 'disponivel', tecnico_id: null, placa_atual: null, criado_em: '2024-02-01T10:00:00Z', atualizado_em: '2024-02-01T10:00:00Z' },
  { id: 'eq-05', imei: '358000000000005', numero_linha: null, modelo: 'N4P', tecnologia: '4G', status: 'defeito', tecnico_id: null, placa_atual: null, criado_em: '2024-03-10T10:00:00Z', atualizado_em: '2024-07-01T10:00:00Z' },
  { id: 'eq-06', imei: '358000000000006', numero_linha: '(11) 91234-0006', modelo: 'N4P', tecnologia: '4G', status: 'reservado', tecnico_id: 'tec-03', placa_atual: null, criado_em: '2024-03-10T10:00:00Z', atualizado_em: '2024-08-01T10:00:00Z' },
  { id: 'eq-07', imei: '358000000000007', numero_linha: '(11) 91234-0007', modelo: 'N4P', tecnologia: '4G', status: 'disponivel', tecnico_id: null, placa_atual: null, criado_em: '2024-04-01T10:00:00Z', atualizado_em: '2024-04-01T10:00:00Z' },
]

// ─── Pagamentos mock ──────────────────────────────────────────────────────────
export const MOCK_PAGAMENTOS: Pagamento[] = [
  { id: 'pag-01', numero_nf: 'NF-000123', valor: 360.00, tecnico_id: 'tec-01', tecnico_nome: 'Carlos Mendes', cnpj: '12.345.678/0001-90', status: 'pago', data_vencimento: '2026-03-10', data_pagamento: '2026-03-09', observacoes: null, criado_em: '2026-03-01T10:00:00Z', atualizado_em: '2026-03-09T10:00:00Z' },
  { id: 'pag-02', numero_nf: 'NF-000124', valor: 200.00, tecnico_id: 'tec-02', tecnico_nome: 'Fábio Rocha', cnpj: null, status: 'pago', data_vencimento: '2026-03-10', data_pagamento: '2026-03-10', observacoes: null, criado_em: '2026-03-01T10:00:00Z', atualizado_em: '2026-03-10T10:00:00Z' },
  { id: 'pag-03', numero_nf: null, valor: 480.00, tecnico_id: 'tec-01', tecnico_nome: 'Carlos Mendes', cnpj: '12.345.678/0001-90', status: 'a_pagar', data_vencimento: '2026-04-10', data_pagamento: null, observacoes: 'Aguardando NF', criado_em: '2026-04-01T10:00:00Z', atualizado_em: '2026-04-01T10:00:00Z' },
  { id: 'pag-04', numero_nf: 'NF-000130', valor: 300.00, tecnico_id: 'tec-03', tecnico_nome: 'Ana Souza', cnpj: null, status: 'a_pagar', data_vencimento: '2026-04-10', data_pagamento: null, observacoes: null, criado_em: '2026-04-02T10:00:00Z', atualizado_em: '2026-04-02T10:00:00Z' },
]
