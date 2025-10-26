import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// PIC-008: 피킹 작업 취소
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickingTaskId, reason, userId } = body;

    // 필수값 검증
    if (!pickingTaskId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['pickingTaskId', 'userId'],
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

    // 완료된 작업은 취소 불가
    if (pickingTask.status === 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: '완료된 작업은 취소할 수 없습니다.',
          currentStatus: pickingTask.status,
        },
        { status: 400 }
      );
    }

    // 작업 취소
    await prisma.pickingTask.update({
      where: { id: pickingTaskId },
      data: {
        status: 'cancelled',
        notes: `취소 사유: ${reason || '사용자 요청'}`,
      },
    });

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'CANCEL',
        entity: 'PickingTask',
        entityId: pickingTaskId,
        userId,
        changes: JSON.stringify({
          pickingNumber: pickingTask.pickingNumber,
          orderNumber: pickingTask.order.orderNumber,
          previousStatus: pickingTask.status,
          reason: reason || '사용자 요청',
          cancelledAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        pickingTaskId,
        pickingNumber: pickingTask.pickingNumber,
        orderNumber: pickingTask.order.orderNumber,
        previousStatus: pickingTask.status,
        reason: reason || '사용자 요청',
        cancelledBy: userId,
        cancelledAt: new Date().toISOString(),
        message: '피킹 작업이 취소되었습니다.',
      },
    });
  } catch (error) {
    console.error('Picking task cancellation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '피킹 작업 취소 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
