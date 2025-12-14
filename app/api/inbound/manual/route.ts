import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-003: 입고 처리 (수동)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      quantity,
      lotNumber,
      expiryDate,
      warehouseId,
      supplierId,
      handledBy,
    } = body;

    // 필수값 검증
    if (!productId || !quantity || !lotNumber || !warehouseId || !handledBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['productId', 'quantity', 'lotNumber', 'warehouseId', 'handledBy'],
        },
        { status: 400 }
      );
    }

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

    // 창고 존재 확인
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 창고입니다.',
        },
        { status: 404 }
      );
    }

    // 공급처 확인 (선택사항)
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });

      if (!supplier) {
        return NextResponse.json(
          {
            success: false,
            error: '존재하지 않는 공급처입니다.',
          },
          { status: 404 }
        );
      }
    }

    // 트랜잭션으로 입고 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 입고 요청 생성
      const requestNumber = `MIB-${Date.now()}`;
      const inboundRequest = await tx.inboundRequest.create({
        data: {
          requestNumber,
          supplierId: supplierId || warehouse.id,
          requestDate: new Date(),
          expectedDate: new Date(),
          status: 'approved',
          totalQuantity: quantity,
          totalAmount: 0,
          notes: `수동 입고 - 로트번호: ${lotNumber}${expiryDate ? `, 유효기한: ${expiryDate}` : ''}`,
        },
      });

      // 2. 입고 아이템 생성
      const inboundItem = await tx.inboundRequestItem.create({
        data: {
          requestId: inboundRequest.id,
          productId: productId,
          quantity: quantity,
          unitPrice: 0,
        },
      });

      // 3. 입고 스케줄 생성
      const scheduleNumber = `SCH-${Date.now()}`;
      await tx.inboundSchedule.create({
        data: {
          scheduleNumber,
          requestId: inboundRequest.id,
          supplierId: supplierId || warehouse.id,
          expectedDate: new Date(),
          estimatedArrival: new Date(),
          status: 'arrived',
          totalQuantity: quantity,
          receivedQuantity: quantity,
        },
      });

      // 4. 창고 재고 업데이트
      const existingStock = await tx.warehouseProduct.findFirst({
        where: {
          warehouseId: warehouseId,
          productId: productId,
        },
      });

      if (existingStock) {
        // 기존 재고 증가
        await tx.warehouseProduct.update({
          where: { id: existingStock.id },
          data: {
            quantity: existingStock.quantity + quantity,
          },
        });
      } else {
        // 새 재고 생성
        await tx.warehouseProduct.create({
          data: {
            warehouseId: warehouseId,
            productId: productId,
            quantity: quantity,
          },
        });
      }

      // 5. 작업 로그 기록
      await tx.auditLog.create({
        data: {
          action: 'INBOUND_MANUAL',
          entityId: inboundRequest.id,
          userId: handledBy,
          changes: JSON.stringify({
            productId,
            quantity,
            lotNumber,
            expiryDate,
            warehouseId,
          }),
        },
      });

      return {
        inboundRequest,
        inboundItem,
      };
    });

    // 업데이트된 재고 조회
    const updatedStock = await prisma.warehouseProduct.findFirst({
      where: {
        warehouseId: warehouseId,
        productId: productId,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        inboundId: result.inboundRequest.id,
        inboundDate: result.inboundRequest.requestDate,
        status: '완료',
        updatedStock: {
          productId: updatedStock?.productId,
          productName: updatedStock?.product.name,
          warehouseName: updatedStock?.warehouse.name,
          quantity: updatedStock?.quantity,
        },
        inboundRecord: {
          id: result.inboundRequest.id,
          quantity: quantity,
          lotNumber: lotNumber,
          expiryDate: expiryDate || null,
          handledBy: handledBy,
          createdAt: result.inboundRequest.requestDate,
        },
      },
    });
  } catch (error) {
    console.error('Manual inbound error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '입고 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
