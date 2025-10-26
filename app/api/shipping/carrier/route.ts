import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// OUT-002: 택배사 연동
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      carrier, // CJ대한통운, 한진택배, 로젠택배, 우체국택배
      serviceType, // standard, express, overnight
      userId,
    } = body;

    // 필수값 검증
    if (!orderId || !carrier || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['orderId', 'carrier', 'userId'],
        },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 주문입니다.',
        },
        { status: 404 }
      );
    }

    // 택배사 API 연동 시뮬레이션
    // 실제로는 각 택배사 API를 호출하여 운송장 번호를 생성
    const carrierCodes = {
      'CJ대한통운': 'CJ',
      '한진택배': 'HJ',
      '로젠택배': 'LG',
      '우체국택배': 'KP',
    };

    const carrierCode = carrierCodes[carrier as keyof typeof carrierCodes] || 'XX';
    const trackingNumber = `${carrierCode}${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // 배송비 계산 (간단한 예시)
    const totalWeight = order.items.reduce((sum, item) => {
      return sum + Number(item.product.weight || 0) * item.quantity;
    }, 0);

    let shippingCost = 3000; // 기본 배송비
    if (totalWeight > 5) {
      shippingCost += Math.ceil((totalWeight - 5) / 5) * 1000; // 5kg 초과 시 1kg당 1000원
    }
    if (serviceType === 'express') {
      shippingCost += 2000;
    } else if (serviceType === 'overnight') {
      shippingCost += 5000;
    }

    // 예상 배송일 계산
    const estimatedDeliveryDate = new Date();
    if (serviceType === 'overnight') {
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 1);
    } else if (serviceType === 'express') {
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 2);
    } else {
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);
    }

    // 주문 업데이트
    await prisma.outboundOrder.update({
      where: { id: orderId },
      data: {
        status: 'ready_to_ship',
        notes: `택배사: ${carrier}, 운송장: ${trackingNumber}`,
      },
    });

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'CARRIER_CONNECT',
        entity: 'OutboundOrder',
        entityId: orderId,
        userId,
        changes: JSON.stringify({
          carrier,
          trackingNumber,
          serviceType: serviceType || 'standard',
          shippingCost,
          estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
          connectedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber: order.orderNumber,
        carrier,
        trackingNumber,
        serviceType: serviceType || 'standard',
        shippingInfo: {
          cost: shippingCost,
          weight: totalWeight,
          estimatedDeliveryDate: estimatedDeliveryDate.toISOString().split('T')[0],
        },
        trackingUrl: `https://${carrier}.com/tracking/${trackingNumber}`,
        message: '택배사 연동이 완료되었습니다.',
      },
    });
  } catch (error) {
    console.error('Carrier connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '택배사 연동 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
