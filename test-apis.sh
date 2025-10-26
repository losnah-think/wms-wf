#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 결과 변수
TOTAL=0
SUCCESS=0
FAILED=0

# API 엔드포인트 배열
ENDPOINTS=(
  "/api/dashboard/stats"
  "/api/warehouse"
  "/api/inbound-outbound"
  "/api/stock/status"
  "/api/products"
  "/api/users"
  "/api/inbound/schedule"
  "/api/inbound/approval"
  "/api/picking/packing-list"
  "/api/picking/packing"
  "/api/shipping/list"
  "/api/shipping/carrier"
  "/api/returns/request"
  "/api/returns/process"
  "/api/returns/status"
  "/api/return-picking"
  "/api/reports/daily"
  "/api/reports/sales"
  "/api/reports/turnover"
  "/api/reports/weekly"
  "/api/reports/custom"
  "/api/barcode/generate"
  "/api/stock/movement"
  "/api/config/alerts"
  "/api/config/system"
  "/api/picking/efficiency"
  "/api/picking/queue"
  "/api/shipping/cancel"
  "/api/shipping/notify"
  "/api/returns/classify"
  "/api/stock/trends"
  "/api/inbound/manual"
  "/api/picking/assign"
  "/api/returns/inspect"
  "/api/outbound/manual"
)

echo "🧪 WMS API 엔드포인트 테스트 시작..."
echo "========================================"
echo ""

# 각 엔드포인트 테스트
for endpoint in "${ENDPOINTS[@]}"; do
  TOTAL=$((TOTAL + 1))
  
  # API 호출
  RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3001${endpoint}?limit=1")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  # HTTP 코드 확인
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅${NC} $endpoint (HTTP $HTTP_CODE)"
    SUCCESS=$((SUCCESS + 1))
  else
    echo -e "${RED}❌${NC} $endpoint (HTTP $HTTP_CODE)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "========================================"
echo "📊 테스트 결과 요약"
echo "========================================"
echo -e "총 테스트: $TOTAL"
echo -e "${GREEN}성공: $SUCCESS${NC}"
echo -e "${RED}실패: $FAILED${NC}"
echo ""

# 성공률 계산
SUCCESS_RATE=$((SUCCESS * 100 / TOTAL))
echo -e "성공률: ${GREEN}${SUCCESS_RATE}%${NC}"

echo ""
echo "========================================"
echo "✨ 테스트 완료"
echo "========================================"

