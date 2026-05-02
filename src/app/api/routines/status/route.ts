import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { routines } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/services/auth.service';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    // Get user from token
    const userResult = await getUserFromToken(token);
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = userResult.data.user.id;

    // Get last execution of each routine type
    const routineTypes = [
      'weekly_summary',
      'pattern_analysis',
      'daily_wellbeing',
    ];
    const routineStatus = [];

    for (const type of routineTypes) {
      const lastRun = await db
        .select()
        .from(routines)
        .where(eq(routines.type, type as any))
        .orderBy(desc(routines.executedAt))
        .limit(1);

      const lastExecution = lastRun[0]?.executedAt;
      const lastResult = lastRun[0]?.lastResult
        ? JSON.parse(lastRun[0].lastResult)
        : null;

      // Calculate next execution based on cron schedule
      const now = new Date();
      let nextExecution = new Date();

      switch (type) {
        case 'weekly_summary':
          // Monday 8am
          nextExecution = new Date(now);
          nextExecution.setDate(
            nextExecution.getDate() +
              ((1 - nextExecution.getDay() + 7) % 7)
          );
          nextExecution.setHours(8, 0, 0, 0);
          break;
        case 'pattern_analysis':
          // Monday 2pm
          nextExecution = new Date(now);
          nextExecution.setDate(
            nextExecution.getDate() +
              ((1 - nextExecution.getDay() + 7) % 7)
          );
          nextExecution.setHours(14, 0, 0, 0);
          break;
        case 'daily_wellbeing':
          // Daily 7pm
          nextExecution = new Date(now);
          nextExecution.setHours(19, 0, 0, 0);
          if (nextExecution <= now) {
            nextExecution.setDate(nextExecution.getDate() + 1);
          }
          break;
      }

      const displayNames: Record<string, string> = {
        weekly_summary: 'Resumo Semanal',
        pattern_analysis: 'Análise de Padrões',
        daily_wellbeing: 'Dica Diária de Bem-estar',
      };

      routineStatus.push({
        name: displayNames[type],
        type: type.replace('_', '-'),
        enabled: true,
        lastExecuted: lastExecution || null,
        nextExecution: nextExecution,
        lastResult: lastResult,
      });
    }

    return NextResponse.json({
      success: true,
      data: routineStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET_ROUTINES_STATUS ERROR]', { error: message });

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar status das rotinas' },
      { status: 500 }
    );
  }
}
