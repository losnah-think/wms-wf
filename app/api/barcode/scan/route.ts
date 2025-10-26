import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-005: 바코드 스캔
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcodeData, purpose } = body;

    // 필수값 검증
    if (!barcodeData || !purpose) {
      return NextResponse.json(
        {
          success: false,
          error: '바코드 데이터와 스캔 목적이 필요합니다.',
          required: ['barcodeData', 'purpose'],
        },
        { status: 400 }
      );
    }

    // 바코드 형식 검증 (간단한 길이 체크)
    if (barcodeData.length < 8 || barcodeData.length > 50) {
      return NextResponse.json(
        {
          success: false,
          status: '무효',
          error: '유효하지 않은 바코드 형식입니다.',
          barcodeData,
        },
        { status: 400 }
      );
    }

    // 바코드로 상품 검색 (barcode 또는 sku 필드에서 검색)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { barcode: barcodeData },
          { sku: barcodeData },
          { code: barcodeData },
        ],
      },
      include: {
        warehouseProducts: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          status: '무효',
          error: '바코드에 해당하는 상품을 찾을 수 없습니다.',
          barcodeData,
        },
        { status: 404 }
      );
    }

    // 전체 재고 계산
    const totalStock = product.warehouseProducts.reduce(
      (sum, wp) => sum + wp.quantity,
      0
    );

    // 스캔 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'BARCODE_SCAN',
        entity: 'Product',
        entityId: product.id,
        userId: 'SCANNER',
        changes: JSON.stringify({
          barcodeData,
          purpose,
          productId: product.id,
          productName: product.name,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      status: '유효',
      data: {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        sku: product.sku,
        barcode: product.barcode,
        currentStock: totalStock,
        warehouses: product.warehouseProducts.map((wp) => ({
          warehouseId: wp.warehouseId,
          warehouseName: wp.warehouse.name,
          quantity: wp.quantity,
        })),
        purpose,
        scannedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Barcode scan error:', error);
    return NextResponse.json(
      {
        success: false,
        status: '무효',
        error: '바코드 스캔 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
