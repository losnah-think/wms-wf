import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const station = searchParams.get('station') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 필터 조건
    const where: any = {
      status: { in: ['pending', 'packing', 'completed'] },
    }

    // 패킹 데이터 조회 (PackingTask)
    const [packingTasks, total] = await Promise.all([
      prisma.packingTask.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.packingTask.count({ where }),
    ])

    // 주문 정보 조회
    const orderIds = packingTasks.map(t => t.orderId)
    const orders = await prisma.outboundOrder.findMany({
      where: { id: { in: orderIds } },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    const orderMap = new Map(orders.map(o => [o.id, o]))

    // 응답 데이터 포맷팅
    const formattedData = packingTasks.map((task) => {
      const order = orderMap.get(task.orderId)
      const productName = order?.items[0]?.product.name || 'Unknown'
      const quantity = order?.items[0]?.quantity || 0

      return {
        id: task.id,
        orderId: task.orderId,
        productCode: order?.items[0]?.product.code || '',
        productName,
        quantity,
        workerId: task.assignedWorker || 'Unassigned',
        status: task.status,
        priority: 'normal',
        createdAt: task.createdAt,
        assignedAt: task.startTime,
        packedAt: task.completionTime,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching packing tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch packing tasks',
      },
      { status: 500 }
    )
  }
}
