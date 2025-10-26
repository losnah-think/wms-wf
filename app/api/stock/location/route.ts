import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-009: 재고 로케이션 변경
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      reason,
      userId,
    } = body;

    // 필수값 검증
    if (!productId || !fromWarehouseId || !toWarehouseId || !quantity || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['productId', 'fromWarehouseId', 'toWarehouseId', 'quantity', 'userId'],
        },
        { status: 400 }
      );
    }

    // 같은 창고로의 이동 방지
    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json(
        {
          success: false,
          error: '출발지와 도착지 창고가 동일합니다.',
        },
        { status: 400 }
      );
    }

    // 출발지 재고 확인
    const fromStock = await prisma.warehouseProduct.findFirst({
      where: {
        productId,
        warehouseId: fromWarehouseId,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!fromStock) {
      return NextResponse.json(
        {
          success: false,
          error: '출발지 창고에 해당 상품이 없습니다.',
        },
        { status: 404 }
      );
    }

    if (fromStock.quantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: '이동할 수량이 현재 재고보다 많습니다.',
          available: fromStock.quantity,
          requested: quantity,
        },
        { status: 400 }
      );
    }

    // 도착지 창고 확인
    const toWarehouse = await prisma.warehouse.findUnique({
      where: { id: toWarehouseId },
    });

    if (!toWarehouse) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 도착지 창고입니다.',
        },
        { status: 404 }
      );
    }

    // 트랜잭션으로 재고 이동
    const result = await prisma.$transaction(async (tx) => {
      // 출발지 재고 차감
      await tx.warehouseProduct.update({
        where: { id: fromStock.id },
        data: {
          quantity: fromStock.quantity - quantity,
        },
      });

      // 도착지 재고 확인
      const toStock = await tx.warehouseProduct.findFirst({
        where: {
          productId,
          warehouseId: toWarehouseId,
        },
      });

      if (toStock) {
        // 기존 재고가 있으면 수량 증가
        await tx.warehouseProduct.update({
          where: { id: toStock.id },
          data: {
            quantity: toStock.quantity + quantity,
          },
        });
      } else {
        // 기존 재고가 없으면 새로 생성
        await tx.warehouseProduct.create({
          data: {
            productId,
            warehouseId: toWarehouseId,
            quantity,
          },
        });
      }

      // 감사 로그 기록
      await tx.auditLog.create({
        data: {
          action: 'STOCK_LOCATION_CHANGE',
          entity: 'WarehouseProduct',
          entityId: fromStock.id,
          userId,
          changes: JSON.stringify({
            productId,
            productName: fromStock.product.name,
            fromWarehouse: fromStock.warehouse.name,
            toWarehouse: toWarehouse.name,
            quantity,
            reason: reason || '재고 위치 변경',
            movedAt: new Date().toISOString(),
          }),
        },
      });

      return {
        fromWarehouse: fromStock.warehouse.name,
        toWarehouse: toWarehouse.name,
        remainingAtSource: fromStock.quantity - quantity,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: fromStock.product.id,
          code: fromStock.product.code,
          name: fromStock.product.name,
        },
        movement: {
          from: result.fromWarehouse,
          to: result.toWarehouse,
          quantity,
          remainingAtSource: result.remainingAtSource,
        },
        reason: reason || '재고 위치 변경',
        movedBy: userId,
        movedAt: new Date().toISOString(),
        message: '재고 위치가 변경되었습니다.',
      },
    });
  } catch (error) {
    console.error('Stock location change error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 위치 변경 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
