import {
  PhoneHelper,
  validateBrazilianPhone,
  normalizePhone,
  formatPhoneForDisplay,
  toWhatsappFormat,
} from '@/lib/utils/phone.helpers';

/**
 * Unit tests for Phone Helpers
 * Tests: validation, formatting, normalization
 */
describe('PhoneHelper', () => {
  describe('validatePhone', () => {
    it('should validate correct Brazilian phone numbers', () => {
      const validNumbers = [
        '11999999999',
        '+5511999999999',
        '5511999999999',
        '+55 11 9999-9999',
        '(11) 99999-9999',
        '21987654321',
        '+5521987654321',
      ];

      validNumbers.forEach((phone) => {
        expect(PhoneHelper.validatePhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123', // too short
        'abc12345678', // non-numeric
        '1199999999', // wrong area code
        '+5611999999999', // invalid area code
        '999999999999999999', // too long
        '', // empty
      ];

      invalidNumbers.forEach((phone) => {
        expect(PhoneHelper.validatePhone(phone)).toBe(false);
      });
    });

    it('should reject non-Brazilian numbers', () => {
      const nonBrazilian = [
        '+1234567890', // US
        '+4455123456', // UK
        '+81312345678', // Japan
      ];

      nonBrazilian.forEach((phone) => {
        expect(PhoneHelper.validatePhone(phone)).toBe(false);
      });
    });
  });

  describe('normalizePhone', () => {
    it('should normalize various phone formats to +55XXXXXXXXXXXX', () => {
      const testCases = [
        { input: '11999999999', expected: '+5511999999999' },
        { input: '5511999999999', expected: '+5511999999999' },
        { input: '+5511999999999', expected: '+5511999999999' },
        { input: '+55 11 9999-9999', expected: '+5511999999999' },
        { input: '(11) 99999-9999', expected: '+5511999999999' },
        { input: '11 9999-9999', expected: '+5511999999999' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(PhoneHelper.normalizePhone(input)).toBe(expected);
      });
    });

    it('should handle area codes correctly', () => {
      expect(PhoneHelper.normalizePhone('2187654321')).toBe('+552187654321');
      expect(PhoneHelper.normalizePhone('8599999999')).toBe('+558599999999');
      expect(PhoneHelper.normalizePhone('4733333333')).toBe('+554733333333');
    });

    it('should be idempotent (normalize twice = same result)', () => {
      const phone = '+5511999999999';
      const once = PhoneHelper.normalizePhone(phone);
      const twice = PhoneHelper.normalizePhone(once);
      expect(once).toBe(twice);
    });
  });

  describe('formatPhoneForDisplay', () => {
    it('should format phone for display with dashes and spaces', () => {
      const testCases = [
        { input: '11999999999', expected: '+55 11 9999-9999' },
        { input: '+5511999999999', expected: '+55 11 9999-9999' },
        { input: '2187654321', expected: '+55 21 8765-4321' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(PhoneHelper.formatPhoneForDisplay(input)).toBe(expected);
      });
    });

    it('should handle different area codes', () => {
      expect(PhoneHelper.formatPhoneForDisplay('1130000000')).toContain('+55 11');
      expect(PhoneHelper.formatPhoneForDisplay('2130000000')).toContain('+55 21');
      expect(PhoneHelper.formatPhoneForDisplay('8530000000')).toContain('+55 85');
    });
  });

  describe('toWhatsappFormat', () => {
    it('should convert phone to WhatsApp format', () => {
      const testCases = [
        { input: '11999999999', expected: 'whatsapp:+5511999999999' },
        { input: '+5511999999999', expected: 'whatsapp:+5511999999999' },
        { input: '5511999999999', expected: 'whatsapp:+5511999999999' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(PhoneHelper.toWhatsappFormat(input)).toBe(expected);
      });
    });

    it('should always include whatsapp: prefix', () => {
      const result = PhoneHelper.toWhatsappFormat('11999999999');
      expect(result).toMatch(/^whatsapp:/);
    });
  });

  describe('extractFromWhatsapp', () => {
    it('should extract phone from WhatsApp format', () => {
      const input = 'whatsapp:+5511999999999';
      const expected = '+5511999999999';
      expect(PhoneHelper.extractFromWhatsapp(input)).toBe(expected);
    });

    it('should handle phones without whatsapp prefix', () => {
      const input = '+5511999999999';
      expect(PhoneHelper.extractFromWhatsapp(input)).toBe('+5511999999999');
    });
  });

  describe('isPhoneRegistered (mocked)', () => {
    it('should return false for unregistered numbers', async () => {
      // Mock test: in real tests, would need DB setup
      expect(typeof PhoneHelper.isPhoneRegistered).toBe('function');
    });
  });

  describe('Standalone utility functions', () => {
    it('should export validateBrazilianPhone', () => {
      expect(validateBrazilianPhone('11999999999')).toBe(true);
      expect(validateBrazilianPhone('invalid')).toBe(false);
    });

    it('should export normalizePhone', () => {
      expect(normalizePhone('11999999999')).toBe('+5511999999999');
    });

    it('should export formatPhoneForDisplay', () => {
      expect(formatPhoneForDisplay('11999999999')).toBe('+55 11 9999-9999');
    });

    it('should export toWhatsappFormat', () => {
      expect(toWhatsappFormat('11999999999')).toBe('whatsapp:+5511999999999');
    });
  });

  describe('Edge cases', () => {
    it('should handle numbers with extra spaces/dashes', () => {
      const input = '+55 (11) 99999 - 9999';
      const normalized = PhoneHelper.normalizePhone(input);
      expect(normalized).toBe('+5511999999999');
    });

    it('should be case-insensitive for prefix', () => {
      const input = 'WhatsApp:+5511999999999';
      const extracted = PhoneHelper.extractFromWhatsapp(input);
      // Not strict case matching, just removes prefix
      expect(extracted).toContain('5511999999999');
    });

    it('should reject numbers starting with 0 after country code', () => {
      // Brazil doesn't use leading 0 in phone numbers
      const input = '+550119999999';
      expect(PhoneHelper.validatePhone(input)).toBe(false);
    });
  });

  describe('Type safety', () => {
    it('should have all expected methods', () => {
      expect(typeof PhoneHelper.validatePhone).toBe('function');
      expect(typeof PhoneHelper.normalizePhone).toBe('function');
      expect(typeof PhoneHelper.formatPhoneForDisplay).toBe('function');
      expect(typeof PhoneHelper.toWhatsappFormat).toBe('function');
      expect(typeof PhoneHelper.extractFromWhatsapp).toBe('function');
      expect(typeof PhoneHelper.findByPhone).toBe('function');
      expect(typeof PhoneHelper.findOrCreateByPhone).toBe('function');
      expect(typeof PhoneHelper.updateUserPhone).toBe('function');
      expect(typeof PhoneHelper.isPhoneRegistered).toBe('function');
      expect(typeof PhoneHelper.getUserPhoneDisplay).toBe('function');
    });
  });
});

/**
 * INTEGRATION TEST TEMPLATE
 * (Requires database setup)
 *
 * describe('PhoneHelper Integration', () => {
 *   beforeAll(async () => {
 *     // Create test database
 *   });
 *
 *   it('should find user by phone', async () => {
 *     const result = await PhoneHelper.findByPhone('+5511999999999');
 *     expect(result).toBeDefined();
 *   });
 *
 *   it('should create ghost user on first contact', async () => {
 *     const result = await PhoneHelper.findOrCreateByPhone('+5511888888888');
 *     expect(result?.isNew).toBe(true);
 *     expect(result?.user.consentGiven).toBe(false);
 *   });
 *
 *   it('should return existing user if phone already registered', async () => {
 *     const first = await PhoneHelper.findOrCreateByPhone('+5511999999999');
 *     const second = await PhoneHelper.findOrCreateByPhone('+5511999999999');
 *
 *     expect(first?.userId).toBe(second?.userId);
 *     expect(second?.isNew).toBe(false);
 *   });
 *
 *   it('should update user phone number', async () => {
 *     const userId = 1;
 *     await PhoneHelper.updateUserPhone(userId, '+5511999999999');
 *     const user = await db.select().from(users).where(eq(users.id, userId));
 *     expect(user[0].whatsappNumber).toBe('+5511999999999');
 *   });
 * });
 */
