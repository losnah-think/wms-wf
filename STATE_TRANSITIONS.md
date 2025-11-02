# 상태 전이도 (State Transition Diagrams)

## 개요

이 문서는 각 페이지에서 사용자 액션에 따라 상태(State)가 어떻게 변화하는지를 시각적으로 표현합니다.

---

## 📦 1. warehouse-barcode (바코드 생성)

### 상태 정의

| 상태 | 설명 | 변수 | 초기값 |
|------|------|------|--------|
| **IDLE** | 대기 중 | - | 시작 상태 |
| **DESIGNING** | 라벨 디자인 중 | `designSettings` 변경 | 사용자 입력 |
| **INPUT_MODE** | 데이터 입력 중 | `isModalOpen = true` | "항목 추가" 클릭 |
| **PREVIEW** | 미리보기 표시 | `barcodeItems` 갱신 | 항목 추가/삭제 시 |
| **PRINTING** | 인쇄 중 | - | "인쇄" 버튼 클릭 |
| **EXPORTING** | 내보내기 중 | - | "내보내기" 버튼 클릭 |

### 상태 전이도

```
                    ┌─────────┐
                    │  IDLE   │ (초기 상태)
                    └────┬────┘
         ┌──────────────┼──────────────────┐
         │              │                  │
         ▼              ▼                  ▼
    ┌────────────┐  ┌──────────┐   ┌──────────────┐
    │ DESIGNING  │  │INPUT_MODE│   │  PREVIEW     │
    │(용지/라벨  │  │(항목 추가)│   │(실시간 갱신) │
    │설정)       │  │          │   │              │
    └────┬───────┘  └────┬─────┘   └────┬─────────┘
         │               │              │
         │ 설정 완료      │ 항목 추가    │ 항목 추가
         │               │              │
         └───────────────┼──────────────┘
                         │
                         ▼
                    ┌─────────────┐
                    │  PREVIEW    │ ◄──┐
                    │(항목 목록   │    │
                    │+ 미리보기)  │    │
                    └─────┬───────┘    │
                          │            │
         ┌────────────────┼───────────┐│
         │                │           ││ 항목 추가/삭제
         ▼                ▼           ││
    ┌─────────┐      ┌──────────┐    ││
    │PRINTING │      │EXPORTING │    ││
    │(인쇄    │      │(Excel    │    ││
    │처리)    │      │내보내기) │    ││
    └────┬────┘      └────┬─────┘    ││
         │                │          ││
         └────────────────┼──────────┘│
                          │           │
                    ┌─────▼────────┐  │
                    │   SUCCESS    │──┘
                    │(완료 메시지) │
                    └──────────────┘
```

### 상태 전이 트리거 (이벤트)

| 이벤트 | 발생 조건 | 현재 상태 | 다음 상태 | 액션 |
|--------|---------|---------|---------|------|
| **Design Changed** | 사용자가 용지/라벨 설정 변경 | IDLE → DESIGNING | DESIGNING | `designSettings` 업데이트 |
| **Add Item Modal Open** | "항목 추가" 버튼 클릭 | IDLE/PREVIEW → INPUT_MODE | INPUT_MODE | `isModalOpen = true` |
| **Add Item Submit** | 폼 제출 | INPUT_MODE → PREVIEW | PREVIEW | `barcodeItems` 추가, 메시지 표시 |
| **Delete Item** | 항목 삭제 버튼 클릭 | PREVIEW → PREVIEW | PREVIEW | `barcodeItems` 제거 |
| **Print** | "인쇄" 버튼 클릭 | PREVIEW → PRINTING | PRINTING | 인쇄 다이얼로그 |
| **Export Excel** | "내보내기" 버튼 클릭 | PREVIEW → EXPORTING | EXPORTING | 파일 다운로드 |
| **Operation Success** | 작업 완료 | PRINTING/EXPORTING → SUCCESS | SUCCESS | `message.success()` |
| **Back to Preview** | 모달 닫기 | INPUT_MODE → PREVIEW | PREVIEW | `isModalOpen = false` |

### 코드 구현 예시

