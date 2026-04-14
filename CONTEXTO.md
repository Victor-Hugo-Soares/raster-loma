# CONTEXTO.md — Sistema Web Loma Protegido (Rastreamento)

> Documento de análise, planejamento e arquitetura gerado a partir da planilha  
> `Controle Serviços Rastreador 26.xlsx` — base atual do setor de rastreamento.

---

## 1. ANÁLISE DA PLANILHA ATUAL

### 1.1 Estrutura Geral

| Aba | Registros | Propósito |
|-----|-----------|-----------|
| **Insta Loma** | 932 | Fila de instalações — aba operacional principal |
| **BI Loma** | 5.366 | Histórico completo de todas as instalações |
| **BI Salva** | 229 | Espelho/backup de BI Loma (maioria vazia) |
| **SGA LOMA** | 37.954 | Base de associados importada do SGA |
| **Vistoria** | 56 | Controle de vistorias pendentes |
| **Retirada** | 118 | Remoção de equipamentos |
| **Manutenção** | 72 | Manutenções agendadas |
| **Equipamentos** | 650 | Estoque de IMEIs (N4/N4P) |
| **Eqps Novembro** | 700 | Snapshot anterior do estoque |
| **eqps para remover** | 243 | Equipamentos antigos (E3/E3+) para desativação |
| **Planilha1** | 23 | Controle de placas com instalações 2025/2026 |
| **Gráfico SP vs Fora SP** | — | SP (474, 69.7%) vs Interior/Outros (206, 30.3%) |

---

### 1.2 Aba Principal: `Insta Loma` — Análise de Colunas

| # | Coluna | Tipo | Descrição | Problemas |
|---|--------|------|-----------|-----------|
| A | **Nome** | Texto | Nome do associado/cliente | Formatação inconsistente, espaços extras, letras maiúsculas mistas |
| B | **Card** | Texto (ID) | Identificador único do card no sistema externo (ex: `MZ6VWTAA`) | Ausente em ~30% dos registros |
| C | **Placa** | Texto | Placa do veículo | Padrão Mercosul e antigo misturados |
| D | **Modelo** | Texto | Modelo do veículo | Não padronizado |
| E | **Local** | Texto | Cidade/região da instalação | Espaços extras, maiúsculas inconsistentes |
| F | **Responsável** | Texto | Vendedor/responsável comercial | Top: Larissa, Andreza, Mikael, Mayara, Ketulli |
| G | **Serviço Passado** | Data | **Data que a OS foi gerada/repassada ao técnico** | Formato M/D/YY — datas de 2024 ainda abertas! |
| H | **Status** | Enum | `OK` ou `NOK` — se a instalação foi realizada | `NOK ` (com espaço) existe, causa bugs de filtro |
| I | **Tipo de Serviço** | Enum | `Instalação`, `Substituição`, `Insta + Vistoria` etc. | ~8 variações para o mesmo serviço |
| J | **Instalação** | Data | Data efetiva de conclusão da instalação | Vazio quando Status = NOK |
| K | **Técnico** | Texto | Nome do técnico executante | **CRÍTICO**: `Jackson`, `jackson`, `JACKSON` são 3 entradas distintas |
| L | **Local Instalação** | Texto | Onde no veículo o rastreador foi instalado | Texto livre, útil para auditoria |
| M | **IMEI** | Texto | Identificador do equipamento instalado | Ausente nos pendentes |
| N | **CustoKm** | Moeda | Custo de deslocamento (km rodado) | Formato `R$ 80.00`, maioria vazio |
| O | **CustoInstalação** | Moeda | Valor pago pela mão de obra de instalação | Formato `R$ 80.00` |
| P | **CustoPedagio** | Moeda | Custo de pedágio | Presente em BI Loma, pouco em Insta Loma |
| Q | **Finalizado** | Enum | `PENDENTE` ou `CONCLUÍDO` | Correlaciona com Status mas nem sempre |
| R | **Pagamento** | Texto | Ciclo de pagamento ao técnico | **Quase vazio** — 4 registros: `IMPROD 24.02`, `IMPROD. 12/02` etc. |
| S | **Obs** | Texto | Observações livres | Valores: `Priorizar`, `Acompanhar` |
| T | **Diluído** | Boolean | Indica se custo foi diluído | 18 `TRUE`, 328 `FALSE` |

