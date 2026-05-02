# 🔐 API de Autenticação

**Base URL:** `http://localhost:3000/api/auth` (dev) | `https://mentor24h.vercel.app/api/auth` (prod)

---

## 📝 Endpoints

### 1. POST `/auth/register` — Criar Conta

**Descrição:** Registra novo usuário (Supabase Auth + Database)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "João Silva",
    "whatsappNumber": "+5511999999999"
  }'
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123", // min 8 chars
  "name": "João Silva",             // min 2 chars
  "whatsappNumber": "+5511999999999" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "supabaseId": "uuid-...",
      "email": "user@example.com",
      "name": "João Silva",
      "preferredAssistant": "Mateus",
      "timezone": "America/Sao_Paulo",
      "language": "pt-BR",
      "consentGiven": false,
      "isActive": true,
      "createdAt": "2026-05-01T20:00:00Z"
    }
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Email já está em uso"
}
```

**Validation:**
- Email: formato válido (`@` + domínio)
- Senha: mínimo 8 caracteres
- Nome: mínimo 2 caracteres
- WhatsApp: formato E.164 (opcional)

---

### 2. POST `/auth/login` — Fazer Login

**Descrição:** Autentica usuário e retorna token JWT

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..." // JWT token
  }
}
```

**Usar o token:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:3000/api/auth/me
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Credenciais inválidas"
}
```

---

### 3. POST `/auth/logout` — Fazer Logout

**Descrição:** Encerra sessão do usuário

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Success Response (200):**
```json
{
  "success": true
}
```

---

### 4. GET `/auth/me` — Pegar Usuário Atual

**Descrição:** Retorna dados do usuário autenticado (validando token)

**Request:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:3000/api/auth/me
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... } // dados do usuário
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Não autenticado"
}
```

---

## 🔑 JWT Token

**Formato:** `Bearer <token>`

**Como usar:**
```javascript
// No fetch/axios
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Em Next.js client
import { supabaseClient } from '@/lib/utils/supabase';
const { data: { user }, error } = await supabaseClient.auth.getUser();
```

**Expiração:** 1 hora (padrão Supabase)

**Refresh:** Automático via Supabase (client-side)

---

## 🛡️ Segurança

### Senhas
- Mínimo 8 caracteres
- Hasheadas no Supabase (bcrypt)
- Nunca expostas na API

### Tokens
- JWT (JSON Web Token)
- Assinados com chave secreta
- Transmitidos via HTTPS apenas
- Validados em cada request

### Validação
- Zod schema validation (frontend + backend)
- RLS policies (banco de dados)
- Rate limiting (Vercel/Railway)

---

## 🔄 Fluxo Completo de Autenticação

```
1. REGISTER
   POST /auth/register
   ↓ (sucesso)
   → Usuário criado em Supabase + Database

2. LOGIN
   POST /auth/login
   ↓ (sucesso)
   → Retorna JWT token

3. USE TOKEN
   GET /auth/me
   Header: Authorization: Bearer <token>
   ↓ (sucesso)
   → Retorna dados do usuário

4. LOGOUT
   POST /auth/logout
   ↓
   → Sessão encerrada
```

---

## 📱 Exemplo Frontend (React)

```typescript
// Usando Supabase client (recomendado)
import { supabaseClient } from '@/lib/utils/supabase';

// Register
const handleRegister = async (email: string, password: string, name: string) => {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  
  if (error) console.error(error);
  else console.log('Registered:', data);
};

// Login
const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) console.error(error);
  else console.log('Logged in:', data.session.access_token);
};

// Get current user
const { data: { user } } = await supabaseClient.auth.getUser();

// Logout
await supabaseClient.auth.signOut();
```

---

## 🧪 Testes com cURL

### 1. Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq .data.token -r > token.txt
```

### 3. Get current user
```bash
TOKEN=$(cat token.txt)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me
```

### 4. Logout
```bash
TOKEN=$(cat token.txt)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/logout
```

---

## ❌ Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Email inválido` | Formato de email errado | Verificar `@` e domínio |
| `Senha deve ter 8+ chars` | Senha muito curta | Usar senha mais longa |
| `Email já está em uso` | Email duplicado | Registrar com outro email |
| `Credenciais inválidas` | Email/senha errado | Verificar email e senha |
| `Não autenticado` | Token inválido/expirado | Fazer login novamente |
| `permission denied` | Token missing/inválido | Incluir header Authorization |

---

## 🚀 Próximas Tasks

- **TASK-006:** Login Page (UI)
- **TASK-007:** Register Page (UI)
- **TASK-008:** Auth Middleware

---

**Criado por:** TASK-005 — Auth Controller  
**Status:** ✅ 4 endpoints + service implementados
