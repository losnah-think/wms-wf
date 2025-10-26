import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 창고 데이터 조회
    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          zones: {
            include: {
              locations: true,
            },
          },
          products: true,
        },
      }),
      prisma.warehouse.count(),
    ])

    // 응답 데이터 포맷팅
    const formattedData = warehouses.map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address,
      isActive: warehouse.isActive,
      zones: warehouse.zones.map(z => ({
        id: z.id,
        name: z.name,
        code: z.code,
      })),
      totalProducts: warehouse.products.length,
      createdAt: warehouse.createdAt,
    }))

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
    console.error('Error fetching warehouses:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch warehouses',
      },
      { status: 500 }
    )
  }
}
