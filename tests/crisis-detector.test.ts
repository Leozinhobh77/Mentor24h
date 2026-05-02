import { CrisisDetector, DetectionResult } from '@/lib/services/crisis-detector';

describe('Crisis Detector', () => {
  let detector: CrisisDetector;

  beforeEach(() => {
    detector = new CrisisDetector();
  });

  describe('Positive Cases (Crisis Detected)', () => {
    it('should detect suicidal keywords', () => {
      const result = detector.detect('quero morrer, não aguento mais');
      expect(result.detected).toBe(true);
      expect(result.severity).toBeGreaterThan(0);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.recommendedResponse).toBe('critical');
      expect(result.keywords).toContain('quero morrer');
    });

    it('should detect self-harm keywords', () => {
      const result = detector.detect('me corto com lâmina todo dia');
      expect(result.detected).toBe(true);
      expect(result.severity).toBeGreaterThan(0);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.recommendedResponse).toMatch(/critical|high/);
      expect(result.keywords).toContain('me corto');
    });

    it('should detect overdose keywords', () => {
      const result = detector.detect('tomei overdose de remédios');
      expect(result.detected).toBe(true);
      expect(result.severity).toBeGreaterThan(0);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.recommendedResponse).toBe('critical');
      expect(result.keywords).toContain('overdose');
    });

    it('should detect violence keywords', () => {
      const result = detector.detect('sofro violência diariamente');
      expect(result.detected).toBe(true);
      expect(result.severity).toBeGreaterThan(0);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.recommendedResponse).toMatch(/high|medium/);
      expect(result.keywords).toContain('sofro violência');
    });

    it('should detect psychological crisis keywords', () => {
      const result = detector.detect('estou sem esperança e deprimido');
      expect(result.detected).toBe(true);
      expect(result.severity).toBeGreaterThan(0);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.recommendedResponse).toMatch(/medium|high/);
    });
  });

  describe('Negative Cases (No Crisis)', () => {
    it('should not flag normal messages', () => {
      const result = detector.detect('oi, como você está?');
      expect(result.detected).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.keywords.length).toBe(0);
      expect(result.recommendedResponse).toBe('none');
    });

    it('should not flag messages about movies/books with death themes', () => {
      const result = detector.detect('assisti um filme muito bom sobre morte');
      expect(result.detected).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.keywords.length).toBe(0);
      expect(result.recommendedResponse).toBe('none');
    });

    it('should not flag medical/pharmaceutical conversations', () => {
      const result = detector.detect('preciso comprar remédios para alergia na farmácia');
      expect(result.detected).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.keywords.length).toBe(0);
      expect(result.recommendedResponse).toBe('none');
    });

    it('should not flag sports/fighting context', () => {
      const result = detector.detect('adorei ver a luta, ele deu muitos socos');
      expect(result.detected).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.keywords.length).toBe(0);
      expect(result.recommendedResponse).toBe('none');
    });

    it('should not flag empty or whitespace messages', () => {
      const result = detector.detect('   ');
      expect(result.detected).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.keywords.length).toBe(0);
      expect(result.recommendedResponse).toBe('none');
    });
  });

  describe('Severity Levels', () => {
    it('should assign critical severity to high-risk keywords', () => {
      const result = detector.detect('vou me matar agora');
      expect(result.severity).toBeGreaterThanOrEqual(9);
      expect(result.recommendedResponse).toBe('critical');
    });

    it('should assign high severity to self-harm/violence', () => {
      const result = detector.detect('bate em mim todo dia');
      expect(result.severity).toBeGreaterThanOrEqual(7);
      expect(result.severity).toBeLessThan(9);
      expect(result.recommendedResponse).toMatch(/high|critical/);
    });

    it('should assign medium severity to distress', () => {
      const result = detector.detect('estou desesperado e sozinho');
      expect(result.severity).toBeGreaterThan(0);
      expect(result.severity).toBeLessThan(7);
      expect(result.recommendedResponse).toBe('medium');
    });
  });

  describe('Multiple Keywords Detection', () => {
    it('should detect multiple keywords in one message', () => {
      const result = detector.detect('quero morrer, vou me matar, não aguento mais');
      expect(result.keywords.length).toBeGreaterThan(1);
      expect(result.detected).toBe(true);
    });

    it('should handle repeated keywords gracefully', () => {
      const result = detector.detect('morte morte morte');
      expect(result.detected).toBe(true);
      expect(result.keywords).toContain('morte');
    });
  });

  describe('Text Normalization', () => {
    it('should handle uppercase text', () => {
      const result = detector.detect('QUERO MORRER');
      expect(result.detected).toBe(true);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should handle mixed case text', () => {
      const result = detector.detect('Vou Me Matar');
      expect(result.detected).toBe(true);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should handle accented characters', () => {
      const result = detector.detect('sofro violência');
      expect(result.detected).toBe(true);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should handle extra whitespace', () => {
      const result = detector.detect('  quero   morrer   ');
      expect(result.detected).toBe(true);
      expect(result.keywords.length).toBeGreaterThan(0);
    });
  });

  describe('Response Recommendations', () => {
    it('should recommend critical response for suicidal content', () => {
      const result = detector.detect('vou me matar');
      expect(result.recommendedResponse).toBe('critical');
    });

    it('should recommend high response for self-harm', () => {
      const result = detector.detect('me corto com faca');
      expect(result.recommendedResponse).toMatch(/high|critical/);
    });

    it('should recommend medium response for distress', () => {
      const result = detector.detect('estou desesperado');
      expect(result.recommendedResponse).toMatch(/medium|high/);
    });

    it('should recommend no response for normal text', () => {
      const result = detector.detect('tudo bem por aqui');
      expect(result.recommendedResponse).toBe('none');
    });
  });

  describe('Helper Methods', () => {
    it('should identify high-risk keywords', () => {
      const hasHighRisk = detector.hasHighRiskKeyword('vou me matar');
      expect(hasHighRisk).toBe(true);
    });

    it('should identify non-crisis text correctly', () => {
      const hasHighRisk = detector.hasHighRiskKeyword('olá, tudo bem?');
      expect(hasHighRisk).toBe(false);
    });

    it('should identify critical status', () => {
      const isCritical = detector.isCritical('quero morrer');
      expect(isCritical).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should not crash with empty string', () => {
      expect(() => {
        const result = detector.detect('');
        expect(result.detected).toBe(false);
      }).not.toThrow();
    });

    it('should handle very long messages', () => {
      const longMessage = 'teste '.repeat(1000) + 'quero morrer';
      expect(() => {
        const result = detector.detect(longMessage);
        expect(result.detected).toBe(true);
      }).not.toThrow();
    });

    it('should handle special characters', () => {
      const result = detector.detect('quero morrer!!! @#$%');
      expect(result.detected).toBe(true);
    });

    it('should handle unicode characters', () => {
      const result = detector.detect('😭 quero morrer 💔');
      expect(result.detected).toBe(true);
    });
  });

  describe('Zero False Positives Verification', () => {
    const safeMessages = [
      'meu filme favorito é sobre a morte',
      'comprei remédios na farmácia',
      'assisti uma luta de boxing',
      'bati na bola de futebol',
      'arranquei a erva daninha',
      'cortei a cenoura para a salada',
      'tomo cerveja nos finais de semana',
      'sou aficionado por drogas de farmácia',
      'passei álcool para limpar',
      'sofro de alergias sazonais',
      'o sangue é importante para saúde',
      'senti uma dor leve',
      'machucado no braço jogando',
      'faca de chef é importante na cozinha',
      'heroína é um nome de princesa',
    ];

    safeMessages.forEach((msg, idx) => {
      it(`should not flag safe message #${idx + 1}: "${msg.substring(0, 30)}..."`, () => {
        const result = detector.detect(msg);
        expect(result.detected).toBe(false);
        expect(result.severity).toBe(0);
        expect(result.keywords.length).toBe(0);
      });
    });
  });
});
