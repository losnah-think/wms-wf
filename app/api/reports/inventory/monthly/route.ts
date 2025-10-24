import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// RPT-003: 월별 재고 리포트
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // 해당 월의 시작과 끝
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    // 월초 재고 계산 (이전 달까지의 누적)
    const inboundBeforeMonth = await prisma.inboundRequestItem.aggregate({
      where: {
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

    const totalInbound = monthInbound._sum.quantity || 0;
    const totalOutbound = monthOutbound._sum.quantity || 0;
    const closingStock = openingStock + totalInbound - totalOutbound;

    // 상품별 상세 내역
    const productDetails = await prisma.product.findMany({
      include: {
        inboundItems: {
          where: {
            request: {
              requestDate: {
                gte: monthStart,
                lte: monthEnd,
              },
              status: 'approved',
            },
          },
        },
        outboundItems: {
          where: {
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
        },
        warehouseProducts: true,
      },
      take: 50, // 상위 50개 상품
    });

    const productSummary = productDetails.map(product => ({
      productCode: product.code,
      productName: product.name,
      inbound: product.inboundItems.reduce((sum, item) => sum + item.quantity, 0),
      outbound: product.outboundItems.reduce((sum, item) => sum + item.quantity, 0),
      currentStock: product.warehouseProducts.reduce((sum, wp) => sum + wp.quantity, 0),
    }));

    // 증감률 계산
    const changeRate = openingStock > 0
      ? ((closingStock - openingStock) / openingStock * 100).toFixed(2)
      : '0.00';

    return NextResponse.json({
      success: true,
      data: {
        period: {
          year,
          month,
          label: `${year}년 ${month}월`,
        },
        summary: {
          openingStock,
          totalInbound,
          totalOutbound,
          closingStock,
          netChange: closingStock - openingStock,
          changeRate: `${changeRate}%`,
        },
        products: productSummary,
      },
    });
  } catch (error) {
    console.error('Monthly inventory report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '월별 재고 리포트 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
