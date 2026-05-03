import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userCategories } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/services/auth.service';
import { eq, and, isNull } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: 'ID da categoria inválido' },
        { status: 400 }
      );
    }

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

    const user = userResult.data.user;

    // Check if user already has this category selected
    const existing = await db
      .select()
      .from(userCategories)
      .where(
        and(
          eq(userCategories.userId, user.id),
          eq(userCategories.categoryId, categoryId)
        )
      )
      .limit(1);

    let isSelected = false;

    if (existing.length === 0) {
      // Not exists → INSERT (activate)
      await db.insert(userCategories).values({
        userId: user.id,
        categoryId: categoryId,
        selectedAt: new Date(),
        deletedAt: null,
      });
      isSelected = true;
    } else {
      const record = existing[0];

      if (record.deletedAt === null) {
        // Exists and active → UPDATE deletedAt (deactivate)
        await db
          .update(userCategories)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(userCategories.userId, user.id),
              eq(userCategories.categoryId, categoryId)
            )
          );
        isSelected = false;
      } else {
        // Exists but deleted → UPDATE deletedAt = null (reactivate)
        await db
          .update(userCategories)
          .set({ deletedAt: null })
          .where(
            and(
              eq(userCategories.userId, user.id),
              eq(userCategories.categoryId, categoryId)
            )
          );
        isSelected = true;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        categoryId,
        isSelected,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[TOGGLE_CATEGORY ERROR]', { error: message });

    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}