**⚠️ Campo AUSENTE:** Não existe coluna para controle de "acesso ao APP" — identificado apenas como requisito verbal.

---

### 1.3 Situação Atual das Instalações (Insta Loma)

```
Total de registros      : 932
Status OK (concluídas)  : 680 (72,9%)
Status NOK (pendentes)  : 251 (27,1%)  ← GARGALO CRÍTICO
  └─ Com técnico atrib. : 218
  └─ Sem técnico        :  29 (aguardando atribuição)
  └─ Finalizado PENDENTE: 211

Finalizado CONCLUÍDO    : 674
Finalizado PENDENTE     : 211
```

**Instalações NOK mais antigas (gargalo crítico):**

| Placa | Data OS | Atraso (aprox.) | Técnico | Observação |
|-------|---------|-----------------|---------|------------|
| OYE4F96 | 11/Set/2024 | **~7 meses** | Ademilson Mogi Guaçu | Priorizar |
| QJP1F94 | 11/Nov/2024 | **~5 meses** | Laerbio | Priorizar |
| QIL1A04 | 03/Dez/2024 | **~4 meses** | Allan | Acompanhar |
| FJL0F14 | 13/Dez/2024 | **~4 meses** | Rodrigo Itanhaem | Acompanhar |
| RTB0F09 | 16/Dez/2024 | **~4 meses** | (sem técnico) | Priorizar |
| GAK2E80 | 19/Dez/2024 | **~4 meses** | (sem técnico) | Priorizar |

> Diversas instalações com **mais de 100 dias de atraso** sem qualquer alerta automatizado.

---

### 1.4 Dados Financeiros (BI Loma — histórico completo)

**Top técnicos por volume histórico:**

| Técnico (normalizado) | Instalações | Total Pago (estimado) |
|-----------------------|-------------|-----------------------|
| Dartom | ~945 | R$ 65.459,60 |
| Jackson | ~973* | R$ 99.345,60* |
| Cezar | ~1.163* | R$ 144.719,55* |
| Marcelo | ~300* | R$ 28.490,00* |
| Altair | 187 | R$ 13.884,80 |

*Valores somados com variações de capitalização do mesmo nome.

**Componentes de custo por instalação:**
- `CustoKm`: deslocamento (R$ 9 a R$ 100+)
- `CustoInstalação`: mão de obra (padrão: R$ 75–80, fora de SP até R$ 100+)
- `CustoPedagio`: pedágio (quando aplicável)

**Campo `Pagamento`:** Registra ciclo de pagamento com formato livre (`IMPROD 24.02`, `IMPRODUTIVA 12/02`). Apenas **4 registros** preenchidos — confirma que o controle financeiro não existe na planilha atual.

---

### 1.5 Estoque de Equipamentos

| Campo | Descrição |
|-------|-----------|
| IMEI | Identificador único do rastreador |
| Número da Linha | SIM do equipamento |
| Técnico | Técnico responsável pelo equipamento |
| Status | `Utilizado` (355) / `Disponível` (295) |
| Modelo | `N4` (300) / `N4P` (350) |

**Tecnologias a remover:** 243 equipamentos antigos (`E3` / `E3+`) mapeados para substituição.

---

### 1.6 Problemas Críticos Identificados

1. **Sem sistema de alertas** — instalações com 7 meses de atraso sem notificação
2. **Sem controle financeiro estruturado** — campo Pagamento quase vazio, sem ciclos dia 10/20
3. **Nomes de técnicos inconsistentes** — `Jackson`, `jackson`, `JACKSON` tratados como 3 técnicos diferentes, distorcendo totais financeiros
4. **Sem controle de APP** — não existe coluna para rastrear se o acesso ao APP foi liberado
5. **Datas sem padronização** — formato M/D/YY americano, misturado com texto (ex: "14-Jan")
6. **Sem auditoria** — não há log de quem alterou o quê e quando
7. **Status duplicados** — `NOK` e `NOK ` (com espaço), `Instalação` com 8 variações
8. **Base SGA não integrada** — 37.954 associados em aba separada, sem relação com Insta Loma
9. **Vistorias/Retiradas/Manutenções isoladas** — nenhuma integração entre abas

