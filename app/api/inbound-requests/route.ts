import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/inbound-requests - 모든 입고 요청 조회
export async function GET() {
  try {
    const requests = await prisma.inboundRequest.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        requestDate: 'desc',
      },
    })

    const formattedData = requests.map((request) => ({
      id: request.requestNumber,
      poNumber: request.requestNumber,
      supplierName: request.supplier.name,
      items: request.items.map((item) => ({
        id: item.id,
        skuCode: item.product.sku,
        productName: item.product.name,
        quantity: item.quantity,
        unit: 'EA',
      })),
      requestDate: request.requestDate.toISOString().split('T')[0],
      expectedDate: request.expectedDate.toISOString().split('T')[0],
      approvalStatus: request.status === 'approved' ? '승인완료' : 
                      request.status === 'rejected' ? '반려됨' : 
                      request.status === 'submitted' ? '승인대기' : '입고완료',
      memo: request.notes || '',
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length,
    })
  } catch (error) {
    console.error('Error fetching inbound requests:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inbound requests',
      },
      { status: 500 }
    )
  }
}

// POST /api/inbound-requests - 새 입고 요청 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { poNumber, supplierName, items, requestDate, expectedDate, memo } = body

    // 필수 필드 검증
    if (!poNumber || !supplierName || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // 공급업체 찾기 또는 생성
    let supplier = await prisma.supplier.findFirst({
      where: { name: supplierName },
    })

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: supplierName,
          code: `SUPP${Date.now()}`,
          email: `${supplierName.toLowerCase().replace(/\s/g, '')}@example.com`,
        },
      })
    }

    // 상품들 찾기 또는 생성
    const productPromises = items.map(async (item: any) => {
      let product = await prisma.product.findFirst({
        where: { sku: item.skuCode },
      })

      if (!product) {
        product = await prisma.product.create({
          data: {
            code: item.skuCode,
            name: item.productName,
            sku: item.skuCode,
            barcode: `BAR${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            price: 0,
          },
        })
      }

      return { product, quantity: item.quantity, unitPrice: 0 }
    })

    const productsWithQuantity = await Promise.all(productPromises)

    // InboundRequest 생성
    const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    
    const newRequest = await prisma.inboundRequest.create({
      data: {
        requestNumber: poNumber,
        supplierId: supplier.id,
        status: 'submitted',
        totalQuantity,
        totalAmount: 0,
        requestDate: requestDate ? new Date(requestDate) : new Date(),
        expectedDate: expectedDate ? new Date(expectedDate) : new Date(),
        notes: memo || null,
        items: {
          create: productsWithQuantity.map(({ product, quantity, unitPrice }) => ({
            productId: product.id,
            quantity,
            unitPrice,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    const responseData = {
      id: newRequest.requestNumber,
      poNumber: newRequest.requestNumber,
      supplierName: newRequest.supplier.name,
      items: newRequest.items.map((item) => ({
        id: item.id,
        skuCode: item.product.sku,
        productName: item.product.name,
        quantity: item.quantity,
        unit: 'EA',
      })),
      requestDate: newRequest.requestDate.toISOString().split('T')[0],
      expectedDate: newRequest.expectedDate.toISOString().split('T')[0],
      approvalStatus: '승인대기',
      memo: newRequest.notes || '',
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Inbound request created successfully',
        data: responseData,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating inbound request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create inbound request',
      },
      { status: 500 }
    )
  }
}
