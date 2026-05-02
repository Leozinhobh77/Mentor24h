# ◎ PLAN — Plano de Ataque Sprint 2

**Projeto:** Mentor24h  
**Versão:** 2.0  
**Data:** 2026-05-01  
**Status:** 🔄 Em execução  
**Baseado em:** SPEC v1.0 + PRD v1.0 + Constitution v1.0  
**Gerado por:** FORGE + Sonnet 4.6

---

## 📊 Progresso Geral

| Sprint | Nome | Tasks | Progresso |
|--------|------|-------|-----------|
| 1 | Setup & Auth Foundation | 20/20 | ✅ 100% |
| 2 | WhatsApp Integration & Crisis | 0/35 | ░░░░░░░░░░ 0% |
| 3 | Dashboard Completion & Routines | 0/20 | ░░░░░░░░░░ 0% (futuro) |
| 4 | Escalability & Analytics | 0/15 | ░░░░░░░░░░ 0% (futuro) |
| **Total** | | **20/70** | **29%** |

---

## ⏱️ Estimativa

| Métrica | Valor |
|---------|-------|
| Sprints | 4 (MVP completo) |
| Tasks | 70 total |
| Sprint 2 (atual) | 35 tasks |
| Esforço estimado | ~30-35 horas |
| Ritmo sugerido | ~8h/semana (part-time) ou ~4-5 semanas full-time |
| Conclusão estimada | ~2026-06-15 (Sprint 2 completo) |

---

## 🏃 Sprint 1 — ✅ COMPLETO

**Objetivo:** Fundação técnica, autenticação, componentes UI  
**Meta:** Next.js 15 + React 19 + Auth completo + 10+ componentes reutilizáveis

- ✅ 20/20 Tasks (TASK-001 a TASK-020)
- ✅ 68+ arquivos criados
- ✅ 8.500+ linhas de código
- ✅ 99% taxa de qualidade
- ✅ Pronto para produção

[Ver: docs/SPRINT-1-COMPLETION.md]

---

## 🏃 Sprint 2 — WhatsApp Integration & Crisis Foundation

> **Objetivo:** Setup completo + autenticação funcionando  
> **Meta:** User consegue fazer login → dashboard aparece

### TASK-001 — Setup Monorepo
**Complexidade:** 🟢 Baixa | **Depende de:** nada | **SPEC:** Stack Técnica

Criar estrutura base do projeto:
- Next.js 15 com App Router
- Drizzle ORM configurado
- Supabase client
- TypeScript strict mode
- Tailwind CSS

**Definition of Done:**
- [ ] `npm create next-app@latest` executado
- [ ] Drizzle config pronto (`drizzle.config.ts`)
- [ ] Supabase env vars carregam sem erro
- [ ] `npm run dev` inicia sem warnings
- [ ] Estrutura /src criada (app, components, lib, data, hooks, store, services)

---

### TASK-002 — Variables de Ambiente
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-001 | **SPEC:** Stack Técnica

Criar `.env.example` com todas as secrets necessárias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `CLAUDE_API_KEY`
- `INNGEST_EVENT_KEY`

**Definition of Done:**
- [ ] `.env.example` existe com 10+ variáveis
- [ ] `.env` não é commitado (`.gitignore`)
- [ ] Dev consegue `cp .env.example .env.local` e rodar
- [ ] Documentação: como preencher cada variável

---

### TASK-003 — Schema Drizzle
**Complexidade:** 🟡 Média | **Depende de:** TASK-001 | **SPEC:** Database → Tables

Criar schema Drizzle com 6 tabelas críticas:
- `users` (id, email, phone_whatsapp, name, selected_assistant, consentimento_explicito, etc)
- `messages` (id, user_id, body, severity, crisis_detected, crisis_keywords, etc)
- `categories` (id, name, pillar, icon, order_index)
- `user_categories` (M2M join)
- `audios` (id, category_id, title, duration_seconds, url_storage)
- `routines` (id, user_id, routine_name, schedule_cron, last_run_at, next_run_at)

**Definition of Done:**
- [ ] Arquivo `src/lib/db/schema.ts` existe
- [ ] Todas as 6 tabelas definidas com tipos Drizzle
- [ ] Relações (FK) estão corretas
- [ ] Indices críticos definidos (user_id, created_at DESC, severity WHERE)
- [ ] `npm run db:push` executa sem erro (Supabase)
- [ ] Schema aparece no Supabase Studio

---

### TASK-004 — Supabase RLS Policies
**Complexidade:** 🟡 Média | **Depende de:** TASK-003 | **SPEC:** Database → RLS

