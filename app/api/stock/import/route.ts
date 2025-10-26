import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-015: CSV 대량 입고
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, userId } = body; // data: [{productCode, warehouseId, quantity, notes}]

    // 필수값 검증
    if (!data || !Array.isArray(data) || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['data (array)', 'userId'],
        },
        { status: 400 }
      );
    }

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: [] as any[],
      imported: [] as any[],
    };

    // 각 행 처리
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const { productCode, warehouseId, quantity, notes } = row;

      try {
        // 상품 조회
        const product = await prisma.product.findFirst({
          where: { code: productCode },
        });

        if (!product) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            productCode,
            error: '존재하지 않는 상품 코드입니다.',
          });
          continue;
        }

        // 창고 확인
        const warehouse = await prisma.warehouse.findUnique({
          where: { id: warehouseId },
        });

        if (!warehouse) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            productCode,
            error: '존재하지 않는 창고입니다.',
          });
          continue;
        }

        // 재고 업데이트 또는 생성
        const existingStock = await prisma.warehouseProduct.findFirst({
          where: {
            productId: product.id,
            warehouseId,
          },
        });

        if (existingStock) {
          await prisma.warehouseProduct.update({
            where: { id: existingStock.id },
            data: {
              quantity: existingStock.quantity + quantity,
            },
          });
        } else {
          await prisma.warehouseProduct.create({
            data: {
              productId: product.id,
              warehouseId,
              quantity,
            },
          });
        }

        results.success++;
        results.imported.push({
          row: i + 1,
          productCode,
          productName: product.name,
          warehouse: warehouse.name,
          quantity,
        });
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          productCode,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'CSV_IMPORT',
        entity: 'WarehouseProduct',
        entityId: 'bulk',
        userId,
        changes: JSON.stringify({
          totalRows: results.total,
          successCount: results.success,
          failedCount: results.failed,
          importedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: results.failed === 0,
      data: {
        summary: {
          total: results.total,
          success: results.success,
          failed: results.failed,
          successRate: `${Math.round((results.success / results.total) * 100)}%`,
        },
        imported: results.imported,
        errors: results.errors,
        message: results.failed === 0
          ? '모든 데이터가 성공적으로 입고되었습니다.'
          : `${results.success}개 성공, ${results.failed}개 실패`,
      },
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'CSV 대량 입고 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
