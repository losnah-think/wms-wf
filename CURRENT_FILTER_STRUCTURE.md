# 기존 시스템 필터 구조 상세 분석

> 📸 이미지에서 확인된 기존 시스템의 필터 구조를 상세 정리한 문서입니다.

---

## 📋 필터 레이아웃 구조

### 좌측 사이드바 (필터 카테고리)

```
├─ 검색 (맨 위)
├─ 기준
├─ 공급처분류
├─ 공급처상세
├─ 상품
├─ 상품등록일자
├─ 품절 or 입고예정일설정일자
├─ 입고예정일
├─ 재고
├─ 상품게시일
├─ 미주문기간
├─ 제고수량범위
├─ 윤선현금액범위
└─ 제고금액범위
```

**총 14개 카테고리**

---

## 🔍 각 필터 상세 구조

### 1️⃣ **상단 검색바 (Unified Search)**

```
┌─────────────────────────────────────┐
│ 통합검색 ▼  │  공급 검색 추가  │ AND │ 확장필터 ▼
└─────────────────────────────────────┘
```

| 항목 | 설명 |
|------|------|
| 통합검색 | 드롭다운으로 검색 타입 선택 |
| 공급 검색 추가 | 추가 조건 추가 버튼 (+ 아이콘) |
| AND | 검색 조건 연결 (AND/OR) |
| 확장필터 | 고급 필터 토글 |

---

### 2️⃣ **기준 필터**

```
기준
├─ 전체 기준 ▼  (현재: 전체 기준)
├─ 제고기준일     (날짜 입력: 2025-11-08)
└─ 시재정가 미포함 (드롭다운)
```

| 필터명 | 타입 | 기본값 |
|--------|------|--------|
| 전체 기준 | Dropdown | 전체 기준 |
| 제고기준일 | DatePicker | 2025-11-08 |
| 시재정가 미포함 | Dropdown | - |

---

### 3️⃣ **공급처분류 필터**

```
공급처분류
├─ 공급처분류 ▼ (드롭다운)
└─ [선택된공급처] ✕ [보조공급처명] ✕
```

| 필터명 | 타입 | 상태 |
|--------|------|------|
| 공급처분류 | MultiTag Select | 선택/제거 가능 |
| 선택된 태그 | Tags | 클릭으로 제거 |

---

### 4️⃣ **공급처상세 필터**

```
공급처상세
└─ (입력창) - 검색어 입력
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 공급처상세 | Text Input | 상세 검색어 입력 |

---

### 5️⃣ **상품 필터 (복합)**

#### 5-1) 상품분류
```
상품
├─ 상품분류 ▼ (다중선택 가능)
│  └─ "상품 태그 입력 후 엔터 키를 눌러 추가하세요."
├─ 상품위치 (다중선택)
├─ 관리등급 (전체상품)
├─ 등록자 (전체상품)
├─ 판매상태 (전체품절여부)
├─ 브랜드 (다중선택)
├─ 상품연도 (다중선택)
└─ 상품시즌 (다중선택)
```

#### 5-2) 상세 필터들

| 필터명 | 타입 | 옵션 |
|--------|------|------|
| 상품분류 | MultiSelect | 다중 선택 가능 |
| 상품위치 | MultiSelect | 다중 선택 가능 |
| 관리등급 | Dropdown | 전체상품 |
| 등록자 | Dropdown | 전체상품 |
| 판매상태 | Dropdown | 전체품절여부 |
| 브랜드 | MultiSelect | 다중 선택 가능 |
| 상품연도 | Dropdown | 연도 선택 |
| 상품시즌 | Dropdown | 시즌 선택 |

#### 5-3) 상품 태그
```
상품 태그 입력 후 엔터 키를 눌러 추가하세요.
└─ [Tag1] ✕ [Tag2] ✕ [Tag3] ✕
```

---

### 6️⃣ **상품등록일자 필터**

```
상품등록일자
├─ 전체 ▼
├─ 2025-11-01  -  2025-11-08  (DateRange)
└─ "선택 태그 입력 후 엔터 키 눌러 추가하세요."
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 기간 선택 | Dropdown | 전체/사용자정의 |
| 시작일 | DatePicker | 2025-11-01 |
| 종료일 | DatePicker | 2025-11-08 |

