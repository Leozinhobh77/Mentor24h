'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string;
  supabaseId: string;
  preferredAssistant: string;
  timezone: string;
  language: string;
  consentGiven: boolean;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function useAuth(): AuthContextType {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar token do localStorage
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }, []);

  // Salvar token no localStorage
  const setToken = useCallback((token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }, []);

  // Remover token do localStorage
  const removeToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }, []);

  // Fazer login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      setToken(data.data.token);
      setUser(data.data.user);
      router.push('/dashboard');
    } catch (error) {
      removeToken();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setToken, removeToken, router]);

  // Fazer logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Sem token de autenticação');
      }

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      removeToken();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      removeToken();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getToken, removeToken, router]);

  // Carregar usuário atual
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        removeToken();
        setUser(null);
        return;
      }

      setUser(data.data.user);
    } catch (error) {
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, removeToken]);

  // Solicitar reset de senha
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao solicitar reset de senha');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Executar ao montar o component
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    resetPassword,
  };
}
