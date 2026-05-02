# 🏛️ ARCHITECTURE — Decisões Técnicas Documentadas

**Projeto:** Mentor24h  
**Versão:** 1.0  
**Data:** 2026-05-01  
**Baseado em:** SPEC v1.0

---

## Visão Geral

Mentor24h é um ecossistema de bem-estar construído com a premissa de **confiabilidade máxima** (especialmente em detecção de crise) + **baixo custo** (modelo 90% script + 10% IA).

A arquitetura segue 3 princípios invioláveis:

1. **Determinístico primeiro** — Pattern matching (regex, keywords) é sempre a solução principal. IA é complementar.
2. **Escalável mas simples** — Serverless onde possível (Vercel, Inngest, Supabase managed).
3. **LGPD compliant desde o dia 1** — Dados sensíveis (saúde mental) exigem proteção máxima.

---

## Stack Justificada

### Frontend: Next.js 15 + React 19

**Por quê:** SSR (Server-Side Rendering) melhora SEO do Dashboard + First Contentful Paint (FCP).  
**Alternativas consideradas:**
- Vue/Nuxt: mais leve, mas menor ecossistema
- Svelte: mais rápido, mas comunidade menor

**Decisão:** Next.js. Razão: Vercel integration nativa (deploy em 30s), App Router moderno, middleware support para auth.

---

### State Management: Zustand 4.x

**Por quê:** 2KB de bundle, interface simples com hooks.  
**Alternativas consideradas:**
- Redux: powerful, but 40KB boilerplate heavy
- Recoil: experimentalista da Meta, comunidade instável
- Jotai: similar ao Zustand, mas menos documentação

**Decisão:** Zustand. Razão: minimalista, performance, um arquivo <200 linhas covers 90% de state centralizado (user, selectedAssistant, uiSettings).

---

### UI Components: Shadcn/ui

**Por quê:** Tailwind-based, copiar-colar fácil, customizável.  
**Alternativas consideradas:**
- Material-UI: powerful, mas pesado (50+KB)
- Chakra UI: acessível, mas 30KB
- Headless UI: mais baixo nível, require CSS manual

**Decisão:** Shadcn/ui. Razão: componentes vêm como código (não node_modules), posso customizar sem conflict, custo de bundle é do Tailwind apenas.

---

### Database: Supabase (PostgreSQL Managed)

