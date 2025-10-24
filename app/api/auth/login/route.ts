import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// USER-003: 로그인/인증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    // 필수값 검증
    if (!userId || !password) {
      return NextResponse.json(
        {
          success: false,
          error: '아이디와 비밀번호를 입력해주세요.',
          required: ['userId', 'password'],
        },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 사용자 정보와 해시된 비밀번호를 확인
    // 여기서는 간단한 시뮬레이션
    const validUsers = ['admin', 'manager', 'worker001'];
    
    if (!validUsers.includes(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 사용자입니다.',
        },
        { status: 401 }
      );
    }

    // 비밀번호 검증 (실제로는 bcrypt 등으로 해시 비교)
    if (password.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: '비밀번호가 올바르지 않습니다.',
        },
        { status: 401 }
      );
    }

    // 역할 결정
    let role = 'worker';
    if (userId === 'admin') role = 'admin';
    else if (userId === 'manager') role = 'manager';

    // 토큰 생성 (실제로는 JWT 등 사용)
    const token = `token_${userId}_${Date.now()}`;

    // 로그인 기록
    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: userId,
        userId,
        changes: JSON.stringify({
          userId,
          loginTime: new Date().toISOString(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        role,
        token,
        permissions: await getUserPermissions(userId, role),
        loginTime: new Date().toISOString(),
        message: '로그인 성공',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '로그인 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function getUserPermissions(userId: string, role: string) {
  const rolePermissions = {
    admin: ['*'], // 모든 권한
    manager: ['stock.*', 'orders.*', 'reports.*'],
    worker: ['stock.read', 'orders.read', 'picking.*', 'packing.*'],
  };

  return rolePermissions[role as keyof typeof rolePermissions] || [];
}
