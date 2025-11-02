# 페이지 상태 관리 문서

## 개요

이 문서는 WMS 시스템의 7개 활성 페이지에서 사용되는 상태(State) 변수, 데이터 구조, 그리고 주요 계산 로직을 설명합니다.

---

## 📦 1. warehouse-barcode (바코드 생성 및 관리)

### 주요 상태 변수

| 변수명 | 타입 | 설명 | 초기값 |
|--------|------|------|--------|
| `barcodeItems` | `BarcodeItem[]` | 바코드 생성 항목 목록 | `[]` |
| `designSettings` | `DesignSettings` | 용지 및 라벨 디자인 설정 | 객체 |
| `isModalOpen` | `boolean` | 항목 추가 모달 열림 상태 | `false` |

### 데이터 구조

```typescript
interface BarcodeItem {
  id: number
  barcodeNumber: string      // 바코드 번호
  locationName: string       // 위치명
  itemType: string          // 상품 유형
  quantity: number          // 수량
  addedDate: string         // 추가 날짜
}

interface DesignSettings {
  paperSize: string         // A4, B4 등
  paperOrientation: string  // landscape, portrait
  labelWidth: number        // 라벨 너비
  labelHeight: number       // 라벨 높이
  margin: number           // 여백
  fontSize: number         // 글자 크기
}
```

### 주요 핸들러 함수

| 함수명 | 기능 | 입력값 | 반환값 |
|--------|------|--------|--------|
| `handleFileUpload` | Excel 파일 업로드 | File | 바코드 항목 추가 |
| `handleAddItem` | 항목 추가 | Form 값 | 유효성 검사 후 추가 |
| `handleDeleteItem` | 항목 삭제 | BarcodeItem | 확인 후 제거 |
| `handlePrint` | 바코드 인쇄 | - | 인쇄 다이얼로그 |
| `handleExportExcel` | Excel 내보내기 | - | 파일 다운로드 |

### 통계 데이터

```typescript
const stats = {
  totalItems: barcodeItems.length      // 총 항목 수
  designedLabels: 15                   // 설계된 라벨 수
  printedItems: 10                     // 인쇄된 항목 수
  exportedFiles: 3                     // 내보낸 파일 수
}
```

---

## 🏢 2. warehouse-info (창고 정보 관리)

### 주요 상태 변수

| 변수명 | 타입 | 설명 | 초기값 |
|--------|------|------|--------|
| `warehouseList` | `WarehouseData[]` | 창고 목록 | 초기 3개 항목 |
| `searchText` | `string` | 검색 텍스트 | `""` |
| `statusFilter` | `string \| null` | 상태 필터 | `null` |
| `isEditModalOpen` | `boolean` | 수정 모달 상태 | `false` |
| `isDeleteModalOpen` | `boolean` | 삭제 모달 상태 | `false` |
| `isAddModalOpen` | `boolean` | 추가 모달 상태 | `false` |
| `selectedRecord` | `WarehouseData \| null` | 선택된 창고 | `null` |

### 데이터 구조

```typescript
interface WarehouseData {
  id: number
  code: string              // 창고 코드 (WH-001 등)
  name: string              // 창고명
  manager: string           // 담당자
  status: string            // 상태 (연동중, 수집중, 오류)
  location: string          // 위치
  totalCapacity: number     // 총 용량
  usedCapacity: number      // 사용 용량
  lastSyncDate: string      // 마지막 동기화 날짜
}
```

### 필터링 로직

```typescript
const filteredData = warehouseList.filter((item) => {
  // 검색 조건: 창고명, 코드, 담당자
  const matchesSearch = searchText === '' || 
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.manager.toLowerCase().includes(searchText.toLowerCase())
  
  // 상태 필터
  const matchesStatus = statusFilter === null || item.status === statusFilter
  
  return matchesSearch && matchesStatus
})
```

### 주요 핸들러 함수

| 함수명 | 기능 | 입력값 | 동작 |
|--------|------|--------|------|
| `handleAddOk` | 창고 추가 | Form 값 | `warehouseList`에 새 항목 추가 |
| `handleEditOk` | 창고 수정 | Form 값 | 선택된 창고 정보 업데이트 |
| `handleDeleteOk` | 창고 삭제 | - | 선택된 창고 제거 |
| `handleRefresh` | 필터 초기화 | - | 검색어, 필터 리셋 |
| `handleExport` | Excel 내보내기 | - | 파일 다운로드 |

