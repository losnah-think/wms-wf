import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PIC-009: 피킹 작업 재할당
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickingTaskId, newWorkerId, reason, userId } = body;

    // 필수값 검증
    if (!pickingTaskId || !newWorkerId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['pickingTaskId', 'newWorkerId', 'userId'],
        },
        { status: 400 }
      );
    }

    // 피킹 작업 조회
    const pickingTask = await prisma.pickingTask.findUnique({
      where: { id: pickingTaskId },
      include: {
        order: true,
      },
    });

    if (!pickingTask) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 피킹 작업입니다.',
        },
        { status: 404 }
      );
    }

    // 완료 또는 취소된 작업은 재할당 불가
    if (pickingTask.status === 'completed' || pickingTask.status === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          error: '완료 또는 취소된 작업은 재할당할 수 없습니다.',
          currentStatus: pickingTask.status,
        },
        { status: 400 }
      );
    }

    const previousWorker = pickingTask.assignedWorker;

    // 작업 재할당
    await prisma.pickingTask.update({
      where: { id: pickingTaskId },
      data: {
        assignedWorker: newWorkerId,
        status: 'pending', // 다시 대기 상태로
        notes: `재할당: ${previousWorker} → ${newWorkerId}. 사유: ${reason || '-'}`,
      },
    });

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'REASSIGN',
        entity: 'PickingTask',
        entityId: pickingTaskId,
        userId,
        changes: JSON.stringify({
          pickingNumber: pickingTask.pickingNumber,
          orderNumber: pickingTask.order.orderNumber,
          previousWorker,
          newWorker: newWorkerId,
          reason: reason || '-',
          reassignedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        pickingTaskId,
        pickingNumber: pickingTask.pickingNumber,
        orderNumber: pickingTask.order.orderNumber,
        previousWorker,
        newWorker: newWorkerId,
        reason: reason || '-',
        reassignedBy: userId,
        reassignedAt: new Date().toISOString(),
        message: '피킹 작업이 재할당되었습니다.',
      },
    });
  } catch (error) {
    console.error('Picking task reassignment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '피킹 작업 재할당 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
