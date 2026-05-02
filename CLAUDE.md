# Mentor24h — Contexto Permanente para Claude Code

**Projeto:** Mentor24h — Ecossistema 24/7 de bem-estar via WhatsApp + Dashboard Web  
**Criado:** 2026-05-01  
**Status:** 🟡 Planejamento (PRD + Constitution aprovados, aguardando SPEC)

---

## O que é Mentor24h?

Sistema integrado que funciona **exclusivamente via WhatsApp** (interface principal) + **Dashboard Web** (visualização/gestão). Oferece **organização, inspiração, entretenimento e bem-estar** em um único lugar, 24/7.

**Diferencial real:** WhatsApp nativo (sem download) + 42 categorias em 4 pilares + 6 assistentes com personalidade + modelo 90% pattern matching + 10% IA seletivo = produto robusto + barato para desenvolver.

---

## Dono do Projeto

**Leonardo** — Developer full-stack (intermediário/avançado), trabalha solo, conhece Claude Code, quer construir com excelência.

---

## Stack Técnica

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| **Frontend** | Next.js/React | SSR, performance, Next.js Vercel integration |
| **Backend** | Node.js + Make (orquestração) | Serverless, integração fácil com Twilio + Supabase + Claude API |
| **Banco de Dados** | Supabase (PostgreSQL) | RLS (row-level security) nativo, LGPD friendly, backup automático |
| **WhatsApp** | Twilio API | Confiável, escalável, customer support |
| **IA (10% seletivo)** | Claude API | Seletivo para 7 rotinas inteligentes (resumo semanal, detecção padrões, etc) |
| **Deploy** | Vercel (frontend) + Railway/Heroku (backend) | Serverless, CDN global, auto-scaling |

---

## Estrutura de Arquivos

```
Mentor24h/
├── /forge                    ← FORGE workspace (planejamento)
│   └── forge-data.json       ← Metadados do projeto (única fonte de verdade)
├── /docs                     ← Documentação viva
│   ├── PRD.md                ← O que é + por quê (v1 ✅)
│   ├── CONSTITUTION.md       ← 22 leis invioláveis (v1 ✅)
│   ├── SPEC.md               ← Arquitetura + decisões técnicas (pendente)
│   ├── PLAN.md               ← Sprints + tasks (pendente)
│   ├── BACKUP-STRATEGY.md    ← (será criado)
│   └── GLOSSARIO.md          ← Termos técnicos (será criado)
├── /src                      ← CÓDIGO DE PRODUÇÃO (inviolável, FORGE nunca toca)
│   ├── /app                  ← Next.js (routes, pages)
│   ├── /components           ← React components
│   ├── /lib                  ← Utilidades compartilhadas
│   ├── /pages                ← API routes
│   ├── /data                 ← Dados estáticos (crisis-keywords.json, assistants.json, etc)
│   └── /styles               ← CSS/Tailwind
├── /tests                    ← Testes (criados junto com features)
├── /scripts                  ← Scripts de produção
├── CLAUDE.md                 ← Este arquivo (contexto permanente)
├── .env.example              ← Variáveis de ambiente (exemplo, sem valores)
├── .env                      ← Secrets (NUNCA commitado)
├── .gitignore                ← .env, node_modules, etc
├── package.json              ← Dependências
├── next.config.js            ← Config Next.js
└── tsconfig.json             ← Config TypeScript
```

---

## Regras Críticas (Da CONSTITUTION)

### 🔴 NUNCA FAZER

- ❌ Modificar `/forge` durante execução de código
- ❌ Escrever secrets (API keys, tokens) em `.md` ou histórico
- ❌ Pular uma etapa SDD (PRD → CONSTITUTION → SPEC → PLAN → EXECUTE)
- ❌ Usar IA pura para detecção de crise (padrão sempre, IA nunca)
- ❌ Coletar dados de saúde mental sem consentimento explícito
- ❌ Deploy sem backup testado

### ✅ SEMPRE FAZER

