import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import twilio from 'twilio';
import { db } from '@/lib/db';
import { users, messages } from '@/lib/db/schema';
import { inngest, whatsappMessageReceivedEvent } from '@/lib/inngest';
import { eq } from 'drizzle-orm';

const twilioWebhookSchema = z.object({
  From: z.string().startsWith('whatsapp:'),
  To: z.string().startsWith('whatsapp:'),
  Body: z.string().max(4096),
  NumMedia: z.string().optional(),
  MediaUrl0: z.string().url().optional(),
  MessageSid: z.string(),
});

type TwilioWebhookPayload = z.infer<typeof twilioWebhookSchema>;

async function validateTwilioSignature(
  request: NextRequest,
  twilioAuthToken: string
): Promise<boolean> {
  const signature = request.headers.get('x-twilio-signature');
  if (!signature) return false;

  const url = new URL(request.url).toString().split('?')[0];
  const body = new URLSearchParams(await request.text());

  const isValid = twilio.validateRequest(
    twilioAuthToken,
    signature,
    url,
    body as any
  );

  return isValid;
}

async function findOrCreateUser(whatsappNumber: string) {
  const normalizedNumber = whatsappNumber.replace('whatsapp:', '');

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.whatsappNumber, normalizedNumber))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [newUser] = await db
    .insert(users)
    .values({
      supabaseId: `whatsapp_${normalizedNumber}_${Date.now()}`,
      email: `whatsapp_${normalizedNumber}@mentor24h.local`,
      whatsappNumber: normalizedNumber,
      name: `WhatsApp User ${normalizedNumber}`,
      consentGiven: false,
    })
    .returning();

  return newUser;
}

async function logWebhookAudit(
  userId: number,
  messageId: string,
  messageContent: string,
  status: 'received' | 'error'
) {
  try {
    await db
      .insert(messages)
      .values({
        userId,
        whatsappMessageId: messageId,
        content: messageContent,
        status: 'received',
      })
      .returning();
  } catch (error) {
    console.error('[WEBHOOK AUDIT LOG ERROR]', error);
  }
}

export async function POST(request: NextRequest) {
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const inngestKey = process.env.INNGEST_API_KEY;

  try {
    if (!twilioAuthToken || !inngestKey) {
      console.error('[WEBHOOK ERROR] Missing Twilio or Inngest credentials');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    // Valida assinatura Twilio
    const isValidSignature = await validateTwilioSignature(
      request,
      twilioAuthToken
    );

    if (!isValidSignature) {
      console.warn('[WEBHOOK SECURITY] Invalid Twilio signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Parseia payload
    const body = await request.json();
    const validation = twilioWebhookSchema.safeParse(body);

    if (!validation.success) {
      console.error('[WEBHOOK VALIDATION ERROR]', validation.error.errors);
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const payload: TwilioWebhookPayload = validation.data;

    console.log('[WEBHOOK RECEIVED]', {
      messageSid: payload.MessageSid,
      from: payload.From,
      bodyLength: payload.Body.length,
      timestamp: new Date().toISOString(),
    });

    // Encontra ou cria usuário
    const user = await findOrCreateUser(payload.From);

    // Log auditado na database
    await logWebhookAudit(
      user.id,
      payload.MessageSid,
      payload.Body,
      'received'
    );

    // Enfileira evento Inngest
    const eventPayload = {
      userId: user.id.toString(),
      whatsappMessageId: payload.MessageSid,
      fromNumber: payload.From.replace('whatsapp:', ''),
      content: payload.Body,
      mediaUrl: payload.MediaUrl0 || null,
      timestamp: Date.now(),
    };

    await inngest.send(
      whatsappMessageReceivedEvent.create(eventPayload)
    );

    console.log('[WEBHOOK QUEUED]', {
      messageSid: payload.MessageSid,
      userId: user.id,
      status: 'queued',
    });

    return NextResponse.json(
      { status: 'queued', messageId: payload.MessageSid },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WEBHOOK HANDLER ERROR]', {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('Sms');
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

  if (!token || !twilioAuthToken) {
    return NextResponse.json(
      { error: 'Invalid verification request' },
      { status: 403 }
    );
  }

  try {
    const isValid = twilio.validateRequest(
      twilioAuthToken,
      token,
      new URL(request.url).toString().split('?')[0],
      {}
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      );
    }

    return NextResponse.json({ status: 'verified' }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK VERIFICATION ERROR]', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
