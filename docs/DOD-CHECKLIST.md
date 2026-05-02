# ✅ Definition of Done — Mentor24h

**Versão:** 1.0  
**Data:** 2026-05-01  
**Aplicável a:** Todas as tasks

---

## 🎯 Critérios Universais de DoD

Toda task é considerada **CONCLUÍDA** apenas quando atender **100% destes critérios**:

### 1. Implementação ✅
- [ ] Código implementado conforme SPEC
- [ ] Arquivo(s) criado(s) no local correto
- [ ] Imports/exports funcionam sem erros
- [ ] Sem console.log(), debugger ou código temporário
- [ ] Sem comentários que explicam obviedades

### 2. Type Safety ✅
- [ ] TypeScript compila sem erros (`tsc --noEmit`)
- [ ] Tipos explícitos em funções e variáveis
- [ ] Sem uso de `any` sem justificativa
- [ ] Path aliases (`@/*`) usados corretamente

### 3. Padrões e Convenções ✅
- [ ] Segue padrão de pastas do projeto
- [ ] Nomenclatura consistente (camelCase para vars, PascalCase para componentes)
- [ ] Componentes React são `'use client'` se precisarem de hooks
- [ ] Função/componente tem propósito único

### 4. Testes ✅
- [ ] Se não há testes: Sprint 1-2 (implementar em Sprint 3+)
- [ ] Se há testes: 80%+ cobertura mínima
- [ ] Testes cobrem happy path + edge cases
- [ ] `npm test` passa sem erros

### 5. Documentação ✅
- [ ] Função/componente tem jsdoc se complexo
- [ ] Arquivo README se módulo novo
- [ ] Exemplo de uso se componente reutilizável
- [ ] CLAUDE.md atualizado se mudou estrutura
- [ ] Requisitos especiais documentados

### 6. Formatação e Style ✅
- [ ] ESLint sem warnings (`npm run lint`)
- [ ] Prettier formatado (ou manual: 2 espaços, max-width)
- [ ] Sem linhas com >100 caracteres
- [ ] CSS segue Tailwind (sem CSS custom neste projeto)

### 7. Performance ✅
- [ ] Sem re-renders desnecessários (React)
- [ ] Sem memory leaks (useEffect cleanup)
- [ ] Sem N+1 queries (ORM usado corretamente)
- [ ] Bundle size dentro do esperado

### 8. Segurança ✅
- [ ] Nenhum secret hardcoded (.env usado)
- [ ] Inputs validados com Zod
- [ ] XSS prevenido (React auto-escapa)
- [ ] CSRF tokens se POST/PUT/DELETE externo
- [ ] SQL injection prevenido (Drizzle ORM)

### 9. Responsividade ✅
- [ ] Funciona em mobile (< 768px)
- [ ] Funciona em tablet (768-1024px)
- [ ] Funciona em desktop (> 1024px)
- [ ] Sem horizontal scroll em mobile

### 10. Git History ✅
- [ ] Commit message semântico (feat:, fix:, docs:, etc)
- [ ] Commit não mistura funcionalidades
- [ ] Branch limpo (sem merge commits desnecessários)
- [ ] Nenhum arquivo sensível commitado (.env, node_modules)

### 11. Leis da CONSTITUTION ✅
- [ ] Nenhuma lei violada (especialmente LEI #1, #3, #5)
- [ ] Conformidade LGPD se dados pessoais
- [ ] Padrão 90/10 (patterns antes de IA)
- [ ] Autenticação se rota sensível

### 12. Aprovação ✅
- [ ] Code review passou (se team)
- [ ] Requisitante / PM aprovou
- [ ] Nenhum bloqueador técnico

---

## 🎓 Exemplos por Tipo de Task

### Task: Criar Componente React
```
✅ DoD Específico:
- [ ] Component aceita props tipadas
- [ ] Renderiza sem erros
- [ ] Exportado em components/index.ts
- [ ] Storybook (se UI component crítico)
- [ ] Accessível (alt text, aria-labels, keyboard)
- [ ] Testes: snapshot + behavior
```

### Task: Implementar API Endpoint
```
✅ DoD Específico:
- [ ] Route handler em src/app/api/[route]/route.ts
- [ ] Request validado com Zod
- [ ] Response tipada
- [ ] Trata erros com status correto (400, 401, 404, 500)
- [ ] CORS configurado se cross-origin
- [ ] Autenticado se sensível
- [ ] Documentado em docs/API.md
- [ ] cURL test exemplo criado
```

### Task: Implementar Database Schema
```
✅ DoD Específico:
- [ ] Tabela criada em src/lib/db/schema.ts
- [ ] Tipos TypeScript inferidos de schema
- [ ] Índices criados para queries frequentes
- [ ] RLS policies se dados sensíveis
- [ ] Triggers para updated_at / soft delete
- [ ] Seed script criado
- [ ] Migration em src/lib/db/migrations/
- [ ] Documentado em docs/DATABASE-SCHEMA.md
```

---

## 📊 Matriz de Responsabilidade

| Task Type | Code Review | Tests | Docs | Accessibility |
|-----------|------------|-------|------|---------------|
| **Component** | Obrigatório | Sim | Sim | Sim |
| **API Endpoint** | Obrigatório | Sim | Sim | N/A |
| **Database** | Obrigatório | Sim | Sim | N/A |
| **Utility** | Obrigatório | Sim | Sim | N/A |
| **UI Page** | Obrigatório | Sim | Sim | Sim |
| **Middleware** | Obrigatório | Sim | Sim | N/A |

---

## 🔄 Processo de Validação

```
Dev termina task
    ↓
Executa DoD checklist (auto)
    ↓
Todos os ✅? 
    ├─ SIM → Task concluída
    └─ NÃO → Volta pro dev, corrige, repete
```

---

## ⚡ Quick DoD Check (2 minutos)

```bash
# 1. TypeScript
npm run build  # Compila?

# 2. Lint
npm run lint   # Sem warnings?

# 3. Tests
npm test       # Passam?

# 4. Documentação
grep -r "TODO\|FIXME" src/  # Nenhum TODO deixado?

# 5. Segurança
grep -r "process.env\." src/ | grep -v "NEXT_PUBLIC"  # Secrets hardcoded?
```

Se todos passarem → **Task é DONE** ✅

---

## 📝 Assinatura

**Standard aplicável a:** Sprint 1, 2, 3...  
**Versão:** 1.0  
**Próxima revisão:** Sprint 3 (adicionar testes)

