# 🌟 Mentor24h — Ecossistema 24/7 de Bem-estar

Sistema integrado de bem-estar via WhatsApp + Dashboard Web. Funciona 24/7 com **90% Pattern Matching + 10% IA Seletiva**.

## 📦 Stack Técnica

- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express (via Vercel Functions)
- **Banco:** Supabase PostgreSQL + Drizzle ORM
- **WhatsApp:** Twilio API
- **IA:** Claude API (10% seletivo para 7 rotinas)
- **Deploy:** Vercel (frontend) + Railway (backend)
- **Testes:** Jest + Supertest

## 🚀 Quick Start

### 1. Setup Inicial

```bash
# Clone ou entre no diretório do projeto
cd Mentor24h

# Instale dependências
npm install --legacy-peer-deps

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores reais
```

### 2. Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` com:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Claude API (10% rotinas seletivas)
CLAUDE_API_KEY=sk-ant-...

# Inngest (message queue)
INNGEST_EVENT_KEY=evt_...
INNGEST_SIGNING_KEY=signKey_...

# General
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Desenvolver Localmente

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

### 4. Rodar Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage
```

### 5. Build para Produção

```bash
# Build
npm run build

# Inicie servidor de produção
npm start
```

## 📁 Estrutura do Projeto

```
Mentor24h/
├── /forge                    # Sistema FORGE (planejamento)
│   └── forge-data.json       # Metadados do projeto
├── /docs                     # Documentação viva
│   ├── PRD.md               # Requisitos do produto
│   ├── CONSTITUTION.md      # Leis invioláveis
│   ├── SPEC.md              # Especificação técnica
│   ├── PLAN.md              # Sprints e tasks
├── /src                      # Código de produção
│   ├── /app                 # Next.js App Router
│   ├── /components          # React components reutilizáveis
│   ├── /lib
│   │   ├── /db              # Drizzle schema e conexão
│   │   ├── /utils           # Funções compartilhadas
│   │   └── /hooks           # React hooks customizados
│   ├── /data                # Dados estáticos
│   ├── /styles              # CSS/Tailwind
│   └── /services            # Serviços de API/IA
├── /tests                   # Testes automatizados
├── /scripts                 # Scripts de produção
├── .env.example             # Exemplo de variáveis
├── package.json             # Dependências
├── tsconfig.json            # Configuração TypeScript
├── next.config.js           # Configuração Next.js
├── tailwind.config.ts       # Design system
├── jest.config.js           # Configuração de testes
└── CLAUDE.md                # Contexto permanente
```

## 🔐 Segurança Crítica

- ❌ **NUNCA** committar `.env` com secrets
- ✅ **SEMPRE** usar RLS (Row-Level Security) no Supabase
- ✅ **SEMPRE** validar input no backend
- ✅ **SEMPRE** usar HTTPS em produção
- ✅ **SEMPRE** testar detecção de crise antes de merge

## 🚨 Detecção de Crise (90% Pattern Matching)

Sistema de detecção baseado em **padrões determinísticos**, nunca em IA pura:

```typescript
import { detectCrisis } from '@/lib/utils/crisis-detector';

const result = detectCrisis("vou me matar");
// → { isCrisis: true, severity: 'critical', ... }
```

## 📊 Monitoramento

- **WhatsApp:** Logs em `/logs/whatsapp.log`
- **Crises:** Audit log em `crisis_audit_log` table
- **Performance:** Verificar em Vercel dashboard

## 🤝 Fluxo de Desenvolvimento

1. **Planejamento:** Ver `/docs/PLAN.md` para tasks
2. **Contexto:** Carregar `/docs/SPEC.md` antes de codificar
3. **Implementação:** Abra **nova janela** no Claude Code
4. **Testes:** Execute `npm test` antes de commit
5. **Deploy:** Via Vercel + Railway automaticamente

## 📞 Suporte

- 📧 Email: leosilvabh77@gmail.com
- 💡 Ver `/forge/forge-data.json` para status do projeto
- 📚 Ver `/docs` para documentação completa

---

**Última atualização:** 2026-05-01  
**Status:** 🟡 TASK-001 em conclusão  
**Próxima etapa:** TASK-002 (Variáveis de Ambiente)
