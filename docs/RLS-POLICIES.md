# 🔒 RLS Policies — Row Level Security para LGPD

**Status:** ✅ Implementado em `0001_initial_schema.sql`  
**Compliance:** LGPD + WCAG + Data Privacy

---

## 🎯 O que é RLS?

Row Level Security (RLS) garante que **usuários só vejam seus próprios dados**, mesmo que contrariem o SQL.

**Sem RLS:**
```sql
SELECT * FROM messages; -- Retorna TODAS as mensagens (bug de segurança!)
```

**Com RLS:**
```sql
SELECT * FROM messages; -- Retorna APENAS as mensagens do usuário autenticado
```

---

## 📋 Policies Implementadas

### 1. **users** table

```sql
-- POLICY 1: SELECT
CREATE POLICY users_rls_select ON users FOR SELECT
  USING (auth.uid()::text = supabase_id);
```
**Significado:** Usuário vê apenas sua própria linha de usuário

```sql
-- POLICY 2: UPDATE
CREATE POLICY users_rls_update ON users FOR UPDATE
  USING (auth.uid()::text = supabase_id)
  WITH CHECK (auth.uid()::text = supabase_id);
```
**Significado:** Usuário atualiza apenas seus dados

```sql
-- POLICY 3: DELETE (soft delete)
CREATE POLICY users_rls_delete ON users FOR DELETE
  USING (auth.uid()::text = supabase_id);
```
**Significado:** Usuário marca seus dados como deletados (soft delete)

---

### 2. **messages** table

```sql
-- POLICY 1: SELECT
CREATE POLICY messages_rls_select ON messages FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
```
**Significado:** Usuário vê apenas suas mensagens

```sql
-- POLICY 2: INSERT
CREATE POLICY messages_rls_insert ON messages FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
```
**Significado:** Usuário insere apenas suas próprias mensagens

---

### 3. **user_categories** table

```sql
-- POLICY: ALL (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY user_categories_rls ON user_categories FOR ALL
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
```
**Significado:** Usuário controla completamente suas categorias selecionadas

---

### 4. **routines** table

```sql
-- POLICY: ALL
CREATE POLICY routines_rls ON routines FOR ALL
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
```
**Significado:** Usuário vê e gerencia apenas suas rotinas

---

### 5. **crisis_audit_log** table

```sql
-- POLICY: SELECT (read-only para usuário)
CREATE POLICY crisis_audit_log_rls ON crisis_audit_log FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
```
**Significado:** Usuário vê apenas seu próprio audit log (não pode deletar ou editar)

---

## 🔑 Exceções: Admin & Service Role

**Service Role Key** (backend) pode fazer TUDO (contorna RLS):
```javascript
// Backend (Node.js com service role key)
const supabase = createClient(url, serviceRoleKey);
const allMessages = await supabase
  .from('messages')
  .select('*'); // Retorna TODAS as mensagens
```

**Use case:** Analytics, admin dashboard, automations (Inngest jobs)

**Regra:** Nunca expor a service role key no frontend!

---

## 🧪 Como Testar RLS

### Teste 1: Verificar se RLS está ativado

```bash
psql $DATABASE_URL -c "\d messages"
```

Você deve ver:
```
Access method: heap
Row security: ENABLED
Policies: (...)
```

### Teste 2: Testar como usuário normal

```javascript
// Frontend (com anon key)
const supabase = createClient(url, anonKey);
const { data, error } = await supabase
  .from('messages')
  .select('*');
  
// Retorna APENAS as mensagens do usuário autenticado
console.log(data); // [ { id: 1, user_id: 123, ... }, ... ]
```

### Teste 3: Tentar burlar RLS (deve falhar)

```javascript
// Tentar inserir com user_id diferente
const { error } = await supabase
  .from('messages')
  .insert([
    {
      user_id: 999, // Outro usuário!
      content: 'Hack!',
      whatsapp_message_id: 'test'
    }
  ]);

// Erro: "new row violates row-level security policy"
console.log(error.message);
```