---

### 7️⃣ **최종수정일 필터**

```
최종수정일
├─ 전체 ▼
└─ 2025-11-01  -  2025-11-08
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 기간 선택 | Dropdown | 전체/사용자정의 |
| 날짜 범위 | DateRange | 시작~종료 |

---

### 8️⃣ **품절 or 입고예정일 설정일자**

```
품절 or 입고예정일설정일자
├─ 전체 ▼
└─ 2025-11-01  -  2025-11-08
```

주의: 설정한 날짜의 품절일자에 해당하는 상품과 입고예정일설정일자에 해당하는 상품이 함께 검색됨

---

### 9️⃣ **품절일자 필터**

```
품절일자
├─ 전체 ▼
└─ 2025-11-01  -  2025-11-08
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 기간 선택 | Dropdown | 전체/사용자정의 |
| 날짜 범위 | DateRange | 품절 예정 날짜 |

---

### 🔟 **입고예정일 설정일자**

```
입고예정일설정일자
├─ 전체 ▼
└─ 2025-11-07  -  2025-11-07
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 기간 선택 | Dropdown | 전체/사용자정의 |
| 날짜 범위 | DateRange | 입고 설정 날짜 |

---

### 1️⃣1️⃣ **입고예정일 필터**

```
입고예정일
├─ 전체 ▼
└─ 2025-11-07  -  2025-11-07
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 기간 선택 | Dropdown | 전체/사용자정의 |
| 날짜 범위 | DateRange | 실제 입고 예정 날짜 |

---

### 1️⃣2️⃣ **재고 관련 필터** (우측 상단)

```
확장필터 ▼
├─ 최종수정일
│  └─ 전체 ▼  |  2025-11-08 - 2025-11-08
│
├─ 품절예정일
│  └─ 전체 ▼  |  2025-11-08 - 2025-11-08
│
├─ 입고예정일
│  └─ 전체 ▼  |  2025-11-08 - 2025-11-08
│
├─ (구분) 
│  └─ 최종수정일
│     조회 ▼  |  전체 ▼  |  2025-11-08 - 2025-11-08
│
├─ 품절예정일
│  └─ 전체 ▼  |  2025-11-01 - 2025-11-08
│
└─ 입고예정일
   └─ 전체 ▼  |  2025-11-08 - 2025-11-08
```

---

### 1️⃣3️⃣ **상품게시일 필터**

```
상품게시일
├─ 전체 ▼
└─ 2025-11-08  -  2025-11-08
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 기간 선택 | Dropdown | 전체/사용자정의 |
| 날짜 범위 | DateRange | 게시 날짜 |

---

### 1️⃣4️⃣ **미주문기간 필터**

```
미주문기간
├─ 선택없음 ▼
└─ 2025-11-07  -  2025-11-07
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 기간 기준 | Dropdown | 선택없음/사용자정의 |
| 날짜 범위 | DateRange | 미주문 기간 |

---

### 1️⃣5️⃣ **재고수량범위 필터**

```
재고수량범위
├─ 전체 ▼
└─ 0 개 - 0 개
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 범위 유형 | Dropdown | 전체/사용자정의 |
| 최소값 | NumberInput | 0개 |
| 최대값 | NumberInput | 0개 |

---

### 1️⃣6️⃣ **옵션판매금액범위 필터**

```
옵션판매금액범위
├─ 전체 ▼ (판매금액: 0 원 - 0 원)
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 범위 유형 | Dropdown | 전체/사용자정의 |
| 최소 금액 | CurrencyInput | 0원 |
| 최대 금액 | CurrencyInput | 0원 |

---

### 1️⃣7️⃣ **재고금액범위 필터**

