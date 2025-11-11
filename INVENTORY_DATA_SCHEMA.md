# 재고 데이터 스키마 및 목업 데이터 생성 가이드

> 📊 필터 적용을 위한 재고 데이터 구조와 목업 데이터 생성 방법을 정리한 문서입니다.

---

## 📋 재고 데이터 스키마 (TypeScript)

### 1️⃣ 기본 재고 항목 인터페이스

```typescript
interface InventoryItem {
  // ===== 기본 정보 =====
  id: number                          // 고유 ID
  productCode: string                 // 상품코드 (PROD-00001)
  productName: string                 // 상품명
  barcode: string                     // 바코드
  sku: string                         // SKU
  
  // ===== 분류 정보 =====
  category: string                    // 상품분류 (의류, 신발, 가방, 액세서리)
  productLocation: string             // 상품위치 (A, B, C, D)
  managementLevel: string             // 관리등급 (높음, 중간, 낮음, 전체상품)
  registeredBy: string                // 등록자 (사용자명 또는 ID)
  
  // ===== 판매 정보 =====
  brand: string                       // 브랜드
  year: string                        // 상품연도 (2023, 2024, 2025)
  season: string                      // 상품시즌 (봄, 여름, 가을, 겨울)
  saleStatus: 'selling' | 'sold_out' | 'discontinued'  // 판매상태
  saleStatusText: string              // 판매상태 텍스트
  
  // ===== 공급처 정보 =====
  supplierCategory: string            // 공급처분류 (가방, 신발, 의자 등)
  supplierDetail: string              // 공급처상세 (특정 공급사명)
  
  // ===== 재고 정보 (기본) =====
  quantity: number                    // 현재 재고량 (개)
  lowStockThreshold: number           // 저재고 기준 (예: 10개)
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'  // 재고 상태
  stockStatusText: string             // 재고 상태 텍스트
  
  // ===== 재고 정보 (상세) - 가용재고 필터용 =====
  reservedQuantity: number            // 예약 중인 재고 (개)
  damagedQuantity: number             // 불량품 (개)
  returningQuantity: number           // 반품 처리 중 (개)
  inspectionQuantity: number          // 검사 중 (개)
  availableQuantity: number           // 🟢 가용 재고 = quantity - reserved - damaged - returning - inspection
  availabilityRate: number            // 가용률 (%) = availableQuantity / quantity * 100
  
  // ===== 재고 정보 (당일 추적) - 당일입출고수수량표시 필터용 =====
  dailyInboundQty: number             // 당일 입고량 (개)
  dailyOutboundQty: number            // 당일 출고량 (개)
  dailyInboundDate: Date              // 당일 입고 일시
  dailyOutboundDate: Date             // 당일 출고 일시
  
  // ===== 가격 정보 =====
  costPrice: number                   // 원가 (원)
  sellingPrice: number                // 판매가 (원)
  currentPrice: number                // 현재가 (원)
  optionSalesPrice: number            // 옵션 판매금액 (원)
  totalStockValue: number             // 총 재고액 (원) = quantity * currentPrice
  
  // ===== 가격 정보 (분석용) - 상품별 환가표시 필터용 =====
  averageUnitPrice: number            // 평균 단가 (원) = totalStockValue / quantity
  costPerUnit: number                 // 단위당 원가 (원) = costPrice / quantity
  marginPercentage: number            // 마진율 (%) = (currentPrice - costPrice) / currentPrice * 100
  
  // ===== 날짜 정보 =====
  productRegistrationDate: Date       // 상품등록일자
  lastModifiedDate: Date              // 최종수정일
  productPublishDate: Date            // 상품게시일
  soldOutPredictionDate: Date         // 품절 예정일
  poSettingDate: Date                 // 입고예정일 설정일자
  expectedPoDate: Date                // 입고예정일
  
  // ===== 운영 플래그 =====
  hasShippingHistory: boolean         // 출고내역존재여부
  isDisplayed: boolean                // 진열여부 (false = 미진열)
  includeUnreceivedQuantity: boolean  // 미입고수량포함여부
  useStockSync: boolean               // 재고연동사용여부
  preventOptionCombination: boolean   // 옵션합포방지여부
  
  // ===== 위치 정보 (세부) - 창고별 세부상품위치표 필터용 =====
  warehouseDetailLocation: {
    building: string                  // 건물/동 (A, B, C동)
    zone: string                      // 구역 (01, 02, 03...)
    aisle: string                     // 통로 (A1, B2, C3...)
    rack: string                      // 랙 번호 (1-10)
    shelf: string                     // 선반 위치 (상/중/하)
    bay: string                       // 칸 번호
    level: string                     // 높이 (1-5층)
    locationCode: string              // 통합 위치 코드 (A-02-A1-5-상-3)
  }
  
  // ===== 옵션 정보 - 창고별 옵션수량표시 필터용 =====
  options: {
    size?: string                     // 사이즈 (S, M, L, XL)
    color?: string                    // 색상 (검정, 흰색, 파랑...)
    material?: string                 // 소재 (면, 폴리, 울...)
    customOption?: string             // 커스텀 옵션
  }
  | **옵션/위치** | quantityByOption, options | number, object |
| **옵션수량표시** | warehouseDetailLocation | object |

---

## 🎯 UI 필터 옵션 상세 가이드

### ✅ **필수 필터 (우선순위 높음)**

#### 1️⃣ **창고별 세부상품위치표** (⭐⭐⭐⭐⭐)
- **필드:** `warehouseDetailLocation` → `locationCode`
- **형식:** `"A-02-A1-5-상-3"` (건물-구역-통로-랙-선반-칸)
- **효과:** 
  - 픽킹 직원의 정확한 위치 제시 → 시간 30-50% 단축
  - 재고 오류율 감소 (정확한 위치 추적)
  - 신직원 온보딩 시간 단축
- **예시:**
  ```typescript
  item.warehouseDetailLocation = {
    building: "A",           // A동
    zone: "02",              // 2구역
    aisle: "A1",             // A1통로
    rack: "5",               // 5번 랙
    shelf: "상",             // 상단
    bay: "3",                // 3칸
    level: "2",              // 2층
    locationCode: "A-02-A1-5-상-3"  // 통합 코드
  }
  ```

#### 2️⃣ **가용재고표시** (⭐⭐⭐⭐⭐)
- **필드:** `availableQuantity`, `availabilityRate`
- **계산식:** `availableQuantity = quantity - reserved - damaged - returning - inspection`
- **효과:**
  - 정확한 주문 약속 (과도한 약속 방지) → 고객 만족도 15-20% ↑
  - 주문 정확도 95%+ 달성
  - 취소/반품 감소 (5-10% 매출 손실 회복)
- **예시:**
  ```typescript
  item = {
    quantity: 1000,             // 전체 재고
    reservedQuantity: 300,      // 예약 중
    damagedQuantity: 50,        // 불량품
    returningQuantity: 150,     // 반품 처리 중
    inspectionQuantity: 100,    // 검사 중
    availableQuantity: 400,     // ✅ 실제 주문 가능 (1000-300-50-150-100)
    availabilityRate: 40        // 가용률 40%
  }
  ```
- **사용 시나리오:**
  ```
  고객 요청: "상품 A 1000개 주문 가능?"
  
  기존 (필터 없음):
  - "네, 1000개 있습니다" ❌
  - 실제 배송: 400개만 가능 → 분쟁 발생
  
  신규 (필터 적용):
  - "400개 가능합니다. 나머지 600개는 예약/불량/검사 중" ✅
  - 고객이 미리 알고 선택 가능 → 신뢰도 ↑
  ```

---

### 📊 **주요 필터 (우선순위 중간-높음)**

#### 3️⃣ **당일입출고수수량표시** (⭐⭐⭐⭐)
- **필드:** `dailyInboundQty`, `dailyOutboundQty`, `dailyInboundDate`, `dailyOutboundDate`
- **목적:** 당일 물류 현황 실시간 파악
- **효과:**
  - 일일 운영 현황 시각화
  - 병목 구간 식별 (입고 > 출고 또는 그 반대)
  - 창고 용량 최적화 계획 수립
- **예시:**
  ```typescript
  dailyInboundQty: 500         // 오늘 입고 500개
  dailyOutboundQty: 300        // 오늘 출고 300개
  dailyInboundDate: 2025-11-08 14:30
  dailyOutboundDate: 2025-11-08 10:15
  ```

#### 4️⃣ **상품별 환가표시** (⭐⭐⭐)
- **필드:** `averageUnitPrice`, `costPerUnit`, `marginPercentage`
- **목적:** 상품별 수익성 분석
- **효과:**
  - 마진율이 낮은 상품 식별
  - 가격 정책 개선 (할인/인상 결정)
  - 손익분기점 분석
- **예시:**
  ```typescript
  costPrice: 25000        // 원가
  currentPrice: 35000     // 현재 판매가
  quantity: 100           // 재고 100개
  totalStockValue: 3500000  // 35000 * 100
  averageUnitPrice: 35000   // 35000
  costPerUnit: 25000        // 25000
  marginPercentage: 28.6    // (35000-25000)/35000*100 = 28.6%
  ```

#### 5️⃣ **창고별 옵션수량표시** (⭐⭐⭐⭐)
- **필드:** `warehouseDetailLocation`, `options`, `quantityByOption`
- **목적:** SKU 레벨의 상세 재고 추적
- **효과:**
  - 인기 색상/사이즈 파악 (수주예측 개선)
  - 불인기 옵션 재고 처리 전략
  - 발주 최적화 (맞춤형 주문)
- **예시:**
  ```typescript
  options: {
    size: "M",
    color: "검정",
    material: "면100%"
  }
  quantityByOption: 250  // M사이즈 검정색 면100% 250개
  warehouseDetailLocation: { locationCode: "A-02-A1-5-상-3" }
  ```

---

### 📋 **보조 필터 (우선순위 중간)**

#### 6️⃣ **바코드번호표시** (⭐⭐⭐)
- **필드:** `barcode`
- **목적:** 물류 추적 및 스캔 작업
- **효과:**
  - 입출고 프로세스 자동화
  - 재고 오류 감소 (바코드 스캔으로 자동 확인)

#### 7️⃣ **사입옵션명표시** (⭐⭐⭐)
- **필드:** `options`, `sku`
- **목적:** 구매 옵션 명확화
- **효과:**
  - 발주 오류 감소
  - 공급사와의 의사소통 명확화

#### 8️⃣ **간단하게보기** (⭐⭐)
- **필드:** `simpleView` (boolean)
- **목적:** UI 복잡도 감소
- **효과:**
  - 모바일 환경에서 빠른 로딩
  - 초기 조회 시 빠른 이해

---

## 💡 **필터 활용 시나리오 (실제 사용)**

### 시나리오 1: 픽킹 직원의 상품 찾기

```typescript
// 픽킹 지시: "상품 PROD-00123 300개 준비"

