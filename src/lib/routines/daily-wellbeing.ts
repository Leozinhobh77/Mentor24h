import { inngest } from '@/lib/inngest';
import { db } from '@/lib/db';
import { users, routines } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getClaudeService } from '@/lib/services/claude.service';
import { TwilioService } from '@/lib/services/twilio-service';

const WELLBEING_TIPS = [
  '💧 Beba água! Hidratação é essencial para bem-estar.',
  '🧘 Faça 5 minutos de respiração consciente agora.',
  '🌟 Você é mais forte do que pensa. Acredite em si!',
  '📱 Tire um tempo offline. Sua mente agradece.',
  '🎯 Defina 1 meta pequena para hoje. Foco é poder.',
];

export const dailyWellbeing = inngest.createFunction(
  { id: 'daily-wellbeing' },
  { cron: '0 19 * * *' }, // Daily 7pm UTC
  async ({ step }) => {
    try {
      // Get all active users with verified WhatsApp
      const activeUsers = await step.run('get-active-users', async () => {
        return await db
          .select()
          .from(users)
          .where(eq(users.isActive, true));
      });

      const verifiedUsers = activeUsers.filter(
        (u) => u.whatsappVerified && u.whatsappNumber
      );

      const sentCount = {
        withClaude: 0,
        withTemplate: 0,
        failed: 0,
      };

      // Send tips to each user
      for (const user of verifiedUsers) {
        try {
          let tip = '';

          try {
            // Try to generate with Claude
            const generatedTip = await step.run(
              `generate-tip-${user.id}`,
              async () => {
                const service = getClaudeService();
                return await service.generateSummary(
                  'Gere uma dica de bem-estar em 1 linha, motivadora e prática.'
                );
              }
            );
            tip = generatedTip;
            sentCount.withClaude++;
          } catch (_err) {
            // Fallback to template
            tip =
              WELLBEING_TIPS[Math.floor(Math.random() * WELLBEING_TIPS.length)];
            sentCount.withTemplate++;
          }

          await step.run(`send-tip-${user.id}`, async () => {
            const twilioService = new TwilioService();
            await twilioService.sendMessage(
              user.whatsappNumber || '',
              `Dica de Bem-Estar 🌟\n\n${tip}`
            );
          });
        } catch (err) {
          console.error(`Failed to send tip to user ${user.id}:`, err);
          sentCount.failed++;
        }
      }

      // Log execution
      await step.run('log-execution', async () => {
        await db.insert(routines).values({
          userId: 'system',
          type: 'daily_wellbeing',
          status: 'completed',
          executedAt: new Date(),
          lastResult: JSON.stringify({
            totalSent: sentCount.withClaude + sentCount.withTemplate,
            withClaude: sentCount.withClaude,
            withTemplate: sentCount.withTemplate,
            failed: sentCount.failed,
          }),
        });
      });

      return {
        success: true,
        ...sentCount,
        executedAt: new Date(),
      };
    } catch (error) {
      console.error('[DAILY_WELLBEING ERROR]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date(),
      };
    }
  }
);
