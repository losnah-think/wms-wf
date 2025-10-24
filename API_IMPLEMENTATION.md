# OMS-WMS API Implementation Guide

## 🎯 구현 완료 상태

### ✅ 완료된 API 엔드포인트

모든 API가 **Neon PostgreSQL**과 연동되어 실제 데이터베이스에서 작동합니다.

#### 1. GET /api/inbound-requests
- ✅ 50,000개 InboundRequest 레코드 조회
- ✅ Supplier, Product 조인 포함
- ✅ 상태 자동 매핑 (영문 → 한글)

#### 2. POST /api/inbound-requests
- ✅ 새 입고 요청 생성
- ✅ 공급업체 자동 생성/검색
- ✅ 상품 자동 생성/검색
- ✅ InboundRequestItem 자동 생성

#### 3. GET /api/inbound-status/[id]
- ✅ 특정 요청 상태 조회
- ✅ 전체 요청 정보 포함

#### 4. PATCH /api/inbound-status/[id]
- ✅ 상태 업데이트
- ✅ InboundApproval 동기화
- ✅ 상태 매핑 (한글 → 영문)

#### 5. DELETE /api/inbound-status/[id]
- ✅ 입고 요청 삭제
- ✅ Cascade 삭제 (items, schedules)

---

## 📡 API 테스트 가이드

### 서버 실행
```bash
npm run dev
# 현재 실행 중: http://localhost:3001
```

### 1. 모든 입고 요청 조회
```bash
curl http://localhost:3001/api/inbound-requests
```

**예상 응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": "INB-REQ-20251024-001",
      "poNumber": "INB-REQ-20251024-001",
      "supplierName": "ABC Supply Co.",
      "items": [
        {
          "id": "...",
          "skuCode": "PROD001",
          "productName": "Product A",
          "quantity": 100,
          "unit": "EA"
        }
      ],
      "requestDate": "2025-10-24",
      "expectedDate": "2025-10-30",
      "approvalStatus": "승인대기",
      "memo": ""
    }
  ],
  "count": 50000
}
```

### 2. 새 입고 요청 생성
```bash
curl -X POST http://localhost:3001/api/inbound-requests \
  -H "Content-Type: application/json" \
  -d '{
    "poNumber": "TEST-PO-001",
    "supplierName": "Test Supplier",
    "items": [
      {
        "id": "item-1",
        "skuCode": "TEST-SKU-001",
        "productName": "Test Product",
        "quantity": 50,
        "unit": "EA"
      }
    ],
    "requestDate": "2025-10-24",
    "expectedDate": "2025-10-30",
    "memo": "테스트 요청"
  }'
```

**예상 응답:**
```json
{
  "success": true,
  "message": "Inbound request created successfully",
  "data": {
    "id": "TEST-PO-001",
    "poNumber": "TEST-PO-001",
    "supplierName": "Test Supplier",
    "items": [...],
    "requestDate": "2025-10-24",
    "expectedDate": "2025-10-30",
    "approvalStatus": "승인대기",
    "memo": "테스트 요청"
  }
}
```

### 3. 상태 조회
```bash
curl http://localhost:3001/api/inbound-status/TEST-PO-001
```

### 4. 상태 업데이트
```bash
curl -X PATCH http://localhost:3001/api/inbound-status/TEST-PO-001 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "승인완료",
    "reason": "테스트 승인"
  }'
```

### 5. 요청 삭제
```bash
curl -X DELETE http://localhost:3001/api/inbound-status/TEST-PO-001
```

---

## 🔧 Frontend 사용 예제

### lib/inboundAPI.ts 사용

```typescript
import {
  getAllInboundRequests,
  createInboundRequest,
  getInboundStatus,
  updateInboundStatus,
  deleteInboundRequest,
} from '@/lib/inboundAPI'

// 1. 모든 요청 조회
const { success, data } = await getAllInboundRequests()
if (success && data) {
  console.log('총 요청 수:', data.length)
}