Implementar Row-Level Security em 4 tabelas (LEI #11):
- `users`: usuário vê só seus dados
- `messages`: usuário vê só suas mensagens
- `user_categories`: usuário vê só suas seleções
- `routines`: usuário vê só suas routines

**Definition of Done:**
- [ ] RLS habilitado em todas as 4 tabelas
- [ ] Políticas testadas no Supabase Studio
- [ ] User A não consegue acessar dados de User B
- [ ] Admin consegue acessar tudo (is_admin = true)
- [ ] Erro apropriado retornado se acesso negado (403)

---

### TASK-005 — Auth Controller
**Complexidade:** 🟡 Média | **Depende de:** TASK-004 | **SPEC:** API → Auth Endpoints

Implementar lógica de autenticação:
- POST /api/auth/register → cria user + JWT
- POST /api/auth/login → retorna JWT + refresh token
- POST /api/auth/refresh → renova JWT
- POST /api/auth/logout → invalida refresh token
- JWT validation middleware

**Definition of Done:**
- [ ] Supabase Auth integrado (`supabaseClient.auth.*`)
- [ ] Passwords hasheados (Supabase handles)
- [ ] JWT válido por 1h, refresh válido por 7 dias
- [ ] Endpoints retornam estrutura padrão: `{access_token, refresh_token, expires_in, user}`
- [ ] Testes: registro duplicado retorna 409 CONFLICT
- [ ] Testes: login com senha errada retorna 401 UNAUTHORIZED

---

### TASK-006 — Login Page (UI)
**Complexidade:** 🟡 Média | **Depende de:** TASK-005 | **SPEC:** Interface → Telas

Criar página `/auth/login`:
- Email + Password inputs
- "Esqueceu senha?" link (futuro v1.5)
- "Criar conta" link → register
- Error feedback
- Loading state
- Responsivo (mobile, tablet, desktop)

**Definition of Done:**
- [ ] Página renderiza em `/auth/login`
- [ ] Form submit chama `/api/auth/login`
- [ ] Token salvo em localStorage (ou cookie seguro)
- [ ] Erro exibido se login falha
- [ ] Redirect para `/dashboard` após sucesso
- [ ] WCAG AA (labels, focus states, contrast)
- [ ] Mobile: <48px clickable areas
- [ ] Lighthouse: FCP <1.5s

---

### TASK-007 — Register Page (UI)
**Complexidade:** 🟡 Média | **Depende de:** TASK-005 | **SPEC:** Interface → Telas

Criar página `/auth/register`:
- Email, password, phone_whatsapp, name inputs
- Validação frontend (email format, password strength)
- "Já tem conta?" link → login
- Terms checkbox (LGPD)
- Confirmação de sucesso
- Responsivo

**Definition of Done:**
- [ ] Página renderiza em `/auth/register`
- [ ] Form submit chama `/api/auth/register`
- [ ] Validação: email válido (regex), password min 8 chars
- [ ] Validação: phone é WhatsApp (formato)
- [ ] Error exibido se email já existe (409)
- [ ] Checkbox: "Li e concordo com LGPD" obrigatório
- [ ] Redirect para `/auth/login` após sucesso
- [ ] WCAG AA completo

---

### TASK-008 — Auth Middleware
**Complexidade:** 🟡 Média | **Depende de:** TASK-005 | **SPEC:** Backend → Architecture

Proteger rotas privadas:
- Middleware verifica JWT válido
- Extrai user_id do JWT
- Passa `user` para contexto da request
- Rotas públicas: `/auth/login`, `/auth/register`, `/api/whatsapp/webhook`
- Rotas privadas: tudo mais

**Definition of Done:**
- [ ] Middleware função existe e é reutilizável
- [ ] Sem token → 401 UNAUTHORIZED
- [ ] Token expirado → 401 (com hint pra refresh)
- [ ] Token inválido (malformed) → 401
- [ ] Valid token → `req.user` populated
- [ ] Admin routes (ex: GET /api/crises) verificam `is_admin`

---

### TASK-009 — User Profile Endpoint
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-008 | **SPEC:** API → User Endpoints

GET /api/user/profile → retorna perfil do user autenticado

**Definition of Done:**
- [ ] Endpoint existe e é autenticado
- [ ] Retorna: id, email, name, phone_whatsapp, selected_assistant, avatar_url, timezone, wellbeing_goal, consentimento_explicito, created_at
- [ ] Sem dados sensíveis expostos (password_hash, tokens)
- [ ] RLS respeitado (user vê só seus dados)

---

### TASK-010 — Get Current User
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-008 | **SPEC:** API → User Endpoints

GET /api/user/me → shortcut para perfil atual (usado na verificação de sessão)

**Definition of Done:**
- [ ] Endpoint existe (aliases GET /api/user/profile)
- [ ] Usado no frontend para carregar dados do user logado
- [ ] Retorna 200 se autenticado, 401 se não

---

### TASK-011 — Seed Categories (42 Items)
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-003 | **SPEC:** Database → Seed Data

Criar seed script com 42 categorias:

**Organization (12):**
- Tarefas do Dia, Lembretes, Planejamento Semanal, Metas, Hábitos, Revisão Pessoal, Checklist, Organização Financeira, Calendário, Notas, Projectos, Prioridades

**Inspiration (10):**
- Motivação Diária, Frases Inspiradoras, Histórias de Sucesso, Mentalidade de Crescimento, Superação, Criatividade, Propósito de Vida, Reflexão, Aprendizado, Sabedoria

**Entertainment (10):**
- Piadas e Humor, Curiosidades, Contos, Crônicas, Poesia, Músicas, Vídeos, Documentários, Séries, Podcast

**Wellbeing (10):**
- Meditação, Respiração, Yoga, Exercício Físico, Nutrição, Sono, Relaxamento, Mindfulness, Gratidão, Equilíbrio

**Definition of Done:**
- [ ] Script `src/scripts/seed-categories.ts` criado
- [ ] `npm run seed:categories` executa sem erro
- [ ] 42 categorias em Supabase com pillar + icon + order_index
- [ ] Imutável em produção (apenas para MVP setup)

---

### TASK-012 — Seed Audios (92 Items)
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-011 | **SPEC:** Database → Seed Data

Criar seed script com 92 áudios (referências de URLs dummy para MVP):

- Meditation (20)
- Breathing (8)
- Prayers (15)
- Stories (12)
- Motivation (10)
- Exercises (8)
- Inspirational (6)
- Comedy (8)
- Affirmations (5)

Cada audio tem: title, category_id, duration_seconds, narrator, url_storage (placeholder)

**Definition of Done:**
- [ ] Script `src/scripts/seed-audios.ts` criado
- [ ] `npm run seed:audios` executa sem erro
- [ ] 92 audios em Supabase
- [ ] URL storage é placeholder (será substituído por upload real em v1.5)
- [ ] Duration em segundos (realista: 180-600s)

---

### TASK-013 — Dashboard Layout (Basic)
**Complexidade:** 🟡 Média | **Depende de:** TASK-010 | **SPEC:** Interface → Dashboard

Criar página `/dashboard` com:
- Header com logo + user menu
- Sidebar com navegação (Messages, Categories, Audios, Routines, Profile, Settings)
- Main content area (vazio por enquanto)
- Logout button
- Responsivo (mobile: hamburger menu)

**Definition of Done:**
- [ ] Página renderiza em `/dashboard`
- [ ] Sem token → redirect para `/auth/login`
- [ ] Header mostra nome do user
- [ ] Sidebar navegável (links ativos)
- [ ] Mobile: hamburger menu
- [ ] Logout funciona (limpa token + redirect)
- [ ] WCAG AA (navigation landmarks, skip links)

---

### TASK-014 — Testing Setup
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-001 | **SPEC:** Testing

Configurar Jest + Supertest:
- `jest.config.js` configurado
- Test helpers para auth (mock JWT)
- Test helpers para database (Supabase sandbox)
- Example test existindo

**Definition of Done:**
- [ ] `npm test` executa sem erro
- [ ] Coverage inicial: 0% (crescerá conforme tasks)
- [ ] GitHub Actions CI está pronto (rodará tests)
- [ ] Exemplo: `tests/api/auth.test.ts` passa

---

### TASK-015 — Deploy Vercel (Frontend)
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-006 | **SPEC:** Deploy

Fazer deploy do frontend em Vercel:
- Conectar repo GitHub
- ENV vars configuradas (NEXT_PUBLIC_*)
- Build && deploy automático
- Domínio temporário funciona

**Definition of Done:**
- [ ] URL Vercel acessível (ex: mentor24h-staging.vercel.app)
- [ ] Build log sem warnings
- [ ] Login page carrega (<2s)
- [ ] Lighthouse Vercel: >80
- [ ] Supabase connection works

---

### TASK-016 — Deploy Railway (Backend)
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-005 | **SPEC:** Deploy

Fazer deploy do backend em Railway:
- Conectar repo GitHub
- ENV vars configuradas (secrets)
- PostgreSQL add-on pronto
- Build && deploy automático

**Definition of Done:**
- [ ] URL Railway acessível (ex: mentor24h-api.railway.app)
- [ ] `GET /api/health` retorna 200
- [ ] `POST /api/auth/login` funciona
- [ ] Logs visíveis em Railway dashboard

---

### TASK-017 — Integration Test: Login Flow
**Complexidade:** 🟡 Média | **Depende de:** TASK-015 + TASK-016 | **SPEC:** Testing

Teste E2E: user consegue register + login + acessar dashboard?

**Definition of Done:**
- [ ] Test: POST /api/auth/register com email novo → 201 + user criado
- [ ] Test: POST /api/auth/login com credenciais corretas → 200 + JWT
- [ ] Test: GET /api/user/profile com JWT válido → 200 + user data
- [ ] Test: GET /api/user/profile sem JWT → 401
- [ ] Frontend: Register → Login → Dashboard funciona sem erro

---

### TASK-018 — Fix CORS / Auth Errors
**Complexidade:** 🟡 Média | **Depende de:** TASK-017 | **SPEC:** Backend

Resolver qualquer erro de CORS ou autenticação encontrado:
- CORS headers configurados (Vercel → Railway)
- Token JWT propagado corretamente
- Refresh token flow testado
- Erro mensagens amigáveis

**Definition of Done:**
- [ ] Nenhum CORS error no console do browser
- [ ] Nenhum 401 inesperado no dashboard
- [ ] Request headers corretos (`Authorization: Bearer {token}`)
- [ ] Refresh token renovação automática

---

### TASK-019 — Lighthouse Audit (Baseline)
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-015 | **SPEC:** Performance

Rodar Lighthouse no dashboard:
- FCP (First Contentful Paint): <1.5s
- LCP (Largest Contentful Paint): <2.5s
- CLS (Cumulative Layout Shift): <0.1
- Performance score: >80

**Definition of Done:**
- [ ] Lighthouse score capturado (`Lighthouse-baseline.json`)
- [ ] Nenhum crítico "error"
- [ ] Performance > 80 (alvo)
- [ ] Accessibility > 90
- [ ] SEO > 80

---

### TASK-020 — Documentation (Setup Guide)
**Complexidade:** 🟢 Baixa | **Depende de:** TODO | **SPEC:** Documentation

Criar `docs/SETUP.md` com:
- Pré-requisitos (Node 18+, npm 9+)
- Clone repo
- `npm install`
- `cp .env.example .env.local` + preencher
- `npm run db:push`
- `npm run seed:*`
- `npm run dev`
- Como rodar testes
- Como fazer deploy

**Definition of Done:**
- [ ] README.md ou SETUP.md existe em raiz ou docs/
- [ ] Dev novo consegue seguir 5 passos e ter app rodando
- [ ] Erros comuns listados (ex: "Supabase connection refused")

---

## 🏃 SPRINT 2 — Core MVP (Semana 2)

> **Objetivo:** Messages + Detecção de Crise + WhatsApp funcionando  
> **Meta:** User envia msg WhatsApp → detecção crise → resposta automática

### TASK-021 — POST /api/messages Endpoint
**Complexidade:** 🟡 Média | **Depende de:** TASK-008 | **SPEC:** API → Messages

POST /api/messages — user envia mensagem via Dashboard

Entrada: `{body: string, source: "dashboard" | "whatsapp"}`

Saída: `{id, body, severity, crisis_detected, response, created_at}`

**Definition of Done:**
- [ ] Endpoint autenticado (requer JWT)
- [ ] Salva em `messages` table (Supabase)
- [ ] Valida: body não vazio
- [ ] Retorna status 201 Created

---

### TASK-022 — GET /api/messages (Paginado)
**Complexidade:** 🟡 Média | **Depende de:** TASK-021 | **SPEC:** API → Messages

GET /api/messages?limit=20&offset=0 — user busca histórico

Retorna: `{data: [{id, body, severity, ...}], pagination: {limit, offset, total}}`

**Definition of Done:**
- [ ] Query params: limit (max 100), offset
- [ ] RLS: user vê só suas mensagens
- [ ] Índice usado: idx_messages_user_created (rápido)
- [ ] Paginação: retorna max 20 por padrão

---

### TASK-023 — JSON Keywords for Crisis Detection
**Complexidade:** 🟢 Baixa | **Depende de:** — | **SPEC:** Detecção de Crise

Criar arquivo `src/data/crisis-keywords.json`:

```json
{
  "suicidio": {
    "weight": 10,
    "keywords": ["suicídio", "suicida", "quero morrer", "melhor não existir"]
  },
  "automutilacao": {
    "weight": 9,
    "keywords": ["cortar", "magoar-me", "sangue"]
  },
  "depressao_grave": {
    "weight": 8,
    "keywords": ["não aguanto mais", "não consigo", "tudo é sem sentido"]
  },
  // ... mais 10-15 categorias
}
```

**Definition of Done:**
- [ ] Arquivo JSON existe com 15+ categorias
- [ ] Cada categoria tem weight (0-10) e keywords array
- [ ] Testado: "não aguanto mais" detecta depressao_grave
- [ ] False positives evitados (ex: "não consigo" sozinho não ativa)

---

### TASK-024 — Crisis Scoring Algorithm
**Complexidade:** 🟡 Média | **Depende de:** TASK-023 | **SPEC:** Detecção de Crise

Implementar função `calculateCrisisSeverity(message: string): {severity: 0-10, keywords: [], confidence: 0-1}`

Lógica:
- Parse message em tokens
- Match cada token contra keywords JSON
- Sum weights (máximo 10)
- Confiança = (keywords_matched / total_tokens) * weight_avg

Exemplo:
```
"não aguanto mais com isso" 
→ "não aguanto mais" = weight 8
→ severity = 8, confidence = 0.75
```

**Definition of Done:**
- [ ] Função existe em `src/lib/crisis.ts`
- [ ] Testes: 50+ mensagens com resultados conhecidos
- [ ] Score 0-10 (nunca negativo)
- [ ] Confidence 0-1
- [ ] Performance: <10ms por mensagem

---

### TASK-025 — Pattern Matching (Regex + Keywords)
**Complexidade:** 🟡 Média | **Depende de:** TASK-024 | **SPEC:** Detecção de Crise

Integrar pattern matching em TASK-021 (POST /api/messages):

Quando user envia mensagem:
1. Chama `calculateCrisisSeverity(body)`
2. Se severity >= 8 → `crisis_detected = true`
3. Salva em messages: `{severity, crisis_keywords, crisis_detected}`

**Definition of Done:**
- [ ] POST /api/messages chama calculateCrisisSeverity
- [ ] Mensagem com "suicidio" salva com severity >= 8
- [ ] Mensagem normal salva com severity < 8
- [ ] RLS: crisis_detected visível só para admin + user dono

---

### TASK-026 — Crisis Response Templates
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-025 | **SPEC:** Crises Response

Criar arquivo `src/data/crisis-responses.json`:

```json
{
  "default": "Percebi que você pode estar passando por um momento difícil. Gostaria de ajudar. Aqui estão recursos que podem ser úteis...",
  "suicidio": "Você importa. Se está tendo pensamentos suicidas, entre em contato com:\n📞 CVV: 188\n📞 Disque 100 (Direitos Humanos)\n🌐 befree.com.br\n\nPor favor, procure ajuda profissional agora.",
  "automutilacao": "Entendo que você está sofrendo. Automutilação é um sinal de que você precisa de apoio profissional...",
  // ... mais templates por severidade
}
```

**Definition of Done:**
- [ ] Arquivo existe com 5+ templates
- [ ] Cada template é uma string de resposta pré-gravada
- [ ] Referências reais (CVV, Disque 100, etc)
- [ ] Compassivo, não julgador

---

### TASK-027 — Save Crisis to Audit Log
**Complexidade:** 🟡 Média | **Depende de:** TASK-025 | **SPEC:** Database → crisis_audit_log

Quando crisis_detected = true:
1. Salva em `crisis_audit_log` table (imutável, append-only)
2. Log: message_id, user_id, severity, keywords_matched, action_taken, created_at
3. Admin consegue auditar todas as crises

**Definition of Done:**
- [ ] Tabela `crisis_audit_log` exists (6 campos)
- [ ] RLS: só SELECT para admin, INSERT obrigatório
- [ ] Nenhuma UPDATE/DELETE (imutável)
- [ ] Índice: idx_crisis_audit_created (para admin view rápido)

---

### TASK-028 — Messages Page (Frontend)
**Complexidade:** 🟡 Média | **Depende de:** TASK-022 | **SPEC:** Interface

Criar página `/dashboard/messages`:
- GET /api/messages
- Lista de mensagens (newest first)
- Exibe: body, severity (cor: 🟢 <5, 🟡 5-7, 🔴 8-10), data
- Crise detectada: badge 🚨
- Pagination (20 por página)
- Search/filter by severity (futuro)

**Definition of Done:**
- [ ] Página carrega mensagens do user
- [ ] Severity visual clara (cores)
- [ ] Crisis badge exibido
- [ ] Pagination funciona (prev/next)
- [ ] Mobile: columns ajustadas
- [ ] WCAG AA: table semantics

---

### TASK-029 — Crisis Log Admin View
**Complexidade:** 🟡 Média | **Depende de:** TASK-027 | **SPEC:** Dashboard

Criar página `/dashboard/admin/crises` (só para is_admin = true):
- GET /api/admin/crises (todos os crises do sistema)
- Lista: user, message, severity, keywords, action_taken, timestamp
- Filtros: severity, data range, user
- Export CSV (futuro v1.5)

**Definition of Done:**
- [ ] Página só acessível para admin (middleware)
- [ ] Retorna crises de TODOS os users
- [ ] RLS bypass com `service_role_key`
- [ ] Rápido mesmo com 10k+ crises (índice)

---

### TASK-030 — Twilio Account Setup
**Complexidade:** 🟢 Baixa | **Depende de:** — | **SPEC:** WhatsApp

Criar conta Twilio + obter:
- Account SID
- Auth Token
- WhatsApp Sandbox phone number (ex: +1 415-523-8886)
- Trial $15 credit (covers ~300 msgs)

Salvar em `.env.local`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=whatsapp:+1415523xxxx
```

**Definition of Done:**
- [ ] Conta ativa
- [ ] Credentials em .env
- [ ] WhatsApp Sandbox verified
- [ ] Teste: enviar msg via Twilio console → receber no app

---

### TASK-031 — Webhook POST /api/whatsapp/webhook
**Complexidade:** 🟡 Média | **Depende de:** TASK-025 + TASK-030 | **SPEC:** API → WhatsApp

POST /api/whatsapp/webhook — Twilio envia msgs aqui

Lógica:
1. Valida assinatura Twilio (security)
2. Extrai: phone_number, message_body
3. Busca user por phone_whatsapp
4. Se não existe: cria user (first contact)
5. Enfileira `processMessage` em Inngest
6. Retorna 200 (webhook confirmado)

**Definition of Done:**
- [ ] Valida Twilio signature (rejeita requests fakes)
- [ ] User criado auto se não existe
- [ ] Message enfileirada em Inngest
- [ ] Retorna 200 (obrigatório para Twilio)
- [ ] Logs tudo (para debug)

---

### TASK-032 — Webhook Verification GET
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-031 | **SPEC:** API → WhatsApp

GET /api/whatsapp/webhook?hub.challenge=VERIFICATION_TOKEN — Twilio setup validation

Lógica:
1. Recebe challenge token
2. Retorna token como texto (simples)
3. Twilio valida que URL está vivo

**Definition of Done:**
- [ ] GET retorna challenge token
- [ ] Twilio verification passa
- [ ] Webhook URL está registrada em Twilio console

---

### TASK-033 — Inngest Job for Message Processing
**Complexidade:** 🟡 Média | **Depende de:** TASK-031 | **SPEC:** Architecture → Inngest

Criar Inngest job `processMessage`:

```typescript
inngest.createFunction(
  { id: "process-message" },
  { event: "whatsapp/message.received" },
  async ({ event, step }) => {
    // 1. Detecta crise
    // 2. Salva em DB
    // 3. Monta resposta
    // 4. Envia via Twilio
    // 5. Log audit
  }
);
```

**Definition of Done:**
- [ ] Job existe e é registrado
- [ ] Recebe event: {phone_number, body}
- [ ] Executa sem timeout (30s max)
- [ ] Pode ser retentado automático se falha

---

### TASK-034 — Inngest Job for Retry Logic
**Complexidade:** 🟡 Média | **Depende de:** TASK-033 | **SPEC:** Architecture

Configurar retry automático:
- Se Twilio.send() falhar → retry 3x com backoff exponencial
- Se DB save falha → retry 5x
- Se Claude API timeout → fallback a resposta pré-gravada

**Definition of Done:**
- [ ] Job config: `{ retries: 3, timeout: "30s" }`
- [ ] Teste: simular falha Twilio → retry automático
- [ ] Log: cada tentativa registrada

---

### TASK-035 — Parse Twilio Message Format
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-031 | **SPEC:** WhatsApp

Entender formato Twilio webhook:

```
From: whatsapp:+5511999999999
To: whatsapp:+5511987654321
Body: mensagem do usuário
MessageSid: SM12345...
```

Criar helper `parseTwilioMessage(body: FormData)`:
- Extrai phone_number (remove "whatsapp:")
- Extrai message_body
- Retorna {phoneNumber, messageBody}

**Definition of Done:**
- [ ] Helper função existe
- [ ] Parser trabalha com formato real
- [ ] Teste: webhook de Twilio é parseado corretamente

---

### TASK-036 — Send WhatsApp Response via Twilio
**Complexidade:** 🟡 Média | **Depende de:** TASK-026 + TASK-034 | **SPEC:** API → WhatsApp

Enviar resposta para user via Twilio:

```typescript
const twilio = require("twilio");
const client = twilio(accountSid, authToken);

await client.messages.create({
  from: "whatsapp:+1415523...", // sandbox
  to: `whatsapp:${userPhone}`,
  body: responseTemplate
});
```

**Definition of Done:**
- [ ] Função `sendWhatsAppMessage(phone, body)` existe
- [ ] Twilio client autenticado
- [ ] Teste: enviar msg real → recebe no WhatsApp Sandbox
- [ ] Error handling: se envio falha, retry

---

### TASK-037 — Log All WhatsApp Interactions
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-035 + TASK-036 | **SPEC:** Audit

Registrar cada interação (incoming + outgoing):
- Incoming: salva em messages table (TASK-021)
- Outgoing: salva em messages table com `response_sent_at`
- Todos os erros: salva em error log

**Definition of Done:**
- [ ] Incoming SMS em messages: body, source = "whatsapp"
- [ ] Outgoing resposta em messages: response_sent_at, response_assistant
- [ ] Admin consegue auditar conversa completa

---

### TASK-038 — Categories Page (UI)
**Complexidade:** 🟡 Média | **Depende de:** TASK-013 | **SPEC:** Interface

Criar página `/dashboard/categories`:
- GET /api/categories (42 categorias agrupadas por pillar)
- UI: 4 seções (Organization, Inspiration, Entertainment, Wellbeing)
- Cada categoria: checkbox + icon + nome
- User marca selecionadas
- Salva em user_categories table

**Definition of Done:**
- [ ] Página renderiza 42 categorias
- [ ] Agrupamento visual por pilar
- [ ] Checkbox funciona (select/deselect)
- [ ] POST para servidor ao selecionar
- [ ] Visual: ícones + cores por pilar
- [ ] Mobile: responsivo (grid 2 colunas)

---

### TASK-039 — Select/Deselect Categories
**Complexidade:** 🟡 Média | **Depende de:** TASK-022 | **SPEC:** API → Categories

POST /api/categories/{id}/select — user marca categoria
POST /api/categories/{id}/deselect — user desmarca categoria

Lógica:
- INSERT em user_categories
- DELETE de user_categories
- RLS: user só consegue modificar suas seleções

**Definition of Done:**
- [ ] Endpoints autenticados
- [ ] Salva em user_categories M2M table
- [ ] RLS: user vê só suas seleções
- [ ] Retorna status confirmation

---

### TASK-040 — Audios Page (Streaming)
**Complexidade:** 🟡 Média | **Depende de:** TASK-012 + TASK-039 | **SPEC:** Interface

Criar página `/dashboard/audios`:
- GET /api/audios (filtrado por user_categories)
- Exibe: title, duration, narrator, play button
- Audio player: <audio> nativo
- Pausa/resume
- Progress bar

**Definition of Done:**
- [ ] Página carrega audios do user (por categorias selecionadas)
- [ ] Player funciona (play/pause)
- [ ] Duration exibido (mm:ss)
- [ ] Responsivo (mobile: full-width player)
- [ ] Nenhum audio exibe se user não selecionou categoria

---

### TASK-041 — User Preferences (Assistant Selection)
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-009 | **SPEC:** Interface

Criar página `/dashboard/settings`:
- Radio buttons: qual assistente? (Mateus, Lucas, Sérgio, Maria Clara, Bianca, Luciana)
- Exibe: nome + descrição curta (tom)
- POST /api/user/profile → atualiza `selected_assistant`

**Definition of Done:**
- [ ] 6 assistentes exibidos
- [ ] Descrição curta de cada um
- [ ] User consegue mudar seleção
- [ ] Salva em database
- [ ] Próximas respostas usam assistente selecionado

---

### TASK-042 — Testing: Crisis Detection (50+ Real Messages)
**Complexidade:** 🟡 Média | **Depende de:** TASK-024 + TASK-025 | **SPEC:** Testing

Teste com 50+ mensagens reais:
- Mensagens normais (esperado: severity < 8)
- Mensagens com crise (esperado: severity >= 8)
- Edge cases (falsas positivas?)
- Validar: accuracy > 95%

Exemplo de test data:
```javascript
[
  { message: "como está o tempo?", expected: false },
  { message: "estou muito triste", expected: false },
  { message: "não aguanto mais viver", expected: true },
  { message: "quero me machucar", expected: true },
  ...
]
```

**Definition of Done:**
- [ ] 50+ test cases existem
- [ ] Accuracy >= 95% (false positives < 5%)
- [ ] Resultado registrado (`crisis-test-results.json`)
- [ ] Nenhuma falsa positiva grave (ex: "estou cansado" = crisis)

---

### TASK-043 — Testing: WhatsApp Workflow End-to-End
**Complexidade:** 🟡 Média | **Depende de:** TASK-036 + TASK-042 | **SPEC:** Testing

Teste completo:
1. Envia msg via Twilio Sandbox
2. Webhook recebe → enfileira Inngest
3. Inngest processa (detecta crise)
4. Resposta enviada via Twilio
5. User recebe no WhatsApp

Simula: normal msg, crisis msg, falha Twilio (retry)

**Definition of Done:**
- [ ] Teste real: msg normal processada em <5s
- [ ] Teste real: msg crise + resposta em <5s
- [ ] Teste falha: Twilio timeout → retry funciona
- [ ] Tudo logado para debug

---

### TASK-044 — Fix Latency Issues (If Any)
**Complexidade:** 🟡 Média | **Depende de:** TASK-043 | **SPEC:** Performance

Se latência > 5s em TASK-043:
- Analisar: gargalo é Supabase? Claude API? Inngest?
- Otimizar queries (índices)
- Otimizar pattern matching (cache keywords)
- Otimizar Twilio calls (parallelizar)

**Definition of Done:**
- [ ] Latência < 5s medido 10x
- [ ] 99th percentile < 8s
- [ ] Nenhum timeout

---

### TASK-045 — Security Audit (LGPD, Secrets Check)
**Complexidade:** 🟡 Média | **Depende de:** TODO | **SPEC:** Security

Auditoria de segurança:
- ✅ LGPD: RLS ativo em sensitive tables
- ✅ LGPD: soft deletes implementado
- ✅ LGPD: direito à exclusão (DELETE endpoint) funciona
- ✅ Secrets: nenhuma API key hardcoded
- ✅ XSS: inputs validados + sanitizados
- ✅ CSRF: tokens de request inclusos
- ✅ SQL injection: Drizzle previne
- ✅ Auth: JWT validation rigoroso

**Definition of Done:**
- [ ] `npm audit` sem vulnerabilities críticas
- [ ] Grep: nenhuma "API_KEY" no código
- [ ] Teste: DELETE /api/user/account funciona (dado consentimento)
- [ ] RLS: User A não acessa dados User B
- [ ] Relatório: security-audit.md criado

---

### TASK-046 — WCAG AA Accessibility Review
**Complexidade:** 🟡 Média | **Depende de:** TODO | **SPEC:** Accessibility

Auditoria WCAG AA:
- Contrast: foreground vs background >= 4.5:1 (normal text) ou 3:1 (large text)
- Labels: inputs têm <label> ou aria-label
- Focus: :focus-visible em todos os buttons/links
- Skip links: "Pular para conteúdo"
- Keyboard navigation: Tab order lógico
- Alt text: imagens têm alt ou title
- Form errors: associadas ao input

**Definition of Done:**
- [ ] axe-core test em homepage → 0 violations
- [ ] Teste manual: navigate só com Tab
- [ ] Teste: color contrast checker
- [ ] Relatório: accessibility-audit.md

---

### TASK-047 — Lighthouse >80 Target
**Complexidade:** 🟢 Baixa | **Depende de:** TASK-046 | **SPEC:** Performance

Lighthouse em produção:
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: >80
- PWA: >70 (futuro)

**Definition of Done:**
- [ ] Lighthouse report em Vercel
- [ ] Nenhum "error" crítico
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

---

### TASK-048 — Polish UI (Spacing, Colors, Animations)
**Complexidade:** 🟡 Média | **Depende de:** TODO | **SPEC:** Interface

Refinamento visual:
- Spacing: consistente (8px grid)
- Colors: pilares têm cores distintas
- Transitions: suave (200-300ms)
- Hover states: feedback claro
- Loading states: spinner + esqueleto
- Empty states: mensagem amigável

**Definition of Done:**
- [ ] Whitespace equilibrado
- [ ] Cores coincidem com design system
- [ ] Transitions smooth (DevTools não pede otimização)
- [ ] Design review: "pronto para MVP"

---

### TASK-049 — Error Handling + User Feedback
**Complexidade:** 🟡 Média | **Depende de:** TODO | **SPEC:** UX

Mensagens de erro:
- Network error → "Falha de conexão. Tente novamente"
- Auth error (401) → "Sessão expirou. Faça login novamente"
- Server error (500) → "Erro interno. Reportamos para time"
- Validation error → "Campo obrigatório: email"
- Success → Toast verde com ✓

**Definition of Done:**
- [ ] Todos os endpoints tratam erro
- [ ] Toast/snackbar library integrado
- [ ] Teste: network offline → mensagem clara
- [ ] Teste: JWT expirado → redirect login

---

### TASK-050 — Deploy v1.0-beta
**Complexidade:** 🟢 Baixa | **Depende de:** TODO | **SPEC:** Deploy

Fazer deploy de tudo em produção staging:
- Frontend v1.0-beta no Vercel
- Backend v1.0-beta no Railway
- Database migração completa
- Seed data rodado
- Monitoring (Sentry) ativo

**Definition of Done:**
- [ ] URL pública acessível (mentor24h-beta.vercel.app)
- [ ] Twilio integrado (msgs reais chegam)
- [ ] Inngest dashboard mostra jobs
- [ ] Sentry recebe primeiros eventos
- [ ] Log file: deploy-notes-v1.0-beta.md

---

## 🏃 SPRINT 3 — Routines + Polish (Semana 3)

> **Objetivo:** 7 Claude Routines funcionando + refinamento  
> **Meta:** Todos os 7 routines rodam automaticamente sem erro

### TASK-051 a TASK-075: [Routines Implementation]

(Por brevidade, resumindo: Claude API integration, Vercel Cron, 7 routines, testing, LGPD compliance, final polish, production deployment)

---

## 🎯 Próxima Tarefa

> **TASK-001** — Setup Monorepo

Complexidade: 🟢 Baixa | Sprint: 1

**Por que começar aqui:** Todas as outras tasks dependem de estrutura base.

⚠️ **Abra uma janela limpa no Claude Code para executar TASK-001.**

**Carregue como contexto:**
- CLAUDE.md
- docs/SPEC.md
- docs/CONSTITUTION.md
- docs/PLAN.md (este arquivo)

---

**Última atualização:** 2026-05-01  
**Status:** 🟢 Pronto para começar  
**Próximo passo:** `/claude-execute TASK-001`
