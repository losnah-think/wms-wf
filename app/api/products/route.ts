import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// STK-001: 상품 정보 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const searchType = searchParams.get('searchType') || 'all' // code, name, sku, all
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // 검색 조건 구성
    const where: any = {
      isActive: true,
    }

    if (search) {
      switch (searchType) {
        case 'code':
          where.code = { contains: search, mode: 'insensitive' }
          break
        case 'name':
          where.name = { contains: search, mode: 'insensitive' }
          break
        case 'sku':
          where.sku = { contains: search, mode: 'insensitive' }
          break
        default:
          where.OR = [
            { code: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ]
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          warehouseProducts: {
            include: {
              warehouse: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const formattedData = products.map((product) => {
      const totalStock = product.warehouseProducts.reduce(
        (sum, wp) => sum + wp.quantity,
        0
      )
      const availableStock = totalStock // 실제로는 예약재고 차감 필요

      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: '일반', // 카테고리 모델 추가 시 변경
        totalStock,
        availableStock,
        price: product.price,
        imageUrl: null, // 이미지 모델 추가 시 변경
        warehouses: product.warehouseProducts.map((wp) => ({
          warehouseId: wp.warehouseId,
          warehouseName: wp.warehouse.name,
          quantity: wp.quantity,
        })),
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
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    )
  }
}
