import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PIC-004: 바코드 검증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, barcodeData, expectedProductId } = body;

    // 필수값 검증
    if (!assignmentId || !barcodeData || !expectedProductId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['assignmentId', 'barcodeData', 'expectedProductId'],
        },
        { status: 400 }
      );
    }

    // 바코드로 상품 검색
    const scannedProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { barcode: barcodeData },
          { sku: barcodeData },
          { code: barcodeData },
        ],
      },
    });

    if (!scannedProduct) {
      return NextResponse.json({
        success: false,
        result: '오류',
        isMatch: false,
        error: '바코드에 해당하는 상품을 찾을 수 없습니다.',
        barcodeData,
        message: '유효하지 않은 바코드입니다.',
      });
    }

    // 기대 상품과 비교
    const isMatch = scannedProduct.id === expectedProductId;

    // 기대 상품 정보 조회
    const expectedProduct = await prisma.product.findUnique({
      where: { id: expectedProductId },
    });

    // 검증 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'BARCODE_VERIFY',
        entity: 'PickingTask',
        entityId: assignmentId,
        userId: 'SCANNER',
        changes: JSON.stringify({
          assignmentId,
          barcodeData,
          scannedProductId: scannedProduct.id,
          scannedProductName: scannedProduct.name,
          expectedProductId,
          expectedProductName: expectedProduct?.name,
          isMatch,
          verifiedAt: new Date().toISOString(),
        }),
      },
    });

    if (!isMatch) {
      return NextResponse.json({
        success: true,
        result: '오류',
        isMatch: false,
        scannedProduct: {
          id: scannedProduct.id,
          code: scannedProduct.code,
          name: scannedProduct.name,
          barcode: scannedProduct.barcode,
        },
        expectedProduct: {
          id: expectedProduct?.id,
          code: expectedProduct?.code,
          name: expectedProduct?.name,
          barcode: expectedProduct?.barcode,
        },
        message: '스캔한 상품이 주문 상품과 일치하지 않습니다. 다시 확인해주세요.',
      });
    }

    return NextResponse.json({
      success: true,
      result: '정상',
      isMatch: true,
      scannedProduct: {
        id: scannedProduct.id,
        code: scannedProduct.code,
        name: scannedProduct.name,
        barcode: scannedProduct.barcode,
      },
      message: '올바른 상품입니다. 피킹을 진행하세요.',
    });
  } catch (error) {
    console.error('Barcode verification error:', error);
    return NextResponse.json(
      {
        success: false,
        result: '오류',
        isMatch: false,
        error: '바코드 검증 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
