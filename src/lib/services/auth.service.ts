import { supabaseClient, supabaseServerClient } from '../utils/supabase';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { User, NewUser } from '../db/schema';

/**
 * Authentication Service
 * Handles: register, login, logout, token refresh, get current user
 */

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: {
    user: User;
    token?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  whatsappNumber?: string;
}

/**
 * Register new user
 * Creates Supabase auth user + database user record
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  try {
    // 1. Create Supabase auth user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseClient.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
        },
      },
    });

    if (authError || !authUser) {
      return {
        success: false,
        error: authError?.message || 'Failed to create auth user',
      };
    }

    // 2. Create database user record
    const newUser: NewUser = {
      supabaseId: authUser.id,
      email: credentials.email,
      name: credentials.name,
      whatsappNumber: credentials.whatsappNumber,
      preferredAssistant: 'Mateus', // Default assistant
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      consentGiven: false, // User must explicitly consent
    };

    const [dbUser] = await db
      .insert(users)
      .values(newUser)
      .returning();

    return {
      success: true,
      data: {
        user: dbUser,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown registration error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Login with email and password
 * Returns auth token
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const {
      data: { user: authUser, session },
      error: authError,
    } = await supabaseClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError || !authUser || !session) {
      return {
        success: false,
        error: authError?.message || 'Invalid credentials',
      };
    }

    // Get user record from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, authUser.id));

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found in database',
      };
    }

    return {
      success: true,
      data: {
        user: dbUser,
        token: session.access_token,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown login error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Logout (client-side)
 */
export async function logout(): Promise<AuthResponse> {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown logout error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Get user record from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, authUser.id));

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found in database',
      };
    }

    return {
      success: true,
      data: {
        user: dbUser,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Refresh access token (JWT)
 */
export async function refreshToken(): Promise<AuthResponse> {
  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.refreshSession();

    if (error || !session) {
      return {
        success: false,
        error: error?.message || 'Failed to refresh token',
      };
    }

    return {
      success: true,
      data: {
        user: {} as User, // Token refreshed, user data not needed
        token: session.access_token,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown refresh error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: Partial<User>): Promise<AuthResponse> {
  try {
    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Update database record
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.supabaseId, authUser.id))
      .returning();

    return {
      success: true,
      data: {
        user: updatedUser,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Delete user account (LGPD right to deletion)
 * Soft delete + auth user deletion
 */
export async function deleteAccount(): Promise<AuthResponse> {
  try {
    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // 1. Soft delete in database
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        isActive: false,
      })
      .where(eq(users.supabaseId, authUser.id));

    // 2. Delete auth user (via admin)
    if (supabaseServerClient) {
      await supabaseServerClient.auth.admin.deleteUser(authUser.id);
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Check if user has given LGPD consent
 */
export async function hasConsent(): Promise<boolean> {
  try {
    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser();

    if (!authUser) return false;

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, authUser.id));

    return dbUser?.consentGiven ?? false;
  } catch {
    return false;
  }
}

/**
 * Give LGPD consent
 */
export async function giveConsent(): Promise<AuthResponse> {
  try {
    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        consentGiven: true,
        consentDate: new Date(),
      })
      .where(eq(users.supabaseId, authUser.id))
      .returning();

    return {
      success: true,
      data: {
        user: updatedUser,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Verify email (for future use)
 */
export async function sendVerificationEmail(): Promise<AuthResponse> {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Supabase handles verification email automatically on signup
    // This is a placeholder for future use

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}
