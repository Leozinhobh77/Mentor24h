import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken } from '@/lib/services/auth.service';
import { PhoneVerificationService } from '@/lib/services/phone-verification.service';
import { normalizePhoneNumber } from '@/lib/utils/phone.helpers';

const verifyPhoneSchema = z.object({
  phoneNumber: z.string().min(10, 'Número de telefone inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = verifyPhoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { phoneNumber: rawPhoneNumber } = validation.data;

    // Validate and normalize phone number
    const normalizedPhone = normalizePhoneNumber(rawPhoneNumber);
    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'Número de telefone inválido. Use formato: +55XXXXXXXXXX' },
        { status: 400 }
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

    const user = userResult.data.user;

    // Send verification code
    const result = await PhoneVerificationService.sendVerificationCode(
      user.id,
      normalizedPhone
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Erro ao enviar código de verificação' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Código de verificação enviado para seu WhatsApp',
      codeSentAt: result.codeSentAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[VERIFY_PHONE ERROR]', { error: message });

    return NextResponse.json(
      { success: false, error: 'Erro ao enviar código de verificação' },
      { status: 500 }
    );
  }
}