```typescript
// 상태 변수 정의
const [designSettings, setDesignSettings] = useState<DesignSettings>(initialSettings)
const [barcodeItems, setBarcodeItems] = useState<BarcodeItem[]>([])
const [isModalOpen, setIsModalOpen] = useState(false)

// 상태 전이 핸들러
const handleAddItem = () => {
  // IDLE/PREVIEW → INPUT_MODE
  setIsModalOpen(true)  // INPUT_MODE 진입
}

const handleAddItemConfirm = (values) => {
  // INPUT_MODE → PREVIEW
  setBarcodeItems(prev => [...prev, newItem])  // 상태 업데이트
  setIsModalOpen(false)  // INPUT_MODE 종료
  message.success('항목이 추가되었습니다.')  // SUCCESS 상태
}

const handlePrint = () => {
  // PREVIEW → PRINTING → SUCCESS
  // PRINTING 상태에서 인쇄 처리
  message.success('인쇄 완료')
}
```

---

## 🏢 2. warehouse-info (창고 정보 관리)

### 상태 정의

| 상태 | 설명 | 진입 조건 |
|------|------|---------|
| **VIEW** | 목록 조회 | 초기 로딩, 필터 변경 |
| **SEARCHING** | 검색 중 | 검색어 입력 |
| **FILTERING** | 필터 적용 중 | 상태 필터 선택 |
| **ADDING** | 창고 추가 중 | "추가" 모달 오픈 |
| **EDITING** | 창고 편집 중 | "편집" 모달 오픈 |
| **DELETING** | 삭제 확인 중 | "삭제" 확인 모달 |
| **SAVING** | 저장 중 | 폼 제출 |
| **LOADING** | 데이터 로딩 | 필터/검색 적용 |
| **SUCCESS** | 작업 완료 | 저장/삭제 성공 |
| **ERROR** | 에러 발생 | 유효성 검사 실패 |

### 상태 전이도

```
                        ┌──────────┐
                        │   VIEW   │ ◄──────┐
                        │(목록표시)│       │
                        └─────┬────┘       │
              ┌────────────────┼───────────────┐
              │                │               │
              ▼                ▼               ▼
         ┌─────────┐    ┌─────────────┐  ┌──────────┐
         │SEARCHING│    │ FILTERING   │  │  ADDING  │
         │         │    │(상태 필터)  │  │(모달오픈)│
         └────┬────┘    └──────┬──────┘  └────┬─────┘
              │                │             │
              └────────────────┼─────────────┘
                        LOADING ▼
                        (필터 적용)
                               │
                        ┌──────▼──────┐
                        │   FILTERED  │
                        │  VIEW LIST  │
                        └──────┬──────┘
           ┌──────────────┬────┴─────────┬──────────────┐
           │              │              │              │
           ▼              ▼              ▼              ▼
       ┌────────┐   ┌─────────┐   ┌────────────┐  ┌──────────┐
       │EDITING │   │DELETING │   │  EXPORTING │  │ REFRESHING
       │(수정   │   │(확인    │   │(내보내기)  │  │(초기화)  │
       │모달)   │   │모달)    │   │            │  │          │
       └────┬───┘   └────┬────┘   └─────┬──────┘  └────┬─────┘
            │            │              │            │
            ▼            ▼              ▼            ▼
        ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐
        │ SAVING  │  │CONFIRMING│  │EXPORTING │  │RESETTING
        │(저장    │  │DELETION  │  │(진행중)  │  │(진행중) │
        │진행중)  │  │(진행중)  │  │          │  │         │
        └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘
             │            │             │            │
             ▼            ▼             ▼            ▼
        ┌─────────────────────────────────────────────┐
        │            SUCCESS / ERROR                  │
        │        (메시지 표시 후 VIEW 상태로 돌아감) │
        └──────────────────┬────────────────────────┘
                           │
                           ▼
                        ┌──────────┐
                        │   VIEW   │ (초기 상태로 복귀)
                        └──────────┘
```

### 상태 전이 이벤트

```typescript
// 검색 입력 → SEARCHING 상태
const handleSearch = (value: string) => {
  setSearchText(value)  // SEARCHING 상태
  // filteredData가 자동으로 재계산됨
}

// 필터 변경 → FILTERING 상태
const handleStatusFilter = (value: string) => {
  setStatusFilter(value)  // FILTERING 상태
  // filteredData 재계산
}

// 조합 효과 → LOADING 상태
// searchText + statusFilter → LOADING → FILTERED VIEW

// 추가 버튼 → ADDING 상태
const handleAdd = () => {
  setIsAddModalOpen(true)  // ADDING 상태
}

// 폼 제출 → SAVING 상태
const handleAddOk = () => {
  form.validateFields().then(() => {
    // SAVING 상태 (논리적, UI에 로딩 표시 없음)
    setWarehouseList(prev => [...prev, newWarehouse])
    setIsAddModalOpen(false)
    message.success('창고가 추가되었습니다.')  // SUCCESS
  }).catch(() => {
    // ERROR 상태 (유효성 검사 실패)
  })
}

// 필터 초기화 → REFRESHING 상태
const handleRefresh = () => {
  setSearchText('')  // RESETTING
  setStatusFilter(null)
  message.success('필터가 초기화되었습니다.')  // SUCCESS
}
```

