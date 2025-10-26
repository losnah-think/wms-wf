import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// USER-004: 사용자 활동 로그
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 필터 조건 구성
    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (action) {
      whereClause.action = action;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    // 활동 로그 조회
    const activities = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // 활동 통계
    const stats = {
      totalActivities: activities.length,
      byAction: {} as Record<string, number>,
      byEntity: {} as Record<string, number>,
    };

    activities.forEach(activity => {
      // 액션별 집계
      stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1;
      // 엔티티별 집계
      stats.byEntity[activity.entity] = (stats.byEntity[activity.entity] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        filters: {
          userId: userId || 'all',
          action: action || 'all',
          dateRange: {
            start: startDate || null,
            end: endDate || null,
          },
        },
        stats,
        activities: activities.map(a => ({
          id: a.id,
          userId: a.userId,
          action: a.action,
          entity: a.entity,
          entityId: a.entityId,
          changes: a.changes,
          timestamp: a.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Activity log retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '활동 로그 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
