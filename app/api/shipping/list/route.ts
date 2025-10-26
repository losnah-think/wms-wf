import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'
    const carrier = searchParams.get('carrier') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 필터 조건
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (carrier && carrier !== 'all') {
      where.notes = { contains: carrier, mode: 'insensitive' }
    }

    // 배송 데이터 조회
    const [shipments, total] = await Promise.all([
      prisma.outboundOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.outboundOrder.count({ where }),
    ])

    // 응답 데이터 포맷팅
    const formattedData = shipments.map((shipment) => {
      const trackingNumber = shipment.notes?.split('|')[0] || 'TRACKING-' + shipment.id.substring(0, 8)
      const carrier = shipment.notes?.includes('CJ') ? 'CJ대한통운' :
                      shipment.notes?.includes('HJ') ? '한진택배' :
                      shipment.notes?.includes('LG') ? '로젠택배' :
                      shipment.notes?.includes('KP') ? '우체국택배' : '택배사미정'

      return {
        id: shipment.id,
        orderId: shipment.id,
        trackingNumber,
        carrier,
        status: shipment.status || 'PENDING',
        shippedAt: shipment.createdAt,
        estimatedDelivery: new Date(new Date(shipment.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000),
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
    console.error('Error fetching shipments:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shipments',
      },
      { status: 500 }
    )
  }
}