**Por quê:**
- RLS (Row-Level Security) nativo — cada usuário só vê seus dados (LEI #11)
- Backup automático + PITR (Point-In-Time Recovery)
- Auth integrado (JWT, OAuth, email/password)
- Realtime subscriptions (futuro para notificações em tempo real)
- LGPD compliant (hospedado em servers da AWS com compliance)

**Alternativas consideradas:**
- Firebase: mais simples, mas vendor lock-in + caro em larga escala
- PlanetScale (MySQL): rápido, mas sem RLS nativo
- Render PostgreSQL: managed, mas sem RLS

**Decisão:** Supabase. Razão: RLS é CRÍTICO para saúde mental de usuários (privacy garantida por lei, não por "boa conduta").

---

### ORM: Drizzle ORM 0.x

**Por quê:** Type-safe em tempo de compilação, sem boilerplate, bundle pequeno (~50KB vs Prisma ~150KB).  
**Alternativas consideradas:**
- Prisma: mais popular, mas bundle pesado + geração de código
- TypeORM: completo, mas complexo para projeto pequeno
- Raw queries: rápido, mas sem type safety

**Decisão:** Drizzle. Razão: controle fino sobre queries + tipos automaticamente derivados do schema (DRY).

---

### Message Queue: Inngest

**Por quê:**
- Retry automático (se Twilio falhar temporariamente, tenta denovo)
- Durável (se backend cair, jobs continuam fila)
- Serverless-native (sem servidor extra para gerenciar)
- Vercel integration (uma CLI de setup)

**Alternativas consideradas:**
- Bull (Redis-based): rápido, mas requer Redis server
- Temporal: poderoso, mas overkill para 7 routines
- AWS SQS: serverless, mas manual SDK

**Decisão:** Inngest. Razão: managed + free tier covers MVP (10k invocations/mês).

---

### Scheduler: Vercel Cron

**Por quê:** Integrado ao Next.js, sem server extra, suporta 7 rotinas (resumo semanal, análise padrões, etc).

**Alternativas consideradas:**
- node-cron (em-process): app crashes = cron stops
- AWS EventBridge: poderoso, mas 10k requests/mês = caro rápido
- EasyCron: simplista, mas manual

**Decisão:** Vercel Cron. Razão: serverless, 60 invocações/dia free tier, scale automático.

---

### WhatsApp: Twilio

**Por quê:** Confiável, suporte 24/7, trial $15 grátis (~15 dias uso).  
**Alternativas consideradas:**
- Z-API: R$ 99.99/mês fixo (mais caro se baixo volume)
- Meta Official API: setup complexo, requer empresa verificada
- Baileys (WhatsApp Web): violates ToS, instável

**Decisão:** Twilio. Razão: $0.005/mensagem = R$ 30-35/mês para 100 msgs/dia (realista para MVP).

---

### Deploy

**Frontend (Vercel):** Zero-config Next.js deployment. Domínio automático, SSL, CDN global.

**Backend (Railway/Heroku):** Node.js app com Supabase connection pooling. Railway é mais rápido (deploy em 30s), Heroku mais maduro.

---

## Fluxos de Dados Críticos

### Fluxo 1: Mensagem WhatsApp → Processamento

```
User (WhatsApp) 
  → Twilio webhook (/api/whatsapp/webhook POST) 
  → Inngest enqueue(processMessage, {phone, body}) 
  → Backend processa:
    ├─ Parse keywords (RegEx)
    ├─ Score severidade (JSON keywords + IF logic)
    ├─ Detecção crise (score >= 8 = crisis)
    └─ Salva em DB (Supabase, RLS)
  → Response via Twilio
  → Log em severidade crítica (audit trail)
```

**Garantias:**
- Determinístico (nunca IA pura — LEI #12)
- Auditável (todos os steps em database)
- Recuperável (Inngest retry automático)

---

### Fluxo 2: Routine Semanal

```
Vercel Cron (toda segunda-feira 8:00 AM UTC) 
  → Inngest enqueue(weeklyRoutine) 
  → Para CADA usuário que opted-in:
    ├─ Aggregar messages (past 7 days)
    ├─ Claude API (resumo + padrões — 10% IA)
    ├─ Formatar resposta
    └─ Enviar via Twilio
  → Log sucesso em database
```

**Garantias:**
- Escalável (Inngest processa em paralelo)
- Tolerância a falhas (se um usuário falhar, próxima continua)
- Auditável (todos os resultados em database)

---

## Índices Críticos

```sql
-- messages (tabel mais consultada)
CREATE INDEX idx_messages_user_created 
  ON messages(user_id, created_at DESC);

CREATE INDEX idx_messages_severity 
  ON messages(user_id, severity DESC) 
  WHERE severity >= 8;  -- Crisis filter

CREATE INDEX idx_messages_crisis_detected 
  ON messages(crisis_detected, created_at DESC);
```

**Motivo:** Queries mais comuns: "histórico de um usuário" + "crises de um usuário" + "todas as crises no sistema (admin)".

---

## Decisões de Trade-off

| Decisão | Trade-off | Rationale |
|---------|-----------|-----------|
| Sem E2E Tests (só Unit + Integration) | E2E seria 2h/semana manutenção | MVP rápido; E2E comes in v1.5 |
| Sem GraphQL (só REST) | REST é mais chatty, mas GraphQL é learning curve | REST é stateless, fácil cachear com Vercel |
| Sem Websockets (polling no MVP) | ~2s latência em notificações | Vercel Cron + Inngest são sufficient para 7 routines |

---

## Migrações Futuras

| Atual | Migração | Trigger | Why |
|-------|----------|---------|-----|
| Vercel Cron | Temporal.io | Se >50k routines/dia | Distributed scheduling precisa |
| Inngest | Kafka | Se >1M msgs/dia | Streaming analytics |
| Supabase | Postgres + custom infra | Se margens caem <60% | Full control |

---

## Referências Rápidas

- Stack decisions: consulte SPEC.md seções #3-7
- Database schema: DATABASE.md
- API design: API.md
- Crisis detection algorithm: SPEC.md seção "Detecção de Crise (90% Script)"
