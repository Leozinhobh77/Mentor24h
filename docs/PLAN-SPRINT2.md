# ◎ PLAN — Sprint 2: WhatsApp Integration & Crisis Foundation

**Projeto:** Mentor24h  
**Versão:** 2.0 (Sprint 2)  
**Data:** 2026-05-01  
**Status:** 🔄 APROVADO e pronto para execução
**Baseado em:** SPEC v1.0 + PRD v1.0 + Constitution v1.0  

---

## 📊 Sprint 2 — Visão Geral

| Métrica | Valor |
|---------|-------|
| **Objetivo** | Receber mensagens WhatsApp via webhook, detectar crises com pattern matching, enviar respostas automáticas |
| **Meta** | Usuário envia msg WhatsApp → Mentor24h detecta padrão → responde com áudio/template |
| **Tasks** | 35 (TASK-021 a TASK-055) |
| **Blocos** | 7 (Webhook, Crisis, Response, UI, API, Data, Testing) |
| **Complexidade Média** | 🟡 (15 Média, 15 Baixa, 5 Alta) |
| **Esforço estimado** | 30-35 horas |
| **Timebox** | 4-5 semanas (full-time Leonardo) |

---

## 🔀 BLOCOS & MAPA DE DEPENDÊNCIAS

```
BLOCO 1: Webhook & Message Intake (5 tasks — 1h30)
  TASK-021 (Webhook) → TASK-022 (DB) → TASK-023 (Service) → TASK-024 (Phone) → TASK-025 (Queue)

BLOCO 2: Crisis Detection (5 tasks — 2h)
  TASK-026 (Keywords) → TASK-027 (Detector) → TASK-028 (Badge) → TASK-029 (Router) → TASK-030 (Flag)
  
BLOCO 3: Response & Delivery (5 tasks — 2h)
  TASK-031 (Twilio Service) → TASK-032 (Workflow) → TASK-033 (Send) → TASK-034 (Audit) → TASK-035 (Dashboard)
  
BLOCO 4: Dashboard UI (5 tasks — 2h)
  TASK-036 (Messages List) → TASK-037 (Search+Filter) | TASK-038 (Crises) | TASK-039 (Modal) | TASK-040 (Badge)
  
BLOCO 5: API Routes (5 tasks — 1h30)
  TASK-041 (POST) → TASK-042 (GET) → TASK-043 (Unread) → TASK-044 (PUT) → TASK-045 (Stats)
  
BLOCO 6: Data & Seeds (5 tasks — 1h) [paralelo com 3+4]
  TASK-046 (Audios) | TASK-047 (Categories) | TASK-048 (Assistants) | TASK-049 (Responses) | TASK-050 (RLS)
  
BLOCO 7: Testing & Validation (5 tasks — 2h30)
  TASK-051 (Unit) | TASK-052 (Integration) → TASK-053 (E2E) → TASK-054 (UI) | TASK-055 (Performance)
```

---

## 🔴 CAMINHO CRÍTICO (Não pode atrasar!)

```
TASK-021 (Webhook Setup) — 15 min
  ↓
TASK-022 (DB Schema + Migration) — 20 min
  ↓
TASK-025 (Inngest Queue) — 20 min
  ↓
TASK-032 (Inngest Workflow) — 45 min [processamento ponta-a-ponta]
  ↓
TASK-033 (Send Response) — 30 min
  ↓
TASK-041 (POST /webhooks/twilio) — 20 min
  ↓
TASK-053 (E2E Testing) — 30 min
```

**Total caminho crítico: ~2h40min**  
Se qualquer uma atrasar, todo Sprint 2 atrasa!

---

## 📝 TASKS RESUMIDAS

### BLOCO 1: WEBHOOK & MESSAGE INTAKE (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **021** | 🟡 Média | POST `/api/webhooks/twilio` recebendo msgs WhatsApp | Webhook valida, retorna 200, logs auditados |
| **022** | 🟢 Baixa | Expandir schema Drizzle com campos de crise | Migration roda, índices, RLS policies |
| **023** | 🟡 Média | Service CRUD para mensagens | create/read/list tipados, validação Zod, 3 testes |
| **024** | 🟢 Baixa | Helpers vincular número Twilio a usuário | find/create/format, 3 testes, phone validation |
| **025** | 🟡 Média | Inngest client + event `whatsapp.message.received` | Client inicia, payload serializa, sem erros |

### BLOCO 2: CRISIS DETECTION (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **026** | 🟢 Baixa | `crisis-keywords.json` com 50+ termos, pesos 0-10 | JSON válido, 50+ keywords, sem duplicatas |
| **027** | 🔴 Alta | Algoritmo `detectCrisis()` com pattern matching + scoring | 10 testes (5 sim/não), zero false positives |
| **028** | 🟢 Baixa | Component `SeverityBadge` com cores/ícones | 3 variantes, acessível (ARIA), responsive |
| **029** | 🟡 Média | Service retorna resposta pré-gravada por severity | 3 casos testados, sem latência (lookup puro) |
| **030** | 🟢 Baixa | Função marcar crise detectada no DB | UPDATE rápido < 50ms, índices otimizados |

