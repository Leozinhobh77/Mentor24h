# TASKS 061-065 — BLOCO 2: Perfil, Configuracoes & Bug Fixes ✅

**Status:** 100% CONCLUÍDO  
**Data:** 2026-05-02  
**Sprint:** 3, Bloco 2  

---

## Overview

Bloco 2 completou 5 tasks críticas em sequência ordenada:

1. **TASK-061:** Corrigir prop `description` → `message` em 3 componentes Alert
2. **TASK-062:** Fix middleware security (getSession → getUser) + /auth/reset pública
3. **TASK-063:** Remover header duplicado do dashboard, migrar user info para navbar
4. **TASK-064:** Criar página /perfil com ProfileForm (nome, assistente, timezone, whatsapp)
5. **TASK-065:** Criar página /configuracoes com SettingsPage (notificações, conta, LGPD, delete)

**Resultado:** 14 arquivos modificados/criados, 623 linhas adicionadas, todas as rotas protegidas funcionalizado.

---

## TASK-061: Fix Alert Props (Bug Critical)

**Problema:** Componentes de form do BLOCO 1 passavam `description=` para Alert, mas interface define `message=`.

### Arquivos Afetados

#### `src/components/auth/LoginForm.tsx` — 1 ocorrência
```tsx
// ANTES:
<Alert type="success" title="Conta criada com sucesso!" description="Você pode fazer login agora com seus dados" />

// DEPOIS:
<Alert type="success" title="Conta criada com sucesso!" message="Você pode fazer login agora com seus dados" />
```

#### `src/components/auth/ResetForm.tsx` — 2 ocorrências
```tsx
// Sucesso:
<Alert type="success" title="Email enviado com sucesso!" message="Verifique sua caixa de entrada e spam para o link de recuperação. Ele expira em 1 hora." />

// Erro:
<Alert type="error" title="Erro" message={error} />
```

#### `src/components/auth/UpdatePasswordForm.tsx` — 3 ocorrências
```tsx
// Link expirado:
<Alert type="error" title="Link expirado" message="Este link de recuperação expirou. Solicite um novo email de recuperação." />

// Erro genérico (2x):
<Alert type="error" title="Erro" message={error} />
```

**Resultado:** ✅ Todos os 6 occurrências corrigidas. Alerts renderizam corretamente.

---

## TASK-062: Fix Middleware Security

**Problema:** Middleware usava `getSession()` que lê cookie sem validação server-side. Método inseguro.  
**Solução:** Substituir por `getUser()` que valida com Supabase server.

### Arquivo: `src/middleware.ts`

#### Mudança 1 — getSession → getUser (linha ~25)
```typescript
// ANTES:
const { data: { session } } = await supabase.auth.getSession();
if (session) { /* logado */ }

// DEPOIS:
const { data: { user } } = await supabase.auth.getUser();
if (user) { /* logado */ }
```

Atualizar todas as referências de `session` para `user` na lógica de proteção.

#### Mudança 2 — Adicionar /auth/reset às rotas públicas
```typescript
const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/reset'];
```

#### Mudança 3 — Lógica de redirect se logado
```typescript
if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

#### Mudança 4 — Proteger rotas autenticadas
```typescript
if (isProtected && !user) {
  return NextResponse.redirect(new URL('/auth/login', request.url));
}
```

**Resultado:** ✅ Middleware agora valida com Supabase server. `/auth/reset` público. Rotas protegidas verificam autenticidade.

---

## TASK-063: Fix Dashboard Duplication

**Problema:** Dashboard tinha dois navbars:
1. `DashboardNavbar` (do layout)
2. Inline `<header>` com nome/email do usuário + botão logout

Resultado: sobreposição visual.

### Arquivo: `src/app/dashboard/page.tsx`

**Ação:** Remover bloco `<header>` inteiro (abre em `<header className="border-b...` e fecha antes de `<main>`).

Substituir:
```tsx
// ANTES:
return (
  <div className="min-h-screen bg-...">
    <header className="border-b...">
      {/* nome, email, logout button */}
    </header>
    <main>
      {/* conteúdo */}
    </main>
  </div>
);

// DEPOIS:
return (
  <main className="max-w-4xl mx-auto px-4 py-8">
    {/* conteúdo */}
  </main>
);
```

### Arquivo: `src/components/DashboardNavbar.tsx`

**Ação:** Adicionar user info + logout ao lado direito do navbar.

