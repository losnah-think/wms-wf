# 재고 관리 정책서 (Inventory Management Policy)

**작성일**: 2025년 11월 9일  
**시스템**: WMS-WF (Warehouse Management System - Workflow)  
**도메인**: 의류/패션 전자상거래

---

## 1. 개요 (Overview)

### 1.1 목적
- 의류/패션 상품의 멀티 옵션(색상, 사이즈 등) 재고를 효율적으로 관리
- 상품별/옵션별 재고 추적 및 제어
- 입출고/조정 프로세스 표준화
- 데이터 일관성 및 감시 자동화

### 1.2 적용 범위
- 모든 의류/패션 상품
- 창고/로케이션 기반 재고 추적
- 온라인/오프라인 채널 통합

---

## 2. 현재 데이터 구조 분석

### 2.1 ProductOption 인터페이스 ✅ (현재 구현)

```typescript
interface ProductOption {
  // 기본 정보
  id: number
  optionName: string              // 예: "레드, M"
  
  // 재고 정보
  quantity: number                // 현재 재고량
  safetyStock: number             // 안전재고 (최소재고)
  
  // 위치/분류
  barcode: string                 // 고유 바코드
  location: string                // 창고 위치 (A-01-01 등)
  grade: string                   // 등급 (정상/비정상/반품 등)
  
  // 가격 정보
  singleSalesPrice: number        // 옵션 판매가
  cost: number                    // 원가
  stockValue: number              // 재고액 (quantity × cost)
  
  // 상태 정보
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  statusText: string              // 상태 텍스트
  
  // 액션 플래그
  adjustmentRequired: boolean     // 조정 필요
  inboundRequired: boolean        // 입고 필요
  outboundRequired: boolean       // 출고 필요
  isInventorySyncEnabled: boolean // 재고 연동
  
  // 관리 정보
  warehouse: string               // 창고명
  warehouseDistribution: string   // 창고별 분배 정보
  soldOutClassification: string   // 품절 분류
}
```

### 2.2 StockItem 인터페이스 ✅ (현재 구현)

```typescript
interface StockItem {
  // 상품 기본 정보
  id: number
  productName: string
  purchasedProductName: string
  productCode: string
  category: string                // 예: "상의", "하의"
  brand: string
  
  // 판매 가격 정보
  price: number                   // 상품 기본 가격
  representativeSalesPrice: number
  thumbnail: string               // 상품 썸네일 이미지
  
  // 시간 정보 (8개)
  registrationDate: string
  productRegistrationDate: string
  lastModifiedDate: string
  productPublishDate: string
  expectedPoDate: string          // 예상 입고일
  poSettingDate: string
  soldOutDate: string
  stockRegistrationDate: string
  
  // 기본 정보
  supplier: string                // 공급처
  productClassification: string   // 상품 분류
  designer: string
  registeredBy: string
  
  // 상태 정보
  salesStatus: string             // 판매상태 (active/inactive/discontinued)
  isFullySoldOut: boolean
  isProductLocationRegistered: boolean
  
  // 추가 정보 (8개 boolean)
  productYear: string
  productSeason: string
  hasShippingHistory: boolean
  isNonExhibitionShipped: boolean
  includesUnreceivedQuantity: boolean
  isOptionMergePrevented: boolean
  daysWithoutOptionOrder: number
  daysWithoutProductOrder: number
  
  // 옵션 배열 (핵심)
  options: ProductOption[]
  
  // 집계 필드
  totalQuantity: number           // 옵션의 quantity 합계
  totalStockValue: number         // 옵션의 stockValue 합계
}
```

---

## 3. 부족한 부분 분석

### 3.1 🔴 **CRITICAL: 재고 이력 관리 (Inventory History)**

**현재 상태**: 현재 상태만 저장 (snapshot)  
**문제**: 재고 변동 추적 불가

**필요한 필드**:
```typescript
interface InventoryHistory {
  id: number
  optionId: number                // ProductOption.id 참조
  changeType: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE'
  quantity: number                // 변경 수량
  previousQuantity: number        // 변경 전 수량
  afterQuantity: number           // 변경 후 수량
  reason: string                  // 변경 사유
  createdBy: string               // 담당자
  createdAt: Date                 // 변경 시각
  documentNo: string              // 관련 문서번호 (PO, SO 등)
  warehouseFrom: string           // 출발 창고
  warehouseTo: string             // 도착 창고
}
```

**적용 시기**: 
- 입고/출고 완료 시
- 재고 조정 시
- 반품/손상 처리 시

---

### 3.2 🔴 **CRITICAL: 재고 이동 (Stock Movement/Transfer)**

