import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 입고 통계
    const [
      scheduledCount,
      pendingApprovalCount,
      inProgressCount,
      todayInboundCount,
    ] = await Promise.all([
      // 입고 예정: expectedDate가 미래인 스케줄
      prisma.inboundSchedule.count({
        where: {
          expectedDate: { gte: today },
          status: { in: ['pending', 'on-schedule'] },
        },
      }),
      // 승인 대기: pending 상태의 승인
      prisma.inboundApproval.count({
        where: { status: 'pending' },
      }),
      // 입고 진행중: arrived 상태
      prisma.inboundSchedule.count({
        where: { status: 'arrived' },
      }),
      // 오늘 입고: 오늘 도착 예정
      prisma.inboundSchedule.count({
        where: {
          expectedDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ])

    // 출고 통계 (현재는 모의 데이터, 추후 OutboundOrder 모델 사용)
    const outboundStats = {
      awaitingPicking: 42,
      pickingInProgress: 18,
      awaitingPacking: 25,
      todayShipment: 12,
    }

    return NextResponse.json({
      success: true,
      data: {
        inbound: {
          scheduled: scheduledCount,
          pendingApproval: pendingApprovalCount,
          inProgress: inProgressCount,
          todayInbound: todayInboundCount,
        },
        outbound: outboundStats,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard stats',
      },
      { status: 500 }
    )
  }
}
