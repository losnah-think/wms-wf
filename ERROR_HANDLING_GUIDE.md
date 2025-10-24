# WMS 에러 처리 시스템 사용 가이드

## 📋 개요

WMS 시스템의 포괄적인 에러 처리 및 에러 페이지 구현입니다. HTTP 상태 코드, WMS 특화 에러, 3개 언어 지원 (한국어, 영어, 베트남어)

## 🎯 에러 페이지 구조

### 1. 자동으로 처리되는 에러 페이지

#### 404 - Page Not Found (페이지를 찾을 수 없음)
- **파일**: `/app/[locale]/not-found.tsx`
- **상황**:
  - 존재하지 않는 경로 접근
  - 삭제된 리소스 조회
  - 만료된 주문/배송 정보 조회
- **표시 내용**: 404 에러, 원인 설명, 홈/대시보드 이동 버튼
- **아이콘**: 🔍

#### 500 - Server Error (서버 오류)
- **파일**: `/app/[locale]/error.tsx`
- **상황**:
  - 예상치 못한 서버 에러
  - 데이터베이스 쿼리 실패
  - 서버 프로세스 에러
- **표시 내용**: 500 에러, 에러 메시지, 다시 시도 버튼, 에러 ID
- **아이콘**: 💥

### 2. 특정 HTTP 상태 코드 매핑

| 상태 | 아이콘 | 상황 | 권장 액션 |
|------|--------|------|--------|
| **400** | ❌ | 잘못된 요청 (형식 오류) | 입력값 확인 후 재시도 |
| **401** | 🔐 | 인증 필요 (로그인 필요) | 로그인 페이지로 이동 |
| **403** | 🚫 | 접근 거부 (권한 없음) | 관리자 문의 |
| **404** | 🔍 | 페이지/리소스 없음 | 홈으로 돌아가기 |
| **408** | ⏱️ | 요청 시간 초과 | 다시 시도 |
| **409** | ⚠️ | 충돌 발생 | 나중에 재시도 |
| **410** | 🗑️ | 리소스 삭제됨 | 다른 리소스 확인 |
| **422** | 📋 | 데이터 검증 실패 | 필드 확인 후 수정 |
| **429** | ⏳ | 요청 제한 초과 | 잠시 후 재시도 |
| **500** | 💥 | 서버 내부 오류 | 다시 시도/지원팀 문의 |
| **502** | 🌉 | 게이트웨이 오류 | 잠시 후 재시도 |
| **503** | 🔧 | 서비스 점검 중 | 나중에 다시 방문 |
| **504** | ⏲️ | 게이트웨이 시간 초과 | 다시 시도 |

## 🛠 WMS 특화 에러 코드

### 재고 관리 에러 (WMS-1xxx)
```typescript
WMS-1001: INVENTORY_NOT_FOUND      // "요청한 재고를 찾을 수 없습니다"
WMS-1002: INSUFFICIENT_STOCK       // "재고가 부족합니다"
WMS-1003: INVALID_SKU_FORMAT       // "유효하지 않은 상품 코드 형식입니다"
WMS-1004: STOCK_LOCKED             // "현재 처리 중인 재고입니다"
WMS-1005: EXPIRY_EXCEEDED          // "유통기한이 초과된 상품입니다"
```

**상황별 처리:**
- 재고 부족 → 추가 입고 요청 제안
- SKU 형식 오류 → 올바른 형식 안내
- 유통기한 초과 → 반품 프로세스 안내

### 주문 관리 에러 (WMS-2xxx)
```typescript
WMS-2001: ORDER_NOT_FOUND          // "요청한 주문을 찾을 수 없습니다"
WMS-2002: ORDER_LOCKED             // "다른 사용자가 현재 주문을 처리 중입니다"
WMS-2003: ORDER_ALREADY_SHIPPED    // "이미 배송된 주문입니다"
WMS-2004: PARTIAL_SHIPMENT         // "부분 배송이 필요합니다"
WMS-2005: ORDER_CANCELLED          // "취소된 주문입니다"
```

**상황별 처리:**
- 주문 잠금 → 대기 후 재시도 제안
- 이미 배송 → 배송 추적 링크 제공
- 부분 배송 → 분할 배송 옵션 제시

### 배송 관리 에러 (WMS-3xxx)
```typescript
WMS-3001: CARRIER_UNAVAILABLE      // "배송업체 서비스를 이용할 수 없습니다"
WMS-3002: ADDRESS_INVALID          // "유효하지 않은 배송 주소입니다"
WMS-3003: WEIGHT_EXCEEDED          // "상품의 무게가 제한을 초과했습니다"
WMS-3004: SHIPPING_FAILED          // "배송 요청에 실패했습니다"
```

**상황별 처리:**
- 배송업체 불가 → 대체 배송업체 옵션
- 주소 검증 실패 → 주소 재입력
- 무게 초과 → 분할 배송 제안

### 권한/인증 에러 (WMS-4xxx)
```typescript
WMS-4001: UNAUTHORIZED             // "로그인이 필요합니다"
WMS-4002: INSUFFICIENT_PERMISSION  // "이 작업을 수행할 권한이 없습니다"
WMS-4003: SESSION_EXPIRED          // "세션이 만료되었습니다"
WMS-4004: IP_BLOCKED               // "차단된 IP 주소입니다"
```

**상황별 처리:**
- 세션 만료 → 자동 로그인 페이지 이동
- 권한 부족 → 관리자 권한 요청 안내
- IP 차단 → 보안팀 문의

