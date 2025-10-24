import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PIC-001: 피킹 대기 주문
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'orderDate'; // orderDate, expectedDelivery
    const filterStatus = searchParams.get('filter') || 'all'; // all, urgent, normal

    // 피킹 대기 상태 주문 조회
    const whereClause: any = {
      status: 'pending',
    };

    // 긴급 필터 (배송 예정일이 2일 이내)
    if (filterStatus === 'urgent') {
      const urgentDate = new Date();
      urgentDate.setDate(urgentDate.getDate() + 2);
      
      whereClause.expectedDelivery = {
        lte: urgentDate,
      };
    }

    const orders = await prisma.outboundOrder.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: sortBy === 'expectedDelivery'
        ? { expectedDelivery: 'asc' }
        : { orderDate: 'asc' },
    });

    // 각 주문의 대기 시간 계산
    const now = new Date();
    const orderList = orders.map(order => {
      const waitingMinutes = Math.floor(
        (now.getTime() - order.orderDate.getTime()) / (1000 * 60)
      );

      // 긴급 여부 판단
      const isUrgent = order.expectedDelivery
        ? (order.expectedDelivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 2
        : false;

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        expectedDelivery: order.expectedDelivery,
        isUrgent,
        totalQuantity: order.totalQuantity,
        itemCount: order.items.length,
        products: order.items.map(item => ({
          productId: item.productId,
          productCode: item.product.code,
          productName: item.product.name,
          quantity: item.quantity,
        })),
        waitingMinutes,
      };
    });

    // 긴급 건수 계산
    const urgentCount = orderList.filter(o => o.isUrgent).length;

    // 평균 대기 시간 계산
    const averageWaitingTime = orderList.length > 0
      ? Math.floor(
          orderList.reduce((sum, o) => sum + o.waitingMinutes, 0) / orderList.length
        )
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalCount: orderList.length,
        urgentCount,
        normalCount: orderList.length - urgentCount,
        averageWaitingMinutes: averageWaitingTime,
        orders: orderList,
      },
    });
  } catch (error) {
    console.error('Picking queue error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '피킹 대기 주문 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
