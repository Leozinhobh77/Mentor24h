# 🤖 COMO AS MENSAGENS SÃO DISPARADAS AUTOMATICAMENTE

> **Objetivo:** Entender SEM complicação como o Mentor24h dispara lembretes sozinho  
> **Público:** Leigo em programação  
> **Nível:** Super didático, sem jargão  

---

## 📚 ÍNDICE

1. [O Grande Quadro (Como Tudo Funciona)](#quadro-geral)
2. [Exemplo 1: Remédio (Simples)](#exemplo-remedio)
3. [Exemplo 2: Conta a Pagar (Cálculos)](#exemplo-conta)
4. [Exemplo 3: Academia (Frequência Customizável)](#exemplo-academia)
5. [Quem Dispara as Mensagens (O Agendador)](#agendador)
6. [Onde Tudo É Salvo (O Banco de Dados)](#banco-dados)
7. [Passo-a-Passo Completo de 1 Remédio](#passo-a-passo)

---

## 🎯 O GRANDE QUADRO

### Como Tudo Se Conecta (Visão de Cima)

```
┌─────────────────────────────────────────────────┐
│ VOCÊ DIGITA NO WHATSAPP:                        │
│ "Tenho que tomar remédio de gripe todo dia     │
│  às 10h, durante 1 semana, começando 10 maio"  │
└──────────────┬──────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│ MENTOR24H ENTENDE E SALVA NO BANCO DE DADOS:   │
│ ├─ Remédio: "Gripe"                            │
│ ├─ Horário: 10:00 (10 da manhã)                │
│ ├─ Data início: 10 de maio                     │
│ ├─ Duração: 7 dias                             │
│ └─ Data fim: 16 de maio                        │
└──────────────┬──────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│ UM AGENDADOR (ROBÔ) MONITORA O TEMPO:          │
│                                                 │
│ Todo dia às 10h da manhã:                      │
│ "Quem tem remédio pra tomar agora?"            │
│                                                 │
│ Se é 10/05, 11/05, 12/05... até 16/05:        │
│ └─ DISPARA: "Leonardo, hora do remédio!"       │
│                                                 │
│ Se é 17/05 (passou):                           │
│ └─ IGNORA (já terminou)                        │
└──────────────┬──────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│ VOCÊ RECEBE NO WHATSAPP ✓                      │
└─────────────────────────────────────────────────┘
```

---

## 📝 EXEMPLO 1: REMÉDIO (O MAIS SIMPLES)

### O Que Você Diz

```
Você digita: 
"Preciso tomar Dipirona todos os dias às 14h 
durante 30 dias, começando hoje."
```

### Como o Sistema Entende

```
1️⃣ MENTOR24H processa:
   ├─ Detecta palavra-chave: "remédio" / "tomar"
   ├─ Extrai informações com REGEX (padrão):
   │  ├─ Nome: Dipirona
   │  ├─ Frequência: "todos os dias"
   │  ├─ Horário: 14h (14:00)
   │  ├─ Duração: 30 dias
   │  └─ Data início: Hoje (29/04/2026)
   │
   └─ Salva no banco de dados

2️⃣ BANCO DE DADOS guarda:
   
   Tabela: remedios
   ┌────────────────────────────────┐
   │ ID: 123456                     │
   │ usuario_id: seu-id             │
   │ nome: "Dipirona"               │
   │ horarios: [14:00]              │
   │ dias_da_semana: [1,2,3,4,5,6,7]│ (todos)
   │ data_inicio: 2026-04-29        │
   │ data_fim: 2026-05-29           │
   │ ativo: true                    │
   └────────────────────────────────┘
```

### Como o Agendador Sabe

```
🤖 AGENDADOR (robô que monitora tempo):

Todo dia, a cada hora, o agendador faz essa pergunta:

"Que horas são agora?"
→ Resposta: 14:00 (2 da tarde)

"Alguém tem remédio agendado pra 14:00?"
→ Procura na tabela "remedios"
→ Encontra: Leonardo - Dipirona

"Será que hoje ainda está dentro do prazo?"
→ Verifica: Hoje é 15/05/2026?
→ É depois de 29/04? SIM ✓
→ É antes de 29/05? SIM ✓
→ Está ATIVO? SIM ✓
→ Então DISPARA!

✅ Envia mensagem: "Leonardo, é hora de tomar Dipirona!"

---

"Que horas são agora?"
→ Resposta: 14:00 (2 da tarde)
→ Próximo dia...

Dia 30/05 (passou 30 dias):
"Será que ainda está dentro do prazo?"
→ É depois de 29/04? SIM
→ É antes de 29/05? NÃO ✗
→ Agendamento EXPIROU!
→ IGNORA (não manda)
```

### Onde Tudo É Salvo

```
BANCO DE DADOS (Supabase):

Tabela: remedios
├─ Cada remédio salvo aqui
├─ Com datas início/fim
└─ Com horários

Tabela: remedios_log
├─ Registro de CADA mensagem enviada
├─ Data/hora que mandou
├─ Se você respondeu "ok"
└─ Para você ver histórico no dashboard
```

---

## 💰 EXEMPLO 2: CONTA A PAGAR (COM CÁLCULOS)

### O Que Você Diz

```
Você digita:
"Preciso pagar:
- Água: R$ 100 até 10 de maio
- Luz: R$ 500 até 15 de maio
- Internet: R$ 200 até 20 de maio"

Depois:
"Já paguei água"
"Já paguei luz"
(ainda não pagou internet)
```

### Como o Sistema Salva

```
1️⃣ Você diz "Água R$ 100 até 10 de maio"

Sistema detecta: CONTA_A_PAGAR
└─ Salva na tabela: contas_a_pagar

Tabela: contas_a_pagar
┌─────────────────────────────────┐
│ ID: conta-001                   │
│ usuario_id: seu-id              │
│ descricao: "Água"               │
│ valor: 100.00                   │
│ data_vencimento: 2026-05-10     │
│ status: "pendente"              │
│ data_criacao: 2026-04-29        │
└─────────────────────────────────┘

2️⃣ Você diz "Já paguei água"

Sistema detecta: CONTA_PAGA
└─ ATUALIZA a mesma linha:

Tabela: contas_a_pagar (ATUALIZADA)
┌─────────────────────────────────┐
│ ID: conta-001                   │
│ status: "paga"                  │ ← MUDOU
│ data_pagamento: 2026-04-30      │ ← REGISTROU
│ valor_pago: 100.00              │ ← CONFIRMOU
└─────────────────────────────────┘
```

### Como o Sistema Calcula

```
PERGUNTA: "Quanto devo neste mês?"

Sistema faz essa CONTA:

Total devido = SOMA de todos os valores pendentes

SQL (linguagem de banco de dados):
┌────────────────────────────────────────────┐
│ SELECT SUM(valor)                          │
│ FROM contas_a_pagar                        │
│ WHERE usuario_id = 'seu-id'                │
│ AND status = 'pendente'                    │
│ AND MONTH(data_vencimento) = MONTH(NOW())  │
└────────────────────────────────────────────┘

Resultado: R$ 700 (internet 200 + outras)

---

PERGUNTA: "Quanto eu já paguei?"

SQL:
┌────────────────────────────────────────────┐
│ SELECT SUM(valor_pago)                     │
│ FROM contas_a_pagar                        │
│ WHERE usuario_id = 'seu-id'                │
│ AND status = 'paga'                        │
│ AND MONTH(data_pagamento) = MONTH(NOW())   │
└────────────────────────────────────────────┘

Resultado: R$ 600 (água 100 + luz 500)

---

PERGUNTA: "Quanto ainda falta?"

Cálculo: Total - Pago = Falta
         700 - 600 = 100

Mensagem: "Leonardo, você deve R$ 100 ainda
          (Internet 200, já paga amanhã?)"
```

### Como Dispara Lembretes

```
🤖 AGENDADOR EM AÇÃO:

Todo dia às 08:00 da manhã:
┌──────────────────────────────────────────┐
│ "Quem tem conta vencendo hoje?"           │
│                                          │
│ Verifica data_vencimento de cada conta   │
│                                          │
│ Se HOJE = 10 de maio:                    │
│ └─ Vence ÁGUA! Aviso!                   │
│                                          │
│ Envia: "Leonardo, água vence HOJE!       │
│         Você quer pagar agora?           │
│         [💳 Pagar] [✅ Já Paguei]"       │
└──────────────────────────────────────────┘

Você responde: "✅ Já Paguei"
└─ Sistema ATUALIZA status para "paga"

Próximo dia:
┌──────────────────────────────────────────┐
│ "Quem tem conta vencendo hoje?"           │
│                                          │
│ Água já está "paga" → IGNORA             │
│ Luz vence amanhã → aviso amanhã          │
│ Internet não venceu → ignora             │
└──────────────────────────────────────────┘
```

### Resumo Automático

```
Todo mês (1º de maio):
Mentor24h gera resumo:

┌────────────────────────────────┐
│ 💰 RESUMO FINANCEIRO - MAIO   │
├────────────────────────────────┤
│                                │
│ Total de contas: R$ 800        │
│ Já pagou:       R$ 600         │
│ Falta pagar:    R$ 200         │
│                                │
│ HOJE VENCE:                    │
│ ⚠️ Internet (R$ 200)           │
│                                │
│ PRÓXIMOS 7 DIAS:               │
│ ✓ Todas as contas mapeadas     │
│                                │
│ [📊 Ver Detalhes]              │
└────────────────────────────────┘
```

---

## 🏋️ EXEMPLO 3: ACADEMIA (FREQUÊNCIA CUSTOMIZÁVEL)

### O Que Você Diz

```
Você digita:
"Quero ir à academia 
segunda, quarta e sexta
às 7 da manhã
todo mês"

Você customiza:
"Avisa-me:
- 1 dia antes? SIM
- No dia? SIM  
- Depois (passou): SIM (me motiva)"
```

### Como o Sistema Salva

```
Tabela: habitos
┌──────────────────────────────────┐
│ ID: habito-001                   │
│ usuario_id: seu-id               │
│ nome: "Academia"                 │
│ tipo: "recorrente"               │
│ horario: 07:00                   │
│ dias_semana: [2, 4, 6]           │ (seg, qua, sex)
│ frequencia: "semanal"            │
│ notificacoes: {                  │
│   "1_dia_antes": true,           │
│   "no_dia": true,                │
│   "pos_horario": true            │
│ }                                │
│ ativo: true                      │
└──────────────────────────────────┘
```

### Como Dispara Mensagens (3 Momentos)

```
⏰ MOMENTO 1: 1 dia antes

Sexta às 19h (véspera de segunda):
Sistema avisa:
"Leonardo, amanhã cedo tem academia às 7h!
Quer dormir cedo hoje?"

---

⏰ MOMENTO 2: No dia, horário certo

Segunda às 07:00:
Sistema avisa:
"Bom dia! É hora da academia! Vamos ficar bombado?
[✅ Saí] [⏰ Mais 30min] [❌ Não vou hoje]"

Você responde: "✅ Saí"
└─ Sistema REGISTRA que você foi
└─ Conta como "hábito cumprido"
└─ Atualiza "streak" (sequência)

---

⏰ MOMENTO 3: Depois do horário

Segunda às 10h (passou o horário):
Se você NÃO respondeu até agora:

Sistema avisa:
"Opa, passou a hora da academia!
Ainda quer ir? Nunca é tarde 💪
[✅ Ainda Vou] [❌ Deixa pra Próxima]"

Se você marcar "Deixa pra próxima":
└─ Sistema registra: "Não foi"
└─ Quebra a sequência (streak)
└─ Motiva: "Próxima segunda você volta!"
```

### Como Calcula Streak (Sequência)

```
STREAK = Quantos dias SEGUIDOS você foi

Exemplo:
┌────────────────────────┐
│ seg 05/05: ✅ Foram   │ → streak = 1
│ qua 07/05: ✅ Foram   │ → streak = 2
│ sex 09/05: ✅ Foram   │ → streak = 3
│ seg 12/05: ❌ Não     │ → streak = 0 (quebrou)
│ qua 14/05: ✅ Foram   │ → streak = 1 (recomecou)
│ sex 16/05: ✅ Foram   │ → streak = 2
└────────────────────────┘

Quando chega em 7 dias:
"🎉 7 DIAS SEGUIDOS! Você é TOP!"

Quando chega em 30 dias:
"🏆 30 DIAS! Você é LENDÁRIO!"
```

### Frequência Customizável

```
Você pode falar:
"Academia TODOS OS DIAS" 
→ Dias: [1,2,3,4,5,6,7]

"Academia segunda e quinta"
→ Dias: [2,5]

"Academia 3x por semana"
→ Sistema sugere: [2,4,6] (seg/qua/sex)
→ Você confirma ou muda

"Academia 2x por mês (dia 15 e 30)"
→ Sistema salva específico

Todo dia 1º:
"Quer repetir academia esse mês? [SIM] [NÃO]"
```

---

## 🔔 QUEM DISPARA AS MENSAGENS (O AGENDADOR)

### O Que É o Agendador?

```
É um ROBÔ que roda 24h/dia sem parar.

Ele fica monitorando o TEMPO:

┌────────────────────────────────┐
│ 00:00 (meia-noite)             │
│ ├─ Check: algo expira hoje?    │
│ ├─ Check: remédios de hoje?    │
│ └─ Check: datas importantes?   │
│                                │
│ 06:00 (de manhã)               │
│ ├─ Envia "Bom dia!"            │
│ ├─ Resumo do dia               │
│ └─ Lembretes da manhã          │
│                                │
│ 07:00 (horário customizado)    │
│ ├─ Academia?                   │
│ └─ Meditação?                  │
│                                │
│ 14:00 (horário customizado)    │
│ ├─ Remédio?                    │
│ └─ Almoço?                     │
│                                │
│ 20:00 (noite)                  │
│ ├─ Resumo do dia               │
│ ├─ Conquistas                  │
│ └─ Boa noite                   │
│                                │
│ Todo dia:                      │
│ ├─ Verify contas vencendo      │
│ ├─ Verify datas importantes    │
│ ├─ Verify hábitos cumpridos    │
│ └─ Atualizar streaks           │
└────────────────────────────────┘
```

### Onde Roda o Agendador?

```
Nome técnico: Cron Job (ou Scheduled Task)
Plataforma: Supabase (seu banco de dados)

Supabase roda em SERVER (não é no seu celular):
├─ Servidor Amazon (AWS)
├─ Roda 24h/dia
├─ Não depende de você estar online
└─ Funciona mesmo quando você dorme

Como funciona:
├─ A cada 1 minuto: Verifica o horário
├─ Se algo precisa ser enviado: ENVIA
├─ Via Twilio → WhatsApp → Seu celular
└─ Você recebe!

CÓDIGO que roda (Supabase Functions):

function agendador_rodar() {
  cada_minuto {
    hora_agora = qual é a hora?
    
    se alguém tem remédio pra AGORA {
      manda mensagem via WhatsApp
      registra no log
    }
    
    se alguém tem academia agora {
      manda mensagem via WhatsApp
      registra no log
    }
    
    se alguém tem conta vencendo hoje {
      manda lembretes
      registra no log
    }
  }
}
```

---

## 💾 ONDE TUDO É SALVO (O BANCO DE DADOS)

### Visualizando as Tabelas

```
SUPABASE (seu banco de dados na nuvem):

├─ Tabela: usuarios
│  ├─ seu ID único
│  ├─ nome
│  ├─ whatsapp
│  └─ assistente escolhido
│
├─ Tabela: remedios
│  ├─ ID da cada remédio
│  ├─ seu ID
│  ├─ nome do remédio
│  ├─ horários
│  ├─ data início/fim
│  └─ ativo? (sim/não)
│
├─ Tabela: remedios_log
│  ├─ Cada mensagem enviada
│  ├─ Data/hora
│  ├─ Se respondeu ok
│  └─ Para você ver histórico
│
├─ Tabela: contas_a_pagar
│  ├─ cada conta
│  ├─ valor
│  ├─ data vencimento
│  ├─ status (pendente/paga)
│  └─ quando pagou
│
├─ Tabela: habitos
│  ├─ academia, meditação, leitura, etc
│  ├─ dias da semana
│  ├─ horários
│  └─ notificações
│
├─ Tabela: habitos_log
│  ├─ "domingo você foi academia"
│  ├─ "segunda não foi"
│  ├─ data/hora
│  └─ seu comentário (opcional)
│
└─ Tabela: mensagens
   ├─ todas as mensagens trocadas
   ├─ quem enviou (você ou system)
   ├─ hora
   ├─ se usou IA ou script
   └─ para analytics
```

### Como São Armazenadas

```
Exemplo: Você digita "Tomar Dipirona todo dia 14h"

1️⃣ MENTOR24H processa (Pattern Matching):
   ├─ Detecta: REMÉDIO
   ├─ Extrai: nome, horário, duração
   └─ Valida os dados

2️⃣ SALVA NO BANCO:
   INSERT INTO remedios (
     usuario_id, nome, horarios, 
     data_inicio, data_fim, ativo
   ) VALUES (
     'seu-id-123', 'Dipirona', '14:00',
     '2026-04-29', '2026-05-29', true
   )

3️⃣ BANCO CONFIRMA:
   ✅ Salvo! Remédio ID: rem-456

4️⃣ MENTOR24H RESPONDE:
   "Perfeito Leonardo! Vou te lembrar
    Dipirona todo dia às 14h.
    Termina em 30 dias (29/05)."
   
5️⃣ AGENDADOR MONITORA:
   Cada dia às 14h:
   ├─ Query: "SELECT * FROM remedios 
             WHERE data_inicio <= TODAY 
             AND data_fim >= TODAY"
   └─ Encontra Dipirona → MANDA!
```

---

## 📍 PASSO-A-PASSO COMPLETO: 1 REMÉDIO

### Dia 1: Você Registra

```
HORA: 10:00 (você manda mensagem)

VOCÊ DIGITA:
"Preciso tomar dipirona todo dia
às 14h durante uma semana"

MENTOR24H PROCESSA:
├─ Detecta: é um REMÉDIO
├─ Extrai:
│  ├─ Nome: Dipirona
│  ├─ Horário: 14:00
│  ├─ Frequência: TODOS OS DIAS
│  └─ Duração: 7 dias (até 2026-05-05)
│
└─ MENTOR24H RESPONDE:
   "Perfeito! Vou avisar todos os dias
    às 14h para tomar Dipirona.
    Terminando em 7 dias (05/05).
    ✅ Remédio registrado!"

BANCO DE DADOS ATUALIZADO:
┌────────────────────────────┐
│ remedios.id = rem-001      │
│ usuario_id = leo-123       │
│ nome = Dipirona            │
│ horarios = [14:00]         │
│ data_inicio = 2026-04-29   │
│ data_fim = 2026-05-05      │
│ ativo = true               │
└────────────────────────────┘
```

### Dia 2-8: Agendador Dispara (Automático)

```
SEGUNDA-FEIRA (29/04) 14:00:

AGENDADOR VERIFICA:
├─ Que horas são? 14:00 ✓
├─ Alguém tem remédio agora? SIM (você!)
├─ Ainda está no prazo? 
│  ├─ É depois de 29/04? SIM ✓
│  ├─ É antes de 05/05? SIM ✓
│  └─ Está ativo? SIM ✓
│
└─ DISPARA MENSAGEM:

VOCÊ RECEBE NO WHATSAPP:
┌──────────────────────────┐
│ 14:00 - Lucas (seu bot)  │
├──────────────────────────┤
│                          │
│ E aí, Léo! É hora de    │
│ tomar a Dipirona! 💊    │
│                          │
│ [✅ Tomei]               │
│ [⏰ Em 30min]             │
│ [❌ Não preciso]         │
│                          │
└──────────────────────────┘

VOCÊ RESPONDE: "✅ Tomei"

MENTOR24H REGISTRA:
├─ Hora que tomou: 14:03
├─ Status: "cumprido"
└─ No banco: remedios_log.id = log-001
   ├─ usuario_id = leo-123
   ├─ remedio_id = rem-001
   ├─ data = 2026-04-29
   ├─ respondeu = true
   ├─ hora_resposta = 14:03
   └─ observacao = "Tomei"

---

TERÇA-FEIRA (30/04) 14:00:

AGENDADOR VERIFICA:
├─ É 14:00? SIM
├─ Dipirona ainda está ativa? SIM
│  ├─ É depois de 29/04? SIM
│  ├─ É antes de 05/05? SIM
│  └─ Está ativo? SIM
│
└─ DISPARA NOVAMENTE

(Mesma rotina... 7 dias)

---

SEGUNDA-FEIRA (05/05) 14:00:

AGENDADOR VERIFICA:
├─ É 14:00? SIM
├─ Dipirona ainda está ativa?
│  ├─ É depois de 29/04? SIM
│  ├─ É antes de 05/05? NÃO! ✗
│  
└─ IGNORA (terminou!)

Não manda mais mensagem!

Se você digitar depois:
"Preciso tomar mais dipirona"
└─ Cria NOVO registro (rem-002)
```

### Final: Histórico no Dashboard

```
Quando você acessa o Dashboard Web:

┌─────────────────────────────┐
│ MEU HISTÓRICO - DIPIRONA   │
├─────────────────────────────┤
│                             │
│ Período: 29/04 - 05/05      │
│ Total dias: 7               │
│ Cumprido: 7/7 ✅ (100%)     │
│                             │
│ 29/04 → ✅ 14:03           │
│ 30/04 → ✅ 14:02           │
│ 01/05 → ✅ 14:00           │
│ 02/05 → ✅ 14:01           │
│ 03/05 → ✅ 13:59           │
│ 04/05 → ✅ 14:05           │
│ 05/05 → ✅ 14:00           │
│                             │
│ 🏆 Parabéns! Completou!     │
│ Dose concluída com sucesso! │
│                             │
└─────────────────────────────┘
```

---

## 🎯 RESUMO: QUEM FAZ O QUÊ

```
┌──────────────────────────────────────────────┐
│ VOCÊ (No WhatsApp)                           │
│ └─ Digita: "Tomar remédio tal à tal hora"   │
│    Registra frequência, duração, horários    │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ MENTOR24H (Pattern Matching - 90% Script)   │
│ └─ Processa a mensagem                      │
│    Detecta: é remédio? conta? academia?     │
│    Extrai informações com REGEX             │
│    Valida dados                             │
│    Salva no banco                           │
│    Responde para você                       │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ BANCO DE DADOS (Supabase)                   │
│ └─ Armazena:                                │
│    ├─ remedios                              │
│    ├─ contas_a_pagar                        │
│    ├─ habitos                               │
│    ├─ metas                                 │
│    └─ logs de tudo                          │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ AGENDADOR (Cron Job - 24h/dia)              │
│ └─ Monitora o TEMPO                         │
│    A cada minuto verifica:                  │
│    ├─ Alguém tem remédio agora?             │
│    ├─ Alguém tem conta vencendo?            │
│    ├─ Alguém tem academia agora?            │
│    ├─ Alguém tem aniversário?               │
│    └─ Se SIM → DISPARA MENSAGEM             │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ TWILIO (API WhatsApp)                       │
│ └─ Envia a mensagem para seu WhatsApp       │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ VOCÊ (No WhatsApp - Recebe Mensagem)        │
│ └─ Vê a notificação                         │
│    Responde: "✅ Tomei" ou "❌ Não vou"     │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ MENTOR24H (Processa Resposta)               │
│ └─ Registra sua resposta                    │
│    Atualiza banco                           │
│    Calcula metrics (streak, etc)            │
│    Motiva você                              │
└──────────────────────────────────────────────┘
```

---

## ❌ O QUE NÃO PRECISA DE IA

```
✅ TUDO ISSO É AUTOMÁTICO (SEM IA):

├─ Lembretes em hora certa → BANCO + AGENDADOR
├─ Calcular quanto deve → QUERY SQL
├─ Verificar se venceu → COMPARAÇÃO DE DATA
├─ Contar streak de 7 dias → SOMA
├─ Registrar "já pagou" → UPDATE NO BANCO
├─ Mostrar resumo financeiro → SQL AGREGADO
├─ Disparar automaticamente → CRON JOB
├─ Customizar frequência → SALVAR CONFIGURAÇÃO
├─ Notificar em data específica → AGENDADOR
└─ Tudo que é "mecânico" → AUTOMÁTICO!

❌ O QUE USA IA (10%):

├─ Entender mensagem AMBÍGUA
│  "Aquela coisa que eu te falei ontem"
│
├─ Gerar resumo inspirador
│  "Sua semana foi incrível porque..."
│
├─ Detectar crise (ansiedade)
│  "Detectei que você está ansioso..."
│
├─ Recomendar o que fazer
│  "Você seria ótimo em..."
│
└─ Personalizar resposta
   "Baseado em seu perfil..."
```

---

## 🏗️ COMO TUDO SE CONECTA TECNICAMENTE

```
FLUXO COMPLETO:

1. VOCÊ → WhatsApp
   "Tomar remédio gripe 10h por 7 dias"

2. TWILIO recebe
   └─ Repassa para MAKE

3. MAKE processa
   ├─ Pattern matching (90%)
   ├─ Detecta: REMÉDIO
   ├─ Extrai: nome, horário, duração
   └─ Valida

4. Salva no SUPABASE
   INSERT INTO remedios (...)
   
5. MENTOR24H responde
   "Perfeito! Vou avisar..."
   
6. AGENDADOR monitora (24h/dia)
   Todo dia às 10h:
   ├─ Query: SELECT * FROM remedios WHERE...
   ├─ Encontra seu remédio
   └─ DISPARA mensagem

7. TWILIO envia
   Via WhatsApp → seu celular

8. Você responde
   "✅ Tomei"

9. Sistema registra
   remedios_log.add(...)
   
10. Dashboard atualiza
    Mostra: "7/7 dias cumpridos ✅"
```

---

## 💡 EXEMPLOS RÁPIDOS

### Exemplo: Contas a Pagar

```
VOCÊ: "Água R$ 100 até 10/05"
      "Luz R$ 500 até 15/05"
      "Internet R$ 200 até 20/05"

SISTEMA SALVA (tabela: contas_a_pagar):
├─ ID: conta-001, valor: 100, vencimento: 10/05, status: pendente
├─ ID: conta-002, valor: 500, vencimento: 15/05, status: pendente
└─ ID: conta-003, valor: 200, vencimento: 20/05, status: pendente

DIA 10/05 às 8h:
AGENDADOR: "Alguém tem conta vencendo 10/05?"
SISTEMA: "SIM! Água de R$ 100"
ENVIA: "Água vence HOJE! Quer pagar? [💳] [✅ Já Paguei]"

VOCÊ: "✅ Já Paguei"

SISTEMA ATUALIZA:
├─ conta-001.status = "paga"
├─ conta-001.data_pagamento = 10/05
└─ conta-001.valor_pago = 100

CALCULA TOTAL:
├─ Total devido: R$ 700 (agua 100 + luz 500 + internet 200)
├─ Já pagou: R$ 100
└─ Falta: R$ 600

MENSAGEM: "Leonardo, você pagou R$ 100 (Água).
          Ainda falta: R$ 600
          Próximas: Luz 15/05 e Internet 20/05"
```

### Exemplo: Academia

```
VOCÊ: "Academia segunda, quarta e sexta às 7h"
      "Avisa 1 dia antes e no dia"

SISTEMA SALVA:
├─ nome: Academia
├─ horario: 07:00
├─ dias: [2, 4, 6] (seg, qua, sex)
├─ notificacoes: [1_dia_antes, no_dia]
└─ ativo: true

DOMINGO 18h (1 dia antes de segunda):
MENTOR24H: "Leonardo, amanhã tem academia às 7h!
           Quer dormir cedo? 😴"

SEGUNDA 07:00:
MENTOR24H: "Bom dia! Academia agora? Vamo ficar bombado!
           [✅ Saí] [⏰ +30min] [❌ Não vou]"

VOCÊ: "✅ Saí"

SISTEMA REGISTRA:
├─ habitos_log.data = segunda
├─ habitos_log.status = "cumprido"
├─ habitos_log.streak = +1
└─ Se streak chegar 7: "🎉 7 DIAS SEGUIDOS!"

Se SEGUNDA às 08:00 você não respondeu:
MENTOR24H: "Passou a hora! Ainda quer ir?
           [✅ Ainda Vou] [❌ Deixa Próxima]"
```

---

## 🎓 RESUMO PARA LEIGOS

```
O MENTOR24H funciona assim:

1️⃣ VOCÊ FALA o que quer fazer
   "Tomar remédio às 14h por 7 dias"

2️⃣ SISTEMA ENTENDE (padrão simples)
   Detecta: remédio, horário, duração

3️⃣ SISTEMA SALVA (banco de dados)
   Registra: nome, hora, datas

4️⃣ ROBÔ MONITORA (agendador 24h)
   Todo dia verifica: é hora?

5️⃣ ROBÔ DISPARA (automaticamente)
   Envia mensagem na hora certa

6️⃣ VOCÊ RESPONDE
   "✅ Fiz" ou "❌ Não"

7️⃣ SISTEMA REGISTRA
   Conta seu progresso

8️⃣ MOSTRA NO DASHBOARD
   Seu histórico, estatísticas

---

NADA DISSO USA IA (90% é automático)
É tudo BANCO DE DADOS + AGENDADOR + CONTAS SIMPLES
Muito mais barato, muito mais rápido!
```

---

**FIM DA EXPLICAÇÃO**

*Agora você entende como a automação do Mentor24h funciona. Qualquer dúvida em um passo específico, é só gritar! 🎯*
