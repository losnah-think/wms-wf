import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// STK-002: 재고 수량 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const warehouseId = searchParams.get('warehouseId') || undefined

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        warehouseProducts: {
          where: warehouseId ? { warehouseId } : undefined,
          include: {
            warehouse: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      )
    }

    const totalStock = product.warehouseProducts.reduce(
      (sum, wp) => sum + wp.quantity,
      0
    )

    // 실제로는 별도 테이블에서 조회해야 함 (예약재고, 불량재고)
    const normalStock = totalStock
    const reservedStock = 0
    const defectiveStock = 0

    const warehouseDetails = product.warehouseProducts.map((wp) => ({
      warehouseId: wp.warehouseId,
      warehouseName: wp.warehouse.name,
      normalStock: wp.quantity,
      reservedStock: 0,
      defectiveStock: 0,
      totalStock: wp.quantity,
      lastUpdated: wp.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        normalStock,
        reservedStock,
        defectiveStock,
        totalStock,
        warehouseDetails,
        lastUpdated: product.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching stock:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stock information',
      },
      { status: 500 }
    )
  }
}
