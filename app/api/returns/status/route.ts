import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// RET-006: 반품 상태 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { returnRequestId, status, notes, userId } = body;
    // status: 'received', 'inspecting', 'processed', 'refunded', 'rejected'

    // 필수값 검증
    if (!returnRequestId || !status || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['returnRequestId', 'status', 'userId'],
        },
        { status: 400 }
      );
    }

    // 유효한 상태 검증
    const validStatuses = ['received', 'inspecting', 'processed', 'refunded', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 상태입니다.',
          validStatuses,
        },
        { status: 400 }
      );
    }

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'STATUS_UPDATE',
        entity: 'ReturnRequest',
        entityId: returnRequestId,
        userId,
        changes: JSON.stringify({
          returnRequestId,
          newStatus: status,
          notes: notes || '',
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        returnRequestId,
        status,
        notes: notes || '',
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
        message: '반품 상태가 업데이트되었습니다.',
      },
    });
  } catch (error) {
    console.error('Return status update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '반품 상태 업데이트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
