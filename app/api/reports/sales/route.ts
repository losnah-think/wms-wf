import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// RPT-004: 상품 판매 분석
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1month'; // 1month, 3months, 6months, 1year
    const limit = parseInt(searchParams.get('limit') || '20');

    // 기간 설정
    const now = new Date();
    let startDate = new Date(0);

    if (period === '1month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '3months') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === '6months') {
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    } else if (period === '1year') {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    // 상품별 출고 데이터 집계
    const products = await prisma.product.findMany({
      include: {
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
          include: {
            order: true,
          },
        },
      },
    });

    // 판매 데이터 계산
    const salesData = products
      .map(product => {
        const totalQuantity = product.outboundItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = totalQuantity * Number(product.price);
        const orderCount = new Set(product.outboundItems.map(item => item.orderId)).size;

        return {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          totalQuantity,
          totalRevenue,
          orderCount,
          avgQuantityPerOrder: orderCount > 0 ? Math.round((totalQuantity / orderCount) * 10) / 10 : 0,
          unitPrice: Number(product.price),
        };
      })
      .filter(item => item.totalQuantity > 0) // 판매 실적이 있는 상품만
      .sort((a, b) => b.totalRevenue - a.totalRevenue) // 매출액 순 정렬
      .slice(0, limit);

    // 전체 통계
    const totalRevenue = salesData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalQuantity = salesData.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orderCount, 0);

    // 상위 5개 베스트셀러
    const bestSellers = salesData.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        period: {
          from: startDate.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
          type: period,
        },
        summary: {
          totalRevenue,
          totalQuantity,
          totalOrders,
          avgRevenuePerOrder: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
          productCount: salesData.length,
        },
        bestSellers,
        products: salesData,
      },
    });
  } catch (error) {
    console.error('Product sales analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '상품 판매 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