---

## 2. ARQUITETURA DO BANCO DE DADOS (Supabase/PostgreSQL)

### 2.1 Esquema das Tabelas

```sql
-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE status_instalacao AS ENUM (
  'pendente_instalacao',     -- NOK — aguardando execução
  'instalado_sem_acesso',    -- OK, mas APP não enviado
  'instalado_ok',            -- OK + APP enviado
  'pago'                     -- Financeiro quitado
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
  'amarelo',   -- 5 dias
  'laranja',   -- 7 dias
  'vermelho',  -- 10 dias
  'critico'    -- 15+ dias
);

CREATE TYPE ciclo_faturamento AS ENUM (
  'dia_10',
  'dia_20'
);

CREATE TYPE role_usuario AS ENUM (
  'admin',
  'operador',
  'financeiro',
  'tecnico'
);

-- =====================================================
-- TABELA: tecnicos
-- =====================================================
CREATE TABLE tecnicos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  nome_normalizado TEXT GENERATED ALWAYS AS (lower(trim(nome))) STORED,
  telefone      TEXT,
  email         TEXT,
  regiao        TEXT,                          -- SP / Interior / Outro estado
  ativo         BOOLEAN NOT NULL DEFAULT true,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para prevenir duplicatas normalizadas
CREATE UNIQUE INDEX idx_tecnicos_nome_norm ON tecnicos(nome_normalizado);

-- =====================================================
-- TABELA: equipamentos
-- =====================================================
CREATE TABLE equipamentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imei          TEXT NOT NULL UNIQUE,
  numero_linha  TEXT,
  modelo        TEXT NOT NULL,                -- N4, N4P, E3, E3+
  tecnologia    TEXT,                         -- E3, E3+, N4 etc.
  status        status_equipamento NOT NULL DEFAULT 'disponivel',
  tecnico_id    UUID REFERENCES tecnicos(id),
  placa_atual   TEXT,                         -- veículo onde está instalado
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: instalacoes (tabela central)
-- =====================================================
CREATE TABLE instalacoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_externo    TEXT,                        -- ID do card no sistema externo
  nome_cliente    TEXT NOT NULL,
  placa           TEXT NOT NULL,
  modelo_veiculo  TEXT,
  cidade          TEXT NOT NULL,
  uf              TEXT,
  responsavel     TEXT,                        -- Vendedor/responsável comercial
  data_os         DATE NOT NULL,               -- "Serviço Passado" — data que OS entrou
  tipo_servico    tipo_servico NOT NULL DEFAULT 'instalacao',
  status          status_instalacao NOT NULL DEFAULT 'pendente_instalacao',
  data_instalacao DATE,                        -- Preenchido quando concluído
  tecnico_id      UUID REFERENCES tecnicos(id),
  local_instalacao TEXT,                       -- Onde no veículo foi instalado
  imei            TEXT REFERENCES equipamentos(imei),
  custo_km        NUMERIC(10,2),
  custo_instalacao NUMERIC(10,2),
  custo_pedagio   NUMERIC(10,2),
  app_enviado     BOOLEAN NOT NULL DEFAULT false,  -- NOVO: controle de acesso ao APP
  app_enviado_em  TIMESTAMPTZ,
  diluido         BOOLEAN NOT NULL DEFAULT false,
  observacoes     TEXT,
  prioridade      BOOLEAN NOT NULL DEFAULT false,  -- flag "Priorizar"
  faturado        BOOLEAN NOT NULL DEFAULT false,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por      UUID REFERENCES auth.users(id),
  CONSTRAINT chk_datas CHECK (data_instalacao IS NULL OR data_instalacao >= data_os)
);

-- Índices críticos
CREATE INDEX idx_instalacoes_status ON instalacoes(status);
CREATE INDEX idx_instalacoes_data_os ON instalacoes(data_os);
CREATE INDEX idx_instalacoes_tecnico ON instalacoes(tecnico_id);
CREATE INDEX idx_instalacoes_placa ON instalacoes(placa);
CREATE INDEX idx_instalacoes_faturado ON instalacoes(faturado) WHERE faturado = false;

-- View para cálculo automático de dias pendentes
CREATE VIEW instalacoes_com_atraso AS
SELECT
  i.*,
  t.nome AS tecnico_nome,
  CASE
    WHEN i.status = 'pendente_instalacao'
    THEN CURRENT_DATE - i.data_os
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
-- TABELA: ciclos_faturamento
-- =====================================================
CREATE TABLE ciclos_faturamento (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo         ciclo_faturamento NOT NULL,
  mes           INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano           INTEGER NOT NULL,
  data_fechamento DATE NOT NULL,
  total_pago    NUMERIC(10,2),
  fechado       BOOLEAN NOT NULL DEFAULT false,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ciclo, mes, ano)
);

-- =====================================================
-- TABELA: itens_faturamento (instalações incluídas em cada ciclo)
-- =====================================================
CREATE TABLE itens_faturamento (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo_id          UUID NOT NULL REFERENCES ciclos_faturamento(id),
  instalacao_id     UUID NOT NULL REFERENCES instalacoes(id),
  tecnico_id        UUID NOT NULL REFERENCES tecnicos(id),
  valor_km          NUMERIC(10,2) DEFAULT 0,
  valor_instalacao  NUMERIC(10,2) DEFAULT 0,
  valor_pedagio     NUMERIC(10,2) DEFAULT 0,
  valor_total       NUMERIC(10,2) GENERATED ALWAYS AS (valor_km + valor_instalacao + valor_pedagio) STORED,
  tipo_ocorrencia   TEXT DEFAULT 'normal',  -- 'normal', 'improdutiva'
  observacao        TEXT,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ciclo_id, instalacao_id)
);

-- =====================================================
-- TABELA: notificacoes_alertas
-- =====================================================
CREATE TABLE notificacoes_alertas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instalacao_id   UUID NOT NULL REFERENCES instalacoes(id),
  nivel           nivel_alerta NOT NULL,
  dias_atraso     INTEGER NOT NULL,
  enviada_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  lida            BOOLEAN NOT NULL DEFAULT false,
  lida_por        UUID REFERENCES auth.users(id),
  lida_em         TIMESTAMPTZ,
  canal           TEXT DEFAULT 'web',  -- 'web', 'push', 'email'
  justificativa   TEXT                 -- obrigatória para crítico (15+ dias)
);

CREATE INDEX idx_alertas_instalacao ON notificacoes_alertas(instalacao_id);
CREATE INDEX idx_alertas_nivel ON notificacoes_alertas(nivel);
CREATE INDEX idx_alertas_nao_lidas ON notificacoes_alertas(lida) WHERE lida = false;

-- =====================================================
-- TABELA: vistorias
-- =====================================================
CREATE TABLE vistorias (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instalacao_id   UUID REFERENCES instalacoes(id),
  empresa         TEXT DEFAULT 'Loma',
  nome_cliente    TEXT NOT NULL,
  placa           TEXT NOT NULL,
  vendedor        TEXT,
  data_os         DATE,
  data_vistoria   DATE,
  tecnico_id      UUID REFERENCES tecnicos(id),
  custo_km        NUMERIC(10,2),
  custo_vistoria  NUMERIC(10,2),
  custo_adicional NUMERIC(10,2),
  status          TEXT DEFAULT 'pendente',  -- 'pendente', 'realizada', 'cancelada'
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: retiradas
-- =====================================================
CREATE TABLE retiradas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa         TEXT DEFAULT 'Loma',
  nome_cliente    TEXT NOT NULL,
  placa           TEXT NOT NULL,
  imei            TEXT,
  custo           NUMERIC(10,2),
  custo_km        NUMERIC(10,2),
  custo_pedagio   NUMERIC(10,2),
  data_os         DATE,
  data_realizado  DATE,
  tecnico_id      UUID REFERENCES tecnicos(id),
  status          TEXT DEFAULT 'pendente',
  pagamento_ciclo UUID REFERENCES ciclos_faturamento(id),
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: manutencoes
-- =====================================================
CREATE TABLE manutencoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa         TEXT DEFAULT 'Loma',
  nome_cliente    TEXT NOT NULL,
  placa           TEXT NOT NULL,
  data_os         DATE,
  data_realizado  DATE,
  tecnico_id      UUID REFERENCES tecnicos(id),
  custo_km        NUMERIC(10,2),
  custo           NUMERIC(10,2),
  status          TEXT DEFAULT 'pendente',
  pagamento_ciclo UUID REFERENCES ciclos_faturamento(id),
  tecnologia      TEXT,
  equipamento     TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: push_subscriptions (Web Push API)
-- =====================================================
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth_key    TEXT NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: logs_auditoria
-- =====================================================
CREATE TABLE logs_auditoria (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela        TEXT NOT NULL,
  registro_id   UUID NOT NULL,
  acao          TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
  campo_alterado TEXT,
  valor_anterior JSONB,
  valor_novo    JSONB,
  usuario_id    UUID REFERENCES auth.users(id),
  ip_address    TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auditoria_registro ON logs_auditoria(tabela, registro_id);
CREATE INDEX idx_auditoria_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_auditoria_data ON logs_auditoria(criado_em DESC);

-- =====================================================
-- TABELA: perfis_usuario (extensão de auth.users)
-- =====================================================
CREATE TABLE perfis_usuario (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome      TEXT NOT NULL,
  role      role_usuario NOT NULL DEFAULT 'operador',
  tecnico_id UUID REFERENCES tecnicos(id),  -- se o usuário É um técnico
  ativo     BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 2.2 Mapeamento Planilha → Banco

| Campo Planilha | Tabela | Campo Banco | Transformação |
|----------------|--------|-------------|---------------|
| Nome | instalacoes | nome_cliente | trim() |
| Card | instalacoes | card_externo | direto |
| Placa | instalacoes | placa | upper().trim() |
| Modelo | instalacoes | modelo_veiculo | trim() |
| Local | instalacoes | cidade | trim() |
| Responsável | instalacoes | responsavel | trim() |
| Serviço Passado | instalacoes | data_os | parse date M/D/YY |
| Status (OK/NOK) | instalacoes | status | NOK→pendente_instalacao, OK→instalado_ok |
| Tipo de Serviço | instalacoes | tipo_servico | normalizar enum |
| Instalação | instalacoes | data_instalacao | parse date |
| Técnico | tecnicos | nome | normalizar case, deduplicar |
| Local Instalação | instalacoes | local_instalacao | direto |
| IMEI | equipamentos | imei | direto |
| CustoKm | instalacoes | custo_km | strip R$ |
| CustoInstalação | instalacoes | custo_instalacao | strip R$ |
| CustoPedagio | instalacoes | custo_pedagio | strip R$ |
| Finalizado | — | calculado via status | — |
| Pagamento | itens_faturamento | tipo_ocorrencia | normalizar |
| Obs | instalacoes | observacoes | direto |
| Diluído | instalacoes | diluido | boolean |
| *(ausente)* | instalacoes | app_enviado | novo campo |

---

## 3. REGRAS DE NEGÓCIO EXTRAÍDAS

### 3.1 Fluxo de Status de Instalação

```
[nova OS criada]
      │
      ▼
