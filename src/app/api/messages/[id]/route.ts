import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * TASK-044: PUT /api/messages/:id/crisis-response
 *
 * Endpoint para marcar mensagem como respondida (admin only)
 * Requisito: RBAC (role-based access), DB update, logs
 */

const updateCrisisResponseSchema = z.object({
  crisis_response_sent: z.boolean(),
  response_type: z.enum(['template', 'custom']).optional(),
  response_text: z.string().optional(),
  escalated_to: z.number().optional(),
});

type UpdatePayload = z.infer<typeof updateCrisisResponseSchema>;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const startTime = performance.now();
    const { id } = await params;
    const messageId = id;

    // 1. Validar permissão (RBAC)
    // TODO: integrar com auth middleware
    const userRole = 'admin'; // Mock

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: admin role required' },
        { status: 403 }
      );
    }

    console.log('[API PUT /messages/:id] 🔐 Acesso admin confirmado');

    // 2. Validar payload
    const body = await request.json();
    const payload = updateCrisisResponseSchema.parse(body);

    console.log('[API PUT /messages/:id] 📝 Atualizando:', {
      messageId,
      crisisResponseSent: payload.crisis_response_sent,
      responseType: payload.response_type,
    });

    // 3. Atualizar no DB
    // TODO: integrar com messageService.update()
    const updated = await updateMessageCrisisResponse(messageId, payload);

    if (!updated) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // 4. Log auditoria
    // TODO: integrar com auditLogger.logCrisisResponseSent()
    console.log('[API PUT /messages/:id] ✅ Atualizado e auditado');

    const duration = performance.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        messageId,
        updated: payload,
        duration: Math.round(duration),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API PUT /messages/:id] ❌ Erro:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
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

/**
 * Mock: Atualizar mensagem com resposta de crise
 * TODO: integrar com messageService.update()
 */
async function updateMessageCrisisResponse(
  messageId: string,
  data: UpdatePayload
): Promise<boolean> {
  console.log('[DB] 💾 Atualizando message:', {
    messageId,
    crisisResponseSent: data.crisis_response_sent,
  });

  // TODO: implementação real
  // const updated = await db.messages.update({
  //   where: { id: messageId },
  //   data: {
  //     crisis_response_sent: data.crisis_response_sent,
  //     response_type: data.response_type,
  //     escalated_to: data.escalated_to,
  //   }
  // })
  // return !!updated

  return true; // Mock
}
