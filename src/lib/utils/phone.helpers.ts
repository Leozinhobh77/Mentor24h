import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Phone number validation and formatting utilities
 * Handles WhatsApp numbers in Brazilian format (+55 11 99999-9999)
 */

// Validation schema
export const phoneNumberSchema = z
  .string()
  .min(10)
  .max(20)
  .regex(/^\+?55\d{10,11}$/, 'Invalid Brazilian phone number format');

export const whatsappNumberSchema = z
  .string()
  .startsWith('whatsapp:', 'Must include whatsapp: prefix')
  .regex(/^whatsapp:\+?55\d{10,11}$/, 'Invalid WhatsApp number format');

/**
 * Phone number utilities
 */
export class PhoneHelper {
  /**
   * Validate phone number format (Brazilian numbers)
   * Accepts: 11999999999 or +5511999999999 or 5511999999999
   */
  static validatePhone(phone: string): boolean {
    try {
      phoneNumberSchema.parse(this.normalizePhone(phone));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalize phone to international format: +55XXXXXXXXXXXX
   * Input: 11999999999, 5511999999999, +5511999999999
   * Output: +5511999999999
   */
  static normalizePhone(phone: string): string {
    // Remove spaces, dashes, parentheses
    let cleaned = phone.replace(/[\s\-()]/g, '');

    // Remove leading zeros if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Add country code if missing
    if (!cleaned.startsWith('+55') && !cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }

    // Ensure + prefix
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Format phone for display: +55 11 9999-9999
   */
  static formatPhoneForDisplay(phone: string): string {
    const normalized = this.normalizePhone(phone);
    const match = normalized.match(/^(\+55)(\d{2})(\d{4,5})(\d{4})$/);

    if (!match) {
      return normalized;
    }

    const [, countryCode, areaCode, number1, number2] = match;
    return `${countryCode} ${areaCode} ${number1}-${number2}`;
  }

  /**
   * Convert to WhatsApp format: whatsapp:+55XXXXXXXXXXXX
   */
  static toWhatsappFormat(phone: string): string {
    const normalized = this.normalizePhone(phone);
    return `whatsapp:${normalized}`;
  }

  /**
   * Extract phone number from WhatsApp format
   */
  static extractFromWhatsapp(whatsappPhone: string): string {
    return whatsappPhone.replace('whatsapp:', '');
  }

  /**
   * Find user by phone number
   * Accepts: any format (will normalize)
   * Returns: User or null
   */
  static async findByPhone(phone: string) {
    const normalized = this.normalizePhone(phone);

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.whatsappNumber, normalized))
        .limit(1);

      return user || null;
    } catch (error) {
      console.error('[PHONE HELPER] FindByPhone error:', error);
      return null;
    }
  }

  /**
   * Find or create user by phone number
   * If user doesn't exist, creates a "ghost" user (not confirmed)
   */
  static async findOrCreateByPhone(
    phone: string,
    name?: string
  ): Promise<{ userId: number; isNew: boolean; user: any } | null> {
    if (!this.validatePhone(phone)) {
      console.warn('[PHONE HELPER] Invalid phone format:', phone);
      return null;
    }

    const normalized = this.normalizePhone(phone);

    try {
      // Try to find existing user
      const existing = await this.findByPhone(normalized);
      if (existing) {
        return {
          userId: existing.id,
          isNew: false,
          user: existing,
        };
      }

      // Create new "ghost" user
      const [newUser] = await db
        .insert(users)
        .values({
          supabaseId: `whatsapp_${normalized}_${Date.now()}`,
          email: `whatsapp_${normalized}@mentor24h.local`,
          whatsappNumber: normalized,
          name: name || `WhatsApp User ${normalized}`,
          consentGiven: false, // Must opt-in explicitly
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR',
        })
        .returning();

      console.log('[PHONE HELPER] Created ghost user:', newUser?.id);

      return {
        userId: newUser?.id || 0,
        isNew: true,
        user: newUser,
      };
    } catch (error) {
      console.error('[PHONE HELPER] FindOrCreateByPhone error:', error);
      return null;
    }
  }

  /**
   * Update user's phone number
   * Useful for linking WhatsApp to existing user account
   */
  static async updateUserPhone(userId: number, phone: string) {
    if (!this.validatePhone(phone)) {
      throw new Error('Invalid phone format');
    }

    const normalized = this.normalizePhone(phone);

    try {
      const [updated] = await db
        .update(users)
        .set({ whatsappNumber: normalized })
        .where(eq(users.id, userId))
        .returning();

      return updated || null;
    } catch (error) {
      console.error('[PHONE HELPER] UpdateUserPhone error:', error);
      throw new Error('Failed to update phone number');
    }
  }

  /**
   * Check if phone number is already registered
   */
  static async isPhoneRegistered(phone: string): Promise<boolean> {
    const user = await this.findByPhone(phone);
    return !!user;
  }

  /**
   * Get user's WhatsApp number in display format
   */
  static async getUserPhoneDisplay(userId: number): Promise<string | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user?.whatsappNumber) {
        return null;
      }

      return this.formatPhoneForDisplay(user.whatsappNumber);
    } catch {
      return null;
    }
  }
}

/**
 * Standalone utility functions (for simple use cases)
 */

export function validateBrazilianPhone(phone: string): boolean {
  return PhoneHelper.validatePhone(phone);
}

export function normalizePhone(phone: string): string {
  return PhoneHelper.normalizePhone(phone);
}

export function formatPhoneForDisplay(phone: string): string {
  return PhoneHelper.formatPhoneForDisplay(phone);
}

export function toWhatsappFormat(phone: string): string {
  return PhoneHelper.toWhatsappFormat(phone);
}