// 필터 적용 전:
// - 상품명: 에코 티셔츠
// - 현재 재고: 1,000개
// 픽킹 직원: "어디서 꺼내야 하지?" ❌

// 필터 적용 후 (세부위치표):
// - 상품명: 에코 티셔츠
// - 현재 재고: 1,000개
// - 📍 위치: A-02-A1-5-상-3 (A동 2구역 A1통로 5랙 상단 3칸)
// 픽킹 직원: 정확한 위치로 직행 → 1분 내 찾음 ✅

// 결과: 픽킹 시간 5분 → 2.5분 (50% 단축) 💰
```

### 시나리오 2: 고객 주문 처리

```typescript
// 고객: "상품 SKU-00123 검정색 M사이즈 500개 주문 가능?"

// 필터 적용 전:
// - 재고: 1,000개 → "네 가능합니다" ❌
// - 실제 가용: 400개만 가능 → 분쟁 발생

// 필터 적용 후 (가용재고 + 옵션수량):
// - 전체 재고: 1,000개
// - 예약 중: 300개, 불량품: 50개, 반품 중: 150개, 검사 중: 100개
// - 🟢 가용 재고: 400개
// - 해당 옵션(M 검정): 250개 가용
// - "M 검정색은 250개 가능. 다른 옵션은?" ✅

