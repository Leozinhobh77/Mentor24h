# ✅ TASK-044 — PUT /api/messages/:id/crisis-response [COMPLETO]

**Task:** PUT `/api/messages/:id/crisis-response` (admin)  
**Bloco:** BLOCO 5 — API Routes  
**Complexidade:** 🟢 Baixa  
**Status:** ✅ PRONTO PARA USAR  

---

## 🎯 Objetivo

Endpoint para atualizar status de resposta de crise:
- RBAC (role-based access control): apenas admin
- Marcar crisis_response_sent = true/false
- Registrar em auditoria
- Error handling: 403 forbidden, 404 not found

---

## 📦 Arquivo

### src/app/api/messages/[id]/route.ts (100 linhas)

**Requisição:**
```bash
PUT /api/messages/msg-123/crisis-response
Content-Type: application/json

{
  "crisis_response_sent": true,
  "response_type": "template",
  "escalated_to": null
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "messageId": "msg-123",
  "updated": {
    "crisis_response_sent": true,
    "response_type": "template"
  },
  "duration": 87
}
```

**Erros:**
- 403: Forbidden (não é admin)
- 404: Message not found
- 400: Invalid payload

---

## ✅ DoD

- [x] Endpoint PUT /api/messages/:id/crisis-response
- [x] RBAC: role check (admin only)
- [x] Zod validation para payload
- [x] Update no DB (mock)
- [x] Log auditoria (mock)
- [x] Error handling (403/404/400)
- [x] Performance tracking

---

**Status:** ✅ CONCLUÍDA  
**Próximo:** TASK-045 (GET /api/crises/stats)

---
