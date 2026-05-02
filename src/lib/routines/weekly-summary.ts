import { inngest } from '@/lib/inngest';
import { db } from '@/lib/db';
import { users, routines } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getClaudeService } from '@/lib/services/claude.service';
import { TwilioService } from '@/lib/services/twilio-service';

export const weeklySummary = inngest.createFunction(
  { id: 'weekly-summary' },
  { cron: '0 8 * * 1' }, // Monday 8am UTC
  async ({ step }) => {
    try {
      // Get all active users
      const activeUsers = await step.run('get-active-users', async () => {
        return await db
          .select()
          .from(users)
          .where(eq(users.isActive, true));
      });

      const batchSize = 10;
      const batches = Math.ceil(activeUsers.length / batchSize);
      const processedUsers: string[] = [];
      const failedUsers: string[] = [];

      // Process users in batches
      for (let i = 0; i < batches; i++) {
        const batchUsers = activeUsers.slice(
          i * batchSize,
          (i + 1) * batchSize
        );

        for (const user of batchUsers) {
          if (!user.whatsappVerified) {
            failedUsers.push(user.id);
            continue;
          }

          try {
            // Build summary prompt
            const prompt = await step.run(
              `build-summary-prompt-${user.id}`,
              async () => {
                return `Resuma a semana do usuário em 3 frases objetivas sobre bem-estar e produtividade.`;
              }
            );

            // Call Claude
            const summary = await step.run(
              `call-claude-${user.id}`,
              async () => {
                const service = getClaudeService();
                return await service.generateSummary(prompt);
              }
            );

            // Send via Twilio
            await step.run(`send-whatsapp-${user.id}`, async () => {
              const twilioService = new TwilioService();
              await twilioService.sendMessage(
                user.whatsappNumber || '',
                `📊 Seu resumo semanal:\n\n${summary}`
              );
            });

            processedUsers.push(user.id);
          } catch (err) {
            console.error(`Failed to process user ${user.id}:`, err);
            failedUsers.push(user.id);
          }
        }
      }

      // Log execution
      await step.run('log-execution', async () => {
        await db.insert(routines).values({
          userId: 'system',
          type: 'weekly_summary',
          status: 'completed',
          executedAt: new Date(),
          lastResult: JSON.stringify({
            usersProcessed: processedUsers.length,
            summariesSent: processedUsers.length,
            failed: failedUsers.length,
          }),
        });
      });

      return {
        success: true,
        processed: processedUsers.length,
        failed: failedUsers.length,
        executedAt: new Date(),
      };
    } catch (error) {
      console.error('[WEEKLY_SUMMARY ERROR]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date(),
      };
    }
  }
);
