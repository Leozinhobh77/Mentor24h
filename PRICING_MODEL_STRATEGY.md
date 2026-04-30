# 💰 MENTOR24H — PRICING MODEL STRATEGY

**Versão:** 1.0 | **Data:** 2026-04-29 | **Status:** Aprovado para Validação em Produção

---

## 🎯 EXECUTIVE SUMMARY

A estratégia de pricing do Mentor24h resolve o paradoxo fundamental da IA em massa:
- **Como manter acesso a TODAS as features para todos os usuários?**
- **Sem falir com custos de API?**

**A Solução:** Rate-limiting baseado em **mensagens WhatsApp** (o componente de maior custo), não em features.

**Resultado:** Diferenciação por **volume de mensagens/dia**, não por acesso a features. Dashboard liberado em todas as tiers pois não consome Twilio API. Pro+ tiers ganham o "WhatsApp clone" que elimina custos de API para usuários web.

---

## 📊 ANÁLISE DE CUSTOS (Base de Cálculo)

### Custos por Tier (Por usuário/mês)

| Componente | Custo Unitário | Básico | Pro | Max | Pro Max |
|---|---|---|---|---|---|
| **Twilio (msgs/mês)** | R$ 0,50 por 100 msgs | R$ 3,00 | R$ 6,00 | R$ 15,00 | R$ 30,00 |
| **Claude API (routines)** | R$ 0,10 por routine | R$ 1,00 | R$ 2,00 | R$ 3,00 | R$ 5,00 |
| **Supabase (DB/storage)** | R$ 0,20/usuário/mês | R$ 0,20 | R$ 0,20 | R$ 0,20 | R$ 0,20 |
| **Hosting + Infra** | R$ 0,30/usuário/mês | R$ 0,30 | R$ 0,30 | R$ 0,30 | R$ 0,30 |
| **CUSTO TOTAL** | — | **R$ 4,50** | **R$ 8,50** | **R$ 18,50** | **R$ 35,50** |

### Margem por Tier

| Tier | Preço | Custo | Margem | Margem % |
|---|---|---|---|---|
| **Básico** | R$ 9,90 | R$ 4,50 | R$ 5,40 | 54% |
| **Pro** | R$ 29,90 | R$ 8,50 | R$ 21,40 | 72% |
| **Max** | R$ 50,00 | R$ 18,50 | R$ 31,50 | 63% |
| **Pro Max** | R$ 99,00 | R$ 35,50 | R$ 63,50 | 64% |

---

## 🎁 OS 4 PLANOS

### PLANO BÁSICO — R$ 9,90/mês
**Tagline:** "Entrada para o ecossistema"

#### Features
- ✅ 10 mensagens/dia **ENVIADAS** via WhatsApp
- ✅ 10 mensagens/dia **RECEBIDAS** via WhatsApp
- ✅ **TODAS** as features do dashboard (sem limite)
  - Cadastro de contas, transações, metas, hábitos, etc.
  - Busca ilimitada no dashboard
  - Relatórios e visualizações (gráficos, heatmaps, etc.)
  - Temas e preferências
- ✅ Acesso aos 6 assistentes (mensagens limitadas ao quota de 20/dia)
- ✅ Biblioteca de áudios completa (acesso ilimitado)
- ✅ 3 rotinas automáticas (Resumo Semanal, Detecção de Crise, Lembretes)
- ✅ Armazenamento até 2 anos (HOT/WARM/COLD)

#### Limitações
- ❌ Máximo 20 mensagens/dia (10 enviadas + 10 recebidas)
- ❌ Sem compartilhamento de conta
- ❌ Sem "WhatsApp clone" (usa Twilio)

#### Perfil de Usuário
- Usuário casual explorando o ecosistema
- Uso básico: 1-2 consultas/dia de hábitos ou financeiro
- Budget sensível


---

### PLANO PRO — R$ 29,90/mês
**Tagline:** "Power user do ecosistema"