### 통계 데이터

```typescript
const stats = {
  totalWarehouses: filteredData.length      // 필터된 창고 수
  syncingWarehouses: filteredData.filter(w => w.status === '연동중').length
  errorWarehouses: filteredData.filter(w => w.status === '오류').length
  totalCapacity: filteredData.reduce((sum, w) => sum + w.totalCapacity, 0)
}
```

---

## 📊 3. stock-status (재고 현황)

### 주요 상태 변수

| 변수명 | 타입 | 설명 | 초기값 |
|--------|------|------|--------|
| `searchText` | `string` | 검색 텍스트 (SKU, 상품명, 위치) | `""` |
| `warehouseFilter` | `string \| null` | 창고 필터 | `null` |
| `statusFilter` | `string \| null` | 상태 필터 | `null` |

### 데이터 구조

```typescript
interface StockItem {
  id: number
  sku: string               // 상품 코드
  productName: string       // 상품명
  quantity: number          // 총 수량
  available: number         // 가용 수량
  warehouse: string         // 창고명
  location: string          // 위치 코드
  status: 'in_stock' | 'low_stock' | 'out_of_stock'  // 상태
  statusText: string        // 상태 텍스트
  lastUpdated: string       // 마지막 업데이트
}
```

### 필터링 로직

```typescript
const filteredData = stockData.filter((item) => {
  // 검색: SKU, 상품명, 위치
  const matchesSearch = searchText === '' || 
    item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase())
  
  // 창고 필터
  const matchesWarehouse = warehouseFilter === null || 
    item.warehouse === warehouseFilter
  
  // 상태 필터
  const matchesStatus = statusFilter === null || 
    item.status === statusFilter
  
  return matchesSearch && matchesWarehouse && matchesStatus
})
```

### 통계 데이터

```typescript
const stats = {
  totalItems: filteredData.length
  inStock: filteredData.filter(s => s.status === 'in_stock').length
  lowStock: filteredData.filter(s => s.status === 'low_stock').length
  outOfStock: filteredData.filter(s => s.status === 'out_of_stock').length
}
```

---

## 🔄 4. stock-move (재고 이동)

### 주요 상태 변수

| 변수명 | 타입 | 설명 | 초기값 |
|--------|------|------|--------|
| `stockMoveList` | `StockMoveData[]` | 재고 이동 기록 목록 | 초기 3개 항목 |
| `searchText` | `string` | 검색 텍스트 | `""` |
| `statusFilter` | `string \| null` | 상태 필터 | `null` |
| `moveTypeFilter` | `string \| null` | 이동 유형 필터 | `null` |
| `isEditModalOpen` | `boolean` | 수정 모달 상태 | `false` |
| `isDeleteModalOpen` | `boolean` | 삭제 모달 상태 | `false` |
| `isAddModalOpen` | `boolean` | 추가 모달 상태 | `false` |
| `selectedRecord` | `StockMoveData \| null` | 선택된 이동 기록 | `null` |

### 데이터 구조

```typescript
interface StockMoveData {
  id: number
  moveId: string            // 이동 ID (MV-001 등)
  fromLocation: string      // 출발 위치
  toLocation: string        // 도착 위치
  quantity: number          // 이동 수량
  sku: string              // 상품 코드
  productName: string      // 상품명
  moveType: 'internal' | 'incoming' | 'outgoing'  // 이동 유형
  moveTypeText: string     // 이동 유형 텍스트
  status: 'pending' | 'completed' | 'cancelled'  // 상태
  statusText: string       // 상태 텍스트
  moveDate: string         // 이동 날짜
  movedBy: string          // 담당자
  reason?: string          // 사유
}
```

### 필터링 로직

```typescript
const filteredData = stockMoveList.filter((item) => {
  // 검색: 이동ID, SKU, 상품명, 위치
  const matchesSearch = searchText === '' || 
    item.moveId.toLowerCase().includes(searchText.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.fromLocation.toLowerCase().includes(searchText.toLowerCase()) ||
    item.toLocation.toLowerCase().includes(searchText.toLowerCase())
  
  // 상태 필터
  const matchesStatus = statusFilter === null || item.status === statusFilter
  
  // 이동 유형 필터
  const matchesMoveType = moveTypeFilter === null || item.moveType === moveTypeFilter
  
  return matchesSearch && matchesStatus && matchesMoveType
})
```

