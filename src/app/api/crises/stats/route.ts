import { NextRequest, NextResponse } from 'next/server';

/**
 * TASK-045: GET /api/crises/stats
 *
 * Endpoint de estatísticas sobre crises
 * Requisito: 5+ métricas, performance OK
 */

export async function GET(request: NextRequest) {
  try {
    const startTime = performance.now();

    // Mock stats (será substituído por queries DB reais)
    const stats = {
      // Contadores
      total_crises: 42,
      total_users: 15,
      total_messages: 487,

      // Taxas
      crisis_rate: 8.6, // % de mensagens que são crises
      response_rate: 95.2, // % de crises com resposta
      escalation_rate: 23.8, // % de crises escaladas

      // Severidade
      severity_distribution: {
        critical: 8, // severity 9-10
        high: 12, // severity 8-8.9
        medium: 15, // severity 5-7.9
        low: 7, // severity 1-4.9
      },

      // Timeline
      crises_last_24h: 3,
      crises_last_7d: 12,
      crises_last_30d: 42,

      // Assistentes (top 3)
      top_assistants: [
        { name: 'lucas', response_count: 15 },
        { name: 'mateus', response_count: 12 },
        { name: 'sérgio', response_count: 8 },
      ],

      // Performance
      avg_response_time_ms: 1245,
      p95_response_time_ms: 2100,
      p99_response_time_ms: 2800,

      // Health
      system_health: 'OK',
      last_update_at: new Date().toISOString(),
    };

    const duration = performance.now() - startTime;

    console.log('[API /crises/stats] ✅ Estatísticas geradas:', {
      totalCrises: stats.total_crises,
      duration: `${duration.toFixed(2)}ms`,
    });

    return NextResponse.json({
      ...stats,
      duration: Math.round(duration),
    });
  } catch (error) {
    console.error('[API /crises/stats] ❌ Erro:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