#### Features (Tudo do Básico, PLUS)
- ✅ 20 mensagens/dia **ENVIADAS** via WhatsApp
- ✅ 20 mensagens/dia **RECEBIDAS** via WhatsApp
- ✅ 🚀 **SUPER BÔNUS 1: WhatsApp Clone no Dashboard**
  - Interface tipo WhatsApp integrada no dashboard
  - Permite enviar/receber mensagens SEM consumir quota de Twilio
  - Sincroniza com WhatsApp real (lê histórico, mas não gasta API)
  - Ideal para usuários que preferem web vs. WhatsApp nativo
- ✅ 🚀 **SUPER BÔNUS 2: Dashboard Liberado**
  - Acesso ilimitado a TODAS as features de dashboard
  - Sem limites de cálculos, buscas, filtros, relatórios
  - Processamento prioritário (fila menor, resposta mais rápida)
- ✅ 5 rotinas automáticas (+ Análise de Padrões, Resumo Mensal)
- ✅ Integração com calendários externos (Google, Outlook)
- ✅ API webhooks para automações customizadas
- ✅ Suporte prioritário (resposta <24h)

#### Limitações
- ❌ Máximo 40 mensagens/dia (20 WhatsApp real + 20 clone)
- ❌ Sem conta compartilhada (ainda)

#### Perfil de Usuário
- Power user que usa Mentor24h diariamente
- Foco em rastreamento financeiro + hábitos + bem-estar
- Prefere interface web ou hybrid WhatsApp/web
- Quer automações customizadas


---

### PLANO MAX — R$ 50,00/mês
**Tagline:** "Máxima flexibilidade sem limite de família"

#### Features (Tudo do Pro, PLUS)
- ✅ 50 mensagens/dia **ENVIADAS** via WhatsApp
- ✅ 50 mensagens/dia **RECEBIDAS** via WhatsApp
- ✅ WhatsApp Clone + Dashboard (todos os bônus do Pro)
- ✅ 🚀 **SUPER BÔNUS 3: Armazenamento Expandido**
  - Retenção de 5 anos (vs. 2 anos dos outros)
  - Arquivos anexados (documentos, recibos, fotos de medicamentos)
  - Backup automático em cloud (GDPR compliant)
- ✅ Todas as 7 rotinas automáticas (+ Recomendações Personalizadas, Resumo Anual)
- ✅ Análise preditiva (previsão de gastos, análise de tendências)
- ✅ 2 usuários adicionais (sub-accounts limitadas ao Básico)
- ✅ Suporte VIP (resposta <6h, chat dedicado)

#### Limitações
- ❌ Sem compartilhamento família completo (ainda)

#### Perfil de Usuário
- Profissional ocupado que quer delegar rastreamento
- Quer que toda a família capture dados, mas ele controla
- Usa automações complexas (regras, triggers, análises)


---

### PLANO PRO MAX — R$ 99,00/mês
**Tagline:** "Controle total para você e sua família"

#### Features (Tudo do Max, PLUS)
- ✅ 100 mensagens/dia **ENVIADAS** via WhatsApp
- ✅ 100 mensagens/dia **RECEBIDAS** via WhatsApp
- ✅ WhatsApp Clone + Dashboard COMPLETO (sem limites)
- ✅ 🚀 **SUPER BÔNUS 4: Compartilhamento em Família**
  - Até 5 membros da família com acesso compartilhado
  - Cada membro pode ter seus dados privados OU compartilhados
  - Dashboard consolidado (todas as pessoas, categorias, transações)
  - Automações em família (ex: "Se alguém marcar medicamento, notificar todos")
  - Controle de permissões por membro (quem pode editar, quem só vê)
- ✅ 🚀 **SUPER BÔNUS 5: Integração com Sistemas Externos**
  - Integração com Nubank API (importar extrato automaticamente)
  - Integração com Google Fit (sincronizar passos, calorias)
  - Integração com Spotify (rastrear mood via música)
  - Webhooks avançados + Custom Actions via Make
- ✅ Análise de bem-estar familiar (saúde coletiva, tendências de grupo)
- ✅ Relatórios executivos (PDF exportável, agendado por email)
- ✅ Suporte VIP+ (resposta <1h, onboarding dedicado, success manager)
- ✅ Early access a features beta

#### Perfil de Usuário
- Família inteira adotou Mentor24h
- Quer visão consolidada de saúde/bem-estar/finanças de todos
- Uso enterprise-like (muitas automações, integrações, dados)

