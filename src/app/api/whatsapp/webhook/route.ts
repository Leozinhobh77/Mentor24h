import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import twilio from 'twilio';
import { db } from '@/lib/db';
import { users, messages } from '@/lib/db/schema';
import { inngest, sendWhatsappMessageReceivedEvent, sendWhatsappMessageFailedEvent } from '@/lib/inngest';
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
        { error: 'Configuration error', status: 'error' },
        { status: 200 }
      );
    }

    // Read body once (Twilio sends form-encoded, not JSON)
    const rawBody = await request.text();
    const formData = Object.fromEntries(new URLSearchParams(rawBody));

    // Validate Twilio signature using the raw form body
    const signature = request.headers.get('x-twilio-signature');
    if (!signature) {
      console.warn('[WEBHOOK SECURITY] Missing Twilio signature');
      return NextResponse.json(
        { error: 'Missing signature', status: 'error' },
        { status: 200 }
      );
    }

    const url = new URL(request.url).toString().split('?')[0];
    const isValidSignature = twilio.validateRequest(
      twilioAuthToken,
      signature,
      url,
      formData as any
    );

    if (!isValidSignature) {
      console.warn('[WEBHOOK SECURITY] Invalid Twilio signature');
      return NextResponse.json(
        { error: 'Invalid signature', status: 'error' },
        { status: 200 }
      );
    }

    // Parse and validate payload
    const validation = twilioWebhookSchema.safeParse(formData);

    if (!validation.success) {
      console.error('[WEBHOOK VALIDATION ERROR]', validation.error.errors);
      return NextResponse.json(
        { error: 'Invalid payload', status: 'error' },
        { status: 200 }
      );
    }

    const payload: TwilioWebhookPayload = validation.data;

    console.log('[WEBHOOK RECEIVED]', {
      messageSid: payload.MessageSid,
      from: payload.From,
      bodyLength: payload.Body.length,
      timestamp: new Date().toISOString(),
    });

    // Find or create user
    const user = await findOrCreateUser(payload.From);

    // Audit log in database
    await logWebhookAudit(
      user.id,
      payload.MessageSid,
      payload.Body,
      'received'
    );

    // Queue Inngest event
    const eventPayload = {
      userId: user.id,
      whatsappMessageId: payload.MessageSid,
      fromNumber: payload.From.replace('whatsapp:', ''),
      content: payload.Body,
      mediaUrl: payload.MediaUrl0 || null,
      timestamp: Date.now(),
    };

    await sendWhatsappMessageReceivedEvent(eventPayload);

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

    // Always return 200 to Twilio so it doesn't retry on internal errors
    return NextResponse.json(
      { status: 'error', message: 'Internal processing error' },
      { status: 200 }
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
