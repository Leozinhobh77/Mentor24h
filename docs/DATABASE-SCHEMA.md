# 🗄️ Database Schema — Mentor24h PostgreSQL

**Última atualização:** 2026-05-01  
**Status:** Schema definido, migrations prontas  
**Total de tabelas:** 7

---

## 📋 Tabelas Principais

### 1. **users** — Usuários do Sistema
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | PK — ID único |
| `supabase_id` | VARCHAR | FK → Supabase Auth |
| `email` | VARCHAR | Email único |
| `whatsapp_number` | VARCHAR | Número WhatsApp |
| `name` | VARCHAR | Nome do usuário |
| `preferred_assistant` | VARCHAR | Assistente preferido (Mateus, Lucas, etc) |
| `timezone` | VARCHAR | Fuso horário (America/Sao_Paulo) |
| `language` | VARCHAR | Idioma (pt-BR) |
| `consent_given` | BOOLEAN | LGPD — Consentimento |
| `consent_date` | TIMESTAMP | Data do consentimento |
| `is_active` | BOOLEAN | Ativo ou suspenso |
| `deleted_at` | TIMESTAMP | Soft delete (LGPD right to deletion) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última modificação |

**Índices:**
- `users_email_unique` — Email único para login
- `users_whatsapp_unique` — WhatsApp único

**RLS Policies:**
- SELECT: Usuário vê apenas seus dados
- UPDATE: Usuário atualiza apenas seus dados
- DELETE: Soft delete via `deleted_at`

---

### 2. **messages** — Mensagens WhatsApp
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | PK — ID único |
| `user_id` | INTEGER | FK → users (RLS) |
| `whatsapp_message_id` | VARCHAR | ID Twilio único |
| `content` | TEXT | Conteúdo da mensagem |
| `status` | ENUM | received \| processing \| responded |
| `severity` | INTEGER | 0-10 (escala de severidade) |
| `is_crisis` | BOOLEAN | Detectado como crise? |
| `crisis_confidence` | INTEGER | 0-100 (confiança da detecção) |
| `detected_patterns` | JSONB | Array de padrões detectados |
| `responded_with` | VARCHAR | Qual resposta foi enviada |
| `created_at` | TIMESTAMP | Quando recebido |
| `processed_at` | TIMESTAMP | Quando foi processado |
| `responded_at` | TIMESTAMP | Quando respondido |

**Índices Críticos (Performance):**
- `idx_messages_user_created` — Para listar mensagens do usuário
- `idx_messages_severity` — Para encontrar crises rápido (severity >= 8)
- `idx_messages_crisis` — Para queries de crise

**RLS Policies:**
- SELECT: Usuário vê apenas suas mensagens
- INSERT: Usuário insere suas próprias mensagens

---

### 3. **categories** — 42 Categorias (4 Pilares)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | PK — ID único |
| `name` | VARCHAR | Nome da categoria |
| `description` | TEXT | Descrição |
| `pillar` | ENUM | organization \| inspiration \| entertainment \| wellbeing |
| `order` | INTEGER | Ordem de exibição (1-42) |
| `icon` | VARCHAR | Emoji ou icon (ex: 🎯) |
| `created_at` | TIMESTAMP | Data de criação |

**42 Categorias distribuídas:**
- **Organization (12):** Planejamento, produtividade, metas, hábitos, rotinas, finanças
- **Inspiration (10):** Motivação, histórias, criatividade, relacionamentos, crescimento
- **Entertainment (10):** Comédia, notícias, poesia, música, artes, esportes
- **Wellbeing (10):** Meditação, respiração, yoga, saúde, sono, ansiedade

---

### 4. **user_categories** — Seleções do Usuário
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | PK — ID único |
| `user_id` | INTEGER | FK → users (RLS) |
| `category_id` | INTEGER | FK → categories |
| `selected_at` | TIMESTAMP | Quando selecionou |
| `deleted_at` | TIMESTAMP | Soft delete (quando deselecionar) |

**RLS Policies:**
- SELECT/INSERT/UPDATE: Usuário controla suas categorias

---

### 5. **audios** — 92 Áudios Profissionais
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | PK — ID único |
| `title` | VARCHAR | Título do áudio |
| `description` | TEXT | Descrição |
| `category_id` | INTEGER | FK → categories |
| `audio_url` | VARCHAR | URL do arquivo (Supabase Storage) |
| `duration` | INTEGER | Duração em segundos |
| `instructor` | VARCHAR | Instrutor/narrador |
| `language` | VARCHAR | Idioma (pt-BR) |
| `created_at` | TIMESTAMP | Data de criação |

**92 Áudios distribuídos:**
- Meditação (20)
- Respiração (8)
- Prayers (15)
- Stories (12)
- Motivation (10)
- Exercises (8)
- Inspirational (6)
- Comedy (8)
- Affirmations (5)

---

### 6. **routines** — 7 Rotinas Inteligentes (Claude API)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | PK — ID único |
| `user_id` | INTEGER | FK → users (RLS) |
| `type` | ENUM | daily \| weekly \| monthly \| yearly |
| `name` | VARCHAR | Nome da rotina |
| `schedule` | VARCHAR | Cron format (ex: 0 7 * * *) |
| `content` | TEXT | Conteúdo da rotina |
| `enabled` | BOOLEAN | Ativa ou desativa |
| `last_executed` | TIMESTAMP | Última execução |
| `next_execution` | TIMESTAMP | Próxima execução |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última modificação |

