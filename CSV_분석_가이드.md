# 📊 CSV 모의 데이터 분석 완료

> 분석 가능한 재고 데이터가 준비되었습니다!

---

## 🎯 생성된 파일 (4개)

### 📄 1. **mock-inventory-data.csv** ⭐ 핵심 파일
- **크기:** 20개 상품 × 77개 필드
- **사용:** Excel, Google Sheets, Python 분석
- **특징:** 
  - 실제 데이터 구조와 동일
  - 필터링 가능한 모든 필드 포함
  - 한글 상품명으로 가독성 우수
- **용도:** 직접 분석 및 필터 테스트

```csv
# 샘플 데이터 (첫 2행)
id,productCode,productName,...,availableQuantity,marginPercentage,...
1,PROD-00001,에코 티셔츠 #1,...,1900,28.6,...
2,PROD-00002,데님 팬츠 #2,...,1,22.2,...
```

---

### 📊 2. **inventory_analysis_result.csv** (자동 생성)
- **특징:** Python 분석 결과 포함
- **추가 컬럼:** 회전율(%), 액션(권고사항)
- **용도:** 의사결정 가이드

```csv
id,productCode,productName,category,quantity,...,회전율%,액션
1,PROD-00001,에코 티셔츠 #1,의류,2500,...,12.0,✅ 정상
2,PROD-00002,데님 팬츠 #2,의류,5,...,3000.0,🚨 긴급 재발주
```

**액션 코드 의미:**
- ✅ 정상 → 현상 유지
- 🚨 긴급 재발주 → 즉시 조치
- 🟡 할인 판매 → 1주 내 조치
- ❌ 재고 정리 → 폐기/반품 검토

---

### 🐍 3. **analyze_inventory.py** (자동화 스크립트)
- **실행:** `python3 analyze_inventory.py`
- **결과:** 6개 섹션 상세 분석
- **재사용:** 실제 데이터 분석 시 활용 가능

```python
# 사용 방법
class InventoryAnalyzer:
    ├─ 요약통계()           # 기본 통계
    ├─ 판매상태_분석()      # 상태별 분석
    ├─ 위험_상품_식별()     # 경고 상품
    ├─ 위치별_분석()        # 건물/구역
    ├─ 당일_입출고()        # 일일 흐름
    ├─ 수익성_분석()        # 마진율
    ├─ 회전율_분석()        # 회전율
    ├─ CSV_내보내기()       # 결과 저장
    └─ 최종_요약()          # 권고사항
```

---

### 📚 4. **문서들**

| 파일명 | 목적 | 읽는 순서 |
|--------|------|----------|
| **INVENTORY_DATA_SCHEMA.md** | 데이터 구조 정의 | 1️⃣ 기초 |
| **DATA_ANALYSIS_GUIDE.md** | 상세 분석 가이드 | 2️⃣ 학습 |
| **ANALYSIS_REPORT.md** | 분석 결과 및 액션 | 3️⃣ 의사결정 |
| **CSV_분석_가이드.md** | 이 문서 | 📍 지금 |

---

## 🚀 3가지 분석 방법

### 방법 1️⃣ **Excel/Google Sheets (가장 쉬움)**

#### Google Sheets
```
1. sheets.google.com 열기
2. 파일 > 새로 만들기 > 스프레드시트
3. 파일 > 가져오기
4. mock-inventory-data.csv 업로드
5. 데이터 > 필터 > 필터 만들기
6. 각 컬럼 필터링 시작
```

#### Excel
```
1. 파일 > 열기
2. mock-inventory-data.csv 선택
3. 데이터 > 자동 필터
4. 각 컬럼의 드롭다운 클릭
5. 원하는 조건 선택
```

**장점:** 직관적, 드래그&드롭 가능  
**단점:** 대규모 분석은 느림  
**추천:** 빠른 확인, 특정 상품 조회

---

### 방법 2️⃣ **Python 자동분석 (가장 빠름)**

```bash
# 터미널에서 실행
cd /Users/sotatekthor/Desktop/wms-wf
python3 analyze_inventory.py
```

