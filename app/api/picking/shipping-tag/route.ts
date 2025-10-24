import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PIC-006: 배송 태그 인쇄
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packingTaskId, shippingInfo, userId } = body;

    // 필수값 검증
    if (!packingTaskId || !shippingInfo || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['packingTaskId', 'shippingInfo', 'userId'],
        },
        { status: 400 }
      );
    }

    // 패킹 작업 조회
    const packingTask = await prisma.packingTask.findUnique({
      where: { id: packingTaskId },
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

    if (!packingTask) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 패킹 작업입니다.',
        },
        { status: 404 }
      );
    }

    // 운송장 번호 생성 (간단한 형식)
    const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 배송 태그 데이터
    const shippingTag = {
      trackingNumber,
      orderNumber: packingTask.order.orderNumber,
      recipientInfo: {
        name: shippingInfo.recipientName || '수령인',
        phone: shippingInfo.recipientPhone || '',
        address: shippingInfo.address || '',
        zipCode: shippingInfo.zipCode || '',
      },
      senderInfo: {
        name: '창고',
        phone: '02-1234-5678',
        address: '서울시 강남구',
      },
      packageInfo: {
        items: packingTask.order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
        })),
        totalQuantity: packingTask.order.items.reduce((sum, item) => sum + item.quantity, 0),
        packageCount: shippingInfo.packageCount || 1,
        weight: shippingInfo.weight || 0,
      },
      shippingMethod: shippingInfo.shippingMethod || '택배',
      carrier: shippingInfo.carrier || 'CJ대한통운',
      printedAt: new Date().toISOString(),
      barcode: trackingNumber, // 바코드로 사용할 운송장 번호
    };

    // 주문 상태 업데이트
    await prisma.outboundOrder.update({
      where: { id: packingTask.orderId },
      data: {
        status: 'ready_to_ship',
        notes: `운송장번호: ${trackingNumber}`,
      },
    });

    // 패킹 작업 완료 처리
    await prisma.packingTask.update({
      where: { id: packingTaskId },
      data: {
        status: 'completed',
        completionTime: new Date(),
      },
    });

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'SHIPPING_TAG_PRINT',
        entity: 'PackingTask',
        entityId: packingTaskId,
        userId,
        changes: JSON.stringify({
          trackingNumber,
          orderNumber: packingTask.order.orderNumber,
          carrier: shippingInfo.carrier,
          printedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        shippingTag,
        message: '배송 태그가 생성되었습니다.',
      },
    });
  } catch (error) {
    console.error('Shipping tag creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배송 태그 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
