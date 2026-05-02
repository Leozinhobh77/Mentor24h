# Guia de Configuração — Twilio + WhatsApp

**Data:** 2026-05-02  
**Projeto:** Mentor24h  
**Objetivo:** Conectar o sistema ao Twilio real para enviar mensagens WhatsApp

---

## 1. Obter Credenciais Twilio

### Passo 1: Criar Conta na Twilio

1. Acesse [console.twilio.com](https://console.twilio.com)
2. Faça login ou crie uma conta
3. Passe pela verificação de telefone (necessária)
4. Complete o perfil da conta

### Passo 2: Copiar Account SID e Auth Token

1. Vá para **Account Info** (botão no canto superior esquerdo)
2. Copie:
   - **Account SID**: começa com `AC`... (salve como `TWILIO_ACCOUNT_SID`)
   - **Auth Token**: string longa (salve como `TWILIO_AUTH_TOKEN`)
3. Nunca compartilhe o Auth Token — é secreto!

---

## 2. Configurar WhatsApp Sandbox (Teste)

### Passo 1: Acessar WhatsApp Sandbox

1. No Twilio Console, vá para **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Ou acesse diretamente: **Messaging** > **WhatsApp**
3. Na aba **Sandbox**, você verá:
   - Um número Twilio sandbox (ex: `whatsapp:+14155238886`)
   - Instruções de conexão

### Passo 2: Conectar seu Número WhatsApp

1. Abra o WhatsApp no seu celular
2. Envie uma mensagem para o número sandbox Twilio (ex: `+14155238886`)
3. Digite a palavra-chave mostrada (ex: `join dynamic-value`)
4. Aguarde confirmação: "You are now connected to Mentor24h"

### Copiar Número Sandbox

Na página de configuração, copie o número sandbox Twilio:
```
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

---

## 3. Configurar .env.local

Crie arquivo `.env.local` na raiz do projeto (não commitado):

```bash
cp .env.example .env.local
```

Preencha com as credenciais obtidas:

```
# Credenciais Twilio (OBRIGATÓRIO)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# Variáveis restantes do .env.example
NEXT_PUBLIC_SUPABASE_URL=...
# ... etc
```

**Checklist:**
- [ ] `TWILIO_ACCOUNT_SID` preenchido
- [ ] `TWILIO_AUTH_TOKEN` preenchido
- [ ] `TWILIO_PHONE_NUMBER` preenchido (com prefixo `whatsapp:`)
- [ ] `.env.local` **nunca** é commitado (está em `.gitignore`)

---

## 4. Testar Webhook Local (ngrok)

Para testar se o webhook recebe mensagens do Twilio:

### Passo 1: Instalar ngrok

```bash
# macOS
brew install ngrok

# Linux
curl https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-x86_64.zip -o ngrok.zip
unzip ngrok.zip
sudo mv ngrok /usr/local/bin
```

### Passo 2: Iniciar ngrok

```bash
ngrok http 3000
```

Você verá algo como:
```
Forwarding                    https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:3000
```

Copie a URL pública: `https://xxxx-xx-xxx-xxx-xx.ngrok.io`

### Passo 3: Configurar URL no Painel Twilio

1. No Twilio Console, vá para **Messaging** > **WhatsApp** > **Sandbox**
2. Em **When a message comes in**, configure:
   - **Method:** POST
   - **URL:** `https://xxxx-xx-xxx-xxx-xx.ngrok.io/api/whatsapp/webhook`
3. Clique **Save**

### Passo 4: Testar

1. Mantenha `ngrok http 3000` rodando
2. Mantenha `npm run dev` rodando (Next.js em `localhost:3000`)
3. Envie uma mensagem via WhatsApp para o número sandbox
4. Verifique os logs no terminal Next.js:
   ```
   [WEBHOOK RECEIVED] messageSid: SMxxxxxxxxxxxxxxxxxxxxxxxx
   [WEBHOOK QUEUED] status: queued
   ```

---

## 5. Passar para Produção (Número Real)

### Passo 1: Obter Número WhatsApp Business

1. No Twilio Console, vá para **Messaging** > **WhatsApp**
2. Clique em **Request Production Access**
3. Preencha o formulário com:
   - Nome da empresa
   - Link para política de privacidade
   - Descrição do caso de uso
4. Aguarde aprovação da Twilio (geralmente 1-2 dias)

### Passo 2: Atualizar .env.local

Após aprovação, você receberá um número WhatsApp Business:

```
TWILIO_PHONE_NUMBER=whatsapp:+55XXXXXXXXXXXXXXXX
```

Substitua o sandbox pelo número real em `.env.local` e reinicie o servidor.

### Passo 3: Configurar Webhook para Produção

1. Se estiver deployado (Vercel), use a URL pública: `https://seu-dominio.com/api/whatsapp/webhook`
2. Configure no painel Twilio sob **Messaging** > **WhatsApp** > **Production Settings**

---

## 6. Variáveis de Ambiente de Teste

Para desenvolvimento sem enviar mensagens reais, use:

```bash
# Em .env.local
TWILIO_MOCK_MODE=true
```

Isso fará com que:
- Códigos OTP sejam logados no console em vez de enviados
- Mensagens de teste sejam processadas sem chamadas ao Twilio

---

## 7. Verificar Saúde do Sistema

O endpoint `GET /api/twilio/health` retorna o status:

```bash
curl http://localhost:3000/api/twilio/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-02T14:30:00.000Z",
  "metrics": {
    "messages_last_24h": 5,
    "crises_last_24h": 0,
    "response_rate_percent": 100,
    "avg_response_latency_ms": 245,
    "failed_deliveries": 0,
    "twilio_connectivity": true
  }
}
```

**Status possíveis:**
- `healthy`: Twilio OK, taxa de resposta > 90%
- `degraded`: Twilio OK, mas problemas (taxa < 90%, muitas falhas)
- `down`: Twilio indisponível ou sem credenciais

---

## 8. Troubleshooting

### Erro: "Missing Twilio credentials"

**Causa:** `.env.local` está faltando variáveis de Twilio

**Solução:**
```bash
# Verifique se .env.local existe:
cat .env.local | grep TWILIO

# Verifique se as variáveis estão preenchidas (não devem ser `xxx...`)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ✓
TWILIO_ACCOUNT_SID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ✗
```

### Erro: "Invalid Twilio signature"

**Causa:** URL do webhook configurada errado ou corpo da requisição alterado

**Solução:**
1. Verifique se a URL do ngrok está correta no painel Twilio
2. Certifique-se de que ngrok está rodando (`ngrok http 3000`)
3. Se usar outro proxy, certifique-se de que não altera o body da requisição

### Webhook não recebe mensagens

**Causa:** URL não está acessível

**Solução:**
1. Teste que ngrok está respondendo:
   ```bash
   curl https://xxxx.ngrok.io/api/whatsapp/webhook
   # Deve retornar um erro 400/403 válido, não "Connection refused"
   ```
2. Verifique que a URL está configurada no painel Twilio
3. Aguarde ~30 segundos para a configuração sincronizar

### Sandbox expirou

**Causa:** Sandbox de WhatsApp expira após 72 horas de inatividade

**Solução:**
1. Abra WhatsApp no celular
2. Envie novamente a palavra-chave: `join dynamic-value`
3. Aguarde confirmação

---

## 9. Recursos Úteis

- **Twilio Console:** https://console.twilio.com
- **Twilio WhatsApp Docs:** https://www.twilio.com/docs/whatsapp
- **ngrok:** https://ngrok.com
- **Mentor24h API Webhook:** `/api/whatsapp/webhook`
- **Mentor24h Health Check:** `/api/twilio/health`

---

## 10. Próximos Passos

Após configurar o Twilio:

1. ✅ Webhook live test (mensagens chegam ao servidor)
2. ⏳ Phone verification flow (`/api/auth/verify-phone` + OTP)
3. ⏳ Deploy para produção (Vercel + Railway)

---

**Última atualização:** 2026-05-02  
**Versão:** 1.0  
**Status:** Production Ready