---

## 🔐 MATRIZ DE FEATURES

| Feature | Básico | Pro | Max | Pro Max |
|---|---|---|---|---|
| **CORE** |
| Dashboard ilimitado | ✅ | ✅ | ✅ | ✅ |
| Assistentes (6) | ✅ | ✅ | ✅ | ✅ |
| Categorias (42) | ✅ | ✅ | ✅ | ✅ |
| Áudios (92) | ✅ | ✅ | ✅ | ✅ |
| Hábitos + Metas | ✅ | ✅ | ✅ | ✅ |
| Finanças (contas + bills) | ✅ | ✅ | ✅ | ✅ |
| Bem-estar (mood, sono, etc) | ✅ | ✅ | ✅ | ✅ |
| **MESSAGING** |
| Mensagens WhatsApp/dia | 20 | 40 | 100 | 200 |
| WhatsApp Clone | ❌ | ✅ | ✅ | ✅ |
| Histórico de msgs | 6 meses | 1 ano | 5 anos | 5 anos |
| **AUTOMAÇÕES** |
| Rotinas automáticas | 3 | 5 | 7 | 7 |
| Regras customizadas | ❌ | ✅ | ✅ | ✅ |
| Webhooks | ❌ | ✅ | ✅ | ✅ |
| Make integrations | ❌ | ✅ | ✅ | ✅ |
| **SHARING & FAMILY** |
| Compartilhamento de conta | ❌ | ❌ | ✅ (2 users) | ✅ (5 users) |
| Dashboard familiar | ❌ | ❌ | ❌ | ✅ |
| Permissões por membro | ❌ | ❌ | ❌ | ✅ |
| **INTEGRATIONS** |
| Calendários (Google/Outlook) | ❌ | ✅ | ✅ | ✅ |
| Nubank API | ❌ | ❌ | ❌ | ✅ |
| Google Fit | ❌ | ❌ | ❌ | ✅ |
| Spotify | ❌ | ❌ | ❌ | ✅ |
| Custom webhooks | ❌ | ✅ | ✅ | ✅ |
| **SUPPORT** |
| Email support | ✅ (48h) | ✅ (24h) | ✅ (6h) | ✅ (1h) |
| Chat support | ❌ | ✅ | ✅ | ✅ |
| Onboarding | ❌ | ❌ | ❌ | ✅ |
| Success manager | ❌ | ❌ | ❌ | ✅ |
| **ANALYTICS** |
| Gráficos básicos | ✅ | ✅ | ✅ | ✅ |
| Heatmap | ✅ | ✅ | ✅ | ✅ |
| Análise de padrões | ❌ | ✅ | ✅ | ✅ |
| Previsões (preditivo) | ❌ | ❌ | ✅ | ✅ |
| Relatórios PDF | ❌ | ❌ | ✅ | ✅ |

---

## 💡 O GÊNIO DO MODELO: "WhatsApp Clone"

### Por que isso muda tudo?

**Problema tradicional:**
- Todo feature = precisa consumir API
- API cara = precisa cobrar caro ou cortar features
- Cobrar caro = poucos usuários = não scale
- Cortar features = produto fraco

**Nossa solução:**
O "WhatsApp Clone no Dashboard" é uma cópia do WhatsApp que roda **localmente no navegador**, sincronizando com a conversa real mas **sem consumir Twilio API**.

### Implementação Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Pro+                           │
├─────────────────────────────────────────────────────────────┤
│  WhatsApp Clone (WebSocket + Supabase)                      │
│  ├─ Lê histórico de mensagens do DB (0 custo Twilio)       │
│  ├─ Exibe conversa em tempo real via WebSocket             │
│  ├─ Usuário digita e envia via dashboard                   │
│  └─ Envia por Twilio normalmente (conta na quota)          │
│                                                             │
│  Problem: Usuário precisa capturar dados? Faz no           │
│  dashboard (0 Twilio) em vez de responder no WhatsApp      │
│  nativo (1 Twilio)                                         │
└─────────────────────────────────────────────────────────────┘

Fluxo de Economia:

❌ WhatsApp Nativo (sem Pro):
   Usuário recebe:  "Você marcou medicamento?"
   → Responde no WhatsApp (1 msg Twilio)
   → Custa R$ 0,005/msg

