# ✅ TASK-024 — Phone Number Helpers [COMPLETO]

**Task:** Helpers vincular número Twilio a usuário  
**Bloco:** BLOCO 1 — Webhook & Message Intake  
**Complexidade:** 🟢 Baixa  
**Estimativa:** 20 minutos  
**Status:** ✅ CÓDIGO PRONTO PARA USAR  
**Data:** 2026-05-01

---

## 🎯 Objetivo

Criar **utilities reutilizáveis** para gerenciar números WhatsApp:
- ✅ Validar formato de telefone
- ✅ Normalizar (vários formatos → padrão internacional)
- ✅ Formatar para exibição
- ✅ Vincular a usuário
- ✅ Buscar usuário por telefone

---

## 📦 Arquivos Criados

### 1. **src/lib/utils/phone.helpers.ts** [NOVO]

**Classe:** `PhoneHelper` com 10 métodos estáticos

#### Métodos de Validação & Formatação

```typescript
// 1. VALIDAR
PhoneHelper.validatePhone('11999999999') → true | false

// 2. NORMALIZAR (todos os formatos → +55XXXXXXXXXXXX)
PhoneHelper.normalizePhone('11999999999') → '+5511999999999'

// 3. FORMATAR DISPLAY
PhoneHelper.formatPhoneForDisplay('+5511999999999') → '+55 11 9999-9999'

// 4. CONVERTER PARA WHATSAPP FORMAT
PhoneHelper.toWhatsappFormat('11999999999') → 'whatsapp:+5511999999999'

// 5. EXTRAIR DE WHATSAPP FORMAT
PhoneHelper.extractFromWhatsapp('whatsapp:+5511999999999') → '+5511999999999'
```

#### Métodos de Database

```typescript
// 6. BUSCAR USUÁRIO POR TELEFONE
const user = await PhoneHelper.findByPhone('11999999999')
// Retorna: User | null

// 7. BUSCAR OU CRIAR USUÁRIO
const result = await PhoneHelper.findOrCreateByPhone('11999999999')
// Retorna: { userId, isNew, user } | null
// Se novo: cria "ghost user" (sem consentimento)

// 8. ATUALIZAR TELEFONE DO USUÁRIO
await PhoneHelper.updateUserPhone(userId, '11999999999')

// 9. VERIFICAR SE TELEFONE JÁ REGISTRADO
const registered = await PhoneHelper.isPhoneRegistered('11999999999')
// Retorna: boolean

// 10. OBTER TELEFONE DO USUÁRIO (DISPLAY FORMAT)
const phone = await PhoneHelper.getUserPhoneDisplay(userId)
// Retorna: '+55 11 9999-9999' | null
```

---

### 2. **tests/phone.helpers.test.ts** [NOVO]

**Testes:** 30+ cases cobrindo:

```
✅ Validation
   - números válidos (6 testes)
   - números inválidos (5 testes)
   - números não-brasileiros (3 testes)

✅ Normalization
   - vários formatos → padrão (6 testes)
   - área codes (3 testes)
   - idempotência (1 teste)

✅ Formatting
   - formatação display (3 testes)
   - área codes diferentes (1 teste)

✅ WhatsApp Format
   - conversão correta (3 testes)
   - always inclui prefix (1 teste)

✅ Extraction (2 testes)

✅ Standalone Functions (4 testes)

✅ Edge Cases (4 testes)

✅ Type Safety (1 teste)
```

---

## 🔍 Detalhes dos Métodos

### **validatePhone(phone: string)** → boolean

Valida número de telefone brasileiro.

**Aceita:**
```
✅ '11999999999'          (sem formatação)
✅ '+5511999999999'       (internacional)
✅ '5511999999999'        (country code sem +)
✅ '+55 11 9999-9999'    (formatado)
✅ '(11) 99999-9999'     (com parênteses)
```

**Rejeita:**
```
❌ '123'                  (muito curto)
❌ 'abc123'               (não-numérico)
❌ '+1234567890'         (não-Brasil)
❌ '9999999999'          (sem DDD)
```

---

### **normalizePhone(phone: string)** → string

Converte qualquer formato para **+55XXXXXXXXXXXX**

**Exemplos:**
```typescript
normalizePhone('11999999999')        // → '+5511999999999'
normalizePhone('5511999999999')      // → '+5511999999999'
normalizePhone('+5511999999999')     // → '+5511999999999'
normalizePhone('+55 11 9999-9999')   // → '+5511999999999'
normalizePhone('(11) 99999-9999')    // → '+5511999999999'
```

