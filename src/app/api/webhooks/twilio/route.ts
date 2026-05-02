import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * TASK-041: POST /api/webhooks/twilio
 *
 * Webhook que recebe mensagens WhatsApp via Twilio
 * Fluxo: Validar → Buscar/Criar usuário → Queue Inngest → 200 OK
 */

const webhookPayloadSchema = z.object({
  messageId: z.string(),
  fromNumber: z.string().regex(/^\+\d{1,15}$/, 'Invalid phone number'),
  content: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  timestamp: z.string().datetime().optional(),
});

type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // 1. Parse e validar payload
    const body = await request.json();
    const payload = webhookPayloadSchema.parse(body);

    console.log('[Webhook] 📨 Mensagem recebida:', {
      messageId: payload.messageId,
      from: payload.fromNumber,
      length: payload.content.length,
    });

    // 2. Buscar ou criar usuário
    // TODO: integrar com messageService.findOrCreateByPhone()
    const userId = await findOrCreateUser(payload.fromNumber);

    if (!userId) {
      throw new Error('Failed to find or create user');
    }

    console.log('[Webhook] 👤 Usuário:', userId);

    // 3. Salvar mensagem
    // TODO: integrar com messageService.create()
    const messageId = await saveMessage({
      userId,
      body: payload.content,
      fromNumber: payload.fromNumber,
      mediaUrl: payload.mediaUrl,
      direction: 'inbound',
    });

    console.log('[Webhook] 💾 Mensagem salva:', messageId);

    // 4. Queue Inngest
    // TODO: integrar com inngest.send()
    await queueInngestJob({
      messageId,
      userId,
      content: payload.content,
    });

    console.log('[Webhook] 📤 Job enfileirado (Inngest)');

    // 5. Responder imediatamente com 200 (Twilio timeout é ~5s)
    const duration = performance.now() - startTime;

    console.log('[Webhook] ✅ Sucesso:', {
      messageId: payload.messageId,
      userId,
      duration: `${duration.toFixed(2)}ms`,
    });

    return NextResponse.json(
      {
        success: true,
        messageId: payload.messageId,
        userId,
        duration: Math.round(duration),
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = performance.now() - startTime;

    console.error('[Webhook] ❌ Erro:', {
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration.toFixed(2)}ms`,
    });

    // Validação falhou
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid webhook payload',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Erro genérico - retornar 500 para Twilio tentar novamente
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Mock: Buscar ou criar usuário
 * TODO: integrar com messageService.findOrCreateByPhone()
 */
async function findOrCreateUser(phoneNumber: string): Promise<number> {
  // Mock: simular criação de usuário
  console.log('[Webhook] 🔍 Buscando usuário com phone:', phoneNumber);

  // TODO: implementação real
  // const user = await db.users.findByPhone(phoneNumber)
  // if (!user) {
  //   return await db.users.create({ phone: phoneNumber })
  // }
  // return user.id

  return 1; // Mock user ID
}

/**
 * Mock: Salvar mensagem
 * TODO: integrar com messageService.create()
 */
async function saveMessage(data: {
  userId: number;
  body: string;
  fromNumber: string;
  mediaUrl?: string;
  direction: 'inbound' | 'outbound';
}): Promise<string> {
  console.log('[Webhook] 💾 Salvando mensagem:', {
    userId: data.userId,
    length: data.body.length,
    hasMedia: !!data.mediaUrl,
  });

  // TODO: implementação real
  // return await messageService.create({
  //   userId: data.userId,
  //   body: data.body,
  //   direction: data.direction,
  //   mediaUrl: data.mediaUrl,
  // })

  return `msg-${Date.now()}`; // Mock message ID
}

/**
 * Mock: Queue Inngest job
 * TODO: integrar com inngest.send()
 */
async function queueInngestJob(data: {
  messageId: string;
  userId: number;
  content: string;
}): Promise<void> {
  console.log('[Webhook] 📤 Enfileirando job Inngest:', {
    messageId: data.messageId,
    userId: data.userId,
  });

  // TODO: implementação real
  // return await inngest.send({
  //   name: 'whatsapp.message.received',
  //   data: {
  //     messageId: data.messageId,
  //     userId: data.userId,
  //     content: data.content,
  //   }
  // })
}