```
재고금액범위
├─ 전체 ▼ (재고금액: 0 원 - 0 원)
```

| 필터명 | 타입 | 설명 |
|--------|------|------|
| 범위 유형 | Dropdown | 전체/사용자정의 |
| 최소 금액 | CurrencyInput | 0원 |
| 최대 금액 | CurrencyInput | 0원 |

---

## 📊 전체 필터 통계

| 타입 | 개수 |
|------|------|
| **Dropdown** | 12개 |
| **DateRange** | 9개 |
| **MultiSelect** | 6개 |
| **Text Input** | 2개 |
| **Number Range** | 2개 |
| **Currency Range** | 2개 |
| **Tag Input** | 2개 |
| **Checkbox** | 5개 (우측 체크박스들) |
| **전체** | **40개+** |

---

## 🏗️ 우측 상단 필터 상세

### 확장 필터 섹션

```
우측 상단 (접히고 펼쳐지는 구조)
│
├─ 📆 최종수정일
│  ├─ Dropdown: [조회 ▼]
│  ├─ Dropdown: [전체 ▼]
│  └─ DateRange: 2025-11-08 - 2025-11-08
│
├─ 📆 품절예정일
│  ├─ Dropdown: [조회 ▼]
│  ├─ Dropdown: [전체 ▼]
│  └─ DateRange: 2025-11-08 - 2025-11-08
│
├─ 📆 입고예정일
│  ├─ Dropdown: [조회 ▼]
│  ├─ Dropdown: [전체 ▼]
│  └─ DateRange: 2025-11-08 - 2025-11-08
│
├─ 📆 (중복 섹션)
│  ├─ Dropdown: [전체 ▼]
│  └─ DateRange: 2025-11-08 - 2025-11-08
│
├─ 📆 품절예정일
│  ├─ Dropdown: [전체 ▼]
│  └─ DateRange: 2025-11-01 - 2025-11-08
│
└─ 📆 입고예정일
   ├─ Dropdown: [전체 ▼]
   └─ DateRange: 2025-11-08 - 2025-11-08
```

---

## 🎯 필터 흐름도

```
사용자 입력
    ↓
상단 검색바 (통합검색/공급처검색)
    ↓
AND 조건 설정
    ↓
확장필터 토글
    ↓
좌측 사이드바 (기본 필터들)
    │
    ├─ 기준 필터
    ├─ 공급처 필터
    ├─ 상품 필터
    ├─ 날짜 필터 (등록/수정/품절/입고)
    └─ 재고/가격 범위 필터
    ↓
우측 상단 (확장 필터 - 펼쳐질 때)
    │
    ├─ 추가 날짜 필터들
    └─ 더 상세한 검색 조건
    ↓
검색 버튼 클릭
    ↓
결과 테이블 (하단 표시 안 함)
```

---

## ✅ 고객사 요구사항

### 🎯 결정사항

**고객사에서 40개+ 필터 모두 필요하다고 확인됨**

- ✅ 모든 필터를 유지해야 함
- ✅ 필터 축소/통합 불가
- ✅ 기존 시스템과 동일한 구조 유지 필요
- ✅ 사용자 학습 필요 없음 (기존 사용자들이 익숙함)

### 📋 구현 계획

| 단계 | 내용 | 난이도 |
|------|------|--------|
| Phase 1 | 기본 필터 (기준, 공급처) | ⭐ 낮음 |
| Phase 2 | 상품 필터 (분류, 브랜드 등) | ⭐⭐ 낮음 |
| Phase 3 | 날짜 필터 (9개) | ⭐⭐⭐ 중간 |
| Phase 4 | 범위 필터 (수량, 가격) | ⭐⭐⭐ 중간 |
| Phase 5 | 우측 확장필터 | ⭐⭐⭐⭐ 높음 |
| Phase 6 | UI/UX 최적화 | ⭐⭐⭐⭐ 높음 |

---

## 🔧 상세 구현 가이드

### Phase 1: 기본 필터 구현

#### 1-1) 상단 검색바

