/**
 * Shared test fixtures and mock data
 * Reutilizável em todos os testes
 */

// ─────────────────────────────────────────────────────────────
// User Fixtures
// ─────────────────────────────────────────────────────────────

export const mockUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: { name: 'Test User' },
};

export const mockDbUser = {
  id: 1,
  supabaseId: '123',
  email: 'test@example.com',
  name: 'Test User',
  whatsappNumber: '+5511999999999',
  whatsappVerified: true,
  isActive: true,
  deletedAt: null,
  consentGiven: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockAdminUser = {
  ...mockDbUser,
  id: 999,
  name: 'Admin User',
  email: 'admin@example.com',
  isAdmin: true,
};

// ─────────────────────────────────────────────────────────────
// Message Fixtures
// ─────────────────────────────────────────────────────────────

export const mockMessage = {
  id: 1,
  userId: 1,
  content: 'Olá, como estão?',
  whatsappMessageId: 'msg-456',
  fromNumber: '+5511999999999',
  timestamp: new Date('2026-05-01T10:00:00Z'),
  mediaUrl: null,
  createdAt: new Date('2026-05-01T10:00:00Z'),
};

export const mockCrisisMessage = {
  ...mockMessage,
  id: 2,
  content: 'Quero morrer',
  whatsappMessageId: 'msg-789',
};

export const mockMessageWithMedia = {
  ...mockMessage,
  id: 3,
  content: 'Foto do dia',
  mediaUrl: 'https://example.com/image.jpg',
};

// ─────────────────────────────────────────────────────────────
// Crisis Detection Fixtures
// ─────────────────────────────────────────────────────────────

export const mockCrisisDetection = {
  detected: true,
  severity: 'high',
  keywords: ['suicídio', 'morte'],
  confidence: 0.95,
};

export const mockCrisisDetectionCritical = {
  detected: true,
  severity: 'critical',
  keywords: ['quero morrer', 'vou me matar'],
  confidence: 0.99,
};

export const mockNonCrisisDetection = {
  detected: false,
  severity: null,
  keywords: [],
  confidence: 0,
};

// ─────────────────────────────────────────────────────────────
// Response Fixtures
// ─────────────────────────────────────────────────────────────

export const mockCrisisResponse = {
  response: 'Você não está sozinho. Procure ajuda profissional agora:',
  priority: 'high',
  contactInfo: 'CVV: 188 | Emergência: 192',
};

export const mockTemplateResponse = {
  response: 'Resposta padrão de bem-estar',
  priority: 'normal',
};

// ─────────────────────────────────────────────────────────────
// Routine Fixtures
// ─────────────────────────────────────────────────────────────

export const mockRoutineWeeklySummary = {
  id: 1,
  userId: 1,
  type: 'weekly-summary',
  name: 'Resumo Semanal',
  enabled: true,
  lastExecuted: new Date('2026-05-01T08:00:00Z'),
  nextExecution: new Date('2026-05-08T08:00:00Z'),
  lastResult: { usersProcessed: 5, summariesSent: 5 },
};

export const mockRoutinePatternAnalysis = {
  id: 2,
  userId: 1,
  type: 'pattern-analysis',
  name: 'Análise de Padrões',
  enabled: true,
  lastExecuted: new Date('2026-05-01T14:00:00Z'),
  nextExecution: new Date('2026-05-08T14:00:00Z'),
  lastResult: { usersAnalyzed: 3, patternsFound: 7 },
};

export const mockRoutineDailyWellbeing = {
  id: 3,
  userId: 1,
  type: 'daily-wellbeing',
  name: 'Bem-estar Diário',
  enabled: true,
  lastExecuted: new Date('2026-05-02T19:00:00Z'),
  nextExecution: new Date('2026-05-03T19:00:00Z'),
  lastResult: { messagesSent: 12, failed: 0 },
};

// ─────────────────────────────────────────────────────────────
// API Response Fixtures
// ─────────────────────────────────────────────────────────────

export const mockSuccessResponse = {
  success: true,
  data: null,
};

export const mockErrorResponse = {
  success: false,
  error: 'Internal server error',
};

export const mockAuthResponse = {
  success: true,
  data: {
    token: 'test-token-123',
    user: mockDbUser,
  },
};

export const mockCategoriesResponse = {
  success: true,
  data: {
    categories: [
      {
        id: 1,
        name: 'Organização',
        pilar: 'organization',
        emoji: '📋',
        isSelected: true,
      },
      {
        id: 2,
        name: 'Inspiração',
        pilar: 'inspiration',
        emoji: '✨',
        isSelected: false,
      },
    ],
    meta: { total: 2, selected: 1 },
  },
};

export const mockRoutinesStatusResponse = {
  success: true,
  data: [mockRoutineWeeklySummary, mockRoutinePatternAnalysis, mockRoutineDailyWellbeing],
};

// ─────────────────────────────────────────────────────────────
// Inngest Event Fixtures
// ─────────────────────────────────────────────────────────────

export const mockWhatsappMessageEvent = {
  name: 'whatsapp.message.received',
  data: {
    userId: '123',
    whatsappMessageId: 'msg-456',
    fromNumber: '+5511999999999',
    content: 'Olá, como estão?',
    mediaUrl: null,
    timestamp: new Date().toISOString(),
  },
};

export const mockCrisisDetectedEvent = {
  name: 'crisis.detected',
  data: {
    userId: '123',
    messageId: 1,
    severity: 'high',
    keywords: ['suicídio'],
  },
};

export const mockCrisisResponseSentEvent = {
  name: 'crisis.response.sent',
  data: {
    userId: '123',
    messageId: 1,
    response: 'Resposta de crise',
    channel: 'whatsapp',
  },
};

// ─────────────────────────────────────────────────────────────
// Twilio Fixtures
// ─────────────────────────────────────────────────────────────

export const mockTwilioResponse = {
  success: true,
  messageId: 'sm-123456789',
  status: 'queued',
  dateSent: new Date(),
};

export const mockTwilioError = {
  success: false,
  error: 'Invalid phone number',
  code: '21602',
};

// ─────────────────────────────────────────────────────────────
// Database Query Fixtures
// ─────────────────────────────────────────────────────────────

export const mockDbSelectResult = [mockDbUser];

export const mockDbInsertResult = { id: 1, ...mockMessage };

export const mockDbUpdateResult = { id: 1, ...mockDbUser, name: 'Updated Name' };

// ─────────────────────────────────────────────────────────────
// Request/Response Headers Fixtures
// ─────────────────────────────────────────────────────────────

export const mockAuthHeaders = {
  'Authorization': 'Bearer test-token-123',
  'Content-Type': 'application/json',
};

export const mockVercelCronHeaders = {
  'x-vercel-cron': '1',
  'Content-Type': 'application/json',
};

export const mockInvalidHeaders = {
  'Content-Type': 'application/json',
};

// ─────────────────────────────────────────────────────────────
// Form Data Fixtures
// ─────────────────────────────────────────────────────────────

export const mockRegisterFormData = {
  email: 'newuser@example.com',
  password: 'TestPassword123!',
  name: 'New User',
};

export const mockLoginFormData = {
  email: 'test@example.com',
  password: 'TestPassword123!',
};

export const mockProfileFormData = {
  name: 'Updated Name',
  preferredAssistant: 'assistant-1',
  timezone: 'America/Sao_Paulo',
  whatsappNumber: '+5511988888888',
};

export const mockCategoryToggleData = {
  categoryId: 1,
  isSelected: true,
};

// ─────────────────────────────────────────────────────────────
// Performance Baseline Fixtures
// ─────────────────────────────────────────────────────────────

export const performanceSLAs = {
  crisisDetection: 200, // ms
  messageProcessing: 2000, // ms
  databaseQuery: 100, // ms
  apiResponse: 500, // ms
  pageLoad: 3000, // ms
};

// ─────────────────────────────────────────────────────────────
// Factory Functions
// ─────────────────────────────────────────────────────────────

export function createMockUser(overrides = {}) {
  return { ...mockDbUser, ...overrides };
}

export function createMockMessage(overrides = {}) {
  return { ...mockMessage, ...overrides };
}

export function createMockDetection(overrides = {}) {
  return { ...mockNonCrisisDetection, ...overrides };
}

export function createMockRoutine(overrides = {}) {
  return { ...mockRoutineWeeklySummary, ...overrides };
}

export function createMockEvent(name: string, data = {}) {
  return { name, data };
}

// ─────────────────────────────────────────────────────────────
// Test Data Generators
// ─────────────────────────────────────────────────────────────

export function generateMockUsers(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({ id: i + 1, email: `user${i + 1}@example.com` })
  );
}

export function generateMockMessages(count: number, userId = 1) {
  return Array.from({ length: count }, (_, i) =>
    createMockMessage({
      id: i + 1,
      userId,
      content: `Message ${i + 1}`,
      whatsappMessageId: `msg-${i + 1}`,
    })
  );
}

export function generateTimestamp(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// ─────────────────────────────────────────────────────────────
// Cleanup Helpers
// ─────────────────────────────────────────────────────────────

export function resetMocks(...mocks: jest.Mock[]) {
  mocks.forEach((mock) => mock.mockReset());
}

export function clearAllMocks(...mocks: jest.Mock[]) {
  mocks.forEach((mock) => mock.mockClear());
}