// 결과: 고객 만족도 ↑, 취소율 ↓ 💯
```

### 시나리오 3: 운영 매니저의 일일 현황 파악

```typescript
// 매니저: "오늘 입출고 현황 파악"

// 필터 적용 (당일입출고수수량표시):
// - A창고: 입고 500개, 출고 300개 (입고 > 출고)
// - B창고: 입고 200개, 출고 600개 (출고 > 입고)
// - C창고: 입고 800개, 출고 1000개 (용량 부족 경고!)

// 액션: C창고 용량 부족 → 긴급 출고 우선처리 또는 A창고에서 이동 📦
// 결과: 재고 적체 방지, 운영 효율성 ↑
```

### 시나리오 4: 구매팀의 발주 결정

```typescript
// 구매팀: "다음 달 발주 계획"

// 필터 적용 (단가표시 + 옵션수량):
// - 상품 A: 단가 5,000원, 마진율 40%, 인기도 높음 (M/L사이즈) → 2,000개 발주 ⬆️
// - 상품 B: 단가 5,000원, 마진율 15%, 비인기 (XL사이즈만) → 500개 발주 ⬇️
// - 상품 C: 단가 10,000원, 마진율 35%, 고가 상품 → 선별 발주 🎯

// 결과: 수익성 기반 발주 → 마진율 3% 개선 💰
```

---

## 🔄 **Prisma 스키마 업데이트**

```prisma
model InventoryItem {
  // ... 기존 필드 ...
  
  // 재고 상세 정보 (가용재고 필터용)
  reservedQuantity          Int       @default(0)
  damagedQuantity           Int       @default(0)
  returningQuantity         Int       @default(0)
  inspectionQuantity        Int       @default(0)
  availableQuantity         Int       @default(0) // calculated
  availabilityRate          Float     @default(100)
  
  // 당일 입출고
  dailyInboundQty           Int       @default(0)
  dailyOutboundQty          Int       @default(0)
  dailyInboundDate          DateTime?
  dailyOutboundDate         DateTime?
  
  // 가격 분석
  averageUnitPrice          Int       @default(0) // calculated
  costPerUnit               Int       @default(0) // calculated
  marginPercentage          Float     @default(0) // calculated
  
  // 위치 정보 (JSON 저장)
  warehouseDetailLocation   Json      @default("{}")
  
  // 옵션 정보 (JSON 저장)
  options                   Json      @default("{}")
  quantityByOption          Int       @default(0)
  
  // UI 표시 옵션
  showDetailLocation        Boolean   @default(true)
  showAvailableQty          Boolean   @default(true)
  showDailyInOut            Boolean   @default(false)
  showUnitPrice             Boolean   @default(false)
  showOptionQty             Boolean   @default(false)
  showBarcode               Boolean   @default(false)
  simpleView                Boolean   @default(false)
}
```

---

## ✅ 체크리스트

- [ ] 세부위치표 데이터 생성 (warehouseDetailLocation)
- [ ] 가용재고 계산 로직 구현 (availableQuantity)
- [ ] 당일 입출고 추적 (dailyInboundQty, dailyOutboundQty)
- [ ] 옵션별 수량 관리 (options, quantityByOption)
- [ ] UI 필터 토글 구현 (showXxx 플래그)
- [ ] 필터 성능 최적화 (인덱스 추가)
- [ ] 필터 조합 테스트 (5개 이상 필터 동시 적용)


  
  // ===== UI 표시 옵션 =====
  showDetailLocation: boolean         // 세부위치표 표시 여부
  showAvailableQty: boolean           // 가용재고 표시 여부
  showDailyInOut: boolean             // 당일입출고 표시 여부
  showUnitPrice: boolean              // 단가표시 여부
  showOptionQty: boolean              // 옵션수량표시 여부
  showBarcode: boolean                // 바코드표시 여부
  simpleView: boolean                 // 간단하게보기 모드
  
  // ===== 태그 =====
  tags: string[]                      // 상품 태그들
  
  // ===== 계산된 필드 =====
  daysWithoutOrder: number            // 미주문 기간 (일)
  lastOrderDate: Date | null          // 마지막 주문일
}
```

