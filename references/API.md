# 🔌 API — REST Endpoints Documentados

**Projeto:** Mentor24h  
**Versão:** 1.0  
**Data:** 2026-05-01  
**Base URL:** https://api.mentor24h.com (produção) | http://localhost:3001 (dev)

---

## Convenções

- **Autenticação:** Bearer token (JWT via Supabase Auth)
- **Rate Limiting:** 100 req/min por user (via Vercel)
- **Timeout:** 30s para todas as requests
- **Errors:** Estrutura padrão: `{error: "code", message: "human-readable", details: {}}`

---

## 🔐 Auth Endpoints

### POST /api/auth/register

Criar conta nova.

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_12345",
  "phone_whatsapp": "+55 11 99999-9999",
  "name": "João Silva"
}
```

**Response (201):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "refresh_token_here",
  "expires_in": 3600
}
```

**Errors:**
- `400 BAD_REQUEST` — validação falhou
- `409 CONFLICT` — email/phone já existe

---

### POST /api/auth/login

Fazer login.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_12345"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "refresh_token_here",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João",
    "selected_assistant": "mateus"
  }
}
```

**Errors:**
- `401 UNAUTHORIZED` — email/password inválido

---

### POST /api/auth/logout

Logout (invalida refresh token).

```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "status": "logged_out"
}
```

---

### POST /api/auth/refresh

Renovar access token.

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "access_token": "new_jwt_here",
  "expires_in": 3600
}
```

---

## 💬 Messages Endpoints

### POST /api/messages

Usuário envia mensagem via Dashboard.

```http
POST /api/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "body": "estou ansiosa",
  "source": "dashboard"
}
```

**Backend:**
- Parse keywords (RegEx)
- Score severidade
- Detecta crise (score >= 8)
- Salva em DB
- Retorna response imediata

**Response (201):**
```json
{
  "id": "msg-uuid",
  "body": "estou ansiosa",
  "severity": 5,
  "crisis_detected": false,
  "response": "Respire profundamente. Vou enviar uma meditação",
  "created_at": "2026-05-01T10:30:00Z"
}
```

**Errors:**
- `401 UNAUTHORIZED` — token inválido
- `422 UNPROCESSABLE_ENTITY` — body vazio

---

### GET /api/messages

Buscar histórico de mensagens do user.

```http
GET /api/messages?limit=20&offset=0&severity_min=5
Authorization: Bearer {access_token}
```

**Query params:**
- `limit` — quantas (default: 20, max: 100)
- `offset` — pagination
- `severity_min` — filtrar por severidade mínima

**Response (200):**
```json
{
  "data": [
    {
      "id": "msg-uuid",
      "body": "...",
      "severity": 8,
      "crisis_detected": true,
      "response": "...",
      "created_at": "2026-05-01T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 127
  }
}
```

---

### GET /api/messages/crises

Buscar APENAS as crises do user (severity >= 8).

```http
GET /api/messages/crises?limit=10
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "msg-uuid",
      "body": "não aguanto mais",
      "severity": 10,
      "crisis_keywords": ["não aguanto", "suicida"],
      "response": "[resposta pré-gravada]",
      "created_at": "2026-05-01T09:45:00Z"
    }
  ],
  "total_crises_detected": 3
}
```

---

## 📂 Categories Endpoints

### GET /api/categories

Listar todas as 42 categorias, agrupadas por pilar.

```http
GET /api/categories
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "organization": [
    {
      "id": "cat-uuid-1",
      "name": "Tarefas do Dia",
      "icon": "✓",
      "selected": true
    },
    {
      "id": "cat-uuid-2",
      "name": "Lembretes",
      "icon": "🔔",
      "selected": false
    }
  ],
  "inspiration": [...],
  "entertainment": [...],
  "wellbeing": [...]
}
```

---

### POST /api/categories/{id}/select

User seleciona uma categoria.

```http
POST /api/categories/{id}/select
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "status": "selected",
  "category_id": "{id}",
  "user_selected_count": 15
}
```

---

### POST /api/categories/{id}/deselect

User deseleciona uma categoria.

```http
POST /api/categories/{id}/deselect
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "status": "deselected"
}
```

---

## 🎵 Audios Endpoints

### GET /api/audios

Buscar áudios (filtrados por categoria se user as selecionou).

