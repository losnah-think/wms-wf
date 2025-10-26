import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// RET-003: 불량 분류
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      returnRequestId,
      productId,
      quantity,
      defectType, // 파손, 오배송, 불량, 단순변심, 기타
      severity, // critical, major, minor
      disposition, // resale, repair, discard
      notes,
      classifierId,
    } = body;

    // 필수값 검증
    if (!returnRequestId || !productId || !quantity || !defectType || !disposition || !classifierId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['returnRequestId', 'productId', 'quantity', 'defectType', 'disposition', 'classifierId'],
        },
        { status: 400 }
      );
    }

    // 유효한 불량 유형 검증
    const validDefectTypes = ['파손', '오배송', '불량', '단순변심', '기타'];
    if (!validDefectTypes.includes(defectType)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 불량 유형입니다.',
          validTypes: validDefectTypes,
        },
        { status: 400 }
      );
    }

    // 유효한 처리 방침 검증
    const validDispositions = ['resale', 'repair', 'discard'];
    if (!validDispositions.includes(disposition)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 처리 방침입니다.',
          validDispositions,
        },
        { status: 400 }
      );
    }

    // 상품 정보 조회
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

    // 분류 ID 생성
    const classificationId = `CLS${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 처리 방침에 따른 액션 결정
    let actionRequired = '';
    if (disposition === 'resale') {
      actionRequired = '재판매 가능 - 정상 재고로 입고';
    } else if (disposition === 'repair') {
      actionRequired = '수리 필요 - 수리 센터 이동';
    } else if (disposition === 'discard') {
      actionRequired = '폐기 필요 - 폐기 프로세스 진행';
    }

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'DEFECT_CLASSIFY',
        entity: 'Product',
        entityId: productId,
        userId: classifierId,
        changes: JSON.stringify({
          classificationId,
          returnRequestId,
          productId,
          productName: product.name,
          quantity,
          defectType,
          severity: severity || 'minor',
          disposition,
          actionRequired,
          notes: notes || '',
          classifiedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        classificationId,
        returnRequestId,
        product: {
          id: product.id,
          code: product.code,
          name: product.name,
        },
        classification: {
          quantity,
          defectType,
          severity: severity || 'minor',
          disposition,
          actionRequired,
        },
        notes: notes || '',
        classifiedBy: classifierId,
        classifiedAt: new Date().toISOString(),
        message: '불량 분류가 완료되었습니다.',
      },
    });
  } catch (error) {
    console.error('Defect classification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '불량 분류 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