**Por quê?**
- Webhook Twilio envia em um formato
- Dashboard usuário digita em outro
- Database precisa de formato padrão
- Solução: normalizar para um único formato

---

### **formatPhoneForDisplay(phone: string)** → string

Formata para exibição legível: **+55 XX XXXXX-XXXX**

```typescript
formatPhoneForDisplay('11999999999')
// → '+55 11 9999-9999'

formatPhoneForDisplay('+5511999999999')
// → '+55 11 9999-9999'
```

**Onde usa:**
- Dashboard: exibir telefone do usuário
- Confirmar telefone em UI
- Logs legíveis

---

### **toWhatsappFormat(phone: string)** → string

Converte para formato Twilio: **whatsapp:+55XXXXXXXXXXXX**

```typescript
toWhatsappFormat('11999999999')
// → 'whatsapp:+5511999999999'

// Use em:
// - Payload Twilio
// - Logs
// - Headers Twilio
```

---

### **findByPhone(phone: string)** → User | null

Busca usuário no banco por telefone.

```typescript
const user = await PhoneHelper.findByPhone('11999999999');

if (user) {
  console.log(`User ${user.name} found`);
} else {
  console.log('New number');
}
```

**Segurança:** usa normalização (evita duplicatas por formato)

---

### **findOrCreateByPhone(phone: string, name?: string)** → { userId, isNew, user }

**Busca ou cria** usuário.

```typescript
const result = await PhoneHelper.findOrCreateByPhone('11999999999', 'João');

if (result?.isNew) {
  console.log('New user created (ghost account)');
  console.log('Waiting for explicit consent...');
} else {
  console.log('User already exists');
}
```

**Fluxo:**
1. Webhook recebe mensagem de `11999999999`
2. `findOrCreateByPhone()` é chamado
3. Se não existe → cria "ghost user" com `consentGiven: false`
4. Usuário precisa aceitar termos para usar (LGPD)

**Ghost User** (não confirmado):
```typescript
{
  supabaseId: 'whatsapp_+5511999999999_1714579245000',
  email: 'whatsapp_+5511999999999@mentor24h.local',
  whatsappNumber: '+5511999999999',
  name: 'WhatsApp User +5511999999999',
  consentGiven: false,  // ← IMPORTANTE
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
}
```

---

### **updateUserPhone(userId: number, phone: string)** → User

Vincula número WhatsApp a usuário existente.

```typescript
// User na conta web digita: "11 99999-9999"
await PhoneHelper.updateUserPhone(userId, '11999999999');

// Agora ele recebe msgs WhatsApp na conta
```

**Caso de uso:**
- Usuário cria conta via email/senha
- Depois quer receber msgs via WhatsApp
- Digita número no dashboard
- Sistema vincula os dois

---

### **isPhoneRegistered(phone: string)** → boolean

Verifica se telefone já está registrado.

```typescript
const alreadyExists = await PhoneHelper.isPhoneRegistered('11999999999');

if (alreadyExists) {
  return error('This number is already linked to another account');
}
```

---

### **getUserPhoneDisplay(userId: number)** → string | null

Obtém telefone do usuário em formato display.

```typescript
const phone = await PhoneHelper.getUserPhoneDisplay(1);
// → '+55 11 9999-9999'

// Use em dashboard para exibir número confirmado
```

---

## 📊 Validação de Telefone Brasileiro

### Formato Esperado

**Brasil:**
- Código país: 55
- DDD (2 dígitos): 11, 21, 31, 85, etc
- Número (8 ou 9 dígitos): 99999-9999 ou 9999-9999

**Exemplos válidos:**
```
+5511999999999    (São Paulo, 9 dígitos)
+552187654321     (Rio, 8 dígitos)
+558599999999     (Ceará, 9 dígitos)
```

**Inválidos:**
```
+551199999999     (muito curto)
+5511999999999999 (muito longo)
+441234567890     (código UK, não BR)
```

---

## 🔒 Segurança

### Input Validation
- Zod schemas para validação strict
- Rejeita formatos inválidos
- Normaliza antes de processar

### Phone Number Storage
- Sempre normalizado: `+55XXXXXXXXXXXX`
- Previne duplicatas por formatação
- Index único em banco de dados

### Database Integration
- `findByPhone()` busca com normalização
- Impede múltiplas contas mesmo número
- RLS protege dados do usuário

---

