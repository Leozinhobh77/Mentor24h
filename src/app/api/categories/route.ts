import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, userCategories } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/services/auth.service';
import { asc, eq, isNull, and } from 'drizzle-orm';

interface CategoryWithSelection {
  id: number;
  name: string;
  icon?: string;
  pillar: string;
  order: number;
  isSelected: boolean;
}

interface GroupedCategories {
  organization: CategoryWithSelection[];
  inspiration: CategoryWithSelection[];
  entertainment: CategoryWithSelection[];
  wellbeing: CategoryWithSelection[];
}

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

    const user = userResult.data.user;

    // Get all categories
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.order));

    // Get user's selected categories (not deleted)
    const selectedCats = await db
      .select({ categoryId: userCategories.categoryId })
      .from(userCategories)
      .where(
        and(
          eq(userCategories.userId, user.id),
          isNull(userCategories.deletedAt)
        )
      );

    const selectedIds = new Set(selectedCats.map((c) => c.categoryId));

    // Group categories by pillar with selection status
    const grouped: GroupedCategories = {
      organization: [],
      inspiration: [],
      entertainment: [],
      wellbeing: [],
    };

    for (const cat of allCategories) {
      const catWithSelection: CategoryWithSelection = {
        id: cat.id,
        name: cat.name,
        icon: cat.icon || '📌',
        pillar: cat.pillar,
        order: cat.order,
        isSelected: selectedIds.has(cat.id),
      };

      grouped[cat.pillar as keyof GroupedCategories].push(catWithSelection);
    }

    const selectedCount = selectedIds.size;

    return NextResponse.json({
      success: true,
      data: grouped,
      meta: {
        total: allCategories.length,
        selected: selectedCount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET_CATEGORIES ERROR]', { error: message });

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}