**7 Routines:**
1. Weekly summary (Claude API)
2. Crisis detection (Pattern matching)
3. Pattern analysis (Claude API)
4. Smart reminders (Vercel Cron)
5. Monthly summary (Claude API)
6. Annual summary (Claude API)
7. Personalized recommendations (Claude API)

---

### 7. **crisis_audit_log** — Registro Imutável de Crises
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | PK — ID único |
| `user_id` | INTEGER | FK → users (RLS) |
| `message_id` | INTEGER | FK → messages |
| `detected_at` | TIMESTAMP | Quando detectado |
| `severity` | ENUM | low \| medium \| high \| critical |
| `patterns` | JSONB | Padrões detectados |
| `response_given` | VARCHAR | Resposta enviada |
| `follow_up_needed` | BOOLEAN | Requer follow-up humano |
| `notes` | TEXT | Notas adicionais |

**Importantes:**
- Tabela **append-only** (INSERT only, no UPDATE/DELETE)
- Auditoria completa de detecção de crises
- Rastreabilidade para compliance

---

## 🔒 Row Level Security (RLS) — LGPD Compliance

### Ativado em:
- `users` — Usuário vê apenas seus dados
- `messages` — Usuário vê apenas suas mensagens
- `user_categories` — Usuário controla suas categorias
- `routines` — Usuário vê apenas suas rotinas
- `crisis_audit_log` — Usuário vê apenas seus registros

### Política:
```sql
-- Exemplo: messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_rls_select ON messages FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

CREATE POLICY messages_rls_insert ON messages FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
```

**O que significa:**
- Usuário autenticado só vê seus próprios dados
- Backend service role (admin) pode ver tudo (para analytics, etc)
- Sem RLS: qualquer usuário veria dados de todos

---

## 📊 Índices de Performance

| Índice | Tabela | Propósito | Impacto |
|--------|--------|-----------|---------|
| `idx_messages_user_created` | messages | Listar mensagens por data | Dashboard <100ms |
| `idx_messages_severity` | messages | Encontrar crises | Crisis detection <50ms |
| `idx_messages_crisis` | messages | Filter is_crisis = true | Crisis queries <10ms |
| `idx_users_email` | users | Login rápido | Auth <50ms |
| `idx_categories_pillar` | categories | Filtrar por pilar | UI <20ms |
| `idx_routines_next_execution` | routines | Cron jobs | Scheduler <100ms |

**Estratégia:**
- Índices em foreign keys (automatic)
- Índices em WHERE clauses frequentes
- Índices em ORDER BY columns
- Índices parciais quando possível

---

## 🔄 Triggers & Functions

### 1. **soft_delete_user()**
Quando `deleted_at` é setado, marca `is_active = false`
```sql
CREATE OR REPLACE FUNCTION soft_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL THEN
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Por quê:** LGPD right to deletion — não deletar dados, apenas marcar

### 2. **update_updated_at()**
Atualiza automaticamente `updated_at` em UPDATEs
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Applied to:** `users`, `routines`

---

## 📦 Enums (Type Safety)

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE message_status AS ENUM ('received', 'processing', 'responded');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE pillar AS ENUM ('organization', 'inspiration', 'entertainment', 'wellbeing');
CREATE TYPE routine_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
```

**Benefício:** Type safety no banco — enum invalid é rejeitado no INSERT

---

## 🚀 Como Aplicar o Schema

### Opção 1: Automático (Recomendado)
```bash
# Se você tem psql instalado
bash scripts/db-push.sh

# Ou com Drizzle
npm run db:push
```

### Opção 2: Manual (via Supabase UI)
1. Vá em: https://app.supabase.com/project/[id]/sql
2. Cole o conteúdo de `src/lib/db/migrations/0001_initial_schema.sql`
3. Clique **Run**

### Opção 3: Verificar via Drizzle Studio
```bash
npm run db:studio
```

---

## ✅ Validação

Após aplicar, verifique:

```bash
# Listar todas as tabelas
psql $DATABASE_URL -c "\dt"

# Verificar RLS status
psql $DATABASE_URL -c "\d users"

# Testar RLS (você só vê suas linhas)
psql $DATABASE_URL -c "SELECT * FROM messages;"
```

---

## 📊 Estimativas

| Métrica | Valor |
|---------|-------|
| Total de tabelas | 7 |
| Total de colunas | ~70 |
| Total de índices | 8 |
| Índices de RLS | 5 |
| Tamanho inicial (vazio) | ~2 MB |
| Tamanho com 1k mensagens | ~10 MB |
| Tamanho com 10k mensagens | ~50 MB |
| Tamanho com 100k mensagens | ~500 MB |
| Query tempo (sem índice) | 100-500ms |
| Query tempo (com índice) | 5-50ms |

---

## 🔄 Migration Strategy

**v1.0 (MVP):**
- 7 tabelas base
- RLS policies
- Índices críticos

**v1.5 (Wellness Metrics):**
- Nova tabela: `user_metrics` (daily stats)
- Nova tabela: `wellness_scores` (aggregated)

**v2.0 (Sharding):**
- Particionar `messages` por data (monthly)
- Particionar `crisis_audit_log` por data

---

## 🛡️ Backup & Recovery

**Supabase automático:**
- Backup diário (30 dias retenção)
- Point-in-time recovery (14 dias)

**Manual backup:**
```bash
pg_dump $DATABASE_URL > mentor24h_backup_$(date +%Y%m%d).sql
```

---

**Criado por:** TASK-003 — Schema Drizzle + Migrations  
**Próximas tasks:** RLS Policies (TASK-004), Auth Controller (TASK-005)
