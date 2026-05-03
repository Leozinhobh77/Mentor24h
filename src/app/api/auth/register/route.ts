import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/services/auth.service';
import { checkRateLimit } from '@/lib/utils/ratelimit';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  whatsappNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 60 tentativas por 1 hora
    const rateLimitCheck = checkRateLimit(request, {
      maxRequests: 60,
      windowMs: 60 * 60 * 1000,
    });

    if (rateLimitCheck.exceeded && rateLimitCheck.response) {
      return rateLimitCheck.response;
    }

    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validação falhou',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Register user
    const result = await register(validation.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[REGISTER ERROR]', message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
