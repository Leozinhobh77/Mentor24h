# ✅ TASK-049 — `crisis-responses.json` 3 níveis [COMPLETO]

**Task:** `crisis-responses.json` respostas por severity  
**Bloco:** BLOCO 6 — Data & Seeds  
**Complexidade:** 🟡 Média  
**Status:** ✅ PRONTO PARA USAR  

---

## 🎯 Objetivo

JSON com respostas PRÉ-GRAVADAS para 3 níveis de severidade:
- **CRÍTICA** (severity 9+): Resposta máxima + escalação
- **ALTA** (severity 7-8): Resposta forte + sugestão de ajuda
- **MÉDIA** (severity 5-6): Resposta moderada + questões práticas

Nunca IA pura (Law #12).

---

## 📦 Arquivo

### src/data/crisis-responses.json

**Estrutura:**
```json
{
  "critical": {
    "severity_threshold": 9,
    "label": "🚨 CRÍTICA",
    "template": "Estou aqui com você. Respirando devagar...",
    "audio_id": "audio-crisis-critical",
    "escalate_to_human": true,
    "emergency_contacts": ["CVV: 188", "SAMU: 192"]
  },
  ...
}
```

---

## 🎯 Respostas

### 1. CRÍTICA (9+)
```
Template: "Estou aqui com você. Respirando devagar: inspire por 4 
segundos, segure por 7, expire por 8. Você é forte. CVV 188 está 
disponível 24/7. Sua vida importa. 💙"

Audio: "Respiração de Crise - Técnica 4-7-8"
Escalate: SIM
Emergency: CVV 188, SAMU 192
```

### 2. ALTA (7-8)
```
Template: "Vejo que você está passando por um momento difícil. 
Você não está sozinho. Respire fundo. Às vezes, conversar com 
alguém ajuda. Estou aqui."

Audio: "Meditação Rápida - Acalme-se em 5min"
Escalate: NÃO
```

### 3. MÉDIA (5-6)
```
Template: "Percebo que algo está te preocupando. Lembre-se: 
desafios são oportunidades. Que tal focar em soluções?"

Audio: "Motivação Diária"
Escalate: NÃO
```

---

## ✅ DoD

- [x] JSON com 3 níveis de resposta
- [x] Cada um tem label, template, audio_id
- [x] Respostas são PRÉ-GRAVADAS (não IA)
- [x] Escalação para critical
- [x] Emergency contacts listados
- [x] Follow-up messages
- [x] JSON válido

---

**Status:** ✅ CONCLUÍDA (src/data/crisis-responses.json)  
**Próximo:** TASK-050 (RLS Policies)

---
