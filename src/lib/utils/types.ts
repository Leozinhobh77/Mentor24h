// Shared types for Mentor24h application

export type Pillar = 'organization' | 'inspiration' | 'entertainment' | 'wellbeing';

export type AssistantName = 'mateus' | 'lucas' | 'sergio' | 'mariaClara' | 'bianca' | 'luciana';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type MessageStatus = 'received' | 'processing' | 'responded';

export type RoutineType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type UserRole = 'user' | 'admin';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// User profile type
export interface UserProfile {
  id: number;
  supabaseId: string;
  email: string;
  name: string;
  whatsappNumber?: string;
  preferredAssistant: AssistantName;
  timezone: string;
  language: string;
  consentGiven: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Message type
export interface Message {
  id: number;
  userId: number;
  whatsappMessageId: string;
  content: string;
  status: MessageStatus;
  severity: number; // 0-10
  isCrisis: boolean;
  crisisConfidence?: number; // 0-100
  detectedPatterns?: string[];
  respondedWith?: string;
  createdAt: Date;
  processedAt?: Date;
  respondedAt?: Date;
}

// Category type
export interface Category {
  id: number;
  name: string;
  description?: string;
  pillar: Pillar;
  order: number;
  icon?: string;
  createdAt: Date;
}

// Audio type
export interface Audio {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  audioUrl: string;
  duration: number; // seconds
  instructor: string;
  language: string;
  createdAt: Date;
}

// Routine type
export interface Routine {
  id: number;
  userId: number;
  type: RoutineType;
  name: string;
  schedule: string; // cron format
  content: string;
  enabled: boolean;
  lastExecuted?: Date;
  nextExecution?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Crisis detection result
export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: SeverityLevel;
  severity_score: number; // 0-10
  confidence: number; // 0-100
  detectedPatterns: string[];
  suggestedResponse: string;
  requiresHumanReview: boolean;
}

// Whatsapp webhook payload
export interface WhatsappWebhookPayload {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  messages: Array<{
    from: string;
    id: string;
    timestamp: string;
    text: {
      body: string;
    };
    type: string;
  }>;
}

// Whatsapp message to send
export interface WhatsappMessageToSend {
  messaging_product: string;
  to: string;
  type: string;
  text: {
    body: string;
  };
}

// Routine execution context
export interface RoutineExecutionContext {
  routineId: number;
  userId: number;
  type: RoutineType;
  name: string;
  userProfile: UserProfile;
  userCategories: Category[];
  previousMessages?: Message[];
}

// Summary request (for Claude API)
export interface SummaryRequest {
  userId: number;
  type: 'weekly' | 'monthly' | 'yearly';
  messages: Message[];
  categories: Category[];
}

// Recommendation request (for Claude API)
export interface RecommendationRequest {
  userId: number;
  userProfile: UserProfile;
  selectedCategories: Category[];
  recentMessages: Message[];
  patterns: Record<string, number>;
}

// Dashboard stats
export interface DashboardStats {
  totalMessages: number;
  totalCrises: number;
  averageSeverity: number;
  selectedCategories: number;
  completedRoutines: number;
  weeklyTrend: {
    date: string;
    count: number;
    crises: number;
  }[];
}
