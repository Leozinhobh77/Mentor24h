# 🗃️ DATABASE — Schema Completo

**Projeto:** Mentor24h  
**Versão:** 1.0  
**Data:** 2026-05-01  
**ORM:** Drizzle ORM 0.x + Supabase PostgreSQL

---

## Principles

1. **2NF (Second Normal Form):** Sem redundância; cada fato é registrado uma vez.
2. **RLS Everywhere:** Dados sensíveis (messages, user_settings) têm Row-Level Security policies.
3. **Soft Deletes:** Ninguém deleta; dados são marcados como deleted_at IS NULL.
4. **Immutable Audit Trail:** Histórico de mudanças é imutável (append-only).
5. **Performance First:** Índices on critical queries (user_id + created_at, severity WHERE, etc).

---

## Tables

### 1. users

Identidade do usuário + preferências globais.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_whatsapp VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- Supabase Auth handles this
  
  -- Perfil
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  avatar_url VARCHAR(512),
  
  -- Preferências Críticas
  selected_assistant VARCHAR(50) DEFAULT 'mateus',  -- FK to assistants
  consentimento_explicito BOOLEAN DEFAULT FALSE,    -- LEI #11 (LGPD)
  
  -- Configurações Avançadas
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  language VARCHAR(5) DEFAULT 'pt-BR',
  notification_whatsapp BOOLEAN DEFAULT TRUE,
  notification_dashboard BOOLEAN DEFAULT TRUE,
  
  -- Dados de Bem-estar
  wellbeing_goal TEXT,  -- "reduzir ansiedade", "dormir melhor", etc
  risk_factors TEXT,    -- "insônia", "depressão", "luto", etc (JSON array)
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP DEFAULT NULL,  -- Soft delete
  
  -- Admin
  is_admin BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT email_valid CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}$')
);

-- RLS Policy: cada user vê só seus dados
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_self_select ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_self_update ON users
  FOR UPDATE USING (auth.uid() = id);

-- Índices
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_phone ON users(phone_whatsapp);
CREATE INDEX idx_users_created ON users(created_at DESC);
```

---

### 2. messages

Histórico de mensagens (WhatsApp + Dashboard). TABELA CRÍTICA PARA CRISE.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Conteúdo
  body TEXT NOT NULL,
  source VARCHAR(20) DEFAULT 'whatsapp',  -- whatsapp | dashboard | api
  
  -- Detecção de Crise (LEI #12)
  severity INT DEFAULT 0,  -- 0-10 scale
  crisis_keywords JSONB,   -- ["suicídio", "não aguanto mais"] — keywords que matcharam
  crisis_detected BOOLEAN DEFAULT FALSE,
  crisis_confidence FLOAT DEFAULT 0.0,  -- 0.0-1.0 (90% script sempre)
  
  -- Resposta
  response_sent VARCHAR(500),  -- texto da resposta automática
  response_assistant VARCHAR(50),  -- qual assistente respondeu
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_by VARCHAR(255),  -- "pattern-matching" | "claude-routine-weekly"
  
  CONSTRAINT severity_valid CHECK (severity >= 0 AND severity <= 10)
);

-- RLS: Users vêem só suas mensagens
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_self_select ON messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY messages_self_insert ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ÍNDICES CRÍTICOS (query patterns mais comuns)
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_severity ON messages(user_id, severity DESC) WHERE severity >= 8;
CREATE INDEX idx_messages_crisis ON messages(crisis_detected, created_at DESC) WHERE crisis_detected = true;
CREATE INDEX idx_messages_created_global ON messages(created_at DESC);  -- Para dashboard admin

-- Para pesquisa full-text (futura)
CREATE INDEX idx_messages_body_gin ON messages USING GIN(to_tsvector('portuguese', body));
```

---

### 3. categories

Os 42 tópicos (12 Org + 10 Insp + 10 Ent + 10 Bem).

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,  -- "Tarefas do Dia", "Motivação Diária", etc
  pillar VARCHAR(50) NOT NULL,        -- "organization" | "inspiration" | "entertainment" | "wellbeing"
  icon VARCHAR(100),                  -- emoji ou URL
  description TEXT,
  order_index INT,  -- para ordenação na UI
  color_hex VARCHAR(7),  -- para tailwind dynamic colors
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT pillar_valid CHECK (pillar IN ('organization', 'inspiration', 'entertainment', 'wellbeing'))
);