**현재 상태**: 단일 창고/위치만 저장  
**문제**: 창고 간 이동 추적 불가, 멀티 창고 관리 불가

**필요한 필드**:
```typescript
interface StockTransfer {
  id: number
  optionId: number
  fromWarehouse: string           // 출발 창고
  fromLocation: string            // 출발 위치
  toWarehouse: string             // 도착 창고
  toLocation: string              // 도착 위치
  quantity: number
  status: 'PENDING' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED'
  transferNo: string              // 이동 문서번호
  scheduledDate: Date
  actualDate: Date
  notes: string
}
```

---

### 3.3 🔴 **CRITICAL: 예약 재고 (Reserved Stock)**

**현재 상태**: 실제 재고만 추적  
**문제**: 주문으로 예약된 재고 미반영 → 초과판매(oversell) 위험

**필요한 필드**:
```typescript
interface ProductOption {
  // 기존 필드
  quantity: number                // 총 재고
  
  // 추가 필드
  reservedQuantity: number        // 예약 재고 (주문된 수량)
  availableQuantity: number       // 실제 판매 가능 수량 = quantity - reservedQuantity
  allocatedQuantity: number       // 픽킹/배송 대기 수량
}

// 예약 정보 추적
interface StockReservation {
  id: number
  optionId: number
  orderNo: string
  reservedQuantity: number
  status: 'RESERVED' | 'ALLOCATED' | 'SHIPPED' | 'CANCELLED'
  createdAt: Date
  expireAt: Date                  // 예약 유효기한 (미픽킹 시 자동 해제)
}
```

---

### 3.4 🔴 **CRITICAL: 안전재고 규칙 (Safety Stock Rules)**

**현재 상태**: safetyStock 필드만 있고 규칙 미정의  
**문제**: 안전재고 기준이 모호함, 자동화 불가

**필요한 정책**:

#### 3.4.1 안전재고 계산 기준
```typescript
interface SafetyStockPolicy {
  optionId: number
  
  // 방법1: 고정값
  fixedSafetyStock: number
  
  // 방법2: 평균 소비량 기반
  averageDailyConsumption: number     // 평균 일일 판매량
  leadTimeDays: number                // 공급 리드타임 (일)
  safetyFactor: number                // 안전계수 (보통 1.5~2.0)
  calculatedSafetyStock = 
    averageDailyConsumption × (leadTimeDays + 7) × safetyFactor
}
```

#### 3.4.2 저재고 알림
- **조건**: `quantity <= safetyStock`
- **액션**: 자동 입고 주문 생성, 담당자 알림
- **우선순위**: safetyStock과의 차이로 결정

---

### 3.5 🟠 **HIGH: 멀티 로케이션 관리**

**현재 상태**: 단일 location 필드  
**문제**: 같은 옵션의 서로 다른 로케이션 관리 불가

**필요한 구조**:
```typescript
interface LocationStock {
  id: number
  optionId: number
  warehouseId: string
  location: string                // 예: A-01-01
  quantity: number                // 해당 로케이션의 재고
  lastCountDate: Date             // 마지막 실사 날짜
  status: 'NORMAL' | 'HOLD' | 'EXPIRED'
}

// ProductOption 수정
interface ProductOption {
  // ...
  locationStocks: LocationStock[] // 로케이션별 상세
  location: string                // (deprecated) 기본 로케이션
}
```

---

### 3.6 🟠 **HIGH: 상품 옵션 메타데이터 (Option Attributes)**

**현재 상태**: optionName만 저장  
**문제**: 옵션의 속성(색상, 사이즈 등)을 구조화하지 않음

**필요한 필드**:
```typescript
interface ProductOptionAttribute {
  optionId: number
  
  // 의류 옵션
  color: string                   // 예: "빨강"
  size: string                    // 예: "M"
  material: string                // 예: "면 100%"
  
  // 기타 옵션
  customAttributes: Record<string, string> // 유연한 확장
}
```

---

### 3.7 🟠 **HIGH: 재고 상태 머신 (State Machine)**

**현재 상태**: status는 3가지만 ('in_stock' | 'low_stock' | 'out_of_stock')  
**문제**: 상태 전이 규칙이 없음, 부정확한 상태 변경 가능

**필요한 상태**:
```typescript
type InventoryStatus = 
  | 'IN_STOCK'           // 정상 재고
  | 'LOW_STOCK'          // 저재고 (조정 필요)
  | 'OUT_OF_STOCK'       // 품절
  | 'ON_ORDER'           // 주문 예약 중
  | 'IN_TRANSIT'         // 입고 중
  | 'HOLD'               // 보류 (반품/손상 등)
  | 'DISCONTINUED'       // 단종
  | 'EXPIRED'            // 만료된 상품

// 상태 전이 규칙
interface StateTransition {
  from: InventoryStatus
  to: InventoryStatus
  trigger: string        // 예: 'INBOUND_COMPLETE', 'OUTBOUND', 'EXPIRE'
  condition?: () => boolean
}
```