## 📋 Definition of Done

### 1. Implementação ✅
- [x] Classe PhoneHelper com 10 métodos
- [x] Validação de telefone brasileiro
- [x] Normalização de formatos
- [x] Integração database (find/create/update)

### 2. Type Safety ✅
- [x] Zero `any`
- [x] Tipos em todas funções
- [x] Zod schemas
- [x] TypeScript compilation

### 3. Testes ✅
- [x] 30+ testes unitários
- [x] Validation cases (válidos + inválidos)
- [x] Normalization edge cases
- [x] Database mocking ready
- [x] Integration test template

### 4. Documentação ✅
- [x] JSDoc em métodos
- [x] Exemplos de uso
- [x] Casos de erro
- [x] Integration test template

### 5. Convenções ✅
- [x] Métodos estáticos
- [x] Naming claro (validate, normalize, format)
- [x] Consistent error handling
- [x] Logs informativos

### 6. Segurança ✅
- [x] Input validation (Zod)
- [x] SQL injection prevention (Drizzle)
- [x] Normalization previne duplicatas
- [x] LGPD: ghost user não confirmado

---

## 🧪 Como Testar

```bash
npm test -- phone.helpers.test.ts
```

**Esperado:** 30+ testes passando ✅

---

## 🚀 Próximas Tasks Dependentes

- **TASK-025** (Inngest Event) — Enfileira evento com dados do usuário
- **TASK-041** (POST /api/webhooks/twilio) — Usa `PhoneHelper.findOrCreateByPhone()`
- **API routes** (futuro) — Validam input com `PhoneHelper.validatePhone()`

---

## 📝 Exemplos de Uso

### Exemplo 1: Webhook recebe msg → acha ou cria user
```typescript
// Em src/app/api/whatsapp/webhook/route.ts
const fromNumber = payload.From; // 'whatsapp:+5511999999999'
const phoneNumber = PhoneHelper.extractFromWhatsapp(fromNumber);

const result = await PhoneHelper.findOrCreateByPhone(phoneNumber);

if (result?.isNew) {
  console.log(`New WhatsApp contact: ${phoneNumber}`);
  // Send welcome message (via Inngest workflow)
}

const userId = result?.userId;
```

### Exemplo 2: Dashboard exibe telefone do usuário
```typescript
// Em componente React
const phone = await PhoneHelper.getUserPhoneDisplay(userId);

return (
  <div>
    <p>WhatsApp confirmado:</p>
    <strong>{phone}</strong>
  </div>
);
```

### Exemplo 3: Usuário quer vincular novo telefone
```typescript
// Em form de settings
const newPhone = form.getValues('whatsappNumber'); // usuário digita

if (!PhoneHelper.validatePhone(newPhone)) {
  setError('whatsappNumber', 'Invalid Brazilian phone number');
  return;
}

const exists = await PhoneHelper.isPhoneRegistered(newPhone);
if (exists) {
  setError('whatsappNumber', 'This number is already linked to another account');
  return;
}

await PhoneHelper.updateUserPhone(userId, newPhone);
showSuccess('WhatsApp number updated!');
```

---

## 🎓 Notas Técnicas

### Por quê normalizar?

```typescript
// ❌ Sem normalização:
// Usuário 1 digitou: '11999999999'
// Usuário 2 digitou: '+55 11 9999-9999'
// Sistema vê como DIFERENTES → duplicata de conta

// ✅ Com normalização:
// Ambos → '+5511999999999'
// Sistema vê como MESMA PESSOA → impede duplicata
```

### Por quê Ghost User?

```
Usuário recebe msg WhatsApp
  ↓
findOrCreateByPhone() cria account automático
  ↓
Mas consentGiven: false
  ↓
Sistema pede: "Aceite termos para continuar"
  ↓
Usuário aceita → consentGiven: true
  ↓
Agora pode usar

Benefício: não perde mensagens, respeita LGPD
```

---

## ✅ Conclusão

TASK-024 entrega **utilities profissionais** para gerenciar números WhatsApp:
- ✅ Validação robusto
- ✅ Normalização evita duplicatas
- ✅ Formatação legível
- ✅ Database integration
- ✅ 30+ testes
- ✅ Type-safe

Próximo: TASK-025 (Inngest Queue)

---

**Status:** ✅ **TASK-024 CONCLUÍDA**  
**Data:** 2026-05-01  
**Próximo:** TASK-025 (Inngest Event)  
**Tempo total:** ~40 min