---

## 🔧 목업 데이터 생성 함수

### 방법 1: TypeScript 클래스 기반

```typescript
class InventoryDataGenerator {
  private products = [
    '에코 티셔츠', '데님 팬츠', '스포츠 조끼', '캐주얼 셔츠',
    '프리미엄 코트', '운동화', '캐주얼 스니커즈', '정장 구두',
    '캔버스 가방', '백팩', '숄더백', '클러치',
    '목걸이', '팔찌', '반지', '모자'
  ]
  
  private categories = ['의류', '신발', '가방', '액세서리']
  private brands = ['Nike', 'Adidas', 'Puma', 'Gucci', 'Zara', 'H&M', 'UNIQLO', 'COS']
  private supplierCategories = ['가방', '신발', '의자', '의류']
  private years = ['2023', '2024', '2025']
  private seasons = ['봄', '여름', '가을', '겨울']
  private locations = ['A', 'B', 'C', 'D', 'E']
  private managementLevels = ['높음', '중간', '낮음', '전체상품']
  private registrars = ['user1', 'user2', 'user3', 'admin', 'manager']
  
  generateInventoryData(count: number = 100): InventoryItem[] {
    const items: InventoryItem[] = []
    
    for (let i = 1; i <= count; i++) {
      const quantity = Math.floor(Math.random() * 5000)
      const costPrice = Math.floor(Math.random() * 100000) + 10000
      const sellingPrice = Math.floor(costPrice * (1 + Math.random() * 0.5))
      const currentPrice = Math.floor(sellingPrice * (0.8 + Math.random() * 0.4))
      
      const saleStatusRandom = Math.random()
      const saleStatus: 'selling' | 'sold_out' | 'discontinued' = 
        saleStatusRandom > 0.8 ? 'sold_out' : 
        saleStatusRandom > 0.6 ? 'discontinued' : 
        'selling'
      
      const stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' =
        quantity > 100 ? 'in_stock' :
        quantity > 10 ? 'low_stock' :
        'out_of_stock'
      
      const productRegistrationDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      const lastModifiedDate = new Date(productRegistrationDate.getTime() + Math.random() * (Date.now() - productRegistrationDate.getTime()))
      
      const item: InventoryItem = {
        id: i,
        productCode: `PROD-${String(i).padStart(5, '0')}`,
        productName: `${this.randomFrom(this.products)} #${i}`,
        barcode: `880${String(i).padStart(12, '0')}`,
        sku: `SKU-${String(i).padStart(8, '0')}`,
        
        category: this.randomFrom(this.categories),
        productLocation: this.randomFrom(this.locations),
        managementLevel: this.randomFrom(this.managementLevels),
        registeredBy: this.randomFrom(this.registrars),
        
        brand: this.randomFrom(this.brands),
        year: this.randomFrom(this.years),
        season: this.randomFrom(this.seasons),
        saleStatus,
        saleStatusText: saleStatus === 'selling' ? '판매중' : saleStatus === 'sold_out' ? '품절' : '단종',
        
        supplierCategory: this.randomFrom(this.supplierCategories),
        supplierDetail: `공급처-${Math.floor(Math.random() * 10)}`,
        
        quantity,
        lowStockThreshold: 50,
        stockStatus,
        stockStatusText: stockStatus === 'in_stock' ? '재고충분' : stockStatus === 'low_stock' ? '적은재고' : '품절',
        
        costPrice,
        sellingPrice,
        currentPrice,
        optionSalesPrice: Math.floor(currentPrice * 1.1),
        totalStockValue: quantity * currentPrice,
        
        productRegistrationDate,
        lastModifiedDate,
        productPublishDate: new Date(productRegistrationDate.getTime() + 86400000),
        soldOutPredictionDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
        poSettingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        expectedPoDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        
        hasShippingHistory: Math.random() > 0.3,
        isDisplayed: Math.random() > 0.1,
        includeUnreceivedQuantity: Math.random() > 0.5,
        useStockSync: Math.random() > 0.4,
        preventOptionCombination: Math.random() > 0.6,
        
        tags: this.generateRandomTags(),
        
        daysWithoutOrder: Math.floor(Math.random() * 365),
        lastOrderDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      }
      
      items.push(item)
    }
    
    return items
  }
  
  private randomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }
  
  private generateRandomTags(): string[] {
    const tagPool = ['신상', '할인', '인기', '제한판', '에코', '프리미엄', '세일', '한정']
    const count = Math.floor(Math.random() * 3)
    const tags: string[] = []
    
    for (let i = 0; i < count; i++) {
      tags.push(this.randomFrom(tagPool))
    }
    
    return [...new Set(tags)]
  }
}

