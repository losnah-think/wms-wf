import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// RET-007: 환불 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      returnRequestId,
      refundMethod, // card, cash, credit
      refundAmount,
      accountInfo,
      userId,
    } = body;

    // 필수값 검증
    if (!returnRequestId || !refundMethod || !refundAmount || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['returnRequestId', 'refundMethod', 'refundAmount', 'userId'],
        },
        { status: 400 }
      );
    }

    // 유효한 환불 방법 검증
    const validMethods = ['card', 'cash', 'credit'];
    if (!validMethods.includes(refundMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 환불 방법입니다.',
          validMethods,
        },
        { status: 400 }
      );
    }

    // 환불 ID 생성
    const refundId = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 예상 환불 완료일 (환불 방법에 따라 다름)
    const expectedDate = new Date();
    if (refundMethod === 'card') {
      expectedDate.setDate(expectedDate.getDate() + 7); // 카드 취소는 7일
    } else if (refundMethod === 'cash') {
      expectedDate.setDate(expectedDate.getDate() + 1); // 현금은 1일
    } else if (refundMethod === 'credit') {
      expectedDate.setDate(expectedDate.getDate() + 0); // 적립금은 즉시
    }

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'REFUND_PROCESS',
        entity: 'ReturnRequest',
        entityId: returnRequestId,
        userId,
        changes: JSON.stringify({
          refundId,
          returnRequestId,
          refundMethod,
          refundAmount,
          accountInfo: accountInfo || 'N/A',
          expectedDate: expectedDate.toISOString(),
          processedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        refundId,
        returnRequestId,
        refundInfo: {
          method: refundMethod,
          amount: refundAmount,
          accountInfo: accountInfo || 'N/A',
        },
        expectedDate: expectedDate.toISOString().split('T')[0],
        status: 'processing',
        processedBy: userId,
        processedAt: new Date().toISOString(),
        message: '환불이 접수되었습니다.',
      },
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '환불 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
