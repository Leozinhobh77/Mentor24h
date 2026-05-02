# ✅ TASK-035 — Dashboard Inngest Local [COMPLETO]

**Task:** Dashboard local Inngest: http://localhost:5572  
**Bloco:** BLOCO 3 — Response & Delivery  
**Complexidade:** 🟢 Baixa  
**Status:** ✅ PRONTO PARA USAR  

---

## 🎯 Objetivo

Configurar dashboard Inngest local para monitoramento:
- Visualizar eventos em tempo real
- Ver runs do workflow (TASK-032)
- Logs detalhados de cada step
- Duração de execução
- Status (success/failure/retry)

---

## 🚀 Setup

### Instalação

```bash
npm install inngest
```

### Iniciar Dashboard

```bash
inngest dev
# Abre: http://localhost:5572
```

### Configuração .env

```bash
INNGEST_API_KEY=xxxx-xxxx-xxxx-xxxx
INNGEST_API_BASE_URL=https://inn.inngest.com
```

---

## 📊 Dashboard Features

### Eventos
- `whatsapp.message.received` — mensagens WhatsApp
- `crisis.detected` — crise detectada
- `crisis.response.sent` — resposta enviada
- `user.consent.given` — consentimento

### Workflow Runs
```
Run ID: run-123456789
Status: Completed
Duration: 1245ms
Event: whatsapp.message.received

Steps:
├─ detect-crisis ✅ 15ms
├─ save-message ✅ 20ms
├─ route-response ✅ 1ms
├─ flag-crisis ✅ 25ms
├─ send-twilio-response ✅ 1180ms
└─ emit-response-sent-event ✅ 5ms

Output: { success: true, wasCrisis: true, ... }
```

### Logs
- Console logs de cada step
- [Workflow] tags para rastreamento
- Timestamps
- Performance metrics

### Retry Information
- Attempt count
- Backoff delay
- Next retry timestamp
- Failure reason

---

## 🔍 Como Usar

### Monitorar Evento Específico

1. Acesse http://localhost:5572
2. Clique em "Events" → "whatsapp.message.received"
3. Veja lista de eventos recebidos
4. Clique em um evento para ver detalhes
5. Veja "Runs" para workflows acionados

### Debugar Workflow Falhado

1. Vá para "Runs"
2. Filter por status: "Failed"
3. Clique no run para ver qual step falhou
4. Veja logs detalhados (se disponível)
5. Verifique output/error

### Analisar Performance

1. "Runs" → filter por duração
2. Compare tempos entre steps
3. Identifique gargalos (ex: Twilio lento)
4. Optimize conforme necessário

### Reprocessar Evento

```bash
# Inngest CLI (se disponível)
inngest replay --event whatsapp.message.received --after 2026-05-01
```

---

## 📈 Monitoramento

### Métricas a Observar

```
Average Duration:     ~1100ms (crises)
Success Rate:         > 99%
Retry Rate:           < 5% (429/5xx)
Failed Runs:          0 (ideal)
Active Workflows:     1 (process-whatsapp-message)
Total Events:         Crescente com usuários
```

### Alertas Recomendados

- ❌ Fail rate > 5%
- ⏱️ Average duration > 3s
- 🔄 Retry rate > 10%
- 💥 Crashes em steps

---

## 🧪 Teste Live

### Simular Mensagem WhatsApp

```bash
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "msg-test",
    "fromNumber": "+5511999999999",
    "content": "Quero morrer",
    "mediaUrl": null
  }'
```

### Monitorar em Tempo Real

1. Terminal: `inngest dev`
2. Navegador: http://localhost:5572
3. Executar curl acima
4. Ver evento aparecer em tempo real
5. Clicar em "Runs" para ver workflow processando
6. Ver cada step executar

---

## 📋 Troubleshooting

### Dashboard não abre

```bash
# Verificar se porta 5572 está disponível
lsof -i :5572

# Se ocupada, pode usar porta diferente
inngest dev --port 5573
```

### Eventos não aparecem

- Verificar `INNGEST_API_KEY` em .env
- Verificar se workflow está registrado
- Check logs: `npm run dev` (backend)

### Runs mostram "Pending"

- Inngest pode estar processando
- Aguardar ~2-3s
- Refresh página (F5)

---

## ✅ DoD

- [x] Setup Inngest dev
- [x] Dashboard acessível em localhost:5572
- [x] Eventos visíveis
- [x] Workflow runs detalhados
- [x] Logs por step
- [x] Performance metrics
- [x] Documentação de uso

---

## 🚀 Próximas Tasks

**BLOCO 3 Completo:** ✅
- TASK-031: Twilio Service ✅
- TASK-032: Inngest Workflow ✅
- TASK-033: Response Sender ✅
- TASK-034: Audit Logger ✅
- TASK-035: Dashboard Inngest ✅

**Próximo: BLOCO 4 (Dashboard UI)**
- TASK-036: Messages List
- TASK-037: Search + Filters
- TASK-038: Crises Page
- TASK-039: Modal Detalhes
- TASK-040: Navbar Badge

---

**Status:** ✅ CONCLUÍDA  
**Data:** 2026-05-01

---
