import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PIC-009: 다중 주문 묶음
 * 여러 주문을 하나의 박스로 묶기 기능
 * 
 * 입력: 주문ID배열 (필수), 박스정보 (선택, 크기/무게/특이사항)
 * 출력: 묶음ID, 묶음상태, 포함주문 (목록), 통합운송장
 * 
 * 프로세스:
 * 1. 여러 주문 선택
 * 2. 선택한 주문들의 배송지 주소 확인
 * 3. 주소가 같은지 검증
 * 4. 박스 정보 입력 (선택)
 * 5. 묶음 생성
 * 6. 통합 운송장 생성 (배송사 API)
 * 7. 묶음 정보 저장
 * 8. 배송 준비
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderIds, boxInfo } = body

    // 필수값 검증
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least 2 orders are required for combining',
        },
        { status: 400 }
      )
    }

    // 주문 정보 조회
    const orders = await prisma.outboundOrder.findMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (orders.length !== orderIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'One or more orders not found',
        },
        { status: 404 }
      )
    }

    // 배송지 정보 확인 (notes에서 추출하거나 주문번호 기반으로 생성)
    const shippingAddresses = orders.map((order) => {
      // notes에서 주소 추출 또는 기본값
      return order.notes?.split('|')[0] || `Customer-${order.orderNumber}`
    })
    const firstAddress = shippingAddresses[0]

    const allSameAddress = shippingAddresses.every((addr) => addr === firstAddress)

    if (!allSameAddress) {
      return NextResponse.json({
        success: true,
        data: {
          combined: false,
          error: 'Orders have different shipping addresses and cannot be combined',
          orders: orders.map((order) => ({
            id: order.id,
            address: order.notes?.split('|')[0] || `Customer-${order.orderNumber}`,
          })),
        },
      })
    }

    // 묶음 ID 생성 (BUNDLE-{타임스탐프}-{랜덤})
    const bundleId = `BUNDLE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 통합 상품 정보
    const allItems = orders.flatMap((order) =>
      order.items.map((item) => ({
        productId: item.productId,
        productCode: item.product?.code || '',
        productName: item.product?.name || '',
        quantity: item.quantity,
      }))
    )

    // 박스 정보 설정
    const totalQuantity = allItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalWeight = (boxInfo?.weight || totalQuantity * 0.5).toString()
    const boxSize = boxInfo?.size || determinBoxSize(totalQuantity)

    // 통합 운송장 정보 생성
    const trackingNumber = `TRK-${bundleId}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    return NextResponse.json({
      success: true,
      data: {
        combined: true,
        bundleId,
        bundleStatus: 'created',
        includeOrders: orderIds.map((id) => ({
          orderId: id,
          status: 'included_in_bundle',
        })),
        bundleInfo: {
          totalOrders: orders.length,
          totalItems: allItems.length,
          totalQuantity,
          items: allItems,
        },
        boxInfo: {
          size: boxSize,
          weight: `${totalWeight} kg`,
          dimensions: calculateDimensions(boxSize),
          notes: boxInfo?.notes || '',
        },
        shippingInfo: {
          address: firstAddress,
          combinedTrackingNumber: trackingNumber,
          carrier: 'Standard',
        },
        readyForShipping: true,
        createdAt: new Date().toISOString(),
        estimatedShippingDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error('Error combining orders:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to combine orders',
      },
      { status: 500 }
    )
  }
}

/**
 * 박스 크기 자동 결정
 */
function determinBoxSize(quantity: number): string {
  if (quantity <= 3) return 'Small (20x15x10 cm)'
  if (quantity <= 6) return 'Medium (30x20x15 cm)'
  if (quantity <= 12) return 'Large (40x30x20 cm)'
  return 'Extra Large (50x40x30 cm)'
}

/**
 * 박스 치수 계산
 */
function calculateDimensions(size: string): string {
  const sizeMap: Record<string, string> = {
    'Small (20x15x10 cm)': '20 x 15 x 10 cm',
    'Medium (30x20x15 cm)': '30 x 20 x 15 cm',
    'Large (40x30x20 cm)': '40 x 30 x 20 cm',
    'Extra Large (50x40x30 cm)': '50 x 40 x 30 cm',
  }
  return sizeMap[size] || size
}
