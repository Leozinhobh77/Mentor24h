import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (token) {
      const supabase = createSupabaseWithToken(token);
      await supabase.auth.signOut({ scope: 'local' });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[LOGOUT ERROR]', message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
