-- =====================================================
-- LOMA RASTREAMENTO — Schema inicial
-- =====================================================

-- Enums
CREATE TYPE status_instalacao AS ENUM (
  'pendente_instalacao',
  'instalado_sem_acesso',
  'instalado_ok',
  'pago'
);

CREATE TYPE tipo_servico AS ENUM (
  'instalacao',
  'substituicao',
  'instalacao_vistoria',
  'vistoria',
  'retirada',
  'manutencao'
);

CREATE TYPE status_equipamento AS ENUM (
  'disponivel',
  'utilizado',
  'reservado',
  'defeito',
  'para_remover'
);

CREATE TYPE nivel_alerta AS ENUM (
  'amarelo',
  'laranja',
  'vermelho',
  'critico'
);

CREATE TYPE ciclo_faturamento AS ENUM ('dia_10', 'dia_20');

CREATE TYPE role_usuario AS ENUM ('admin', 'operador', 'financeiro', 'tecnico');

-- =====================================================
-- TÉCNICOS
-- =====================================================
CREATE TABLE tecnicos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  nome_normalizado TEXT GENERATED ALWAYS AS (lower(trim(nome))) STORED,
  telefone      TEXT,
  email         TEXT,
  regiao        TEXT,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_tecnicos_nome_norm ON tecnicos(nome_normalizado);

-- =====================================================
-- EQUIPAMENTOS
-- =====================================================
CREATE TABLE equipamentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imei          TEXT NOT NULL UNIQUE,
  numero_linha  TEXT,
  modelo        TEXT NOT NULL,
  tecnologia    TEXT,
  status        status_equipamento NOT NULL DEFAULT 'disponivel',
  tecnico_id    UUID REFERENCES tecnicos(id),
  placa_atual   TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INSTALAÇÕES
-- =====================================================
CREATE TABLE instalacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_externo     TEXT,
  nome_cliente     TEXT NOT NULL,
  placa            TEXT NOT NULL,
  modelo_veiculo   TEXT,
  cidade           TEXT NOT NULL,
  uf               TEXT,
  responsavel      TEXT,
  data_os          DATE NOT NULL,
  tipo_servico     tipo_servico NOT NULL DEFAULT 'instalacao',
  status           status_instalacao NOT NULL DEFAULT 'pendente_instalacao',
  data_instalacao  DATE,
  tecnico_id       UUID REFERENCES tecnicos(id),
  local_instalacao TEXT,
  imei             TEXT REFERENCES equipamentos(imei),
  custo_km         NUMERIC(10,2),
  custo_instalacao NUMERIC(10,2),
  custo_pedagio    NUMERIC(10,2),
  app_enviado      BOOLEAN NOT NULL DEFAULT false,
  app_enviado_em   TIMESTAMPTZ,
  diluido          BOOLEAN NOT NULL DEFAULT false,
  observacoes      TEXT,
  prioridade       BOOLEAN NOT NULL DEFAULT false,
  faturado         BOOLEAN NOT NULL DEFAULT false,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por       UUID REFERENCES auth.users(id),
  CONSTRAINT chk_datas CHECK (data_instalacao IS NULL OR data_instalacao >= data_os)
);

CREATE INDEX idx_instalacoes_status    ON instalacoes(status);
CREATE INDEX idx_instalacoes_data_os   ON instalacoes(data_os);
CREATE INDEX idx_instalacoes_tecnico   ON instalacoes(tecnico_id);
CREATE INDEX idx_instalacoes_placa     ON instalacoes(placa);
CREATE INDEX idx_instalacoes_faturado  ON instalacoes(faturado) WHERE faturado = false;

-- View com dias de atraso e nível de alerta calculados
CREATE VIEW instalacoes_com_atraso AS
SELECT
  i.*,
  t.nome AS tecnico_nome,
  CASE
    WHEN i.status = 'pendente_instalacao' THEN CURRENT_DATE - i.data_os
    ELSE NULL
  END AS dias_pendente,
  CASE
    WHEN i.status = 'pendente_instalacao' THEN
      CASE
        WHEN CURRENT_DATE - i.data_os >= 15 THEN 'critico'::nivel_alerta
        WHEN CURRENT_DATE - i.data_os >= 10 THEN 'vermelho'::nivel_alerta
        WHEN CURRENT_DATE - i.data_os >= 7  THEN 'laranja'::nivel_alerta
        WHEN CURRENT_DATE - i.data_os >= 5  THEN 'amarelo'::nivel_alerta
        ELSE NULL
      END
    ELSE NULL
  END AS nivel_alerta
FROM instalacoes i
LEFT JOIN tecnicos t ON i.tecnico_id = t.id;

