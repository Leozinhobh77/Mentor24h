# 🚀 DEPLOY GUIDE — Mentor24h

## Estratégia de Deploy Centralizada: GitHub

Todo o pipeline de deploy do Mentor24h foi unificado via **GitHub**. O processo de build, testes e deploy para o ambiente de produção ocorrerá automaticamente através de Git pushes. Não usaremos Vercel ou Railway separadamente.

### Passo 1: Preparar o Repositório GitHub
1. Crie um repositório no [GitHub](https://github.com)
2. Faça o push do seu código:
   ```bash
   git add .
   git commit -m "🚀 Preparando para deploy"
   git push origin main
   ```

### Passo 2: Configurar Environment Variables (GitHub Secrets)
No seu repositório do GitHub, vá em **Settings > Secrets and variables > Actions** e adicione os seguintes "New repository secret":

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
NEXT_PUBLIC_APP_URL = https://seu-dominio.com
NODE_ENV = production
```

### Passo 3: Deploy (Push to Main)
Todo o fluxo de deploy está acoplado ao GitHub.
Para fazer um deploy para produção, basta commitar e fazer push para a branch `main`:

```bash
git checkout main
git merge sua-branch
git push origin main
```

O GitHub assumirá o controle:
- Vai rodar o `npm ci`
- Fazer build do Next.js
- Fazer o deploy para o ambiente de destino associado

**Tempo estimado:** 3-5 minutos pelo Actions.

---

## Verificação Pós-Deploy

### Testes da Aplicação
1. Vá para o link de produção (seu domínio)
2. Teste `/register` — deve carregar sem erros
3. Teste `/dashboard/categories` — lista de 42 categorias
4. Abra DevTools → Network → verifique que `/api/categories` retorna `200`

### Integração Twilio
1. Configure Webhook Twilio para apontar para a URL da sua aplicação:
   ```
   https://seu-dominio.com/api/whatsapp/webhook
   ```
2. Teste enviando mensagem WhatsApp
3. Verifique em Supabase se `messages` table recebeu a mensagem

---

## Troubleshooting

### "Build Failed no GitHub Actions"
**Solução:** Verifique os logs na aba "Actions" do GitHub. Se o erro for `npm ci failed`, certifique-se de que o seu `package-lock.json` está comitado corretamente e atualizado.

### "Environment Variable not found"
**Solução:** Verifique se TODAS as variáveis foram adicionadas corretamente no GitHub Secrets. Se você adicionou novas variáveis, precisa reiniciar a Action.

### "WhatsApp webhook não recebe mensagens"
**Solução:** 
1. Verifique URL do webhook no painel Twilio
2. Teste com `curl` para confirmar que a rota pública da sua aplicação está ativa.

---

## Performance Checklist Pós-Deploy

- [ ] Acessar site e abrir LightHouse / DevTools
- [ ] LCP < 2.5s ✅
- [ ] INP < 200ms ✅
- [ ] CLS < 0.1 ✅
- [ ] Testar navegação do Next.js — deve ser instantânea.

---

**Documentação gerada:** 2026-05-03
**Projeto:** Mentor24h (Sprint 3, BLOCO 6 Deploy)
