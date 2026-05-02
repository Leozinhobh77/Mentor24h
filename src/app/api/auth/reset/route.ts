import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resetPassword } from '@/lib/services/auth.service';

const resetSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resetSchema.parse(body);

    const result = await resetPassword(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Erro ao enviar email de reset' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email de recuperação enviado. Verifique sua caixa de entrada.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
