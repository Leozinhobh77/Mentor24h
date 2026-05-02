import crisisKeywordsData from '@/data/crisis-keywords.json';

export interface DetectionResult {
  detected: boolean;
  severity: number; // 0-10
  score: number; // score bruto
  keywords: string[]; // termos encontrados
  categories: string[]; // categorias afetadas
  recommendedResponse: 'critical' | 'high' | 'medium' | 'none';
}

interface KeywordEntry {
  category: string;
  severity: string;
  weight: number;
  terms: string[];
}

class CrisisDetector {
  private keywordsByCategory: Record<string, KeywordEntry>;
  private allTerms: Array<{ term: string; weight: number; category: string }>;

  constructor() {
    this.keywordsByCategory = crisisKeywordsData.keywords;
    this.allTerms = this.buildTermIndex();
  }

  private buildTermIndex(): Array<{ term: string; weight: number; category: string }> {
    const terms: Array<{ term: string; weight: number; category: string }> = [];

    Object.entries(this.keywordsByCategory).forEach(([_key, category]) => {
      category.terms.forEach((term) => {
        terms.push({
          term: term.toLowerCase(),
          weight: category.weight,
          category: category.category,
        });
      });
    });

    return terms.sort((a, b) => b.term.length - a.term.length);
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.replace(/[^\w]/g, ''));
  }

  detect(message: string): DetectionResult {
    if (!message || message.trim().length === 0) {
      return {
        detected: false,
        severity: 0,
        score: 0,
        keywords: [],
        categories: [],
        recommendedResponse: 'none',
      };
    }

    const normalizedMessage = this.normalizeText(message);
    const detectedKeywords = new Map<string, { weight: number; category: string }>();
    const detectedCategories = new Set<string>();

    for (const termObj of this.allTerms) {
      if (normalizedMessage.includes(termObj.term)) {
        const key = termObj.term;
        if (!detectedKeywords.has(key)) {
          detectedKeywords.set(key, {
            weight: termObj.weight,
            category: termObj.category,
          });
          detectedCategories.add(termObj.category);
        }
      }
    }

    const keywordsList = Array.from(detectedKeywords.keys());
    const detected = keywordsList.length > 0;

    let score = 0;
    if (detected) {
      const weights = Array.from(detectedKeywords.values()).map((v) => v.weight);
      const maxWeight = Math.max(...weights);
      const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
      score = Math.min(10, (maxWeight + averageWeight) / 2);
    }

    const severity = Math.round(score * 10) / 10;
    const categoriesList = Array.from(detectedCategories);

    let recommendedResponse: 'critical' | 'high' | 'medium' | 'none' = 'none';
    if (severity >= 9) recommendedResponse = 'critical';
    else if (severity >= 7) recommendedResponse = 'high';
    else if (severity > 0) recommendedResponse = 'medium';

    return {
      detected,
      severity,
      score,
      keywords: keywordsList,
      categories: categoriesList,
      recommendedResponse,
    };
  }

  hasHighRiskKeyword(message: string): boolean {
    const result = this.detect(message);
    return result.severity >= 9;
  }

  isCritical(message: string): boolean {
    return this.hasHighRiskKeyword(message);
  }

  static getInstance(): CrisisDetector {
    return new CrisisDetector();
  }
}

export const crisisDetector = CrisisDetector.getInstance();
export { CrisisDetector };