---

## 🔄 3. stock-move (재고 이동)

### 상태 머신 다이어그램

```
                    ┌─────────────┐
                    │   INITIAL   │
                    │(시작 상태)   │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
      ┌─────────┐    ┌──────────┐   ┌──────────────┐
      │SEARCHING│    │FILTERING │   │  ADDING MODE │
      │(검색어  │    │(유형/상태│   │(모달 오픈)   │
      │입력)    │    │필터)     │   │              │
      └────┬────┘    └────┬─────┘   └────┬─────────┘
           │              │             │
           └──────────────┼─────────────┘
                          │
                   FILTERED ▼ LIST
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌────────────┐  ┌─────────┐    ┌──────────┐
    │FORM INPUT  │  │EDITING  │    │ DELETING │
    │(항목 정보  │  │(기존    │    │(확인    │
    │입력)       │  │정보수정)│    │대화)    │
    └─────┬──────┘  └────┬────┘    └────┬────┘
          │              │            │
          ▼              ▼            ▼
    ┌────────────────────────────────────┐
    │   FORM VALIDATION                  │
    │   (유효성 검사)                     │
    └─┬──────────────────────────────────┘
      │
      ├─ FAIL ──► ┌──────────┐
      │           │  ERROR   │
      │           │(에러표시)│
      │           └────┬─────┘
      │                │
      │                └──► 입력 모달 유지
      │
      └─ SUCCESS ──► ┌──────────────┐
                     │   PROCESSING │
                     │   (저장/삭제) │
                     └────┬─────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │  SUCCESS MSG │
                    │  (완료메시지)│
                    └────┬─────────┘
                         │
                    ┌────▼─────────┐
                    │   RETURN TO  │
                    │  FILTERED    │
                    │   LIST       │
                    └──────────────┘
```

### 이동 기록의 상태 필드

```
개별 이동 기록(StockMoveData)의 status 필드 상태 전이:

   ┌──────────┐
   │ pending  │ (대기중)
   └────┬─────┘
        │
        ├─ [완료 처리] ──► ┌──────────┐
        │                 │completed │ (완료)
        │                 └──────────┘
        │
        └─ [취소] ──► ┌──────────┐
                     │cancelled │ (취소)
                     └──────────┘

이벤트:
- handleEditOk()에서 status 변경 가능
- status 자동으로 화면에 Tag로 표시
- 상태별 색상: orange(pending) → green(completed) / red(cancelled)
```

---

## ✔️ 4. stock-audit (재고 조정)

### 자동 상태 계산 흐름

```
               사용자가 실사 등록
                    │
                    ▼
    ┌──────────────────────────────┐
    │   실제 수량 vs 시스템 수량    │
    │   (actualQty vs systemQty)   │
    └──────────────┬───────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   actualQty =        actualQty ≠
   systemQty          systemQty
        │                     │
        ▼                     ▼
   ┌─────────┐           ┌──────────────┐
   │ variance│           │   variance   │
   │   = 0   │           │    ≠ 0       │
   └────┬────┘           └───────┬──────┘
        │                        │
        ▼                        ▼
   ┌──────────┐           ┌────────────────┐
   │completed │           │  discrepancy   │
   │ (완료)   │           │ (불일치)       │
   └──────────┘           └────────────────┘
```

### 코드 구현 로직

```typescript
// 자동 상태 결정 로직
const newAudit: AuditData = {
  // ... 기타 필드
  variance: actualQty - systemQty,
  status: actualQty === systemQty ? 'completed' : 'discrepancy',
  statusText: actualQty === systemQty ? '완료' : '불일치'
}

// 통계에 반영
const stats = {
  completedAudits: filteredData.filter(a => a.status === 'completed').length,
  discrepancies: filteredData.filter(a => a.status === 'discrepancy').length
}
```

---

## 📍 5. warehouse-location (위치 등록)

### 페이지 상태 전이

