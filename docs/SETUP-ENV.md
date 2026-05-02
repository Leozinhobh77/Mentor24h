# 🔧 Guia Completo — Setup de Variáveis de Ambiente

**Tempo estimado:** 15-20 minutos

---

## 📋 O que você vai precisar

1. **Supabase** (PostgreSQL + Auth) — https://supabase.com
2. **Twilio** (WhatsApp) — https://twilio.com
3. **Anthropic** (Claude API) — https://console.anthropic.com
4. **Inngest** (Message Queue) — https://inngest.com

Todas as plataformas têm **free tier** suficiente para MVP.

---

## 🟢 PASSO 1: Supabase (PostgreSQL + Auth)

### 1.1 — Criar projeto Supabase

1. Acesse: https://app.supabase.com
2. Clique em **"New project"**
3. Preencha:
   - **Project name:** Mentor24h
   - **Database password:** (salve em local seguro)
   - **Region:** Escolha a mais próxima (e.g., São Paulo `sa-east-1`)
4. Clique **"Create new project"**
5. Aguarde ~3 minutos para provisionar

### 1.2 — Coletar credenciais Supabase

1. Vá em **Settings → API**
2. Copie estes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public)** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role (secret)** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 — Coletar Database URL

1. Vá em **Settings → Database**
2. Copie a **Connection String** (modo `Session` ou `Transaction`)
3. Substitua `[YOUR-PASSWORD]` pela senha que você criou
4. Essa é a `DATABASE_URL`

**Exemplo:**
```
postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres
```

---

## 📱 PASSO 2: Twilio (WhatsApp)

### 2.1 — Criar conta Twilio

1. Acesse: https://www.twilio.com
2. Clique **"Sign up"**
3. Preencha (email + phone + motivo: "SMS/Messaging")
4. Verifique seu email

### 2.2 — Coletar credenciais Twilio

1. Vá em https://www.twilio.com/console
2. Na página inicial, você verá:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`

**Importante:** Clique no ícone de olho para ver o token completo

### 2.3 — Configurar WhatsApp (Sandbox para dev)

**Opção A: Usar Sandbox (Recomendado para MVP)**
- Mais fácil para testar
- Número: `+14155238886`
- Você recebe mensagens de teste

**Opção B: Número WhatsApp real**
- Requer verificação de negócio
- Melhor para produção

### 2.4 — Setup WhatsApp Sandbox

1. Vá em: **Messaging → Try it out → WhatsApp**
2. Você verá um código QR
3. Escaneie com o celular (WhatsApp → Configurações → Codes)
4. Envie a mensagem que pedir
5. Pronto! Agora pode receber mensagens de teste

Seu número para receber: Salve o seu número do celular (com +55 prefixo)

---

## 🤖 PASSO 3: Anthropic Claude API

### 3.1 — Criar API Key

1. Acesse: https://console.anthropic.com/account/keys
2. Clique **"Create Key"**
3. Dê um nome: `mentor24h-dev`
4. Copie a chave completa → `CLAUDE_API_KEY`

**Formato esperado:**
```
sk-ant-v0-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📨 PASSO 4: Inngest (Message Queue)

### 4.1 — Criar conta Inngest

1. Acesse: https://app.inngest.com
2. Clique **"Sign up"** (com GitHub é mais rápido)
3. Crie um workspace: `mentor24h-dev`

### 4.2 — Coletar API Keys

1. Vá em **Settings → API Keys**
2. Copie:
   - **Event Key** → `INNGEST_EVENT_KEY`
   - **Signing Key** → `INNGEST_SIGNING_KEY`

---

## ✍️ PASSO 5: Preencher .env.local

### Opção A: Automático (Bash/Linux/Mac)

```bash
bash scripts/setup-env.sh
```

O script vai guiar você a copiar/colar cada variável.

### Opção B: Manual (Windows/Qualquer OS)

1. Abra `.env.local` no editor
2. Substitua `xxxxxxxxxx` pelos valores reais
3. Salve

**Template pronto (copie e cole):**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres.[xyz]:password@db.[xyz].supabase.co:5432/postgres

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+14155238886

# Claude
CLAUDE_API_KEY=sk-ant-v0-...

# Inngest
INNGEST_EVENT_KEY=evt_prod_...
INNGEST_SIGNING_KEY=signKey_prod_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=seu-jwt-secret-min-32-chars
```

---

## 🧪 PASSO 6: Testar a Configuração

### 6.1 — Verificar variáveis carregadas

```bash
# Mostrar todas as variáveis (sem valores sensíveis)
node -e "
  const env = process.env;
  const keys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'TWILIO_ACCOUNT_SID',
    'CLAUDE_API_KEY',
    'DATABASE_URL'
  ];
  keys.forEach(key => {
    const val = env[key];
    if (val) {
      const masked = val.substring(0, 10) + '...' + val.substring(val.length - 5);
      console.log(key + ': ' + masked);
    } else {
      console.log(key + ': ❌ FALTANDO');
    }
  });
"
```

### 6.2 — Testar conexão Supabase

```bash
npx ts-node -e "
  import { createClient } from '@supabase/supabase-js';
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  sb.auth.getSession().then(({ data }) => {
    if (data.session) console.log('✅ Supabase conectado');
    else console.log('✅ Supabase acessível (sem sessão)');
  }).catch(e => console.log('❌ Erro:', e.message));
"
```

### 6.3 — Iniciar dev server

```bash
npm run dev
```

Deve aparecer:
```
> Local:        http://localhost:3000
> Localhost:    http://localhost:3000
```

Acesse http://localhost:3000 no navegador.

---

## 🚨 Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL é undefined"

**Causa:** `.env.local` não foi lido  
**Solução:** 
1. Certifique-se que o arquivo está em `/Mentor24h/.env.local` (não em `/src`)
2. Reinicie: `npm run dev`
3. Verifique permissões do arquivo

### "TWILIO_ACCOUNT_SID inválido"

**Causa:** Valor copiado errado  
**Solução:**
1. Vá em https://twilio.com/console
2. Procure por "Account SID" (está em grandes letras)
3. Copie de novo

### "Database connection refused"

**Causa:** DATABASE_URL errada ou Supabase offline  
**Solução:**
1. Verifique `[YOUR-PASSWORD]` foi substituída
2. Teste em https://app.supabase.com/project/[id]/editor (SQL editor)
3. Se falhar lá também, contato Supabase support

### "Claude API key invalid"

**Causa:** Chave expirada ou copiada errada  
**Solução:**
1. Vá em https://console.anthropic.com/account/keys
2. Crie uma chave nova
3. Substitua em `.env.local`

---

## ✅ Checklist Final

- [ ] Todas as variáveis em `.env.local` preenchidas
- [ ] `.env.local` não foi commitado (em .gitignore)
- [ ] `npm run dev` inicia sem erros
- [ ] http://localhost:3000 abre a página inicial
- [ ] Não há warnings no console

---

## 🎯 Próximo Passo

Depois que tudo estiver configurado, execute:

```bash
npm run db:push
```

Isso vai:
1. Criar as tabelas no Supabase (baseado em schema.ts)
2. Aplicar as RLS policies
3. Prepara o banco para receber dados

---

**Dúvidas?** Ver `/docs/CLAUDE.md` para contexto completo do projeto.

Criado: 2026-05-01  
Último update: TASK-002