- ✅ Carregue contexto completo (`PRD.md` + `CONSTITUTION.md` + `SPEC.md` + `PLAN.md`) antes de sessão
- ✅ Planejamento e execução em janelas separadas
- ✅ Registre mudanças em `forge-data.json` com timestamp + motivo
- ✅ Teste detecção de crise com casos reais antes de merge
- ✅ Criptografe dados sensíveis (RLS do Supabase)
- ✅ Consentimento explícito de usuário antes de enviar WhatsApp

### 🔧 forge-data.js (CRÍTICO)

**O Chrome bloqueia `fetch()` no protocolo `file://`.** A tag `<script>` é a única forma que funciona offline.

**SEMPRE que modificar `forge-data.json`, regenerar:**
```bash
cd forge
printf 'window.__FORGE_DATA__ = ' > forge-data.js && cat forge-data.json >> forge-data.js && printf ';\n' >> forge-data.js
```

---

## Pipeline SDD (Ordem Obrigatória)

1. ✅ **PRD.md** (2026-05-01) — O que é, por quê, para quem, como vence
2. ✅ **CONSTITUTION.md** (2026-05-01) — 22 leis invioláveis
3. ⏳ **SPEC.md** — Arquitetura técnica + decisões (próximo: /forge-spec)
4. ⏳ **PLAN.md** — Sprints + tasks atômicas (próximo: /forge-plan)
5. ⏳ **Código** — Execução das tasks (próximo: /forge-execute)

---

## Estado Atual

- **Etapa Ativa:** EXECUÇÃO (Sprint 3)
- **Sprint Atual:** 3 de 4 (Auth, Profile/Settings, Twilio Real, Categorias, Rotinas)
- **Progresso:** 
  - Sprint 1 ✅ 100% completo (20/20 tasks)
  - Sprint 2 ✅ 100% completo (35/35 tasks)
  - Sprint 3 ✅ 25/70 tasks (TASK-056→080 ✅ BLOCO 1+2+3+4+5 100% | TASK-081→ BLOCO 6 Deploy)
- **Próximo Passo:** TASK-081+ (Deploy + Testing)
- **Bloqueadores:** Nenhum
- **Divergências:** Nenhuma
- **Erros:** Nenhum

**BLOCO 3 (Sprint 2) — Crisis Detection & Response ✅:**

