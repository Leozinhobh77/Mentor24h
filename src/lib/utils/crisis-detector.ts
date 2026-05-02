import { CRISIS_KEYWORDS, SEVERITY_THRESHOLDS, WHATSAPP_TEMPLATES } from './constants';
import type { CrisisDetectionResult } from './types';

/**
 * Pattern matching-based crisis detection
 * 90% approach - deterministic, fast, reliable
 * Never relies on AI for critical decisions
 */

const PATTERN_SCORES: Record<string, number> = {
  suicide: 10,
  selfHarm: 9,
  violence: 8,
  abuse: 8,
  drugs: 7,
  severeDistress: 6,
};

export function detectCrisis(messageContent: string): CrisisDetectionResult {
  const lowerContent = messageContent.toLowerCase();
  const detectedPatterns: Array<{ pattern: string; score: number }> = [];

  let maxScore = 0;

  // Pattern matching
  for (const [category, keywords] of Object.entries(CRISIS_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        const patternScore = PATTERN_SCORES[category] || 5;
        detectedPatterns.push({
          pattern: keyword,
          score: patternScore,
        });
        maxScore = Math.max(maxScore, patternScore);
      }
    }
  }

  // Calculate final score and severity
  const severity_score = Math.min(
    10,
    Math.max(maxScore, detectedPatterns.reduce((sum, p) => sum + p.score * 0.1, 0))
  );

  const isCrisis = severity_score >= SEVERITY_THRESHOLDS.high;

  const severity: 'low' | 'medium' | 'high' | 'critical' =
    severity_score < SEVERITY_THRESHOLDS.medium
      ? 'low'
      : severity_score < SEVERITY_THRESHOLDS.high
        ? 'medium'
        : severity_score < 9
          ? 'high'
          : 'critical';

  const confidence = Math.min(100, (severity_score / 10) * 100);
  const requiresHumanReview = severity_score >= SEVERITY_THRESHOLDS.high;

  return {
    isCrisis,
    severity,
    severity_score: Math.round(severity_score * 10) / 10,
    confidence: Math.round(confidence),
    detectedPatterns: detectedPatterns.map((p) => p.pattern),
    suggestedResponse: getSuggestedResponse(severity),
    requiresHumanReview,
  };
}

function getSuggestedResponse(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (severity) {
    case 'critical':
      return WHATSAPP_TEMPLATES.crisis_high;
    case 'high':
      return WHATSAPP_TEMPLATES.crisis_high;
    case 'medium':
      return WHATSAPP_TEMPLATES.crisis_moderate;
    case 'low':
    default:
      return WHATSAPP_TEMPLATES.defaultResponse;
  }
}

export function scoreSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const intersection = words1.filter((w) => words2.includes(w));
  const union = new Set([...words1, ...words2]).size;

  return union === 0 ? 0 : intersection.length / union;
}

/**
 * Detect emotional patterns for routine recommendations
 */
export function analyzeEmotionalPattern(messages: string[]): {
  dominantMood: string;
  stressLevel: number;
  engagementScore: number;
} {
  const moodKeywords: Record<string, string[]> = {
    anxious: ['ansiedade', 'ansioso', 'nervoso', 'medo', 'preocupa'],
    depressed: ['deprimido', 'depressão', 'triste', 'infeliz', 'sem esperança'],
    motivated: ['motivado', 'energizado', 'animado', 'entusiasmado', 'feliz'],
    stressed: ['estressado', 'cansado', 'esgotado', 'queimado', 'frustrado'],
    calm: ['calmo', 'tranquilo', 'relaxado', 'em paz', 'sereno'],
  };

  let moodScores: Record<string, number> = {};
  let totalWords = 0;

  for (const message of messages) {
    const lowerMessage = message.toLowerCase();
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      moodScores[mood] = moodScores[mood] || 0;
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          moodScores[mood]++;
          totalWords++;
        }
      }
    }
  }

  const dominantMood = Object.entries(moodScores).sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral';
  const stressLevel = Math.min(10, (moodScores.stressed || 0) + (moodScores.anxious || 0));
  const engagementScore = totalWords > 0 ? Math.min(100, (totalWords / messages.length) * 20) : 0;

  return {
    dominantMood,
    stressLevel,
    engagementScore: Math.round(engagementScore),
  };
}