---

## 🛡️ Segurança em Camadas

| Camada | Proteção | Implementação |
|--------|----------|---------------|
| 1. SQL | RLS Force | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| 2. SQL | HTTPS Only | Supabase força HTTPS |
| 3. Auth | JWT Validation | Supabase valida token |
| 4. API | CORS | Next.js `/api` rejeita origem inválida |
| 5. Backend | Service Role | Admin operations via Node.js |
| 6. Client | Type Safety | TypeScript impede erros |

---

## 🚨 Problemas Comuns

### "Erro: new row violates row-level security policy"

**Causa:** Tentando inserir com `user_id` de outro usuário  
**Solução:**
```javascript
// ❌ Errado
await supabase.from('messages').insert({
  user_id: 999, // Outro usuário
  content: 'test'
});

// ✅ Correto
const user = await supabase.auth.getUser();
await supabase.from('messages').insert({
  user_id: user.id, // Seu próprio ID
  content: 'test'
});
```

### "Erro: permission denied for schema public"

**Causa:** Usuário não autenticado tentando acessar dados  
**Solução:** Fazer login primeiro
```javascript
// ❌ Errado
const supabase = createClient(url, anonKey);
const data = await supabase.from('messages').select('*'); // Sem auth

// ✅ Correto
await supabase.auth.signInWithPassword({ email, password });
const data = await supabase.from('messages').select('*'); // Com auth
```

### "SELECT retorna vazio mesmo tendo dados"

**Causa:** RLS está funcionando (filtrando para o usuário atual)  
**Solução:** Verifique que está logado com a conta certa
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Logged in as:', user.email); // Qual usuário?

// Se vazio, é porque este usuário não tem dados ainda
```

---

## 🔄 Soft Delete com RLS

Quando `deleted_at` é setado, a linha é ocultada logicamente mas não deletada:

```javascript
// Deletar (soft delete)
await supabase
  .from('users')
  .update({ deleted_at: new Date() })
  .eq('id', userId);

// Posterior: não aparece mais
const { data } = await supabase.from('users').select('*');
console.log(data); // Não mostra o usuário deletado
```

**Vantagem:** Recuperação de dados (LGPD right to restoration)

---

## 📊 Monitoramento RLS

### Via Supabase Dashboard

1. Vá em: **Authentication → Policies**
2. Você verá todas as RLS policies e seu status
3. Clique em uma para ver a SQL

### Via Logs

```bash
# Ver tentativas falhadas de RLS
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements WHERE query LIKE '%violates%';"
```

---

## ✅ Checklist RLS

- [ ] RLS está ENABLED em todas as 5 tabelas sensíveis
- [ ] Nenhuma tabela tem policies abertas (sem `USING` true)
- [ ] Service role key está em variáveis de ambiente (nunca no frontend)
- [ ] Testes de segurança passam (não conseguir acessar dados de outros)
- [ ] Soft delete funciona (deletar = atualizar `deleted_at`)
- [ ] Audit log é append-only (não pode deletar/editar)

---

## 🎯 LGPD Compliance via RLS

| Artigo LGPD | Requisito | Implementação RLS |
|-------------|-----------|-------------------|
| Art. 1 | Proteção de dados pessoais | RLS isola dados por usuário |
| Art. 6 | Consentimento | `consent_given` + `consent_date` |
| Art. 17 | Direito de acesso | `SELECT` policy mostra só seus dados |
| Art. 18 | Direito de correção | `UPDATE` policy permite atualizar |
| Art. 19 | Direito de exclusão | `deleted_at` soft delete (recuperável) |
| Art. 13 | Transparência | `audit_log` imutável rastreia tudo |

---

## 🚀 Próximas Steps

1. **TASK-004:** Deploy migrations e testar RLS ✅
2. **TASK-005:** Auth Controller (login/register/JWT)
3. **TASK-006-007:** Frontend (Login page + Register page)

---

**Criado por:** TASK-004  
**Próxima task:** TASK-005 — Auth Controller
