import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// RPT-001: 일일 거래 통계
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const timeUnit = searchParams.get('timeUnit') || 'daily'; // hourly, daily

    // 기준 날짜 설정
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. 입고 통계
    const inboundRequests = await prisma.inboundRequest.findMany({
      where: {
        requestDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const inboundCount = inboundRequests.length;
    const inboundQuantity = inboundRequests.reduce(
      (sum, req) => sum + req.totalQuantity,
      0
    );

    // 2. 출고 통계
    const outboundOrders = await prisma.outboundOrder.findMany({
      where: {
        orderDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const outboundCount = outboundOrders.length;
    const outboundQuantity = outboundOrders.reduce(
      (sum, order) => sum + order.totalQuantity,
      0
    );

    // 3. 피킹 통계
    const pickingTasks = await prisma.pickingTask.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const pickingCount = pickingTasks.length;

    // 4. 반품 통계
    const returnRequests = await prisma.auditLog.findMany({
      where: {
        action: 'RETURN_REQUEST',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const returnCount = returnRequests.length;

    // 5. 배송 통계
    const shippedOrders = await prisma.outboundOrder.findMany({
      where: {
        shippingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['shipped', 'delivered'],
        },
      },
    });

    const shippingCount = shippedOrders.length;

    // 시간별 상세 데이터 (요청 시)
    let hourlyData = null;
    if (timeUnit === 'hourly') {
      hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourStart = new Date(startOfDay);
        hourStart.setHours(hour);
        const hourEnd = new Date(startOfDay);
        hourEnd.setHours(hour + 1);

        const hourlyInbound = inboundRequests.filter(
          req => req.requestDate >= hourStart && req.requestDate < hourEnd
        ).length;

        const hourlyOutbound = outboundOrders.filter(
          order => order.orderDate >= hourStart && order.orderDate < hourEnd
        ).length;

        return {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          inbound: hourlyInbound,
          outbound: hourlyOutbound,
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        summary: {
          inboundCount,
          inboundQuantity,
          outboundCount,
          outboundQuantity,
          pickingCount,
          returnCount,
          shippingCount,
        },
        hourlyData,
      },
    });
  } catch (error) {
    console.error('Daily statistics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '일일 거래 통계 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