### 데이터 에러 (WMS-5xxx)
```typescript
WMS-5001: DUPLICATE_ENTRY          // "이미 존재하는 데이터입니다"
WMS-5002: REFERENCE_INTEGRITY_ERROR // "참조 관계 오류가 발생했습니다"
WMS-5003: DATA_CORRUPTED           // "손상된 데이터입니다"
WMS-5004: DATABASE_ERROR           // "데이터베이스 연결에 실패했습니다"
```

**상황별 처리:**
- 중복 데이터 → 기존 데이터 수정 옵션
- 데이터 손상 → 관리자 복구 요청
- DB 연결 실패 → 재시도 또는 나중에 방문 제안

### 시스템 에러 (WMS-6xxx)
```typescript
WMS-6001: SERVICE_UNAVAILABLE      // "서비스가 일시적으로 사용 불가능합니다"
WMS-6002: MAINTENANCE_MODE         // "현재 시스템 점검 중입니다"
WMS-6003: RATE_LIMIT_EXCEEDED      // "너무 많은 요청이 발생했습니다"
WMS-6004: TIMEOUT                  // "요청 처리 시간이 초과되었습니다"
```

**상황별 처리:**
- 점검 중 → 예상 종료 시간 표시
- 요청 제한 → 잠시 후 재시도 제안
- 타임아웃 → 연결 상태 확인 후 재시도

## 💻 코드 사용 예시

### 1. 에러 생성 및 던지기

```typescript
// lib/error-handler.ts 활용
import { createWMSError, WMSErrorCode, logError } from '@/lib/error-handler'

// 재고 부족 에러 생성
const error = createWMSError(
  WMSErrorCode.INSUFFICIENT_STOCK,
  'Not enough inventory',
  422,
  { available: 5, required: 10 }
)

// 에러 로깅
logError(error)

// 에러 던지기
throw new Error(JSON.stringify(error))
```

### 2. 컴포넌트에서 에러 처리

```typescript
'use client'

import { ErrorPage } from '@/components/ErrorPages'
import { useState } from 'react'

export default function InventoryPage() {
  const [error, setError] = useState(null)

  const handleRetry = async () => {
    try {
      // 재시도 로직
    } catch (err) {
      setError(err)
    }
  }

  if (error) {
    return (
      <ErrorPage
        code={error.statusCode}
        errorId={error.errorId}
        details={error.message}
        showRetry={true}
        onRetry={handleRetry}
      />
    )
  }

  return <div>Inventory Content</div>
}
```

### 3. API 라우트에서 에러 처리

```typescript
// app/api/inventory/[id]/route.ts
import { createWMSError, WMSErrorCode } from '@/lib/error-handler'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // 재고 조회
    const inventory = await getInventory(params.id)

    if (!inventory) {
      const error = createWMSError(
        WMSErrorCode.INVENTORY_NOT_FOUND,
        'Inventory not found',
        404
      )
      return Response.json(error, { status: 404 })
    }

    return Response.json(inventory)
  } catch (err) {
    const error = createWMSError(
      WMSErrorCode.DATABASE_ERROR,
      'Database connection failed',
      500
    )
    return Response.json(error, { status: 500 })
  }
}
```

### 4. 재시도 가능 여부 확인

```typescript
import { isRetryable, WMSErrorCode } from '@/lib/error-handler'

// 재시도 가능한 에러
if (isRetryable(WMS-6004)) { // TIMEOUT
  // 자동 재시도 로직
}

// 재시도 불가능한 에러
if (!isRetryable(WMS-1003)) { // INVALID_SKU_FORMAT
  // 수동 수정 필요
}
```

### 5. 에러 심각도 확인

```typescript
import { getErrorSeverity, ErrorSeverity, WMSErrorCode } from '@/lib/error-handler'

const severity = getErrorSeverity(WMSErrorCode.DATA_CORRUPTED)

if (severity === ErrorSeverity.CRITICAL) {
  // 긴급 알림 전송
  alertAdministrators(error)
  // 관리자 페이지로 이동
}
```

## 🌐 다국어 지원

모든 에러 메시지는 다음 언어로 자동 번역됩니다:
- 🇰🇷 한국어 (ko.json)
- 🇺🇸 영어 (en.json)
- 🇻🇳 베트남어 (vi.json)

```typescript
// 자동으로 사용자의 언어 설정에 맞춰 표시됨
const errorMessage = t('error.404.title')  // "Page Not Found" or "페이지를 찾을 수 없습니다"
```

## 📊 에러 모니터링

### 에러 ID로 추적
- 모든 에러는 고유 ID 생성: `WMS-1001-A1B2C3D4`
- 사용자가 에러 ID를 지원팀에 제공하면 신속한 처리 가능

### 에러 로깅
```typescript
logError(error)
// 콘솔에 출력 + 프로덕션에서는 외부 서비스로 전송
```

## 🎨 에러 페이지 커스터마이징

### 에러 페이지 스타일
- 파일: `/components/ErrorPages.module.css`
- 반응형 디자인 지원 (모바일, 태블릿, 데스크탑)
- 다크모드 지원 가능

### 컬러 스킴
- 주 컬러: 퍼플 (#667eea)
- 보조 컬러: 라이트 그레이 (#ecf0f1)
- 에러 컬러: 레드 (#e74c3c)

## 📝 체크리스트

에러 처리 구현 시 확인 사항:

- [ ] 에러 타입에 맞는 WMS 에러 코드 선택
- [ ] 사용자 친화적 메시지 작성
- [ ] 에러 심각도 레벨 설정
- [ ] 재시도 가능 여부 지정
- [ ] 에러 로깅 구현
- [ ] 다국어 번역 추가
- [ ] 테스트: 400, 401, 403, 404, 500, 503 등

## 📞 지원

에러 처리 관련 문의:
- support@example.com
- admin@example.com
