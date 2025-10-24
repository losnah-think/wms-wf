import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// OUT-004: 배송 알림
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      notificationType, // shipped, in_transit, delivered, delayed
      recipientEmail,
      recipientPhone,
      message,
    } = body;

    // 필수값 검증
    if (!orderId || !notificationType) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['orderId', 'notificationType'],
        },
        { status: 400 }
      );
    }

    // 주문 조회
    const order = await prisma.outboundOrder.findUnique({
      where: { id: orderId },
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

    // 알림 메시지 생성
    let notificationMessage = message;
    if (!notificationMessage) {
      switch (notificationType) {
        case 'shipped':
          notificationMessage = `주문하신 상품이 발송되었습니다. (주문번호: ${order.orderNumber})`;
          break;
        case 'in_transit':
          notificationMessage = `주문하신 상품이 배송 중입니다. (주문번호: ${order.orderNumber})`;
          break;
        case 'delivered':
          notificationMessage = `주문하신 상품이 배송 완료되었습니다. (주문번호: ${order.orderNumber})`;
          break;
        case 'delayed':
          notificationMessage = `배송이 지연되고 있습니다. 양해 부탁드립니다. (주문번호: ${order.orderNumber})`;
          break;
      }
    }

    // 알림 전송 시뮬레이션 (실제로는 SMS/Email API 호출)
    const notifications = [];
    if (recipientEmail) {
      notifications.push({
        type: 'email',
        recipient: recipientEmail,
        status: 'sent',
      });
    }
    if (recipientPhone) {
      notifications.push({
        type: 'sms',
        recipient: recipientPhone,
        status: 'sent',
      });
    }

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'DELIVERY_NOTIFICATION',
        entity: 'OutboundOrder',
        entityId: orderId,
        userId: 'system',
        changes: JSON.stringify({
          orderNumber: order.orderNumber,
          notificationType,
          message: notificationMessage,
          notifications,
          sentAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber: order.orderNumber,
        notificationType,
        content: notificationMessage,
        notifications,
        sentAt: new Date().toISOString(),
        message: '알림이 전송되었습니다.',
      },
    });
  } catch (error) {
    console.error('Delivery notification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배송 알림 전송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
