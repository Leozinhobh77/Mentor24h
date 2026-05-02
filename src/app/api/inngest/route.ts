import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { processWhatsappMessage } from '@/lib/workflows/process-whatsapp-workflow';
import { weeklySummary } from '@/lib/routines/weekly-summary';
import { patternAnalysis } from '@/lib/routines/pattern-analysis';
import { dailyWellbeing } from '@/lib/routines/daily-wellbeing';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processWhatsappMessage,
    weeklySummary,
    patternAnalysis,
    dailyWellbeing,
  ],
});
