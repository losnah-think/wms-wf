import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// PIC-010: 일괄 피킹
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds, workerId, userId } = body; // orderIds: array of order IDs

    // 필수값 검증
    if (!orderIds || !Array.isArray(orderIds) || !workerId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['orderIds (array)', 'workerId', 'userId'],
        },
        { status: 400 }
      );
    }

    if (orderIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '주문 ID 목록이 비어있습니다.',
        },
        { status: 400 }
      );
    }

    const results = {
      total: orderIds.length,
      success: 0,
      failed: 0,
      tasks: [] as any[],
      errors: [] as any[],
    };

    // 각 주문에 대해 피킹 작업 생성
    for (const orderId of orderIds) {
      try {
        // 주문 조회
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
          results.failed++;
          results.errors.push({
            orderId,
            error: '존재하지 않는 주문입니다.',
          });
          continue;
        }

        // 이미 피킹 작업이 있는지 확인
        const existingTask = await prisma.pickingTask.findFirst({
          where: {
            orderId,
            status: {
              notIn: ['cancelled'],
            },
          },
        });

        if (existingTask) {
          results.failed++;
          results.errors.push({
            orderId,
            orderNumber: order.orderNumber,
            error: '이미 피킹 작업이 존재합니다.',
          });
          continue;
        }

        // 피킹 작업 생성
        const pickingTask = await prisma.pickingTask.create({
          data: {
            pickingNumber: `PK${Date.now()}${Math.floor(Math.random() * 1000)}`,
            orderId,
            status: 'pending',
            assignedWorker: workerId,
          },
        });

        results.success++;
        results.tasks.push({
          pickingTaskId: pickingTask.id,
          pickingNumber: pickingTask.pickingNumber,
          orderNumber: order.orderNumber,
          itemCount: order.items.length,
          totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        });
      } catch (error) {
        results.failed++;
        results.errors.push({
          orderId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'BATCH_PICKING',
        entity: 'PickingTask',
        entityId: 'bulk',
        userId,
        changes: JSON.stringify({
          totalOrders: results.total,
          successCount: results.success,
          failedCount: results.failed,
          workerId,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: results.failed === 0,
      data: {
        summary: {
          total: results.total,
          success: results.success,
          failed: results.failed,
          successRate: `${Math.round((results.success / results.total) * 100)}%`,
        },
        assignedWorker: workerId,
        tasks: results.tasks,
        errors: results.errors,
        message: results.failed === 0
          ? `${results.success}개 피킹 작업이 생성되었습니다.`
          : `${results.success}개 성공, ${results.failed}개 실패`,
      },
    });
  } catch (error) {
    console.error('Batch picking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '일괄 피킹 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
