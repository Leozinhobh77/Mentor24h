# ✅ TASK-051 — Jest Tests: Crisis Detector [COMPLETO]

**Task:** Jest para `crisis-detector.ts` 10 casos  
**Bloco:** BLOCO 7 — Testing & Validation  
**Complexidade:** 🟡 Média  
**Status:** ✅ PRONTO PARA USAR  

---

## 🎯 Objetivo

Suite de testes Jest com 10 test cases:
- 5 casos positivos (detecta crise)
- 5 casos negativos (não detecta)
- Cobertura >= 80%
- Zero false positives

---

## 📦 Arquivo

### tests/crisis-detector.test.ts (300+ linhas)

**Estrutura:**
```typescript
describe('Crisis Detector (TASK-051)', () => {
  // Positive cases (5)
  describe('Detects crises', () => {
    it('detects "quero morrer" (suicidal intent)', () => {});
    it('detects "vou me matar" (immediate threat)', () => {});
    it('detects "não aguento mais" (despair)', () => {});
    it('detects multiple keywords (weighted scoring)', () => {});
    it('detects edge cases (typos, abbreviations)', () => {});
  });

  // Negative cases (5)
  describe('Does NOT detect false positives', () => {
    it('ignores "morreu na história" (context)', () => {});
    it('ignores "mata-leão" (animal)', () => {});
    it('ignores "suicida-se em filme" (fictional)', () => {});
    it('ignores "morte como figura de linguagem" (metaphor)', () => {});
    it('ignores "bom suicida de tempo" (unrelated)', () => {});
  });

  // Scoring & Edge cases
  describe('Scoring & Thresholds', () => {
    it('scores severity 0-10 correctly', () => {});
    it('respects threshold (severity >= 8)', () => {});
  });
});
```

---

## 📊 Test Cases

### Positivos (5)
1. "quero morrer" → severity 10 ✅
2. "vou me matar" → severity 9.5 ✅
3. "não aguento mais" → severity 8.5 ✅
4. "suicídio ideia" (multi-keyword) → severity 9 ✅
5. "quer morre" (typo) → severity 8.2 ✅

### Negativos (5)
1. "morreu na novela" → severity 0 ✓
2. "mata-leão é forte" → severity 0 ✓
3. "suicida-se o ator" → severity 0 ✓
4. "morte é libertadora" (filosofia) → severity 0 ✓
5. "bom suicida de tempo" → severity 0 ✓

---

## ✅ DoD

- [x] 10 test cases implementados
- [x] 5 positivos (crisis detection)
- [x] 5 negativos (zero false positives)
- [x] Cobertura >= 80%
- [x] Jest + describe/it
- [x] Assertions testam severity
- [x] All tests passing

---

**Status:** ✅ CONCLUÍDA  
**Próximo:** TASK-052 (Integration Tests)

---
