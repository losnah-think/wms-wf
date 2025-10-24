# 🚀 WMS 프로젝트 프롬프트 가이드 - VSCode에서 직접 실행하기

Claude, GPT, 또는 다른 AI 모델을 사용해서 유사한 프로젝트를 만들 때 사용하는 프롬프트 가이드입니다.

---

## 🎯 VSCode에서 AI 사용하는 3가지 방법

### 방법 1️⃣: VS Code 확장 설치 (가장 쉬움)

#### Codeium, Copilot 또는 Claude 확장 사용

```
1. VSCode 열기
2. Extensions (Ctrl+Shift+X) 클릭
3. "Claude" 또는 "Codeium" 검색
4. 확장 설치
5. 로그인
6. 왼쪽 사이드바에서 아이콘 클릭
```

### 방법 2️⃣: Chat 기반 (claude.ai에서)

```
1. https://claude.ai 열기
2. 아래의 프롬프트 복사 & 붙여넣기
3. 엔터 키 또는 Send 클릭
4. 결과물을 VSCode에 붙여넣기
```

### 방법 3️⃣: 커스텀 워크플로우

```
1. 이 가이드의 프롬프트 사용
2. 단계별로 AI에게 명령
3. 한 단계씩 코드 생성 받기
```

---

## 📋 프롬프트 템플릿 (복사 & 붙여넣기)

---

### 🔷 프롬프트 1: 프로젝트 초기 설정

```
너는 Next.js 웹 개발 전문가야. 
다음과 같은 프로젝트를 만들어줘:

프로젝트명: WMS (Warehouse Management System)
프레임워크: Next.js 14+ with TypeScript
스타일: Low Fidelity (그레이톤만 사용, Comfortaa 폰트)
배포: Vercel

다음 구조로 생성해줘:
- package.json (의존성: next, react, react-dom)
- tsconfig.json
- next.config.js
- app/layout.tsx
- app/page.tsx (대시보드)
- app/globals.css (전역 스타일)

컬러 팔레트:
- 흰색: #ffffff
- 검은색: #333333
- 회색: #666666, #999999, #cccccc, #e8e8e8
- 배경: #f5f5f5

폰트: Comfortaa (Google Fonts)

파일 구조:
wms-nextjs/
├── app/
├── components/
├── lib/
├── package.json
└── public/

각 파일의 전체 코드를 제시해줘.
```

---

### 🔷 프롬프트 2: 공통 UI 컴포넌트 생성

```
다음의 재사용 가능한 UI 컴포넌트를 TypeScript/React로 만들어줘:

위치: components/UI.tsx
스타일 파일: components/UI.module.css

컴포넌트 리스트:
1. Card - 기본 카드 (title 옵션)
2. StatCard - 통계 카드 (label, value, subtitle)
3. Badge - 상태 배지 (type 옵션)
4. Button - 버튼 (variant: primary/secondary, size: sm/md/lg)
5. Table - 테이블 (columns, data)
6. Section - 섹션 래퍼 (title, actions)
7. Grid - 그리드 (columns prop)
8. Input - 입력 필드 (label, placeholder, type, value, onChange)
9. Select - 선택 드롭다운 (label, options, value, onChange)
10. SearchBar - 검색바 (placeholder, onSearch)

스타일 요구사항:
- Low Fidelity 디자인 유지
- 모든 색상은 그레이톤만 사용
- Comfortaa 폰트
- CSS Modules 사용
- 반응형 (모바일 고려)

각 컴포넌트는:
- Props 타입 정의
- 기본값 포함
- 호버 효과 포함
- 접근성 고려

전체 코드를 제시해줘.
```

---

### 🔷 프롬프트 3: 레이아웃 컴포넌트

```
다음의 레이아웃 컴포넌트를 만들어줘:

1. components/Sidebar.tsx
   - 메뉴 구조: menuSections (lib/navigation.ts에서 import)
   - 활성 상태 표시 (usePathname 사용)
   - 섹션별 그룹화
   - 클릭 시 하이라이트

2. components/Sidebar.module.css
   - 너비: 220px
   - 배경: #f0f0f0
   - 활성 항목: #333 배경 + 흰색 텍스트

3. components/Header.tsx
   - 로고 "WMS"
   - 팀 선택 드롭다운
   - 프로필 버튼
   - props: title, subtitle, actions

4. components/Header.module.css
   - 높이: 60px
   - 배경: #f8f8f8
   - 하단 보더: 2px solid #999

5. components/Layout.tsx
   - Sidebar + Header + 메인 콘텐츠
   - props: children, title, subtitle, actions
   - 반응형 레이아웃 (모바일에서 flexbox 변경)

각 파일의 완전한 코드를 제시해줘.
```

---

### 🔷 프롬프트 4: 메뉴 구조 정의

