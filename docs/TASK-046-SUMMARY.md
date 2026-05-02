# ✅ TASK-046 — Tabela `audios` + Seeds [COMPLETO]

**Task:** Tabela `audios` + 92 áudios profissionais  
**Bloco:** BLOCO 6 — Data & Seeds  
**Complexidade:** 🟡 Média  
**Status:** ✅ PRONTO PARA USAR  

---

## 🎯 Objetivo

Schema de áudios profissionais + seed com 92 arquivos:
- Meditações, respirações, técnicas, motivações
- Categorias: meditation, breathing, motivation, prayer
- URLs públicas (Supabase storage)
- Transcrições para acessibilidade

---

## 📦 Arquivos

### Schema (Migration SQL)
```sql
CREATE TABLE audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  duration_seconds INT,
  url_storage VARCHAR(500),
  transcription TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audios_category ON audios(category);
```

### Seed Data (Mock - 92 áudios)
```
Exemplo:
{
  "title": "Meditação Matinal - 10 min",
  "category": "meditation",
  "duration_seconds": 600,
  "url": "https://storage.supabase.co/.../audio-001.mp3",
  "transcription": "[intro suave] Vamos começar a meditação..."
}
```

---

## 📊 Categorias

| Categoria | Áudios | Exemplos |
|-----------|--------|----------|
| **meditation** | 25 | Meditação 5min, 10min, 20min, Chakra, Sono |
| **breathing** | 20 | Respiração 4-7-8, Box breathing, Técnica diafragma |
| **motivation** | 25 | Sucesso, Foco, Confiança, Superação |
| **prayer** | 15 | Oração cristã, Mantra, Affirmations |
| **sleep** | 7 | Ninar adulto, ASMR, Sons naturais |

**Total: 92 áudios**

---

## ✅ DoD

- [x] Schema `audios` criado
- [x] Índice em `category`
- [x] 92 seeds definidos
- [x] URLs públicas (mock: https://...)
- [x] Transcrições preenchidas
- [x] Sem duplicatas
- [x] Migration testada

---

**Status:** ✅ CONCLUÍDA  
**Próximo:** TASK-047 (Categories)

---
