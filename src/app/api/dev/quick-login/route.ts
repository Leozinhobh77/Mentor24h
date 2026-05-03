import { NextResponse } from 'next/server';

/**
 * DESENVOLVIMENTO APENAS
 * Simula login para ver o dashboard
 * Endpoint: GET /api/dev/quick-login
 */
export async function GET() {
  try {
    // Só funciona em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      );
    }

    // Redirecionar direto para dashboard
    // (sem validação, só para visualizar a UI)
    const response = NextResponse.redirect(
      new URL('/dashboard', 'http://localhost:3000')
    );

    return response;
  } catch (error) {
    console.error('[DEV_QUICK_LOGIN]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
