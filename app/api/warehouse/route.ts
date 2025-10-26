import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 창고 데이터 조회 (zones와 products 포함)
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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch warehouses',
      },
      { status: 500 }
    )
  }
}