// 사용 예
const generator = new InventoryDataGenerator()
const mockData = generator.generateInventoryData(500)
```

---

## 📊 방법 2: JSON 파일 형식

```json
{
  "inventory": [
    {
      "id": 1,
      "productCode": "PROD-00001",
      "productName": "에코 티셔츠 #1",
      "barcode": "880000000000001",
      "sku": "SKU-00000001",
      "category": "의류",
      "productLocation": "A",
      "managementLevel": "높음",
      "registeredBy": "user1",
      "brand": "Nike",
      "year": "2024",
      "season": "봄",
      "saleStatus": "selling",
      "saleStatusText": "판매중",
      "supplierCategory": "가방",
      "supplierDetail": "공급처-1",
      "quantity": 2500,
      "lowStockThreshold": 50,
      "stockStatus": "in_stock",
      "stockStatusText": "재고충분",
      "costPrice": 25000,
      "sellingPrice": 35000,
      "currentPrice": 32000,
      "optionSalesPrice": 35200,
      "totalStockValue": 80000000,
      "productRegistrationDate": "2024-01-15T00:00:00Z",
      "lastModifiedDate": "2025-11-07T12:30:00Z",
      "productPublishDate": "2024-01-16T00:00:00Z",
      "soldOutPredictionDate": "2025-12-15T00:00:00Z",
      "poSettingDate": "2025-10-08T00:00:00Z",
      "expectedPoDate": "2025-11-20T00:00:00Z",
      "hasShippingHistory": true,
      "isDisplayed": true,
      "includeUnreceivedQuantity": false,
      "useStockSync": true,
      "preventOptionCombination": false,
      "tags": ["신상", "할인"],
      "daysWithoutOrder": 45,
      "lastOrderDate": "2025-09-24T00:00:00Z"
    },
    {
      "id": 2,
      "productCode": "PROD-00002",
      "productName": "데님 팬츠 #2",
      "barcode": "880000000000002",
      "sku": "SKU-00000002",
      "category": "의류",
      "productLocation": "B",
      "managementLevel": "중간",
      "registeredBy": "user2",
      "brand": "Adidas",
      "year": "2024",
      "season": "여름",
      "saleStatus": "sold_out",
      "saleStatusText": "품절",
      "supplierCategory": "신발",
      "supplierDetail": "공급처-2",
      "quantity": 5,
      "lowStockThreshold": 50,
      "stockStatus": "low_stock",
      "stockStatusText": "적은재고",
      "costPrice": 35000,
      "sellingPrice": 50000,
      "currentPrice": 45000,
      "optionSalesPrice": 49500,
      "totalStockValue": 225000,
      "productRegistrationDate": "2024-03-10T00:00:00Z",
      "lastModifiedDate": "2025-11-06T15:45:00Z",
      "productPublishDate": "2024-03-11T00:00:00Z",
      "soldOutPredictionDate": "2025-11-20T00:00:00Z",
      "poSettingDate": "2025-10-15T00:00:00Z",
      "expectedPoDate": "2025-11-25T00:00:00Z",
      "hasShippingHistory": true,
      "isDisplayed": false,
      "includeUnreceivedQuantity": true,
      "useStockSync": false,
      "preventOptionCombination": true,
      "tags": ["프리미엄", "제한판"],
      "daysWithoutOrder": 120,
      "lastOrderDate": "2025-07-10T00:00:00Z"
    }
  ]
}
```

---

## 🗄️ 방법 3: Prisma Schema 기반 (데이터베이스)

```prisma
model InventoryItem {
  id                        Int       @id @default(autoincrement())
  productCode               String    @unique
  productName               String
  barcode                   String
  sku                       String    @unique
  
  // 분류 정보
  category                  String
  productLocation           String
  managementLevel           String
  registeredBy              String
  
  // 판매 정보
  brand                     String
  year                      String
  season                    String
  saleStatus                String    // 'selling' | 'sold_out' | 'discontinued'
  saleStatusText            String
  
  // 공급처 정보
  supplierCategory          String
  supplierDetail            String
  
  // 재고 정보
  quantity                  Int
  lowStockThreshold         Int       @default(50)
  stockStatus               String    // 'in_stock' | 'low_stock' | 'out_of_stock'
  stockStatusText           String
  
  // 가격 정보
  costPrice                 Int
  sellingPrice              Int
  currentPrice              Int
  optionSalesPrice          Int
  totalStockValue           Int       @default(0) // calculated: quantity * currentPrice
  
  // 날짜 정보
  productRegistrationDate   DateTime
  lastModifiedDate          DateTime
  productPublishDate        DateTime
  soldOutPredictionDate     DateTime?
  poSettingDate             DateTime?
  expectedPoDate            DateTime?
  
  // 운영 플래그
  hasShippingHistory        Boolean   @default(false)
  isDisplayed               Boolean   @default(true)
  includeUnreceivedQuantity Boolean   @default(false)
  useStockSync              Boolean   @default(false)
  preventOptionCombination  Boolean   @default(false)
  
  // 태그
  tags                      String[]  @default([])
  
  // 계산된 필드
  daysWithoutOrder          Int?
  lastOrderDate             DateTime?
  
  // 시스템 필드
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt
  
  @@index([productCode])
  @@index([category])
  @@index([brand])
  @@index([saleStatus])
  @@index([stockStatus])
  @@index([productRegistrationDate])
  @@index([lastModifiedDate])
}
```

---

## 🔍 필터별 필요한 데이터 필드

| 필터 | 필요 필드 | 타입 |
|------|---------|------|
| **통합검색** | productCode, productName, barcode, sku | string |
| **기준** | 기준일 (계산에 사용) | Date |
| **공급처분류** | supplierCategory | string |
| **공급처상세** | supplierDetail | string |
| **상품분류** | category | string |
| **상품위치** | productLocation | string |
| **관리등급** | managementLevel | string |
| **등록자** | registeredBy | string |
| **판매상태** | saleStatus | enum |
| **브랜드** | brand | string |
| **연도** | year | string |
| **시즌** | season | string |
| **태그** | tags | string[] |
| **상품등록일자** | productRegistrationDate | Date |
| **최종수정일** | lastModifiedDate | Date |
| **품절/입고예정** | soldOutPredictionDate, poSettingDate | Date |
| **입고예정일** | expectedPoDate | Date |
| **상품게시일** | productPublishDate | Date |
| **미주문기간** | daysWithoutOrder, lastOrderDate | number, Date |
| **재고수량범위** | quantity | number |
| **판매금액범위** | optionSalesPrice | number |
| **재고금액범위** | totalStockValue | number |
| **출고내역여부** | hasShippingHistory | boolean |
| **미진열여부** | isDisplayed | boolean |
| **미입고여부** | includeUnreceivedQuantity | boolean |
| **재고연동여부** | useStockSync | boolean |
| **옵션합포방지** | preventOptionCombination | boolean |

---

## 🚀 React에서 사용 예시

```typescript
// 1. 목업 데이터 생성
const generator = new InventoryDataGenerator()
const inventoryData = generator.generateInventoryData(500)

