import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined

    const skip = (page - 1) * limit

    // 필터 조건
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.approvalNumber = { contains: search, mode: 'insensitive' }
    }

    // 데이터 조회
    const [approvals, total] = await Promise.all([
      prisma.inboundApproval.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.inboundApproval.count({ where }),
    ])

    // requestId로 request 정보 조회
    const requestIds = approvals.map((a) => a.requestId)
    const requests = await prisma.inboundRequest.findMany({
      where: {
        id: { in: requestIds },
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

    const requestMap = new Map(requests.map((r) => [r.id, r]))

    // 응답 데이터 포맷팅
    const formattedData = approvals.map((approval) => {
      const request = requestMap.get(approval.requestId)
      
      return {
        id: approval.id,
        approvalNumber: approval.approvalNumber,
        requestNumber: request?.requestNumber || '',
        supplierName: request?.supplier.name || '',
        supplierCode: request?.supplier.code || '',
        requestDate: request?.requestDate || new Date(),
        expectedDate: request?.expectedDate || new Date(),
        status: approval.status,
        approverName: approval.approverName,
        approvalDate: approval.approvalDate,
        rejectionReason: approval.rejectionReason,
        allocatedZone: approval.allocatedZone,
        allocatedLocation: approval.allocatedLocation,
        totalQuantity: request?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
        items: request?.items.map((item) => ({
          productCode: item.product.code,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })) || [],
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
    console.error('Error fetching inbound approvals:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inbound approvals',
      },
      { status: 500 }
    )
  }
}
