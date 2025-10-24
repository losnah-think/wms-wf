# WMS 시스템 에러 처리 가이드

## 에러 분류 및 상황

### 1. HTTP Status Code 기반 에러

#### 3xx (리다이렉션)
- **300 Multiple Choices** - 여러 창고/작업 선택 가능
- **301/302 Moved Permanently** - 경로 변경 (재배치된 재고)
- **303 See Other** - 작업 완료 후 다른 페이지로 이동
- **307/308 Temporary Redirect** - 임시 서버 이동

#### 4xx (클라이언트 에러)
- **400 Bad Request** - 잘못된 요청 (재고 코드 형식 오류)
- **401 Unauthorized** - 인증 실패 (로그인 필요)
- **403 Forbidden** - 권한 없음 (특정 창고 접근 불가)
- **404 Not Found** - 존재하지 않는 리소스
  - 제품 없음
  - 주문 없음
  - 창고 없음
- **408 Request Timeout** - 요청 시간 초과 (배송 조회 시간 초과)
- **409 Conflict** - 충돌 (중복 창고 이름, 이미 처리된 주문)
- **410 Gone** - 삭제된 리소스 (완료된 배송)
- **422 Unprocessable Entity** - 검증 실패 (수량 초과, 재고 부족)
- **429 Too Many Requests** - 요청 너무 많음 (대량 작업 제한)

#### 5xx (서버 에러)
- **500 Internal Server Error** - 일반적인 서버 에러
- **501 Not Implemented** - 구현되지 않은 기능
- **502 Bad Gateway** - DB 연결 실패
- **503 Service Unavailable** - 서비스 점검/유지보수
- **504 Gateway Timeout** - 서버 응답 시간 초과

## WMS 시스템별 특화 에러

### 재고 관리 시스템
- **In-Transit Inventory** - 운송 중인 재고 (임시 상태)
- **Quarantine Stock** - 검역 중인 상품 (접근 불가)
- **Expired Stock** - 유통기한 만료 상품

### 주문 처리 시스템
- **Order Lock** - 다른 사용자가 주문 처리 중
- **Partial Ship** - 부분 배송 상태
- **Split Inventory** - 재고 분할 필요

### 배송 관리 시스템
- **Carrier Unavailable** - 배송업체 이용 불가
- **Address Invalid** - 주소 검증 실패
- **Weight Exceeded** - 무게 제한 초과

### 권한/인증 시스템
- **Session Expired** - 세션 만료
- **Role Insufficient** - 권한 부족
- **IP Blocked** - 차단된 IP

### 데이터 관련
- **Duplicate Entry** - 중복 데이터
- **Reference Integrity** - 참조 무결성 위반
- **Data Corrupted** - 손상된 데이터

## 에러 페이지 설계 원칙

1. **사용자 친화적** - 기술적 용어 최소화
2. **명확한 원인** - 왜 에러가 발생했는지 설명
3. **행동 제시** - 다음 단계 제시
4. **시스템 상태** - 현재 시스템 상태 표시
5. **지원 정보** - 관리자 연락처 제공
6. **로깅** - 에러 ID로 추적

## 구현 전략

### 1. 기본 에러 페이지
- `/app/[locale]/error.tsx` - 앱 레벨 에러
- `/app/[locale]/not-found.tsx` - 404 에러
- `/app/[locale]/global-error.tsx` - 전역 에러

### 2. 기능별 에러 페이지
- `/app/[locale]/errors/auth-error.tsx` - 인증 관련
- `/app/[locale]/errors/inventory-error.tsx` - 재고 관련
- `/app/[locale]/errors/order-error.tsx` - 주문 관련
- `/app/[locale]/errors/shipping-error.tsx` - 배송 관련
- `/app/[locale]/errors/server-error.tsx` - 서버 에러

### 3. 에러 코드 맵핑
```
WMS-1001: Inventory Not Found
WMS-1002: Insufficient Stock
WMS-1003: Invalid SKU Format
WMS-2001: Order Locked
WMS-2002: Order Already Shipped
WMS-3001: Carrier Unavailable
WMS-4001: Unauthorized Access
WMS-5001: Database Connection Failed
```

## 사용자 액션 흐름

```
에러 발생
  ↓
에러 타입 확인
  ↓
적절한 페이지 표시 (에러 설명, 원인, 제안)
  ↓
사용자 선택
  ├─ 다시 시도
  ├─ 이전으로 돌아가기
  ├─ 홈으로 돌아가기
  ├─ 지원 요청
  └─ 대시보드로 이동
```
