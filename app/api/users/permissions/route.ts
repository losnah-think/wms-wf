import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// USER-002: 권한 관리
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      permissions, // ['stock.read', 'stock.write', 'orders.read', 'orders.write', etc.]
      role,
      updatedBy,
    } = body;

    // 필수값 검증
    if (!userId || !updatedBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['userId', 'updatedBy'],
        },
        { status: 400 }
      );
    }

    // 역할별 기본 권한 정의
    const rolePermissions = {
      admin: [
        'stock.read', 'stock.write', 'stock.delete',
        'orders.read', 'orders.write', 'orders.delete',
        'users.read', 'users.write', 'users.delete',
        'reports.read', 'reports.generate',
        'settings.read', 'settings.write',
      ],
      manager: [
        'stock.read', 'stock.write',
        'orders.read', 'orders.write',
        'users.read',
        'reports.read', 'reports.generate',
        'settings.read',
      ],
      worker: [
        'stock.read',
        'orders.read',
        'picking.read', 'picking.write',
        'packing.read', 'packing.write',
      ],
    };

    // 역할 또는 커스텀 권한 설정
    let finalPermissions = permissions;
    if (role && !permissions) {
      finalPermissions = rolePermissions[role as keyof typeof rolePermissions] || [];
    }

    // 감사 로그에 권한 변경 기록
    await prisma.auditLog.create({
      data: {
        action: 'PERMISSIONS_UPDATE',
        entity: 'User',
        entityId: userId,
        userId: updatedBy,
        changes: JSON.stringify({
          userId,
          permissions: finalPermissions,
          role: role || 'custom',
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        role: role || 'custom',
        permissions: finalPermissions,
        updatedBy,
        updatedAt: new Date().toISOString(),
        message: '권한이 업데이트되었습니다.',
      },
    });
  } catch (error) {
    console.error('Permission update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '권한 업데이트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 사용자 권한 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 최근 권한 변경 기록 조회
    const permissionLogs = await prisma.auditLog.findMany({
      where: {
        action: 'PERMISSIONS_UPDATE',
        entityId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    let permissions: string[] = [];
    let role = 'worker';

    if (permissionLogs.length > 0) {
      const changes = JSON.parse(permissionLogs[0].changes);
      permissions = changes.permissions || [];
      role = changes.role || 'worker';
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        role,
        permissions,
      },
    });
  } catch (error) {
    console.error('Permission retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '권한 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
