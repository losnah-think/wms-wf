# WMS 기능 요구사항 및 구현 현황

## 📊 구현 진행률

전체: 154개 기능
- ✅ 완료: 10개 (6%)
- 🚧 진행중: 3개 (2%)
- ⏳ 대기: 141개 (92%)

---

## 1. 재고 관리 (STK - Stock Management)

| ID | 기능명 | 상태 | API 엔드포인트 | 페이지 |
|---|---|---|---|---|
| STK-001 | 상품 정보 조회 | ✅ | `GET /api/products` | `/products` |
| STK-002 | 재고 수량 조회 | ✅ | `GET /api/stock/[id]` | - |
| STK-003 | 입고 처리 (수동) | ⏳ | - | - |
| STK-004 | 출고 처리 (수동) | ⏳ | - | - |
| STK-005 | 바코드 스캔 | ⏳ | - | - |
| STK-006 | 창고별 재고 현황 | ✅ | `GET /api/warehouse/[id]/stock` | `/warehouse` |
| STK-007 | 바코드 생성 | ⏳ | - | - |
| STK-008 | 입고 예정일 관리 | 🚧 | `GET /api/inbound/schedule` | `/inbound/schedule` |
| STK-009 | CSV 대량 입력 | ⏳ | - | - |
| STK-010 | 재고 실사 | ⏳ | - | - |
| STK-011 | 재고 상태 변경 | ⏳ | - | - |
| STK-012 | 가용 재고 조회 | ⏳ | - | - |
| STK-013 | 재고 이동 추적 | ⏳ | - | - |
| STK-014 | 월별 재고 동향 | ⏳ | - | - |
| STK-015 | 재고 공실 경고 | ⏳ | - | - |

---

## 2. 피킹 관리 (PIC - Picking Management)

| ID | 기능명 | 상태 | API 엔드포인트 | 페이지 |
|---|---|---|---|---|
| PIC-001 | 피킹 대기 주문 | ⏳ | - | - |
| PIC-002 | 피킹 작업 할당 | ⏳ | - | - |
| PIC-003 | 개별 상품 피킹 | ⏳ | - | - |
| PIC-004 | 바코드 검증 | ⏳ | - | - |
| PIC-005 | 패킹 리스트 생성 | ⏳ | - | - |
| PIC-006 | 배송 태그 출력 | ⏳ | - | - |
| PIC-007 | 작업자별 효율 | ⏳ | - | - |
| PIC-008 | 일일 피킹 현황 | ⏳ | - | - |
| PIC-009 | 다중 주문 묶음 | ⏳ | - | - |
| PIC-010 | 반품 피킹 | ⏳ | - | - |

---

## 3. 반품 관리 (RET - Return Management)

| ID | 기능명 | 상태 | API 엔드포인트 | 페이지 |
|---|---|---|---|---|
| RET-001 | 반품 요청 등록 | ⏳ | - | - |
| RET-002 | 반품 상품 검수 | ⏳ | - | - |
| RET-003 | 불량 상품 분류 | ⏳ | - | - |
| RET-004 | 반품 현황 조회 | ⏳ | - | - |
| RET-005 | 반품율 분석 | ⏳ | - | - |
| RET-006 | 교환 처리 | ⏳ | - | - |
| RET-007 | 환불 관리 | ⏳ | - | - |

---

## 4. 출고/배송 관리 (OUT - Outbound/Shipping Management)

| ID | 기능명 | 상태 | API 엔드포인트 | 페이지 |
|---|---|---|---|---|
| OUT-001 | 배송 처리 | ⏳ | - | - |
| OUT-002 | 배송사 연동 | ⏳ | - | - |
| OUT-003 | 배송 추적 | ⏳ | - | - |
| OUT-004 | 배송 지연 경고 | ⏳ | - | - |
| OUT-005 | 해외 배송 연동 | ⏳ | - | - |

---

## 5. 사용자/권한 관리 (USER - User Management)

| ID | 기능명 | 상태 | API 엔드포인트 | 페이지 |
|---|---|---|---|---|
| USER-001 | 사용자 관리 | ⏳ | - | - |
| USER-002 | 권한 관리 | ⏳ | - | - |
| USER-003 | 로그인/로그아웃 | ⏳ | - | - |
| USER-004 | 작업 로그 기록 | ⏳ | - | - |

---

## 6. 리포트/통계 (RPT - Reports)

| ID | 기능명 | 상태 | API 엔드포인트 | 페이지 |
|---|---|---|---|---|
| RPT-001 | 일일 거래 통계 | ⏳ | - | - |
| RPT-002 | 주간 요약 대시보드 | 🚧 | `GET /api/dashboard/stats` | `/` |
| RPT-003 | 월별 재고 리포트 | ⏳ | - | - |
| RPT-004 | 상품별 판매량 | ⏳ | - | - |
| RPT-005 | 재고 회전율 | ⏳ | - | - |
| RPT-006 | 외주 처리량 | ⏳ | - | - |

---

## 7. 설정 관리 (CFG - Configuration)

| ID | 기능명 | 상태 | API 엔드포인트 | 페이지 |
|---|---|---|---|---|
| CFG-001 | 창고 설정 | ⏳ | - | - |
| CFG-002 | 배송사 설정 | ⏳ | - | - |
| CFG-003 | 상품 분류 | ⏳ | - | - |
| CFG-004 | 규칙 설정 | ⏳ | - | `/system/rules` |

---

## 8. 입고 관리 (INB - Inbound Management)

| ID | 기능명 | 상태 | API 엔드포인트 | 페이지 |
|---|---|---|---|---|
| INB-001 | 입고 요청 조회 | ✅ | `GET /api/inbound-requests` | `/inbound/request` |
| INB-002 | 입고 요청 생성 | ✅ | `POST /api/inbound-requests` | - |
| INB-003 | 입고 상태 조회 | ✅ | `GET /api/inbound-status/[id]` | - |
| INB-004 | 입고 상태 업데이트 | ✅ | `PATCH /api/inbound-status/[id]` | - |
| INB-005 | 입고 요청 삭제 | ✅ | `DELETE /api/inbound-status/[id]` | - |
| INB-006 | 입고 승인 목록 | ✅ | `GET /api/inbound/approval` | `/inbound/approval` |
| INB-007 | 입고 예정표 | ✅ | `GET /api/inbound/schedule` | `/inbound/schedule` |

---

## 📝 우선순위

### Phase 1 (진행중) - 핵심 재고/입출고
- ✅ 입고 관리 (INB-001~007)
- 🚧 재고 관리 (STK-001, 002, 006)
- ⏳ 출고 관리 기본 (OUT-001)

### Phase 2 (다음) - 피킹/패킹
- ⏳ 피킹 관리 (PIC-001~006)
- ⏳ 바코드 기능 (STK-005, 007, PIC-004)

### Phase 3 - 반품/교환
- ⏳ 반품 관리 (RET-001~007)

### Phase 4 - 고급 기능
- ⏳ 재고 분석 (STK-013~015)
- ⏳ 리포트/통계 (RPT-001~006)
- ⏳ 배송사 연동 (OUT-002, 003, 005)

### Phase 5 - 관리/설정
- ⏳ 사용자 관리 (USER-001~004)
- ⏳ 설정 관리 (CFG-001~004)

---

## 🔧 기술 스택

- **Backend**: Next.js 14 API Routes
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Frontend**: React 18, TypeScript
- **Styling**: CSS Modules
- **i18n**: next-intl (ko, en, vi)

---

**최종 업데이트**: 2025-10-24
**현재 버전**: 0.2.0