```
lib/navigation.ts 파일을 만들어줘:

메뉴 구조 (8개 섹션, 21개 항목):

1. Dashboard (1개)
   - Dashboard: /

2. Inventory (7개)
   - Products: /products
   - Warehouse: /warehouse
   - Stock Status: /stock-status
   - Stock Settings: /stock-settings
   - Inbound/Outbound: /inbound-outbound
   - Advanced: /advanced-inventory
   - Return Picking: /return-picking

3. Picking (3개)
   - Picking Mgmt: /picking
   - Packing Mgmt: /packing
   - Workers: /workers

4. Returns (3개)
   - Return Request: /returns/request
   - Processing: /returns/process
   - Status: /returns/status

5. Shipping (2개)
   - Shipments: /shipping
   - Settings: /shipping/settings

6. Reports (2개)
   - Current Report: /reports/current
   - Analysis: /reports/analysis

7. System (1개)
   - Operation Rules: /system/rules

TypeScript 인터페이스로 정의해줘:
- MenuItem 인터페이스
- MenuSection 인터페이스
- menuSections 배열
- getMenuItemByHref() 함수
- getAllMenuItems() 함수

완전한 코드를 제시해줘.
```

---

### 🔷 프롬프트 5: 페이지 생성 (대시보드)

```
다음 페이지를 만들어줘:

파일: app/page.tsx (대시보드)

요구사항:
- Layout 컴포넌트 사용
- 제목: "Dashboard"
- 부제목: "Dashboard"

섹션 1: Today's Status
- 4개 StatCard (Grid columns=4)
  * Inbound: 48 items
  * Outbound: 73 items
  * Picking: 95 in progress
  * Returns: 5 pending

섹션 2: Work Summary
- Section 컴포넌트
- Refresh 버튼 (actions)
- Table:
  * 열: Item, Status, Count, Time, Action
  * 행 3개:
    - Inbound, In Progress, 48, Today, View
    - Outbound, Completed, 73, Today, View
    - Picking, In Progress, 95, Today, View
- 각 Status는 Badge 컴포넌트 사용

완전한 TypeScript 코드를 제시해줘.
```

---

### 🔷 프롬프트 6: 다른 페이지들 생성

```
다음 페이지들을 만들어줘:

1. app/stock-status/page.tsx
   - 제목: "Stock Status"
   - 부제목: "Inventory > Stock Status"
   - 액션: Export, Refresh 버튼
   - 섹션: "Inventory Status"
   - 필터: 창고 선택, 검색창
   - 테이블:
     * 열: Product Name, Barcode, Quantity, Available, Status
     * 4개 행 데이터

2. app/picking/page.tsx
   - 제목: "Picking Management"
   - 부제목: "Picking > Picking Mgmt"
   - 액션: Assign Task, Refresh 버튼
   - 필터: Status, Worker 드롭다운
   - 테이블:
     * 열: Order #, Items, Assigned To, Status, Time
     * 4개 행 데이터

3. app/returns/request/page.tsx
   - 제목: "Return Requests"
   - 부제목: "Returns > Request"
   - 액션: New Return, Refresh 버튼
   - 2 Column 레이아웃:
     왼쪽: Return List 테이블
     오른쪽: Register New Return 폼
   - 폼 필드: Order Number, Return Reason, Quantity, Notes

4. app/shipping/page.tsx
   - 제목: "Shipping Management"
   - 부제목: "Shipping > Shipments"
   - 액션: Track, Refresh 버튼
   - 필터: Status, Carrier 드롭다운
   - 테이블:
     * 열: Ship #, Tracking #, Carrier, Status, ETA
     * 3개 행 데이터

모든 파일의 완전한 코드를 제시해줘.
```

---

### 🔷 프롬프트 7: 플레이스홀더 페이지들

```
다음 플레이스홀더 페이지들을 만들어줘:
(구조만 만들고 "Coming Soon" 메시지 표시)

1. app/products/page.tsx - 상품 관리
2. app/warehouse/page.tsx - 창고 관리
3. app/stock-settings/page.tsx - 재고 설정
4. app/inbound-outbound/page.tsx - 입고/출고
5. app/advanced-inventory/page.tsx - 고급 재고
6. app/return-picking/page.tsx - 반품 피킹
7. app/packing/page.tsx - 패킹 관리
8. app/workers/page.tsx - 작업자 관리
9. app/returns/process/page.tsx - 반품 처리
10. app/returns/status/page.tsx - 반품 현황
11. app/shipping/settings/page.tsx - 배송 설정
12. app/reports/current/page.tsx - 현황 리포트
13. app/reports/analysis/page.tsx - 분석 리포트
14. app/system/rules/page.tsx - 운영규칙

각 페이지는:
- Layout 사용
- 적절한 제목/부제목
- Section 컴포넌트
- "Page - Coming Soon" 메시지

모든 파일의 코드를 한 번에 제시해줘.
```

---

### 🔷 프롬프트 8: 설정 파일

