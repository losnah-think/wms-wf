/**
 * WMS 에러 처리 유틸리티
 * 
 * 에러 타입, 상황별 처리 방법을 정의합니다
 */

export enum WMSErrorCode {
  // 재고 관련
  INVENTORY_NOT_FOUND = 'WMS-1001',
  INSUFFICIENT_STOCK = 'WMS-1002',
  INVALID_SKU_FORMAT = 'WMS-1003',
  STOCK_LOCKED = 'WMS-1004',
  EXPIRY_EXCEEDED = 'WMS-1005',

  // 주문 관련
  ORDER_NOT_FOUND = 'WMS-2001',
  ORDER_LOCKED = 'WMS-2002',
  ORDER_ALREADY_SHIPPED = 'WMS-2003',
  PARTIAL_SHIPMENT = 'WMS-2004',
  ORDER_CANCELLED = 'WMS-2005',

  // 배송 관련
  CARRIER_UNAVAILABLE = 'WMS-3001',
  ADDRESS_INVALID = 'WMS-3002',
  WEIGHT_EXCEEDED = 'WMS-3003',
  SHIPPING_FAILED = 'WMS-3004',

  // 권한/인증 관련
  UNAUTHORIZED = 'WMS-4001',
  INSUFFICIENT_PERMISSION = 'WMS-4002',
  SESSION_EXPIRED = 'WMS-4003',
  IP_BLOCKED = 'WMS-4004',

  // 데이터 관련
  DUPLICATE_ENTRY = 'WMS-5001',
  REFERENCE_INTEGRITY_ERROR = 'WMS-5002',
  DATA_CORRUPTED = 'WMS-5003',
  DATABASE_ERROR = 'WMS-5004',

  // 시스템 관련
  SERVICE_UNAVAILABLE = 'WMS-6001',
  MAINTENANCE_MODE = 'WMS-6002',
  RATE_LIMIT_EXCEEDED = 'WMS-6003',
  TIMEOUT = 'WMS-6004',
}

export interface WMSError {
  code: WMSErrorCode
  message: string
  statusCode: number
  details?: Record<string, any>
  timestamp: string
  errorId: string
}

/**
 * WMS 에러 객체 생성
 */
export function createWMSError(
  code: WMSErrorCode,
  message: string,
  statusCode: number = 400,
  details?: Record<string, any>
): WMSError {
  return {
    code,
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
    errorId: generateErrorId(code),
  }
}

/**
 * 에러 ID 생성 (code + timestamp)
 */
export function generateErrorId(code: WMSErrorCode): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  return `${code}-${timestamp}`
}

/**
 * HTTP 상태 코드에 따른 에러 맵핑
 */
export function getErrorCodeFromStatus(status: number): number {
  const statusMap: Record<number, number> = {
    400: 400,
    401: 401,
    403: 403,
    404: 404,
    408: 408,
    409: 409,
    410: 410,
    422: 422,
    429: 429,
    500: 500,
    502: 502,
    503: 503,
    504: 504,
  }
  return statusMap[status] || 500
}

/**
 * 에러 로깅
 */
