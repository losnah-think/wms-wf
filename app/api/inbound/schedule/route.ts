import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const view = searchParams.get('view') || 'calendar' // calendar or list

    const skip = (page - 1) * limit

    // 필터 조건
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (startDate && endDate) {
      where.expectedDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // 캘린더 뷰: 모든 데이터, 리스트 뷰: 페이지네이션
    const shouldPaginate = view === 'list'

    const [schedules, total] = await Promise.all([
      prisma.inboundSchedule.findMany({
        where,
        include: {
          request: {
            include: {
              supplier: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          supplier: true,
        },
        orderBy: {
          expectedDate: 'asc',
        },
        ...(shouldPaginate && { skip, take: limit }),
      }),
      prisma.inboundSchedule.count({ where }),
    ])

    // 응답 데이터 포맷팅
    const formattedData = schedules.map((schedule) => ({
      id: schedule.id,
      scheduleNumber: schedule.scheduleNumber,
      requestNumber: schedule.request.requestNumber,
      supplierName: schedule.supplier.name,
      supplierCode: schedule.supplier.code,
      status: schedule.status,
      expectedDate: schedule.expectedDate,
      estimatedArrival: schedule.estimatedArrival,
      carrier: schedule.carrier,
      trackingNumber: schedule.trackingNumber,
      totalQuantity: schedule.totalQuantity,
      receivedQuantity: schedule.receivedQuantity,
      items: schedule.request.items.map((item) => ({
        productCode: item.product.code,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: shouldPaginate
        ? {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          }
        : undefined,
    })
  } catch (error) {
    console.error('Error fetching inbound schedules:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inbound schedules',
      },
      { status: 500 }
    )
  }
}
