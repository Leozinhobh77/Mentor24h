import { Inngest } from 'inngest';

/**
 * Inngest Client Configuration
 * Handles async job queueing for WhatsApp message processing
 *
 * Events defined here flow through workflows (jobs)
 * Example: whatsapp.message.received → detectCrisis → sendResponse
 */

// Event schemas with strict typing (Inngest v4 compatible)
export const Events = {
  'whatsapp.message.received': {
    data: {
      userId: { type: 'number' } as const,
      whatsappMessageId: { type: 'string' } as const,
      fromNumber: { type: 'string' } as const,
      content: { type: 'string' } as const,
      mediaUrl: { type: 'string', nullable: true } as const,
      timestamp: { type: 'number' } as const,
    },
  },
  'crisis.detected': {
    data: {
      userId: { type: 'number' } as const,
      messageId: { type: 'number' } as const,
      severity: { type: 'number' } as const,
      keywords: { type: 'string[]' } as const,
      detectedAt: { type: 'string' } as const,
    },
  },
  'crisis.response.sent': {
    data: {
      userId: { type: 'number' } as const,
      messageId: { type: 'number' } as const,
      responseType: { type: 'string' } as const,
      sentAt: { type: 'string' } as const,
    },
  },
  'user.consent.given': {
    data: {
      userId: { type: 'number' } as const,
      consentType: { type: 'string' } as const,
      consentDate: { type: 'string' } as const,
      version: { type: 'number' } as const,
    },
  },
  'whatsapp.message.failed': {
    data: {
      userId: { type: 'number' } as const,
      whatsappMessageId: { type: 'string' } as const,
      fromNumber: { type: 'string' } as const,
      content: { type: 'string' } as const,
      errorMessage: { type: 'string' } as const,
      failedAt: { type: 'string' } as const,
      retryCount: { type: 'number' } as const,
    },
  },
} as const;

/**
 * Initialize Inngest client
 * Connects to Inngest cloud or self-hosted instance
 */
export const inngest = new Inngest({
  id: 'mentor24h',
  events: Events,
  apiBaseUrl: process.env.INNGEST_API_BASE_URL || 'https://inn.inngest.com',
  apiKey: process.env.INNGEST_API_KEY,
  isDev: process.env.NODE_ENV === 'development',
});

/**
 * Event type exports for use in application
 */

export type WhatsappMessageReceivedEvent = {
  name: 'whatsapp.message.received';
  data: {
    userId: number;
    whatsappMessageId: string;
    fromNumber: string;
    content: string;
    mediaUrl: string | null;
    timestamp: number;
  };
};

export type CrisisDetectedEvent = {
  name: 'crisis.detected';
  data: {
    userId: number;
    messageId: number;
    severity: number;
    keywords: string[];
    detectedAt: string;
  };
};

export type CrisisResponseSentEvent = {
  name: 'crisis.response.sent';
  data: {
    userId: number;
    messageId: number;
    responseType: 'audio' | 'text' | 'media';
    sentAt: string;
  };
};

export type UserConsentGivenEvent = {
  name: 'user.consent.given';
  data: {
    userId: number;
    consentType: 'marketing' | 'data_processing' | 'health_data';
    consentDate: string;
    version: number;
  };
};

export type WhatsappMessageFailedEvent = {
  name: 'whatsapp.message.failed';
  data: {
    userId: number;
    whatsappMessageId: string;
    fromNumber: string;
    content: string;
    errorMessage: string;
    failedAt: string;
    retryCount: number;
  };
};

/**
 * Helper to send WhatsApp message received event
 */
export async function sendWhatsappMessageReceivedEvent(
  data: WhatsappMessageReceivedEvent['data']
): Promise<{ ids: string[] } | null> {
  try {
    const result = await inngest.send({
      name: 'whatsapp.message.received',
      data,
    });

    console.log('[INNGEST] Event queued:', {
      eventName: 'whatsapp.message.received',
      messageId: data.whatsappMessageId,
      userId: data.userId,
    });

    return result;
  } catch (error) {
    console.error('[INNGEST] Failed to queue event:', error);
    throw new Error('Failed to queue message processing');
  }
}

/**
 * Helper to send crisis detected event
 */
export async function sendCrisisDetectedEvent(
  data: CrisisDetectedEvent['data']
): Promise<{ ids: string[] } | null> {
  try {
    const result = await inngest.send({
      name: 'crisis.detected',
      data,
    });

    console.log('[INNGEST] Crisis event queued:', {
      eventName: 'crisis.detected',
      messageId: data.messageId,
      severity: data.severity,
    });

    return result;
  } catch (error) {
    console.error('[INNGEST] Failed to queue crisis event:', error);
    throw new Error('Failed to queue crisis response');
  }
}

/**
 * Helper to send crisis response sent event
 */
export async function sendCrisisResponseSentEvent(
  data: CrisisResponseSentEvent['data']
): Promise<{ ids: string[] } | null> {
  try {
    const result = await inngest.send({
      name: 'crisis.response.sent',
      data,
    });

    return result;
  } catch (error) {
    console.error('[INNGEST] Failed to send response event:', error);
    throw new Error('Failed to log response delivery');
  }
}

/**
 * Helper to send user consent given event
 */
export async function sendUserConsentGivenEvent(
  data: UserConsentGivenEvent['data']
): Promise<{ ids: string[] } | null> {
  try {
    const result = await inngest.send({
      name: 'user.consent.given',
      data,
    });

    return result;
  } catch (error) {
    console.error('[INNGEST] Failed to send consent event:', error);
    throw new Error('Failed to log user consent');
  }
}

/**
 * Helper to send WhatsApp message failed event (dead letter queue)
 */
export async function sendWhatsappMessageFailedEvent(
  data: WhatsappMessageFailedEvent['data']
): Promise<{ ids: string[] } | null> {
  try {
    const result = await inngest.send({
      name: 'whatsapp.message.failed',
      data,
    });

    console.log('[INNGEST] Failed message event queued:', {
      eventName: 'whatsapp.message.failed',
      messageId: data.whatsappMessageId,
      userId: data.userId,
      errorMessage: data.errorMessage,
    });

    return result;
  } catch (error) {
    console.error('[INNGEST] Failed to queue message failed event:', error);
    throw new Error('Failed to queue message failure handling');
  }
}

export default inngest;
