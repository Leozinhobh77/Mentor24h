import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest';

export async function POST(request: NextRequest) {
  try {
    // Check Vercel Cron header or Bearer token for admin
    const cronHeader = request.headers.get('x-vercel-cron');
    const authHeader = request.headers.get('authorization');

    if (!cronHeader && !authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Trigger the daily wellbeing routine
    const result = await inngest.send({
      name: 'daily-wellbeing/trigger',
      data: { triggeredAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      triggeredAt: new Date(),
      eventId: result[0]?.ids?.[0],
    });
  } catch (error) {
    console.error('[DAILY_WELLBEING_TRIGGER ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro ao disparar rotina',
      },
      { status: 500 }
    );
  }
}
