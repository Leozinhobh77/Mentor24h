import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/services/auth.service';

/**
 * GET /api/auth/me
 * Returns current authenticated user
 * Requires valid JWT in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const result = await getUserFromToken(token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[GET ME ERROR]', message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
