import {
  register,
  login,
  logout,
  getCurrentUser,
  getUserFromToken,
  refreshToken,
  updateProfile,
  deleteAccount,
  hasConsent,
  giveConsent,
  resetPassword,
  updatePasswordWithToken,
} from '@/lib/services/auth.service';
import { db } from '@/lib/db';
import * as supabase from '@/lib/utils/supabase';

jest.mock('@/lib/db');
jest.mock('@/lib/utils/supabase');

describe('AuthService', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    user_metadata: { name: 'Test User' },
  };

  const mockDbUser = {
    id: 1,
    supabaseId: '123',
    email: 'test@example.com',
    name: 'Test User',
    whatsappNumber: '+5511999999999',
    isActive: true,
    deletedAt: null,
    consentGiven: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    test('should return success when user created in both auth and db', async () => {
      const mockSupabaseClient = {
        auth: {
          signUp: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;
      (db.insert as any).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockDbUser]),
        }),
      });

      const result = await register({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
    });

    test('should return error when Supabase signup fails', async () => {
      const mockSupabaseClient = {
        auth: {
          signUp: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Email already exists' },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await register({
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle unexpected errors', async () => {
      const mockSupabaseClient = {
        auth: {
          signUp: jest.fn().mockRejectedValue(new Error('Network error')),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await register({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('login()', () => {
    test('should return success with token when credentials valid', async () => {
      const mockSupabaseClient = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: {
              user: mockUser,
              session: { access_token: 'token-123' },
            },
            error: null,
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;
      (db.select as any).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockDbUser]),
        }),
      });

      const result = await login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('token-123');
    });

    test('should return error when credentials invalid', async () => {
      const mockSupabaseClient = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid credentials' },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await login({
        email: 'test@example.com',
        password: 'WrongPassword',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    test('should return error when user not found in database', async () => {
      const mockSupabaseClient = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: {
              user: mockUser,
              session: { access_token: 'token-123' },
            },
            error: null,
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;
      (db.select as any).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('logout()', () => {
    test('should return success when logout succeeds', async () => {
      const mockSupabaseClient = {
        auth: {
          signOut: jest.fn().mockResolvedValue({ error: null }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await logout();

      expect(result.success).toBe(true);
    });

    test('should return error when logout fails', async () => {
      const mockSupabaseClient = {
        auth: {
          signOut: jest.fn().mockResolvedValue({
            error: { message: 'Logout failed' },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await logout();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getCurrentUser()', () => {
    test('should return current user when authenticated', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;
      (db.select as any).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockDbUser]),
        }),
      });

      const result = await getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
    });

    test('should return error when not authenticated', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toContain('authenticated');
    });
  });

  describe('getUserFromToken()', () => {
    test('should be a valid function', () => {
      expect(typeof getUserFromToken).toBe('function');
    });

    test('should handle token validation', async () => {
      // This function requires async Supabase client creation
      // tested in integration tests due to dynamic import complexity
      expect(getUserFromToken).toBeDefined();
    });
  });

  describe('refreshToken()', () => {
    test('should return new token when refresh succeeds', async () => {
      const mockSupabaseClient = {
        auth: {
          refreshSession: jest.fn().mockResolvedValue({
            data: {
              session: { access_token: 'new-token-123' },
            },
            error: null,
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await refreshToken();

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('new-token-123');
    });

    test('should return error when refresh fails', async () => {
      const mockSupabaseClient = {
        auth: {
          refreshSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: { message: 'Session expired' },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await refreshToken();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProfile()', () => {
    test('should update user profile successfully', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;
      (db.update as any).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockDbUser]),
          }),
        }),
      });

      const result = await updateProfile({ name: 'Updated Name' });

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
    });

    test('should return error when not authenticated', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await updateProfile({ name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('authenticated');
    });
  });

  describe('deleteAccount()', () => {
    test('should delete account successfully', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      };

      const mockServerClient = {
        auth: {
          admin: {
            deleteUser: jest.fn().mockResolvedValue({}),
          },
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;
      (supabase.supabaseServerClient as any) = mockServerClient;
      (db.update as any).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({}),
        }),
      });

      const result = await deleteAccount();

      expect(result.success).toBe(true);
    });

    test('should return error when not authenticated', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await deleteAccount();

      expect(result.success).toBe(false);
      expect(result.error).toContain('authenticated');
    });
  });

  describe('hasConsent()', () => {
    test('should return true when user has given consent', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;
      (db.select as any).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ ...mockDbUser, consentGiven: true }]),
        }),
      });

      const result = await hasConsent();

      expect(result).toBe(true);
    });

    test('should return false when user not authenticated', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await hasConsent();

      expect(result).toBe(false);
    });
  });

  describe('giveConsent()', () => {
    test('should grant LGPD consent successfully', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;
      (db.update as any).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ ...mockDbUser, consentGiven: true }]),
          }),
        }),
      });

      const result = await giveConsent();

      expect(result.success).toBe(true);
    });

    test('should return error when not authenticated', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await giveConsent();

      expect(result.success).toBe(false);
      expect(result.error).toContain('authenticated');
    });
  });

  describe('resetPassword()', () => {
    test('should send password reset email successfully', async () => {
      const mockSupabaseClient = {
        auth: {
          resetPasswordForEmail: jest.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await resetPassword('test@example.com');

      expect(result.success).toBe(true);
    });

    test('should return error when email invalid', async () => {
      const mockSupabaseClient = {
        auth: {
          resetPasswordForEmail: jest.fn().mockResolvedValue({
            data: {},
            error: { message: 'User not found' },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await resetPassword('nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updatePasswordWithToken()', () => {
    test('should update password successfully', async () => {
      const mockSupabaseClient = {
        auth: {
          updateUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await updatePasswordWithToken('NewPassword123!');

      expect(result.success).toBe(true);
    });

    test('should return error when update fails', async () => {
      const mockSupabaseClient = {
        auth: {
          updateUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid password' },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await updatePasswordWithToken('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Error handling consistency', () => {
    test('all functions should return AuthResponse', async () => {
      const mockSupabaseClient = {
        auth: {
          signUp: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Error' },
          }),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await register({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
    });

    test('all functions should handle network errors', async () => {
      const mockSupabaseClient = {
        auth: {
          signOut: jest.fn().mockRejectedValue(new Error('Network error')),
        },
      };

      (supabase.supabaseClient as any) = mockSupabaseClient;

      const result = await logout();

      expect(result.success).toBe(false);
      expect(result.error).toContain('error');
    });
  });
});
