import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// STK-011: 재고 상태 변경
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      warehouseId,
      changeQuantity,
      fromStatus,
      toStatus,
      reason,
      userId,
    } = body;

    // 필수값 검증
    if (!productId || !changeQuantity || !fromStatus || !toStatus || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['productId', 'changeQuantity', 'fromStatus', 'toStatus', 'userId'],
        },
        { status: 400 }
      );
    }

    // 상태 유효성 검증
    const validStatuses = ['정상', '예약', '불량'];
    if (!validStatuses.includes(fromStatus) || !validStatuses.includes(toStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 재고 상태입니다.',
          validStatuses,
        },
        { status: 400 }
      );
    }

    // 같은 상태로 변경 시도 방지
    if (fromStatus === toStatus) {
      return NextResponse.json(
        {
          success: false,
          error: '변경 전후 상태가 동일합니다.',
        },
        { status: 400 }
      );
    }

    // 재고 확인
    const whereClause: any = { productId };
    if (warehouseId) {
      whereClause.warehouseId = warehouseId;
    }

    const stocks = await prisma.warehouseProduct.findMany({
      where: whereClause,
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (stocks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '재고를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 총 재고 계산 (현재는 전체를 정상 재고로 간주)
    const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);

    // 현재 상태별 재고 (간단히 처리 - 실제로는 별도 테이블 필요)
    // 임시로 전체를 정상으로 간주하고 변경 가능 여부만 체크
    if (fromStatus === '정상' && changeQuantity > totalStock) {
      return NextResponse.json(
        {
          success: false,
          error: '변경할 수량이 현재 정상 재고보다 많습니다.',
          available: totalStock,
          requested: changeQuantity,
        },
        { status: 400 }
      );
    }

    // 상태 변경 기록 생성
    const changeRecord = await prisma.auditLog.create({
      data: {
        action: 'STOCK_STATUS_CHANGE',
        entity: 'WarehouseProduct',
        entityId: stocks[0].id,
        userId,
        changes: JSON.stringify({
          productId,
          productName: stocks[0].product.name,
          warehouseId: warehouseId || 'all',
          changeQuantity,
          fromStatus,
          toStatus,
          reason: reason || '상태 변경',
          changedAt: new Date().toISOString(),
        }),
      },
    });

    // 변경 전후 상태 분포 계산 (임시 데이터)
    const beforeDistribution = {
      정상: fromStatus === '정상' ? totalStock : 0,
      예약: fromStatus === '예약' ? totalStock : 0,
      불량: fromStatus === '불량' ? totalStock : 0,
    };

    const afterDistribution = {
      정상: toStatus === '정상' ? changeQuantity : beforeDistribution.정상 - (fromStatus === '정상' ? changeQuantity : 0),
      예약: toStatus === '예약' ? changeQuantity : beforeDistribution.예약 - (fromStatus === '예약' ? changeQuantity : 0),
      불량: toStatus === '불량' ? changeQuantity : beforeDistribution.불량 - (fromStatus === '불량' ? changeQuantity : 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        changeId: changeRecord.id,
        status: '성공',
        product: {
          id: stocks[0].product.id,
          code: stocks[0].product.code,
          name: stocks[0].product.name,
        },
        changeInfo: {
          quantity: changeQuantity,
          fromStatus,
          toStatus,
          reason: reason || '상태 변경',
        },
        beforeDistribution,
        afterDistribution,
        changedAt: changeRecord.createdAt,
        changedBy: userId,
      },
    });
  } catch (error) {
    console.error('Stock status change error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 상태 변경 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
