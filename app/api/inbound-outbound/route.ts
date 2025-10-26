import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // 입고 데이터 조회
    const inbounds = await prisma.inboundSchedule.findMany({
      skip,
      take: Math.ceil(limit / 2),
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    // 출고 데이터 조회 (InboundRequest로부터)
    const outbounds = await prisma.inboundRequest.findMany({
      skip,
      take: Math.ceil(limit / 2),
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // 총 개수
    const inboundCount = await prisma.inboundSchedule.count()
    const outboundCount = await prisma.inboundRequest.count()
    const total = inboundCount + outboundCount

    // 입고 데이터 포맷팅
    const inboundData = inbounds.map((item) => ({
      id: `inbound-${item.id}`,
      type: 'INBOUND',
      productId: item.request?.items[0]?.productId || '',
      productName: item.request?.items[0]?.product.name || 'Unknown',
      quantity: item.totalQuantity,
      status: item.status === 'arrived' ? 'COMPLETED' : item.status === 'on-schedule' ? 'IN_PROGRESS' : 'PENDING',
      createdAt: item.createdAt,
    }))

    // 출고 데이터 포맷팅
    const outboundData = outbounds.map((item) => ({
      id: `outbound-${item.id}`,
      type: 'OUTBOUND',
      productId: item.items[0]?.productId || '',
      productName: item.items[0]?.product.name || 'Unknown',
      quantity: item.items.reduce((sum, i) => sum + i.quantity, 0),
      status: item.status === 'completed' ? 'COMPLETED' : item.status === 'approved' ? 'IN_PROGRESS' : 'PENDING',
      createdAt: item.createdAt,
    }))

    // 통합 데이터
    const combinedData = [...inboundData, ...outboundData]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: combinedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[API] Error fetching inbound-outbound:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
      },
      { status: 500 }
    )
  }
}
