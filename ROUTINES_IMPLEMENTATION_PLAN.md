# 🤖 CLAUDE ROUTINES - PLANO DE IMPLEMENTAÇÃO MENTOR24H

> **Versão:** 1.0  
> **Data:** 29/04/2026  
> **Status:** Pronto para FASE 2 (Semana 4+)  
> **Autor:** Leonardo + Claude

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [As 7 Routines Essenciais](#routines-essenciais)
3. [Arquitetura Técnica](#arquitetura)
4. [Implementação Por Routine](#implementação)
5. [Integração Make + Supabase](#integração)
6. [Monitoramento e Analytics](#monitoramento)
7. [Roadmap de Rollout](#roadmap)

---

## 🎯 VISÃO GERAL

**Claude Routines** são automações recorrentes que usam IA para tomar decisões inteligentes. No Mentor24h, elas vão **além de lembretes automáticos** — vão **compreender** o usuário e oferecer insights.

### Diferença: Make vs Claude Routines

```
MAKE (já temos):
├─ Fluxos visuais
├─ "Se X acontece, faça Y"
├─ Sem inteligência
└─ Exemplo: "Se remédio venceu, envie alerta"

CLAUDE ROUTINES (vamos adicionar):
├─ Automações com IA
├─ "Analise tudo e decida o melhor"
├─ Com inteligência e contexto
└─ Exemplo: "Analise padrão, detecte crise, ofereça técnica"
```

### Quando Ativar

```
✅ Ativar na FASE 2 (Semana 4):
├─ Você já tem 10-20 beta-testers
├─ Make está funcionando bem
├─ Quer diferenciar antes de escalar

❌ NÃO ativar na FASE 1:
├─ Você só tem 2 pessoas (você + esposa)
├─ Redundante fazer IA para 2 pessoas
└─ Focus deve ser em estabilidade
```

---

## 🚀 AS 7 ROUTINES ESSENCIAIS

Prioridade de implementação (fácil → complexo):

### 1️⃣ ROUTINE: Resumo Semanal (PRIORIDADE ALTA)

**O que faz:**
- Toda segunda de manhã (ou dia customizável)
- Analisa dados da semana passada
- Gera resumo inteligente e motivacional

**Dados analisados:**
```javascript
{
  metas_atingidas: 5,
  metas_falhadas: 2,
  categoria_melhor: "financas",
  categoria_pior: "saude_mental",
  consistencia: 87,
  economia_total: 250.50,
  habitos_cumpridos: 12,
  habitos_quebrados: 1,
  streak_maior: 7
}
```

**Exemplo de saída (Sérgio - mentor sábio):**
```
📊 Resumo da Semana (23-29 Abril)

Querido Leonardo, vejo que foi uma semana de crescimento.

✨ Destaques:
• Você conquistou 5 das 7 metas — um feito notável
• Sua consistência foi 87% — disciplina que gera frutos
• Economizou R$ 250 — caminho firme para seus objetivos

⚠️ Desafios:
• A saúde mental teve pouca atenção
• Um hábito foi quebrado (academia terça)

💡 Reflexão:
O fracasso de terça é apenas a oportunidade de recomeçar. 
Você tem 87% de consistência — essa é a marca de um 
persistente, Leonardo.

🎯 Sugestão:
Próxima semana, foque em retomar academia segunda. 
Isso vai restaurar a sequência e reforçar disciplina.

Você é capaz.
```

**Custo:** ~R$ 0.003 por usuário/semana (Claude análise breve)

---

### 2️⃣ ROUTINE: Detecção de Crise (PRIORIDADE CRÍTICA)

**O que faz:**
- Monitora **continuamente** mensagens do usuário
- Detecta sinais de ansiedade, depressão, isolamento
- Oferece resposta IMEDIATA com técnica

**Palavras-chave que ativam:**

```javascript
CRISES = {
  ANSIEDADE: ['ansioso', 'ansiedade', 'nervoso', 'pânico', 'apreensivo'],
  DEPRESSÃO: ['triste', 'infeliz', 'deprimido', 'vazio', 'sem graça'],
  ISOLAMENTO: ['sozinho', 'isolado', 'ninguém entende', 'abandonado'],
  DESESPERAÇÃO: ['não aguento', 'não consigo', 'desisti', 'sem esperança'],
  SUICÍDIO: ['suicida', 'matar', 'vontade de morrer'] // RED ALERT
}
```

**Fluxo:**

```
Usuário digita: "Tô muito ansioso hoje, não consigo sair da cama"
       ↓
Routine detecta: ANSIEDADE_ALTA
       ↓
Claude gera resposta contexual via Luciana (acolhedora)
       ↓
Resposta imediata (no máximo 2s):

"Querido Leonardo, escuto você.

Você está em segurança AGORA.

Vamos respirar junto? Faça isso comigo:

1️⃣ Inspire profundo por 4 (1...2...3...4)
2️⃣ Segure por 7 (sinta seu corpo relaxando)
3️⃣ Solte lentamente por 8

Repita 4 vezes. Você consegue.

Depois, se quiser, posso enviar áudio de meditação ou 
você quer apenas conversar? Estou aqui. 💚"

[✅ Respiração] [🎙️ Áudio] [💬 Conversar]
       ↓
Salva no BD: usuario_saude_mental_alerta {
  tipo: 'ansiedade',
  severidade: 'alta',
  resposta_oferecida: 'respiracao',
  timestamp: NOW()
}
```

**Custo:** ~R$ 0.002 por detecção (mas CRÍTICO para retenção)

---

### 3️⃣ ROUTINE: Análise de Padrões (PRIORIDADE ALTA)

**O que faz:**
- Toda semana (segunda de tarde)
- Identifica padrões comportamentais
- Oferece recomendações baseadas em dados

**Exemplos de padrões:**

```
PADRÃO 1: "Você só faz academia segunda"
├─ Dado: 4 semanas, 4 terças sem academia
├─ IA detecta: Falta de consistência
└─ Recomendação: "Que tal agendar uma sessão terça 
                   para quebrar esse padrão?"

PADRÃO 2: "Seus gastos aumentam sexta"
├─ Dado: Últimas 4 sextas: R$ 150, 180, 120, 200
├─ IA detecta: Despesa social/fim de semana
└─ Recomendação: "Sexta é seu dia social. Quer limitar 
                   gastos ou é intencional?"

PADRÃO 3: "Você compra muito café na semana"
├─ Dado: 5 gastos de café em 7 dias (~R$ 50/semana)
├─ IA detecta: Hábito caro
└─ Recomendação: "Fazer café em casa economiza R$ 150/mês 
                   — café em casa vs café de rua?"

PADRÃO 4: "Seu humor piora quinta"
├─ Dado: Chat logs mostram tom mais negativo quintafeira
├─ IA detecta: Possível "mid-week slump"
└─ Recomendação: "Que tal agendar algo legal quinta 
                   pra quebrar rotina?"
```

**Formato de saída (Maria Clara - profissional):**

```
📈 Análise de Padrões (23-29 Abril)

Olá Leonardo,

Analisando seu comportamento nas últimas 4 semanas, 
encontrei alguns padrões interessantes:

🔴 PADRÃO PREOCUPANTE:
Academia só segunda - Você foi 4/4 vezes segunda, 
mas 0 vezes terça/quinta. Falta variedade.

SUGESTÃO: Agendar segunda sessão terça. Você vai 
de forma consistente — vamos ampliar?

🟡 PADRÃO FINANCEIRO:
Gastos aumentam sexta (R$ 150+ média). Você está 
sendo social (bom!), mas quer controlar?

SUGESTÃO: Estabelecer limite sexta? Ou deixar 
como seu "dia de celebrar"?

🟢 PADRÃO POSITIVO:
Você economizou R$ 250 essa semana — tendência 
consistente de poupança. Ótimo!

SUGESTÃO: Próxima meta: R$ 300/semana?

🎯 AÇÃO RECOMENDADA:
[1] Sim, quer falar sobre academia?
[2] Sim, quer limitar gastos sexta?
[3] Não, continua do jeito que tá
```

**Custo:** ~R$ 0.005 por análise (complexidade média)

---

### 4️⃣ ROUTINE: Lembretes Inteligentes (PRIORIDADE MÉDIA)

**O que faz:**
- Hoje: Make envia "Remédio 14h" (genérico)
- Com Routine: Claude personaliza baseado no humor

**Exemplo:**

```
ANTES (Make genérico):
"Lembrete: Tomar Dipirona às 14h"

DEPOIS (Claude inteligente):
Se energia_usuario = BAIXA:
  "Tá na hora do remédio, e depois 
   sugestão: 10 min de sol. 
   Vitamina D vai ajudar!"

Se energia_usuario = NORMAL:
  "Medicação às 14h! Toma água junto?"

Se energia_usuario = ALTA:
  "Seu remédio está chamando às 14h! 
   Não deixa a energia cair, combate?"
```

**Custo:** ~R$ 0.001 por lembrete (muito barato, alto impacto)

---

### 5️⃣ ROUTINE: Resumo Mensal (PRIORIDADE MÉDIA)

**O que faz:**
- Dia 1º de cada mês de manhã
- Análise completa do mês anterior
- Inspiração + dados + insights

**Estrutura:**

```
📅 SEU MÊS DE ABRIL - RESUMO COMPLETO

🎯 METAS (7 criadas, 5 atingidas = 71%)
├─ 💰 Poupança: ATINGIDA! +R$ 250
├─ 🏃 Academia: 70% (quase lá)
├─ 📚 Leitura: NÃO ATINGIDA
└─ 🧘 Meditação: ATINGIDA!

💪 HÁBITOS (máximo streak: 7 dias)
├─ Academia: 7 dias (segunda apenas ⚠️)
├─ Meditação: 15 dias! 🔥
└─ Leitura: 2 dias (retomar?)

💰 FINANCEIRO
├─ Receita: R$ X
├─ Despesa: R$ Y
├─ Economia: R$ 250 ✅
└─ Categoria gastos: [gráfico]

🧠 SAÚDE MENTAL
├─ Alertas de ansiedade: 3
├─ Respostas com técnica: 3/3
├─ Tendência: MELHORANDO

📊 SCORE DO MÊS: 7.8/10

MAIOR VITÓRIA: Consistência em meditação (15 dias!)
MAIOR DESAFIO: Academia só segunda
APRENDIZADO: Você é melhor em rotina mental do que física

🚀 PRÓXIMO MÊS COMEÇA AGORA
Recomendação: Ampliar academia para 2x/semana
```

**Custo:** ~R$ 0.010 por resumo (análise pesada)

---

### 6️⃣ ROUTINE: Resumo Anual (PRIORIDADE MÉDIA)

**O que faz:**
- 1º de janeiro
- Reflexão profunda do ano inteiro
- Motivação para novo ano

**Exemplo (Sérgio - mentor):**

```
🌟 SEU ANO DE 2025 - REFLEXÃO PROFUNDA

Querido Leonardo,

Passamos por 365 dias juntos. Vou refletir sobre 
sua jornada neste último ano.

📊 NÚMEROS DO ANO:
• Metas criadas: 24
• Metas atingidas: 18 (75%)
• Economia acumulada: R$ 3.200
• Dias em sequência meditação: 47 (recorde!)
• Crise detectada/resolvida: 7
• Mensagens trocadas: 4.892

⭐ MAIOR VITÓRIA:
Você transformou meditação de "nunca faz" para "quase diário".
Isso não é pequeno. Isso é transformação.

😰 MAIOR DESAFIO:
Academia começou forte em janeiro, esfriou em junho, 
recuperou em setembro. Aprendizado: você precisa de VARIEDADE.

💡 APRENDIZADO PRINCIPAL:
Você é consistente quando a atividade é SIGNIFICATIVA. 
Meditação conecta com sua alma. Academia é "exercício" — 
tente dança, trilha, esporte com amigos.

🎯 SEUS 3 MAIORES MOMENTOS:
1. Streak de meditação 47 dias (never thought you could)
2. Economia R$ 3.200 (você PODE poupar!)
3. Suportar 7 crises de ansiedade e VENCER todas (resiliência!)

🔮 2026 PROMETE:
Baseado em seus padrões, 2026 será de:
- Consolidação (você já sabe o que funciona)
- Expansão (hora de nova meta: esporte coletivo?)
- Integração (unificar o que aprendeu)

Você não é a mesma pessoa de janeiro. 
Você é MELHOR.

Feliz Novo Ano, Leonardo. 
Que 2026 seja seu melhor ano.

Com admiração,
Sérgio 🙏
```

**Custo:** ~R$ 0.050 por resumo (análise muito pesada, mas 1x/ano)

---

### 7️⃣ ROUTINE: Recomendações Personalizadas (PRIORIDADE BAIXA)

**O que faz:**
- Toda quarta de tarde
- Sugere novas categorias baseado no perfil
- "Você seria ótimo em X"

**Exemplo:**

```
💡 RECOMENDAÇÃO ESPECIAL PARA VOCÊ

Leonardo, baseado em seus padrões,
acho que você seria incrível em:

CATEGORIA SUGERIDA: 🎓 ESTUDOS
├─ Por quê: Você lê 3x/semana e aprende rápido
├─ Como começar: "Aprender Python em 30 dias"
├─ Tempo: 30 min/dia = viável pro seu schedule
└─ Impacto: Novo skill + renda potencial

Quer experimentar? [SIM] [TALVEZ] [NÃO]

---

CATEGORIA SUGERIDA: 🤝 NETWORKING
├─ Por quê: Você só vê pessoas segunda
├─ Como começar: "Chamar 1 amigo/semana"
├─ Tempo: 1h/semana = palpável
└─ Impacto: Conexões + felicidade (correlação alta)

Quer experimentar? [SIM] [TALVEZ] [NÃO]
```

**Custo:** ~R$ 0.003 por sugestão (rápido)

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack: Como Tudo Se Conecta

```
USUÁRIO digita WhatsApp
        ↓
    TWILIO recebe
        ↓
    MAKE webhook (decision tree)
        ↓
    ┌─────────────────────┐
    │ É mensagem normal?  │
    └─────────────────────┘
        ↓
    SIM: Pattern matching (90% script)
        └─→ Responde + salva
        
        NÃO/AMBÍGUO:
        └─→ CLAUDE ROUTINE ENTRA
            ├─ Detecta crise?
            ├─ Analisa contexto
            ├─ Aplica lógica inteligente
            └─→ Responde + salva

BACKGROUND (Agendado):
├─ Toda segunda 08h: Routine RESUMO_SEMANAL
├─ Toda segunda 14h: Routine ANALISE_PADROES
├─ Toda quarta 14h: Routine RECOMENDACOES
├─ Todo 1º janeiro: Routine RESUMO_ANUAL
├─ Contínua 24h: Routine DETECCAO_CRISE
└─ Customizável: Routine LEMBRETES_INTELIGENTES
```

### Infraestrutura

```
┌─────────────────────────────────────┐
│  CLAUDE ROUTINES (Cloud)            │
│  ├─ Scheduling                      │
│  ├─ IA Processing                   │
│  └─ Context Management              │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  SUPABASE FUNCTIONS                 │
│  ├─ Webhook receiver                │
│  ├─ Data aggregator                 │
│  └─ Trigger manager                 │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  SUPABASE DATABASE (PostgreSQL)      │
│  ├─ usuario_resumo_semanal          │
│  ├─ usuario_padroes                 │
│  ├─ usuario_recomendacoes           │
│  └─ usuario_saude_mental_alerta     │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  MAKE (Orquestrador)                │
│  ├─ Seleciona assistente            │
│  ├─ Personaliza tom                 │
│  └─ Envia via Twilio                │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  TWILIO + WHATSAPP                  │
│  └─ Usuário recebe resposta         │
└─────────────────────────────────────┘
```

---

## 📝 IMPLEMENTAÇÃO POR ROUTINE

### ROUTINE 1: Resumo Semanal (SEMANA 4 — COMECE AQUI)

**Arquivo:** `routines/resumo_semanal.ts`

```typescript
import Anthropic from "@anthropic-sdk/sdk";
import { createClient } from "@supabase/supabase-js";

const claude = new Anthropic();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Agenda: Toda segunda 08h
export async function rotineResumoSemanal() {
  // 1. Pega todos usuários ativos
  const usuarios = await supabase
    .from("usuarios")
    .select("*")
    .eq("status", "ativo");

  // 2. Para cada usuário, gera resumo
  for (const usuario of usuarios.data) {
    await gerarResumoSemanal(usuario.id);
  }
}

async function gerarResumoSemanal(usuarioId: string) {
  try {
    // 1. Coleta dados da semana
    const dados = await coletarDadosSemana(usuarioId);

    // 2. Busca preferências (qual assistente, que tom)
    const prefs = await supabase
      .from("usuarios")
      .select("assistente_escolhido, nome")
      .eq("id", usuarioId)
      .single();

    const assistente = prefs.data.assistente_escolhido;
    const nome = prefs.data.nome;

    // 3. Claude gera resumo
    const resposta = await claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Você é ${assistente}, assistente do Mentor24h.
          
Crie um resumo semanal INSPIRADOR e PERSONALIZADO para ${nome}.

DADOS DA SEMANA:
${JSON.stringify(dados, null, 2)}

REQUISITOS:
1. Tom: Compatível com personalidade de ${assistente}
2. Comprimento: 150-200 palavras
3. Inclua: destaques, desafios, reflexão, sugestão
4. Use emojis (mas não exagere)
5. Seja honesto mas motivador

RESPOSTA:`,
        },
      ],
    });

    const resumo =
      resposta.content[0].type === "text" ? resposta.content[0].text : "";

    // 4. Salva no BD
    await supabase.from("usuario_resumo_semanal").insert({
      usuario_id: usuarioId,
      resumo,
      data_criacao: new Date(),
      assistente,
    });

    // 5. Envia via Twilio
    const usuario = await supabase
      .from("usuarios")
      .select("whatsapp")
      .eq("id", usuarioId)
      .single();

    await twilio.messages.create({
      body: `📊 ${resumo}`,
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${usuario.data.whatsapp}`,
    });

    // 6. Log
    console.log(`✅ Resumo semanal enviado para ${nome}`);
  } catch (error) {
    console.error(`❌ Erro ao gerar resumo para ${usuarioId}:`, error);
    // Log no Sentry/monitoring
  }
}

async function coletarDadosSemana(usuarioId: string) {
  const hoje = new Date();
  const semanaPasada = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Metas
  const metas = await supabase
    .from("usuario_metas_semana")
    .select("*")
    .eq("usuario_id", usuarioId)
    .gte("data_criacao", semanaPasada);

  // Hábitos
  const habitos = await supabase
    .from("usuario_habitos_log")
    .select("*")
    .eq("usuario_id", usuarioId)
    .gte("data", semanaPasada);

  // Finanças
  const financas = await supabase
    .from("financas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .gte("data", semanaPasada);

  return {
    metas: {
      total: metas.data.length,
      atingidas: metas.data.filter((m) => m.status === "atingida").length,
      falhadas: metas.data.filter((m) => m.status === "falhada").length,
    },
    habitos: {
      dias_consecutivos: calcularStreak(habitos.data),
      total_cumpridos: habitos.data.filter((h) => h.cumprido).length,
    },
    financas: {
      total_gasto: financas.data.reduce((acc, f) => acc + f.valor, 0),
      economia: calcularEconomia(financas.data),
    },
  };
}

function calcularStreak(logs: any[]): number {
  // Lógica para calcular streak consecutivo
  // (implementar conforme seus dados)
  return 0;
}

function calcularEconomia(gastos: any[]): number {
  // Lógica para calcular economia
  return 0;
}
```

**Registro no Supabase (cron job):**

```sql
-- Criar extensão pgcron se não existir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar routine
SELECT cron.schedule('resumo-semanal', 
  '0 8 * * 1',  -- Toda segunda 08h
  'SELECT resume_semanal_routine()');
```

**Resultado esperado:**

```
✅ Resumo semanal agendado
✅ Toda segunda 08h, usuários recebem no WhatsApp
✅ Dados salvos no BD para analytics
✅ Custo: ~R$ 0.003 por usuário/semana
```

---

### ROUTINE 2: Detecção de Crise (IMPLEMENTAR NA SEMANA 4)

**Arquivo:** `routines/deteccao_crise.ts`

```typescript
// Esta Routine roda CONTINUAMENTE (não é agendada)
// Cada mensagem dispara uma verificação

export async function checkMensagemCrise(
  usuarioId: string,
  mensagem: string
) {
  // 1. Detecta palavras-chave
  const severidade = detectarSeveridade(mensagem);

  if (severidade === "nenhuma") {
    return; // Não é crise, continua normal
  }

  // 2. Se detectou algo, Claude analisa mais profundo
  const analise = await claude.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `Mensagem do usuário: "${mensagem}"
        
Severidade detectada: ${severidade}

Responda APENAS com JSON (sem markdown):
{
  "tipo": "ansiedade|depressao|isolamento|desesperacacao|suicidio",
  "severidade": "leve|media|alta|critica",
  "recomendacao": "respiracao|meditacao|conversar|contato_emergencia",
  "urgencia": true|false
}`,
      },
    ],
  });

  const resultado = JSON.parse(analise.content[0].text);

  // 3. Se é CRÍTICO, alerta imediato
  if (resultado.urgencia) {
    await enviarAlertaCrise(usuarioId, resultado);
  }

  // 4. Se não é crítico, oferece técnica
  else {
    await oferecerTecnica(usuarioId, resultado);
  }

  // 5. Registra no BD
  await supabase.from("usuario_saude_mental_alerta").insert({
    usuario_id: usuarioId,
    tipo: resultado.tipo,
    severidade: resultado.severidade,
    resposta_oferecida: resultado.recomendacao,
    timestamp: new Date(),
    mensagem_original: mensagem,
  });
}

function detectarSeveridade(mensagem: string): string {
  const palavras_chave = {
    critica: [
      "suicida",
      "matar",
      "vontade de morrer",
      "não aguento mais",
    ],
    alta: [
      "ansiedade",
      "ansioso",
      "pânico",
      "triste",
      "deprimido",
      "isolado",
    ],
    media: ["nervoso", "estressado", "cansado", "perdido"],
    leve: ["chato", "aborrecido"],
  };

  const msg_lower = mensagem.toLowerCase();

  for (const [nivel, palavras] of Object.entries(palavras_chave)) {
    if (palavras.some((p) => msg_lower.includes(p))) {
      return nivel;
    }
  }

  return "nenhuma";
}

async function enviarAlertaCrise(usuarioId: string, resultado: any) {
  // RED ALERT — Envia contatos de emergência
  const usuario = await supabase
    .from("usuarios")
    .select("whatsapp, assistente_escolhido, nome")
    .eq("id", usuarioId)
    .single();

  const resposta = await claude.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `SITUAÇÃO CRÍTICA - GERAR RESPOSTA EMERGENCIAL

Tipo: ${resultado.tipo}
Severidade: ${resultado.severidade}
Assistente: ${usuario.data.assistente_escolhido}

Gere uma resposta que:
1. Valide os sentimentos
2. Ofereça contatos de emergência (CVV 188)
3. Seja ACOLHEDORA e URGENTE
4. Máximo 150 palavras

Formato: Texto simples, sem markdown`,
      },
    ],
  });

  const msg = resposta.content[0].text;

  // Envia via Twilio
  await twilio.messages.create({
    body: `🆘 ${msg}\n\nContatos de Emergência:\n📞 CVV: 188\n🏥 Emergência: 192`,
    from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${usuario.data.whatsapp}`,
  });

  // ALERTA ADMIN (você recebe notificação)
  await enviarAlertaAdmin(usuarioId, resultado, msg);
}

async function oferecerTecnica(usuarioId: string, resultado: any) {
  // Oferece técnica de respiração, meditação, etc
  const usuario = await supabase
    .from("usuarios")
    .select("assistente_escolhido, whatsapp")
    .eq("id", usuarioId)
    .single();

  let resposta = "";

  if (resultado.recomendacao === "respiracao") {
    resposta = `Vamos respirar junto?\n\n
4️⃣ Inspire (4 segundos)
7️⃣ Segure (7 segundos)  
8️⃣ Solte (8 segundos)\n\nRepita 4 vezes. Você consegue.`;
  } else if (resultado.recomendacao === "meditacao") {
    resposta = `Quer um áudio de meditação rápida?\n\n
[🎙️ Meditação 5min] [🎙️ Meditação 10min]`;
  }

  await twilio.messages.create({
    body: resposta,
    from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${usuario.data.whatsapp}`,
  });
}
```

**Integração com Make:**

```
No webhook do Make (quando recebe mensagem):

IF detectarSeveridade(mensagem) > "nenhuma"
  THEN:
    └─ Chama função Supabase: checkMensagemCrise()
    └─ Aguarda resposta (até 2s)
    └─ Se ofereceu técnica, Twilio envia
    └─ Se crítico, envia alert + numeros emergencia

ELSE:
  └─ Continua fluxo normal (pattern matching)
```

---

## 🔌 INTEGRAÇÃO MAKE + SUPABASE

### Como Tudo Se Conecta

**1. Make Recebe Webhook de Mensagem:**

```
Twilio → Make Webhook
  {
    "From": "+5511999999999",
    "Body": "Tô muito ansioso",
    "MessageSid": "123456"
  }
```

**2. Make Chama Função Supabase:**

```
Make Module: "HTTP - Make a request"
  URL: https://[projeto].supabase.co/functions/v1/check-crise
  Method: POST
  Headers: Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]
  Body: {
    "usuario_id": "uuid-aqui",
    "mensagem": "Tô muito ansioso",
    "whatsapp": "+5511999999999"
  }
```

**3. Supabase Função Retorna Classificação:**

```json
{
  "processado": true,
  "tipo": "ansiedade",
  "severidade": "media",
  "acao": "oferecida_respiracao",
  "mensagem_enviada": true
}
```

**4. Make Atualiza Dashboard em Tempo Real:**

```
Make Module: "Supabase - Insert Row"
  Table: usuario_mensagens_log
  Data: {
    usuario_id,
    conteudo,
    tipo_classificado,
    resposta_enviada,
    usou_ia: true,
    usou_routine: "deteccao_crise"
  }
```

---

## 📊 MONITORAMENTO E ANALYTICS

### Dashboard de Routines (Para Você Acompanhar)

```sql
-- View: routine_performance
CREATE VIEW routine_performance AS
SELECT
  routine_nome,
  COUNT(*) as execucoes_total,
  COUNT(CASE WHEN sucesso THEN 1 END) as execucoes_ok,
  ROUND(100 * COUNT(CASE WHEN sucesso THEN 1 END) 
    / COUNT(*), 2) as taxa_sucesso,
  AVG(EXTRACT(EPOCH FROM tempo_execucao)) as tempo_medio_ms,
  SUM(CASE WHEN usuario_respondeu THEN 1 END) as usuarios_responderam
FROM routine_logs
GROUP BY routine_nome
ORDER BY execucoes_total DESC;
```

**Métricas a Monitorar:**

```
✅ Taxa de sucesso (deve estar > 95%)
✅ Tempo médio de execução (deve estar < 2s)
✅ Taxa de resposta dos usuários (> 30% é ótimo)
✅ Feedback dos usuários (rating 1-5)
✅ Custo por routine por mês
```

---

## 🚀 ROADMAP DE ROLLOUT

### FASE 2 (Semana 4-7): BETA FECHADO

```
SEMANA 4:
□ Deploy: Routine RESUMO_SEMANAL
│ └─ Teste com 5 beta-testers
│ └─ Ajusta tom/frequência
│ └─ Coleta feedback

SEMANA 5:
□ Deploy: Routine DETECCAO_CRISE
│ └─ Teste com 5 beta-testers
│ └─ Monitora false positives
│ └─ Verifica segurança

SEMANA 6:
□ Deploy: Routine ANALISE_PADROES
│ └─ Teste com 10 beta-testers
│ └─ Verifica qualidade das recomendações

SEMANA 7:
□ Review: Todas as 3 Routines
│ └─ Ajustes finais
│ └─ Documentação para Fase 3
```

### FASE 3 (Semana 8-13): EXPANSÃO

```
SEMANA 8:
□ Deploy: Routine LEMBRETES_INTELIGENTES
│ └─ Replaces Make dumb reminders
│ └─ Personaliza por usuário

SEMANA 9-10:
□ Deploy: Routine RECOMENDACOES_PERSONALIZADAS
│ └─ Testa sugestão de novas categorias

SEMANA 11:
□ Deploy: Routine RESUMO_MENSAL
│ └─ Testa com 50+ usuários

SEMANA 12:
□ Deploy: Todos os 7 Routines
│ └─ 100+ usuários ativos
│ └─ Full production

SEMANA 13+:
□ Monitoramento contínuo
□ Ajustes baseado em feedback
□ Preparação para escala (10k+ usuários)
```

### Custo Progressivo

```
FASE 2 (5-20 usuários):
├─ 3 Routines rodando
├─ Execuções/semana: ~50
├─ Custo Claude: ~R$ 0,30/semana
└─ Custo total: NEGLIGÍVEL ✅

FASE 3 (20-100 usuários):
├─ 7 Routines rodando
├─ Execuções/semana: ~500
├─ Custo Claude: ~R$ 3-5/semana
└─ Custo total: R$ 12-20/mês ✅

ESCALA (100-10k usuários):
├─ 7 Routines rodando
├─ Execuções/semana: ~50k
├─ Custo Claude: ~R$ 300-500/semana
└─ Custo total: R$ 1.200-2.000/mês
   (mas margem é 98%, então viável!)
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Semana 4 (Comece Aqui)

- [ ] Criar `routines/` folder no seu repo
- [ ] Implementar `resumo_semanal.ts`
- [ ] Criar tabelas Supabase:
  - [ ] `usuario_resumo_semanal`
  - [ ] `usuario_saude_mental_alerta`
  - [ ] `routine_logs` (monitoring)
- [ ] Setup pgcron para agendamento
- [ ] Testar com você mesmo (Leonardo)
- [ ] Testar com esposa
- [ ] Coletar feedback
- [ ] Documentar aprendizados

### Semana 5

- [ ] Implementar `deteccao_crise.ts`
- [ ] Criar alertas de emergência
- [ ] Testar com 5 beta-testers
- [ ] Monitores False Positives
- [ ] Documentar edge cases

### Semana 6

- [ ] Implementar `analise_padroes.ts`
- [ ] Criar tabela `usuario_padroes`
- [ ] Testar recomendações
- [ ] Refinar prompts Claude

### Deploy Checklist

```
Antes de ir pra produção:

CÓDIGO:
- [ ] Testes unitários para cada routine
- [ ] Error handling robusto
- [ ] Logging detalhado
- [ ] Rate limiting Claude API

DADOS:
- [ ] Backup automático
- [ ] Row Level Security ativado
- [ ] LGPD compliance (dados anônimos logs)

INFRAESTRUTURA:
- [ ] Monitoring alerts
- [ ] Uptime tracking
- [ ] Budget alerts Claude API

SEGURANÇA:
- [ ] Nenhum PII em logs
- [ ] Secrets em .env.local
- [ ] Tokens rotacionados
```

---

## 🎯 RESUMO: QUANDO COMEÇAR

```
✅ COMECE EM: Semana 4 (quando beta-testers = 10-20)
✅ PRIMEIRA ROUTINE: Resumo Semanal
✅ TEMPO ESTIMADO: 4-6 horas de dev
✅ CUSTO: Negligível na FASE 2, cresce na FASE 3
✅ DIFERENCIAL: Vai te destacar dos concorrentes

⚠️ NÃO COMECE EM: Semana 1-3
   Razão: Foco deve ser estabilidade, não IA extras
```

---

**FIM DO PLANO**

*Este documento é seu guia para implementar Claude Routines no Mentor24h. Quando chegar na Semana 4, retorne aqui e comece pelo Routine 1.*

*Criado por: Leonardo + Claude*