```tsx
interface SearchConfig {
  searchType: 'integrated' | 'supplier' // 통합검색 vs 공급처검색
  searchValue: string
  operator: 'AND' | 'OR'
  expandedFilters: boolean
}

// 구현 요소
- 통합검색 Dropdown (종류 선택)
- 공급처 검색 추가 버튼 (+)
- AND/OR 토글
- 확장필터 토글 (▼)
```

#### 1-2) 기준 필터

```tsx
interface BasisFilter {
  basisType: string           // 기준 유형 (Dropdown)
  stockBasisDate: Date        // 제고기준일 (DatePicker)
  excludeCurrentPrice: boolean // 시재정가 미포함 (Checkbox)
}

// 상태값 예시
{
  basisType: 'entire',
  stockBasisDate: '2025-11-08',
  excludeCurrentPrice: false
}
```

#### 1-3) 공급처 필터

```tsx
interface SupplierFilter {
  supplierCategory: string[]  // 공급처분류 (MultiSelect with Tags)
  supplierDetail: string      // 공급처상세 (Text Input)
}

// 상태값 예시
{
  supplierCategory: ['선택된공급처', '보조공급처명'],
  supplierDetail: '검색어'
}
```

---

### Phase 2: 상품 필터 구현

```tsx
interface ProductFilter {
  categories: string[]         // 상품분류 (MultiSelect)
  locations: string[]          // 상품위치 (MultiSelect)
  managementLevel: string      // 관리등급 (Dropdown)
  registeredBy: string         // 등록자 (Dropdown)
  saleStatus: string          // 판매상태 (Dropdown)
  brands: string[]            // 브랜드 (MultiSelect)
  years: string[]             // 상품연도 (MultiSelect)
  seasons: string[]           // 상품시즌 (MultiSelect)
  tags: string[]              // 상품 태그 (Tag Input)
}

// 상태값 예시
{
  categories: [],
  locations: [],
  managementLevel: '전체상품',
  registeredBy: '전체상품',
  saleStatus: '전체품절여부',
  brands: [],
  years: [],
  seasons: [],
  tags: ['Tag1', 'Tag2']
}
```

---

### Phase 3: 날짜 필터 구현 (9개)

```tsx
interface DateFilter {
  // 상품 관련 날짜
  productRegistrationDate: {
    type: 'entire' | 'custom'
    range: [Date, Date]
  }
  
  // 수정 관련 날짜
  finalModificationDate: {
    type: 'entire' | 'custom'
    range: [Date, Date]
  }
  
  // 품절 관련 날짜
  soldOutOrPODate: {
    type: 'entire' | 'custom'
    range: [Date, Date]
  }
  soldOutDate: {
    type: 'entire' | 'custom'
    range: [Date, Date]
  }
  
  // 입고 관련 날짜
  poSettingDate: {
    type: 'entire' | 'custom'
    range: [Date, Date]
  }
  poDate: {
    type: 'entire' | 'custom'
    range: [Date, Date]
  }
  
  // 기타 날짜
  productPublishDate: {
    type: 'entire' | 'custom'
    range: [Date, Date]
  }
  
  nonOrderPeriod: {
    type: 'none' | 'custom'
    range: [Date, Date]
  }
}

// 상태값 예시
{
  productRegistrationDate: {
    type: 'custom',
    range: ['2025-11-01', '2025-11-08']
  },
  finalModificationDate: {
    type: 'custom',
    range: ['2025-11-07', '2025-11-08']
  },
  // ... 나머지 날짜들
}
```

---

### Phase 4: 범위 필터 구현

```tsx
interface RangeFilter {
  // 수량 범위
  stockQuantityRange: {
    type: 'entire' | 'custom'
    min: number
    max: number
  }
  
  // 금액 범위들
  optionSalePrice: {
    type: 'entire' | 'custom'
    min: number
    max: number
  }
  
  stockPrice: {
    type: 'entire' | 'custom'
    min: number
    max: number
  }
}

// 상태값 예시
{
  stockQuantityRange: {
    type: 'custom',
    min: 0,
    max: 1000
  },
  optionSalePrice: {
    type: 'custom',
    min: 0,
    max: 500000
  },
  stockPrice: {
    type: 'custom',
    min: 0,
    max: 1000000
  }
}
```

