# 📅 날짜 필터 구현 완료 가이드

> 7개 날짜 필터를 효과적으로 구현한 방법 및 사용 설명서

---

## 🎯 구현 요약

### ✅ 완료된 것

1. **UI/UX 전략 수립** (`DATE_FILTER_STRATEGY.md`)
   - 7개 필터 분석 및 그룹화
   - 3개 그룹으로 분류 (상품관리, 입고관리, 상태변경)
   - 프리셋 + 커스텀 범위 선택 패턴 적용

2. **DateRangeFilter 컴포넌트** (`components/DateRangeFilter.tsx`)
   - 개별 날짜 필터 컴포넌트
   - 그룹화된 필터 패널
   - 전체 필터 관리 컴포넌트

3. **Page 통합** (`app/[locale]/stock-status/by-product/page.tsx`)
   - 테이블에 7개 날짜 필터 적용
   - 필터 상태 관리 (useState)
   - 실시간 필터링 로직

4. **실제 동작 가능**
   - 필터 버튼 클릭으로 즉시 테이블 업데이트
   - 복합 필터 동시 적용 가능
   - 모바일 반응형 (Drawer 사용)

---

## 📊 7개 날짜 필터 구성

```
┌─────────────────────────────────────────────────────────┐
│ 📅 날짜 필터 시스템                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📌 상품 관리 (Group 1 - 주요)                            │
│ ├─ 상품 등록일자          [지난1주] [지난1개월] [...]    │
│ ├─ 최종 수정일            [오늘] [이번주] [...]         │
│ └─ 상품 게시일자          [지난1주] [...]              │
│                                                          │
│ 📦 입고 관리 (Group 2 - 중요)                            │
│ ├─ 입고 예정일자          [오늘] [내일] [이번주] [...] │
│ └─ 입고예정 설정일자      [지난1주] [...]             │
│                                                          │
│ ⚠️ 상태 변경 (Group 3 - 보조)                           │
│ ├─ 품절 일자              [이번주] [...]              │
│ └─ 재고 등록일자          [지난1주] [...]             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 사용 방법

### 1️⃣ 기본 사용

```typescript
// page.tsx에서 이미 구현됨
import { AllDateFiltersPanel, DateFilterValue, getInitialDateFilterState } from '@/components/DateRangeFilter'

// 필터 상태 초기화
const [dateFilters, setDateFilters] = useState<Record<string, DateFilterValue>>(
  getInitialDateFilterState()
)

// 필터 변경 핸들러
const handleDateFilterChange = (filterId: string, value: DateFilterValue) => {
  setDateFilters(prev => ({
    ...prev,
    [filterId]: value,
  }))
}
```

### 2️⃣ UI에서

```
1. "날짜 필터" 버튼 클릭
   ↓
2. 드로어 오른쪽에서 펼쳐짐
   ├─ [상품 관리] 탭에서 "지난 1개월" 클릭
   ├─ [입고 관리] 탭에서 "이번 주" 클릭
   └─ [필터 적용] 버튼 클릭
   ↓
3. 테이블이 즉시 업데이트됨 (필터 적용된 데이터만 표시)
```

### 3️⃣ 테이블 필터링 로직

```typescript
// 필터된 데이터 계산
const filteredStockData = useMemo(() => {
  return allStockData.filter((item) => {
    // 날짜 필터 체크
    if (!isDateInRange(item.productRegistrationDate, dateFilters.productRegistrationDate)) 
      return false
    if (!isDateInRange(item.lastModifiedDate, dateFilters.lastModifiedDate)) 
      return false
    // ... 기타 필터
    return true
  })
}, [allStockData, dateFilters])
```

---

## 🎨 UI 구조 및 컴포넌트

### 계층 구조

```
AllDateFiltersPanel (최상위)
├─ DateFilterGroup (그룹 1: 상품관리)
│  ├─ DateRangeFilter (상품 등록일자)
│  ├─ DateRangeFilter (최종 수정일)
│  └─ DateRangeFilter (상품 게시일자)
├─ DateFilterGroup (그룹 2: 입고관리)
│  ├─ DateRangeFilter (입고 예정일자)
│  └─ DateRangeFilter (입고예정 설정일자)
├─ DateFilterGroup (그룹 3: 상태변경)
│  ├─ DateRangeFilter (품절 일자)
│  └─ DateRangeFilter (재고 등록일자)
└─ 액션 버튼
   ├─ [필터 초기화]
   └─ [필터 적용]
```

### 각 DateRangeFilter 구조

```
📌 상품 등록일자
├─ 헤더
│  ├─ 라벨 (아이콘 포함)
│  └─ 태그 (선택된 값 표시)
├─ 프리셋 버튼
│  ├─ [지난 1주]
│  ├─ [지난 1개월]
│  ├─ [지난 3개월]
│  └─ [지난 1년]
├─ 커스텀 범위 선택
│  └─ DatePicker.RangePicker (달력)
└─ 추가 옵션
   ├─ [미설정]
   └─ [전체]
