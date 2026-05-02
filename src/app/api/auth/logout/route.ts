import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const result = await logout();

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
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[LOGOUT ERROR]', message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
