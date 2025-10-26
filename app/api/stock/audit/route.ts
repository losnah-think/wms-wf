import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// STK-009: 재고 실사 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const warehouseId = searchParams.get('warehouseId');

    const whereClause: any = {
      action: 'STOCK_AUDIT',
    };

    if (warehouseId) {
      whereClause.changes = {
        contains: warehouseId,
      };
    }

    const audits = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // 데이터 포맷팅
    const data = audits.map((audit) => {
      const changes = JSON.parse(audit.changes);
      return {
        id: audit.id,
        productName: changes.productName,
        warehouseName: changes.warehouseName,
        expectedQuantity: changes.expectedQuantity,
        auditQuantity: changes.auditQuantity,
        difference: changes.difference,
        differenceRate: changes.differenceRate,
        status: changes.status,
        reason: changes.reason,
        auditor: audit.userId,
        createdAt: audit.createdAt,
      };
    });

    console.log(`[API] GET /api/stock/audit - 조회됨: ${data.length}건`);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: data.length,
      },
    });
  } catch (error) {
    console.error('Stock audit GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 실사 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// STK-010: 재고 실사
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      auditQuantity,
      warehouseId,
      auditor,
      reason,
    } = body;

    // 필수값 검증
    if (!productId || auditQuantity === undefined || !warehouseId || !auditor) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['productId', 'auditQuantity', 'warehouseId', 'auditor'],
        },
        { status: 400 }
      );
    }

    // 현재 예정 수량 조회
    const currentStock = await prisma.warehouseProduct.findFirst({
      where: {
        productId: productId,
        warehouseId: warehouseId,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!currentStock) {
      return NextResponse.json(
        {
          success: false,
          error: '해당 창고에 재고 정보가 없습니다.',
        },
        { status: 404 }
      );
    }

    const expectedQuantity = currentStock.quantity;
    const difference = auditQuantity - expectedQuantity;
    const differenceRate = expectedQuantity > 0 
      ? ((difference / expectedQuantity) * 100).toFixed(2)
      : '0.00';

    // 차이가 크면 승인 대기, 작으면 자동 승인
    const threshold = 10; // 차이 허용 임계값 (개수)
    const requiresApproval = Math.abs(difference) > threshold;
    const status = requiresApproval ? '승인대기' : '승인';

    // 실사 기록 생성 (AuditLog에 저장)
    const auditRecord = await prisma.auditLog.create({
      data: {
        action: 'STOCK_AUDIT',
        entity: 'WarehouseProduct',
        entityId: currentStock.id,
        userId: auditor,
        changes: JSON.stringify({
          productId,
          productName: currentStock.product.name,
          warehouseId,
          warehouseName: currentStock.warehouse.name,
          expectedQuantity,
          auditQuantity,
          difference,
          differenceRate: `${differenceRate}%`,
          reason: reason || '정기 실사',
          status,
          requiresApproval,
        }),
      },
    });

    // 자동 승인인 경우 재고 즉시 업데이트
    if (!requiresApproval && difference !== 0) {
      await prisma.warehouseProduct.update({
        where: { id: currentStock.id },
        data: { quantity: auditQuantity },
      });

      // 수정 이력 추가
      await prisma.auditLog.create({
        data: {
          action: 'STOCK_ADJUSTED',
          entity: 'WarehouseProduct',
          entityId: currentStock.id,
          userId: auditor,
          changes: JSON.stringify({
            from: expectedQuantity,
            to: auditQuantity,
            reason: '실사 자동 승인',
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        auditId: auditRecord.id,
        expectedQuantity,
        auditQuantity,
        difference,
        differenceRate: `${differenceRate}%`,
        status,
        product: {
          id: currentStock.product.id,
          code: currentStock.product.code,
          name: currentStock.product.name,
        },
        warehouse: {
          id: currentStock.warehouse.id,
          name: currentStock.warehouse.name,
        },
        auditor,
        reason: reason || '정기 실사',
        createdAt: auditRecord.createdAt,
        requiresApproval,
        message: requiresApproval
          ? '차이가 크므로 관리자 승인이 필요합니다.'
          : '실사가 완료되고 재고가 업데이트되었습니다.',
      },
    });
  } catch (error) {
    console.error('Stock audit error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 실사 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
