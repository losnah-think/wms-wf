import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-014: 월별 재고 동향
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const period = searchParams.get('period') || '3months'; // 3months, 6months, 1year
    const groupBy = searchParams.get('groupBy') || 'product'; // product, category

    // 기간 설정
    const now = new Date();
    let monthsBack = 3;

    if (period === '6months') {
      monthsBack = 6;
    } else if (period === '1year') {
      monthsBack = 12;
    }

    // 월별 데이터 수집
    const monthlyData = [];
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const nextMonthStart = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);

      // 월 표시 형식
      const monthLabel = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

      // 월초 재고 (이전 달까지의 누적)
      const inboundBeforeMonth = await prisma.inboundRequestItem.aggregate({
        where: {
          ...(productId ? { productId } : {}),
          request: {
            requestDate: {
              lt: monthStart,
            },
            status: 'approved',
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const outboundBeforeMonth = await prisma.outboundOrderItem.aggregate({
        where: {
          ...(productId ? { productId } : {}),
          order: {
            orderDate: {
              lt: monthStart,
            },
            status: {
              in: ['shipped', 'delivered'],
            },
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const openingStock = (inboundBeforeMonth._sum.quantity || 0) - (outboundBeforeMonth._sum.quantity || 0);

      // 해당 월 입고
      const monthInbound = await prisma.inboundRequestItem.aggregate({
        where: {
          ...(productId ? { productId } : {}),
          request: {
            requestDate: {
              gte: monthStart,
              lte: monthEnd,
            },
            status: 'approved',
          },
        },
        _sum: {
          quantity: true,
        },
      });

      // 해당 월 출고
      const monthOutbound = await prisma.outboundOrderItem.aggregate({
        where: {
          ...(productId ? { productId } : {}),
          order: {
            orderDate: {
              gte: monthStart,
              lte: monthEnd,
            },
            status: {
              in: ['shipped', 'delivered'],
            },
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const inbound = monthInbound._sum.quantity || 0;
      const outbound = monthOutbound._sum.quantity || 0;
      const closingStock = openingStock + inbound - outbound;

      // 증감률 계산
      const changeRate = openingStock > 0
        ? ((closingStock - openingStock) / openingStock * 100).toFixed(1)
        : '0.0';

      monthlyData.push({
        month: monthLabel,
        openingStock,
        inbound,
        outbound,
        closingStock,
        changeRate: `${changeRate}%`,
      });
    }

    // 평균 재고 계산
    const avgStock = monthlyData.length > 0
      ? Math.round(monthlyData.reduce((sum, m) => sum + m.closingStock, 0) / monthlyData.length)
      : 0;

    // 최대/최소 재고
    const maxStock = monthlyData.length > 0
      ? Math.max(...monthlyData.map(m => m.closingStock))
      : 0;
    const minStock = monthlyData.length > 0
      ? Math.min(...monthlyData.map(m => m.closingStock))
      : 0;

    // 추이 차트 데이터
    const trendChart = monthlyData.map(m => ({
      month: m.month,
      stock: m.closingStock,
      inbound: m.inbound,
      outbound: m.outbound,
    }));

    return NextResponse.json({
      success: true,
      data: {
        period: {
          from: monthlyData[0]?.month || '',
          to: monthlyData[monthlyData.length - 1]?.month || '',
          months: monthsBack,
        },
        summary: {
          avgStock,
          maxStock,
          minStock,
          totalInbound: monthlyData.reduce((sum, m) => sum + m.inbound, 0),
          totalOutbound: monthlyData.reduce((sum, m) => sum + m.outbound, 0),
        },
        monthlyData,
        trendChart,
      },
    });
  } catch (error) {
    console.error('Monthly stock trend error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '월별 재고 동향 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