```
                   ┌─────────────────┐
                   │  LOCATION LIST  │
                   │   (기본 보기)    │
                   └────────┬─────────┘
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌────────────┐   ┌───────────┐   ┌──────────┐
    │  SEARCH    │   │ WAREHOUSE │   │  STATUS  │
    │ (검색어)   │   │ FILTER    │   │  FILTER  │
    │ 입력       │   │ 선택      │   │ 선택     │
    └─────┬──────┘   └───────┬───┘   └────┬─────┘
          │                  │            │
          └──────────────────┼────────────┘
                             │
                   FILTERING ▼
                             │
                    ┌────────▼────────┐
                    │ FILTERED        │
                    │ LOCATION LIST   │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
      ┌─────────┐      ┌─────────┐      ┌──────────┐
      │ ADDING  │      │ EDITING │      │DELETING  │
      │(모달)   │      │(모달)   │      │(확인)    │
      └────┬────┘      └────┬────┘      └────┬─────┘
           │                │             │
           └────────────────┼─────────────┘
                            │
                    VALIDATING ▼
                            │
              ┌─────────────┴──────────────┐
              │                           │
         FAIL │                           │ SUCCESS
              │                           │
              ▼                           ▼
         ┌────────────┐            ┌──────────────┐
         │ ERROR MSG  │            │ UPDATE STATE │
         │ 표시       │            │ (추가/수정   │
         └────┬───────┘            │ /삭제)      │
              │                     └────┬────────┘
              │                          │
              └──────────────┬───────────┘
                             │
                      ┌──────▼──────┐
                      │ SUCCESS MSG │
                      │ 표시        │
                      └────┬────────┘
                           │
                    ┌──────▼──────────┐
                    │ RETURN TO       │
                    │ FILTERED LIST   │
                    │(Badge 갱신)    │
                    └─────────────────┘
```

### 특별한 자동 생성 로직

```
사용자 입력:
  zone: "A"
  rackNumber: "01"
  level: "1"
  
자동 생성:
  ┌─────────────────────────────────┐
  │  locationCode = zone-rackNumber-level  │
  │  "A-01-1" 자동 생성               │
  └─────────────────────────────────┘
  
결과:
  locationData = {
    locationCode: "A-01-1",  ◄── 자동 생성
    locationName: "사용자 입력값",
    zone: "A",
    rackNumber: "01",
    level: "1",
    ...
  }
```

---

## 🗂️ 6. warehouse-layout (창고 구역 설정)

### 다중 필터 상태 전이

```
                    ┌──────────────┐
                    │ LAYOUT VIEW  │
                    │ (3개 탭)     │
                    └──────┬───────┘
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │TAB 1:    │    │TAB 2:    │    │TAB 3:        │
    │구조도    │    │위치목록  │    │히트맵분석    │
    └────┬─────┘    └────┬─────┘    └──────┬───────┘
         │                │               │
         │ (모두 동일한 필터 로직)        │
         └────────────────┼───────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
       ┌────────┐   ┌──────────┐  ┌─────────┐
       │ SEARCH │   │ZONE      │  │LOCATION │
       │        │   │FILTER    │  │TYPE     │
       │        │   │FILTER    │  │FILTER   │
       └───┬────┘   └────┬─────┘  └────┬────┘
           │             │            │
           └─────────────┼────────────┘
                         │
                FILTERING ▼
                    (3중 필터)
                         │
             ┌───────────▼──────────┐
             │ FILTERED LOCATIONS   │
             │ (통계 실시간 갱신)  │
             └──────────┬──────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
    ┌─────────┐   ┌──────────┐   ┌──────────┐
    │ ADDING  │   │ EDITING  │   │ DELETING │
    │ MODAL   │   │ MODAL    │   │ CONFIRM  │
    └────┬────┘   └────┬─────┘   └────┬─────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
                FORM ▼ VALIDATION
                       │
         ┌─────────────┴──────────────┐
         │                           │
     FAIL│                           │SUCCESS
         │                           │
         ▼                           ▼
    ┌──────────┐              ┌──────────────┐
    │ ERROR    │              │ UPDATE STATE │
    │ MESSAGE  │              │ locationList │
    └────┬─────┘              │ 갱신          │
         │                     └────┬─────────┘
         │                          │
         └──────────────┬───────────┘
                        │
                 ┌──────▼──────┐
                 │  SUCCESS    │
                 │  MESSAGE    │
                 └────┬────────┘
                      │
                 ┌────▼────────────────┐
                 │ STATISTICS UPDATE   │
                 │ (실시간 갱신)      │
                 │ - 점유율            │
                 │ - 위치타입별 집계  │
                 └────┬────────────────┘
                      │
                 ┌────▼──────────────┐
                 │ RETURN TO         │
                 │ FILTERED VIEW     │
                 │ (모든 탭 갱신)   │
                 └───────────────────┘
```

