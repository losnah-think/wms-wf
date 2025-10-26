import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-012: 가용 재고 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');

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

    // 창고별 재고 조회
    const whereClause: any = { productId };
    if (warehouseId) {
      whereClause.warehouseId = warehouseId;
    }

    const stocks = await prisma.warehouseProduct.findMany({
      where: whereClause,
      include: {
        warehouse: true,
      },
    });

    // 예약 재고 계산 (미완료 출고 주문의 수량)
    const pendingOrders = await prisma.outboundOrderItem.findMany({
      where: {
        productId,
        order: {
          status: {
            in: ['pending', 'picking', 'packing'],
          },
        },
      },
      include: {
        order: true,
      },
    });

    // 창고별 예약 수량 집계
    const reservedByWarehouse = new Map<string, number>();
    pendingOrders.forEach(item => {
      const reserved = item.quantity - item.pickedQty;
      // 실제로는 창고 정보가 필요하지만, 간단히 전체 예약으로 처리
      reservedByWarehouse.set('all', (reservedByWarehouse.get('all') || 0) + reserved);
    });

    const totalReserved = reservedByWarehouse.get('all') || 0;

    // 창고별 가용 재고 계산
    const warehouseDetails = stocks.map(stock => {
      // 정상 재고 (전체 재고로 간주)
      const normalStock = stock.quantity;
      
      // 예약 재고는 전체에서 비율로 분배
      const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);
      const reservedStock = totalStock > 0
        ? Math.floor((normalStock / totalStock) * totalReserved)
        : 0;
      
      // 가용 수량 = 정상 재고 - 예약 재고
      const available = Math.max(0, normalStock - reservedStock);

      return {
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouse.name,
        normalStock,
        reservedStock,
        available,
      };
    });

    // 전체 집계
    const totalNormal = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    const totalAvailable = warehouseDetails.reduce((sum, w) => sum + w.available, 0);

    return NextResponse.json({
      success: true,
      data: {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        normalStock: totalNormal,
        reservedStock: totalReserved,
        availableStock: totalAvailable,
        warehouseDetails,
        queriedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Available stock query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '가용 재고 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