### 통계 데이터

```typescript
const stats = {
  totalMoves: filteredData.length
  completedMoves: filteredData.filter(m => m.status === 'completed').length
  pendingMoves: filteredData.filter(m => m.status === 'pending').length
  totalQuantity: filteredData.reduce((sum, m) => sum + m.quantity, 0)
}
```

---

## ✔️ 5. stock-audit (재고 조정/실사)

### 주요 상태 변수

| 변수명 | 타입 | 설명 | 초기값 |
|--------|------|------|--------|
| `auditList` | `AuditData[]` | 조정/실사 기록 목록 | 초기 3개 항목 |
| `searchText` | `string` | 검색 텍스트 | `""` |
| `statusFilter` | `string \| null` | 상태 필터 | `null` |
| `isEditModalOpen` | `boolean` | 수정 모달 상태 | `false` |
| `isDeleteModalOpen` | `boolean` | 삭제 모달 상태 | `false` |
| `isAddModalOpen` | `boolean` | 추가 모달 상태 | `false` |
| `selectedRecord` | `AuditData \| null` | 선택된 조정 기록 | `null` |

### 데이터 구조

```typescript
interface AuditData {
  id: number
  auditId: string           // 조정 ID (AU-001 등)
  sku: string              // 상품 코드
  productName: string      // 상품명
  systemQty: number        // 시스템 수량
  actualQty: number        // 실제 수량
  variance: number         // 차이 (actualQty - systemQty)
  location: string         // 위치
  auditDate: string        // 실사 날짜
  auditor: string          // 감시자/담당자
  status: 'pending' | 'completed' | 'discrepancy'  // 상태
  statusText: string       // 상태 텍스트
}
```

### 필터링 로직

```typescript
const filteredData = auditList.filter((item) => {
  // 검색: 조정ID, SKU, 상품명, 위치
  const matchesSearch = searchText === '' || 
    item.auditId.toLowerCase().includes(searchText.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase())
  
  // 상태 필터
  const matchesStatus = statusFilter === null || item.status === statusFilter
  
  return matchesSearch && matchesStatus
})
```

### 통계 데이터

```typescript
const stats = {
  totalAudits: filteredData.length
  completedAudits: filteredData.filter(a => a.status === 'completed').length
  discrepancies: filteredData.filter(a => a.status === 'discrepancy').length
  avgVariance: filteredData.length > 0 
    ? Math.abs(Math.round(
        filteredData.reduce((sum, a) => sum + a.variance, 0) / 
        filteredData.length
      ))
    : 0
}
```

### 자동 계산 로직

```typescript
// 조정 등록 시 차이 자동 계산
const variance = actualQty - systemQty

// 상태 자동 결정
status = variance === 0 ? 'completed' : 'discrepancy'
```

---

## 📍 6. warehouse-location (위치/로케이션 등록)

### 주요 상태 변수

| 변수명 | 타입 | 설명 | 초기값 |
|--------|------|------|--------|
| `locationList` | `LocationData[]` | 위치 목록 | 초기 3개 항목 |
| `searchText` | `string` | 검색 텍스트 | `""` |
| `warehouseFilter` | `string \| null` | 창고 필터 | `null` |
| `statusFilter` | `string \| null` | 상태 필터 | `null` |
| `currentPage` | `number` | 현재 페이지 번호 | `1` |
| `isEditModalOpen` | `boolean` | 수정 모달 상태 | `false` |
| `isDeleteModalOpen` | `boolean` | 삭제 모달 상태 | `false` |
| `isAddModalOpen` | `boolean` | 추가 모달 상태 | `false` |
| `selectedRecord` | `LocationData \| null` | 선택된 위치 | `null` |

### 데이터 구조

