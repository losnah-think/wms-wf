# 📋 페이지별 API 연결 상태

## ✅ 완벽하게 연결된 페이지 (15개)

| # | 페이지 | 현재 API | 상태 |
|----|--------|---------|------|
| 1 | 대시보드 | /api/reports/daily, /api/reports/weekly | ✅ |
| 2 | 입고 예정표 | /api/inbound/schedule | ✅ |
| 3 | 입고 승인 | /api/inbound/approval | ✅ |
| 4 | 입출고 | /api/inbound-outbound | ✅ |
| 5 | 피킹 | /api/picking/queue | ✅ |
| 6 | 재고 상태 | /api/stock/status | ✅ |
| 7 | 고급 재고 | /api/stock/movement | ✅ |
| 8 | 재고 설정 | /api/config/warehouse | ✅ |
| 9 | 시스템 규칙 | /api/config/alerts | ✅ |
| 10 | 보고서(현재) | /api/reports/daily | ✅ |
| 11 | 보고서(분석) | /api/reports/weekly | ✅ |
| 12 | 반품 요청 | /api/returns/request | ✅ |
| 13 | 반품 처리 | /api/returns/process | ✅ |
| 14 | 반품 상태 | /api/returns/status | ✅ |
| 15 | 반품 피킹 | /api/return-picking | ✅ |

---

## ⚠️ 부분 연결된 페이지 (4개) - 수정 필요

| # | 페이지 | 현재 API | 문제점 | 해결책 |
|----|--------|---------|--------|--------|
| 16 | 패킹 | /api/picking/queue | ⚠️ queue API 사용 중 | /api/picking/packing 사용해야 함 |
| 17 | 배송 | /api/shipping/track | ⚠️ 개별 조회 API | /api/shipping/list 사용해야 함 |
| 18 | 상품 관리 | /api/products | ✅ OK |  |
| 19 | 창고 관리 | 하드코딩 데이터 | ❌ 미연결 | /api/warehouse 연결 필요 |
| 20 | 작업자 관리 | /api/users | ✅ OK |  |

---

## 📊 작업 요약

- **완벽 연결**: 15개 페이지 ✅
- **수정 필요**: 
  - 패킹: API 변경 필요
  - 배송: API 변경 필요
  - 창고: API 연결 필요

---

## 🔧 수정 작업 내용

### 1. 패킹 페이지 수정
```
파일: app/[locale]/packing/page.tsx
현재: fetch('/api/picking/queue')
변경: fetch('/api/picking/packing')
```

### 2. 배송 페이지 수정
```
파일: app/[locale]/shipping/page.tsx
현재: fetch('/api/shipping/track?...')
변경: fetch('/api/shipping/list?...')
```

### 3. 창고 페이지 수정
```
파일: app/[locale]/warehouse/page.tsx
현재: 하드코딩 데이터
변경: fetch('/api/warehouse')
```
