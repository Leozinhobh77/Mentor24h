import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePasswordWithToken } from '@/lib/services/auth.service';

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = updatePasswordSchema.parse(body);

    const result = await updatePasswordWithToken(password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Erro ao atualizar senha' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso',
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
