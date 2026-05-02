'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * TASK-040: Navbar Badge
 *
 * Componente: DashboardNavbar
 * Features:
 * - Badge de mensagens não lidas + crises
 * - Polling a cada 5s
 * - Performance < 100ms
 * - Clicável (navega para /dashboard/messages ou /dashboard/crises)
 * - Desaparece quando count = 0
 */

interface BadgeData {
  unreadMessages: number;
  crisisCount: number;
  duration: number;
}

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const [badges, setBadges] = useState<BadgeData>({
    unreadMessages: 0,
    crisisCount: 0,
    duration: 0,
  });
  const [loading, setLoading] = useState(false);

  // Polling a cada 5 segundos
  useEffect(() => {
    async function fetchBadges() {
      try {
        const startTime = performance.now();
        setLoading(true);

        // Fetch unread messages (sem crise)
        const unreadRes = await fetch(
          '/api/messages?crisis=false&limit=1&offset=0'
        );
        const unreadData = await unreadRes.json();
        const unreadCount = unreadData.total || 0;

        // Fetch crisis count
        const crisisRes = await fetch(
          '/api/messages?severity=8&limit=1&offset=0'
        );
        const crisisData = await crisisRes.json();
        const crisisCount = crisisData.total || 0;

        const duration = Math.round(performance.now() - startTime);

        setBadges({
          unreadMessages: unreadCount,
          crisisCount,
          duration,
        });

        // Log performance
        if (duration > 100) {
          console.warn(
            `[DashboardNavbar] ⚠️ Badge polling slow: ${duration}ms (> 100ms)`
          );
        }
      } catch (error) {
        console.error('[DashboardNavbar] ❌ Erro ao buscar badges:', error);
      } finally {
        setLoading(false);
      }
    }

    // Buscar imediatamente
    fetchBadges();

    // Setup polling a cada 5 segundos
    const interval = setInterval(fetchBadges, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            🧠 Mentor24h
          </span>
        </Link>

        {/* Badges */}
        <div className="flex items-center gap-4">
          {/* Unread Messages Badge */}
          {badges.unreadMessages > 0 && (
            <Link
              href="/dashboard/messages"
              className="relative group"
              title={`${badges.unreadMessages} mensagens não lidas`}
            >
              <div className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center gap-2 transition-colors cursor-pointer">
                <span className="text-white text-sm font-medium">
                  📱 {badges.unreadMessages}
                </span>
              </div>
              <div className="absolute -bottom-8 left-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Mensagens não lidas
              </div>
            </Link>
          )}

          {/* Crisis Badge */}
          {badges.crisisCount > 0 && (
            <Link
              href="/dashboard/crises"
              className="relative group"
              title={`${badges.crisisCount} crise${badges.crisisCount !== 1 ? 's' : ''}`}
            >
              <div className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full flex items-center gap-2 transition-colors cursor-pointer animate-pulse">
                <span className="text-white text-sm font-medium">
                  🚨 {badges.crisisCount}
                </span>
              </div>
              <div className="absolute -bottom-8 left-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Crises detectadas
              </div>
            </Link>
          )}

          {/* Status Indicator */}
          <div className="text-xs text-blue-100">
            {loading ? (
              <span>⏳ {badges.duration}ms</span>
            ) : (
              <span>✓ {badges.duration}ms</span>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 ml-4 border-l border-blue-500 pl-4">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{user?.name || 'Usuário'}</p>
              <p className="text-blue-100 text-xs">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
