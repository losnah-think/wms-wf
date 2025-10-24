import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// RET-005: 반품 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { returnRequestId, disposition, restockItems, userId } = body;
    // disposition: 'restock', 'discard', 'repair'
    // restockItems: [{ productId, quantity, locationId }]

    // 필수값 검증
    if (!returnRequestId || !disposition || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['returnRequestId', 'disposition', 'userId'],
        },
        { status: 400 }
      );
    }

    // 유효한 처리 방법 검증
    const validDispositions = ['restock', 'discard', 'repair'];
    if (!validDispositions.includes(disposition)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 처리 방법입니다.',
          validDispositions,
        },
        { status: 400 }
      );
    }

    const processedItems = [];

    // 재입고 처리
    if (disposition === 'restock' && restockItems && Array.isArray(restockItems)) {
      for (const item of restockItems) {
        const { productId, quantity, warehouseId } = item;

        // 재고 업데이트
        const existingStock = await prisma.warehouseProduct.findFirst({
          where: {
            productId,
            warehouseId: warehouseId || 'default-warehouse-id',
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
              productId,
              warehouseId: warehouseId || 'default-warehouse-id',
              quantity,
            },
          });
        }

        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        processedItems.push({
          productId,
          productName: product?.name || 'Unknown',
          quantity,
          status: 'restocked',
        });
      }
    }

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'RETURN_PROCESS',
        entity: 'ReturnRequest',
        entityId: returnRequestId,
        userId,
        changes: JSON.stringify({
          returnRequestId,
          disposition,
          itemsProcessed: processedItems.length,
          processedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        returnRequestId,
        disposition,
        processedItems,
        processedBy: userId,
        processedAt: new Date().toISOString(),
        message: '반품 처리가 완료되었습니다.',
      },
    });
  } catch (error) {
    console.error('Return processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '반품 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
