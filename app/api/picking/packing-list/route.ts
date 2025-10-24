import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PIC-005: 패킹리스트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickingTaskId, userId } = body;

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
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
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

    // 피킹 완료 여부 확인
    if (pickingTask.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: '완료되지 않은 피킹 작업입니다.',
          currentStatus: pickingTask.status,
        },
        { status: 400 }
      );
    }

    // 패킹 작업 생성
    const packingTask = await prisma.packingTask.create({
      data: {
        packingNumber: `PK${Date.now()}`,
        orderId: pickingTask.orderId,
        assignedWorker: userId,
        status: 'pending',
      },
    });

    // 패킹 리스트 데이터 생성
    const packingList = {
      packingId: packingTask.id,
      orderNumber: pickingTask.order.orderNumber,
      createdAt: packingTask.createdAt,
      items: pickingTask.order.items.map(item => ({
        productCode: item.product.code,
        productName: item.product.name,
        quantity: item.quantity,
        checked: false,
      })),
      totalItems: pickingTask.order.items.length,
      totalQuantity: pickingTask.order.items.reduce((sum, item) => sum + item.quantity, 0),
    };

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'PackingTask',
        entityId: packingTask.id,
        userId,
        changes: JSON.stringify({
          orderId: pickingTask.orderId,
          orderNumber: pickingTask.order.orderNumber,
          pickingTaskId,
          status: 'pending',
          createdAt: packingTask.createdAt,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        packingList,
        message: '패킹리스트가 생성되었습니다.',
      },
    });
  } catch (error) {
    console.error('Packing list creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '패킹리스트 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
