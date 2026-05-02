# ◎ PLAN — Sprint 3: Refinement & Production

**Projeto:** Mentor24h  
**Versão:** 3.0 (Sprint 3)  
**Data:** 2026-05-02  
**Status:** 🔄 PRONTO PARA EXECUÇÃO  
**Baseado em:** Sprint 2 ✅ completo + SPEC v1.0 + Constitution v1.0  

---

## 📊 Sprint 3 — Visão Geral

| Métrica | Valor |
|---------|-------|
| **Objetivo** | Transformar mock MVP em produção real: BD real, auth, Twilio real, Claude API, observabilidade |
| **Meta** | Sistema 100% funcional, deployado em Vercel + Railway, pronto para beta users |
| **Tasks** | 35 (TASK-056 a TASK-090) |
| **Blocos** | 7 (Auth, DB Real, Twilio Real, Claude IA, Observability, Deploy, Beta Testing) |
| **Complexidade Média** | 🟠 (18 Média, 12 Baixa, 5 Alta) |
| **Esforço estimado** | 40-45 horas |
| **Timebox** | 5-6 semanas (full-time Leonardo) |

---

## 🔀 BLOCOS & MAPA DE DEPENDÊNCIAS

```
BLOCO 1: Authentication (5 tasks — 2h)
  TASK-056 (Auth setup) → TASK-057 (Login) → TASK-058 (Signup) → TASK-059 (Password) → TASK-060 (Sessions)
  
BLOCO 2: Database Real (5 tasks — 2h)
  TASK-061 (Supabase setup) → TASK-062 (Migrations) → TASK-063 (Seeds) → TASK-064 (RLS verify) → TASK-065 (Backups)
  
BLOCO 3: Twilio Real (5 tasks — 2h30)
  TASK-066 (Keys setup) → TASK-067 (Phone verify) → TASK-068 (Webhook live) → TASK-069 (Error handling) → TASK-070 (Monitoring)
  
BLOCO 4: Claude IA (10% Seletivo) (5 tasks — 3h)
  TASK-071 (API key) → TASK-072 (Weekly summary) → TASK-073 (Pattern analysis) → TASK-074 (Recommendations) → TASK-075 (Fallback)
  
BLOCO 5: Observability (5 tasks — 2h)
  TASK-076 (Sentry setup) → TASK-077 (Logging) → TASK-078 (Metrics) → TASK-079 (Alerting) → TASK-080 (Dashboards)
  
BLOCO 6: Deploy & Performance (5 tasks — 2h30)
  TASK-081 (Vercel deploy) → TASK-082 (Railway setup) → TASK-083 (CDN) → TASK-084 (Performance tuning) → TASK-085 (SSL/Security)
  
BLOCO 7: Beta Testing & Polish (5 tasks — 3h)
  TASK-086 (E2E smoke tests) → TASK-087 (Load testing) → TASK-088 (Security audit) → TASK-089 (Bug fixes) → TASK-090 (Release notes)
```

---

## 🔴 CAMINHO CRÍTICO (Não pode atrasar!)

```
TASK-056 (Auth setup) — 20 min
  ↓
TASK-061 (Supabase setup) — 30 min
  ↓
TASK-062 (Migrations) — 30 min
  ↓
TASK-066 (Twilio keys) — 15 min
  ↓
TASK-068 (Webhook live) — 45 min
  ↓
TASK-081 (Vercel deploy) — 30 min
  ↓
TASK-086 (E2E smoke tests) — 45 min
```

**Total caminho crítico: ~3h35min**

---

## 📝 TASKS RESUMIDAS

### BLOCO 1: AUTHENTICATION (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **056** | 🟡 Média | Supabase Auth setup (email/password) | Config ativa, sign-up endpoint |
| **057** | 🟢 Baixa | Login page `/auth/login` | Form, validação, erro handling |
| **058** | 🟢 Baixa | Signup page `/auth/signup` | Form, password strength, LGPD consent |
| **059** | 🟢 Baixa | Password reset `/auth/reset` | Email link, token validate, novo password |
| **060** | 🟢 Baixa | Session management | Middleware, ProtectedRoute, logout |