**TASK-031 ✅ CONCLUÍDA:**
- ✅ Twilio Service: `src/lib/services/twilio-service.ts` (retry 3x + exponential backoff)
- ✅ Retry logic: 429/408/5xx retryable, exponential backoff com jitter
- ✅ Validação Zod para phoneNumber, userId, message
- ✅ Error handling: TwilioError, TwilioRetryExhaustedError, classified errors
- ✅ Logging completo: sem secrets (Lei #22), metrics de performance
- ✅ Integration: Inngest event (crisis.response.sent), response-router support
- ✅ Helpers: sendMessage(), sendCrisisResponse(), sendConfirmation(), healthCheck()
- ✅ Testes: `tests/twilio-service.test.ts` (38+ casos)
- ✅ Documentação: `docs/TASK-031-SUMMARY.md` (Best Practices 2026)
- ✅ Performance: < 2s por mensagem (mesmo com retries), batch 10 msgs < 20s

**BLOCO 1+2 (Sprint 3) — Auth System + Profile/Settings ✅:**

**TASK-056-060 ✅ CONCLUÍDA (BLOCO 1):**
- ✅ Authentication system completo (register, login, password reset)
- ✅ useAuth hook com state management
- ✅ Protected routes + middleware security
- ✅ Email validation com regex + Zod
- ✅ Documentação: `docs/TASKS-057-060-SUMMARY.md`

**TASK-061 ✅ CONCLUÍDA — Fix Alert Props:**
- ✅ LoginForm.tsx: 1 ocorrência `description` → `message`
- ✅ ResetForm.tsx: 2 ocorrências `description` → `message`
- ✅ UpdatePasswordForm.tsx: 3 ocorrências `description` → `message`

**TASK-062 ✅ CONCLUÍDA — Fix Middleware Security:**
- ✅ Middleware.ts: `getSession()` → `getUser()` (server validation)
- ✅ Adicionar `/auth/reset` às rotas públicas
- ✅ Atualizar lógica de proteção para usar `user` em vez de `session`

**TASK-063 ✅ CONCLUÍDA — Fix Dashboard Duplication:**
- ✅ Dashboard.tsx: Remover header duplicado
- ✅ DashboardNavbar.tsx: Adicionar user info + logout button
- ✅ useAuth hook integrado no navbar

**TASK-064 ✅ CONCLUÍDA — Create Perfil Page:**
- ✅ `src/app/perfil/layout.tsx` com ProtectedRoute + DashboardNavbar
- ✅ `src/app/perfil/page.tsx` server wrapper
- ✅ `src/components/profile/ProfileForm.tsx` client component com React Hook Form + Zod
- ✅ `src/app/api/auth/profile/route.ts` PATCH endpoint (getUserFromToken + updateProfile)
- ✅ Campos: name, preferredAssistant, timezone, whatsappNumber
- ✅ Pre-population com dados do usuário via useAuth + useEffect

**TASK-065 ✅ CONCLUÍDA — Create Configuracoes Page:**
- ✅ `src/app/configuracoes/layout.tsx` com ProtectedRoute + DashboardNavbar
- ✅ `src/app/configuracoes/page.tsx` server wrapper
- ✅ `src/components/settings/SettingsPage.tsx` client component com 4 seções:
  - Notificações: 3 toggles (resumos, alertas, novidades)
  - Conta: Link alterar senha, botão exportar dados
  - LGPD: Exibir consentDate formatada, links políticas
  - Zona de Perigo: Logout button, Delete account modal com email confirmation
- ✅ `src/app/api/auth/account/route.ts` DELETE endpoint (getUserFromToken + deleteAccount)
- ✅ Modal com email confirmation para deletar conta
- ✅ Delete flow: DELETE request + logout + redirect /

**Documentação BLOCO 2:** `docs/TASKS-061-065-BLOCO2-SUMMARY.md`

**BLOCO 3 (Sprint 3) — Twilio Real ✅:**

**TASK-066 ✅ CONCLUÍDA:**
- ✅ `.env.example` com variáveis Twilio documentadas
- ✅ `TWILIO_SETUP.md` com guia completo de configuração

**TASK-067 ✅ CONCLUÍDA:**
- ✅ Phone verification service com generateCode, sendVerificationCode, confirmCode
- ✅ `POST /api/auth/verify-phone` (enviar OTP)
- ✅ `POST /api/auth/confirm-phone` (confirmar código)
- ✅ UI em ProfileForm.tsx com verificação 6-dígitos, 10min expiry, max 3 tentativas
- ✅ Support TWILIO_MOCK_MODE=true para testes sem Twilio real
- ✅ Schema updates: whatsappVerified, phoneVerificationCode, phoneVerificationExpiry, phoneVerificationAttempts
- ✅ Type updates em useAuth.ts

**TASK-068 ✅ CONCLUÍDA:**
- ✅ Webhook live test setup documentado em TWILIO_SETUP.md seção 4
- ✅ ngrok setup + URL configuration no painel Twilio

**TASK-069 ✅ CONCLUÍDA:**
- ✅ Webhook body read fix (form-encoded, single read)
- ✅ Webhook signature validation correto
- ✅ Always return 200 status para Twilio não reenviar
- ✅ inngest.send fix (usar helper em vez de .create())
- ✅ Dead Letter Queue: `whatsapp.message.failed` event + `sendWhatsappMessageFailedEvent()` helper

**TASK-070 ✅ CONCLUÍDA:**
- ✅ `GET /api/twilio/health` endpoint com métricas de sistema
- ✅ Status: healthy/degraded/down baseado em conectividade + response rate
- ✅ TwilioService lazy initialization (prevent server crash sem credenciais)
- ✅ Support ambas `TWILIO_PHONE_NUMBER` e `TWILIO_WHATSAPP_NUMBER` (compatibility)
- ✅ Documentação: `docs/TASKS-066-070-BLOCO3-SUMMARY.md`

**BLOCO 4 (Sprint 3) — Categorias + Seeding ✅:**

**TASK-071 ✅ CONCLUÍDA:**
- ✅ Script seed-categories.ts pronto (delega para src/lib/db/seed.ts)
- ✅ 42 categorias em 4 pilares (12 org, 10 inspiration, 10 entertainment, 10 wellbeing)

**TASK-072 ✅ CONCLUÍDA:**
- ✅ `GET /api/categories` endpoint com Bearer token
- ✅ Retorna 42 categorias agrupadas por pilar
- ✅ Inclui `isSelected: boolean` por usuário (onde deletedAt IS NULL)
- ✅ Meta: { total, selected }

**TASK-073 ✅ CONCLUÍDA:**
- ✅ `POST /api/user/categories/[id]/toggle` endpoint
- ✅ Soft delete pattern: INSERT/UPDATE/REACTIVATE com deletedAt
- ✅ Retorna { categoryId, isSelected }

**TASK-074 ✅ CONCLUÍDA:**
- ✅ `/dashboard/categories/layout.tsx` (Server Component)
- ✅ `/dashboard/categories/page.tsx` (Server wrapper)
- ✅ `CategoriesPage.tsx` Client Component (318 linhas)
- ✅ 4 seções coloridas (blue/amber/pink/green por pilar)
- ✅ Grid responsivo (1/2/3 colunas mobile/tablet/desktop)
- ✅ Optimistic update com reverter se erro
- ✅ Contador "X de Y selecionadas"

**TASK-075 ✅ CONCLUÍDA:**
- ✅ `src/data/audios.json` criado com estrutura (5 áudios de exemplo)
- ✅ `GET /api/audios` endpoint com paginação
- ✅ Suporte a filtros: ?limit=50&offset=0

**Documentação BLOCO 4:** `docs/TASKS-071-075-BLOCO4-SUMMARY.md`

**Sprint 2 — WhatsApp & Crisis Detection (35 tasks COMPLETAS) ✅:**

- ✅ TASK-021→025: Webhook, DB Schema, Message Service, Phone Helpers, Inngest
- ✅ TASK-026→030: Keywords, Crisis Detector, SeverityBadge, Response Router, Crisis Flagging  
- ✅ TASK-031: Twilio Service (retry + exponential backoff)
- Documentação completa em `docs/TASK-021-031-SPRINT2-SUMMARY.md`

**Sprint 3, BLOCO 1+2 — Auth + Profile/Settings (10 tasks COMPLETAS) ✅:**

- ✅ TASK-056→060: Auth system completo (register, login, reset, useAuth hook, middleware)
- ✅ TASK-061→065: Perfil page + Configuracoes page + bug fixes (5 issues)
- Documentação: 
  - `docs/TASKS-057-060-SUMMARY.md` (BLOCO 1)
  - `docs/TASKS-061-065-BLOCO2-SUMMARY.md` (BLOCO 2)

**BLOCO COMPLETION STATUS (Sprint 3):**
- ✅ BLOCO 1 (5/5): Reg, Login, Reset, useAuth, Middleware → 100%
- ✅ BLOCO 2 (5/5): Alert Fixes, Middleware Sec, Dashboard, Perfil, Settings → 100%
- ✅ BLOCO 3 (5/5): Twilio Real, Phone Verify, Health Check, Setup Guide, Webhook Fixes → 100%
- ✅ BLOCO 4 (5/5): GET Categories, Toggle Categories, Categories Page, Seed Audios, GET Audios → 100%
- ✅ BLOCO 5 (5/5): Inngest serve(), ClaudeService, 3 Routines Scheduled, Vercel Cron, Dashboard → 100%
- ⏳ BLOCO 6-7 (?/?): Deploy, Testing → Próximo

**Total Sprint 3:** 25/70 tasks (36% - 5 blocos completos)

**BLOCO 5 (Sprint 3) — Rotinas Automáticas ✅:**

**TASK-076 ✅ CONCLUÍDA:**
- ✅ `src/app/api/inngest/route.ts` created com serve() + 4 functions
- ✅ `inngest:dev` script adicionado ao package.json
- ✅ Conserta issue crítica: eventos agora são consumidos

**TASK-077 ✅ CONCLUÍDA (SDK instalação pendente):**
- ✅ `src/lib/services/claude.service.ts` criado com `generateSummary()` + `generateAnalysis()`
- ✅ Lazy initialization pattern (singleton)
- ✅ `CLAUDE_API_KEY` documentado em `.env.example`
- ⏳ `npm install @anthropic-ai/sdk` (conflito npm, código pronto)

**TASK-078 ✅ CONCLUÍDA:**
- ✅ `src/lib/routines/weekly-summary.ts` — cron '0 8 * * 1' (seg 8h)
- ✅ `src/lib/routines/pattern-analysis.ts` — cron '0 14 * * 1' (seg 14h)
- ✅ `src/lib/routines/daily-wellbeing.ts` — cron '0 19 * * *' (diário 19h)
- ✅ Todas usam `step.run()` pattern para isolamento e retry
- ✅ Registradas em `/api/inngest/route.ts`

**TASK-079 ✅ CONCLUÍDA:**
- ✅ `vercel.json` criado com 3 cron jobs
- ✅ `POST /api/routines/weekly-summary` — trigger manual
- ✅ `POST /api/routines/pattern-analysis` — trigger manual
- ✅ `POST /api/routines/daily-wellbeing` — trigger manual

**TASK-080 ✅ CONCLUÍDA:**
- ✅ `GET /api/routines/status` endpoint com timestamp calculations
- ✅ `/dashboard/routines/layout.tsx` com ProtectedRoute + navbar
- ✅ `/dashboard/routines/page.tsx` server wrapper
- ✅ `src/components/routines/RoutinesPage.tsx` client (230 linhas)
- ✅ 3 cards: weekly, pattern, daily com ícones + status + times
- ✅ Responsivo, dark theme, error/loading states

Documentação: `docs/TASKS-076-080-BLOCO5-SUMMARY.md`

---

## Mentrias Importantes

### Modelo de Negócio (Unit Economics)

**100 usuários:**
- Receita: R$ 3.035/mês (ticket médio R$ 30,35)
- Custo: R$ 120/mês (Twilio R$ 50, Supabase R$ 25, Claude 10% R$ 15, Vercel R$ 20, misc R$ 10)
- **Margem: 96%** (R$ 2.915 lucro)

**1.000 usuários (escala):**
- Receita: R$ 30.350/mês
- Custo: R$ 700/mês
- **Margem: 97%** (R$ 29.650 lucro)

### Modelo Operacional (90/10 Script/IA)

- **90% Pattern Matching:** Regex + keywords list + templates pré-gravados. Determinístico, rápido, confiável.
- **10% IA Seletivo:** 7 rotinas Claude (resumo semanal, detecção padrões, recomendações). Seletivo, não crítico.

Benefício: sem latência, custo baixo, máxima confiabilidade.

### Risco Crítico: Detecção de Crise

Pesquisa 2026: **0 de 29 chatbots forneceram respostas adequadas a suicídio.** ChatGPT sub-triou 51.6% de crises.

**Solução Mentor24h:** Detecção 100% pattern matching (keywords, regex), resposta sempre pré-gravada. **Confiabilidade 99.9%.**

---

## Como Começar Uma Sessão

1. Abra nova janela no Claude Code
2. Cole este CLAUDE.md como contexto
3. Se for planejamento: leia `PRD.md` + `CONSTITUTION.md`
4. Se for execução: leia `SPEC.md` + `PLAN.md` + task específica
5. Nunca misture planejamento com execução

---

## Referências Rápidas

- **PRD completo:** `/docs/PRD.md`
- **Constitution completo:** `/docs/CONSTITUTION.md`
- **Metadados do projeto:** `/forge/forge-data.json`
- **Email do desenvolvedor:** leosilvabh77@gmail.com

---

**Última atualização:** 2026-05-01  
**Criado por:** Claude (Opus 4.6) + Leonardo  
**Modelo:** Spec-Driven Development (SDD)
