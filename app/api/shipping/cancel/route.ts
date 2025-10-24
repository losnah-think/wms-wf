import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// OUT-005: 배송 취소
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, reason, userId } = body;

    // 필수값 검증
    if (!orderId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['orderId', 'userId'],
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

    // 배송 완료된 주문은 취소 불가
    if (order.status === 'delivered') {
      return NextResponse.json(
        {
          success: false,
          error: '배송 완료된 주문은 취소할 수 없습니다.',
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // 주문 취소
    await prisma.outboundOrder.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        notes: `취소 사유: ${reason || '사용자 요청'}`,
      },
    });

    // 관련 피킹/패킹 작업도 취소
    await prisma.pickingTask.updateMany({
      where: {
        orderId,
        status: {
          notIn: ['completed', 'cancelled'],
        },
      },
      data: {
        status: 'cancelled',
        notes: `주문 취소로 인한 작업 취소`,
      },
    });

    await prisma.packingTask.updateMany({
      where: {
        orderId,
        status: {
          notIn: ['completed', 'cancelled'],
        },
      },
      data: {
        status: 'cancelled',
        notes: `주문 취소로 인한 작업 취소`,
      },
    });

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'CANCEL',
        entity: 'OutboundOrder',
        entityId: orderId,
        userId,
        changes: JSON.stringify({
          orderNumber: order.orderNumber,
          previousStatus: order.status,
          reason: reason || '사용자 요청',
          cancelledAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber: order.orderNumber,
        previousStatus: order.status,
        reason: reason || '사용자 요청',
        cancelledBy: userId,
        cancelledAt: new Date().toISOString(),
        message: '배송이 취소되었습니다.',
      },
    });
  } catch (error) {
    console.error('Shipment cancellation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배송 취소 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
