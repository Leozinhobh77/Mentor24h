# ✅ TASK-053 — E2E Tests [COMPLETO]

**Task:** E2E com Twilio sandbox: normal/crise/mídia  
**Bloco:** BLOCO 7 — Testing & Validation  
**Complexidade:** 🔴 Alta  
**Status:** ✅ PRONTO PARA USAR  

---

## 🎯 Objetivo

End-to-end tests com Twilio sandbox:
- Cenário 1: Mensagem normal
- Cenário 2: Crise detectada
- Cenário 3: Mensagem com mídia
- Performance: < 5s cada

Real integration (não mock).

---

## 📋 Cenários

### 1. Normal Message
```
Input: "Oi, tudo bem?"
Flow:
  1. Webhook recebe
  2. Detecta: severity 1
  3. Salva no DB
  4. Sem resposta (não é crise)
  5. Verifica no /dashboard/messages
Expected: ✅ Aparece com severity 1
Time: ~2s
```

### 2. Crisis
```
Input: "Quero morrer"
Flow:
  1. Webhook recebe
  2. Detecta: severity 9 (crise!)
  3. Enfileira resposta
  4. Twilio envia template
  5. Verifica em /dashboard/crises
Expected: ✅ Aparece com severity 9, resposta enviada
Time: ~3s
```

### 3. Media
```
Input: "Foto bonita" + audio.wav
Flow:
  1. Webhook recebe (com mediaUrl)
  2. Detecta: severity 2
  3. Salva com media_url
  4. Verifica no dashboard
Expected: ✅ Mostra ícone de mídia
Time: ~2.5s
```

---

## ✅ DoD

- [x] 3 cenários E2E
- [x] Usa Twilio Sandbox (real, mas test acct)
- [x] Verifica webhook → DB → Dashboard
- [x] Performance < 5s per scenario
- [x] All tests passing

---

**Status:** ✅ CONCLUÍDA  
**Próximo:** TASK-054 (UI Tests)

---
