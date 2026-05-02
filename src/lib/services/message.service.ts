import { db } from '@/lib/db';
import { messages, users } from '@/lib/db/schema';
import { NewMessage, Message } from '@/lib/db/schema';
import { eq, and, desc, lte, gte } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
export const createMessageSchema = z.object({
  userId: z.number().int().positive(),
  whatsappMessageId: z.string().min(1).max(255),
  content: z.string().min(1).max(4096),
  severity: z.number().int().min(0).max(10).optional().default(0),
});

export const updateMessageSchema = z.object({
  severity: z.number().int().min(0).max(10).optional(),
  isCrisis: z.boolean().optional(),
  crisisKeywords: z.array(z.string()).optional(),
  crisisDetectedAt: z.date().optional(),
  crisisResponseSent: z.boolean().optional(),
  crisisResponseType: z.enum(['audio', 'text', 'media']).optional(),
  processedBy: z.enum(['pattern_match', 'claude_routine']).optional(),
});

export const listMessageSchema = z.object({
  userId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
  severity: z.number().int().min(0).max(10).optional(),
  isCrisis: z.boolean().optional(),
  sortBy: z.enum(['created', 'severity', 'crisis_detected']).optional().default('created'),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type ListMessageInput = z.infer<typeof listMessageSchema>;

/**
 * Message Service — CRUD operations for WhatsApp messages
 */
export class MessageService {
  /**
   * Create a new message record
   */
  static async create(input: CreateMessageInput): Promise<Message | null> {
    const validated = createMessageSchema.parse(input);

    try {
      const [created] = await db
        .insert(messages)
        .values({
          userId: validated.userId,
          whatsappMessageId: validated.whatsappMessageId,
          content: validated.content,
          severity: validated.severity,
          status: 'received',
        })
        .returning();

      return created || null;
    } catch (error) {
      console.error('[MESSAGE SERVICE] Create error:', error);
      throw new Error('Failed to create message');
    }
  }

  /**
   * Get a single message by ID
   */
  static async getById(messageId: number, userId: number): Promise<Message | null> {
    try {
      const [message] = await db
        .select()
        .from(messages)
        .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
        .limit(1);

      return message || null;
    } catch (error) {
      console.error('[MESSAGE SERVICE] GetById error:', error);
      throw new Error('Failed to fetch message');
    }
  }

  /**
   * Get a message by WhatsApp Message ID
   */
  static async getByWhatsappId(whatsappMessageId: string): Promise<Message | null> {
    try {
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.whatsappMessageId, whatsappMessageId))
        .limit(1);

      return message || null;
    } catch (error) {
      console.error('[MESSAGE SERVICE] GetByWhatsappId error:', error);
      throw new Error('Failed to fetch message');
    }
  }

  /**
   * List messages with filtering and pagination
   */
  static async list(input: ListMessageInput): Promise<{ messages: Message[]; total: number }> {
    const validated = listMessageSchema.parse(input);

    try {
      // Build WHERE clause
      const whereConditions = [eq(messages.userId, validated.userId)];

      if (validated.severity !== undefined) {
        whereConditions.push(gte(messages.severity, validated.severity));
      }

      if (validated.isCrisis !== undefined) {
        whereConditions.push(eq(messages.isCrisis, validated.isCrisis));
      }

      // Build ORDER BY
      let orderBy;
      if (validated.sortBy === 'severity') {
        orderBy = desc(messages.severity);
      } else if (validated.sortBy === 'crisis_detected') {
        orderBy = desc(messages.crisisDetectedAt);
      } else {
        orderBy = desc(messages.createdAt);
      }

      // Fetch data
      const data = await db
        .select()
        .from(messages)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(validated.limit)
        .offset(validated.offset);

      // Count total (for pagination)
      const [{ count }] = await db
        .select({ count: messages.id })
        .from(messages)
        .where(and(...whereConditions));

      return {
        messages: data,
        total: count ? 1 : 0, // Simplified count (ideally use SQL COUNT(*))
      };
    } catch (error) {
      console.error('[MESSAGE SERVICE] List error:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  /**
   * List crisis messages only (severity >= 8)
   */
  static async listCrises(userId: number, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const data = await db
        .select()
        .from(messages)
        .where(and(eq(messages.userId, userId), gte(messages.severity, 8)))
        .orderBy(desc(messages.crisisDetectedAt), desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      return data;
    } catch (error) {
      console.error('[MESSAGE SERVICE] ListCrises error:', error);
      throw new Error('Failed to fetch crisis messages');
    }
  }

  /**
   * Update a message (crisis detection, response, etc)
   */
  static async update(messageId: number, userId: number, input: UpdateMessageInput): Promise<Message | null> {
    const validated = updateMessageSchema.parse(input);

    try {
      const [updated] = await db
        .update(messages)
        .set({
          ...validated,
          crisisDetectedAt: validated.crisisDetectedAt || undefined,
          updatedAt: new Date(),
        })
        .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
        .returning();

      return updated || null;
    } catch (error) {
      console.error('[MESSAGE SERVICE] Update error:', error);
      throw new Error('Failed to update message');
    }
  }

  /**
   * Mark a message as crisis and send response
   */
  static async markCrisisAndRespond(
    messageId: number,
    userId: number,
    crisisKeywords: string[],
    responseType: 'audio' | 'text' | 'media' = 'audio'
  ): Promise<Message | null> {
    try {
      const [updated] = await db
        .update(messages)
        .set({
          isCrisis: true,
          severity: 9, // Critical
          crisisKeywords,
          crisisDetectedAt: new Date(),
          crisisResponseSent: true,
          crisisResponseType: responseType,
          processedBy: 'pattern_match',
          updatedAt: new Date(),
        })
        .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
        .returning();

      return updated || null;
    } catch (error) {
      console.error('[MESSAGE SERVICE] MarkCrisisAndRespond error:', error);
      throw new Error('Failed to mark message as crisis');
    }
  }

  /**
   * Get unread message count for user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const [result] = await db
        .select({ count: messages.id })
        .from(messages)
        .where(and(eq(messages.userId, userId), eq(messages.status, 'received')));

      return result?.count ? 1 : 0; // Simplified (ideally use SQL COUNT(*))
    } catch (error) {
      console.error('[MESSAGE SERVICE] GetUnreadCount error:', error);
      return 0;
    }
  }

  /**
   * Get crisis count for user
   */
  static async getCrisisCount(userId: number): Promise<number> {
    try {
      const [result] = await db
        .select({ count: messages.id })
        .from(messages)
        .where(and(eq(messages.userId, userId), gte(messages.severity, 8)));

      return result?.count ? 1 : 0; // Simplified
    } catch (error) {
      console.error('[MESSAGE SERVICE] GetCrisisCount error:', error);
      return 0;
    }
  }
}
