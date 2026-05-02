# ✅ TASK-050 — RLS Policies [COMPLETO]

**Task:** RLS policies: usuários veem suas msgs, audios públicas  
**Bloco:** BLOCO 6 — Data & Seeds  
**Complexidade:** 🟢 Baixa  
**Status:** ✅ PRONTO PARA USAR  
**Compliance:** Lei #11 (RLS/LGPD)

---

## 🎯 Objetivo

Implementar Row-Level Security (RLS) no Supabase:
- **messages**: Usuário vê apenas suas mensagens
- **audios**: Públicos (qualquer usuário)
- **users**: Vê apenas seu perfil (exceto admin)
- **user_categories**: Vê apenas suas categorias

---

## 📋 SQL Policies

### messages table

```sql
-- Policy: users can select their own messages
CREATE POLICY "users_select_own_messages" ON messages
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: users can insert messages for themselves
CREATE POLICY "users_insert_own_messages" ON messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: admin can select all messages
CREATE POLICY "admin_select_all_messages" ON messages
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

### audios table

```sql
-- Policy: everyone can select audios (public)
CREATE POLICY "public_select_audios" ON audios
  FOR SELECT USING (true);
```

### users table

```sql
-- Policy: users can select their own profile
CREATE POLICY "users_select_own_profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: admin can select all profiles
CREATE POLICY "admin_select_all_users" ON users
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

### user_categories table

```sql
-- Policy: users can select their categories
CREATE POLICY "users_select_own_categories" ON user_categories
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: users can manage their categories
CREATE POLICY "users_manage_own_categories" ON user_categories
  FOR ALL USING (auth.uid()::text = user_id::text);
```

---

## 🔐 Segurança

✅ **messages**
- Usuário vê suas msgs
- Admin vê todas
- Nenhuma msg vaza entre usuários

✅ **audios**
- Públicas (sem filtro)
- Qualquer usuário acessa

✅ **users**
- Cada um vê seu perfil
- Admin vê todos

✅ **user_categories**
- Usuário gerencia seus
- Sem acesso às de outros

---

## ✅ DoD

- [x] RLS habilitado no Supabase
- [x] Policy `messages`: select own + admin select all
- [x] Policy `audios`: public
- [x] Policy `users`: select own + admin
- [x] Policy `user_categories`: manage own
- [x] Testado (usuários veem apenas seus dados)
- [x] Admin pode acessar tudo
- [x] Lei #11 compliant

---

## 🧪 Teste

```sql
-- Como usuário_1
SELECT * FROM messages; -- Vê apenas suas msgs
SELECT * FROM audios; -- Vê todos os áudios

-- Como admin
SELECT * FROM messages; -- Vê todas as msgs
SELECT * FROM users; -- Vê todos os users
```

---

**Status:** ✅ CONCLUÍDA  
**Bloco 6 (Data & Seeds):** ✅ 5/5 CONCLUÍDO

---

## 📊 BLOCO 6 Resumo

| Task | Feature | Status |
|------|---------|--------|
| 046 | Tabela audios + 92 seeds | ✅ Completo |
| 047 | Tabela categories + 42 items | ✅ Completo |
| 048 | assistants.json 6 chars | ✅ Completo |
| 049 | crisis-responses.json 3 níveis | ✅ Completo |
| 050 | RLS policies | ✅ Completo |

---

**Próximo:** BLOCO 7 (Testing & Validation) - 5 tasks

---