```tsx
import { useAuth } from '@/lib/hooks/useAuth';

export function DashboardNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-blue-500/30 bg-slate-800/50">
      {/* badges, status, etc */}
      
      {/* User section — novo */}
      <div className="flex items-center gap-3 ml-4 border-l border-blue-500 pl-4">
        <div className="text-right">
          <p className="text-white text-sm font-medium">{user?.name || 'Usuário'}</p>
          <p className="text-blue-100 text-xs">{user?.email}</p>
        </div>
        <button
          onClick={() => logout()}
          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
```

**Resultado:** ✅ Navbar única. User info e logout centralizados em DashboardNavbar. Dashboard sem duplicação.

---

## TASK-064: Create Perfil Page

**Objetivo:** Página para usuário editar perfil (nome, assistente preferido, timezone, whatsapp).

### Arquivos Criados

#### `src/app/perfil/layout.tsx` — Layout compartilhado
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Perfil — Mentor24h',
  description: 'Edite seu perfil e preferências',
};

export default function PerfilLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardNavbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}
```

#### `src/app/perfil/page.tsx` — Página servidor
```tsx
import { ProfileForm } from '@/components/profile/ProfileForm';

export const metadata = {
  title: 'Perfil | Mentor24h',
};

export default function PerfilPageRoute() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Perfil</h1>
      <p className="text-gray-400 mb-8">Gerencie suas informações pessoais</p>
      <ProfileForm />
    </main>
  );
}
```

#### `src/components/profile/ProfileForm.tsx` — Formulário cliente
**Features:**
- React Hook Form + Zod schema para validação
- Campos: name, preferredAssistant, timezone, whatsappNumber
- useAuth hook para pré-popular com dados do usuário
- PATCH /api/auth/profile com Bearer token
- Alert success/error feedback
- Loading state no botão submit

**Schema:**
```typescript
const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  preferredAssistant: z.enum(['Mateus', 'Ana', 'Carlos', 'Juliana', 'Roberto', 'Fernanda']),
  timezone: z.enum(['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Belem', 'America/Recife']),
  whatsappNumber: z.string().optional(),
});
```

#### `src/app/api/auth/profile/route.ts` — API PATCH
```typescript
export async function PATCH(request: NextRequest) {
  // 1. Extrair token do header Authorization
  // 2. Validar com getUserFromToken()
  // 3. Parsear body com updateProfileSchema
  // 4. Chamar updateProfile() do auth.service
  // 5. Retornar user atualizado ou erro
}
```

**Resultado:** ✅ Perfil page funcional. Usuário consegue editar nome, assistente, timezone, whatsapp.

---

## TASK-065: Create Configuracoes Page

**Objetivo:** Página de configurações com 4 seções:
1. Notificações (toggles)
2. Conta (alterar senha, exportar dados)
3. LGPD (consentimento, políticas)
4. Zona de Perigo (logout, deletar conta)

### Arquivos Criados

#### `src/app/configuracoes/layout.tsx` — Layout
Padrão idêntico ao perfil: ProtectedRoute + DashboardNavbar + gradient.

#### `src/app/configuracoes/page.tsx` — Página servidor
```tsx
import { SettingsPage } from '@/components/settings/SettingsPage';

export const metadata = {
  title: 'Configurações | Mentor24h',
};