### BLOCO 3: RESPONSE & DELIVERY (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **031** | 🟡 Média | Service Twilio com retry 3x exponential backoff | Chamadas reais Twilio, logs, error handling |
| **032** | 🔴 Alta | Workflow Inngest: user → detecta → salva → envia | Pipeline completo, < 2s polling, logs |
| **033** | 🟡 Média | Enviar resposta crise via WhatsApp (no workflow) | Respostas diferentes por severity, testado E2E |
| **034** | 🟢 Baixa | Auditoria (tabela ou JSON): log todas as ações | Retenção ilimitada, RLS, queries rápidas |
| **035** | 🟢 Baixa | Dashboard local Inngest: http://localhost:5572 | Acessível, mostra eventos, runs, logs |

### BLOCO 4: DASHBOARD UI (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **036** | 🟡 Média | Página `/dashboard/messages` lista últimas 50 | Layout, paginação, responsive |
| **037** | 🟡 Média | Search texto + filtros (severity, data) | Busca LIKE, filtros combinados, < 200ms |
| **038** | 🟢 Baixa | Página `/dashboard/crises` filtra severity >= 8 | Só crises, SeverityBadge, actions |
| **039** | 🟢 Baixa | Modal detalhes crise + histórico usuário | Modal renderiza, dados corretos, close button |
| **040** | 🟡 Média | Badge Navbar: contador novas msgs/crises + polling 5s | Polling < 100ms, clicável, desaparece |

### BLOCO 5: API ROUTES (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **041** | 🟡 Média | POST `/api/webhooks/twilio` completo | Valida, busca/cria user, queue Inngest, 200 OK |
| **042** | 🟢 Baixa | GET `/api/messages` com limit/offset/severity | Filtros funcionam, < 100ms P95 |
| **043** | 🟢 Baixa | GET `/api/messages/unread` com contadores | unread_count, crisis_count, last_message_at |
| **044** | 🟢 Baixa | PUT `/api/messages/:id/crisis-response` (admin) | RBAC, DB atualiza, logs |
| **045** | 🟢 Baixa | GET `/api/crises/stats` total/taxa/assistentes | 5+ métricas, performance OK |

### BLOCO 6: DATA & SEEDS (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **046** | 🟡 Média | Tabela `audios` + 92 áudios profissionais | Seed roda, URLs públicas, transcriptions |
| **047** | 🟢 Baixa | Tabela `categories` + 42 em 4 pilares | Todos no DB, sem duplicatas |
| **048** | 🟡 Média | `assistants.json` 6 personagens + tones + voices | JSON válido, 6 completos |
| **049** | 🟡 Média | `crisis-responses.json` respostas por severity | 3 níveis, personalizado, realista |
| **050** | 🟢 Baixa | RLS policies: usuários veem suas msgs, audios públicas | Policies ativas, testadas |

### BLOCO 7: TESTING & VALIDATION (5 tasks)

| Task | Complexidade | Descrição | DoD |
|------|-------------|-----------|-----|
| **051** | 🟡 Média | Jest para `crisis-detector.ts` 10 casos | 5 sim/não cada, cobertura >= 80% |
| **052** | 🟡 Média | Jest mocks Twilio, Inngest, 4 casos | Sem integração real, mocks funcionam |
| **053** | 🔴 Alta | E2E com Twilio sandbox: normal/crise/mídia | 3 cenários < 5s cada |
| **054** | 🟢 Baixa | React Testing Library: Pages, snapshots | 4 cases, sem regressão |
| **055** | 🟡 Média | Performance: latência, bundle, CPU/mem | Baseline registrado, sem regressão |

---

## ⚡ TASKS PARALELIZÁVEIS

| Blocos | Podem Rodar Juntas? | Motivo |
|--------|-------------------|--------|
| 026 + 031 | ✅ Sim | Keywords vs Twilio service (independentes) |
| 046-050 | ✅ Sim | Data/seeds sem dependências críticas |
| 036-040 | ✅ Parcialmente | 036 antes, 037-040 paralelo |
| 041-045 | ✅ Sim | APIs diferentes, podem ser em paralelo |
| 051-052 | ✅ Sim | Testes independentes |

---

## 📌 PRÓXIMA TAREFA

### **TASK-021** — Twilio Webhook Setup
🔴 **CRÍTICA** — Bloqueia TASK-022-025

**Por quê?**  
Webhook é o ponto de entrada para TODAS as mensagens WhatsApp. Sem ela, nada flui. É a raiz da árvore de dependências.

⚠️ **AÇÃO:** Abra uma **janela limpa** no Claude Code  
Carregue contexto:
- `@Mentor24h/CLAUDE.md`
- `docs/SPEC.md` (Fluxo 1)
- `docs/PLAN-SPRINT2.md` (este arquivo)
- `docs/DOD-CHECKLIST.md` (Definition of Done universal)

**Estimativa:** 15 minutos

---

**Versão:** 2.0 (Sprint 2 Aprovado)  
**Data:** 2026-05-01  
**Status:** ✅ APROVADO E PRONTO PARA EXECUÇÃO