**출력 내용:**
```
✅ 데이터 로드 완료: 20개 상품
─────────────────────────────────
📈 기본 통계
├─ 총 재고: 33,385개
├─ 가용재고: 23,316개 (61.1%)
└─ 재고액: 826.4M원

📉 판매상태별 분석
├─ 판매중: 15개
├─ 품절: 2개
└─ 단종: 3개

⚠️ 주의 필요 상품 식별
├─ 긴급: 2개
├─ 할인: 5개
└─ 품절: 2개

... (6개 섹션 계속)

✅ 분석 결과 저장: inventory_analysis_result.csv
```

**장점:** 일관성, 재현성, 속도  
**단점:** 코드 수정 필요시 개발 필요  
**추천:** 자동화, 정기적 분석, 대규모 데이터

---

### 방법 3️⃣ **SQL 쿼리 (대규모 데이터)**

데이터베이스에 import 후 실행:

```sql
-- 가용율 낮은 상품
SELECT productCode, productName, availableQuantity, 
       availabilityRate, quantity
FROM inventory
WHERE availabilityRate < 50
ORDER BY availabilityRate ASC;

-- 카테고리별 재고액
SELECT category, COUNT(*) as count, SUM(quantity) as qty,
       SUM(totalStockValue) as value, AVG(marginPercentage) as margin
FROM inventory
GROUP BY category
ORDER BY value DESC;

-- 미판매 상품 정리 필요
SELECT productCode, productName, daysWithoutOrder, 
       totalStockValue, saleStatusText
FROM inventory
WHERE daysWithoutOrder > 100
   OR saleStatus = 'sold_out'
   OR saleStatus = 'discontinued'
ORDER BY daysWithoutOrder DESC;
```

**장점:** 강력함, 복잡한 쿼리 가능, 빠름  
**단점:** DB 필요, SQL 문법 숙지 필요  
**추천:** 데이터 많을 때, 복합 조건 분석

---

## 📊 분석 결과 스냅샷

### 🔴 긴급 조치 (24시간 내)

| 상품 | 상태 | 가용 | 필요액션 | 우선순위 |
|------|------|------|---------|---------|
| 데님 팬츠 #2 | 품절 | 1/5 | 재발주 500개 | 🚨 P0 |
| 정장 구두 #8 | 품절 | 25/120 | 재발주 300개 | 🚨 P0 |

**비용:** ~20M원 / **기간:** 3-5일

---

### 🟡 할인 판매 필요 (1주 내)

| 상품 | 미주문일수 | 재고액 | 할인율 | 액션 |
|------|----------|--------|--------|------|
| 숄더백 | 210일 | 17.1M | 30% | 🟡 |
| 캐주얼 셔츠 | 200일 | 2.9M | 폐기 | ❌ |
| 반지 | 150일 | 9.5M | 20% | 🟡 |

**비용:** ~10M원 / **기간:** 2-3일

---

### 💡 기회 영역

| 카테고리 | 회전율 | 마진율 | 액션 |
|---------|--------|--------|------|
| 가방 | 19.5% ⭐ | 29.1% | 발주 2배 ↑ |
| 신발 | 17.0% ⭐ | 28.7% | 발주 1.5배 ↑ |
| 액세서리 | 12.3% ⚠️ | 36.4% ⭐ | 마케팅 강화 |
| 의류 | 16.0% | 26.7% | 마진율 개선 |

---

## 🎯 즉시 확인해야 할 것 (5분)

### 1단계: CSV 파일 열기
```
Excel 또는 Google Sheets에서 mock-inventory-data.csv 열기
```

### 2단계: 기본 필터 설정
- `availabilityRate` 필터 → 30 이하 선택 (2개 상품)
- `daysWithoutOrder` 필터 → 100 이상 선택 (5개 상품)
- `saleStatus` 필터 → "sold_out" 선택 (2개 상품)

### 3단계: 간단한 차트 만들기
- X축: category (카테고리)
- Y축: SUM(totalStockValue) (재고액)
- 결과: 의류 53% 집중도 확인

