import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// STK-007: 바코드 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, barcodeType = 'CODE128', printCount = 1 } = body;

    // 필수값 검증
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: '상품 ID가 필요합니다.',
          required: ['productId'],
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

    // 바코드 타입 검증
    const validTypes = ['CODE128', 'EAN13', 'QR'];
    if (!validTypes.includes(barcodeType)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 바코드 타입입니다.',
          validTypes,
        },
        { status: 400 }
      );
    }

    // 바코드 값 생성 (기존 바코드가 있으면 사용, 없으면 상품코드 기반 생성)
    let barcodeValue = product.barcode;
    
    if (!barcodeValue) {
      // 바코드가 없으면 생성
      switch (barcodeType) {
        case 'EAN13':
          // EAN13: 13자리 숫자
          barcodeValue = `${product.code.padStart(12, '0')}${generateCheckDigit(product.code)}`;
          break;
        case 'QR':
          // QR: JSON 형식
          barcodeValue = JSON.stringify({
            id: product.id,
            code: product.code,
            name: product.name,
            sku: product.sku,
          });
          break;
        case 'CODE128':
        default:
          // CODE128: 상품코드 사용
          barcodeValue = product.sku || product.code;
          break;
      }

      // 생성된 바코드를 상품에 저장
      await prisma.product.update({
        where: { id: productId },
        data: { barcode: barcodeValue },
      });
    }

    // 바코드 생성 기록 저장
    await prisma.auditLog.create({
      data: {
        action: 'BARCODE_GENERATE',
        entity: 'Product',
        entityId: product.id,
        userId: 'SYSTEM',
        changes: JSON.stringify({
          productId,
          barcodeType,
          barcodeValue,
          printCount,
        }),
      },
    });

    // 바코드 이미지 URL 생성 (실제로는 바코드 라이브러리 사용)
    const barcodeImageUrl = generateBarcodeImageUrl(barcodeValue, barcodeType);

    return NextResponse.json({
      success: true,
      status: '완료',
      data: {
        barcodeId: `BC-${productId}-${Date.now()}`,
        barcodeValue,
        barcodeType,
        barcodeImage: barcodeImageUrl,
        product: {
          id: product.id,
          code: product.code,
          name: product.name,
          sku: product.sku,
        },
        printCount,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Barcode generation error:', error);
    return NextResponse.json(
      {
        success: false,
        status: '실패',
        error: '바코드 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 체크디지트 생성 (EAN13용)
function generateCheckDigit(code: string): string {
  const digits = code.padStart(12, '0').split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

// 바코드 이미지 URL 생성 (외부 서비스 또는 자체 생성)
function generateBarcodeImageUrl(value: string, type: string): string {
  // 실제 구현시에는 barcode 라이브러리를 사용하거나 외부 API 호출
  // 여기서는 예시 URL 반환
  const encodedValue = encodeURIComponent(value);
  
  switch (type) {
    case 'QR':
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedValue}`;
    case 'EAN13':
    case 'CODE128':
    default:
      return `https://barcode.tec-it.com/barcode.ashx?data=${encodedValue}&code=${type}&translate-esc=on`;
  }
}
