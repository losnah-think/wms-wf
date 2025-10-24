import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PIC-002: 피킹 작업 할당
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, workerId, assignedQuantity } = body;

    // 필수값 검증
    if (!orderId || !workerId) {
      return NextResponse.json(
        {
          success: false,
          error: '주문 ID와 작업자 ID가 필요합니다.',
          required: ['orderId', 'workerId'],
        },
        { status: 400 }
      );
    }

    // 주문 존재 확인
    const order = await prisma.outboundOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 주문입니다.',
        },
        { status: 404 }
      );
    }

    // 주문이 이미 할당되었는지 확인
    if (order.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: `이미 ${order.status} 상태인 주문입니다.`,
        },
        { status: 400 }
      );
    }

    // 작업자의 현재 작업 부하 확인
    const workerCurrentTasks = await prisma.pickingTask.findMany({
      where: {
        assignedWorker: workerId,
        status: {
          in: ['pending', 'picking'],
        },
      },
    });

    const currentWorkload = workerCurrentTasks.length;

    // 예상 처리 시간 계산 (아이템당 5분 가정)
    const estimatedMinutes = order.items.length * 5;

    // 트랜잭션으로 할당 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 피킹 작업 생성
      const pickingNumber = `PICK-${Date.now()}`;
      const pickingTask = await tx.pickingTask.create({
        data: {
          pickingNumber,
          orderId,
          status: 'pending',
          assignedWorker: workerId,
          notes: assignedQuantity
            ? `할당 수량: ${assignedQuantity}`
            : '전체 상품 피킹',
        },
      });

      // 2. 주문 상태 업데이트
      await tx.outboundOrder.update({
        where: { id: orderId },
        data: { status: 'picking' },
      });

      // 3. 작업 로그 기록
      await tx.auditLog.create({
        data: {
          action: 'PICKING_ASSIGNED',
          entity: 'PickingTask',
          entityId: pickingTask.id,
          userId: workerId,
          changes: JSON.stringify({
            orderId,
            orderNumber: order.orderNumber,
            workerId,
            itemCount: order.items.length,
            totalQuantity: order.totalQuantity,
            assignedQuantity: assignedQuantity || order.totalQuantity,
          }),
        },
      });

      return pickingTask;
    });

    return NextResponse.json({
      success: true,
      data: {
        assignmentId: result.id,
        pickingNumber: result.pickingNumber,
        status: '할당완료',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalQuantity: order.totalQuantity,
          itemCount: order.items.length,
        },
        worker: {
          id: workerId,
          currentWorkload,
        },
        estimatedMinutes,
        assignedAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error('Picking assignment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '피킹 작업 할당 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