pendente_instalacao ──────(técnico realiza instalação)──────▶ instalado_sem_acesso
      │                                                              │
      │                                              (APP enviado ao cliente)
      │                                                              │
      │                                                              ▼
      └──────────────────────────────────────────────────────▶ instalado_ok
                                                                     │
                                                       (ciclo faturamento quitado)
                                                                     │
                                                                     ▼
                                                                   pago
```

### 3.2 Regras de Alerta por Prazo

| Dias desde data_os | Nível | Ação do Sistema |
|--------------------|-------|-----------------|
| 1–4 | normal | Sem alerta |
| 5–6 | amarelo | Badge amarelo na lista |
| 7–9 | laranja | Badge laranja + notificação push |
| 10–14 | vermelho | Badge vermelho + push + destaque visual (sombra) |
| 15+ | crítico | Push crítico + bloquear novas atribuições ao técnico até registrar justificativa |

### 3.3 Ciclos de Faturamento

- **Dia 10** de cada mês: fatura instalações concluídas na primeira quinzena
- **Dia 20** de cada mês: fatura instalações concluídas na segunda quinzena
- Ocorrências improdutivas (`IMPROD`): visita realizada sem conclusão, paga diferente
- Campo `diluido = true`: custo distribuído entre múltiplos ciclos

### 3.4 Controle de APP

- Após instalação concluída (`status = instalado_sem_acesso`), operador deve enviar acesso ao APP
- Ao confirmar envio: `app_enviado = true`, `app_enviado_em = now()`, `status → instalado_ok`
- Instalações com `app_enviado = false` por mais de 48h após instalação devem gerar alerta

### 3.5 Deduplicação de Técnicos

- Na migração: `UPPER(TRIM(nome))` para normalizar → agrupar por nome normalizado
- No sistema: campo único por `lower(trim(nome))` via índice UNIQUE
- Campo `tecnico_id` nas tabelas resolve qualquer variação futura de capitalização

### 3.6 Equipamentos

- Ao registrar instalação: `equipamentos.status → utilizado`, `tecnico_id` e `placa_atual` preenchidos
- Ao registrar retirada: `equipamentos.status → disponivel`, `placa_atual = null`
- Equipamentos E3/E3+ estão sendo substituídos por N4/N4P — migração em andamento

---

## 4. ENDPOINTS / QUERIES NECESSÁRIAS

### 4.1 Instalações

| Operação | Query/Endpoint |
|----------|----------------|
| Listar pendentes com dias de atraso | `SELECT * FROM instalacoes_com_atraso WHERE status = 'pendente_instalacao' ORDER BY dias_pendente DESC` |
| Criar instalação | INSERT + log_auditoria |
| Atualizar status | UPDATE + log_auditoria + trigger de alerta |
| Buscar por placa/nome | Full-text search com `ilike` |
| Marcar APP enviado | UPDATE app_enviado + app_enviado_em |
| Listar por técnico | JOIN tecnicos |
| Filtrar por nível de alerta | Via view `instalacoes_com_atraso` |

### 4.2 Financeiro

| Operação | Query/Endpoint |
|----------|----------------|
| Abrir ciclo de faturamento | INSERT ciclos_faturamento |
| Incluir instalação no ciclo | INSERT itens_faturamento |
| Totais por técnico no ciclo | SUM(valor_total) GROUP BY tecnico_id |
| Fechar ciclo | UPDATE ciclos_faturamento SET fechado = true |
| Histórico de pagamentos por técnico | JOIN itens_faturamento + ciclos |

### 4.3 Alertas / Realtime

| Operação | Mecanismo |
|----------|-----------|
| Detectar novas instalações críticas | Supabase Realtime (postgres_changes) na view |
| Enviar push browser | Serverless function com VAPID |
| Registrar notificação enviada | INSERT notificacoes_alertas |
| Marcar notificação como lida | UPDATE notificacoes_alertas SET lida = true |
| Badge contador não lidas | `SELECT COUNT(*) WHERE lida = false` |

### 4.4 Auditoria

| Operação | Trigger |
|----------|---------|
| Status alterado | AFTER UPDATE ON instalacoes |
| Valor financeiro alterado | AFTER UPDATE ON itens_faturamento |
| Técnico atribuído | AFTER UPDATE ON instalacoes (tecnico_id) |
| Notificação enviada | INSERT on notificacoes_alertas → log |

---

## 5. MATRIZ DE PERMISSÕES (Row Level Security)

| Funcionalidade | admin | operador | financeiro | tecnico |
|----------------|-------|----------|------------|---------|
| Ver todas as instalações | ✅ | ✅ | ✅ | 🔒 próprias |
| Criar instalação | ✅ | ✅ | ❌ | ❌ |
| Editar status | ✅ | ✅ | ❌ | 🔒 próprias |
| Marcar APP enviado | ✅ | ✅ | ❌ | ❌ |
| Ver financeiro | ✅ | ❌ | ✅ | 🔒 próprio |
| Criar ciclo faturamento | ✅ | ❌ | ✅ | ❌ |
| Fechar ciclo | ✅ | ❌ | ✅ | ❌ |
| Gerenciar técnicos | ✅ | ❌ | ❌ | ❌ |
| Gerenciar equipamentos | ✅ | ✅ | ❌ | ❌ |
| Ver logs auditoria | ✅ | ❌ | ❌ | ❌ |
| Receber alertas push | ✅ | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ |

### Políticas RLS Supabase

```sql
-- instalacoes: técnico vê apenas as suas
CREATE POLICY "tecnico_proprias" ON instalacoes
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM perfis_usuario WHERE role = 'tecnico' AND tecnico_id = instalacoes.tecnico_id
    )
    OR
    auth.uid() IN (
      SELECT id FROM perfis_usuario WHERE role IN ('admin', 'operador', 'financeiro')
    )
  );