---

### 3.8 🟠 **HIGH: 재고 실사 (Physical Count)**

**현재 상태**: 미구현  
**문제**: 시스템 재고와 실제 재고의 차이 감지 불가

**필요한 구조**:
```typescript
interface PhysicalCount {
  id: number
  cycleNo: string                 // 주기번호
  optionId: number
  
  systemQuantity: number          // 시스템 상 수량
  actualQuantity: number          // 실제 실사 수량
  variance: number                // 차이 (actualQuantity - systemQuantity)
  
  countedBy: string               // 실사 담당자
  countedAt: Date                 // 실사 날짜
  reviewed: boolean               // 검토 완료
  reviewedBy: string              // 검토자
  
  adjustment: InventoryAdjustment // 차이 조정
}

interface InventoryAdjustment {
  id: number
  countId: number
  reason: 'DAMAGE' | 'LOSS' | 'SYSTEM_ERROR' | 'MISCOUNT' | 'UNRECORDED_INBOUND'
  quantity: number                // 조정 수량
  approvedBy: string
  approvedAt: Date
}
```

---

### 3.9 🟠 **HIGH: 품질 등급 관리 (Grade Management)**

**현재 상태**: grade 필드만 있고 정의 미흡  
**문제**: 등급 기준이 불명확, 가격 반영 불가

**필요한 정책**:
```typescript
interface GradePolicy {
  gradeId: string
  gradeName: string               // 예: "정상", "B급", "반품", "손상"
  description: string
  
  priceDiscount: number           // 할인율 (%) 예: 30 (30% 할인)
  canSell: boolean                // 판매 가능 여부
  canReturn: boolean              // 반품 가능 여부
  notes: string
}

// 예: 
// 정상 - 100% 판매가, 판매 가능, 반품 가능
// B급 - 70% 판매가, 판매 가능, 반품 불가
// 손상 - 판매 불가, 폐기 대기
```

---

### 3.10 🟡 **MEDIUM: 채널별 재고 분배 (Channel Allocation)**

**현재 상태**: warehouseDistribution 필드만 있음  
**문제**: 온라인/오프라인/B2B 등 채널별 할당 규칙 없음

**필요한 구조**:
```typescript
interface ChannelAllocation {
  optionId: number
  
  allocations: {
    online: number                // 온라인 채널 할당량
    offline: number               // 오프라인 점포 할당량
    b2b: number                   // B2B 할당량
    warehouse: number             // 창고 재고
  }
  
  allocationRules: {
    method: 'FIXED' | 'RATIO' | 'DYNAMIC'
    ratios?: {
      onlineRatio: number
      offlineRatio: number
      b2bRatio: number
    }
  }
}
```

---

### 3.11 🟡 **MEDIUM: 반품/교환 관리 (Return/Exchange)**

**현재 상태**: 미구현  
**문제**: 반품 상품 재고 복귀 프로세스 미정의

**필요한 구조**:
```typescript
interface ReturnRequest {
  id: number
  orderId: string
  returnNo: string
  
  items: ReturnItem[]
  
  status: 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'RESTOCKED' | 'REJECTED'
  reason: string
  
  receivedQuantity: number        // 실제 수령한 수량
  restockQuantity: number         // 재고로 복귀할 수량
  damageQuantity: number          // 손상 수량
  
  processedBy: string
  processedAt: Date
}

interface ReturnItem {
  lineNo: number
  optionId: number
  requestedQuantity: number
  action: 'RESTOCK' | 'EXCHANGE' | 'DESTROY'
}
```

---

### 3.12 🟡 **MEDIUM: 재고 예보 (Forecast)**

**현재 상태**: 미구현  
**문제**: 미래 수요 예측 불가, 주문 타이밍 결정 어려움

**필요한 구조**:
```typescript
interface InventoryForecast {
  optionId: number
  forecastDate: Date              // 예보 시점
  
  // 향후 30/60/90일 예측
  forecast30Days: number
  forecast60Days: number
  forecast90Days: number
  
  forecastMethod: 'MOVING_AVERAGE' | 'EXPONENTIAL_SMOOTHING' | 'ML'
  confidence: number              // 신뢰도 (%)
  
  recommendedOrderQty: number     // 권장 주문량
  recommendedOrderDate: Date      // 권장 주문일
}
```

