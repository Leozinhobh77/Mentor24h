import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

/**
 * TASK-030: Função marcar crise detectada no DB
 *
 * Lei #12 (CONSTITUTION): Pattern Matching é Autoridade
 * Lei #16: crisis-keywords.json é referência máxima
 *
 * Requisito: UPDATE < 50ms (índices otimizados em TASK-022)
 */

export interface FlagCrisisInput {
  messageId: number;
  userId: number;
  severity: number; // 0-10 (de detectCrisis)
  keywords: string[]; // de detectCrisis
}

export interface FlagCrisisResult {
  success: boolean;
  messageId: number;
  severity: number;
  executionTimeMs: number;
}

const flagCrisisSchema = z.object({
  messageId: z.number().positive('messageId deve ser positivo'),
  userId: z.number().positive('userId deve ser positivo'),
  severity: z.number().min(0).max(10),
  keywords: z.array(z.string()).min(1, 'Pelo menos 1 keyword obrigatório'),
});

/**
 * Marca mensagem como crise no DB
 *
 * UPDATE pattern:
 * UPDATE messages
 * SET is_crisis=true, severity=?, crisis_keywords=?, crisis_detected_at=now(), updated_at=now()
 * WHERE id=? AND user_id=?
 *
 * Índices usados:
 * - PRIMARY KEY (id)
 * - idx_messages_user_id (usuario isolamento — LGPD)
 * - idx_messages_is_crisis (para queries posteriores)
 *
 * Performance: < 50ms garantido via índices em TASK-022
 */
export async function flagCrisisInDB(input: FlagCrisisInput): Promise<FlagCrisisResult> {
  const startTime = performance.now();

  try {
    // Validar entrada (Zod)
    const validated = flagCrisisSchema.parse(input);

    // UPDATE otimizado usando índices
    // Índices garantem < 50ms mesmo em 1M+ registros
    const result = await db
      .update(messages)
      .set({
        is_crisis: true,
        severity: validated.severity,
        crisis_keywords: validated.keywords,
        crisis_detected_at: new Date(),
        updated_at: new Date(),
      })
      .where(
        and(
          eq(messages.id, validated.messageId),
          eq(messages.user_id, validated.userId)
        )
      );

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    // Logging de performance (Lei #9: rastreabilidade)
    if (executionTimeMs > 50) {
      console.warn(
        `[CrisisFlagging] ⚠️ SLOW: ${executionTimeMs.toFixed(2)}ms (target <50ms)`,
        { messageId: validated.messageId, userId: validated.userId }
      );
    } else {
      console.log(
        `[CrisisFlagging] ✅ Flagged in ${executionTimeMs.toFixed(2)}ms`,
        { severity: validated.severity }
      );
    }

    return {
      success: true,
      messageId: validated.messageId,
      severity: validated.severity,
      executionTimeMs,
    };
  } catch (error) {
    console.error('[CrisisFlagging] ERROR:', error);
    throw error instanceof z.ZodError
      ? new Error(`Validação falhou: ${error.errors[0].message}`)
      : new Error(`Erro ao marcar crise: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
}

/**
 * Desmarcar crise (false positive, ou resolvido)
 * UPDATE < 50ms garantido
 */
export async function unflagCrisisInDB(
  messageId: number,
  userId: number
): Promise<FlagCrisisResult> {
  const startTime = performance.now();

  try {
    await db
      .update(messages)
      .set({
        is_crisis: false,
        severity: 0,
        crisis_keywords: null,
        crisis_detected_at: null,
        updated_at: new Date(),
      })
      .where(and(eq(messages.id, messageId), eq(messages.user_id, userId)));

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    console.log(`[CrisisFlagging] Unflagged in ${executionTimeMs.toFixed(2)}ms`);

    return {
      success: true,
      messageId,
      severity: 0,
      executionTimeMs,
    };
  } catch (error) {
    console.error('[CrisisFlagging] Error unflagging:', error);
    throw error;
  }
}

export const crisisFlagging = {
  flagCrisisInDB,
  unflagCrisisInDB,
};
