import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 필터 조건
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    // 반품 피킹 데이터 조회 (PickingTask 중 반품 관련)
    const [tasks, total] = await Promise.all([
      prisma.pickingTask.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pickingTask.count({ where }),
    ])

    // 주문 정보 조회
    const orderIds = tasks.map(t => t.orderId)
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
    const formattedData = tasks.map((task) => {
      const order = orderMap.get(task.orderId)
      const product = order?.items[0]?.product

      return {
        id: task.id,
        returnRequestId: task.id,
        orderId: task.orderId,
        productId: product?.id || '',
        productName: product?.name || 'Unknown',
        quantity: order?.items[0]?.quantity || 0,
        reason: '고객 반품 요청',
        status: task.status,
        assignedTo: task.assignedWorker || 'Unassigned',
        createdAt: task.createdAt,
        priority: task.status === 'pending' ? 'high' : 'normal',
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
    console.error('Error fetching return picking tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch return picking tasks',
      },
      { status: 500 }
    )
  }
}
