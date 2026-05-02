import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken, updateProfile } from '@/lib/services/auth.service';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  preferredAssistant: z.enum(['Mateus', 'Ana', 'Carlos', 'Juliana', 'Roberto', 'Fernanda']).optional(),
  timezone: z.enum(['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Belem', 'America/Recife']).optional(),
  whatsappNumber: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
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
    const updates = updateProfileSchema.parse(body);

    // Validate token and get user
    const userResult = await getUserFromToken(token);
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = userResult.data.user;

    // Update profile
    const result = await updateProfile({
      supabaseId: user.supabaseId,
      ...updates,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update profile' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