### BLOCO 2: DATABASE REAL (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **061** | 🟡 Média | Supabase project setup | Project criado, connection string |
| **062** | 🟡 Média | Migrations: users, messages, categories, etc | Migration roda, sem erros |
| **063** | 🟢 Baixa | Seeds: categories, assistants, audios | Todos inserts funcionam |
| **064** | 🟡 Média | RLS policies testes | Queries respeitam RLS, sem leaks |
| **065** | 🟢 Baixa | Backup strategy | Diário automático, recovery testado |

### BLOCO 3: TWILIO REAL (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **066** | 🟢 Baixa | Chaves Twilio (account SID, auth token) | Keys em .env.local |
| **067** | 🟡 Média | Phone verification | User phone valida, WhatsApp habilitado |
| **068** | 🟡 Média | Webhook live test | POST com real phone retorna 200 |
| **069** | 🟡 Média | Error handling (rate limits, fails) | Retry logic funciona |
| **070** | 🟢 Baixa | Monitoring (Twilio logs) | SID rastreado, problemas alertados |

### BLOCO 4: CLAUDE IA (10% Seletivo) (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **071** | 🟢 Baixa | Claude API key setup | Key em env, modelo v1 configurado |
| **072** | 🟡 Média | Weekly summary rotina | Inngest job monday 08h, envia resumo |
| **073** | 🟡 Média | Pattern analysis routine | Detecta padrões nos 7 dias |
| **074** | 🟡 Média | Recommendations | Sugere próximas ações |
| **075** | 🟢 Baixa | Fallback (sem IA) | Se API falhar, continua com templates |

### BLOCO 5: OBSERVABILITY (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **076** | 🟢 Baixa | Sentry setup | Erros capturam automático |
| **077** | 🟡 Média | Logging estruturado | Winston logger, logs em arquivo |
| **078** | 🟡 Média | Métricas (Prometheus) | Latência, errors, throughput |
| **079** | 🟢 Baixa | Alerting (PagerDuty) | Erro crítico → notificação |
| **080** | 🟢 Baixa | Dashboard (Grafana) | Visualizar métricas tempo real |

### BLOCO 6: DEPLOY & PERFORMANCE (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **081** | 🟡 Média | Vercel deploy (frontend) | Next.js build, deploy automático |
| **082** | 🟡 Média | Railway setup (backend) | Node.js app running, env vars |
| **083** | 🟡 Média | CDN (Vercel/Cloudflare) | Assets servem via CDN, cache 24h |
| **084** | 🟡 Média | Performance tuning | Bundle < 200KB, P95 < 200ms |
| **085** | 🟢 Baixa | SSL/Security headers | HTTPS ativo, CSP headers |

### BLOCO 7: BETA TESTING & POLISH (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **086** | 🟡 Média | E2E smoke tests | 10 cenários críticos passam |
| **087** | 🟡 Média | Load testing (k6) | 1000 RPS suporta < 2s latency |
| **088** | 🟡 Média | Security audit | OWASP top 10 coberto |
| **089** | 🟡 Média | Bug fixes | Critical/high bugs zerados |
| **090** | 🟢 Baixa | Release notes | Changelog estruturado, versioning |

---

## ⚡ TASKS PARALELIZÁVEIS

| Blocos | Podem Rodar Juntas? | Motivo |
|--------|-------------------|--------|
| 056-060 (Auth) | ✅ Sim | Independentes, mesmo time frontend |
| 061-065 (DB) | ✅ Sim | Migrations paralelas |
| 066-070 (Twilio) | ✅ Parcialmente | 066-067 antes, 068-070 depois |
| 071-075 (IA) | ✅ Sim | Rotinas independentes |
| 076-080 (Observability) | ✅ Sim | Integrations paralelas |
| 081-085 (Deploy) | ✅ Parcialmente | 081 antes, 082-085 depois |
| 086-090 (Testing) | ✅ Sim | Testes paralelos |

---

## 📌 PRÓXIMA AÇÃO

### **TASK-056** — Supabase Auth Setup
🟡 **CRÍTICA** — Bloqueia TASK-057-060

**Estimativa:** 20 minutos

---

**Versão:** 3.0 (Sprint 3)  
**Data:** 2026-05-02  
**Status:** ✅ PRONTO PARA EXECUÇÃO