```typescript
interface LocationData {
  id: number
  locationCode: string      // 위치 코드 (A-01-001 등)
  locationName: string      // 위치명
  warehouseId: string      // 창고 ID
  warehouseName: string    // 창고명
  zone: string             // 구역 (A, B, C 등)
  rackNumber: string       // 랙 번호
  level: string            // 레벨
  status: string           // 상태 (사용중, 가용, 오류)
  statusColor: 'cyan' | 'blue' | 'red'  // 상태 색상
  capacity: number         // 용량
  usedCapacity: number     // 사용 용량
  manager: string          // 담당자
  lastUpdated: string      // 마지막 업데이트
}
```

### 필터링 로직

```typescript
const filteredData = locationList.filter((item) => {
  // 검색: 위치 코드, 위치명, 구역
  const matchesSearch = searchText === '' || 
    item.locationCode.toLowerCase().includes(searchText.toLowerCase()) ||
    item.locationName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.zone.toLowerCase().includes(searchText.toLowerCase())
  
  // 창고 필터
  const matchesWarehouse = warehouseFilter === null || 
    item.warehouseId === warehouseFilter
  
  // 상태 필터
  const matchesStatus = statusFilter === null || item.status === statusFilter
  
  return matchesSearch && matchesWarehouse && matchesStatus
})
```

### 자동 생성 로직

```typescript
// 위치 코드 자동 생성
locationCode = `${zone}-${rackNumber}-${level}`
// 예: A-01-001
```

---

## 🗂️ 7. warehouse-layout (창고 구역 설정/2D 레이아웃)

### 주요 상태 변수

| 변수명 | 타입 | 설명 | 초기값 |
|--------|------|------|--------|
| `locationList` | `LocationItem[]` | 위치 항목 목록 | 초기 4개 항목 |
| `selectedWarehouse` | `string` | 선택된 창고 | `'WH-001'` |
| `searchText` | `string` | 검색 텍스트 | `""` |
| `selectedLocationType` | `string \| null` | 위치 타입 필터 | `null` |
| `selectedZone` | `string \| null` | 통로/구역 필터 | `null` |
| `isModalOpen` | `boolean` | 추가 모달 상태 | `false` |
| `isEditModalOpen` | `boolean` | 수정 모달 상태 | `false` |
| `isDeleteModalOpen` | `boolean` | 삭제 모달 상태 | `false` |
| `activeTab` | `string` | 활성 탭 | `'1'` |
| `selectedLocation` | `LocationItem \| null` | 선택된 위치 | `null` |

### 데이터 구조

```typescript
interface LocationItem {
  id: string                // 위치 ID
  code: string              // 위치 코드
  name: string              // 위치명
  zone: string              // 구역 (A, B, C)
  rack: number              // 랙 번호
  level: number             // 레벨
  status: 'empty' | 'occupied' | 'error'  // 상태
  capacity: number          // 용량
  occupancy: number         // 점유 수량
  lastUpdated: string       // 마지막 업데이트
  manager: string           // 담당자
  sku?: string             // SKU (선택)
  locationType: 'pallet' | 'daebong' | 'box' | 'shelf'  // 위치 타입
}

interface RackData {
  rackId: number
  zone: string
  total: number
  occupied: number
  levels: Array<{
    level: number
    occupied: boolean
  }>
}
```

### 필터링 로직

```typescript
const filteredLocations = locationList.filter((item) => {
  // 검색: 위치 코드, 위치명
  const matchesSearch = searchText === '' || 
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase())
  
  // 위치 타입 필터
  const matchesType = selectedLocationType === null || 
    item.locationType === selectedLocationType
  
  // 구역 필터
  const matchesZone = selectedZone === null || item.zone === selectedZone
  
  return matchesSearch && matchesType && matchesZone
})
```

### 통계 데이터

```typescript
const stats = {
  totalLocations: locationList.length
  occupied: locationList.filter(l => l.status === 'occupied').length
  available: locationList.filter(l => l.status === 'empty').length
  utilizationRate: locationList.length > 0 
    ? Math.round(
        (locationList.filter(l => l.status === 'occupied').length / 
         locationList.length) * 100
      )
    : 0
  aisles: 3
  racksPerAisle: 3
  levelsPerRack: 4
}

const locationTypeStats = {
  pallet: locationList.filter(l => l.locationType === 'pallet').length
  daebong: locationList.filter(l => l.locationType === 'daebong').length
  box: locationList.filter(l => l.locationType === 'box').length
  shelf: locationList.filter(l => l.locationType === 'shelf').length
}
```

