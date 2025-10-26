import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// USER-001: 사용자 관리 (CRUD)

// 사용자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    // 감사 로그에서 사용자 활동 조회 (사용자 테이블이 없으므로 감사 로그 활용)
    const users = await prisma.auditLog.groupBy({
      by: ['userId'],
      _count: {
        userId: true,
      },
      where: {
        userId: {
          not: null,
        },
      },
    });

    // 고유 사용자 목록
    const uniqueUsers = users
      .filter(u => u.userId)
      .map(u => ({
        userId: u.userId,
        activityCount: u._count.userId,
        role: 'worker', // 기본값
        isActive: true,
      }));

    return NextResponse.json({
      success: true,
      data: {
        total: uniqueUsers.length,
        users: uniqueUsers,
      },
    });
  } catch (error) {
    console.error('User list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '사용자 목록 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 사용자 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      username,
      email,
      role, // admin, manager, worker
      permissions,
      createdBy,
    } = body;

    // 필수값 검증
    if (!userId || !username || !email || !role || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['userId', 'username', 'email', 'role', 'createdBy'],
        },
        { status: 400 }
      );
    }

    // 유효한 역할 검증
    const validRoles = ['admin', 'manager', 'worker'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 역할입니다.',
          validRoles,
        },
        { status: 400 }
      );
    }

    // 감사 로그에 사용자 생성 기록
    await prisma.auditLog.create({
      data: {
        action: 'USER_CREATE',
        entity: 'User',
        entityId: userId,
        userId: createdBy,
        changes: JSON.stringify({
          userId,
          username,
          email,
          role,
          permissions: permissions || [],
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        username,
        email,
        role,
        permissions: permissions || [],
        isActive: true,
        createdBy,
        createdAt: new Date().toISOString(),
        message: '사용자가 생성되었습니다.',
      },
    });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '사용자 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 사용자 수정
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates, updatedBy } = body;

    if (!userId || !updates || !updatedBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['userId', 'updates', 'updatedBy'],
        },
        { status: 400 }
      );
    }

    // 감사 로그에 사용자 수정 기록
    await prisma.auditLog.create({
      data: {
        action: 'USER_UPDATE',
        entity: 'User',
        entityId: userId,
        userId: updatedBy,
        changes: JSON.stringify({
          userId,
          updates,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        updates,
        updatedBy,
        updatedAt: new Date().toISOString(),
        message: '사용자 정보가 수정되었습니다.',
      },
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '사용자 수정 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 사용자 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const deletedBy = searchParams.get('deletedBy');

    if (!userId || !deletedBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 파라미터가 누락되었습니다.',
          required: ['userId', 'deletedBy'],
        },
        { status: 400 }
      );
    }

    // 감사 로그에 사용자 삭제 기록
    await prisma.auditLog.create({
      data: {
        action: 'USER_DELETE',
        entity: 'User',
        entityId: userId,
        userId: deletedBy,
        changes: JSON.stringify({
          userId,
          deletedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        deletedBy,
        deletedAt: new Date().toISOString(),
        message: '사용자가 삭제되었습니다.',
      },
    });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '사용자 삭제 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