-- Seed data (imutável em produção)
CREATE UNIQUE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_pillar ON categories(pillar, order_index);
```

---

### 4. user_categories

M2M: qual user selecionou quais categorias.

```sql
CREATE TABLE user_categories (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  selected_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, category_id)
);

-- RLS: Users vêem só suas seleções
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_categories_self ON user_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_user_categories_user ON user_categories(user_id);
```

---

### 5. audios

Os 92 áudios profissionais.

```sql
CREATE TABLE audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Metadados
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_seconds INT,  -- 180 = 3 minutos
  
  -- Storage
  url_storage VARCHAR(512) NOT NULL,  -- https://cdn.mentor24h.com/audios/...
  mime_type VARCHAR(50) DEFAULT 'audio/mpeg',
  file_size_bytes INT,
  
  -- Créditos/Licensing
  narrator VARCHAR(255),  -- nome do narrador (créditos)
  license VARCHAR(50) DEFAULT 'internal',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP DEFAULT NULL,
  
  CONSTRAINT duration_valid CHECK (duration_seconds > 0)
);

CREATE INDEX idx_audios_category ON audios(category_id);
CREATE INDEX idx_audios_created ON audios(created_at DESC);
```

---

### 6. routines

As 7 Claude Routines automáticas.

```sql
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo de Routine
  routine_name VARCHAR(100) NOT NULL,  -- "weekly_summary" | "pattern_analysis" | etc
  
  -- Schedule
  schedule_cron VARCHAR(100),  -- "0 8 * * 1" = segunda 8am
  enabled BOOLEAN DEFAULT TRUE,
  
  -- Execution Tracking
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  last_result JSONB,  -- {status, messages_processed, errors, summary}
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT routine_name_valid CHECK (
    routine_name IN (
      'weekly_summary',
      'crisis_detection',
      'pattern_analysis',
      'smart_reminders',
      'monthly_summary',
      'annual_summary',
      'recommendations'
    )
  )
);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY routines_self ON routines
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_routines_user_next_run ON routines(user_id, next_run_at);
CREATE INDEX idx_routines_enabled ON routines(enabled, next_run_at) WHERE enabled = true;
```

---

### 7. crisis_audit_log

Audit trail imutável (append-only) para todas as crises detectadas.

```sql
CREATE TABLE crisis_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- O que foi detectado
  severity INT,
  keywords_matched JSONB,
  confidence_score FLOAT,
  
  -- Ação tomada
  action_taken VARCHAR(255),  -- "breathe_exercise" | "contact_support" | "log_only"
  response_sent_at TIMESTAMP,
  
  -- Audit
  detected_by VARCHAR(50) DEFAULT 'pattern-matching',  -- sempre pattern matching
  environment VARCHAR(50),  -- production | staging
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT severity_valid CHECK (severity >= 0 AND severity <= 10)
);

-- Imutável: só INSERT, sem UPDATE/DELETE
ALTER TABLE crisis_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY crisis_audit_immutable ON crisis_audit_log
  FOR SELECT USING (true);  -- Admin-only

-- Dashboard admin vê all crises
CREATE INDEX idx_crisis_audit_created ON crisis_audit_log(created_at DESC);
CREATE INDEX idx_crisis_audit_user ON crisis_audit_log(user_id, created_at DESC);
```

---

## Seed Data

### Categories (42 total)

```json
[
  {
    "pillar": "organization",
    "name": "Tarefas do Dia",
    "icon": "✓",
    "order": 1
  },
  {
    "pillar": "inspiration",
    "name": "Motivação Diária",
    "icon": "⭐",
    "order": 1
  },
  ...
]
```

Gere com:
```bash
npm run seed:categories
```

---

## Performance Targets

| Query | Target | Índice |
|-------|--------|--------|
| Load user dashboard | <100ms | idx_users_created |
| Fetch user messages (with pagination) | <50ms | idx_messages_user_created |
| Crisis detection (weekly scan) | <2s for 1k users | idx_messages_crisis |
| Admin: all crises | <500ms | idx_crisis_audit_created |

---

## Migration Strategy

**Versão 1.0 (MVP):** Execute todas as 7 tables acima.

**Versão 1.5:** Adicionar `user_wellness_metrics` (para tracking trends).

**Versão 2.0:** Sharding by user_id (se >1M users).

---

## Referências

- Schema definido com Drizzle ORM: `src/lib/db/schema.ts`
- Migrations: `src/lib/db/migrations/`
- CRUD helpers: `src/lib/db/queries/`
