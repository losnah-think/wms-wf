import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// RET-001: 반품 요청 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      reason,
      returnQuantity,
      customerNote,
      productId,
    } = body;

    // 필수값 검증
    if (!orderId || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: '주문 ID와 반품 사유가 필요합니다.',
          required: ['orderId', 'reason'],
        },
        { status: 400 }
      );
    }

    // 주문 존재 확인
    const order = await prisma.outboundOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
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

    // 반품 사유 검증
    const validReasons = ['불량', '색상차이', '배송오류', '고객변심'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 반품 사유입니다.',
          validReasons,
        },
        { status: 400 }
      );
    }

    // 반품 ID 생성
    const returnNumber = `RET-${Date.now()}`;
    
    // 예상 처리일 계산 (3일 후)
    const expectedProcessDate = new Date();
    expectedProcessDate.setDate(expectedProcessDate.getDate() + 3);

    // 반품 요청 생성 (AuditLog에 기록)
    const returnRequest = await prisma.auditLog.create({
      data: {
        action: 'RETURN_REQUEST',
        entity: 'OutboundOrder',
        entityId: orderId,
        userId: 'CUSTOMER',
        changes: JSON.stringify({
          returnNumber,
          orderId,
          orderNumber: order.orderNumber,
          reason,
          returnQuantity: returnQuantity || order.totalQuantity,
          productId: productId || null,
          customerNote: customerNote || '',
          status: '요청',
          requestDate: new Date().toISOString(),
          expectedProcessDate: expectedProcessDate.toISOString(),
        }),
      },
    });

    // 회수 주소 (고객 배송 주소 - 실제로는 DB에 저장된 고객 정보 사용)
    const returnAddress = {
      address: '고객이 직접 배송',
      contact: '고객 센터: 1588-0000',
    };

    return NextResponse.json({
      success: true,
      data: {
        returnId: returnRequest.id,
        returnNumber,
        status: '등록완료',
        returnStatus: {
          current: '요청',
          requestDate: returnRequest.createdAt,
          expectedProcessDate,
        },
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          orderDate: order.orderDate,
        },
        returnInfo: {
          reason,
          quantity: returnQuantity || order.totalQuantity,
          customerNote: customerNote || '',
        },
        returnAddress,
        message: '반품 요청이 등록되었습니다. 상담원이 확인 후 연락드리겠습니다.',
      },
    });
  } catch (error) {
    console.error('Return request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '반품 요청 등록 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// RET-004: 반품 현황 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const returnId = searchParams.get('returnId');
    const period = searchParams.get('period') || '30'; // days
    const status = searchParams.get('status') || 'all'; // all, 진행중, 완료, 거절

    // 기간 필터 설정
    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(period));

    // 반품 요청 조회
    const whereClause: any = {
      action: 'RETURN_REQUEST',
      createdAt: {
        gte: periodDate,
      },
    };

    if (returnId) {
      whereClause.id = returnId;
    }

    const returns = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 반품 목록 포맷팅
    const returnList = returns.map(ret => {
      const changes = JSON.parse(ret.changes || '{}');
      
      return {
        returnId: ret.id,
        returnNumber: changes.returnNumber,
        status: changes.status || '요청',
        requestDate: ret.createdAt,
        expectedProcessDate: changes.expectedProcessDate,
        order: {
          orderId: ret.entityId,
          orderNumber: changes.orderNumber,
        },
        reason: changes.reason,
        quantity: changes.returnQuantity,
      };
    });

    // 상태별 필터링
    const filteredList = status === 'all'
      ? returnList
      : returnList.filter(r => r.status === status);

    // 현황 통계
    const stats = {
      total: returnList.length,
      pending: returnList.filter(r => r.status === '요청' || r.status === '접수').length,
      completed: returnList.filter(r => r.status === '완료').length,
      rejected: returnList.filter(r => r.status === '거절').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        returns: filteredList,
      },
    });
  } catch (error) {
    console.error('Return status query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '반품 현황 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
