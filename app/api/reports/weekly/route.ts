import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// RPT-002: 주간 요약 대시보드
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week') || 'current'; // current, last, specific
    const compare = searchParams.get('compare') || 'lastWeek'; // lastWeek, lastMonth, lastYear

    // 이번 주 설정 (월요일 시작)
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // 월요일로 조정
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // 지난 주 설정
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekEnd);
    lastWeekEnd.setDate(weekEnd.getDate() - 7);

    // 이번 주 거래 데이터 조회
    const [
      currentInbound,
      currentOutbound,
      currentPicking,
      currentReturns,
      currentShipping,
    ] = await Promise.all([
      prisma.inboundRequest.count({
        where: {
          requestDate: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.outboundOrder.count({
        where: {
          orderDate: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.pickingTask.count({
        where: {
          createdAt: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'RETURN_REQUEST',
          createdAt: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.outboundOrder.count({
        where: {
          shippingDate: { gte: weekStart, lte: weekEnd },
          status: { in: ['shipped', 'delivered'] },
        },
      }),
    ]);

    // 지난 주 거래 데이터 조회 (비교용)
    const [
      lastInbound,
      lastOutbound,
      lastPicking,
      lastReturns,
      lastShipping,
    ] = await Promise.all([
      prisma.inboundRequest.count({
        where: {
          requestDate: { gte: lastWeekStart, lte: lastWeekEnd },
        },
      }),
      prisma.outboundOrder.count({
        where: {
          orderDate: { gte: lastWeekStart, lte: lastWeekEnd },
        },
      }),
      prisma.pickingTask.count({
        where: {
          createdAt: { gte: lastWeekStart, lte: lastWeekEnd },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'RETURN_REQUEST',
          createdAt: { gte: lastWeekStart, lte: lastWeekEnd },
        },
      }),
      prisma.outboundOrder.count({
        where: {
          shippingDate: { gte: lastWeekStart, lte: lastWeekEnd },
          status: { in: ['shipped', 'delivered'] },
        },
      }),
    ]);

    // 증감률 계산
    const calculateChange = (current: number, last: number) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return ((current - last) / last * 100).toFixed(1);
    };

    // 일별 추이 데이터
    const dailyTrend = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const dayStart = new Date(weekStart);
        dayStart.setDate(weekStart.getDate() + i);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const [inbound, outbound] = await Promise.all([
          prisma.inboundRequest.count({
            where: {
              requestDate: { gte: dayStart, lte: dayEnd },
            },
          }),
          prisma.outboundOrder.count({
            where: {
              orderDate: { gte: dayStart, lte: dayEnd },
            },
          }),
        ]);

        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        return {
          date: dayStart.toISOString().split('T')[0],
          day: dayNames[dayStart.getDay()],
          inbound,
          outbound,
        };
      })
    );

    // 주요 지표 계산
    const totalOrders = currentOutbound;
    const completedOrders = currentShipping;
    const deliveryRate = totalOrders > 0
      ? ((completedOrders / totalOrders) * 100).toFixed(1)
      : '0.0';

    const errorRate = totalOrders > 0
      ? ((currentReturns / totalOrders) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: weekStart.toISOString().split('T')[0],
          end: weekEnd.toISOString().split('T')[0],
        },
        weeklyStats: {
          inbound: currentInbound,
          outbound: currentOutbound,
          picking: currentPicking,
          returns: currentReturns,
          shipping: currentShipping,
        },
        comparison: {
          inbound: `${calculateChange(currentInbound, lastInbound)}%`,
          outbound: `${calculateChange(currentOutbound, lastOutbound)}%`,
          picking: `${calculateChange(currentPicking, lastPicking)}%`,
          returns: `${calculateChange(currentReturns, lastReturns)}%`,
          shipping: `${calculateChange(currentShipping, lastShipping)}%`,
        },
        keyMetrics: {
          deliveryRate: `${deliveryRate}%`,
          errorRate: `${errorRate}%`,
          productivity: currentPicking > 0 ? (currentOutbound / currentPicking).toFixed(1) : '0',
        },
        dailyTrend,
      },
    });
  } catch (error) {
    console.error('Weekly dashboard error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '주간 요약 대시보드 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
