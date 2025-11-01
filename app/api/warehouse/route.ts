import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    // Mock 데이터 반환 (DATABASE_URL이 없을 때)
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
      const mockWarehouses = [
        {
          id: '1',
          name: '서울 센터',
          code: 'WH-001',
          address: '서울시 강남구',
          isActive: true,
          createdAt: new Date('2025-01-01'),
          zones: [
            {
              id: 'Z1',
              name: 'Zone A',
              code: 'ZA',
              isActive: true,
              locations: [
                { id: 'L1', name: 'A-1-1', code: 'A1', capacity: 100, isActive: true },
                { id: 'L2', name: 'A-1-2', code: 'A2', capacity: 100, isActive: true },
              ],
            },
          ],
          products: [],
        },
        {
          id: '2',
          name: '인천 센터',
          code: 'WH-002',
          address: '인천시 연수구',
          isActive: true,
          createdAt: new Date('2025-01-02'),
          zones: [],
          products: [],
        },
      ]

      return NextResponse.json({
        success: true,
        data: mockWarehouses,
        pagination: {
          page,
          limit,
          total: 2,
          totalPages: 1,
        },
        note: 'Mock data (DATABASE_URL not configured)',
      })
    }

    // 실제 DB 조회 (DATABASE_URL이 설정된 경우)
    const { prisma } = await import('@/lib/prisma')
    const skip = (page - 1) * limit

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        include: {
          zones: {
            include: {
              locations: true,
            },
          },
          products: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      createdAt: warehouse.createdAt,
      zones: warehouse.zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        code: zone.code,
        isActive: zone.isActive,
        locations: zone.locations.map((location) => ({
          id: location.id,
          name: location.name,
          code: location.code,
          capacity: location.capacity,
          isActive: location.isActive,
        })),
      })),
      products: warehouse.products.map((wp) => ({
        id: wp.id,
        productId: wp.productId,
        quantity: wp.quantity,
        safeStock: wp.safeStock,
        isActive: wp.isActive,
        product: {
          id: wp.product.id,
          code: wp.product.code,
          name: wp.product.name,
          sku: wp.product.sku,
          barcode: wp.product.barcode,
          price: wp.product.price,
          weight: wp.product.weight,
        },
      })),
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

    // 에러 발생 시 page, limit 재정의
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    // DATABASE_URL 없을 때 mock 데이터 반환
    if (!process.env.DATABASE_URL) {
      const mockWarehouses = [
        {
          id: '1',
          name: '서울 센터',
          code: 'WH-001',
          address: '서울시 강남구',
          isActive: true,
          createdAt: new Date('2025-01-01'),
        },
      ]
      return NextResponse.json({
        success: true,
        data: mockWarehouses,
        pagination: { page, limit, total: 1, totalPages: 1 },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch warehouses',
      },
      { status: 500 }
    )
  }
}