---

### Phase 5: 우측 확장필터 구현

```tsx
interface ExpandedFilters {
  // 좌측과 동일한 날짜 필터들 (우측에 별도 표시)
  finalModificationDate: DateRangeConfig
  soldOutDate: DateRangeConfig
  poDate: DateRangeConfig
  
  // 추가 검색 조건
  checkboxOptions: {
    hasShippingHistory: boolean
    excludeUndisplayed: boolean
    includeUnreceivedQuantity: boolean
    useStockSync: boolean
    preventOptionCombination: boolean
  }
}

// 상태값 예시
{
  finalModificationDate: { type: 'custom', range: [...] },
  soldOutDate: { type: 'custom', range: [...] },
  poDate: { type: 'custom', range: [...] },
  checkboxOptions: {
    hasShippingHistory: false,
    excludeUndisplayed: false,
    includeUnreceivedQuantity: true,
    useStockSync: false,
    preventOptionCombination: true
  }
}
```

---

### Phase 6: UI/UX 구조

```
┌─────────────────────────────────────────────────────┐
│ 상단: 통합검색 / 공급처검색 + AND/OR + 확장필터   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  좌측 사이드바 (scroll)          우측 (토글 시 표시) │
│  ┌──────────────────┐           ┌──────────────────┐│
│  │ ▼ 기준           │           │ 추가 날짜 필터   ││
│  │ ▼ 공급처분류     │           │ + 체크박스       ││
│  │ ▼ 공급처상세     │           └──────────────────┘│
│  │ ▼ 상품           │                               │
│  │ ▼ 상품등록일자   │           [검색] [초기화]      │
│  │ ▼ 최종수정일     │                               │
│  │ ▼ 품절/입고기간  │                               │
│  │ ▼ 입고예정일     │                               │
│  │ ▼ 재고 체크박스  │                               │
│  │ ▼ 상품게시일     │                               │
│  │ ▼ 미주문기간     │                               │
│  │ ▼ 재고수량범위   │                               │
│  │ ▼ 판매금액범위   │                               │
│  │ ▼ 재고금액범위   │                               │
│  └──────────────────┘                               │
├─────────────────────────────────────────────────────┤
│ 검색 결과 테이블                                     │
│ (상품코드, 상품명, 카테고리, 브랜드, 수량 등)      │
└─────────────────────────────────────────────────────┘
```

---

### 전체 필터 상태 관리 (Global State)

```tsx
interface CompleteFilterState {
  // 검색 설정
  search: SearchConfig
  
  // 기본 필터
  basis: BasisFilter
  supplier: SupplierFilter
  
  // 상품 필터
  product: ProductFilter
  
  // 날짜 필터
  dates: DateFilter
  
  // 범위 필터
  ranges: RangeFilter
  
  // 우측 확장필터
  expanded: ExpandedFilters
  
  // UI 상태
  ui: {
    showExpandedFilters: boolean
    currentPage: number
    pageSize: number
    sortBy: string
  }
}
```

---

### 검색 실행 로직