-- itens_faturamento: apenas admin e financeiro
CREATE POLICY "financeiro_only" ON itens_faturamento
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM perfis_usuario WHERE role IN ('admin', 'financeiro')
    )
  );

-- logs_auditoria: apenas admin
CREATE POLICY "admin_only_logs" ON logs_auditoria
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM perfis_usuario WHERE role = 'admin'
    )
  );
```

---

## 6. ESTRUTURA DO PROJETO (Detalhada)

```
loma-rastreamento/
├── .env.local
│   ├── VITE_SUPABASE_URL
│   ├── VITE_SUPABASE_ANON_KEY
│   ├── VITE_VAPID_PUBLIC_KEY
│   └── VAPID_PRIVATE_KEY (apenas serverless)
│
├── public/
│   └── sw.js                    # Service Worker para Web Push
│
├── src/
│   ├── app/
│   │   ├── router.tsx            # TanStack Router ou React Router v6
│   │   ├── providers.tsx         # QueryClient, AuthProvider, ThemeProvider
│   │   └── App.tsx
│   │
│   ├── features/
│   │   ├── instalacoes/
│   │   │   ├── components/
│   │   │   │   ├── InstalacoesList.tsx
│   │   │   │   ├── InstalacaoCard.tsx
│   │   │   │   ├── InstalacaoForm.tsx
│   │   │   │   ├── AlertaBadge.tsx
│   │   │   │   └── FiltrosInstalacoes.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useInstalacoes.ts
│   │   │   │   ├── useInstalacaoMutations.ts
│   │   │   │   └── useDiasPendente.ts
│   │   │   ├── schemas/
│   │   │   │   └── instalacao.schema.ts  # Zod
│   │   │   └── types.ts
│   │   │
│   │   ├── financeiro/
│   │   │   ├── components/
│   │   │   │   ├── CicloFaturamentoCard.tsx
│   │   │   │   ├── TotalPorTecnico.tsx
│   │   │   │   └── HistoricoPagamentos.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCicloFaturamento.ts
│   │   │   └── schemas/
│   │   │       └── faturamento.schema.ts
│   │   │
│   │   └── notificacoes/
│   │       ├── components/
│   │       │   ├── NotificacaoBell.tsx
│   │       │   └── NotificacaoFeed.tsx
│   │       ├── hooks/
│   │       │   ├── useNotificacoes.ts
│   │       │   └── usePushSubscription.ts
│   │       └── services/
│   │           └── pushService.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── AlertaTimer.tsx
│   │   ├── hooks/
│   │   │   ├── useRealtime.ts
│   │   │   └── useAuth.ts
│   │   └── utils/
│   │       ├── dateUtils.ts
│   │       ├── currencyUtils.ts
│   │       └── alertUtils.ts
│   │
│   ├── infra/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── repositories/
│   │   │       ├── instalacoes.repository.ts
│   │   │       ├── tecnicos.repository.ts
│   │   │       ├── faturamento.repository.ts
│   │   │       └── notificacoes.repository.ts
│   │   └── push/
│   │       └── vapid.ts
│   │
│   └── types/
│       ├── database.types.ts    # gerado: supabase gen types
│       └── domain.types.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_views_triggers.sql
│   │   └── 004_seed_tecnicos.sql
│   └── seed.sql                 # 50+ instalações fictícias para testes
│
└── api/                         # Vercel Serverless Functions
    └── push/
        └── send.ts              # Endpoint para envio de Web Push
