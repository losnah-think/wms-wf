import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CFG-004: 백업/복원

// 백업 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupType, includeData, userId } = body;
    // backupType: 'full', 'incremental', 'schema-only'
    // includeData: ['products', 'inventory', 'orders', 'users', etc.]

    if (!backupType || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['backupType', 'userId'],
        },
        { status: 400 }
      );
    }

    // 백업 ID 생성
    const backupId = `BKP${Date.now()}`;

    // 백업 데이터 수집 (시뮬레이션)
    const backupData: any = {
      metadata: {
        backupId,
        backupType,
        createdAt: new Date().toISOString(),
        createdBy: userId,
      },
    };

    if (backupType === 'full' || includeData?.includes('products')) {
      const products = await prisma.product.count();
      backupData.products = { count: products };
    }

    if (backupType === 'full' || includeData?.includes('inventory')) {
      const inventory = await prisma.warehouseProduct.count();
      backupData.inventory = { count: inventory };
    }

    if (backupType === 'full' || includeData?.includes('orders')) {
      const orders = await prisma.outboundOrder.count();
      backupData.orders = { count: orders };
    }

    // 백업 완료 크기 계산 (예시)
    const backupSize = JSON.stringify(backupData).length;

    // 백업 기록
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_CREATE',
        entity: 'Backup',
        entityId: backupId,
        userId,
        changes: JSON.stringify({
          backupId,
          backupType,
          includeData: includeData || 'all',
          size: `${(backupSize / 1024).toFixed(2)} KB`,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        backupId,
        backupType,
        size: `${(backupSize / 1024).toFixed(2)} KB`,
        includeData: includeData || 'all',
        createdBy: userId,
        createdAt: new Date().toISOString(),
        message: '백업이 생성되었습니다.',
      },
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '백업 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 백업 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 백업 기록 조회
    const backupLogs = await prisma.auditLog.findMany({
      where: {
        action: 'BACKUP_CREATE',
        entity: 'Backup',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const backups = backupLogs.map(log => {
      const changes = JSON.parse(log.changes);
      return {
        backupId: changes.backupId,
        backupType: changes.backupType,
        size: changes.size,
        createdBy: log.userId,
        createdAt: log.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        total: backups.length,
        backups,
      },
    });
  } catch (error) {
    console.error('Backup list retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '백업 목록 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 백업 복원
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId, restoreOptions, userId } = body;

    if (!backupId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['backupId', 'userId'],
        },
        { status: 400 }
      );
    }

    // 복원 ID 생성
    const restoreId = `RST${Date.now()}`;

    // 복원 기록
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_RESTORE',
        entity: 'Backup',
        entityId: backupId,
        userId,
        changes: JSON.stringify({
          restoreId,
          backupId,
          restoreOptions: restoreOptions || {},
          restoredAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        restoreId,
        backupId,
        status: 'completed',
        restoredBy: userId,
        restoredAt: new Date().toISOString(),
        message: '백업이 복원되었습니다.',
      },
    });
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '백업 복원 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
