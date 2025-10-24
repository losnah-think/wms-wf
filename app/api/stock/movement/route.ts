import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// STK-013: 재고 이동 추적 (GET)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // 감사 로그에서 재고 관련 움직임 조회
    const whereClause: any = {
      entity: 'WarehouseProduct',
      action: {
        in: ['STOCK_INBOUND', 'STOCK_OUTBOUND', 'STOCK_ADJUSTMENT', 'STOCK_MOVEMENT'],
      },
    };

    let logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    // 타입 필터링
    if (type && type !== 'all') {
      logs = logs.filter((log) => {
        const changes = JSON.parse(log.changes);
        if (type === 'transfer') return changes.fromLocation || changes.toLocation;
        if (type === 'adjustment') return changes.reason?.includes('조정');
        if (type === 'cycle-count') return changes.reason?.includes('재무');
        return true;
      });
    }

    // 검색 필터링
    if (search) {
      logs = logs.filter((log) => {
        const changes = JSON.parse(log.changes);
        return (
          changes.productName?.toLowerCase().includes(search.toLowerCase()) ||
          log.entityId.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // 데이터 포맷팅
    const data = logs.map((log) => {
      const changes = JSON.parse(log.changes);
      return {
        id: log.id,
        type: changes.fromLocation ? 'transfer' : changes.reason?.includes('조정') ? 'adjustment' : 'cycle-count',
        productName: changes.productName || 'Unknown',
        from: changes.fromLocation || changes.location || '-',
        to: changes.toLocation || changes.location || '-',
        quantity: changes.quantity || 0,
        reason: changes.reason || log.action,
        status: 'completed',
        createdAt: log.createdAt,
      };
    });

    console.log(`[API] GET /api/stock/movement - 조회됨: ${data.length}건`);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: data.length,
      },
    });
  } catch (error) {
    console.error('Stock movement GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 이동 정보 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