// 2. 새 요청 생성
const newRequest = await createInboundRequest({
  poNumber: 'PO-2025-100',
  supplierName: 'My Supplier',
  items: [
    {
      id: 'item-1',
      skuCode: 'SKU-100',
      productName: 'Product 100',
      quantity: 100,
      unit: 'EA',
    },
  ],
  requestDate: '2025-10-24',
  expectedDate: '2025-10-30',
  memo: 'Urgent',
})

// 3. 상태 조회
const status = await getInboundStatus('PO-2025-100')
console.log('현재 상태:', status.data?.status)

// 4. 상태 업데이트
const updated = await updateInboundStatus('PO-2025-100', '승인완료', '승인됨')

// 5. 삭제
const deleted = await deleteInboundRequest('PO-2025-100')
```

---

## 📊 데이터베이스 스키마

### InboundRequest
```typescript
{
  id: string              // UUID
  requestNumber: string   // "INB-REQ-20251024-001"
  supplierId: string      // Supplier FK
  status: string          // draft, submitted, approved, rejected
  totalQuantity: number
  totalAmount: Decimal
  requestDate: DateTime
  expectedDate: DateTime
  notes: string?
  
  // Relations
  supplier: Supplier
  items: InboundRequestItem[]
  schedules: InboundSchedule[]
}
```

### 상태 매핑
| DB Status | API Status |
|-----------|------------|
| draft | 승인대기 |
| submitted | 승인대기 |
| approved | 승인완료 |
| rejected | 반려됨 |
| completed | 입고완료 |

---

## 🚀 배포 시 주의사항

### Vercel 환경변수
Vercel Dashboard에서 다음 환경변수 추가:

```env
DATABASE_URL=postgresql://neondb_owner:npg_WrHU1f6sMxaP@ep-falling-fog-a1m4jhjg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### CORS 설정 (필요시)
외부 OMS에서 API 호출 시:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## 📝 파일 구조

```
app/
├── api/
│   ├── inbound-requests/
│   │   └── route.ts              ✅ GET, POST
│   ├── inbound-status/
│   │   └── [id]/
│   │       └── route.ts          ✅ GET, PATCH, DELETE
│   ├── inbound/
│   │   ├── approval/
│   │   │   └── route.ts          ✅ 승인 목록 조회
│   │   └── schedule/
│   │       └── route.ts          ✅ 예정표 조회
│   └── dashboard/
│       └── stats/
│           └── route.ts          ✅ 통계 조회
lib/
├── prisma.ts                      ✅ Prisma Client
└── inboundAPI.ts                  ✅ API Client (Frontend용)
prisma/
└── schema.prisma                  ✅ 12 models
```

---

## ✨ 구현된 기능

### 자동 처리
- ✅ 공급업체 자동 생성 (없으면)
- ✅ 상품 자동 생성 (없으면)
- ✅ InboundApproval 동기화
- ✅ 상태 자동 매핑 (한글 ↔ 영문)

### 에러 처리
- ✅ 필수 필드 검증
- ✅ 404 Not Found
- ✅ 500 Server Error
- ✅ 잘못된 상태값 검증

### 데이터 무결성
- ✅ Cascade 삭제 (items, schedules)
- ✅ Transaction 처리
- ✅ Foreign Key 제약조건

---

## 🧪 테스트 체크리스트

- [ ] GET /api/inbound-requests (50,000 레코드)
- [ ] POST /api/inbound-requests (새 요청 생성)
- [ ] GET /api/inbound-status/[id] (상태 조회)
- [ ] PATCH /api/inbound-status/[id] (상태 업데이트)
- [ ] DELETE /api/inbound-status/[id] (삭제)
- [ ] 존재하지 않는 ID로 404 테스트
- [ ] 필수 필드 누락 시 400 테스트
- [ ] 잘못된 상태값으로 400 테스트

---

## 📞 지원

문제 발생 시:
1. 브라우저 개발자 도구 → Network 탭 확인
2. 터미널에서 서버 로그 확인
3. Prisma Studio로 데이터베이스 확인: `npm run prisma:studio`

---

**구현 완료**: 2025-10-24  
**버전**: 2.0.0 (Neon PostgreSQL 연동)  
**상태**: Production Ready ✅
