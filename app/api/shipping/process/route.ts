import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// OUT-001: 배송 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      carrier,
      shippingFee,
      shippingAddress,
      recipientName,
      recipientPhone,
    } = body;

    // 필수값 검증
    if (!orderId || !carrier || !shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['orderId', 'carrier', 'shippingAddress'],
        },
        { status: 400 }
      );
    }

    // 주문 확인
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

    // 주문 상태 확인 (피킹/패킹 완료 상태여야 함)
    if (order.status === 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: '피킹이 완료되지 않은 주문입니다.',
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // 송장번호 생성 (실제로는 배송사 API 연동)
    const trackingNumber = `${carrier.substring(0, 3).toUpperCase()}-${Date.now()}`;
    
    // 배송 시작 시간
    const shippingStartTime = new Date();
    
    // 예상 배송일 계산 (3일 후)
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 3);

    // 트랜잭션으로 배송 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 주문 상태 업데이트
      const updatedOrder = await tx.outboundOrder.update({
        where: { id: orderId },
        data: {
          status: 'shipped',
          shippingDate: shippingStartTime,
          expectedDelivery,
          notes: `배송사: ${carrier}, 송장: ${trackingNumber}${order.notes ? `\n${order.notes}` : ''}`,
        },
      });

      // 2. 배송 로그 기록
      await tx.auditLog.create({
        data: {
          action: 'SHIPPING_START',
          entity: 'OutboundOrder',
          entityId: orderId,
          userId: 'SHIPPING_SYSTEM',
          changes: JSON.stringify({
            orderId,
            orderNumber: order.orderNumber,
            carrier,
            trackingNumber,
            shippingFee: shippingFee || 0,
            shippingAddress,
            recipientName: recipientName || '수령인',
            recipientPhone: recipientPhone || '-',
            shippingStartTime: shippingStartTime.toISOString(),
            expectedDelivery: expectedDelivery.toISOString(),
          }),
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      data: {
        shippingId: result.id,
        trackingNumber,
        status: '배송중',
        order: {
          id: result.id,
          orderNumber: result.orderNumber,
          itemCount: order.items.length,
          totalQuantity: result.totalQuantity,
        },
        shipping: {
          carrier,
          shippingFee: shippingFee || 0,
          startTime: shippingStartTime,
          expectedDelivery,
        },
        recipient: {
          name: recipientName || '수령인',
          phone: recipientPhone || '-',
          address: shippingAddress,
        },
        message: '배송이 시작되었습니다.',
      },
    });
  } catch (error) {
    console.error('Shipping process error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배송 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