// 2. 필터 상태
interface FilterState {
  searchTerm: string
  selectedCategory: string[]
  selectedBrand: string[]
  quantityRange: [number, number]
  dateRange: [Date, Date]
  // ... 기타 필터
}

// 3. 필터링 로직
const filterInventory = (
  data: InventoryItem[],
  filters: FilterState
): InventoryItem[] => {
  return data.filter(item => {
    // 검색어 필터
    if (filters.searchTerm && !item.productName.includes(filters.searchTerm)) {
      return false
    }
    
    // 카테고리 필터
    if (filters.selectedCategory.length > 0 && 
        !filters.selectedCategory.includes(item.category)) {
      return false
    }
    
    // 재고량 범위 필터
    if (item.quantity < filters.quantityRange[0] || 
        item.quantity > filters.quantityRange[1]) {
      return false
    }
    
    // 날짜 범위 필터
    if (item.productRegistrationDate < filters.dateRange[0] || 
        item.productRegistrationDate > filters.dateRange[1]) {
      return false
    }
    
    return true
  })
}

// 4. React 컴포넌트
export function InventoryPage() {
  const [filters, setFilters] = useState<FilterState>({})
  const [data] = useState(() => inventoryData)
  const filteredData = useMemo(() => filterInventory(data, filters), [data, filters])
  
  return (
    <div>
      {/* 필터 UI */}
      <FilterPanel onFilterChange={setFilters} />
      
      {/* 결과 테이블 */}
      <InventoryTable data={filteredData} />
    </div>
  )
}
```

---

## 📁 파일 구조

```
project/
├── data/
│  ├── mockData.ts                 // 목업 데이터 생성 함수
│  ├── inventory.json              // JSON 형식 목업 데이터
│  └── types.ts                    // TypeScript 인터페이스
├── hooks/
│  ├── useInventoryFilter.ts       // 필터링 로직 훅
│  └── useInventoryData.ts         // 데이터 가져오기 훅
├── components/
│  ├── FilterPanel.tsx             // 필터 UI
│  ├── InventoryTable.tsx          // 재고 테이블
│  └── InventoryPage.tsx           // 페이지 컴포넌트
└── pages/
   └── inventory.tsx               // 페이지 라우트
