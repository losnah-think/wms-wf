import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PIC-002: 피킹 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const workerId = searchParams.get('workerId');

    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (workerId) {
      whereClause.assignedWorker = workerId;
    }

    const pickings = await prisma.pickingTask.findMany({
      where: whereClause,
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 데이터 포맷팅
    const data = pickings.map((picking) => {
      const totalItems = picking.order.items.length;
      const pickedItems = picking.order.items.filter(
        item => item.pickedQty >= item.quantity
      ).length;
      const completionRate = totalItems > 0
        ? ((pickedItems / totalItems) * 100).toFixed(1)
        : '0.0';

      return {
        id: picking.id,
        orderId: picking.orderId,
        status: picking.status,
        assignedWorker: picking.assignedWorker,
        completionRate: `${completionRate}%`,
        totalItems,
        pickedItems,
        items: picking.order.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          orderedQty: item.quantity,
          pickedQty: item.pickedQty || 0,
        })),
        startTime: picking.startTime,
        completionTime: picking.completionTime,
        createdAt: picking.createdAt,
      };
    });

    console.log(`[API] GET /api/picking/pick - 조회됨: ${data.length}건`);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: data.length,
      },
    });
  } catch (error) {
    console.error('Picking list GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '피킹 목록 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PIC-003: 개별 상품 피킹
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, productId, pickedQuantity, lotNumber } = body;

    // 필수값 검증
    if (!assignmentId || !productId || !pickedQuantity || !lotNumber) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['assignmentId', 'productId', 'pickedQuantity', 'lotNumber'],
        },
        { status: 400 }
      );
    }

    // 피킹 작업 조회
    const pickingTask = await prisma.pickingTask.findUnique({
      where: { id: assignmentId },
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

    // 해당 상품이 주문에 포함되어 있는지 확인
    const orderItem = pickingTask.order.items.find(
      item => item.productId === productId
    );

    if (!orderItem) {
      return NextResponse.json(
        {
          success: false,
          error: '주문에 포함되지 않은 상품입니다.',
        },
        { status: 400 }
      );
    }

    // 수량 일치 확인
    const isQuantityMatch = pickedQuantity === orderItem.quantity;
    
    if (!isQuantityMatch && pickedQuantity > orderItem.quantity) {
      return NextResponse.json(
        {
          success: false,
          status: '오류',
          error: '피킹 수량이 주문 수량을 초과합니다.',
          errorMessage: `주문 수량: ${orderItem.quantity}, 피킹 수량: ${pickedQuantity}`,
        },
        { status: 400 }
      );
    }

    // 트랜잭션으로 피킹 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 주문 아이템 피킹 수량 업데이트
      await tx.outboundOrderItem.update({
        where: { id: orderItem.id },
        data: { pickedQty: pickedQuantity },
      });

      // 2. 피킹 작업 상태 업데이트
      if (pickingTask.status === 'pending') {
        await tx.pickingTask.update({
          where: { id: assignmentId },
          data: {
            status: 'picking',
            startTime: new Date(),
          },
        });
      }

      // 3. 피킹 로그 기록
      await tx.auditLog.create({
        data: {
          action: 'PRODUCT_PICKED',
          entity: 'OutboundOrderItem',
          entityId: orderItem.id,
          userId: pickingTask.assignedWorker || 'SYSTEM',
          changes: JSON.stringify({
            assignmentId,
            productId,
            productName: orderItem.product.name,
            orderedQuantity: orderItem.quantity,
            pickedQuantity,
            lotNumber,
            isQuantityMatch,
          }),
        },
      });

      return { orderItem };
    });

    // 완료율 계산
    const updatedOrder = await prisma.outboundOrder.findUnique({
      where: { id: pickingTask.orderId },
      include: {
        items: true,
      },
    });

    const totalItems = updatedOrder?.items.length || 0;
    const pickedItems = updatedOrder?.items.filter(
      item => item.pickedQty >= item.quantity
    ).length || 0;
    const completionRate = totalItems > 0
      ? ((pickedItems / totalItems) * 100).toFixed(1)
      : '0.0';

    // 모든 상품 피킹 완료 시 작업 완료
    if (pickedItems === totalItems && updatedOrder) {
      await prisma.pickingTask.update({
        where: { id: assignmentId },
        data: {
          status: 'completed',
          completionTime: new Date(),
        },
      });

      await prisma.outboundOrder.update({
        where: { id: updatedOrder.id },
        data: { status: 'packing' },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        pickingId: assignmentId,
        status: pickedItems === totalItems ? '완료' : '진행중',
        product: {
          id: orderItem.productId,
          code: orderItem.product.code,
          name: orderItem.product.name,
        },
        orderedQuantity: orderItem.quantity,
        pickedQuantity,
        lotNumber,
        completionRate: `${completionRate}%`,
        remainingItems: totalItems - pickedItems,
        isQuantityMatch,
        errorMessage: !isQuantityMatch
          ? `수량 불일치: 주문 ${orderItem.quantity}개, 피킹 ${pickedQuantity}개`
          : null,
      },
    });
  } catch (error) {
    console.error('Product picking error:', error);
    return NextResponse.json(
      {
        success: false,
        status: '오류',
        error: '상품 피킹 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
