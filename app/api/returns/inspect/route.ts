import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// RET-002: 반품 검수
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      returnRequestId,
      items, // [{ productId, expectedQty, receivedQty, condition, damageType, notes }]
      inspectorId,
    } = body;

    // 필수값 검증
    if (!returnRequestId || !items || !Array.isArray(items) || !inspectorId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['returnRequestId', 'items (array)', 'inspectorId'],
        },
        { status: 400 }
      );
    }

    // 검수 결과 집계
    let totalExpected = 0;
    let totalReceived = 0;
    let totalNormal = 0;
    let totalDamaged = 0;
    let totalMissing = 0;

    const inspectionResults = [];

    for (const item of items) {
      const { productId, expectedQty, receivedQty, condition, damageType, notes } = item;

      totalExpected += expectedQty || 0;
      totalReceived += receivedQty || 0;

      if (condition === 'normal') {
        totalNormal += receivedQty || 0;
      } else if (condition === 'damaged') {
        totalDamaged += receivedQty || 0;
      }

      if ((receivedQty || 0) < (expectedQty || 0)) {
        totalMissing += (expectedQty || 0) - (receivedQty || 0);
      }

      // 상품 정보 조회
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      inspectionResults.push({
        productId,
        productName: product?.name || 'Unknown',
        expectedQty: expectedQty || 0,
        receivedQty: receivedQty || 0,
        condition: condition || 'unknown',
        damageType: damageType || null,
        notes: notes || '',
        status: (receivedQty || 0) === (expectedQty || 0) ? 'match' : 'mismatch',
      });
    }

    // 검수 완료율 계산
    const inspectionRate = totalExpected > 0
      ? Math.round((totalReceived / totalExpected) * 100)
      : 0;

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'RETURN_INSPECT',
        entity: 'ReturnRequest',
        entityId: returnRequestId,
        userId: inspectorId,
        changes: JSON.stringify({
          totalExpected,
          totalReceived,
          totalNormal,
          totalDamaged,
          totalMissing,
          inspectionRate: `${inspectionRate}%`,
          inspectedAt: new Date().toISOString(),
          items: inspectionResults,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        inspectionId: `INS${Date.now()}`,
        returnRequestId,
        summary: {
          totalExpected,
          totalReceived,
          totalNormal,
          totalDamaged,
          totalMissing,
          inspectionRate: `${inspectionRate}%`,
        },
        items: inspectionResults,
        inspectedBy: inspectorId,
        inspectedAt: new Date().toISOString(),
        message: '반품 검수가 완료되었습니다.',
      },
    });
  } catch (error) {
    console.error('Return inspection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '반품 검수 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
