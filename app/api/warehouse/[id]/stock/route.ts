import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// STK-006: 창고별 재고 현황
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const zoneId = searchParams.get('zoneId') || undefined

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        zones: {
          where: zoneId ? { id: zoneId } : undefined,
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!warehouse) {
      return NextResponse.json(
        {
          success: false,
          error: 'Warehouse not found',
        },
        { status: 404 }
      )
    }

    const totalProducts = warehouse.products.length
    const totalQuantity = warehouse.products.reduce(
      (sum, wp) => sum + wp.quantity,
      0
    )

    // 창고 용량 정보 (임의값, 실제로는 warehouse 모델에 capacity 필드 추가 필요)
    const maxCapacity = 100000
    const occupancyRate = ((totalQuantity / maxCapacity) * 100).toFixed(2)

    const zoneList = warehouse.zones.map((zone) => ({
      zoneId: zone.id,
      zoneName: zone.name,
      zoneCode: zone.code,
      // 구역별 상품 수는 Location 모델과 연계 필요
      productCount: 0,
      quantity: 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        warehouseCode: warehouse.code,
        zones: zoneList,
        totalProducts,
        totalQuantity,
        maxCapacity,
        occupancyRate: parseFloat(occupancyRate),
        products: warehouse.products.map((wp) => ({
          productId: wp.product.id,
          productCode: wp.product.code,
          productName: wp.product.name,
          quantity: wp.quantity,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching warehouse stock:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch warehouse stock',
      },
      { status: 500 }
    )
  }
}
