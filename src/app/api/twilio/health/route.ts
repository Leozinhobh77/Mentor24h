import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getTwilioService } from '@/lib/services/twilio-service';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Query messages from last 24 hours
    const messagesLast24h = await db
      .select({ count: sql`COUNT(*)` })
      .from(messages)
      .where(gte(messages.createdAt, oneDayAgo));

    const totalMessages24h = Number(messagesLast24h[0]?.count || 0);

    // Query crises from last 24 hours
    const crisesLast24h = await db
      .select({ count: sql`COUNT(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.isCrisis, true),
          gte(messages.createdAt, oneDayAgo)
        )
      );

    const totalCrises24h = Number(crisesLast24h[0]?.count || 0);

    // Query crisis responses sent vs crises total
    const crisisStats = await db
      .select({
        sent: sql`COUNT(*) FILTER (WHERE crisis_response_sent = true)`,
        total: sql`COUNT(*) FILTER (WHERE is_crisis = true)`,
      })
      .from(messages)
      .where(gte(messages.createdAt, oneDayAgo));

    const crisisResponsesSent = Number(crisisStats[0]?.sent || 0);
    const crisisResponsesTotal = Number(crisisStats[0]?.total || 0);

    const responseRate = crisisResponsesTotal > 0
      ? (crisisResponsesSent / crisisResponsesTotal) * 100
      : 0;

    // Query average response latency (for messages with responses)
    const latencyStats = await db
      .select({
        avgLatency: sql`AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) * 1000)`,
      })
      .from(messages)
      .where(
        and(
          gte(messages.createdAt, oneDayAgo),
          sql`responded_at IS NOT NULL`
        )
      );

    const avgResponseLatency = Math.round(Number(latencyStats[0]?.avgLatency || 0));

    // Query failed/stuck deliveries (status='received' and stuck > 10min)
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const failedDeliveries = await db
      .select({ count: sql`COUNT(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.status, 'received'),
          gte(messages.createdAt, oneDayAgo),
          sql`updated_at <= ${tenMinutesAgo}`
        )
      );

    const failedCount = Number(failedDeliveries[0]?.count || 0);

    // Check Twilio connectivity
    let twilioConnectivity = false;
    try {
      const twilioService = getTwilioService();
      if (twilioService) {
        twilioConnectivity = await twilioService.healthCheck();
      }
    } catch (error) {
      console.error('[HEALTH CHECK] Twilio service error:', error);
      twilioConnectivity = false;
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (!twilioConnectivity) {
      status = 'down';
    } else if (responseRate < 90 || failedCount > 5) {
      status = 'degraded';
    }

    const healthResponse = {
      status,
      timestamp: now.toISOString(),
      metrics: {
        messages_last_24h: totalMessages24h,
        crises_last_24h: totalCrises24h,
        response_rate_percent: Math.round(responseRate * 100) / 100,
        avg_response_latency_ms: avgResponseLatency,
        failed_deliveries: failedCount,
        twilio_connectivity: twilioConnectivity,
      },
      sid_tracking: {
        total_with_sid: totalMessages24h, // All messages have whatsappMessageId
        total_responses_tracked: crisisResponsesSent,
      },
    };

    return NextResponse.json(healthResponse, { status: 200 });
  } catch (error) {
    console.error('[TWILIO HEALTH CHECK ERROR]', error);

    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          messages_last_24h: 0,
          crises_last_24h: 0,
          response_rate_percent: 0,
          avg_response_latency_ms: 0,
          failed_deliveries: 0,
          twilio_connectivity: false,
        },
      },
      { status: 500 }
    );
  }
}
