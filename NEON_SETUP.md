# 🗄️ Neon PostgreSQL 설정 가이드

## 📋 설정 단계

### 1️⃣ Neon 계정 생성 및 프로젝트 설정

1. https://neon.tech 방문
2. Google 또는 GitHub로 회원가입
3. 무료 계정 확인 (3GB 저장소, 3개 프로젝트)

### 2️⃣ 데이터베이스 생성

1. Neon 대시보드에서 "New Project" 클릭
2. 프로젝트 이름: `wms-wf` (또는 선호하는 이름)
3. 지역 선택: Asia-Pacific (서울 권장)
4. "Create" 클릭

### 3️⃣ 연결 문자열 복사

1. 프로젝트 생성 후 자동으로 표시되는 연결 문자열 복사
2. 또는 "Connection String" 탭에서 복사
3. 형식: `postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require`

### 4️⃣ 환경 변수 설정

`.env.local` 파일에 DATABASE_URL 설정:

```bash
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
```

### 5️⃣ 데이터베이스 마이그레이션

```bash
# Prisma 마이그레이션 실행
npm run db:migrate

# 또는 직접 푸시 (개발 환경)
npx prisma db push
```

### 6️⃣ 50만 건 모의 데이터 생성

```bash
# 시드 데이터 실행
npm run db:seed
```

예상 시간: 3-5분 (50,000건 생성)

### 7️⃣ Prisma Studio에서 데이터 확인

```bash
npm run prisma:studio
```

브라우저에서 http://localhost:5555 열기

---

## 📊 생성되는 데이터

### Suppliers (공급사)
- **수량**: 8개
- **정보**: 이름, 코드, 이메일, 타입

### Products (상품)
- **수량**: 10개
- **정보**: 코드, 이름, 바코드, SKU, 가격

### Warehouse (창고)
- **수량**: 1개
- **정보**: 메인 창고

### Zones (존)
- **수량**: 4개 (Zone A, B, C, D)

### Locations (로케이션)
- **수량**: 20개 (각 존당 5개)

### InboundRequests (입고 요청) ⭐
- **수량**: 50,000건
- **정보**:
  - 요청 번호 (자동 생성)
  - 공급사 (랜덤 선택)
  - 상태 (submitted 70%, approved 30%)
  - 수량 (100-1,100개 랜덤)
  - 금액 (1,000-11,000 랜덤)
  - 요청일 (과거 90일 이내)
  - 예정일 (요청일 + 3-14일)

### InboundSchedules (입고 예정) ⭐
- **수량**: 50,000건 (요청당 1개)
- **정보**:
  - 일정 번호 (자동 생성)
  - 상태 (pending, on-schedule, delayed, arrived 균등 분배)
  - 예정일
  - 예상 도착일
  - 배송사 (5개 랜덤 선택)
  - 추적번호 (자동 생성)
  - 수량 (요청 수량과 동일)

### InboundApprovals (입고 승인) ⭐
- **수량**: 50,000건 (요청당 1개)
- **정보**:
  - 승인 번호 (자동 생성)
  - 상태 (approved 80%, pending 20%)
  - 승인자명 (랜덤 1-10 중 선택)
  - 승인일 (생성 시간)
  - 할당된 존

---

## 🔧 Prisma 주요 명령어

```bash
# 데이터베이스 스키마 푸시
npx prisma db push

# 마이그레이션 생성
npm run db:migrate

# 시드 데이터 실행
npm run db:seed

# Prisma Studio 시작
npm run prisma:studio

# 생성된 클라이언트 코드 확인
npx prisma generate

# 데이터베이스 리셋 (주의!)
npx prisma db reset
```

---

## 📝 Neon 대시보드에서 수행 가능한 작업

### SQL 쿼리 실행
1. Neon 대시보드 → "SQL Editor"
2. 직접 SQL 쿼리 작성 및 실행

### 테이블 조회
```sql
-- 입고 요청 수 확인
SELECT COUNT(*) FROM "InboundRequest";

-- 입고 예정 상태별 집계
SELECT status, COUNT(*) as count FROM "InboundSchedule" GROUP BY status;

-- 공급사별 요청 수
SELECT s.name, COUNT(ir.id) as count 
FROM "InboundRequest" ir 
JOIN "Supplier" s ON ir."supplierId" = s.id 
GROUP BY s.id, s.name;
```

---

## ⚠️ 주의사항

1. **무료 저장소**: 3GB
   - 50만 건 데이터 ≈ 300-400MB (충분)
   - 추가 데이터는 신중하게 추가

2. **콜드 스타트**: 유휴 프로젝트는 자동 일시중단
   - 첫 요청 시 1-2초 지연 발생 가능
   - 정상 작동

3. **백업**: 자동 백업 없음
   - 중요한 데이터는 별도 백업 권장

4. **성능**: 프리 플랜에서 충분한 성능
   - 50만 건 쿼리 응답 시간: 1-3초

---

## 🚀 다음 단계

1. **API 라우트 생성**: `/app/api/inbound` 경로에 API 엔드포인트 생성
2. **페이지 데이터 연동**: Prisma로 실제 데이터 조회
3. **페이지네이션**: 50만 건 데이터 조회 시 페이지 처리
4. **필터링**: 상태, 날짜, 공급사별 필터링
5. **검색**: 요청번호, 공급사 검색

---

## 💬 문제 해결

### 데이터베이스 연결 오류
- `.env.local` 파일 확인
- DATABASE_URL이 정확한지 확인
- Neon 대시보드에서 연결 상태 확인

### 마이그레이션 오류
```bash
# 스키마 리셋 (개발 환경만)
npx prisma db reset

# 다시 마이그레이션
npm run db:migrate
```

### 시드 데이터 실행 오류
```bash
# ts-node 재설치
npm install -D ts-node

# 다시 실행
npm run db:seed
```

---

## 📚 참고 자료

- [Neon 공식 문서](https://neon.tech/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Neon + Prisma 튜토리얼](https://neon.tech/docs/guides/prisma)
