import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CFG-003: 알림 규칙 설정

// 알림 규칙 조회
export async function GET(request: NextRequest) {
  try {
    // 감사 로그에서 최근 알림 설정 조회
    const alertLogs = await prisma.auditLog.findMany({
      where: {
        action: 'ALERT_CONFIG_UPDATE',
        entity: 'AlertConfig',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    let alertRules = {
      stockAlerts: {
        lowStock: {
          enabled: true,
          threshold: 10,
          recipients: ['manager@example.com'],
        },
        outOfStock: {
          enabled: true,
          recipients: ['admin@example.com', 'manager@example.com'],
        },
        expiringProducts: {
          enabled: true,
          daysBeforeExpiry: 30,
          recipients: ['manager@example.com'],
        },
      },
      orderAlerts: {
        delayedOrders: {
          enabled: true,
          delayThreshold: 24, // hours
          recipients: ['operations@example.com'],
        },
        failedShipments: {
          enabled: true,
          recipients: ['admin@example.com'],
        },
      },
      systemAlerts: {
        backupFailure: {
          enabled: true,
          recipients: ['admin@example.com'],
        },
        unauthorizedAccess: {
          enabled: true,
          recipients: ['security@example.com'],
        },
      },
    };

    if (alertLogs.length > 0) {
      const savedConfig = JSON.parse(alertLogs[0].changes);
      alertRules = { ...alertRules, ...savedConfig };
    }

    return NextResponse.json({
      success: true,
      data: alertRules,
    });
  } catch (error) {
    console.error('Alert config retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '알림 규칙 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 알림 규칙 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertRules, updatedBy } = body;

    if (!alertRules || !updatedBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['alertRules', 'updatedBy'],
        },
        { status: 400 }
      );
    }

    // 알림 규칙 변경 기록
    await prisma.auditLog.create({
      data: {
        action: 'ALERT_CONFIG_UPDATE',
        entity: 'AlertConfig',
        entityId: 'alerts',
        userId: updatedBy,
        changes: JSON.stringify(alertRules),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        alertRules,
        updatedBy,
        updatedAt: new Date().toISOString(),
        message: '알림 규칙이 업데이트되었습니다.',
      },
    });
  } catch (error) {
    console.error('Alert config update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '알림 규칙 업데이트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 알림 전송 (테스트)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertType, message, recipients } = body;

    if (!alertType || !message) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['alertType', 'message'],
        },
        { status: 400 }
      );
    }

    // 알림 전송 시뮬레이션
    const notificationId = `NOTIF${Date.now()}`;

    // 알림 전송 기록
    await prisma.auditLog.create({
      data: {
        action: 'ALERT_SEND',
        entity: 'Alert',
        entityId: notificationId,
        userId: 'system',
        changes: JSON.stringify({
          notificationId,
          alertType,
          message,
          recipients: recipients || [],
          sentAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        notificationId,
        alertType,
        content: message,
        recipients: recipients || [],
        sentAt: new Date().toISOString(),
        status: '알림이 전송되었습니다.',
      },
    });
  } catch (error) {
    console.error('Alert send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '알림 전송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
