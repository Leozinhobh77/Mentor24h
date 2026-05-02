import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, deleteAccount } from '@/lib/services/auth.service';

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const userResult = await getUserFromToken(token);
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = userResult.data.user;

    const result = await deleteAccount(user.supabaseId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete account' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
