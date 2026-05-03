import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * TASK-037: GET /api/messages
 * Search + Filtros (severity, data)
 * Requisitos: Busca LIKE, filtros combinados, < 200ms
 */

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  severity: z.coerce.number().min(0).max(10).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  crisis: z.enum(['true', 'false']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const startTime = performance.now();

    // Parse query params
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const validated = querySchema.parse(params);

    // Mock data (será substituído por DB real)
    const mockMessages = [
      {
        id: '1',
        userId: 1,
        body: 'Oi, tudo bem? Estou com dificuldade para dormir',
        direction: 'inbound' as const,
        severity: 4,
        is_crisis: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        userId: 1,
        body: 'Não aguento mais, quero morrer',
        direction: 'inbound' as const,
        severity: 9,
        is_crisis: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: '3',
        userId: 1,
        body: 'Preciso de ajuda com finanças, estou endividado',
        direction: 'inbound' as const,
        severity: 6,
        is_crisis: false,
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: '4',
        userId: 1,
        body: 'Obrigado pela dica de meditação, me ajudou muito!',
        direction: 'inbound' as const,
        severity: 1,
        is_crisis: false,
        created_at: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: '5',
        userId: 1,
        body: 'Sou suicida, não vejo sentido em nada',
        direction: 'inbound' as const,
        severity: 10,
        is_crisis: true,
        created_at: new Date(Date.now() - 18000000).toISOString(),
      },
    ];

    // Aplicar filtros
    let filtered = mockMessages;

    // Filtro por texto (search)
    if (validated.search) {
      const searchLower = validated.search.toLowerCase();
      filtered = filtered.filter((msg) =>
        msg.body.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por severity
    if (validated.severity !== undefined) {
      const minSeverity = validated.severity;
      filtered = filtered.filter((msg) => msg.severity >= minSeverity);
    }

    // Filtro por crise
    if (validated.crisis) {
      const isCrisis = validated.crisis === 'true';
      filtered = filtered.filter((msg) => msg.is_crisis === isCrisis);
    }

    // Filtro por data
    if (validated.startDate) {
      const start = new Date(validated.startDate);
      filtered = filtered.filter(
        (msg) => new Date(msg.created_at) >= start
      );
    }

    if (validated.endDate) {
      const end = new Date(validated.endDate);
      filtered = filtered.filter(
        (msg) => new Date(msg.created_at) <= end
      );
    }

    // Ordenar por data (mais recentes primeiro)
    filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Paginação
    const total = filtered.length;
    const paginated = filtered.slice(
      validated.offset,
      validated.offset + validated.limit
    );

    const duration = performance.now() - startTime;

    // Log performance
    if (duration > 200) {
      console.warn(
        `[API /messages] ⚠️ Performance: ${duration.toFixed(2)}ms (> 200ms)`,
        { search: validated.search, severity: validated.severity }
      );
    } else {
      console.log(
        `[API /messages] ✅ Performance: ${duration.toFixed(2)}ms`,
        {
          search: validated.search,
          severity: validated.severity,
          resultsCount: paginated.length,
        }
      );
    }

    return NextResponse.json({
      messages: paginated,
      total,
      limit: validated.limit,
      offset: validated.offset,
      duration: Math.round(duration),
    });
  } catch (error) {
    console.error('[API /messages] ❌ Erro:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
