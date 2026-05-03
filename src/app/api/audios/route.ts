import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { audios, categories } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/services/auth.service';
import { eq } from 'drizzle-orm';

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

    // Get user from token
    const userResult = await getUserFromToken(token);
    if (!userResult.success || !userResult.data?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get all audios
    const allAudios = await db.select().from(audios);

    // Apply limit and offset
    const paginatedAudios = allAudios.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedAudios.map((audio) => ({
        id: audio.id,
        title: audio.title,
        duration: audio.duration,
        categoryId: audio.categoryId,
        audioUrl: audio.audioUrl,
        instructor: audio.instructor,
      })),
      pagination: {
        limit,
        offset,
        total: allAudios.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET_AUDIOS ERROR]', { error: message });

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar áudios' },
      { status: 500 }
    );
  }
}
