import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-004: 출고 처리 (수동)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      quantity,
      orderId,
      warehouseId,
      reason,
      handledBy,
    } = body;

    // 필수값 검증
    if (!productId || !quantity || !warehouseId || !handledBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['productId', 'quantity', 'warehouseId', 'handledBy'],
        },
        { status: 400 }
      );
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 상품입니다.',
        },
        { status: 404 }
      );
    }

    // 창고 재고 확인
    const stock = await prisma.warehouseProduct.findFirst({
      where: {
        warehouseId: warehouseId,
        productId: productId,
      },
    });

    if (!stock) {
      return NextResponse.json(
        {
          success: false,
          status: '재고부족',
          error: '해당 창고에 재고가 없습니다.',
        },
        { status: 400 }
      );
    }

    // 가용 재고 확인
    if (stock.quantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          status: '재고부족',
          error: '가용 재고가 부족합니다.',
          available: stock.quantity,
          requested: quantity,
        },
        { status: 400 }
      );
    }

    // 트랜잭션으로 출고 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 출고 주문 생성 (또는 기존 주문 사용)
      let outboundOrder;
      
      if (orderId) {
        outboundOrder = await tx.outboundOrder.findUnique({
          where: { id: orderId },
        });
        
        if (!outboundOrder) {
          throw new Error('존재하지 않는 주문입니다.');
        }
      } else {
        // 수동 출고의 경우 새 주문 생성
        outboundOrder = await tx.outboundOrder.create({
          data: {
            orderNumber: `MANUAL-${Date.now()}`,
            orderDate: new Date(),
            status: 'shipped',
            totalQuantity: quantity,
            totalAmount: 0,
            notes: `수동 출고 - 사유: ${reason || '수동 출고'}`,
          },
        });
      }

      // 2. 출고 아이템 생성
      const outboundItem = await tx.outboundOrderItem.create({
        data: {
          orderId: outboundOrder.id,
          productId: productId,
          quantity: quantity,
          pickedQty: quantity,
          packedQty: quantity,
        },
      });

      // 3. 재고 감소
      await tx.warehouseProduct.update({
        where: { id: stock.id },
        data: {
          quantity: stock.quantity - quantity,
        },
      });

      // 4. 작업 로그 기록
      await tx.auditLog.create({
        data: {
          action: 'OUTBOUND_MANUAL',
          entity: 'OutboundOrder',
          entityId: outboundOrder.id,
          userId: handledBy,
          changes: JSON.stringify({
            productId,
            quantity,
            warehouseId,
            reason: reason || '수동 출고',
            orderId: orderId || null,
          }),
        },
      });

      return {
        outboundOrder,
        outboundItem,
      };
    });

    // 업데이트된 재고 조회
    const updatedStock = await prisma.warehouseProduct.findFirst({
      where: {
        warehouseId: warehouseId,
        productId: productId,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        outboundId: result.outboundOrder.id,
        outboundDate: result.outboundOrder.orderDate,
        status: '완료',
        updatedStock: {
          productId: updatedStock?.productId,
          productName: updatedStock?.product.name,
          warehouseName: updatedStock?.warehouse.name,
          quantity: updatedStock?.quantity,
        },
        outboundRecord: {
          id: result.outboundOrder.id,
          orderNumber: result.outboundOrder.orderNumber,
          quantity: quantity,
          reason: reason || '수동 출고',
          handledBy: handledBy,
          createdAt: result.outboundOrder.orderDate,
        },
      },
    });
  } catch (error) {
    console.error('Manual outbound error:', error);
    return NextResponse.json(
      {
        success: false,
        status: '실패',
        error: '출고 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
