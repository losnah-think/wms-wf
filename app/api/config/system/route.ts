import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CFG-001: 시스템 설정

// 시스템 설정 조회
export async function GET(request: NextRequest) {
  try {
    // 감사 로그에서 최근 설정 조회
    const configLogs = await prisma.auditLog.findMany({
      where: {
        action: 'CONFIG_UPDATE',
        entity: 'SystemConfig',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    let config = {
      language: 'ko',
      timezone: 'Asia/Seoul',
      dateFormat: 'YYYY-MM-DD',
      currency: 'KRW',
      autoBackup: true,
      backupInterval: '24h',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      stockAlert: {
        enabled: true,
        threshold: 10,
      },
    };

    if (configLogs.length > 0) {
      const savedConfig = JSON.parse(configLogs[0].changes);
      config = { ...config, ...savedConfig };
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('System config retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '시스템 설정 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 시스템 설정 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, updatedBy } = body;

    if (!config || !updatedBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['config', 'updatedBy'],
        },
        { status: 400 }
      );
    }

    // 설정 변경 기록
    await prisma.auditLog.create({
      data: {
        action: 'CONFIG_UPDATE',
        entity: 'SystemConfig',
        entityId: 'system',
        userId: updatedBy,
        changes: JSON.stringify(config),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        config,
        updatedBy,
        updatedAt: new Date().toISOString(),
        message: '시스템 설정이 업데이트되었습니다.',
      },
    });
  } catch (error) {
    console.error('System config update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '시스템 설정 업데이트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