```http
GET /api/audios?category_id={cat-uuid}&limit=10
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "audio-uuid",
      "title": "Meditação Guiada 5min",
      "duration_seconds": 300,
      "url_storage": "https://cdn.mentor24h.com/audios/meditation-001.mp3",
      "narrator": "Sergio",
      "category": "Meditação"
    }
  ]
}
```

---

## 🤖 Routines Endpoints

### GET /api/routines/status

Status de todas as 7 routines do user.

```http
GET /api/routines/status
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "routines": [
    {
      "id": "routine-uuid",
      "name": "weekly_summary",
      "enabled": true,
      "last_run_at": "2026-04-28T08:00:00Z",
      "next_run_at": "2026-05-05T08:00:00Z",
      "last_result": {
        "status": "success",
        "messages_processed": 42,
        "summary": "Semana produtiva..."
      }
    }
  ]
}
```

---

## 👤 User Endpoints

### GET /api/user/profile

Buscar perfil do user logado.

```http
GET /api/user/profile
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "João Silva",
  "phone_whatsapp": "+55 11 99999-9999",
  "selected_assistant": "mateus",
  "avatar_url": "https://...",
  "timezone": "America/Sao_Paulo",
  "wellbeing_goal": "reduzir ansiedade",
  "consentimento_explicito": true,
  "created_at": "2026-01-15T10:00:00Z"
}
```

---

### PATCH /api/user/profile

Atualizar perfil.

```http
PATCH /api/user/profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "João Silva",
  "selected_assistant": "lucas",
  "wellbeing_goal": "dormir melhor",
  "timezone": "America/Recife"
}
```

**Response (200):**
```json
{
  "id": "user-uuid",
  "name": "João Silva",
  "selected_assistant": "lucas",
  "updated_at": "2026-05-01T10:30:00Z"
}
```

---

### DELETE /api/user/account

Deletar conta e TODOS os dados (LGPD direito à exclusão).

```http
DELETE /api/user/account
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "password": "user_confirms_password"
}
```

**Response (200):**
```json
{
  "status": "account_deleted",
  "message": "Todos os seus dados foram deletados. Seu pedido foi registrado.",
  "confirmation_id": "delete-uuid"
}
```

**Nota:** Dados são soft-deleted (não removidos do BD imediatamente por auditoria). Após 90 dias, purga automática.

**Errors:**
- `401 UNAUTHORIZED` — password inválido

---

## 🔔 WhatsApp Webhook

### POST /api/whatsapp/webhook

Twilio envia webhook quando user manda mensagem no WhatsApp.

```http
POST /api/whatsapp/webhook
Content-Type: application/x-www-form-urlencoded

From=whatsapp%3A%2B5511999999999
To=whatsapp%3A%2B5511987654321
Body=estou%20muito%20ansiosa
[... + outros campos Twilio]
```

**Backend processa:**
1. Valida assinatura Twilio
2. Extrai phone + message
3. Busca user no DB
4. Se não existe, cria auto (first contact)
5. Enfileira em Inngest (processMessage)
6. Retorna 200 (webhook confirmado)

**Response (200):**
```
```
(Webhook responses não enviam JSON — só status code)

---

### GET /api/whatsapp/webhook

Twilio envia GET request para verificar URL (setup).

```http
GET /api/whatsapp/webhook?hub.challenge=VERIFICATION_TOKEN
```

**Response (200):**
```
VERIFICATION_TOKEN
```

---

## 🛡️ Error Codes

| Code | Meaning | Recovery |
|------|---------|----------|
| `400_BAD_REQUEST` | Validação falhou | Revise input |
| `401_UNAUTHORIZED` | Token inválido/expirou | Faça refresh ou login novamente |
| `403_FORBIDDEN` | Sem permissão pra este recurso | Verifique acesso |
| `404_NOT_FOUND` | Recurso não existe | Verifique ID |
| `422_UNPROCESSABLE_ENTITY` | Dados logicamente inválidos | Revise request |
| `429_TOO_MANY_REQUESTS` | Rate limit atingido | Aguarde 1 minuto |
| `500_INTERNAL_SERVER_ERROR` | Erro no servidor | Reportar a Sentry |

---

## Referências

- Backend: `src/pages/api/`
- Drizzle Queries: `src/lib/db/queries/`
- Tipos TypeScript: `src/types/api.ts`
- Testes: `tests/api/*.test.ts`