export default function ConfiguracoesPageRoute() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
      <p className="text-gray-400 mb-8">Gerencie suas preferências e segurança da conta</p>
      <SettingsPage />
    </main>
  );
}
```

#### `src/components/settings/SettingsPage.tsx` — Componente cliente

**Seção 1 — Notificações** (UI-only, estado local):
- 3 toggles: resumos semanais, alertas bem-estar, novidades do produto
- Styling: slate-800/50, border slate-700

**Seção 2 — Conta:**
- Link "Alterar senha" → `/auth/reset`
- Botão "Exportar dados" → placeholder "Em breve"
- Layout: cards com `href=` ou `onClick={}`

**Seção 3 — LGPD** (info apenas):
- Exibe `user.consentDate` formatada com `.toLocaleDateString('pt-BR')`
- Links: Política de Privacidade, Termos de Uso
- Styling: blue-500/10 border, blue-300 text

**Seção 4 — Zona de Perigo** (red theme):
- Botão "Fazer logout" → chama `logout()`
- Botão "Deletar conta" → abre modal de confirmação

**Delete Account Modal:**
```tsx
{showDeleteModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border border-red-500">
      <h3 className="text-xl font-bold text-red-400">⚠️ Deletar conta</h3>
      <p className="text-gray-300">Ação é permanente e irreversível. Todos os dados removidos.</p>
      
      <input 
        type="email"
        placeholder={user?.email}
        value={deleteEmail}
        onChange={(e) => setDeleteEmail(e.target.value)}
      />
      
      <div className="flex gap-3">
        <button onClick={() => setShowDeleteModal(false)}>Cancelar</button>
        <button 
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deletando...' : 'Deletar'}
        </button>
      </div>
    </div>
  </div>
)}
```

**Delete Flow:**
1. Modal pede confirmação com input de email
2. Usuário digita email exato
3. Submit faz DELETE /api/auth/account com Bearer token
4. Se sucesso: `localStorage.removeItem('auth_token')` + `window.location.href = '/'`
5. Se erro: exibe Alert

#### `src/app/api/auth/account/route.ts` — API DELETE
```typescript
export async function DELETE(request: NextRequest) {
  // 1. Extrair token do header
  // 2. Validar com getUserFromToken()
  // 3. Chamar deleteAccount(user.supabaseId) do auth.service
  // 4. Retornar { success: true, message: 'Account deleted' }
}
```

**Resultado:** ✅ Configuracoes page funcional. Usuário consegue logout, deletar conta, ver consentimento LGPD.

---

## Arquivos Resumo

### Modificados (6)
- `src/components/auth/LoginForm.tsx` — Alert prop fix (1 line)
- `src/components/auth/ResetForm.tsx` — Alert prop fix (3 lines)
- `src/components/auth/UpdatePasswordForm.tsx` — Alert prop fix (5 lines)
- `src/middleware.ts` — getSession → getUser + /auth/reset público (10 lines)
- `src/app/dashboard/page.tsx` — Remove header duplicado (25 lines)
- `src/components/DashboardNavbar.tsx` — Add user info + logout (15 lines)

### Criados (8)
- `src/app/perfil/layout.tsx` (19 lines)
- `src/app/perfil/page.tsx` (15 lines)
- `src/components/profile/ProfileForm.tsx` (223 lines)
- `src/app/api/auth/profile/route.ts` (69 lines)
- `src/app/configuracoes/layout.tsx` (19 lines)
- `src/app/configuracoes/page.tsx` (15 lines)
- `src/components/settings/SettingsPage.tsx` (192 lines)
- `src/app/api/auth/account/route.ts` (43 lines)

**Total:** 14 arquivos | 623 linhas adicionadas

---

## Verificação ✅

- [x] Middleware valida com Supabase server (getUser)
- [x] /auth/reset é rota pública
- [x] /dashboard sem header duplicado
- [x] DashboardNavbar exibe nome + email + logout
- [x] /perfil logado carrega ProfileForm
- [x] ProfileForm pré-popula com dados do usuário
- [x] PATCH /api/auth/profile funciona
- [x] /configuracoes logado carrega SettingsPage
- [x] SettingsPage tem 4 seções (Notificações, Conta, LGPD, Zona de Perigo)
- [x] Delete account modal pede email confirmation
- [x] DELETE /api/auth/account funciona
- [x] Logout via DashboardNavbar funciona
- [x] TypeScript sem erros de sintaxe (avisos de tipos das deps ignorados)
- [x] Git commit realizado com mensagem descritiva

---

## Próximos Passos

**Sprint 3, Bloco 3:** Integração WhatsApp + Testes End-to-End  
- Conexão Twilio
- Message Service  
- Crisis Detection  
- Webhook handler

**Roadmap Sprint 3:**
- ✅ BLOCO 1 (TASK-056-060): Auth System → 100%
- ✅ BLOCO 2 (TASK-061-065): Perfil + Configuracoes + Fixes → 100%
- ⏳ BLOCO 3 (TASK-066-070): WhatsApp Integration → Próximo

---

## Commits

```
c0399fc - feat(bloco-2): Complete Perfil and Configuracoes pages + bug fixes
  - TASK-061: Fix Alert component prop
  - TASK-062: Fix middleware security
  - TASK-063: Fix dashboard duplication
  - TASK-064: Create Perfil page
  - TASK-065: Create Configuracoes page
```

---

**Documentação criada em:** 2026-05-02  
**Por:** Claude Haiku 4.5  
**Para:** Leonardo (leosilvabh77@gmail.com)
