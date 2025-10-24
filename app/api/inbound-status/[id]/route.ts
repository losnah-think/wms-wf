import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/inbound-status/[id] - 특정 입고 요청 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const inboundRequest = await prisma.inboundRequest.findFirst({
      where: { requestNumber: id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!inboundRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inbound request not found',
        },
        { status: 404 }
      )
    }

    const statusMap: Record<string, string> = {
      draft: '승인대기',
      submitted: '승인대기',
      approved: '승인완료',
      rejected: '반려됨',
      completed: '입고완료',
    }

    const responseData = {
      id: inboundRequest.requestNumber,
      status: statusMap[inboundRequest.status] || '승인대기',
      updatedAt: inboundRequest.updatedAt.toISOString(),
      reason: inboundRequest.notes || '',
      requestDetails: {
        id: inboundRequest.requestNumber,
        poNumber: inboundRequest.requestNumber,
        supplierName: inboundRequest.supplier.name,
        items: inboundRequest.items.map((item) => ({
          id: item.id,
          skuCode: item.product.sku,
          productName: item.product.name,
          quantity: item.quantity,
          unit: 'EA',
        })),
        requestDate: inboundRequest.requestDate.toISOString().split('T')[0],
        expectedDate: inboundRequest.expectedDate.toISOString().split('T')[0],
        approvalStatus: statusMap[inboundRequest.status] || '승인대기',
        memo: inboundRequest.notes || '',
      },
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('Error fetching inbound status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inbound status',
      },
      { status: 500 }
    )
  }
}

// PATCH /api/inbound-status/[id] - 입고 요청 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, reason } = body

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // 상태 매핑 (한글 → 영문)
    const statusMap: Record<string, string> = {
      승인대기: 'submitted',
      승인완료: 'approved',
      반려됨: 'rejected',
      입고완료: 'completed',
    }

    const dbStatus = statusMap[status]
    if (!dbStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
        },
        { status: 400 }
      )
    }

    // InboundRequest 찾기
    const inboundRequest = await prisma.inboundRequest.findFirst({
      where: { requestNumber: id },
    })

    if (!inboundRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inbound request not found',
        },
        { status: 404 }
      )
    }

    // 상태 업데이트
    const updated = await prisma.inboundRequest.update({
      where: { id: inboundRequest.id },
      data: {
        status: dbStatus,
        notes: reason || inboundRequest.notes,
      },
    })

    // InboundApproval도 업데이트 (있는 경우)
    const approval = await prisma.inboundApproval.findFirst({
      where: { requestId: inboundRequest.id },
    })

    if (approval) {
      await prisma.inboundApproval.update({
        where: { id: approval.id },
        data: {
          status: dbStatus === 'approved' ? 'approved' : dbStatus === 'rejected' ? 'rejected' : 'pending',
          approverName: '시스템',
          approvalDate: dbStatus === 'approved' ? new Date() : null,
          rejectionReason: dbStatus === 'rejected' ? reason : null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        id: updated.requestNumber,
        status: status,
        updatedAt: updated.updatedAt.toISOString(),
        reason: reason || '',
      },
    })
  } catch (error) {
    console.error('Error updating inbound status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update status',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/inbound-status/[id] - 입고 요청 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const inboundRequest = await prisma.inboundRequest.findFirst({
      where: { requestNumber: id },
    })

    if (!inboundRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inbound request not found',
        },
        { status: 404 }
      )
    }

    // InboundRequest 삭제 (cascade로 items, schedules 자동 삭제)
    await prisma.inboundRequest.delete({
      where: { id: inboundRequest.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Inbound request deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting inbound request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete inbound request',
      },
      { status: 500 }
    )
  }
}
