import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { routines } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/services/auth.service';
import { eq } from 'drizzle-orm';

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

    // Get routines for user
    const userRoutines = await db
      .select()
      .from(routines)
      .where(eq(routines.userId, userId));

    const displayNames: Record<string, string> = {
      weekly: 'Resumo Semanal',
      daily: 'Dica Diária de Bem-estar',
      monthly: 'Análise Mensal',
      yearly: 'Revisão Anual',
    };

    const routineStatus = userRoutines.map((routine) => {
      const now = new Date();
      let nextExecution = routine.nextExecution || new Date();

      // Calculate next execution based on routine type if not already set
      if (!routine.nextExecution) {
        switch (routine.type) {
          case 'weekly':
            nextExecution = new Date(now);
            nextExecution.setDate(
              nextExecution.getDate() +
                ((1 - nextExecution.getDay() + 7) % 7)
            );
            nextExecution.setHours(8, 0, 0, 0);
            break;
          case 'daily':
            nextExecution = new Date(now);
            nextExecution.setHours(19, 0, 0, 0);
            if (nextExecution <= now) {
              nextExecution.setDate(nextExecution.getDate() + 1);
            }
            break;
          case 'monthly':
            nextExecution = new Date(now);
            nextExecution.setMonth(nextExecution.getMonth() + 1);
            nextExecution.setDate(1);
            nextExecution.setHours(8, 0, 0, 0);
            break;
          case 'yearly':
            nextExecution = new Date(now);
            nextExecution.setFullYear(nextExecution.getFullYear() + 1);
            nextExecution.setMonth(0);
            nextExecution.setDate(1);
            nextExecution.setHours(8, 0, 0, 0);
            break;
        }
      }

      return {
        id: routine.id,
        name: displayNames[routine.type] || routine.name,
        type: routine.type,
        enabled: routine.enabled,
        lastExecuted: routine.lastExecuted,
        nextExecution: nextExecution,
      };
    });

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