### 4단계: Python 분석 실행 (선택)
```bash
python3 analyze_inventory.py > analysis.txt
# 전체 분석 결과를 파일로 저장
```

---

## ❓ FAQ

### Q. 모의 데이터와 실제 데이터의 차이?
**A.** 구조는 완벽하게 동일합니다. 숫자만 다릅니다. 실제 데이터로 교체만 하면 동일한 분석 가능합니다.

### Q. 필터는 어떻게 만드나?
**A.** CSV를 Excel/Sheets에 로드한 후 `데이터 > 필터` 메뉴에서 자동으로 생성됩니다. 각 컬럼 헤더의 화살표를 클릭해 조건 설정.

### Q. Python 없이도 분석 가능?
**A.** 네, 완벽합니다! Excel/Google Sheets만으로도 모든 분석 가능. Python은 자동화 / 대규모 데이터용입니다.

### Q. 분석 결과를 정기적으로 갱신하려면?
**A.** 
```bash
# 매주/매월 실행
1. 최신 CSV 다운로드 (데이터베이스에서)
2. python3 analyze_inventory.py 실행
3. 결과 비교 (이전 결과와)
```

### Q. 필터 드롭다운 없으면?
**A.** 
- Excel: 데이터 선택 → 데이터 > 자동 필터
- Sheets: 데이터 선택 → 데이터 > 필터 > 필터 만들기

### Q. 이 데이터를 필터 개발에 사용?
**A.** 맞습니다! 이 CSV로 필터 프론트엔드/백엔드 모두 테스트 가능합니다.

---

## 📚 학습 경로

```
1단계 (20분): CSV 파일 로드 및 기본 필터 설정
   └─ mock-inventory-data.csv를 Excel/Sheets에서 열기
   └─ availabilityRate로 필터 테스트

2단계 (30분): 상세 분석 이해
   └─ DATA_ANALYSIS_GUIDE.md 읽기
   └─ Python 분석 결과 검토

3단계 (15분): 의사결정
   └─ ANALYSIS_REPORT.md의 액션 플랜 검토
   └─ P0/P1/P2 우선순위 확인

4단계 (선택): 자동화 구성
   └─ analyze_inventory.py 커스터마이징
   └─ 실제 데이터 연동
```

---

## ✅ 체크리스트

필터 개발 전에 확인:

- [ ] CSV 파일 다운로드 완료
- [ ] Excel 또는 Google Sheets에서 열기 성공
- [ ] 기본 필터 설정 완료 (3개 이상)
- [ ] 데이터 구조 이해 (77개 필드)
- [ ] Python 분석 결과 검토
- [ ] 액션 플랜 검토 (P0/P1/P2)
- [ ] 필터 개발 요구사항 정의
- [ ] 백엔드 API 설계 시작

---

## 🎓 다음 단계

### 1. 필터 UI 개발
```
필터 패널 구성:
├─ 기본 검색 (productName, barcode, sku)
├─ 카테고리 필터
├─ 상태 필터 (판매상태, 재고상태)
├─ 수치 범위 필터 (가용률, 마진율)
└─ 날짜 범위 필터
```

### 2. 백엔드 API 개발
```
GET /api/inventory/list
  ?category=의류
  &availabilityRate_min=50
  &availabilityRate_max=100
  &saleStatus=selling
  &sortBy=totalStockValue
  &order=DESC
  &limit=50
```

### 3. 데이터베이스 설계
```
Prisma Schema 완성 → 마이그레이션 → 시드 데이터 로드
```

### 4. 통합 테스트
```
필터 조합 테스트: 5개 이상 필터 동시 적용 테스트
```

---

## 📞 문의

이 데이터로 부족한 부분이나 추가 필요 필드가 있으면:

1. `INVENTORY_DATA_SCHEMA.md` 필드 추가
2. Python 스크립트 수정
3. CSV 재생성

---

**🎉 준비 완료!**

이제 필터를 개발하거나 더 깊이 있는 분석을 시작할 수 있습니다.  
CSV 파일로 충분히 테스트하고, 실제 데이터는 나중에 연동하면 됩니다!

