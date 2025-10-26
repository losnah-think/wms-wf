import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// RPT-005: 재고 회전율
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1month';
    const productId = searchParams.get('productId');

    // 기간 설정
    const now = new Date();
    let startDate = new Date(0);
    let days = 30;

    if (period === '1month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      days = 30;
    } else if (period === '3months') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      days = 90;
    } else if (period === '6months') {
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      days = 180;
    } else if (period === '1year') {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      days = 365;
    }

    // 상품 필터
    const whereClause: any = {};
    if (productId) {
      whereClause.id = productId;
    }

    // 상품별 데이터 수집
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        warehouseProducts: true,
        outboundItems: {
          where: {
            order: {
              orderDate: {
                gte: startDate,
              },
              status: {
                in: ['shipped', 'delivered'],
              },
            },
          },
        },
      },
    });

    const turnoverData = products.map(product => {
      // 현재 재고
      const currentStock = product.warehouseProducts.reduce((sum, wp) => sum + wp.quantity, 0);

      // 기간 내 출고량
      const totalSold = product.outboundItems.reduce((sum, item) => sum + item.quantity, 0);

      // 평균 재고 (간단히 현재 재고로 계산, 실제로는 기간 중 평균 필요)
      const avgStock = currentStock;

      // 재고 회전율 = 출고량 / 평균 재고
      const turnoverRate = avgStock > 0 ? (totalSold / avgStock).toFixed(2) : '0.00';

      // 재고 회전일수 = 기간 일수 / 회전율
      const turnoverDays = parseFloat(turnoverRate) > 0
        ? Math.round(days / parseFloat(turnoverRate))
        : 0;

      // 재고 상태 평가
      let status = 'normal';
      if (parseFloat(turnoverRate) >= 3) {
        status = 'fast'; // 회전율 높음
      } else if (parseFloat(turnoverRate) < 1) {
        status = 'slow'; // 회전율 낮음
      }

      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        currentStock,
        totalSold,
        avgStock,
        turnoverRate: parseFloat(turnoverRate),
        turnoverDays,
        status,
      };
    });

    // 회전율 순으로 정렬
    turnoverData.sort((a, b) => b.turnoverRate - a.turnoverRate);

    // 평균 회전율
    const avgTurnoverRate = turnoverData.length > 0
      ? (turnoverData.reduce((sum, item) => sum + item.turnoverRate, 0) / turnoverData.length).toFixed(2)
      : '0.00';

    // 카테고리별 집계
    const fastMoving = turnoverData.filter(item => item.status === 'fast').length;
    const normal = turnoverData.filter(item => item.status === 'normal').length;
    const slowMoving = turnoverData.filter(item => item.status === 'slow').length;

    return NextResponse.json({
      success: true,
      data: {
        period: {
          from: startDate.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
          days,
        },
        summary: {
          totalProducts: turnoverData.length,
          avgTurnoverRate: parseFloat(avgTurnoverRate),
          fastMoving,
          normal,
          slowMoving,
        },
        products: turnoverData,
      },
    });
  } catch (error) {
    console.error('Inventory turnover error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 회전율 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
