# 재고 현황 (Stock-Status) 페이지 데이터 스키마

> 📊 재고 현황 페이지 4개의 데이터 인터페이스와 테이블 구조를 정리한 문서입니다.

---

## 📑 목차

1. [상품별 현황 (by-product)](#1-상품별-현황-by-product)
2. [옵션별 현황 (by-option)](#2-옵션별-현황-by-option)
3. [창고별 현황 (by-warehouse)](#3-창고별-현황-by-warehouse)
4. [로케이션별 현황 (by-location)](#4-로케이션별-현황-by-location)
5. [데이터 통계 비교](#-데이터-통계-비교)
6. [KPI 카드 구성](#-kpi-카드-구성)

---

## 1️⃣ 상품별 현황 (by-product)

**파일:** `/app/[locale]/stock-status/by-product/page.tsx`

### 📋 데이터 인터페이스

```typescript
interface StockItem {
  id: number                                         // 고유 ID (1 ~ 100)
  productName: string                               // 상품명 (예: "LCD 모니터 24"")
  optionName: string                                // 옵션명 (예: "검정색", "32GB")
  quantity: number                                  // 재고량 (10 ~ 5010개)
  productCode: string                               // 상품코드 (PROD-00001 형식, 5자리)
  category: string                                  // 카테고리 (전자기기, 문구용품, 액세서리, 컴퓨터 부품, IT용품)
  barcode: string                                   // 바코드 (880로 시작, 총 15자리)
  brand: string                                     // 브랜드 (LG, 삼성, 소니, ANKER, 3M, HP, DELL, Apple, Microsoft, ASUS)
  price: number                                     // 가격 (5,000 ~ 305,000원)
  status: 'in_stock' | 'low_stock' | 'out_of_stock'  // 상태 (quantity > 100 = in_stock, > 20 = low_stock)
  statusText: string                                // 상태 텍스트 ("재고충분", "적은재고", "품절")
  warehouse: string                                 // 창고명 (서울/부산/인천/대구/광주 센터)
}
```

### 📊 테이블 컬럼 구성 (9개)

| # | 컬럼명 | 필드명 | 너비 | 데이터 타입 | 렌더 포맷 | 정렬 |
|---|--------|--------|------|-----------|---------|------|
| 1 | 상품명 | productName | 12% | string | 텍스트 | - |
| 2 | 옵션명 | optionName | 10% | string | 텍스트 | - |
| 3 | 재고량 | quantity | 8% | number | `${text}개` | - |
| 4 | 상품코드 | productCode | 10% | string | 텍스트 | - |
| 5 | 카테고리 | category | 10% | string | 텍스트 | - |
| 6 | 바코드 | barcode | 11% | string | 텍스트 | - |
| 7 | 브랜드 | brand | 8% | string | 텍스트 | - |
| 8 | 가격 | price | 10% | number | `${text.toLocaleString()}원` | - |
| 9 | 상태 | status | 10% | enum | Tag (green/orange/red) | - |

### 🔄 상태 태그 색상

| 상태 | 컬러 | 조건 |
|------|------|------|
| 재고충분 | 🟢 green | quantity > 100 |
| 적은재고 | 🟠 orange | 20 < quantity ≤ 100 |
| 품절 | 🔴 red | quantity ≤ 20 |

### 📈 데이터 생성 규칙

```typescript
const generateLargeDataset = (): StockItem[] => {
  // 상품 목록 (10개)
  const products = ['LCD 모니터', 'LED 불투명 테이프', 'USB-C 케이블', 'HDMI 케이블', 
                    'SSD 1TB', '무선 마우스', '기계식 키보드', 'USB 허브', 
                    '화면 보호 필름', '노트북 스탠드']
  
  // 옵션 목록 (11개)
  const options = ['검정색', '흰색', '은색', '빨강', '파랑', '32GB', '64GB', 
                   '128GB', '1M', '2M', '3M']
  
  // 카테고리 (5개)
  const categories = ['전자기기', '문구용품', '액세서리', '컴퓨터 부품', 'IT용품']
  
  // 브랜드 (10개)
  const brands = ['LG', '삼성', '소니', 'ANKER', '3M', 'HP', 'DELL', 'Apple', 'Microsoft', 'ASUS']
  
  // 창고 (5개)
  const warehouses = ['서울 센터', '부산 센터', '인천 센터', '대구 센터', '광주 센터']
  
  // 100개 데이터 생성
  for (let i = 0; i < 100; i++) {
    // ...
  }
}
```

### 🎯 사용 사례

상품 수준의 재고 현황을 확인할 때 사용. 모든 옵션을 포함한 상품별 재고량, 가격, 브랜드 정보를 한눈에 파악 가능.

---

## 2️⃣ 옵션별 현황 (by-option)

**파일:** `/app/[locale]/stock-status/by-option/page.tsx`

### 📋 데이터 인터페이스

```typescript
interface OptionStockItem {
  id: number                                         // 고유 ID (1 ~ 100)
  productName: string                               // 상품명 (예: "LCD 모니터 24"")
  optionName: string                                // 옵션명 (예: "검정색", "32GB")
  quantity: number                                  // 재고량 (5 ~ 3005개)
  optionCode: string                                // 옵션코드 (OPT-00001 형식, 5자리)
  category: string                                  // 카테고리
  barcode: string                                   // 바코드 (880으로 시작)
  brand: string                                     // 브랜드
  price: number                                     // 가격 (10,000 ~ 260,000원)
  status: 'in_stock' | 'low_stock' | 'out_of_stock'  // 상태 (quantity > 50 = in_stock, > 10 = low_stock)
  statusText: string                                // 상태 텍스트 ("재고충분", "적은재고", "품절")
}
```

### 📊 테이블 컬럼 구성 (9개)

| # | 컬럼명 | 필드명 | 너비 | 데이터 타입 | 렌더 포맷 | 정렬 |
|---|--------|--------|------|-----------|---------|------|
| 1 | 상품명 | productName | 12% | string | 텍스트 | - |
| 2 | 옵션 | optionName | 10% | string | 텍스트 | - |
| 3 | 재고량 | quantity | 8% | number | `${text}개` | - |
| 4 | 옵션코드 | optionCode | 10% | string | 텍스트 | - |
| 5 | 카테고리 | category | 12% | string | 텍스트 | - |
| 6 | 바코드 | barcode | 12% | string | 텍스트 | - |
| 7 | 브랜드 | brand | 10% | string | 텍스트 | - |
| 8 | 가격 | price | 10% | number | `${text.toLocaleString()}원` | - |
| 9 | 상태 | status | 10% | enum | Tag (green/orange/red) | - |

### 🔄 상태 태그 색상

| 상태 | 컬러 | 조건 |
|------|------|------|
| 재고충분 | 🟢 green | quantity > 50 |
| 적은재고 | 🟠 orange | 10 < quantity ≤ 50 |
| 품절 | 🔴 red | quantity ≤ 10 |

### 📈 데이터 생성 규칙

```typescript
const generateOptionDataset = (): OptionStockItem[] => {
  // 상품 목록 (7개) - 더 적은 수
  const products = ['LCD 모니터 24"', 'LED 불투명 테이프', 'USB-C 케이블', 
                    'HDMI 케이블', 'SSD 1TB', '무선 마우스', '기계식 키보드']
  
  // 옵션 타입 (11개)
  const optionTypes = ['검정색', '흰색', '은색', '빨강', '파랑', '32GB', '64GB', 
                       '128GB', '1M', '2M', '3M']
  
  // 카테고리, 브랜드 등은 동일
  
  // 100개 데이터 생성
  for (let i = 0; i < 100; i++) {
    // ...
  }
}
```

### 🎯 사용 사례

옵션 수준의 재고 현황을 확인할 때 사용. 특정 옵션(색상, 용량 등)별 재고량과 판매 가격을 비교 분석할 때 유용.

---

## 3️⃣ 창고별 현황 (by-warehouse)

**파일:** `/app/[locale]/stock-status/by-warehouse/page.tsx`

### 📋 데이터 인터페이스

```typescript
interface WarehouseStockItem {
  id: number                                         // 고유 ID (1 ~ 100)
  warehouseName: string                             // 창고명 (서울 본점, 인천 2창고 등)
  quantity: number                                  // 현재재고 (5 ~ 3005개)
  capacity: number                                  // 용량 (1,000 ~ 6,000개)
  zone: string                                      // 존 (A, B, C, D, E - 5개)
  location: string                                  // 로케이션 (A-001 형식, 3자리)
  lastUpdated: string                               // 마지막 업데이트 (날짜, YYYY.MM.DD 형식)
  status: 'in_stock' | 'low_stock' | 'out_of_stock'  // 상태 (quantity > 500 = in_stock, > 100 = low_stock)
  statusText: string                                // 상태 텍스트 ("충분", "부족", "없음")
}
```

### 📊 테이블 컬럼 구성 (7개)

| # | 컬럼명 | 필드명 | 너비 | 데이터 타입 | 렌더 포맷 | 정렬 |
|---|--------|--------|------|-----------|---------|------|
| 1 | 창고명 | warehouseName | 15% | string | 텍스트 | - |
| 2 | 현재재고 | quantity | 10% | number | `${text}개` | - |
| 3 | 용량 | capacity | 10% | number | `${text}개` | - |
| 4 | 존 | zone | 8% | string | 텍스트 | - |
| 5 | 로케이션 | location | 12% | string | 텍스트 | - |
| 6 | 마지막 업데이트 | lastUpdated | 15% | string (date) | 날짜 텍스트 | - |
| 7 | 상태 | status | 12% | enum | Tag (green/orange/red) | - |

### 🔄 상태 태그 색상

| 상태 | 컬러 | 조건 |
|------|------|------|
| 충분 | 🟢 green | quantity > 500 |
| 부족 | 🟠 orange | 100 < quantity ≤ 500 |
| 없음 | 🔴 red | quantity ≤ 100 |

### 📈 데이터 생성 규칙

```typescript
const generateWarehouseDataset = (): WarehouseStockItem[] => {
  // 창고 목록 (5개)
  const warehouses = ['서울 본점', '인천 2창고', '대구 3창고', '부산 4창고', '광주 5창고']
  
  // 존 목록 (5개)
  const zones = ['A', 'B', 'C', 'D', 'E']
  
  // 100개 데이터 생성
  for (let i = 0; i < 100; i++) {
    const warehouse = warehouses[i % warehouses.length]      // 라운드 로빈
    const zone = zones[Math.floor(i / warehouses.length) % zones.length]
    const quantity = Math.floor(Math.random() * 3000) + 5
    const capacity = Math.floor(Math.random() * 5000) + 1000
    const status = quantity > 500 ? 'in_stock' : quantity > 100 ? 'low_stock' : 'out_of_stock'
  }
}
```

### 🎯 사용 사례

창고 수준의 재고 현황과 용량 관리를 위해 사용. 각 창고별 현재 재고량과 최대 용량 비교로 수용 가능성 파악.

---

## 4️⃣ 로케이션별 현황 (by-location)

**파일:** `/app/[locale]/stock-status/by-location/page.tsx`

### 📋 데이터 인터페이스

```typescript
interface LocationStockItem {
  id: number                                         // 고유 ID (1 ~ 100)
  location: string                                  // 로케이션 (A-01-001 형식)
  zone: string                                      // 존 (A, B, C, D, E)
  shelf: string                                     // 선반 (01, 02, 03... - 2자리)
  quantity: number                                  // 현재재고 (5 ~ 3005개)
  maxCapacity: number                               // 최대용량 (1,000 ~ 6,000개)
  itemCount: number                                 // 상품수 (1 ~ 50개)
  occupancyRate: number                             // 점유율 (0 ~ 100%, quantity/maxCapacity * 100)
  lastUpdated: string                               // 마지막 업데이트 (날짜)
  status: 'in_stock' | 'low_stock' | 'out_of_stock'  // 상태 (occupancyRate > 70 = in_stock)
  statusText: string                                // 상태 텍스트 ("사용중", "부분사용", "미사용")
}
```

### 📊 테이블 컬럼 구성 (9개)

| # | 컬럼명 | 필드명 | 너비 | 데이터 타입 | 렌더 포맷 | 정렬 |
|---|--------|--------|------|-----------|---------|------|
| 1 | 로케이션 | location | 12% | string | 텍스트 | - |
| 2 | 존 | zone | 8% | string | 텍스트 | - |
| 3 | 선반 | shelf | 8% | string | 텍스트 | - |
| 4 | 현재재고 | quantity | 10% | number | `${text}개` | - |
| 5 | 최대용량 | maxCapacity | 10% | number | `${text}개` | - |
| 6 | 상품수 | itemCount | 8% | number | 숫자 | - |
| 7 | 점유율 | occupancyRate | 10% | number | `${text}%` | - |
| 8 | 마지막 업데이트 | lastUpdated | 15% | string (date) | 날짜 텍스트 | - |
| 9 | 상태 | status | 12% | enum | Tag (green/orange/red) | - |

### 🔄 상태 태그 색상

| 상태 | 컬러 | 조건 | 점유율 |
|------|------|------|--------|
| 사용중 | 🟢 green | in_stock | > 70% |
| 부분사용 | 🟠 orange | low_stock | 30% ~ 70% |
| 미사용 | 🔴 red | out_of_stock | < 30% |

### 📈 데이터 생성 규칙

```typescript
const generateLocationDataset = (): LocationStockItem[] => {
  const zones = ['A', 'B', 'C', 'D', 'E']
  
  // 100개 데이터 생성
  for (let i = 0; i < 100; i++) {
    const zone = zones[i % zones.length]
    const shelf = String(Math.floor(i / zones.length) + 1).padStart(2, '0')
    const location = `${zone}-${shelf}-${String(i + 1).padStart(3, '0')}`
    
    const quantity = Math.floor(Math.random() * 3000) + 5
    const maxCapacity = Math.floor(Math.random() * 5000) + 1000
    const itemCount = Math.floor(Math.random() * 50) + 1
    const occupancyRate = Math.round((quantity / maxCapacity) * 100)
    
    // occupancyRate 기반으로 status 결정
    const status = occupancyRate > 70 ? 'in_stock' 
                 : occupancyRate > 30 ? 'low_stock' 
                 : 'out_of_stock'
  }
}
```

### 🎯 사용 사례

로케이션(선반, 구역) 수준의 재고 현황과 용량 활용도를 확인할 때 사용. 점유율 기반으로 공간 최적화 및 재고 배치 관리.

---

## 📊 데이터 통계 비교

### 행 수 및 컬럼 수

| 항목 | by-product | by-option | by-warehouse | by-location |
|------|-----------|-----------|--------------|------------|
| **테이블 컬럼수** | 9개 | 9개 | 7개 | 9개 |
| **데이터 행수** | 100개 | 100개 | 100개 | 100개 |
| **페이지네이션** | 10개/page | 10개/page | 10개/page | 10개/page |

### 데이터 범위 및 기준

| 항목 | by-product | by-option | by-warehouse | by-location |
|------|-----------|-----------|--------------|------------|
| **재고량 범위** | 10 ~ 5,010개 | 5 ~ 3,005개 | 5 ~ 3,005개 | 5 ~ 3,005개 |
| **가격 범위** | 5K ~ 305K원 | 10K ~ 260K원 | - | - |
| **용량 범위** | - | - | 1K ~ 6K개 | 1K ~ 6K개 |
| **상태 기준** | 재고량 | 재고량 | 재고량 | 점유율% |
| **기준값 1** | > 100 | > 50 | > 500 | > 70% |
| **기준값 2** | > 20 | > 10 | > 100 | > 30% |

### 컬럼 특성

| 항목 | by-product | by-option | by-warehouse | by-location |
|------|-----------|-----------|--------------|------------|
| **식별자** | productCode | optionCode | warehouseName | location |
| **수량 필드** | quantity | quantity | quantity | quantity |
| **용량 필드** | - | - | capacity | maxCapacity |
| **추가 정보** | 가격, 바코드, 창고 | 가격, 바코드 | 존, 로케이션, 업데이트 | 선반, 상품수, 점유율 |
| **분류 기준** | 상품별 | 옵션별 | 창고별 | 로케이션별 |

---

## 🎨 KPI 카드 구성

모든 페이지에서 동일한 5개의 KPI 카드를 표시합니다.

### 🎯 KPI 카드별 계산 방식

#### 1️⃣ 총 재고량 (KPI-1) 🟣 보라색 그래디언트

```typescript
const totalQuantity = useMemo(() => 
  data.reduce((sum, item) => sum + item.quantity, 0), 
  [data]
)
```

**조건 없음** - 모든 항목의 재고량 합계

---

#### 2️⃣ 항목 카운트 (KPI-2) 🔵 파란색 그래디언트

**by-product:** 등록상품 (productCount)
```typescript
const productCount = useMemo(() => data.length, [data])
```

**by-option:** 등록옵션 (optionCount)
```typescript
const optionCount = useMemo(() => data.length, [data])
```

**by-warehouse:** 창고수 (warehouseCount)
```typescript
const warehouseCount = useMemo(() => 
  new Set(data.map(item => item.warehouseName)).size, 
  [data]
)
```

**by-location:** 로케이션수 (locationCount)
```typescript
const locationCount = useMemo(() => data.length, [data])
```

---

#### 3️⃣ 저재고/부족 카운트 (KPI-3) 🔴 핑크색 그래디언트

**by-product, by-option:** 저재고상품/옵션 (lowStockCount)
```typescript
const lowStockCount = useMemo(() => 
  data.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length, 
  [data]
)
```

**by-warehouse:** 부족로케이션 (lowStockCount)
```typescript
const lowStockCount = useMemo(() => 
  data.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length, 
  [data]
)
```

**by-location:** 미사용로케이션 (lowStockCount)
```typescript
const lowStockCount = useMemo(() => 
  data.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length, 
  [data]
)
```

---

#### 4️⃣ 총 재고액/용량 (KPI-4) 🟢 초록색 그래디언트

**by-product:** 총 재고액 (totalStockValue)
```typescript
const totalStockValue = useMemo(() => 
  data.reduce((sum, item) => sum + (item.quantity * item.price), 0), 
  [data]
)
// 표시: Math.round(totalStockValue / 100000000) + "억원"
```

**by-option:** 총 재고액 (totalStockValue)
```typescript
const totalStockValue = useMemo(() => 
  data.reduce((sum, item) => sum + (item.quantity * item.price), 0), 
  [data]
)
// 표시: Math.round(totalStockValue / 100000000) + "억원"
```

**by-warehouse:** 총 용량 (totalCapacity)
```typescript
const totalCapacity = useMemo(() => 
  data.reduce((sum, item) => sum + item.capacity, 0), 
  [data]
)
```

**by-location:** 총 용량 (totalMaxCapacity)
```typescript
const totalMaxCapacity = useMemo(() => 
  data.reduce((sum, item) => sum + item.maxCapacity, 0), 
  [data]
)
```

---

#### 5️⃣ 건강도/점유율 (KPI-5) 🟡 노란색 그래디언트

**by-product:** 건강도% (stockHealth)
```typescript
const stockHealth = useMemo(() => {
  const healthyProducts = data.filter(item => item.status === 'in_stock').length
  return Math.round((healthyProducts / productCount) * 100)
}, [data, productCount])
```

**by-option:** 건강도% (stockHealth)
```typescript
const stockHealth = useMemo(() => {
  const healthyOptions = data.filter(item => item.status === 'in_stock').length
  return Math.round((healthyOptions / optionCount) * 100)
}, [data, optionCount])
```

**by-warehouse:** 점유율% (utilizationRate)
```typescript
const utilizationRate = useMemo(() => 
  Math.round((totalQuantity / totalCapacity) * 100), 
  [totalQuantity, totalCapacity]
)
```

**by-location:** 평균 점유율% (averageOccupancy)
```typescript
const averageOccupancy = useMemo(() => 
  Math.round(data.reduce((sum, item) => sum + item.occupancyRate, 0) / data.length), 
  [data]
)
```

---

## 🎨 UI 공통 요소

### KPI 카드 스타일

| KPI | 배경 그래디언트 | RGB 값 |
|-----|----------------|-------|
| KPI-1 (총 수량) | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | 보라~분홍 |
| KPI-2 (항목수) | `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)` | 파랑~하늘 |
| KPI-3 (저재고) | `linear-gradient(135deg, #f5576c 0%, #f093fb 100%)` | 빨강~핑크 |
| KPI-4 (용량/액) | `linear-gradient(135deg, #11998e 0%, #38ef7d 100%)` | 초록~라임 |
| KPI-5 (건강도) | `linear-gradient(135deg, #fa709a 0%, #fee140 100%)` | 핑크~노랑 |

### 테이블 공통 설정

```typescript
<Table
  columns={columns}
  dataSource={data}
  pagination={{ pageSize: 10 }}    // 페이지당 10개 행
  rowKey="id"                        // 행 고유 키
  scroll={{ x: true }}              // 가로 스크롤 가능
/>
```

### Breadcrumb 네비게이션

```typescript
<Breadcrumb items={[
  { title: '재고관리' },
  { title: '재고 현황' },
  { title: '(페이지별 제목)' }
]} />
```

---

## ✅ 체크리스트

### 데이터 정합성

- [x] 모든 페이지 100개 데이터 생성
- [x] 모든 테이블에 상태(status) 필드 포함
- [x] 모든 상태에 색상 태그 적용
- [x] 모든 KPI 재계산 가능 (useMemo 사용)
- [x] 페이지네이션 통일 (10개/page)

### 코드 구조

- [x] useState 제거 (useMemo만 사용)
- [x] Drawer 컴포넌트 제거
- [x] 검색 기능 제거
- [x] 불필요한 import 제거
- [x] 데이터 타입 정리 (필요한 필드만 유지)

### UI/UX

- [x] 5개 KPI 카드 통일
- [x] 그래디언트 배경 일관성
- [x] 반응형 레이아웃 적용
- [x] Breadcrumb 네비게이션 적용
- [x] 테이블 가로 스크롤 지원

---

## 📚 파일 위치

| 페이지 | 파일 경로 |
|--------|---------|
| 상품별 현황 | `/app/[locale]/stock-status/by-product/page.tsx` |
| 옵션별 현황 | `/app/[locale]/stock-status/by-option/page.tsx` |
| 창고별 현황 | `/app/[locale]/stock-status/by-warehouse/page.tsx` |
| 로케이션별 현황 | `/app/[locale]/stock-status/by-location/page.tsx` |

---

## 🔄 관련 문서

- **통계 관리 페이지:** `/STATISTICS_DATA_SCHEMA.md` (상세 분석 데이터)
- **메뉴 구조:** `/lib/navigation.ts` (네비게이션 정의)
- **번역 파일:** `/messages/ko.json`, `/messages/en.json`, `/messages/vi.json`

---

**마지막 업데이트:** 2025년 11월 7일  
**작성자:** GitHub Copilot  
**버전:** 1.0
