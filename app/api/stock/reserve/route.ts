import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-008: 재고 예약
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      warehouseId,
      quantity,
      orderId,
      expiresAt,
      userId,
    } = body;

    // 필수값 검증
    if (!productId || !quantity || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['productId', 'quantity', 'userId'],
        },
        { status: 400 }
      );
    }

    // 가용 재고 확인
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

    // 총 가용 재고 계산
    const totalAvailable = stocks.reduce((sum, s) => sum + s.quantity, 0);

    if (totalAvailable < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: '가용 재고가 부족합니다.',
          available: totalAvailable,
          requested: quantity,
        },
        { status: 400 }
      );
    }

    // 예약 만료 시간 설정 (기본 24시간)
    const reservationExpiry = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 예약 ID 생성
    const reservationId = `RSV${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 감사 로그에 예약 기록
    await prisma.auditLog.create({
      data: {
        action: 'STOCK_RESERVE',
        entityId: stocks[0].id,
        userId,
        changes: JSON.stringify({
          reservationId,
          productId,
          productName: stocks[0].product.name,
          warehouseId: warehouseId || 'all',
          quantity,
          orderId: orderId || null,
          expiresAt: reservationExpiry.toISOString(),
          reservedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reservationId,
        product: {
          id: stocks[0].product.id,
          code: stocks[0].product.code,
          name: stocks[0].product.name,
        },
        reservation: {
          quantity,
          warehouse: stocks[0].warehouse?.name || 'Multiple',
          orderId: orderId || null,
          expiresAt: reservationExpiry.toISOString(),
        },
        remainingAvailable: totalAvailable - quantity,
        reservedBy: userId,
        reservedAt: new Date().toISOString(),
        message: '재고가 예약되었습니다.',
      },
    });
  } catch (error) {
    console.error('Stock reservation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 예약 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 예약 취소
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');
    const userId = searchParams.get('userId');

    if (!reservationId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 파라미터가 누락되었습니다.',
          required: ['reservationId', 'userId'],
        },
        { status: 400 }
      );
    }

    // 예약 취소 기록
    await prisma.auditLog.create({
      data: {
        action: 'STOCK_UNRESERVE',
        entityId: reservationId,
        userId,
        changes: JSON.stringify({
          reservationId,
          cancelledAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reservationId,
        cancelledBy: userId,
        cancelledAt: new Date().toISOString(),
        message: '재고 예약이 취소되었습니다.',
      },
    });
  } catch (error) {
    console.error('Reservation cancellation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '예약 취소 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