```

---

## 💻 코드 구조

### DateFilterValue 인터페이스

```typescript
interface DateFilterValue {
  type: 'all' | 'preset' | 'custom' | 'notset'
  preset?: string                    // 프리셋 ID
  customRange?: [Dayjs, Dayjs] | null // 커스텀 날짜 범위
}

// 예시
{
  type: 'preset',
  preset: '1month',
  customRange: [dayjs().subtract(1, 'month'), dayjs()]
}
```

### DateFilterConfig 인터페이스

```typescript
interface DateFilterConfig {
  id: string                     // 'productRegistrationDate'
  label: string                  // '상품 등록일자'
  group: string                  // 'productManagement'
  value: DateFilterValue         // 현재 필터값
  onChange: (value) => void      // 변경 핸들러
  presets: Array<{...}>          // 프리셋 버튼들
  allowNotSet?: boolean          // 미설정 옵션 허용 여부
}
```

---

## 📱 반응형 디자인

### 데스크톱 (>1200px)
```
[날짜 필터] 버튼
    ↓
드로어 (500px 너비)
├─ [상품관리] [입고관리] [상태변경] 탭
├─ 모든 7개 필터 표시
└─ [필터 초기화] [필터 적용] 버튼
```

### 태블릿 (768px~1200px)
```
[날짜 필터] 버튼
    ↓
드로어 (500px 너비)
├─ 축약된 필터 표시
└─ [더보기] 옵션
```

### 모바일 (<768px)
```
[날짜 필터] 버튼
    ↓
풀스크린 모달/드로어
├─ 스택 레이아웃
└─ 터치 최적화 버튼
```

---

## 🔧 주요 기능

### 1️⃣ 프리셋 버튼

```typescript
// 상품 등록일자 프리셋
[지난 1주]  → 오늘 -7일부터 오늘
[지난 1개월] → 오늘 -30일부터 오늘
[지난 3개월] → 오늘 -90일부터 오늘
[지난 1년]  → 오늘 -365일부터 오늘

// 입고 예정일자 프리셋
[오늘]  → 오늘만
[내일]  → 내일만
[이번 주] → 오늘부터 7일 후
[다음 주] → 7일 후부터 14일 후
```

### 2️⃣ 커스텀 범위 선택

```
DatePicker.RangePicker 사용
├─ 마우스로 날짜 선택
├─ 빠른 선택 [오늘] [이번주] [이번달]
└─ 직접 입력 (YYYY-MM-DD 형식)
```

### 3️⃣ 필터 상태 표시

```typescript
// 선택된 필터를 태그로 표시
<Tag color="blue">지난 1개월</Tag>