```

---

## 7. SEED DE DADOS (Resumo para Testes)

O arquivo `supabase/seed.sql` deverá conter:

- **15 técnicos** fictícios com regiões variadas (SP, Interior, Outros estados)
- **50+ instalações** com distribuição:
  - 10 com status `pendente_instalacao` e data_os entre 5–20 dias atrás (testar todos os alertas)
  - 5 com 1–2 dias (sem alerta)
  - 15 com `instalado_sem_acesso`
  - 20 com `instalado_ok`
  - 5 com `pago`
- **2 ciclos de faturamento** (dia 10 e dia 20 do mês atual)
- **Usuários de teste** para cada role (admin, operador, financeiro, técnico)

---

## 8. CHECKLIST MVP

### Fase 1 — Estrutura (Banco + Auth)
- [ ] Criar projeto Supabase
- [ ] Aplicar migrations (schema + RLS)
- [ ] Configurar Auth (email/senha + MFA opcional)
- [ ] Popular seed com dados de teste

### Fase 2 — Core (Instalações)
- [ ] CRUD completo de instalações
- [ ] Listagem com filtros (status, técnico, cidade, nível de alerta)
- [ ] Indicador visual de dias pendentes
- [ ] Mudança de status com registro em auditoria
- [ ] Campo APP enviado (toggle)

### Fase 3 — Alertas (Gargalo Principal)
- [ ] View `instalacoes_com_atraso` ativa
- [ ] Supabase Realtime escutando mudanças
- [ ] Sonner/Toast para alertas em tela
- [ ] Service Worker registrado
- [ ] Web Push API com VAPID
- [ ] Badge contador na navegação
- [ ] Bloqueio para nível crítico + justificativa

### Fase 4 — Financeiro
- [ ] CRUD de técnicos
- [ ] Ciclos de faturamento (dia 10/20)
- [ ] Inclusão de instalações no ciclo
- [ ] Totais por técnico
- [ ] Histórico de pagamentos

### Fase 5 — Qualidade
- [ ] Testes Vitest (cálculo de dias, regras de alerta, validações Zod)
- [ ] Logs de auditoria funcionando
- [ ] Rate limiting nas APIs
- [ ] Headers de segurança (CSP, HSTS)
- [ ] Deploy Vercel com variáveis de ambiente

---

## 9. DECISÕES TÉCNICAS E JUSTIFICATIVAS

| Decisão | Alternativa | Justificativa |
|---------|-------------|---------------|
| Supabase Realtime para alertas | Polling/WebSocket custom | Já incluso no Supabase, zero infraestrutura |
| VAPID via Vercel Serverless | Firebase Cloud Messaging | Sem dependência de Google, VAPID é padrão web |
| TanStack Query | SWR / Apollo | Cache granular, devtools, otimista por padrão |
| shadcn/ui | MUI / Chakra | Sem bundle overhead, componentes copiados/editáveis |
| Zod para validação | Yup / Joi | Inferência TypeScript nativa, integra com react-hook-form |
| Repository Pattern | Chamar Supabase direto | Facilita mock em testes e troca de backend no futuro |
| View SQL para atraso | Calcular no frontend | Consistência, indexável, filtrável no banco |

---

*Documento gerado em: 2026-04-14*  
*Planilha analisada: `Controle Serviços Rastreador 26.xlsx`*  
*Próximo passo: aguardando confirmação para iniciar a codificação.*
