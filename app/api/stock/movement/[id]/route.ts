import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-013: 재고 이동 추적
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1month'; // all, 1month, 3months, 6months
    const moveType = searchParams.get('type') || 'all'; // all, inbound, outbound

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 상품입니다.',
        },
        { status: 404 }
      );
    }

    // 기간 설정
    const now = new Date();
    let startDate = new Date(0); // 전체

    if (period === '1month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '3months') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === '6months') {
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    }

    // 입고 이력 조회
    let inboundMovements: any[] = [];
    if (moveType === 'all' || moveType === 'inbound') {
      const inboundItems = await prisma.inboundRequestItem.findMany({
        where: {
          productId,
          request: {
            requestDate: {
              gte: startDate,
            },
          },
        },
        include: {
          request: {
            include: {
              supplier: true,
            },
          },
        },
        orderBy: {
          request: {
            requestDate: 'desc',
          },
        },
      });

      inboundMovements = inboundItems.map(item => ({
        date: item.request.requestDate,
        type: '입고',
        quantity: item.quantity,
        handler: item.request.supplier.name,
        memo: item.request.notes || '-',
        status: item.request.status,
      }));
    }

    // 출고 이력 조회
    let outboundMovements: any[] = [];
    if (moveType === 'all' || moveType === 'outbound') {
      const outboundItems = await prisma.outboundOrderItem.findMany({
        where: {
          productId,
          order: {
            orderDate: {
              gte: startDate,
            },
          },
        },
        include: {
          order: true,
        },
        orderBy: {
          order: {
            orderDate: 'desc',
          },
        },
      });

      outboundMovements = outboundItems.map(item => ({
        date: item.order.orderDate,
        type: '출고',
        quantity: -item.quantity, // 음수로 표시
        handler: item.order.orderNumber,
        memo: item.order.notes || '-',
        status: item.order.status,
      }));
    }

    // 모든 이동 기록 통합 및 정렬
    const allMovements = [...inboundMovements, ...outboundMovements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 누적량 계산
    let totalInbound = 0;
    let totalOutbound = 0;

    allMovements.forEach(movement => {
      if (movement.type === '입고') {
        totalInbound += movement.quantity;
      } else {
        totalOutbound += Math.abs(movement.quantity);
      }
    });

    // 이동 경로 매핑 (간단한 타임라인)
    const timeline = allMovements.map((movement, index) => ({
      step: index + 1,
      date: new Date(movement.date).toLocaleDateString('ko-KR'),
      time: new Date(movement.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      type: movement.type,
      quantity: Math.abs(movement.quantity),
      direction: movement.quantity > 0 ? 'in' : 'out',
      handler: movement.handler,
      memo: movement.memo,
      status: movement.status,
    }));

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product.id,
          code: product.code,
          name: product.name,
        },
        period: {
          from: startDate.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
          type: period,
        },
        summary: {
          totalInbound,
          totalOutbound,
          netChange: totalInbound - totalOutbound,
          movementCount: allMovements.length,
        },
        movements: allMovements.map(m => ({
          date: new Date(m.date).toISOString(),
          type: m.type,
          quantity: m.quantity,
          handler: m.handler,
          memo: m.memo,
          status: m.status,
        })),
        timeline,
      },
    });
  } catch (error) {
    console.error('Stock movement tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 이동 추적 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