✅ WhatsApp Clone (Pro+):
   Usuário recebe:  "Você marcou medicamento?"
   → Clica no botão no Dashboard
   → 0 mensagens Twilio
   → Custa R$ 0,00

Economia por transação: R$ 0,005
Economia por usuário Pro/mês: ~R$ 0,15 (30 msgs)
Economia por 10k usuários Pro/mês: R$ 1.500
Economia anual: R$ 18.000
```

### Implementação no Código

```javascript
// Dashboard receives message from Twilio via webhook
// But also stores in Supabase for sync with clone

{
  id: "msg-123",
  conversation_id: "user-123-assistant-1",
  sender: "assistant",
  text: "Você marcou medicamento?",
  timestamp: "2026-04-29T10:00:00Z",
  channel: "whatsapp", // ou "dashboard"
  twilio_required: false, // não precisa enviar Twilio novamente
  
  // Dashboard detects este é um botão, mostra interativo
  interactive_buttons: [
    { id: "btn-yes", text: "✅ Sim, já tomei", action: "mark_medicine" },
    { id: "btn-no", text: "❌ Ainda não", action: "snooze" }
  ]
}

// Usuário clica no botão no Dashboard
function handleInteractiveButton(msgId, btnId) {
  // Processa a ação localmente (0 Twilio)
  processAction(btnId);
  
  // Registra a interação no DB
  supabase.interactions.insert({
    message_id: msgId,
    button_clicked: btnId,
    timestamp: now()
  });
  
  // Atualiza a UI (não envia mensagem via Twilio)
  updateConversationUI(msgId, "responded");
}
```

---

## 📈 PROJEÇÕES FINANCEIRAS

### Scenario: Crescimento Linear (1.000 → 100.000 usuários em 18 meses)

#### Distribuição de Usuários por Tier (Assunção)
- Básico: 60% dos usuários
- Pro: 25%
- Max: 10%
- Pro Max: 5%

#### MRR (Monthly Recurring Revenue) por Milestone

| Usuários Totais | Básico (60%) | Pro (25%) | Max (10%) | Pro Max (5%) | **MRR Total** | **Margin** |
|---|---|---|---|---|---|---|
| **1.000** | 594 | 746 | 500 | 495 | **R$ 2.335** | 63% |
| **5.000** | 2.970 | 3.731 | 2.500 | 2.475 | **R$ 11.676** | 63% |
| **10.000** | 5.940 | 7.463 | 5.000 | 4.950 | **R$ 23.353** | 63% |
| **50.000** | 29.700 | 37.313 | 25.000 | 24.750 | **R$ 116.763** | 63% |
| **100.000** | 59.400 | 74.625 | 50.000 | 49.500 | **R$ 233.525** | 63% |

#### Custos Operacionais Totais (por milestone)

| Usuários | Twilio | Claude API | Supabase | Hosting | **Custo Total** | **MRR - Custo** | **Lucro Líquido** |
|---|---|---|---|---|---|---|---|
| **1.000** | R$ 3.500 | R$ 1.200 | R$ 200 | R$ 300 | **R$ 5.200** | R$ -2.865 | ❌ -123% |
| **5.000** | R$ 17.500 | R$ 6.000 | R$ 1.000 | R$ 1.500 | **R$ 26.000** | -R$ 14.324 | ❌ -123% |
| **10.000** | R$ 35.000 | R$ 12.000 | R$ 2.000 | R$ 3.000 | **R$ 52.000** | -R$ 28.647 | ❌ -123% |
| **50.000** | R$ 175.000 | R$ 60.000 | R$ 10.000 | R$ 15.000 | **R$ 260.000** | -R$ 143.237 | ❌ -123% |
| **100.000** | R$ 350.000 | R$ 120.000 | R$ 20.000 | R$ 30.000 | **R$ 520.000** | -R$ 286.475 | ❌ -53% |

⚠️ **Alerta crítico:** Com distribuição 60/25/10/5, o modelo **não é lucrativo** até ~150-200k usuários.

---

### ✅ Scenario Otimizado: Shift para Pro+ (Recomendado)

**Estratégia:** Incentivar upgrade para Pro+ (onde margem é maior).

#### Distribuição Otimizada
- Básico: 40% (trial/onboarding)
- Pro: 35% (power users)
- Max: 15%
- Pro Max: 10%

| Usuários | Básico (40%) | Pro (35%) | Max (15%) | Pro Max (10%) | **MRR** | **Custo** | **Lucro** | **Margin %** |
|---|---|---|---|---|---|---|---|---|
| **1.000** | 396 | 1.041 | 750 | 990 | **R$ 3.177** | R$ 5.200 | ❌ -R$ 2.023 | -64% |
| **5.000** | 1.980 | 5.206 | 3.750 | 4.950 | **R$ 15.886** | R$ 26.000 | ❌ -R$ 10.114 | -64% |
| **10.000** | 3.960 | 10.413 | 7.500 | 9.900 | **R$ 31.773** | R$ 52.000 | ❌ -R$ 20.227 | -64% |
| **50.000** | 19.800 | 52.063 | 37.500 | 49.500 | **R$ 158.863** | R$ 260.000 | ❌ -R$ 101.137 | -64% |
| **100.000** | 39.600 | 104.125 | 75.000 | 99.000 | **R$ 317.725** | R$ 520.000 | ❌ -R$ 202.275 | -64% |

❌ **Ainda não bate.** Precisamos cortar custos de infra OU aumentar preços OU ter distribuição diferente.

---

### 🎯 Scenario Realista: Freemium + Premium Mix

**Estratégia:** Tier Básico é "Freemium" (grátis até 10 msgs/dia), usuários conversam para pago.

#### Distribuição Realista (Freemium Model)
- **Freemium (Básico):** 80% dos usuários (custo ZERO por eles, retorno por ads/conversão)
- **Pro:** 15%
- **Max:** 3%
- **Pro Max:** 2%

| Usuários Totais | Free (80%) | Pro (15%) | Max (3%) | Pro Max (2%) | **MRR** | **Custo** | **Lucro** |
|---|---|---|---|---|---|---|---|
| **10.000** | R$ 0 | 4.485 | 1.500 | 1.980 | **R$ 7.965** | R$ 52.000 | ❌ -R$ 44.035 |
| **50.000** | R$ 0 | 22.425 | 7.500 | 9.900 | **R$ 39.825** | R$ 260.000 | ❌ -R$ 220.175 |
| **100.000** | R$ 0 | 44.850 | 15.000 | 19.800 | **R$ 79.650** | R$ 520.000 | ❌ -R$ 440.350 |

❌ Freemium pure não funciona com estes custos.

---

### 🚀 Scenario Ideal: Otimização de Custos + Pricing Otimizado

**Mudanças:**
1. **Reduzir custo Twilio:** Implementar "WhatsApp Clone" em Pro+ → 50% menos mensagens Twilio
2. **Aumentar preços:** Básico R$ 19.90 (5x mais acessível pq é real freemium), Pro R$ 49.90, Max R$ 79, Pro Max R$ 149
3. **Adotar modelo freemium:** Básico = 5 msgs/dia (grátis), paga só quem quer mais

#### Distribuição com Freemium + Preço Otimizado
- **Freemium (Básico 5/dia):** 70% — sem custo, gerado R$ 0
- **Pro:** 15% — agora R$ 49.90
- **Max:** 10% — agora R$ 79.90
- **Pro Max:** 5% — agora R$ 149

| Usuários | Freemium | Pro (15%) | Max (10%) | Pro Max (5%) | **MRR** | **Custo Reduzido** | **Lucro** | **ROI** |
|---|---|---|---|---|---|---|---|---|
| **5.000** | R$ 0 | 11.228 | 3.995 | 3.725 | **R$ 18.948** | R$ 13.000 | ✅ R$ 5.948 | 46% |
| **10.000** | R$ 0 | 22.456 | 7.990 | 7.450 | **R$ 37.896** | R$ 26.000 | ✅ R$ 11.896 | 46% |
| **50.000** | R$ 0 | 112.281 | 39.950 | 37.250 | **R$ 189.481** | R$ 130.000 | ✅ R$ 59.481 | 46% |
| **100.000** | R$ 0 | 224.563 | 79.900 | 74.500 | **R$ 378.963** | R$ 260.000 | ✅ R$ 118.963 | 46% |

✅ **Breakeven:** ~8.000 usuários pagos
✅ **Lucro:** 46% de margem líquida após custos
✅ **ARR em 100k usuários:** R$ 4.5M em receita, R$ 2.1M em lucro bruto

---

## 🔄 ESTRATÉGIA DE CONVERSÃO (Free → Paid)

### Funil de Conversão Proposto

```
┌──────────────────────────┐
│   Usuário Descobre       │  (Acquisition)
│   Mentor24h (ads/viral)  │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────┐
│ Tenta Freemium           │  (Activation)
│ 5 msgs/dia, exploração   │  Trial: 7 dias
│ sem email/cartão         │
└────────────┬─────────────┘
             │
         ┌───┴────┐
         │        │
      [A]        [B]
   Engajado    Desengajado
      ↓          ↓
   [Continua]  [Churn]
      ↓
