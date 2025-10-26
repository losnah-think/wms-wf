import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// OUT-003: 배송 추적
export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const trackingNumber = params.trackingNumber;

    // 운송장 번호로 주문 찾기 (notes에서 검색)
    const orders = await prisma.outboundOrder.findMany({
      where: {
        notes: {
          contains: trackingNumber,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      take: 1,
    });

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '운송장 번호를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    const order = orders[0];

    // 택배사 구분 (운송장 번호 접두사로 판단)
    let carrier = '알 수 없음';
    if (trackingNumber.startsWith('CJ')) carrier = 'CJ대한통운';
    else if (trackingNumber.startsWith('HJ')) carrier = '한진택배';
    else if (trackingNumber.startsWith('LG')) carrier = '로젠택배';
    else if (trackingNumber.startsWith('KP')) carrier = '우체국택배';

    // 배송 추적 정보 시뮬레이션
    // 실제로는 택배사 API를 호출하여 실시간 정보를 가져옴
    const trackingHistory = [];
    const baseDate = order.orderDate;

    // 주문 상태에 따른 배송 단계 생성
    trackingHistory.push({
      time: baseDate.toISOString(),
      status: '상품 준비중',
      location: '물류센터',
      description: '상품이 출고 준비 중입니다.',
    });

    if (order.status !== 'pending') {
      const pickup = new Date(baseDate.getTime() + 2 * 60 * 60 * 1000);
      trackingHistory.push({
        time: pickup.toISOString(),
        status: '상품 인수',
        location: '물류센터',
        description: '택배사가 상품을 인수했습니다.',
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      const transit = new Date(baseDate.getTime() + 6 * 60 * 60 * 1000);
      trackingHistory.push({
        time: transit.toISOString(),
        status: '배송중',
        location: '집하장',
        description: '배송 중입니다.',
      });
    }

    if (order.status === 'delivered') {
      const delivered = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
      trackingHistory.push({
        time: delivered.toISOString(),
        status: '배송완료',
        location: '배송지',
        description: '배송이 완료되었습니다.',
      });
    }

    // 현재 상태 결정
    let currentStatus = '상품 준비중';
    if (order.status === 'delivered') {
      currentStatus = '배송완료';
    } else if (order.status === 'shipped') {
      currentStatus = '배송중';
    } else if (order.status === 'ready_to_ship') {
      currentStatus = '상품 인수';
    }

    return NextResponse.json({
      success: true,
      data: {
        trackingNumber,
        carrier,
        orderNumber: order.orderNumber,
        currentStatus,
        items: order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
        })),
        trackingHistory,
        estimatedDelivery: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
    });
  } catch (error) {
    console.error('Shipment tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배송 추적 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
