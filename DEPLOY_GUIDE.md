# 🚀 DEPLOY GUIDE — Mentor24h

## Frontend: Vercel

### Passo 1: Conectar GitHub a Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Clique em **Add New Project**
3. Selecione **Import Git Repository**
4. Procure por `Mentor24h` (seu repo)
5. Clique em **Import**

### Passo 2: Configurar Environment Variables
Na tela de configuração do projeto, vá para **Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL = [sua URL do Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [sua chave anon do Supabase]
SUPABASE_SERVICE_ROLE_KEY = [sua chave service role]
DATABASE_URL = [sua connection string]
TWILIO_ACCOUNT_SID = [seu SID Twilio]
TWILIO_AUTH_TOKEN = [seu token Twilio]
TWILIO_PHONE_NUMBER = [seu número Twilio]
CLAUDE_API_KEY = [sua API key Anthropic]
INNGEST_EVENT_KEY = [sua chave Inngest]
INNGEST_SIGNING_KEY = [sua chave de signing Inngest]
INNGEST_API_KEY = [sua API key Inngest]
NEXT_PUBLIC_APP_URL = https://seu-dominio.vercel.app
```

### Passo 3: Deploy
Clique em **Deploy**. Vercel vai:
- Fazer build do Next.js
- Executar `npm ci` + `npm run build`
- Fazer deploy automático

**Tempo estimado:** 3-5 minutos

---

## Backend: Railway

### Passo 1: Conectar GitHub a Railway
1. Vá para [railway.app](https://railway.app)
2. Clique em **New Project**
3. Selecione **Deploy from GitHub**
4. Procure por `Mentor24h`
5. Selecione `main` branch

### Passo 2: Configurar Environment Variables
Na aba **Variables**, adicione:

```
DATABASE_URL = [sua connection string Supabase]
NEXT_PUBLIC_SUPABASE_URL = [sua URL do Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [sua chave anon]
SUPABASE_SERVICE_ROLE_KEY = [sua chave service role]
TWILIO_ACCOUNT_SID = [seu SID Twilio]
TWILIO_AUTH_TOKEN = [seu token Twilio]
TWILIO_PHONE_NUMBER = [seu número Twilio]
CLAUDE_API_KEY = [sua API key Anthropic]
INNGEST_EVENT_KEY = [sua chave Inngest]
INNGEST_SIGNING_KEY = [sua chave de signing Inngest]
INNGEST_API_KEY = [sua API key Inngest]
NODE_ENV = production
```

### Passo 3: Configurar Comando de Build
1. Na aba **Settings**, vá para **Build**
2. Build Command: `npm ci && npm run build`
3. Start Command: `npm run start`
4. Port: `3000`

### Passo 4: Deploy
Clique em **Deploy**. Railway vai fazer build e deploy.

**Tempo estimado:** 3-5 minutos

---

## Verificação Pós-Deploy

### Vercel
1. Vá para o link de produção (que aparece na dashboard)
2. Teste `/register` — deve carregar sem erros
3. Teste `/dashboard/categories` — lista de 42 categorias
4. Abra DevTools → Network → verifique que `/api/categories` retorna `200`

### Railway + Vercel
1. Configure Webhook Twilio para apontar para **Vercel URL**:
   ```
   https://seu-dominio.vercel.app/api/webhooks/twilio
   ```
2. Teste enviando mensagem WhatsApp
3. Verifique em Supabase se `messages` table recebeu a mensagem

---

## Troubleshooting

### "npm ci failed"
**Solução:** Use `npm install --legacy-peer-deps` localmente e commit o `package-lock.json`

### "Environment Variable not found"
**Solução:** Verifique que TODAS as 13 variáveis foram adicionadas (nenhuma faltando)

### "WhatsApp webhook não recebe mensagens"
**Solução:** 
1. Verifique URL do webhook no painel Twilio
2. Teste com `curl` para confirmar que está ativo
3. Logs da Railway devem mostrar `POST /api/webhooks/twilio`

---

## Performance Checklist Pós-Deploy

- [ ] Abrir Vercel Dashboard → Analytics → Core Web Vitals
- [ ] LCP < 2.5s ✅
- [ ] INP < 200ms ✅
- [ ] CLS < 0.1 ✅
- [ ] Testar /dashboard/categories — deve ser < 500ms INP ao clicar

---

**Documentação gerada:** 2026-05-03
**Projeto:** Mentor24h (Sprint 3, BLOCO 6-7 Deploy)