export function logError(error: WMSError): void {
  console.error(
    `[${error.errorId}] ${error.code}: ${error.message}`,
    error.details
  )
  
  // 프로덕션 환경에서는 외부 로깅 서비스로 전송
  if (typeof window === 'undefined') {
    // 서버 사이드
    console.log('[SERVER] Error logged:', error)
  } else {
    // 클라이언트 사이드
    // 예: sendToErrorTrackingService(error)
  }
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getUserFriendlyMessage(code: WMSErrorCode): string {
  const messages: Record<WMSErrorCode, string> = {
    [WMSErrorCode.INVENTORY_NOT_FOUND]: '요청한 재고를 찾을 수 없습니다.',
    [WMSErrorCode.INSUFFICIENT_STOCK]: '재고가 부족합니다.',
    [WMSErrorCode.INVALID_SKU_FORMAT]: '유효하지 않은 상품 코드 형식입니다.',
    [WMSErrorCode.STOCK_LOCKED]: '현재 처리 중인 재고입니다.',
    [WMSErrorCode.EXPIRY_EXCEEDED]: '유통기한이 초과된 상품입니다.',

    [WMSErrorCode.ORDER_NOT_FOUND]: '요청한 주문을 찾을 수 없습니다.',
    [WMSErrorCode.ORDER_LOCKED]: '다른 사용자가 현재 주문을 처리 중입니다.',
    [WMSErrorCode.ORDER_ALREADY_SHIPPED]: '이미 배송된 주문입니다.',
    [WMSErrorCode.PARTIAL_SHIPMENT]: '부분 배송이 필요합니다.',
    [WMSErrorCode.ORDER_CANCELLED]: '취소된 주문입니다.',

    [WMSErrorCode.CARRIER_UNAVAILABLE]: '배송업체 서비스를 이용할 수 없습니다.',
    [WMSErrorCode.ADDRESS_INVALID]: '유효하지 않은 배송 주소입니다.',
    [WMSErrorCode.WEIGHT_EXCEEDED]: '상품의 무게가 제한을 초과했습니다.',
    [WMSErrorCode.SHIPPING_FAILED]: '배송 요청에 실패했습니다.',

    [WMSErrorCode.UNAUTHORIZED]: '로그인이 필요합니다.',
    [WMSErrorCode.INSUFFICIENT_PERMISSION]: '이 작업을 수행할 권한이 없습니다.',
    [WMSErrorCode.SESSION_EXPIRED]: '세션이 만료되었습니다. 다시 로그인해주세요.',
    [WMSErrorCode.IP_BLOCKED]: '차단된 IP 주소입니다.',

    [WMSErrorCode.DUPLICATE_ENTRY]: '이미 존재하는 데이터입니다.',
    [WMSErrorCode.REFERENCE_INTEGRITY_ERROR]: '참조 관계 오류가 발생했습니다.',
    [WMSErrorCode.DATA_CORRUPTED]: '손상된 데이터입니다.',
    [WMSErrorCode.DATABASE_ERROR]: '데이터베이스 연결에 실패했습니다.',

    [WMSErrorCode.SERVICE_UNAVAILABLE]: '서비스가 일시적으로 사용 불가능합니다.',
    [WMSErrorCode.MAINTENANCE_MODE]: '현재 시스템 점검 중입니다.',
    [WMSErrorCode.RATE_LIMIT_EXCEEDED]: '너무 많은 요청이 발생했습니다.',
    [WMSErrorCode.TIMEOUT]: '요청 처리 시간이 초과되었습니다.',
  }

  return messages[code] || '알 수 없는 오류가 발생했습니다.'
}

/**
 * 재시도 가능 여부 판단
 */
export function isRetryable(code: WMSErrorCode): boolean {
  const retryableErrors = [
    WMSErrorCode.TIMEOUT,
    WMSErrorCode.SERVICE_UNAVAILABLE,
    WMSErrorCode.DATABASE_ERROR,
    WMSErrorCode.CARRIER_UNAVAILABLE,
    WMSErrorCode.SHIPPING_FAILED,
  ]
  return retryableErrors.includes(code)
}

/**
 * 에러 심각도 레벨
 */
export enum ErrorSeverity {
  LOW = 'low',           // 사용자가 처리 가능
  MEDIUM = 'medium',     // 관리자 개입 필요
  HIGH = 'high',         // 즉시 조치 필요
  CRITICAL = 'critical', // 시스템 중단
}

export function getErrorSeverity(code: WMSErrorCode): ErrorSeverity {
  const severityMap: Record<WMSErrorCode, ErrorSeverity> = {
    [WMSErrorCode.INVENTORY_NOT_FOUND]: ErrorSeverity.LOW,
    [WMSErrorCode.INSUFFICIENT_STOCK]: ErrorSeverity.LOW,
    [WMSErrorCode.INVALID_SKU_FORMAT]: ErrorSeverity.LOW,
    [WMSErrorCode.STOCK_LOCKED]: ErrorSeverity.LOW,
    [WMSErrorCode.EXPIRY_EXCEEDED]: ErrorSeverity.MEDIUM,

    [WMSErrorCode.ORDER_NOT_FOUND]: ErrorSeverity.LOW,
    [WMSErrorCode.ORDER_LOCKED]: ErrorSeverity.LOW,
    [WMSErrorCode.ORDER_ALREADY_SHIPPED]: ErrorSeverity.LOW,
    [WMSErrorCode.PARTIAL_SHIPMENT]: ErrorSeverity.MEDIUM,
    [WMSErrorCode.ORDER_CANCELLED]: ErrorSeverity.LOW,

    [WMSErrorCode.CARRIER_UNAVAILABLE]: ErrorSeverity.HIGH,
    [WMSErrorCode.ADDRESS_INVALID]: ErrorSeverity.MEDIUM,
    [WMSErrorCode.WEIGHT_EXCEEDED]: ErrorSeverity.MEDIUM,
    [WMSErrorCode.SHIPPING_FAILED]: ErrorSeverity.HIGH,

    [WMSErrorCode.UNAUTHORIZED]: ErrorSeverity.MEDIUM,
    [WMSErrorCode.INSUFFICIENT_PERMISSION]: ErrorSeverity.MEDIUM,
    [WMSErrorCode.SESSION_EXPIRED]: ErrorSeverity.LOW,
    [WMSErrorCode.IP_BLOCKED]: ErrorSeverity.HIGH,

    [WMSErrorCode.DUPLICATE_ENTRY]: ErrorSeverity.MEDIUM,
    [WMSErrorCode.REFERENCE_INTEGRITY_ERROR]: ErrorSeverity.HIGH,
    [WMSErrorCode.DATA_CORRUPTED]: ErrorSeverity.CRITICAL,
    [WMSErrorCode.DATABASE_ERROR]: ErrorSeverity.CRITICAL,

    [WMSErrorCode.SERVICE_UNAVAILABLE]: ErrorSeverity.HIGH,
    [WMSErrorCode.MAINTENANCE_MODE]: ErrorSeverity.MEDIUM,
    [WMSErrorCode.RATE_LIMIT_EXCEEDED]: ErrorSeverity.LOW,
    [WMSErrorCode.TIMEOUT]: ErrorSeverity.HIGH,
  }

  return severityMap[code] || ErrorSeverity.MEDIUM
}
