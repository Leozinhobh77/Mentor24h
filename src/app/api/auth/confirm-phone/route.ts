import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken } from '@/lib/services/auth.service';
import { checkRateLimit } from '@/lib/utils/ratelimit';
import { PhoneVerificationService } from '@/lib/services/phone-verification.service';

const confirmPhoneSchema = z.object({
  code: z
    .string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d+$/, 'Código deve conter apenas números'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 tentativas por 15 minutos
    const rateLimitCheck = checkRateLimit(request, {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimitCheck.exceeded && rateLimitCheck.response) {
      return rateLimitCheck.response;
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = confirmPhoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || 'Invalid code' },
        { status: 400 }
      );
    }

    const { code } = validation.data;

    // Get user from token
    const userResult = await getUserFromToken(token);
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = userResult.data.user;

    // Confirm verification code
    const result = await PhoneVerificationService.confirmCode(user.id, code);

    if (!result.success) {
      // Map error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        INVALID_CODE: 'Código inválido. Verifique e tente novamente.',
        CODE_EXPIRED: 'Código expirado. Solicite um novo.',
        MAX_ATTEMPTS: 'Máximo de tentativas excedido. Solicite um novo código.',
      };

      const errorMessage = errorMessages[result.error || ''] || result.error || 'Erro desconhecido';

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp verificado com sucesso!',
      data: {
        whatsappVerified: true,
        whatsappVerifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CONFIRM_PHONE ERROR]', { error: message });

    return NextResponse.json(
      { success: false, error: 'Erro ao confirmar código' },
      { status: 500 }
    );
  }
}
