# ✅ TASK-038 — Crises Page [COMPLETO]

**Task:** Página `/dashboard/crises` filtra severity >= 8  
**Bloco:** BLOCO 4 — Dashboard UI  
**Complexidade:** 🟢 Baixa  
**Status:** ✅ PRONTO PARA USAR  

---

## 🎯 Objetivo

Criar página dedicada `/dashboard/crises` que:
- Lista apenas mensagens com severity >= 8
- Exibe SeverityBadge component
- Oferece ações (ver detalhes, contatar usuário)
- Paginação integrada
- Design com tema crítico (red/orange)

---

## 📦 Arquivos

### src/app/dashboard/crises/page.tsx (235 linhas)
- Client component com 'use client'
- Estado: crises, loading, page, totalPages, total, duration
- Fetch: GET `/api/messages?severity=8&limit=20&offset=...`
- UI: grid responsivo, SeverityBadge, actions
- Paginação: prev/next + page numbers
- Loading state: spinner vermelho
- Empty state: ✅ "Nenhuma crise detectada" (positivo)
- Theme: red/orange gradient (urgência)

---

## 🎨 Uso

### Acessar
```
/dashboard/crises
```

### Features
- ✅ Filtro automático: severity >= 8
- ✅ Apenas crises: is_crisis = true
- ✅ Paginação: 20 por página
- ✅ Performance: herdado de GET /api/messages (< 200ms)
- ✅ Layout responsivo: 1/2/12 colunas
- ✅ SeverityBadge em cada crise
- ✅ Ações: "Ver Detalhes" + "Contatar"

---

## 📊 Design

### Header
```
🚨 Crises Detectadas
Histórico de mensagens com severidade crítica (8+)
{total} crise(s) ({duration}ms) • Página X de Y
```

### Card de Crise
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔴 [SeverityBadge]      Conteúdo da crise...                  │
│ 🚨 Severidade: 9/10     "Não aguento mais..."                  │
│                         [Mais texto truncado]                   │
│                         Usuário ID: 1 • Data/hora              │
│                                        [📋 Ver Detalhes]      │
│                                        [💬 Contatar]           │
└─────────────────────────────────────────────────────────────────┘
```

### Theme
- Background: gradient red-50 → orange-50
- Header text: text-red-900, text-red-700
- Cards: bg-red-50, border-l-red-600
- Badge: Severidade badge customizado
- Buttons: red-600, blue-600
- Empty state: green (positive - no crises)

---

## 📈 Métricas

```
Performance: < 200ms
- Reutiliza API GET /api/messages
- Apenas filtra severity >= 8
- Mock data: 2 crises de 5 msgs totais

Data Mock:
- ID 2: severity 9 (suicida)
- ID 5: severity 10 (suicida)
```

---

## ✅ DoD

- [x] Página GET /dashboard/crises existe
- [x] Componente client 'use client'
- [x] Fetch automático com severity >= 8
- [x] SeverityBadge integrado
- [x] Layout responsivo (1/2/12 colunas)
- [x] Paginação (prev/next + numbers)
- [x] Loading state (spinner)
- [x] Empty state (positivo)
- [x] Ações: "Ver Detalhes" + "Contatar"
- [x] Theme red/orange (urgência)
- [x] Performance < 200ms

---

## 🧪 Teste Manual

```bash
# 1. Navegar para /dashboard/crises
# → Mostra 2 crises (severity 9 + 10)

# 2. Verificar SeverityBadge
# → Ambos mostram badge crítica (red)

# 3. Clicar "Próxima"
# → Paginação desabilitada (< 20 por página)

# 4. Clicar "Ver Detalhes"
# → Placeholder (será modal em TASK-039)

# 5. Verificar performance
# → Duration < 200ms no header

# 6. Truncamento de texto
# → Mostra primeiros 250 chars + "..."
```

---

## 🚀 Próximas Integrações

### TASK-039: Modal Detalhes
```tsx
<button onClick={() => openModal(crisis)}>
  📋 Ver Detalhes
</button>
```

### TASK-040: Navbar Badge
```tsx
// Reutilizar GET /api/messages?crisis=true&severity=8
const crisisCount = await fetchCrisisBadge();
<NavbarBadge count={crisisCount} />
```

---

**Status:** ✅ CONCLUÍDA  
**Próximo:** TASK-039 (Modal Detalhes Crise)

---