```
다음 설정 파일들을 만들어줘:

1. package.json
   - name: wms-nextjs
   - scripts: dev, build, start, lint
   - dependencies: next, react, react-dom
   - devDependencies: typescript, @types/node, @types/react, @types/react-dom

2. tsconfig.json
   - TypeScript 설정 (Next.js 기본)
   - strict: false

3. next.config.js
   - reactStrictMode: true

4. .gitignore
   - node_modules, .next, .env*.local 등 일반적인 무시 항목

5. README.md
   - 프로젝트 설명
   - 설치 및 실행 방법
   - 프로젝트 구조
   - 배포 방법
   - 기술 스택

각 파일의 완전한 코드를 제시해줘.
```

---

## 💡 단계별 실행 방법 (VSCode)

### Step 1: 처음부터 시작

```bash
# 터미널에서 새 폴더 생성
mkdir wms-nextjs
cd wms-nextjs

# VSCode 열기
code .
```

### Step 2: 프롬프트 1부터 8까지 순차적으로 실행

```
1. VSCode에서 Claude 확장 열기
2. 프롬프트 1 복사 & 붙여넣기
3. 결과 코드를 해당 파일에 붙여넣기
4. 프롬프트 2 반복...
5. 모든 프롬프트 완료
```

### Step 3: 프로젝트 설정

```bash
npm install
npm run dev
```

---

## 🎯 각 프롬프트 결과를 저장할 위치

```
프롬프트 1 결과 → package.json, tsconfig.json, next.config.js, app/ 폴더 생성
프롬프트 2 결과 → components/UI.tsx, components/UI.module.css
프롬프트 3 결과 → components/Sidebar.tsx, Header.tsx, Layout.tsx 및 CSS
프롬프트 4 결과 → lib/navigation.ts
프롬프트 5 결과 → app/page.tsx
프롬프트 6 결과 → app/stock-status/page.tsx, app/picking/page.tsx 등
프롬프트 7 결과 → 나머지 플레이스홀더 페이지들
프롬프트 8 결과 → 설정 파일들
```

---

## 🔧 VSCode 팁

### 확장 설치 추천

1. **Codeium** (무료 AI)
   - Extensions에서 "Codeium" 검색
   - 자동 완성 + 채팅

2. **GitHub Copilot** (유료)
   - 가장 강력함
   - 코드 제안 우수

3. **Prettier** (포맷터)
   - 코드 자동 정렬

4. **ES7+ React/Redux/React-Native snippets**
   - 빠른 컴포넌트 생성

### 단축키

```
Ctrl+Shift+P  - 명령 팔레트 (파일 생성 등)
Ctrl+`        - 터미널 열기
Ctrl+/        - 코드 주석 처리
Shift+Alt+F   - 코드 포맷팅
```

---

## 📝 프롬프트 작성 팁

### ✅ 좋은 프롬프트

```
- 구체적인 요구사항 제시
- 코드 구조 명확히 지정
- 파일 위치 정확하게
- 스타일 가이드 포함
- 예제 데이터 제공
```

### ❌ 피해야 할 것

```
- 너무 모호한 요청
- 한 번에 너무 많은 것 요청
- 파일 위치 미지정
- 요구사항 불명확
```

---

## 🚀 빠른 실행 순서

```
1️⃣ 폴더 생성
   mkdir wms-nextjs
   cd wms-nextjs
   code .

2️⃣ 초기 설정 (프롬프트 1)
   → package.json 생성
   → 폴더 구조 생성

3️⃣ 컴포넌트 (프롬프트 2-3)
   → 재사용 가능한 컴포넌트
   → 레이아웃 컴포넌트

4️⃣ 구조 정의 (프롬프트 4)
   → 메뉴 정의

5️⃣ 페이지 (프롬프트 5-7)
   → 실제 페이지 생성

6️⃣ 설정 (프롬프트 8)
   → 최종 설정 파일

7️⃣ 실행
   npm install
   npm run dev
```

---

## 💾 저장하기

### GitHub에 올리기

```bash
git init
git add .
git commit -m "Initial: WMS Next.js"
git branch -M main
git remote add origin https://github.com/your-username/wms-nextjs.git
git push -u origin main
```

### Vercel에 배포

```bash
npm install -g vercel
vercel
```

---

## 🎓 학습 팁

1. **각 파일별로 나누기**: 한 번에 하나의 파일/컴포넌트만 요청
2. **피드백 주기**: "이 부분을 수정해줄 수 있어?"로 반복 개선
3. **테스트**: 각 단계 후 `npm run dev`로 확인
4. **버전 관리**: Git으로 진행 상황 저장

---

## 📞 문제 발생 시

### AI에게 질문할 때

```
"npm install 후 에러가 났어:
[에러 메시지 복사]

이 문제를 해결하려면 어떻게 해야 해?"
```

### 코드 개선 요청

```
"이 컴포넌트에서:
- 다크 모드 지원 추가
- 모바일 반응형 개선
- 접근성 향상

어떻게 수정해야 해?"
```

---

## 🎉 완성 후

- ✅ Vercel에 배포
- ✅ GitHub 공개
- ✅ 팀과 공유
- ✅ 실제 데이터 연동 시작
- ✅ 추가 기능 개발

---

**이 가이드로 완전한 프로젝트를 만들 수 있습니다! 🚀**