-- =====================================================
-- CICLOS DE FATURAMENTO
-- =====================================================
CREATE TABLE ciclos_faturamento (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo           ciclo_faturamento NOT NULL,
  mes             INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano             INTEGER NOT NULL,
  data_fechamento DATE NOT NULL,
  total_pago      NUMERIC(10,2),
  fechado         BOOLEAN NOT NULL DEFAULT false,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ciclo, mes, ano)
);

CREATE TABLE itens_faturamento (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo_id         UUID NOT NULL REFERENCES ciclos_faturamento(id),
  instalacao_id    UUID NOT NULL REFERENCES instalacoes(id),
  tecnico_id       UUID NOT NULL REFERENCES tecnicos(id),
  valor_km         NUMERIC(10,2) DEFAULT 0,
  valor_instalacao NUMERIC(10,2) DEFAULT 0,
  valor_pedagio    NUMERIC(10,2) DEFAULT 0,
  valor_total      NUMERIC(10,2) GENERATED ALWAYS AS (valor_km + valor_instalacao + valor_pedagio) STORED,
  tipo_ocorrencia  TEXT DEFAULT 'normal',
  observacao       TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ciclo_id, instalacao_id)
);

-- =====================================================
-- NOTIFICAÇÕES / ALERTAS
-- =====================================================
CREATE TABLE notificacoes_alertas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instalacao_id UUID NOT NULL REFERENCES instalacoes(id),
  nivel         nivel_alerta NOT NULL,
  dias_atraso   INTEGER NOT NULL,
  enviada_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  lida          BOOLEAN NOT NULL DEFAULT false,
  lida_por      UUID REFERENCES auth.users(id),
  lida_em       TIMESTAMPTZ,
  canal         TEXT DEFAULT 'web',
  justificativa TEXT
);

CREATE INDEX idx_alertas_instalacao ON notificacoes_alertas(instalacao_id);
CREATE INDEX idx_alertas_nao_lidas  ON notificacoes_alertas(lida) WHERE lida = false;

-- =====================================================
-- PERFIS DE USUÁRIO
-- =====================================================
CREATE TABLE perfis_usuario (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       TEXT NOT NULL,
  role       role_usuario NOT NULL DEFAULT 'operador',
  tecnico_id UUID REFERENCES tecnicos(id),
  ativo      BOOLEAN NOT NULL DEFAULT true,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE instalacoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclos_faturamento  ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_faturamento   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_usuario      ENABLE ROW LEVEL SECURITY;

-- Instalações: técnico vê apenas as suas, demais veem tudo
CREATE POLICY "instalacoes_select" ON instalacoes FOR SELECT USING (
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role IN ('admin','operador','financeiro'))
  OR
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role = 'tecnico' AND tecnico_id = instalacoes.tecnico_id)
);

CREATE POLICY "instalacoes_insert" ON instalacoes FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role IN ('admin','operador'))
);

CREATE POLICY "instalacoes_update" ON instalacoes FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role IN ('admin','operador'))
  OR
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role = 'tecnico' AND tecnico_id = instalacoes.tecnico_id)
);

-- Financeiro: apenas admin e financeiro
CREATE POLICY "ciclos_all" ON ciclos_faturamento FOR ALL USING (
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role IN ('admin','financeiro'))
);
CREATE POLICY "itens_all" ON itens_faturamento FOR ALL USING (
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role IN ('admin','financeiro'))
);

-- Técnicos: todos leem, apenas admin escreve
CREATE POLICY "tecnicos_select" ON tecnicos FOR SELECT USING (true);
CREATE POLICY "tecnicos_write"  ON tecnicos FOR ALL USING (
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role = 'admin')
);

-- Equipamentos: admin e operador
CREATE POLICY "equipamentos_select" ON equipamentos FOR SELECT USING (true);
CREATE POLICY "equipamentos_write"  ON equipamentos FOR ALL USING (
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role IN ('admin','operador'))
);

-- Notificações: admin e operador
CREATE POLICY "alertas_all" ON notificacoes_alertas FOR ALL USING (
  auth.uid() IN (SELECT id FROM perfis_usuario WHERE role IN ('admin','operador'))
);

-- Perfil: cada usuário vê e edita o próprio
CREATE POLICY "perfil_select" ON perfis_usuario FOR SELECT USING (id = auth.uid());
CREATE POLICY "perfil_update" ON perfis_usuario FOR UPDATE USING (id = auth.uid());

-- =====================================================
-- TRIGGER: atualizado_em automático
-- =====================================================
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_instalacoes_atualizado_em
  BEFORE UPDATE ON instalacoes
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_tecnicos_atualizado_em
  BEFORE UPDATE ON tecnicos
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_equipamentos_atualizado_em
  BEFORE UPDATE ON equipamentos
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
