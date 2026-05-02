import { NextRequest, NextResponse } from 'next/server';

/**
 * TASK-043: GET /api/messages/unread
 *
 * Endpoint que retorna contadores de mensagens não lidas e crises
 * Requisito: unread_count, crisis_count, last_message_at
 */

export async function GET(request: NextRequest) {
  try {
    const startTime = performance.now();

    // Mock data (será substituído por queries DB reais)
    const mockStats = {
      unread_count: 5, // Mensagens sem leitura
      crisis_count: 2, // Crises (severity >= 8)
      last_message_at: new Date(Date.now() - 3600000).toISOString(), // 1h atrás
      total_messages: 47,
      unread_percentage: 10.6,
    };

    const duration = performance.now() - startTime;

    console.log('[API /messages/unread] ✅ Performance:', {
      duration: `${duration.toFixed(2)}ms`,
      unreadCount: mockStats.unread_count,
      crisisCount: mockStats.crisis_count,
    });

    return NextResponse.json({
      ...mockStats,
      duration: Math.round(duration),
    });
  } catch (error) {
    console.error('[API /messages/unread] ❌ Erro:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
