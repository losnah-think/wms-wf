// OMS-WMS API Client for Frontend
// This file provides type-safe API calls for the inbound request system

export interface InboundItem {
  id: string
  skuCode: string
  productName: string
  quantity: number
  unit: string
}

export interface InboundRequest {
  id: string
  poNumber: string
  supplierName: string
  items: InboundItem[]
  requestDate: string
  expectedDate: string
  approvalStatus: '승인대기' | '승인완료' | '반려됨' | '입고완료'
  memo?: string
}

export interface InboundStatusResponse {
  id: string
  status: '승인대기' | '승인완료' | '반려됨' | '입고완료'
  updatedAt: string
  reason?: string
  requestDetails?: InboundRequest
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  count?: number
}

/**
 * 모든 입고 요청 조회
 */
export async function getAllInboundRequests(): Promise<ApiResponse<InboundRequest[]>> {
  try {
    const response = await fetch('/api/inbound-requests')
    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch inbound requests',
    }
  }
}

/**
 * 새로운 입고 요청 생성
 */
export async function createInboundRequest(
  data: Omit<InboundRequest, 'id' | 'approvalStatus'>
): Promise<ApiResponse<InboundRequest>> {
  try {
    const response = await fetch('/api/inbound-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create inbound request',
    }
  }
}

/**
 * 입고 요청 상태 조회
 */
export async function getInboundStatus(id: string): Promise<ApiResponse<InboundStatusResponse>> {
  try {
    const response = await fetch(`/api/inbound-status/${id}`)
    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch inbound status',
    }
  }
}

/**
 * 입고 요청 상태 업데이트
 */
export async function updateInboundStatus(
  id: string,
  status: '승인대기' | '승인완료' | '반려됨' | '입고완료',
  reason?: string
): Promise<ApiResponse<InboundStatusResponse>> {
  try {
    const response = await fetch(`/api/inbound-status/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, reason }),
    })
    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update inbound status',
    }
  }
}

/**
 * 입고 요청 삭제
 */
export async function deleteInboundRequest(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/inbound-status/${id}`, {
      method: 'DELETE',
    })
    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete inbound request',
    }
  }
}
