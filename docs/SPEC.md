# ◉ SPEC — Technical Specification

**Projeto:** Mentor24h — Ecossistema 24/7 de bem-estar via WhatsApp + Dashboard Web  
**Versão:** 1.0  
**Data:** 2026-05-01  
**Status:** ✅ Aprovado  
**Baseada em:** PRD v1.0 + Constitution v1.0  
**Gerada por:** FORGE (Opus 4.6) + Leonardo  
**Modelo:** Spec-Driven Development (SDD)

---

## O que é a SPEC?

> A SPEC é a **única fonte da verdade técnica**. Se existe conflito entre o código e a SPEC, o código está errado.
>
> A SPEC é como a planta de engenharia de um prédio. O PRD diz "queremos um sistema de bem-estar 24/7". A SPEC diz qual tecnologia vai onde, que dados moram em qual tabela, como as APIs se conectam e quais são as trade-offs de cada decisão.

---

## 🏗️ Visão Arquitetural

### Stack Técnica

| Camada | Tecnologia | Versão | Por quê |
|--------|-----------|--------|---------|
| **Frontend** | Next.js 15 + React 19 | 15.x | SSR performance, Vercel integration nativa, App Router |
| **State Management** | Zustand | 4.x | Leve (2KB), simples, hook-based, perfeito pra state centralizado (user, UI) |
| **UI Components** | Shadcn/ui | latest | Tailwind-based, profissional, customizável, componentes prontos |
| **CSS** | Tailwind CSS | 4.x | Utility-first, leve (~15KB), tema customizável |
| **Backend** | Node.js + Express | 18+ | Serverless-ready, integração Twilio/Supabase perfeita |
| **Database** | Supabase (PostgreSQL) | managed | RLS nativo (LEI #11), backup automático, auth integrado, realtime |
| **ORM** | Drizzle ORM | 0.x | Type-safe, controle fino, menor bundle (~50KB), performance superior |
| **WhatsApp API** | Twilio | managed | Confiável, webhooks, $0.005/msg, trial $15 grátis |
| **Message Queue** | Inngest | managed | Retry automático, durável, serverless-native, Vercel integration |
| **Scheduler** | Vercel Cron | managed | 7 Routines (resumo semanal, detecção crise, análise padrões, etc) |
| **Deploy Frontend** | Vercel | managed | Next.js nativo, CDN global, deploy em 30s |
| **Deploy Backend** | Railway ou Heroku | managed | Node.js serverless, PostgreSQL connection pooling |
| **Testing** | Jest + Supertest | latest | Unit + Integration tests (não E2E — MVP é rápido) |
| **Monitoring** | Sentry (erro) + LogRocket (UX) | managed | Rastrear bugs em produção, sessões de usuário |

### Diagrama de Arquitetura (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                     MENTOR24H ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐   ┌──────────────┐ │
│  │   WhatsApp   │         │  Dashboard   │   │   Mobile     │ │
│  │   (Twilio)   │◄────────│   Web Next   │◄──│  (PWA/App)   │ │
│  │              │         │     React    │   │              │ │
│  └──────┬───────┘         └──────┬───────┘   └──────┬───────┘ │
│         │                        │                  │          │
│         └────────────┬───────────┘──────────────────┘          │
│                      │ (HTTPS/REST)                            │
│                      ▼                                          │
│         ┌────────────────────────────┐                         │
│         │   API Backend (Node.js)    │                         │
│         │   - Express Routes         │                         │
│         │   - Inngest Queue          │                         │
│         │   - Vercel Cron Routines   │                         │
│         └────────────┬───────────────┘                         │
│                      │                                          │
│         ┌────────────▼───────────────┐                         │
│         │  Supabase PostgreSQL       │                         │
│         │  - Users + Auth (RLS)      │                         │
│         │  - Messages (crisis detect)│                         │
│         │  - Categories (42)         │                         │
│         │  - Routines (7)            │                         │
│         │  - Audios (92)             │                         │
│         └────────────────────────────┘                         │
│                                                                 │
│  External Services:                                            │
│  ├─ Twilio (WhatsApp messaging)                              │
│  ├─ Make (orchestration visuals — future v2)                 │
│  ├─ Claude API (10% IA — Routines seletivas)                 │
│  ├─ Vercel (deploy, cron, analytics)                         │
│  └─ Sentry (error tracking)                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxos Críticos

#### **Fluxo 1: Usuário Envia Mensagem WhatsApp**

```
1. User abre WhatsApp → digita mensagem → envia
2. Twilio recebe → chama webhook /api/whatsapp/webhook
3. Inngest enfileira job (garante processamento)
4. Backend processa:
   ├─ Parse mensagem
   ├─ Detectar crise (JSON keywords + scoring — LEI #12)
   ├─ Salvar em database (Supabase RLS — LEI #11)
   └─ Se crise detectada:
       ├─ Enviar resposta PRÉ-GRAVADA (nunca IA pura)
       ├─ Alertar usuário de técnica respiração/meditação
       └─ Log em severidade CRÍTICA
5. Response envia via Twilio → WhatsApp
6. User recebe resposta (retry automático se falhar)
```

#### **Fluxo 2: Rotina Automática (Ex: Resumo Semanal)**

```
1. Vercel Cron executa segunda 08h → chama /api/routines/weekly-summary
2. Backend:
   ├─ Query todos usuários ativos (Drizzle)
   ├─ Para cada usuário:
   │  ├─ Agregar dados semana (tarefas, categorias ativas)
   │  ├─ Chamar Claude API (10% IA — análise inteligente)
   │  └─ Formatar resumo em template
   └─ Enfileirar em Inngest (batch de mensagens)
3. Inngest processa batch:
   ├─ Enviar via Twilio para cada usuário
   ├─ Salvar em database
   └─ Retry se falhar
4. Usuários recebem resumo inteligente
```

#### **Fluxo 3: Detecção de Crise**

```
1. Usuário envia: "não aguento mais", "quero morrer", etc
2. Backend recebe → processa com JSON keywords:
   {
     "termo": "quero morrer",
     "categoria": "suicida",
     "peso": 10,     // crítico
     "resposta": "resposta_pré_gravada_crise.mp3"
   }
3. Scoring: se peso >= 8 → CRISE DETECTADA
4. Ações imediatas:
   ├─ Enviar resposta com técnica respiração (PRÉ-GRAVADA)
   ├─ Adicionar áudio de meditação (92 áudios)
   ├─ Log em severidade CRÍTICA (auditável)
   └─ Opcional: notificar contato de emergência
5. Garantias (LEI #12):
   ├─ 99.9% confiabilidade (pattern matching)
   ├─ Retry automático (Inngest)
   └─ Zero latência (JSON, não IA)
```

---

## 🖥️ Interface & Rotas

### Dashboard Web (Next.js)

| Página | Rota | Descrição | Componentes | Dados |
|--------|------|-----------|------------|-------|
| **Login** | `/auth/login` | Email + senha (Supabase Auth) | Form, Button, Alert | users (auth) |
| **Dashboard** | `/dashboard` | Home com resumo do dia | Cards, Charts, Quick Actions | messages, tasks, categories |
| **Tarefas** | `/dashboard/tasks` | Kanban (A Fazer/Fazendo/Feito) | Kanban Board, Task Cards | tasks |
| **Categorias** | `/dashboard/categories` | Listar 42 categorias, ativar/desativar | Category Grid, Toggle | categories |
| **Mensagens** | `/dashboard/messages` | Histórico WhatsApp (chrono inverso) | Message List, Search, Filter | messages |
| **Crises** | `/dashboard/crises` | Log de crises detectadas (auditoria) | Crisis List, Severity Badge, Actions | messages (where severity >= 8) |
| **Áudios** | `/dashboard/audios` | Listar 92 áudios, reproduzir | Audio Grid, Player | audios |
| **Rotinas** | `/dashboard/routines` | Status das 7 Routines Claude | Routine Cards, Last Run, Next Run | routines_log |
| **Assistente** | `/dashboard/settings` | Escolher qual dos 6 assistentes | Radio Buttons, Tone Preview | user_preferences |
| **Perfil** | `/dashboard/profile` | Editar nome, email, consentimentos | Form, Consent Checkboxes | users |
| **Logout** | `/auth/logout` | Limpar sessão | Button | — |

### Responsividade

| Breakpoint | Comportamento |
|-----------|---------------|
| Mobile (< 768px) | Single column, bottom nav, modal-friendly, touch-optimized |
| Tablet (768-1024px) | 2 columns, sidebar colapsável, balanced layout |
| Desktop (> 1024px) | 3 columns, full sidebar, charts lado a lado |

---

## 🗃️ Database Schema (2NF + Smart Indexes)

### Tabelas Principais

#### **users** — Usuários do sistema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE,  -- WhatsApp number
  selected_assistant VARCHAR(50) DEFAULT 'lucas',  -- mateus, lucas, sérgio, maria_clara, bianca, luciana
  
  -- LGPD (LEI #11)
  consentimento_explicito BOOLEAN DEFAULT false,
  consentimento_data TIMESTAMP,
  consentimento_versao INT DEFAULT 1,
  
  -- Deletar conta
  deleted_at TIMESTAMP,  -- soft delete (LEI #5)
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_deleted ON users(deleted_at);  -- soft delete query
```

#### **messages** — Todas mensagens WhatsApp + crise detection

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Message content
  body TEXT NOT NULL,
  direction VARCHAR(20),  -- 'inbound' ou 'outbound'
  media_url TEXT,  -- se houver áudio/imagem
  
  -- Crisis detection (LEI #12)
  severity INT DEFAULT 0,  -- 0: normal, 5: medium, 8+: crítico
  crisis_keywords TEXT[],  -- array de palavras detectadas
  crisis_detected BOOLEAN DEFAULT false,
  crisis_response_sent BOOLEAN DEFAULT false,
  
  -- Auditoria
  processed_by VARCHAR(50),  -- 'pattern_match' ou 'claude_routine'
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);  -- cronológico
CREATE INDEX idx_messages_severity ON messages(severity) WHERE severity >= 8;  -- crises
CREATE INDEX idx_messages_crisis ON messages(crisis_detected) WHERE crisis_detected = true;
```

#### **categories** — 42 categorias em 4 pilares

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,  -- "Finanças", "Meditação", etc
  pillar VARCHAR(50) NOT NULL,  -- 'organization', 'inspiration', 'entertainment', 'wellbeing'
  order_index INT,  -- ordenação visual
  
  created_at TIMESTAMP DEFAULT now()
);

-- Seed: 42 categorias
INSERT INTO categories (name, pillar) VALUES
  ('Finanças', 'organization'),
  ('Metas', 'organization'),
  ('Remédios', 'organization'),
  ... (39 mais)
```

#### **user_categories** — Usuário X categorias (M2M)

```sql
CREATE TABLE user_categories (
  user_id UUID NOT NULL REFERENCES users(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  active BOOLEAN DEFAULT true,
  
  PRIMARY KEY (user_id, category_id)
);

CREATE INDEX idx_user_cat_active ON user_categories(user_id) WHERE active = true;
```

#### **audios** — 92 áudios profissionais

```sql
CREATE TABLE audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,  -- "Meditação 10min", "Respiração 4-7-8", etc
  category VARCHAR(50),  -- 'meditation', 'breathing', 'prayer', 'motivation'
  duration_seconds INT,
  url_storage VARCHAR(500),  -- Supabase storage link
  transcription TEXT,  -- para acessibilidade
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audios_category ON audios(category);
```

#### **routines** — 7 Claude Routines automáticas

```sql
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  routine_name VARCHAR(100),  -- 'weekly_summary', 'crisis_detection', etc
  
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  last_result JSONB,  -- resultado da execução
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_routines_next_run ON routines(next_run_at);
```

---

## 🔌 API Endpoints (REST)

### Autenticação

```
POST /api/auth/register
  Body: { email, password, full_name, phone_number }
  Response: { user_id, token }

POST /api/auth/login
  Body: { email, password }
  Response: { user_id, token, assistant }

POST /api/auth/logout
  Auth: Bearer token
  Response: { success: true }

POST /api/auth/refresh
  Body: { refresh_token }
  Response: { access_token }
```

### WhatsApp Webhooks

```
POST /api/whatsapp/webhook
  Twilio chama isso quando mensagem chega
  Body: { From, To, Body, NumMedia, MediaUrl0, ... }
  Response: { status: 'queued' }
  (Inngest enfileira processamento)

GET /api/whatsapp/webhook
  Verification endpoint (Twilio handshake)
  Response: validation token
```

### Messages

```
GET /api/messages?user_id=XXX&limit=50
  Listar mensagens do usuário
  Auth: Bearer token
  Response: [{ id, body, direction, severity, created_at }, ...]

GET /api/messages/crises
  Listar mensagens de crise (severidade >= 8)
  Auth: Bearer token
  Response: [{ id, body, severity, crisis_keywords, created_at }, ...]

POST /api/messages/send
  Enviar mensagem via Twilio
  Auth: Bearer token
  Body: { user_id, text }
  Response: { message_id, status: 'sent' }
```

### Categories

```
GET /api/categories
  Listar 42 categorias agrupadas por pilar
  Response: { organization: [...], inspiration: [...], ... }

POST /api/user/categories/:category_id/toggle
  Ativar/desativar categoria para usuário
  Auth: Bearer token
  Response: { category_id, active: true/false }
```

### Audios

```
GET /api/audios?category=meditation&limit=20
  Listar áudios filtrados
  Response: [{ id, title, duration, url_storage }, ...]
```

### Routines

```
GET /api/routines/status
  Status das 7 rotinas (last run, next run)
  Auth: Bearer token
  Response: [{ routine_name, last_run_at, next_run_at }, ...]

POST /api/routines/:routine_name/trigger
  Disparar rotina manualmente (admin)
  Auth: Bearer token + admin role
  Response: { routine_name, started_at }
```

### User Profile

```
GET /api/user/profile
  Perfil do usuário logado
  Auth: Bearer token
  Response: { id, email, full_name, assistant, consentimentos, ... }

PATCH /api/user/profile
  Atualizar perfil
  Auth: Bearer token
  Body: { full_name, selected_assistant, ... }
  Response: { success: true, user: {...} }

DELETE /api/user/account
  Deletar conta (LGPD right to be forgotten)
  Auth: Bearer token
  Response: { success: true }
  (Soft delete + anonimizar dados sensíveis)
```

---

## 🔒 Segurança

### Checklist de Segurança

| Item | Implementação |
|------|--------------|
| **XSS Prevention** | React + Next.js (auto-escapes JSX), Content-Security-Policy header |
| **CSRF Protection** | SameSite cookies, CSRF token em forms |
| **Input Validation** | Drizzle type-safe queries, zod/yup validators |
| **Auth Seguro** | Supabase Auth (JWT + refresh tokens), secure cookies |
| **Secrets Management** | .env (local), Railway/Vercel secrets (prod), nunca em .md |
| **HTTPS Obrigatório** | Vercel + Railway força HTTPS, redirect HTTP → HTTPS |
| **Rate Limiting** | Twilio + Inngest retry logic, limitar 100 msgs/min/user |
| **Data Encryption** | Supabase SSL, senhas hashed com bcrypt, RLS para dados |
| **Audit Logging** | Todas ações em messages table (quem, quando, o quê) |

### Dados Sensíveis (LEI #11 LGPD)

| Dado | Proteção | Acesso |
|------|----------|--------|
| **Saúde Mental** (crises, ansiedade) | RLS + criptografia Supabase | Apenas usuário (RLS) |
| **Remédios/Saúde** | RLS + criptografia | Apenas usuário (RLS) |
| **Localização** (se coletado) | Nunca armazenar, apenas processar | Em memória, não persistir |
| **Dados Pessoais** (email, phone) | Encriptado em repouso | RLS, direito à deleção |

### Direitos LGPD

- ✅ Consentimento explícito (checkbox + data + versão)
- ✅ Direito de acesso (GET /api/user/data)
- ✅ Direito à correção (PATCH /api/user/profile)
- ✅ Direito à deleção (DELETE /api/user/account — soft delete)
- ✅ Direito à portabilidade (exportar JSON)
- ✅ Auditoria (logs em messages table)

---

## 📋 Validação & Regras de Negócio

| Regra | Implementação | Onde |
|-------|--------------|------|
| Mensagem válida | body != vazio, <= 4096 chars | Backend /api/messages |
| Crise detectada | severity >= 8 ou keywords matched | Crisis detection routine |
| Resposta crise | enviar PRÉ-GRAVADA (nunca IA pura) | Inngest job, LEI #12 |
| Consentimento | explícito antes de usar dados sensíveis | /api/auth/register |
| RLS ativo | usuário só vê seus dados | Supabase policies |
| Soft delete | deleted_at != null, nunca hard delete | Database triggers |
| Índices | em fields críticos (user_id, created_at, severity) | Database creation |

---

## 🏗️ Estrutura de Arquivos

```
Mentor24h/
├── /forge                         ← FORGE workspace (inviolável)
│   ├── forge-data.json            ← metadados (única fonte verdade)
│   └── forge-data.js              ← versão JS (offline)
│
├── /docs                          ← Documentação SDD
│   ├── PRD.md                     ← O que é (v1 ✅)
│   ├── CONSTITUTION.md            ← 22 leis (v1 ✅)
│   ├── SPEC.md                    ← Arquitetura (v1 ✅)
│   ├── PLAN.md                    ← Sprints (pendente)
│   └── BACKUP-STRATEGY.md         ← Backup procedures
│
├── /references                    ← Documentação técnica
│   ├── ARCHITECTURE.md            ← Diagrama C4 + decisões
│   ├── DATABASE.md                ← Schema detalhado
│   └── API.md                     ← Endpoints + request/response
│
├── /src                           ← CÓDIGO DE PRODUÇÃO (inviolável por FORGE)
│   ├── /app                       ← Next.js App Router
│   │   ├── /auth                  ← login, register, logout
│   │   ├── /dashboard             ← protegidas por RLS
│   │   │   ├── /tasks
│   │   │   ├── /messages
│   │   │   ├── /categories
│   │   │   ├── /crises
│   │   │   ├── /audios
│   │   │   ├── /routines
│   │   │   └── /profile
│   │   ├── /api                   ← API routes
│   │   │   ├── /auth
│   │   │   ├── /whatsapp
│   │   │   ├── /messages
│   │   │   ├── /categories
│   │   │   ├── /routines
│   │   │   └── /user
│   │   └── layout.tsx             ← Root layout
│   │
│   ├── /components                ← React components (Shadcn/ui)
│   │   ├── /dashboard             ← Cards, Charts, etc
│   │   ├── /forms                 ← Login, Profile edit
│   │   ├── /kanban                ← Task board
│   │   └── /common                ← Header, Nav, Footer
│   │
│   ├── /lib                       ← Utilidades compartilhadas
│   │   ├── drizzle.ts             ← Instância Drizzle
│   │   ├── supabase.ts            ← Supabase client
│   │   ├── auth.ts                ← Supabase Auth helpers
│   │   ├── twilio.ts              ← Twilio client
│   │   ├── inngest.ts             ← Inngest client
│   │   └── validators.ts          ← Zod schemas
│   │
│   ├── /data                      ← Dados estáticos (CRÍTICOS)
│   │   ├── crisis-keywords.json   ← LEI #16: keywords autoridade
│   │   │   └── { termo, categoria, peso, resposta }
│   │   ├── assistants.json        ← 6 assistentes + tom
│   │   ├── categories.json        ← 42 categorias seed
│   │   └── audios.json            ← 92 áudios metadata
│   │
│   ├── /styles                    ← CSS global
│   │   └── globals.css            ← Tailwind + custom CSS
│   │
│   ├── /hooks                     ← React hooks customizados
│   │   ├── useAuth.ts
│   │   ├── useMessages.ts
│   │   └── useCrisisDetection.ts
│   │
│   ├── /store                     ← Zustand stores
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── categoriesStore.ts
│   │
│   └── /services                  ← Lógica de negócio
│       ├── crisisDetectionService.ts
│       ├── messageService.ts
│       └── routineService.ts
│
├── /scripts                       ← Scripts de produção
│   ├── seed-database.ts           ← Populate 42 categories, 92 audios
│   ├── restore-backup.sh          ← Restaurar de backup
│   └── migration-runner.ts        ← Drizzle migrations
│
├── /tests                         ← Unit + Integration tests
│   ├── /unit
│   │   ├── crisisDetection.test.ts
│   │   └── validators.test.ts
│   ├── /integration
│   │   ├── messages.api.test.ts
│   │   └── auth.api.test.ts
│   └── setup.ts                   ← Jest config
│
├── /public                        ← Assets estáticos
│   ├── /audios                    ← 92 áudios .mp3
│   ├── /images                    ← Logo, icons
│   └── /fonts                     ← Custom fonts
│
├── CLAUDE.md                      ← Contexto permanente
├── .env.example                   ← Variáveis de exemplo (SEM valores!)
├── .env                           ← Secrets (NUNCA commitado!)
├── .gitignore                     ← .env, node_modules, etc
├── package.json                   ← Dependências
├── tsconfig.json                  ← TypeScript config
├── next.config.js                 ← Next.js config
└── vercel.json                    ← Vercel + Cron config
```

---

## ⚡ Performance & Otimizações

### Metas

| Métrica | Alvo | Ferramenta |
|---------|------|-----------|
| Carregamento inicial | < 3s (3G) | Lighthouse, WebPageTest |
| Time to Interactive | < 4s | Lighthouse |
| Bundle size | < 200KB (gzipped) | Bundle Analyzer |
| Database query | < 100ms | slow query log (Supabase) |
| API response | < 200ms | APM (Sentry) |
| Crise detection | < 50ms | performance monitoring |

### Otimizações Planejadas

1. **Image optimization:** Next.js Image component
2. **Code splitting:** Dynamic imports para páginas não-críticas
3. **Caching:** Service Worker (PWA), HTTP cache headers
4. **Database:** Índices em queries críticas, LIMIT em paginações
5. **API:** Compression, HTTP/2 push, CDN Vercel

---

## 🔄 Migrações Futuras

| Item Atual | Migração Para | Quando | Por quê |
|-----------|--------------|--------|---------|
| JSON keywords | Machine Learning (fine-tuned model) | v2 (após 1k usuarios) | Melhorar detecção |
| Vercel Cron | Kubernetes (auto-scale routines) | v3 (100k+ usuarios) | Escala horizontal |
| Supabase | Multi-region | v2 | Latência global |
| Twilio | WhatsApp Business API nativo | v2 (se crescer 100x) | Economizar $, controle |
| Next.js | Edge Computing | v3 | Latência zero |

---

## 📊 Definição de Pronto (DoD Global)

Para uma feature ser considerada PRONTA:

- [ ] Código implementado conforme esta SPEC
- [ ] Nenhuma lei da Constitution violada (rodar /constitution-check)
- [ ] Unit tests + integration tests passando
- [ ] Sem erros no console (dev tools limpo)
- [ ] Funciona em todos os breakpoints (mobile/tablet/desktop)
- [ ] Acessibilidade WCAG AA mínima (contrast, alt text, keyboard)
- [ ] Registrado no forge-data.json (task marcada concluída)
- [ ] Code review por FORGE (AI-powered)
- [ ] Sem secrets em código (grep .env)
- [ ] Performance OK (Lighthouse > 80)

---

## ✅ Conclusão

Esta SPEC traduz o PRD (O QUE construir) em decisões técnicas precisas (COMO construir), respeitando as 22 leis da Constitution. Cada decisão tem "por quê", cada endpoint tem specification, cada tabela tem índices otimizados.

**Status:** ✅ Pronto para PLAN (próxima etapa: quebrar em sprints/tasks)

---

**Gerado com rigor profissional por Claude (Opus 4.6) + Leonardo**  
**Modelo:** Spec-Driven Development (SDD)  
**Próximo:** `/forge-plan` (sprints e tasks)
