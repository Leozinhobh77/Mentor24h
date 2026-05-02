import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getTwilioService } from './twilio-service';

export class PhoneVerificationService {
  /**
   * Generate a random 6-digit code for phone verification
   */
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send verification code via SMS/WhatsApp
   * If TWILIO_MOCK_MODE=true, logs the code instead of sending
   */
  static async sendVerificationCode(
    userId: number,
    phoneNumber: string
  ): Promise<{ success: boolean; error?: string; codeSentAt?: string }> {
    try {
      const code = this.generateCode();
      const now = new Date();
      const expiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

      // Save code in database
      await db
        .update(users)
        .set({
          phoneVerificationCode: code,
          phoneVerificationExpiry: expiry,
          phoneVerificationAttempts: 0,
          updatedAt: now,
        })
        .where(eq(users.id, userId));

      // Mock mode: log instead of sending
      if (process.env.TWILIO_MOCK_MODE === 'true') {
        console.log('[PHONE VERIFICATION - MOCK]', {
          userId,
          phoneNumber,
          code,
          expiresAt: expiry.toISOString(),
        });
        return {
          success: true,
          codeSentAt: now.toISOString(),
        };
      }

      // Real mode: send via Twilio
      const twilioService = getTwilioService();
      if (!twilioService) {
        throw new Error('Twilio service not configured');
      }

      const message = `Seu código de verificação Mentor24h é: ${code}. Válido por 10 minutos.`;
      await twilioService.sendConfirmation({
        userId,
        phoneNumber,
        message,
      });

      console.log('[PHONE VERIFICATION] Code sent', {
        userId,
        phoneNumber,
        expiresAt: expiry.toISOString(),
      });

      return {
        success: true,
        codeSentAt: now.toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PHONE VERIFICATION] Send failed:', {
        userId,
        phoneNumber,
        error: message,
      });

      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Confirm phone verification code
   * Returns success or error code: 'INVALID_CODE' | 'CODE_EXPIRED' | 'MAX_ATTEMPTS'
   */
  static async confirmCode(
    userId: number,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const userData = user[0];

      // Check if max attempts exceeded
      if ((userData.phoneVerificationAttempts || 0) >= 3) {
        return {
          success: false,
          error: 'MAX_ATTEMPTS',
        };
      }

      // Check if code expired
      if (!userData.phoneVerificationExpiry || new Date() > userData.phoneVerificationExpiry) {
        return {
          success: false,
          error: 'CODE_EXPIRED',
        };
      }

      // Check if code matches
      if (userData.phoneVerificationCode !== code) {
        // Increment attempts
        await db
          .update(users)
          .set({
            phoneVerificationAttempts: (userData.phoneVerificationAttempts || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        return {
          success: false,
          error: 'INVALID_CODE',
        };
      }

      // Code is valid! Mark as verified
      await db
        .update(users)
        .set({
          whatsappVerified: true,
          whatsappVerifiedAt: new Date(),
          phoneVerificationCode: null,
          phoneVerificationExpiry: null,
          phoneVerificationAttempts: 0,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      console.log('[PHONE VERIFICATION] Code confirmed', {
        userId,
        verifiedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PHONE VERIFICATION] Confirm failed:', {
        userId,
        error: message,
      });

      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Resend verification code (reset attempts)
   */
  static async resendCode(
    userId: number,
    phoneNumber: string
  ): Promise<{ success: boolean; error?: string; codeSentAt?: string }> {
    try {
      // Clear previous code and reset attempts
      await db
        .update(users)
        .set({
          phoneVerificationAttempts: 0,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Send new code
      return this.sendVerificationCode(userId, phoneNumber);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PHONE VERIFICATION] Resend failed:', {
        userId,
        error: message,
      });

      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Check if a phone number is verified
   */
  static async isVerified(userId: number): Promise<boolean> {
    try {
      const user = await db
        .select({ whatsappVerified: users.whatsappVerified })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user.length > 0 && user[0].whatsappVerified === true;
    } catch (error) {
      console.error('[PHONE VERIFICATION] Check failed:', error);
      return false;
    }
  }
}