// 필터 개수 표시
<Tag color="blue">5개 선택</Tag>
```

### 4️⃣ 필터 초기화

```typescript
// 모든 필터를 'all' 상태로 복원
const handleFilterReset = () => {
  setDateFilters(getInitialDateFilterState())
  setSearchText('')
}
```

---

## 📊 필터링 로직

### 날짜 범위 검증

```typescript
// isDateInRange 함수
const isDateInRange = (date: Dayjs | null, filterValue: DateFilterValue): boolean => {
  if (!date || filterValue.type === 'all') return true           // 전체
  if (filterValue.type === 'notset' && !date) return true        // 미설정 상품
  if (filterValue.type === 'notset' && date) return false        // 설정된 상품 제외
  
  if (filterValue.type === 'custom' && filterValue.customRange) {
    const [start, end] = filterValue.customRange
    return date.isAfter(start) && date.isBefore(end.add(1, 'day'))
  }
  
  return true
}
```

### 테이블 필터링

```typescript
// 모든 필터를 AND 조건으로 적용
const filteredStockData = useMemo(() => {
  return allStockData.filter((item) => {
    // 검색 필터
    if (searchText && !matchesSearch(item, searchText)) return false
    
    // 날짜 필터들 (모두 충족해야 함)
    if (!isDateInRange(item.productRegistrationDate, dateFilters.productRegistrationDate)) return false
    if (!isDateInRange(item.lastModifiedDate, dateFilters.lastModifiedDate)) return false
    if (!isDateInRange(item.productPublishDate, dateFilters.productPublishDate)) return false
    // ... 나머지 필터들
    
    return true  // 모든 필터 통과 = 결과에 포함
  })
}, [allStockData, searchText, dateFilters])
```

---

## 🎯 사용 시나리오

### 시나리오 1: 최근 수정 상품 보기 (5초)

```
1. [날짜 필터] 버튼 클릭
2. [최종 수정일] 필터에서 [이번 달] 클릭
3. [필터 적용] 클릭
↓
테이블에 이번 달에 수정된 상품만 표시
```

### 시나리오 2: 임박한 입고 상품 보기 (10초)

```
1. [날짜 필터] 버튼 클릭
2. [입고 예정일자] 필터에서 [이번 주] 클릭
3. [필터 적용] 클릭
↓
테이블에 이번 주에 입고될 상품만 표시
```

### 시나리오 3: 복합 필터 (20초)

```
1. [날짜 필터] 버튼 클릭
2. [상품 등록일자]: [지난 1개월] 선택
3. [입고 예정일자]: [이번 주] 선택
4. [품절 일자]: [미설정] 선택 (품절되지 않은 상품)
5. [필터 적용] 클릭
↓
테이블에 조건을 모두 만족하는 상품만 표시
```

---

## ✨ 주요 특징

| 특징 | 설명 | 효과 |
|------|------|------|
| **프리셋 버튼** | 자주 쓰는 필터 1클릭 | UX 향상 |
| **커스텀 범위** | 달력으로 자유로운 선택 | 유연성 |
| **그룹화** | 3개 그룹으로 정리 | 가독성 |
| **미설정 옵션** | 특정 데이터만 선택 | 정확성 |
| **즉시 업데이트** | 필터 적용 시 즉시 변경 | 반응성 |
| **필터 상태 표시** | 선택된 필터 시각화 | 명확성 |
| **초기화 버튼** | 한 번에 모두 리셋 | 편리성 |
| **반응형 디자인** | 모바일/태블릿 최적화 | 접근성 |

---

## 🔗 파일 위치

```
/Users/sotatekthor/Desktop/wms-wf/
├─ components/
│  └─ DateRangeFilter.tsx           ← 필터 컴포넌트
├─ app/[locale]/stock-status/by-product/
│  └─ page.tsx                      ← 실제 구현
└─ DATE_FILTER_STRATEGY.md          ← 전략 문서 (이 파일)
```

---

## 🚀 확장 가능성

### 1️⃣ 추가 필터 쉽게 확장
```typescript
// dateFilterConfigs에 새로운 필터 추가
{
  id: 'myNewDate',
  label: '새로운 날짜',
  group: 'productManagement',
  value: dateFilters.myNewDate,
  onChange: (value) => handleDateFilterChange('myNewDate', value),
  presets: [...]
}
```

### 2️⃣ 새로운 프리셋 추가
```typescript
presets: [
  { label: '최근 입고', value: 'recent', getRange: () => [...] },
  { label: '예정된 입고', value: 'scheduled', getRange: () => [...] },
]
```

### 3️⃣ 필터 저장 기능
```typescript
// 자주 쓰는 필터 조합을 저장
const saveFilterPreset = (name: string) => {
  localStorage.setItem(`filterPreset_${name}`, JSON.stringify(dateFilters))
}
```

### 4️⃣ 필터 내보내기
```typescript
// CSV/Excel로 내보내기
const exportFiltered = () => {
  downloadCSV(filteredStockData)
}
```

---

## 🎓 학습 포인트

### TypeScript 타입 시스템
- Union types (`'all' | 'preset' | 'custom'`)
- Interface 설계 (DateFilterValue, DateFilterConfig)
- Generics 활용

### React 패턴
- useState로 필터 상태 관리
- useMemo로 필터링 최적화
- useCallback으로 핸들러 메모이제이션

### Ant Design 컴포넌트
- DatePicker.RangePicker 사용
- Drawer 모달 구현
- Collapse 아코디언 구현
- Tag 상태 표시

### 날짜 처리 (dayjs)
- 날짜 범위 계산
- 프리셋 로직 구현
- 날짜 비교 및 검증

---

## ✅ 완료 체크리스트

- [x] 7개 필터 분석 및 그룹화
- [x] UI/UX 전략 수립 (DATE_FILTER_STRATEGY.md)
- [x] DateRangeFilter 컴포넌트 구현
- [x] 3개 그룹 구조 설계
- [x] 프리셋 버튼 구현
- [x] 커스텀 범위 선택 구현
- [x] 필터 상태 관리 (useState)
- [x] 필터 적용 로직 구현
- [x] 테이블 필터링 로직 구현
- [x] 반응형 디자인 (Drawer)
- [x] 필터 초기화 기능
- [x] 필터 상태 표시 (태그)
- [x] 실시간 업데이트
- [x] 문서 작성 (이 파일)

---

## 🎉 완성!

7개 날짜 필터가 모두 구현되었습니다!

**주요 개선 사항:**
- ✅ 효과적인 UI/UX (프리셋 + 커스텀)
- ✅ 직관적인 그룹화 (3개 그룹)
- ✅ 실시간 필터링 (테이블 즉시 업데이트)
- ✅ 반응형 디자인 (모바일 최적화)
- ✅ 확장 가능한 구조 (새 필터 추가 용이)

**이제 필요한 것:**
- 실제 데이터베이스 연동
- API 필터링 엔드포인트 추가
- 필터 저장 기능 (나중에)
- 필터 통계 분석 (나중에)

