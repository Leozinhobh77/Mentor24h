# 🚀 DEPLOYMENT — Mentor24h v1.0

**Versão:** 1.0  
**Data:** 2026-05-03  
**Status:** ✅ Pronto para Deploy  
**Ambiente:** GitHub CI/CD (Frontend/Backend) + Supabase (Database)

---

## 📋 PRÉ-REQUISITOS

### Contas Necessárias
- [ ] GitHub account
- [ ] Ambiente de destino integrado com GitHub (VPS, Cloud Provider)
- [ ] Supabase project criado (já existente)
- [ ] Twilio account com WhatsApp habilitado
- [ ] Claude API key ativa

### Repositório
- [ ] Código em GitHub (público ou privado)
- [ ] Branching: `main` = production
- [ ] `.env.example` atualizado com todas as variáveis

---

## 🟢 PASSO 1: DEPLOYMENT (GITHUB CI/CD)

### 1.1 Configurar GitHub Repository

1. Acesse seu repositório no GitHub
2. Vá em **Settings → Secrets and variables → Actions**
3. Adicione os `Repository secrets`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://user:password@host:5432/mentor24h
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=whatsapp:+1415523xxxx
CLAUDE_API_KEY=sk-ant-v0-xxxxxxxxxxxxxxxxxxxxxxxx
INNGEST_EVENT_KEY=eventkeyhere
INNGEST_SIGNING_KEY=sigkeyhere
INNGEST_API_KEY=inngest_xxx
NEXT_PUBLIC_APP_URL=https://seudominio.com
NODE_ENV=production
```

**⚠️ IMPORTANTE:** Nunca adicione secrets no `.env` do repositório remoto — sempre use o GitHub Secrets para deploys via Actions.

### 1.2 Deploy Automático via Push

Todo o ciclo de build e deploy é ativado quando você commita para a branch principal (`main`).

```bash
git checkout main
git add .
git commit -m "🚀 Release v1.0"
git push origin main
```

O GitHub irá acionar o pipeline configurado no seu CI/CD, efetuando:
✓ Comando de build: `npm run build`
✓ Migrations ou scripts customizados
✓ Atualização da versão online

### 1.3 Verificar Deploy

```bash
# Após push e sucesso do Actions
# 1. Acesse o seu domínio online
# 2. Teste login → /dashboard
```

**Status:** ✅ Aplicação deployada

---

## 🟡 PASSO 2: VERIFICAÇÃO PÓS-DEPLOY

### 2.1 Testes Rápidos (Manual)

```bash
# Test 1: Frontend carrega
curl https://seudominio.com
# Esperado: HTML da login page

# Test 2: API disponível
curl https://seudominio.com/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
# Esperado: 200 + JSON de categorias

# Test 3: WhatsApp webhook
curl -X POST https://seudominio.com/api/whatsapp/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+55..&Body=test"
# Esperado: 200
```

### 2.2 Monitoramento

**GitHub:**
- Actions: Histórico de builds e deploys
- Insights: Tráfego e clones

**Infraestrutura:**
- Analisar logs na sua provedora (Server Logs)
- Uso de CPU/Memória

---

## 🔒 PASSO 3: SEGURANÇA PRÉ-PRODUÇÃO

### 3.1 Checklist SSL/HTTPS

```
[✓] Deploy de Produção: HTTPS ativo
[✓] Supabase: SSL em produção
[✓] next.config.js: CSP headers configurados
[✓] CORS: apenas NEXT_PUBLIC_APP_URL
[✓] Secrets: nenhuma chave exposta no código-fonte
```

### 3.2 Checklist LGPD

```
[✓] RLS ativo no Supabase
[✓] Dados sensíveis: encrypted at rest
[✓] Auditoria: todas ações logadas
[✓] Consentimento: checkbox em /auth/register
[✓] Direito à deleção: DELETE /api/user/account funciona
```

### 3.3 Rate Limiting

```
# Twilio (automático): 100 msgs/min/user
# Inngest: retry 3x exponential backoff
# API: Rate limit global configurado
```

---

## ⚡ PASSO 4: PERFORMANCE TUNING

### 4.1 Next.js Optimization

```
// next.config.js já contém:
✓ swcMinify: true (compilação otimizada)
✓ compress: true (gzip/brotli)
✓ optimizeFonts: true (font loading)
✓ images: { formats: ['avif', 'webp'] }
```

### 4.2 Bundle Size Check

```bash
npm run build

# Validação:
# ✓ JavaScript minimizado
# ✓ CSS otimizado
# ✓ First Contentful Paint: < 1s
# ✓ Lighthouse Score: > 80
```

---

## 🔄 PASSO 5: ROLLBACK DE EMERGÊNCIA

Se algo der errado em produção:

```bash
# No GitHub Actions ou Git
git revert <commit-do-deploy-quebrado>
git push origin main
```
Isso disparará um novo deploy com a versão anterior funcional.

---

## ✅ CHECKLIST FINAL DEPLOY

```
PRÉ-DEPLOY:
[✓] Código: npm run build sem erros
[✓] Testes: npm test passando
[✓] Env vars: .env.example completo
[✓] Secrets: nenhum em .md ou código

GITHUB E CI/CD:
[✓] Repositório conectado e configurado
[✓] Secrets adicionados no GitHub
[✓] Build sucedido

SUPABASE:
[✓] Production branch
[✓] RLS policies ativas
[✓] Backup automático

TWILIO:
[✓] Webhook apontando para https://seudominio.com/api/whatsapp/webhook
[✓] WhatsApp número configurado

CLAUDE API:
[✓] Key válida em produção

STATUS: ✅ PRONTO PARA PRODUÇÃO
```

---

**Documentação atualizada:** 2026-05-03
**Estratégia:** Deploy unificado via GitHub
**Projeto:** Mentor24h (Sprint 3)