```tsx
function buildFilterQuery(filters: CompleteFilterState): QueryParams {
  const query: QueryParams = {
    // 기본 필터
    basisType: filters.basis.basisType,
    stockBasisDate: filters.basis.stockBasisDate,
    excludeCurrentPrice: filters.basis.excludeCurrentPrice,
    
    // 공급처
    supplierCategories: filters.supplier.supplierCategory,
    supplierDetail: filters.supplier.supplierDetail,
    
    // 상품
    productCategories: filters.product.categories,
    brands: filters.product.brands,
    years: filters.product.years,
    seasons: filters.product.seasons,
    tags: filters.product.tags,
    
    // 날짜 범위들
    productRegDateFrom: filters.dates.productRegistrationDate.range[0],
    productRegDateTo: filters.dates.productRegistrationDate.range[1],
    
    // ... 모든 날짜 필터
    
    // 범위
    quantityMin: filters.ranges.stockQuantityRange.min,
    quantityMax: filters.ranges.stockQuantityRange.max,
    priceMin: filters.ranges.optionSalePrice.min,
    priceMax: filters.ranges.optionSalePrice.max,
    
    // 확장필터
    ...filters.expanded.checkboxOptions,
    
    // 페이지네이션
    page: filters.ui.currentPage,
    pageSize: filters.ui.pageSize,
    sortBy: filters.ui.sortBy
  }
  
  return query
}
```

---

## 📋 구현 체크리스트

### Phase 1: 기본 필터
- [ ] 상단 검색바 UI
- [ ] 기준 필터 로직
- [ ] 공급처 필터 로직
- [ ] 상태 관리 (Redux/Context)

### Phase 2: 상품 필터
- [ ] 카테고리 MultiSelect
- [ ] 브랜드 MultiSelect
- [ ] 연도/시즌 필터
- [ ] 태그 입력 기능

### Phase 3: 날짜 필터 (9개)
- [ ] 상품등록일자
- [ ] 최종수정일
- [ ] 품절/입고예정일
- [ ] 입고예정일 설정일자
- [ ] 입고예정일
- [ ] 상품게시일
- [ ] 미주문기간
- [ ] DateRange 컴포넌트 재사용

### Phase 4: 범위 필터
- [ ] 재고수량범위
- [ ] 판매금액범위
- [ ] 재고금액범위
- [ ] Range 입력 검증

### Phase 5: 우측 확장필터
- [ ] 토글 버튼
- [ ] 추가 날짜 필터 표시
- [ ] 체크박스 옵션들
- [ ] 레이아웃 조정

### Phase 6: 검색 및 결과
- [ ] 검색 API 연동
- [ ] 결과 테이블 표시
- [ ] 페이지네이션
- [ ] 정렬 기능
- [ ] 검색 결과 개수 표시

---

## 🎯 성능 최적화

```tsx
// 1. 필터 변경 시 debounce 적용
const handleFilterChange = useCallback(
  debounce((filterKey: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }))
  }, 300),
  []
)

// 2. 필터 결과 memoization
const filteredResults = useMemo(
  () => applyFilters(allData, filters),
  [allData, filters]
)

// 3. 가상 스크롤링 (결과가 많을 경우)
<VirtualScroll
  dataSource={filteredResults}
  itemHeight={50}
  height={600}
/>
```

---

**최종 결정:** 고객사 요구에 따라 40개+ 필터 모두 구현  
**타겟 배포:** 2025년 11월~12월  
**예상 작업량:** Phase별 2주씩, 총 12주 (3개월)


---

## 📌 필터 우선순위 (추천)

| 우선순위 | 필터명 | 사용빈도 |
|---------|--------|---------|
| ⭐⭐⭐⭐⭐ | 통합검색 | 매우 높음 |
| ⭐⭐⭐⭐⭐ | 기준 날짜 | 매우 높음 |
| ⭐⭐⭐⭐ | 상품분류 | 높음 |
| ⭐⭐⭐⭐ | 재고수량범위 | 높음 |
| ⭐⭐⭐ | 공급처 | 중간 |
| ⭐⭐⭐ | 브랜드 | 중간 |
| ⭐⭐ | 입고예정일 | 낮음 |
| ⭐⭐ | 미주문기간 | 낮음 |
| ⭐ | 상품시즌 | 매우 낮음 |
| ⭐ | 상품연도 | 매우 낮음 |

---

**이미지 분석 완료:** 2025년 11월 8일  
**필터 개수:** 40개+  
**권장 개선안:** 20개로 감소, 우선순위 정렬  
**구현 난이도:** ⭐⭐⭐⭐ (높음 - 기존 시스템 변경)
