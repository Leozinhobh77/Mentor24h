import { inngest } from '@/lib/inngest';
import { db } from '@/lib/db';
import { users, messages, routines } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { getClaudeService } from '@/lib/services/claude.service';

export const patternAnalysis = inngest.createFunction(
  { id: 'pattern-analysis' },
  { cron: '0 14 * * 1' }, // Monday 2pm UTC
  async ({ step }) => {
    try {
      // Get users with 10+ messages last week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const activeUsers = await step.run('get-active-users', async () => {
        return await db
          .select({
            id: users.id,
            name: users.name,
            whatsappNumber: users.whatsappNumber,
          })
          .from(users)
          .where(eq(users.isActive, true));
      });

      const usersToAnalyze: typeof activeUsers = [];

      // Filter users with 10+ messages
      for (const user of activeUsers) {
        const msgCount = await step.run(
          `count-messages-${user.id}`,
          async () => {
            const result = await db
              .select()
              .from(messages)
              .where(
                and(
                  eq(messages.userId, user.id),
                  gte(messages.createdAt, oneWeekAgo)
                )
              );
            return result.length;
          }
        );

        if (msgCount >= 10) {
          usersToAnalyze.push(user);
        }
      }

      // Analyze patterns with Claude
      for (const user of usersToAnalyze) {
        try {
          const analysis = await step.run(
            `analyze-patterns-${user.id}`,
            async () => {
              const service = getClaudeService();
              const prompt = `Analise os padrões de bem-estar do usuário: horários de pico, categorias preferidas, tendências. Responda em 2 parágrafos.`;
              return await service.generateAnalysis(prompt, 512);
            }
          );

          await step.run(`save-result-${user.id}`, async () => {
            await db.insert(routines).values({
              userId: user.id,
              name: 'Pattern Analysis',
              type: 'monthly' as const,
              schedule: '0 14 * * 1',
              content: analysis,
              enabled: true,
              lastExecuted: new Date(),
              nextExecution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
          });
        } catch (err) {
          console.error(`Failed pattern analysis for user ${user.id}:`, err);
        }
      }

      return {
        success: true,
        usersAnalyzed: usersToAnalyze.length,
        executedAt: new Date(),
      };
    } catch (error) {
      console.error('[PATTERN_ANALYSIS ERROR]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date(),
      };
    }
  }
);