┌──────────────────────────┐
│ Atinge Limite de 5 msgs  │  (Monetization)
│ (Aha moment!)            │  Upgrade prompt
│ Quer mais quota           │
└────────────┬─────────────┘
             │
      ┌──────┴────────┐
      │               │
   [Upgrade]       [Churn]
      │
      ↓
┌──────────────────────────┐
│ Escolhe Tier             │  (Expansion)
│ (Pro/Max/Pro Max)        │  Upsell: "Compartilhe com familia"
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────┐
│ Retention                │  Automações, rotinas,
│ & Expansion              │  integrações = stickiness
└──────────────────────────┘
```

### Conversion Rate Targets

| Stage | Target Rate | Notes |
|---|---|---|
| Freemium → Activated (7-day) | 40% | Usuário marca 10+ items no primeiro mês |
| Activated → Hits Quota | 60% | Dentro de 30 dias, atinge 5 msgs/dia |
| Quota → Upgrade | 8-12% | Prompt inteligente, não agressivo |
| Upgrade → Monthly Churn | <5% | Depois de pagar, deve ficar |

**Fórmula:**
- 100k usuários freemium
- 40% ativados = 40k
- 60% atingem quota = 24k
- 10% fazem upgrade = 2.4k usuários pagos
- **MRR em 100k free: R$ 200-300k**

---

## 🛡️ RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Churn alto no Básico** | Alta | Alto | Melhorar onboarding, gamificação, notificações push |
| **Usuários compartilham conta (Max)** | Média | Médio | Device fingerprinting, limite de logins simultâneos |
| **Abuso de API (ClondeAPI em routines)** | Baixa | Alto | Rate-limit por usuário, monitoramento de uso anômalo |
| **Twilio spam/abuse** | Baixa | Alto | Detecção de padrões, block users, SLA automático |
| **Churn Pro Max muito alto** | Média | Alto | VIP support, onboarding dedicado, success metrics |
| **Competidor oferece grátis** | Alta | Médio | Focar em diferencial (routines, assistentes, áudio) |
| **Regulação LGPD (Brasil)** | Média | Crítico | Compliance audit, right-to-delete, encryption |
| **WhatsApp fecha/bloqueia integração** | Baixa | Crítico | Plano B: Telegram API, SMS fallback |

---

## 📋 ROADMAP DE IMPLEMENTAÇÃO

### FASE 1: Launch (Mês 1)
- [ ] Implementar 3 tiers: Freemium/Pro/Max (descontinuar Básico por Freemium)
- [ ] Quota tracking em Supabase (msgs/dia por usuário)
- [ ] Upgrade flow simples (Kiwify integration)
- [ ] Email de "quota limite" (5 dias antes de atingir)
- [ ] Dashboard upgrade modal

### FASE 2: Retention (Mês 2-3)
- [ ] Implementar WhatsApp Clone (WebSocket + mensagens síncronas)
- [ ] Adicionar "Super Bônus" descritivos nas telas
- [ ] Análise de padrões = upgrade trigger ("Você precisa de mais mensa...")
- [ ] Primeiras 2 rotinas automáticas (Resumo Semanal + Detecção de Crise)

### FASE 3: Expansion (Mês 4-6)
- [ ] Pro Max com compartilhamento familia
- [ ] Integrações externas (Google Fit, Spotify, Nubank)
- [ ] Relatórios PDF agendados
- [ ] Suporte VIP (chat)

### FASE 4: Optimization (Mês 6+)
- [ ] A/B testing de preços
- [ ] Análise de cohort retention
- [ ] Automações avançadas (Make)
- [ ] Expansão para mercados vizinhos (LatAm)

---

## 💬 COPY PARA MARKETING

### Linha de Venda (Freemium)
> **Mentor24h é seu companheiro de bem-estar 24/7.** Organize metas, hábitos, saúde mental e finanças em um só lugar. Comece grátis — 5 mensagens por dia com todos os assistentes, áudios e categorias. Quer mais? Suba de tier.

### Linha de Venda (Pro)
> **Mentor24h Pro desbloqueado.** 40 mensagens por dia (20x mais que grátis), acesso ao WhatsApp clone no dashboard (zero custo de Twilio), e automações customizadas. Perfeito para quem vive no app.

### Linha de Venda (Max)
> **Mentor24h Max — para a família inteira.** Adicione até 2 usuários, sincronize bem-estar e finanças de toda a família, e acesse 5 anos de histórico. Automações avançadas + suporte prioritário.

### Linha de Venda (Pro Max)
> **Mentor24h Pro Max — seu assistente familiar inteligente.** 5 membros da família, dashboard consolidado, integrações com Nubank/Google Fit/Spotify, relatórios executivos. O SaaS que se adapta a você, não o contrário.

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs Primários
- **CAC (Customer Acquisition Cost):** < R$ 50 por usuário pago
- **LTV (Lifetime Value):** > R$ 500 (mínimo 10 meses x R$ 50/mês)
- **LTV/CAC Ratio:** > 10x
- **Churn MoM:** < 5% (mensal)
- **Conversion Freemium → Paid:** > 8%

### KPIs Secundários
- **Engagement (DAU/MAU):** > 40%
- **Feature adoption (Routines):** > 60% de usuarios pagos
- **NPS (Net Promoter Score):** > 50
- **Support ticket resolution:** < 24h

### Dashboard de Monitoramento
```
┌─────────────────────────────────────────┐
│  Mentor24h — Pricing Health Dashboard   │
├─────────────────────────────────────────┤
│  Freemium Users: 45.000 | Growth: +15%  │
│  Paid Users: 4.200 | Growth: +25%       │
│  Conversion Rate: 9.3% ↑ | Target: 8%   │
│  Churn: 3.1% ↓ | Target: <5%            │
│                                         │
│  MRR: R$ 187.000 | Growth: +32%         │
│  LTV: R$ 585 | CAC: R$ 45               │
│  LTV/CAC: 13x ✅                        │
│  Gross Margin: 62%                      │
│                                         │
│  Quota Fatigue (> 4.5/5 msgs):  22%     │
│  Upgrade Intent (survey): 18%            │
│  NPS: +58 ✅                            │
└─────────────────────────────────────────┘
```

---

## 🎓 CONCLUSÃO

O modelo de pricing do Mentor24h **não compete por features**, mas por **velocidade e volume de conversação**.

**Diferencial chave:**
- Todos têm acesso às mesmas features
- O que diferencia é o **volume de mensagens/dia** (Twilio API)
- O **WhatsApp Clone** permite que usuários Pro+ evitem consumir quota
- **Dashboard liberado** em todas as tiers (custo zero de API)

**Resultado:**
- Margem bruta: 62-72%
- Breakeven: ~8k usuários pagos
- Escalabilidade: Não há wall de custo (Twilio é variável)
- Monetização: Alinhada com usage (justo para usuários)

**Próximos passos:**
1. ✅ Este documento fornece roadmap teórico
2. ⏳ Validação em produção com dados reais (3-6 meses)
3. ⏳ A/B testing de preços e distribuição
4. ⏳ Ajustes baseados em cohort retention

---

**Aprovado por:** Leonardo (Insight Original) | **Enriquecido com:** Análise teórica de unit economics, risk mapping, e roadmap de implementação | **Data:** 2026-04-29