---

## 🎯 공통 패턴

### 모든 페이지에서 사용되는 표준 패턴

#### 1. **CRUD 작업 흐름**

```typescript
// CREATE (추가)
const handleAdd = () => {
  addForm.resetFields()
  setIsAddModalOpen(true)
}

const handleAddOk = () => {
  addForm.validateFields().then((values) => {
    const newItem = { id: list.length + 1, ...values }
    setList(prev => [...prev, newItem])
    setIsAddModalOpen(false)
    message.success('항목이 추가되었습니다.')
  })
}

// READ (조회) - 필터링
const filteredData = list.filter((item) => {
  // 검색 로직
  // 필터 로직
  return matchesSearch && matchesFilter
})

// UPDATE (수정)
const handleEditOk = () => {
  editForm.validateFields().then((values) => {
    setList(prev => prev.map(item =>
      item.id === selectedRecord.id ? { ...item, ...values } : item
    ))
    setIsEditModalOpen(false)
    message.success('항목이 수정되었습니다.')
  })
}

// DELETE (삭제)
const handleDeleteOk = () => {
  setList(prev => prev.filter(item => item.id !== selectedRecord.id))
  setIsDeleteModalOpen(false)
  message.success('항목이 삭제되었습니다.')
}
```

#### 2. **필터 초기화**

```typescript
const handleRefresh = () => {
  setSearchText('')
  setStatusFilter(null)
  setWarehouseFilter(null)
  // 기타 필터들...
  message.success('필터가 초기화되었습니다.')
}
```

#### 3. **내보내기**

```typescript
const handleExport = () => {
  message.success('엑셀 파일 다운로드를 시작합니다.')
  // 추후 xlsx 라이브러리와 통합 가능
}
```

---

## 📋 상태 변수 요약 테이블

| 페이지 | 주요 State | 개수 | 필터 개수 | CRUD 모달 |
|--------|----------|------|---------|----------|
| warehouse-barcode | 2 | 0 | 1개 (Add) |
| warehouse-info | 7 | 2 | 3개 (Add/Edit/Delete) |
| stock-status | 3 | 3 | 0 |
| stock-move | 8 | 3 | 3개 (Add/Edit/Delete) |
| stock-audit | 7 | 2 | 3개 (Add/Edit/Delete) |
| warehouse-location | 9 | 3 | 3개 (Add/Edit/Delete) |
| warehouse-layout | 10 | 3 | 3개 (Add/Edit/Delete) |

---

## 🔄 상태 변경 흐름도

```
사용자 입력
    ↓
[유효성 검사] → 실패 → 에러 메시지
    ↓ 성공
[setState 실행]
    ↓
[filteredData 자동 계산]
    ↓
[UI 리렌더링]
    ↓
[성공 메시지 표시]
```

---

## 💾 저장 위치

- **warehouse-barcode**: `app/[locale]/warehouse-barcode/page.tsx`
- **warehouse-info**: `app/[locale]/warehouse-info/page.tsx`
- **stock-status**: `app/[locale]/stock-status/page.tsx`
- **stock-move**: `app/[locale]/stock-move/page.tsx`
- **stock-audit**: `app/[locale]/stock-audit/page.tsx`
- **warehouse-location**: `app/[locale]/warehouse-location/page.tsx`
- **warehouse-layout**: `app/[locale]/warehouse-layout/page.tsx`

---

## 📌 주의사항

1. **필터 초기화**: 필터 변경 시 자동으로 `filteredData`가 재계산됨
2. **메시지 알림**: 모든 성공/실패 작업에서 사용자 피드백 제공
3. **Form 검증**: 모든 필수 필드에 `rules` 설정으로 유효성 검사
4. **상태 불변성**: `setState`는 항상 새로운 배열/객체 생성 후 업데이트
5. **타입 안정성**: TypeScript 인터페이스로 데이터 타입 정의

---

## 🚀 향후 개선 사항

- [ ] 실제 Excel 라이브러리(xlsx) 통합
- [ ] 날짜 범위 필터 추가
- [ ] 다중 선택 필터 구현
- [ ] 대량 작업(Bulk) 기능 추가
- [ ] 페이지네이션 최적화
- [ ] 데이터 동기화 API 연결