### 통계 실시간 계산 흐름

```
상태 변경 감지
     │
     ▼
filteredLocations 자동 재계산
     │
     ▼
통계 자동 갱신:
┌─────────────────────────────────────┐
│ totalLocations = filteredLocations.length
│ occupied = filter(status='occupied').length
│ available = filter(status='empty').length
│ utilizationRate = (occupied/total)*100
└─────────────────────────────────────┘
     │
     ▼
UI 리렌더링 (Statistic 컴포넌트 갱신)
```

---

## 🔀 7. stock-status (재고 현황)

### 읽기 전용 상태 전이

```
                    ┌──────────────┐
                    │ STOCK LIST   │
                    │ (조회 모드)   │
                    └──────┬───────┘
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌────────────┐   ┌───────────┐   ┌──────────┐
    │ SEARCH     │   │WAREHOUSE  │   │ STATUS   │
    │(SKU/상품명)│   │FILTER     │   │ FILTER   │
    │/위치 검색  │   │           │   │          │
    └─────┬──────┘   └───────┬───┘   └────┬─────┘
          │                  │            │
          └──────────────────┼────────────┘
                             │
                   FILTERING ▼
                             │
                    ┌────────▼────────┐
                    │ FILTERED        │
                    │ STOCK LIST      │
                    │ (여러 상태 표시)│
                    └────────┬────────┘
                             │
           ┌─────────────────┼──────────────────┐
           │                 │                  │
           ▼                 ▼                  ▼
      ┌─────────┐      ┌──────────┐      ┌──────────┐
      │REFRESH  │      │ EXPORT   │      │ STATUS   │
      │FILTER   │      │ EXCEL    │      │ COLOR    │
      │         │      │          │      │ DISPLAY  │
      └────┬────┘      └────┬─────┘      └────┬─────┘
           │                │              │
           ▼                ▼              ▼
      ┌──────────────────────────────────────┐
      │ NO DATA MODIFICATION                 │
      │ (읽기 전용 - 조회만 가능)           │
      └──────────────────────────────────────┘

상태별 색상 태그:
┌───────────────┐
│ 재고충분 ──► GREEN
│ 적은재고 ──► ORANGE
│ 재고없음 ──► RED
└───────────────┘
```

---

## 📊 전체 상태 전이 흐름 비교표

### 패턴 분류

#### A. CRUD 패턴 (Create/Read/Update/Delete)

```
warehouse-info, warehouse-location, warehouse-layout, stock-move, stock-audit

공통 흐름:
VIEW ──┬─► ADDING ──┬─► FORM VALIDATION ──┬─► SUCCESS
       │            │                      └─► ERROR
       │            └─ (모달 오픈)
       │
       ├─► EDITING ──┬─► FORM VALIDATION ──┬─► SUCCESS
       │             │                      └─► ERROR
       │             └─ (모달 오픈)
       │
       └─► DELETING ──► CONFIRMATION ──┬─► SUCCESS
                                        └─► CANCELLED
```

#### B. 읽기 전용 패턴 (Read Only)

```
stock-status, stock-move(조회), stock-audit(조회)

공통 흐름:
VIEW ──┬─► SEARCHING
       ├─► FILTERING
       └─► STATISTICS UPDATE (실시간)
```

#### C. 생성 및 미리보기 패턴

```
warehouse-barcode

흐름:
DESIGN ──► ADDING ──► PREVIEW (실시간 갱신)
           ├─► PRINTING
           └─► EXPORTING
```

---

## 🎯 상태 변수의 생성 및 갱신 시점

### 초기화 (Component Mount)

```typescript
// 1. 페이지 로드 시점
useEffect(() => {
  // 상태 변수 선언
  const [list, setList] = useState<DataType[]>(initialData)
  const [searchText, setSearchText] = useState('')
  const [filter, setFilter] = useState(null)
  // 1차 필터링
}, [])
```

### 사용자 입력 (Event Handler)