---

### 3.13 🟡 **MEDIUM: 권한 및 감시 로그 (Audit Trail)**

**현재 상태**: createdBy, registeredBy만 있음  
**문제**: 모든 재고 변동 기록이 없음, 책임 추적 불가

**필요한 정책**:
```typescript
interface AuditLog {
  id: number
  entityType: 'INVENTORY' | 'STOCK_TRANSFER' | 'PHYSICAL_COUNT' | 'ADJUSTMENT'
  entityId: number
  
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT'
  actor: {
    userId: string
    userName: string
    role: string
  }
  
  before: any                     // 변경 전 값
  after: any                      // 변경 후 값
  changes: Record<string, any>    // 변경된 필드만
  
  timestamp: Date
  ipAddress: string
  reason: string                  // 변경 사유
  approvalNo?: string
}
```

---

## 4. 구현 우선순위 로드맵

### Phase 1 (즉시 - 1주)
- ✅ 현재 상태 유지
- ⚠️ **InventoryHistory** 구현 (필수)
- ⚠️ **StockReservation** 추가 (초과판매 방지)

### Phase 2 (2-3주)
- 📋 **SafetyStockPolicy** 규칙 정의
- 📋 **InventoryAdjustment** 프로세스
- 📋 **PhysicalCount** 기능

### Phase 3 (4-5주)
- 🔄 **StockTransfer** (멀티 창고 지원)
- 🔄 **ChannelAllocation** (채널별 분배)
- 🔄 **ReturnManagement** (반품 처리)

### Phase 4 (6주+)
- 📊 **InventoryForecast** (예측)
- 📊 **AuditLog** (감시 시스템)
- 📊 **StateTransition** (상태 머신)

---

## 5. 데이터 검증 규칙

### 5.1 필수 체크
```
1. quantity >= 0 (음수 불가)
2. quantity >= safetyStock (저재고 판단)
3. reservedQuantity <= quantity (예약량이 재고 초과 불가)
4. availableQuantity = quantity - reservedQuantity >= 0
5. totalQuantity = SUM(options.quantity)
6. totalStockValue = SUM(options.stockValue)
```

### 5.2 비즈니스 규칙
```
1. 재고 = 0이면 상태 = 'OUT_OF_STOCK'
2. 재고 <= 안전재고이면 상태 = 'LOW_STOCK'
3. 재고 > 안전재고이면 상태 = 'IN_STOCK'
4. 모든 재고 변동은 History에 기록
5. 30일 이상 판매 없는 상품 → LOW_VELOCITY 플래그
```

---

## 6. API 엔드포인트 제안

### 재고 조회
```
GET /api/inventory/products
GET /api/inventory/options/:optionId
GET /api/inventory/history/:optionId
```

### 재고 변동
```
POST /api/inventory/inbound              (입고)
POST /api/inventory/outbound             (출고)
POST /api/inventory/adjustment           (조정)
POST /api/inventory/transfer             (이동)
```

### 재고 관리
```
POST /api/inventory/physical-count       (실사)
POST /api/inventory/reservation          (예약)
POST /api/inventory/return               (반품)
```

### 보고서
```
GET /api/inventory/reports/stock-status
GET /api/inventory/reports/movements
GET /api/inventory/reports/forecast
```

---

## 7. 성공 지표 (KPI)

| 지표 | 목표 | 측정 |
|------|------|------|
| 재고 정확도 | > 98% | 실사 vs 시스템 차이 |
| 초과판매 사건 | 0건/월 | 예약 초과 발생건수 |
| 저재고 조정시간 | < 24시간 | 알림 → 주문 시간 |
| 반품 처리 | < 3일 | 수령 → 복귀 시간 |
| 재고 회전율 | > 6회/년 | 연간 판매 / 평균재고 |

---

## 8. 결론

**현재 구조의 강점**:
- ✅ 1:N 옵션 관계 모델링 우수
- ✅ 기본 가격/수량 정보 완전
- ✅ 상태 구분 명확 (상품/옵션 분리)

**개선이 필요한 분야**:
- ❌ 재고 이력 추적 (History) → **필수**
- ❌ 예약 재고 관리 (Reservation) → **필수**
- ❌ 멀티 로케이션 (Location) → **중요**
- ❌ 실사/조정 프로세스 → **중요**
- ❌ 반품/교환 처리 → **필요**

**추천 다음 단계**:
1. InventoryHistory 테이블 추가
2. 예약 시스템 구현
3. 안전재고 정책 자동화
4. 실사 기능 개발

---

**작성자**: AI Assistant  
**마지막 수정**: 2025년 11월 9일
