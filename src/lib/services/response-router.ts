import { z } from 'zod';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'none';
export type ResponseType = 'audio' | 'text' | 'media';

export interface EmergencyResource {
  name: string;
  phone?: string;
  url?: string;
  available: string;
  description?: string;
}

export interface CrisisResponse {
  severity: SeverityLevel;
  message: string;
  responseType: ResponseType;
  audioUrl?: string;
  resources: EmergencyResource[];
  escalationRequired: boolean;
  escalationReason?: string;
  humanSupportNeeded: boolean;
}

const emergencyResources: Record<SeverityLevel, EmergencyResource[]> = {
  critical: [
    {
      name: 'CVV (Centro de Valorização da Vida)',
      phone: '188',
      available: '24/7',
      description: 'Prevenção ao suicídio - Ligação gratuita',
    },
    {
      name: 'SAMU (Ambulância)',
      phone: '192',
      available: '24/7',
      description: 'Serviço de emergência médica',
    },
    {
      name: 'Polícia Militar',
      phone: '190',
      available: '24/7',
      description: 'Para situações de risco imediato',
    },
  ],
  high: [
    {
      name: 'CVV (Centro de Valorização da Vida)',
      phone: '188',
      available: '24/7',
      description: 'Atendimento humanizado - Ligação gratuita',
    },
    {
      name: 'UPA (Unidade de Pronto Atendimento)',
      available: '24/7',
      description: 'Atendimento em saúde mental emergencial',
    },
  ],
  medium: [
    {
      name: 'Posto de Saúde Local',
      available: 'Dias úteis 7:00-17:00',
      description: 'Consulta com psicólogo ou assistente social',
    },
    {
      name: 'CVV',
      phone: '188',
      available: '24/7',
      description: 'Conversas de apoio emocional',
    },
  ],
  none: [],
};

const responseTemplates: Record<SeverityLevel, { message: string; audioUrl: string; responseType: ResponseType }> = {
  critical: {
    message:
      'Percebi que você pode estar em perigo imediato. Sua vida tem valor. \n\n' +
      '🚨 SE ESTÁ PENSANDO EM SE MACHUCAR AGORA:\n' +
      '📞 Ligue para CVV: 188 (gratuito, 24h)\n' +
      '📞 Ligue para SAMU: 192\n\n' +
      'Você não está sozinho. Existem pessoas querendo ajudar AGORA. ' +
      'Quer conversar comigo enquanto aguarda a ambulância?',
    audioUrl: 'https://mentor24h-assets.s3.amazonaws.com/audio/crisis-critical.mp3',
    responseType: 'audio',
  },
  high: {
    message:
      'Percebi que você está enfrentando um momento muito difícil. Não está sozinho.\n\n' +
      '❤️ Você merece apoio profissional.\n' +
      '📞 CVV: 188 (conversas de apoio)\n' +
      '🏥 UPA: Atendimento em saúde mental 24h\n\n' +
      'Posso ajudá-lo agora? Quer falar sobre o que está sentindo?',
    audioUrl: 'https://mentor24h-assets.s3.amazonaws.com/audio/crisis-high.mp3',
    responseType: 'audio',
  },
  medium: {
    message:
      'Vejo que você está passando por desafios. Estou aqui para ouvir e ajudar no que posso.\n\n' +
      '💚 Suas emoções são válidas.\n' +
      '📞 Considere conversar com um profissional (psicólogo, posto de saúde).\n\n' +
      'Como posso apoiá-lo agora? Quer conversar?',
    audioUrl: 'https://mentor24h-assets.s3.amazonaws.com/audio/crisis-medium.mp3',
    responseType: 'text',
  },
  none: {
    message: 'Ótimo! Estou aqui para ajudar com organização, inspiração e bem-estar. 😊',
    audioUrl: '',
    responseType: 'text',
  },
};

const responseValidationSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'none']),
  message: z.string().min(10),
  responseType: z.enum(['audio', 'text', 'media']),
  resources: z.array(
    z.object({
      name: z.string(),
      phone: z.string().optional(),
      url: z.string().optional(),
      available: z.string(),
      description: z.string().optional(),
    })
  ),
  escalationRequired: z.boolean(),
  humanSupportNeeded: z.boolean(),
});

class ResponseRouter {
  /**
   * Retorna resposta pré-gravada baseada em severidade
   * Lookup puro, zero latência (sem I/O, sem IA)
   */
  getResponse(severity: number | SeverityLevel): CrisisResponse {
    const level = this.normalizeSeverity(severity);

    const template = responseTemplates[level];
    const resources = emergencyResources[level];

    const response: CrisisResponse = {
      severity: level,
      message: template.message,
      responseType: template.responseType,
      audioUrl: template.audioUrl || undefined,
      resources,
      escalationRequired: level === 'critical' || level === 'high',
      escalationReason:
        level === 'critical'
          ? 'Risco imediato de automutilação/suicídio. Requer intervenção emergencial.'
          : level === 'high'
            ? 'Alto risco de crise. Requer atendimento de saúde mental.'
            : undefined,
      humanSupportNeeded: level === 'critical' || level === 'high',
    };

    // Validar resposta
    const validated = responseValidationSchema.safeParse(response);
    if (!validated.success) {
      console.error('[ResponseRouter] Validação falhou:', validated.error);
      throw new Error('Resposta inválida gerada');
    }

    return response;
  }

  /**
   * Normaliza severity (número ou string) para SeverityLevel
   */
  private normalizeSeverity(severity: number | SeverityLevel): SeverityLevel {
    if (typeof severity === 'string') {
      return severity;
    }

    if (severity >= 9) return 'critical';
    if (severity >= 7) return 'high';
    if (severity > 0) return 'medium';
    return 'none';
  }

  /**
   * Retorna só a mensagem (para templates simples)
   */
  getMessage(severity: number | SeverityLevel): string {
    const level = this.normalizeSeverity(severity);
    return responseTemplates[level].message;
  }

  /**
   * Retorna só os recursos (para links em footer)
   */
  getResources(severity: number | SeverityLevel): EmergencyResource[] {
    const level = this.normalizeSeverity(severity);
    return emergencyResources[level];
  }

  /**
   * Retorna só a URL do áudio
   */
  getAudioUrl(severity: number | SeverityLevel): string | undefined {
    const level = this.normalizeSeverity(severity);
    const url = responseTemplates[level].audioUrl;
    return url || undefined;
  }

  /**
   * Verifica se requer escalação para humano
   */
  requiresEscalation(severity: number | SeverityLevel): boolean {
    const level = this.normalizeSeverity(severity);
    return level === 'critical' || level === 'high';
  }

  /**
   * Verifica se requer resposta imediata (< 30 segundos)
   */
  isUrgent(severity: number | SeverityLevel): boolean {
    const level = this.normalizeSeverity(severity);
    return level === 'critical';
  }

  /**
   * Retorna recomendação de tipo de resposta (audio vs text)
   */
  recommendedResponseType(severity: number | SeverityLevel): ResponseType {
    const level = this.normalizeSeverity(severity);
    return responseTemplates[level].responseType;
  }

  static getInstance(): ResponseRouter {
    return new ResponseRouter();
  }
}

export const responseRouter = ResponseRouter.getInstance();
export { ResponseRouter };
