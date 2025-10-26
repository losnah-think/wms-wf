import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// PIC-007: 작업자 효율성
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');
    const period = searchParams.get('period') || 'today'; // today, week, month
    const type = searchParams.get('type') || 'all'; // all, picking, packing

    // 기간 설정
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 피킹 작업 조회
    let pickingEfficiency = null;
    if (type === 'all' || type === 'picking') {
      const pickingTasks = await prisma.pickingTask.findMany({
        where: {
          ...(workerId ? { assignedWorker: workerId } : {}),
          status: 'completed',
          completionTime: {
            gte: startDate,
          },
        },
        include: {
          order: {
            include: {
              items: true,
            },
          },
        },
      });

      if (pickingTasks.length > 0) {
        // 총 작업 시간 계산 (분 단위)
        const totalMinutes = pickingTasks.reduce((sum, task) => {
          if (task.completionTime && task.startTime) {
            return sum + (task.completionTime.getTime() - task.startTime.getTime()) / (1000 * 60);
          }
          return sum;
        }, 0);

        // 총 아이템 수
        const totalItems = pickingTasks.reduce((sum, task) => {
          return sum + task.order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        // 평균 시간 계산
        const avgTimePerTask = pickingTasks.length > 0 ? totalMinutes / pickingTasks.length : 0;
        const avgTimePerItem = totalItems > 0 ? totalMinutes / totalItems : 0;

        pickingEfficiency = {
          totalTasks: pickingTasks.length,
          totalItems,
          totalMinutes: Math.round(totalMinutes),
          avgTimePerTask: Math.round(avgTimePerTask * 10) / 10,
          avgTimePerItem: Math.round(avgTimePerItem * 10) / 10,
          itemsPerHour: avgTimePerItem > 0 ? Math.round(60 / avgTimePerItem) : 0,
        };
      }
    }

    // 패킹 작업 조회
    let packingEfficiency = null;
    if (type === 'all' || type === 'packing') {
      const packingTasks = await prisma.packingTask.findMany({
        where: {
          ...(workerId ? { assignedWorker: workerId } : {}),
          status: 'completed',
          completionTime: {
            gte: startDate,
          },
        },
        include: {
          order: {
            include: {
              items: true,
            },
          },
        },
      });

      if (packingTasks.length > 0) {
        const totalMinutes = packingTasks.reduce((sum, task) => {
          if (task.completionTime && task.startTime) {
            return sum + (task.completionTime.getTime() - task.startTime.getTime()) / (1000 * 60);
          }
          return sum;
        }, 0);

        const totalItems = packingTasks.reduce((sum, task) => {
          return sum + task.order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const avgTimePerTask = packingTasks.length > 0 ? totalMinutes / packingTasks.length : 0;
        const avgTimePerItem = totalItems > 0 ? totalMinutes / totalItems : 0;

        packingEfficiency = {
          totalTasks: packingTasks.length,
          totalItems,
          totalMinutes: Math.round(totalMinutes),
          avgTimePerTask: Math.round(avgTimePerTask * 10) / 10,
          avgTimePerItem: Math.round(avgTimePerItem * 10) / 10,
          itemsPerHour: avgTimePerItem > 0 ? Math.round(60 / avgTimePerItem) : 0,
        };
      }
    }

    // 종합 효율성
    const totalTasks = (pickingEfficiency?.totalTasks || 0) + (packingEfficiency?.totalTasks || 0);
    const totalItems = (pickingEfficiency?.totalItems || 0) + (packingEfficiency?.totalItems || 0);
    const totalMinutes = (pickingEfficiency?.totalMinutes || 0) + (packingEfficiency?.totalMinutes || 0);

    return NextResponse.json({
      success: true,
      data: {
        workerId: workerId || 'all',
        period: {
          type: period,
          from: startDate.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
        },
        summary: {
          totalTasks,
          totalItems,
          totalHours: Math.round(totalMinutes / 60 * 10) / 10,
          avgItemsPerHour: totalMinutes > 0 ? Math.round(totalItems / (totalMinutes / 60)) : 0,
        },
        picking: pickingEfficiency || {
          totalTasks: 0,
          totalItems: 0,
          totalMinutes: 0,
          avgTimePerTask: 0,
          avgTimePerItem: 0,
          itemsPerHour: 0,
        },
        packing: packingEfficiency || {
          totalTasks: 0,
          totalItems: 0,
          totalMinutes: 0,
          avgTimePerTask: 0,
          avgTimePerItem: 0,
          itemsPerHour: 0,
        },
      },
    });
  } catch (error) {
    console.error('Worker efficiency calculation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '작업자 효율성 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
