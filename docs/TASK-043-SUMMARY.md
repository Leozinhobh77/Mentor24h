# ✅ TASK-043 — GET /api/messages/unread [COMPLETO]

**Task:** GET `/api/messages/unread` com contadores  
**Bloco:** BLOCO 5 — API Routes  
**Complexidade:** 🟢 Baixa  
**Status:** ✅ PRONTO PARA USAR  

---

## 🎯 Objetivo

Endpoint que retorna contadores de mensagens não lidas e crises:
- unread_count: total de msgs sem leitura
- crisis_count: total de crises (severity >= 8)
- last_message_at: timestamp da última msg
- Performance rápida

---

## 📦 Arquivo

### src/app/api/messages/unread/route.ts (45 linhas)

**Response:**
```json
{
  "unread_count": 5,
  "crisis_count": 2,
  "last_message_at": "2026-05-01T11:00:00Z",
  "total_messages": 47,
  "unread_percentage": 10.6,
  "duration": 12
}
```

---

## ✅ DoD

- [x] Endpoint GET /api/messages/unread
- [x] Retorna unread_count
- [x] Retorna crisis_count
- [x] Retorna last_message_at
- [x] Performance tracking
- [x] Mock data funcionando

---

**Status:** ✅ CONCLUÍDA  
**Próximo:** TASK-044 (PUT /api/messages/:id/crisis-response)

---