```typescript
// 2. 검색어/필터 입력 시점
const handleSearch = (value: string) => {
  setSearchText(value)  // 상태 변경
  // 자동으로 filteredData 재계산
}

// 3. 버튼 클릭 시점
const handleAdd = () => {
  setIsAddModalOpen(true)  // 모달 상태 변경
}
```

### 폼 제출 (Validation & Save)

```typescript
// 4. 폼 유효성 검사 후 저장
const handleAddOk = () => {
  form.validateFields()  // 유효성 검사
    .then((values) => {
      setList(prev => [...prev, newItem])  // 데이터 상태 갱신
      setIsAddModalOpen(false)  // 모달 닫기
      message.success('저장됨')  // 성공 메시지
    })
    .catch(() => {
      message.error('유효성 검사 실패')  // 에러 메시지
    })
}
```

### 자동 계산 (Computed Values)

```typescript
// 5. 의존성 변경 시 자동 계산
const filteredData = useMemo(() => {
  return list.filter((item) => {
    // searchText, filter 변경 시 자동 재계산
    return matchesSearch && matchesFilter
  })
}, [list, searchText, filter])

// 또는 직접 계산 (모든 렌더링마다)
const filteredData = list.filter(item => {
  // searchText, filter 변경 시 자동 재계산
  return matchesSearch && matchesFilter
})

// 6. 통계 실시간 갱신
const stats = {
  total: filteredData.length,
  completed: filteredData.filter(item => item.status === 'completed').length
}
```

### 메시지 표시 (Feedback)

```typescript
// 7. 작업 완료 후 피드백
message.success('작업이 완료되었습니다.')
message.error('오류가 발생했습니다.')
message.warning('확인해주세요.')
message.info('정보입니다.')
```

---

## 🔄 상태 변경 타임라인 예시

### warehouse-info: 창고 추가 시나리오

```
T=0ms    │ 초기 상태: VIEW
         │ searchText: ""
         │ statusFilter: null
         │ warehouseList: [초기 3개]
         │ isAddModalOpen: false
         │
T=100ms  │ 사용자: "추가" 버튼 클릭
         │ 상태 변경: isAddModalOpen: false ─► true
         │ 상태 표시: 추가 모달 UI 나타남
         │
T=500ms  │ 사용자: 폼 입력
         │ 임시 상태: Form 내부 상태 (상태 변수 아님)
         │
T=800ms  │ 사용자: "저장" 버튼 클릭
         │ 이벤트: handleAddOk() 실행
         │
T=810ms  │ 폼 검증: SUCCESS
         │ 상태 변경 1: warehouseList.push(newWarehouse)
         │            [기존 3개 + 신규 1개 = 4개]
         │ 상태 변경 2: isAddModalOpen: true ─► false
         │            모달 자동 닫힘
         │
T=815ms  │ 필터 재계산: filteredData 자동 갱신
         │            검색: "" (빈값) ✓
         │            필터: null ✓
         │            => 전체 4개 표시
         │
T=820ms  │ UI 리렌더링: 목록에 신규 항목 추가 표시
         │
T=825ms  │ 메시지 표시: message.success('창고가 추가되었습니다.')
         │
T=1000ms │ 메시지 사라짐
         │ 최종 상태: VIEW (초기 상태로 복귀)
         │          searchText: ""
         │          statusFilter: null
         │          warehouseList: [4개]
         │          isAddModalOpen: false
```

---

## 📌 핵심 포인트

### 1. **상태 생성 시점**
- **선언**: Component 함수 내부 최상단 (`useState`)
- **초기화**: 컴포넌트 마운트 시 (직관적 초기값 설정)

### 2. **상태 변경 시점**
- **사용자 입력**: 즉시 (`onChange`, `onClick` 핸들러)
- **필터 적용**: 실시간 (모든 render마다)
- **폼 제출**: 검증 후 (`validateFields`)

### 3. **상태 전이 패턴**
- **CRUD**: VIEW → ACTION (ADD/EDIT/DELETE) → VALIDATION → SUCCESS → VIEW
- **검색/필터**: 입력 → 즉시 필터 적용 → UI 갱신
- **자동 계산**: 의존성 변수 변경 → 자동 재계산

### 4. **상태 관리 원칙**
- **불변성**: 기존 상태를 수정하지 않고 새로운 객체/배열 생성
- **단일 진실**: 한 가지 상태만 진실 공급원 (데이터 소스)
- **파생 값**: 계산된 값은 상태가 아닌 변수