```

---

## 💾 데이터 저장 방법 (3가지)

### 방법 A: 메모리 기반 (개발용)
```typescript
const mockData = generator.generateInventoryData(500)
// 성능: 매우 빠름 ⭐⭐⭐⭐⭐
// 확장성: 낮음 ⭐
// 사용 시점: 초기 개발, 테스트
```

### 방법 B: LocalStorage 기반
```typescript
localStorage.setItem('inventory', JSON.stringify(mockData))
const data = JSON.parse(localStorage.getItem('inventory') || '[]')
// 성능: 빠름 ⭐⭐⭐⭐
// 확장성: 제한적 ⭐⭐
// 사용 시점: 프로토타입, 데모
```

### 방법 C: 서버 API 기반 (프로덕션)
```typescript
// Frontend
const { data, loading } = useFetch('/api/inventory')

// Backend (Node.js)
app.get('/api/inventory', (req, res) => {
  const inventory = db.inventory.findMany()
  res.json(inventory)
})
// 성능: 네트워크에 따름 ⭐⭐⭐
// 확장성: 높음 ⭐⭐⭐⭐⭐
// 사용 시점: 프로덕션
```

---

## ✅ 추천 사항

### 단계별 데이터 구성 전략

**Phase 1 (개발 초기 - 1주)**
```
메모리 기반 목업 데이터
└─ generator.generateInventoryData(500)
```

**Phase 2 (필터 개발 - 2주)**
```
LocalStorage 목업 데이터
└─ 필터 로직 테스트에 용이
```

**Phase 3 (UI 통합 - 3주)**
```
API 기반 (목업 백엔드)
└─ json-server 또는 MSW (Mock Service Worker) 사용
```

**Phase 4 (프로덕션 - 4주+)**
```
실제 데이터베이스
└─ Prisma + PostgreSQL/MySQL
```

---

**데이터 선택:** 목업 데이터로 충분  
**생성 방법:** TypeScript 클래스 권장  
**데이터량:** 500~1000개 (필터 테스트용)  
**확장성:** 실제 API와 호환되도록 설계  
**파일 크기:** ~2-5MB (JSON 형식)

