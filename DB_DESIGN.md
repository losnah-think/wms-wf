# WMS (창고관리 시스템) DB 설계

## 1. 데이터베이스 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    WMS DATABASE                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Master     │  │   Inventory  │  │   Movement   │     │
│  │   Tables     │  │   Tables     │  │   Tables     │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ • Warehouse  │  │ • Stock      │  │ • Inbound    │     │
│  │ • Location   │  │ • StockAudit │  │ • Outbound   │     │
│  │ • Product    │  │ • SKU        │  │ • Movement   │     │
│  │ • Zone       │  │              │  │ • History    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Receiving   │  │   Alerts     │  │   Audit      │     │
│  │  Tables      │  │   Tables     │  │   Tables     │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ • Receiving  │  │ • Alert      │  │ • AuditLog   │     │
│  │ • GRN        │  │ • AlertHist  │  │ • UserAction │     │
│  │              │  │              │  │ • SystemLog  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 상세 테이블 정의

### 📦 마스터 테이블 (Master Tables)

#### 2.1 warehouse (창고)

```sql
CREATE TABLE warehouse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,          -- WH-001
  name VARCHAR(100) NOT NULL,                -- Main Warehouse
  description TEXT,
  
  -- 주소 정보
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zipCode VARCHAR(20),
  country VARCHAR(50),
  
  -- 물리적 정보
  totalCapacity FLOAT,                       -- 총 용량 (m³ 또는 개수)
  totalArea FLOAT,                           -- 창고 면적 (m²)
  noOfZones INT,                             -- 구역 수
  noOfRacks INT,                             -- 랙 수
  noOfLocations INT,                         -- 위치 수
  
  -- 담당자
  managerId UUID REFERENCES users(id),
  managerName VARCHAR(100),
  contactPhone VARCHAR(20),
  contactEmail VARCHAR(100),
  
  -- 운영 정보
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  operationHours VARCHAR(50),                -- "09:00-18:00"
  allowsAfterHours BOOLEAN DEFAULT false,
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT warehouse_code_unique UNIQUE(code)
);

INDEX idx_warehouse_status ON warehouse(status);
INDEX idx_warehouse_code ON warehouse(code);
```

#### 2.2 zone (구역)

```sql
CREATE TABLE zone (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouseId UUID NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,                 -- A, B, C
  name VARCHAR(100) NOT NULL,                -- Zone A, Zone B
  description TEXT,
  
  -- 물리적 정보
  capacity FLOAT,                            -- 구역 용량
  noOfRacks INT,                             -- 랙 수
  
  -- 특성
  zoneType ENUM('general', 'cold', 'hazmat', 'high-value') DEFAULT 'general',
  temperature INT,                           -- 영하 온도 (섭씨)
  humidity INT,                              -- 습도 (%)
  
  -- 상태
  status ENUM('active', 'inactive', 'reserved') DEFAULT 'active',
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT zone_warehouse_code_unique UNIQUE(warehouseId, code)
);

INDEX idx_zone_warehouseId ON zone(warehouseId);
INDEX idx_zone_status ON zone(status);
```

#### 2.3 location (위치/로케이션)

```sql
CREATE TABLE location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouseId UUID NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
  zoneId UUID NOT NULL REFERENCES zone(id) ON DELETE CASCADE,
  
  code VARCHAR(50) NOT NULL,                 -- A-01-1 (zone-rack-level)
  name VARCHAR(100),
  
  -- 물리적 정보
  rackNumber VARCHAR(10),                    -- 01, 02
  level INT,                                 -- 1, 2, 3
  column INT,                                -- 1, 2, 3
  
  -- 용량
  maxCapacity FLOAT,                         -- 최대 수량 또는 무게
  currentUtilization FLOAT DEFAULT 0,        -- 현재 점유량
  
  -- 타입
  locationType ENUM('pallet', 'daebong', 'box', 'shelf', 'bin') DEFAULT 'pallet',
  
  -- 상태
  status ENUM('empty', 'occupied', 'reserved', 'damaged', 'maintenance') DEFAULT 'empty',
  
  -- 제약사항
  allowsOverstock BOOLEAN DEFAULT false,
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT location_code_unique UNIQUE(warehouseId, code)
);

INDEX idx_location_warehouseId ON location(warehouseId);
INDEX idx_location_zoneId ON location(zoneId);
INDEX idx_location_status ON location(status);
INDEX idx_location_code ON location(code);
```

#### 2.4 product (상품 마스터)

```sql
CREATE TABLE product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) NOT NULL UNIQUE,           -- SKU-001
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- 분류
  category VARCHAR(100),
  subcategory VARCHAR(100),
  
  -- 물리적 정보
  weight FLOAT,                              -- kg
  length FLOAT,                              -- cm
  width FLOAT,
  height FLOAT,
  volume FLOAT,                              -- m³
  
  -- 규격
  unit VARCHAR(20),                          -- EA, BOX, CASE
  unitsPerPack INT,
  packsPerPallet INT,
  
  -- 가격/비용
  costPrice FLOAT,
  sellingPrice FLOAT,
  
  -- 재고 관리
  minStockLevel INT,                         -- 최소 재고 수량
  maxStockLevel INT,                         -- 최대 재고 수량
  reorderPoint INT,                          -- 재주문 시점
  leadTimeDays INT,                          -- 리드타임 (일)
  
  -- 특성
  isFragile BOOLEAN DEFAULT false,
  requiresTemperatureControl BOOLEAN DEFAULT false,
  isHazmat BOOLEAN DEFAULT false,
  isHighValue BOOLEAN DEFAULT false,
  
  -- 상태
  status ENUM('active', 'discontinued', 'archived') DEFAULT 'active',
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT product_sku_unique UNIQUE(sku)
);

INDEX idx_product_sku ON product(sku);
INDEX idx_product_category ON product(category);
INDEX idx_product_status ON product(status);
```

#### 2.5 sku (SKU - 상품 변형)

```sql
CREATE TABLE sku (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  
  skuCode VARCHAR(50) NOT NULL,              -- SKU-001-RED-S
  variantName VARCHAR(255),                  -- "Red, Size S"
  
  -- 속성
  color VARCHAR(50),
  size VARCHAR(50),
  style VARCHAR(50),
  
  -- 바코드
  barcode VARCHAR(50),
  
  -- 재고 정보 (빠른 조회용 캐시)
  totalQuantity INT DEFAULT 0,
  availableQuantity INT DEFAULT 0,
  reservedQuantity INT DEFAULT 0,
  damagedQuantity INT DEFAULT 0,
  
  -- 상태
  status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT sku_code_unique UNIQUE(skuCode)
);

INDEX idx_sku_productId ON sku(productId);
INDEX idx_sku_code ON sku(skuCode);
```

---

### 📊 재고 테이블 (Inventory Tables)

#### 3.1 stock (재고)

```sql
CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouseId UUID NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
  locationId UUID NOT NULL REFERENCES location(id) ON DELETE SET NULL,
  skuId UUID NOT NULL REFERENCES sku(id) ON DELETE CASCADE,
  
  -- 수량 정보
  quantity INT NOT NULL DEFAULT 0,           -- 실제 재고
  reserved INT DEFAULT 0,                    -- 예약된 수량
  available INT DEFAULT 0,                   -- 사용 가능한 수량
  damaged INT DEFAULT 0,                     -- 손상된 수량
  
  -- 배치 정보 (Lot/Batch tracking)
  batchNumber VARCHAR(50),                   -- LOT-2024-11-001
  expirationDate DATE,
  manufactureDate DATE,
  
  -- 입고 정보
  inboundId UUID,                            -- 입고 기록 참조
  
  -- 상태
  status ENUM('available', 'reserved', 'damaged', 'expired', 'blocked') DEFAULT 'available',
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT stock_warehouse_location_sku_unique UNIQUE(warehouseId, locationId, skuId, batchNumber)
);

INDEX idx_stock_warehouseId ON stock(warehouseId);
INDEX idx_stock_locationId ON stock(locationId);
INDEX idx_stock_skuId ON stock(skuId);
INDEX idx_stock_status ON stock(status);
INDEX idx_stock_expirationDate ON stock(expirationDate);
```

#### 3.2 stockAudit (재고 조사)

```sql
CREATE TABLE stockAudit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditNumber VARCHAR(50) NOT NULL UNIQUE,  -- AUDIT-2024-11-001
  
  warehouseId UUID NOT NULL REFERENCES warehouse(id),
  zoneId UUID REFERENCES zone(id),
  locationId UUID REFERENCES location(id),
  
  skuId UUID NOT NULL REFERENCES sku(id),
  
  -- 수량 정보
  systemQuantity INT NOT NULL,               -- 시스템상 수량
  actualQuantity INT NOT NULL,               -- 실제 실사 수량
  variance INT,                              -- 차이 (실제 - 시스템)
  
  -- 조사 정보
  auditedBy UUID REFERENCES users(id),
  auditDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 조정 정보
  adjustmentRequired BOOLEAN,
  adjustedBy UUID REFERENCES users(id),
  adjustedAt TIMESTAMP,
  adjustmentReason TEXT,
  
  -- 상태
  status ENUM('pending', 'completed', 'discrepancy', 'resolved') DEFAULT 'pending',
  notes TEXT,
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_stockAudit_auditNumber ON stockAudit(auditNumber);
INDEX idx_stockAudit_warehouseId ON stockAudit(warehouseId);
INDEX idx_stockAudit_status ON stockAudit(status);
INDEX idx_stockAudit_auditDate ON stockAudit(auditDate);
```

---

### 🔄 입출고 테이블 (Inbound/Outbound Tables)

#### 4.1 grn (Goods Receipt Note - 입고)

```sql
CREATE TABLE grn (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grnNumber VARCHAR(50) NOT NULL UNIQUE,     -- GRN-2024-11-001
  poNumber VARCHAR(50),                      -- PO-2024-1001
  
  -- 기본 정보
  warehouseId UUID NOT NULL REFERENCES warehouse(id),
  supplierId UUID,                           -- 공급자 ID
  supplierName VARCHAR(255),
  
  -- 입고 정보
  expectedDeliveryDate DATE,
  actualDeliveryDate DATE,
  
  -- 상품 수량
  totalItems INT,
  totalQuantity INT,
  totalWeight FLOAT,
  totalVolume FLOAT,
  
  -- 담당자
  receivedBy UUID REFERENCES users(id),
  approvedBy UUID REFERENCES users(id),
  
  -- 상태
  status ENUM('pending', 'partial', 'received', 'inspected', 'putaway', 'cancelled') DEFAULT 'pending',
  
  -- 기타
  notes TEXT,
  referenceDocuments TEXT,                   -- JSON 배열: 첨부파일
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT grn_number_unique UNIQUE(grnNumber)
);

INDEX idx_grn_grnNumber ON grn(grnNumber);
INDEX idx_grn_warehouseId ON grn(warehouseId);
INDEX idx_grn_status ON grn(status);
INDEX idx_grn_deliveryDate ON grn(actualDeliveryDate);
```

#### 4.2 grnLineItem (GRN 명세)

```sql
CREATE TABLE grnLineItem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grnId UUID NOT NULL REFERENCES grn(id) ON DELETE CASCADE,
  
  skuId UUID NOT NULL REFERENCES sku(id),
  
  -- 수량 정보
  orderedQuantity INT,
  receivedQuantity INT DEFAULT 0,
  inspectedQuantity INT DEFAULT 0,
  acceptedQuantity INT DEFAULT 0,
  rejectedQuantity INT DEFAULT 0,
  damagedQuantity INT DEFAULT 0,
  
  -- 배치 정보
  batchNumber VARCHAR(50),
  expirationDate DATE,
  manufactureDate DATE,
  
  -- 위치 배정
  locationId UUID REFERENCES location(id),
  
  -- 상태
  status ENUM('pending', 'received', 'inspected', 'accepted', 'rejected', 'putaway') DEFAULT 'pending',
  
  -- 기타
  notes TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_grnLineItem_grnId ON grnLineItem(grnId);
INDEX idx_grnLineItem_skuId ON grnLineItem(skuId);
```

#### 4.3 stockMovement (재고 이동)

```sql
CREATE TABLE stockMovement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movementNumber VARCHAR(50) NOT NULL UNIQUE,  -- MOVE-2024-11-001
  
  -- 이동 유형
  movementType ENUM('internal', 'inbound', 'outbound', 'return', 'adjustment') NOT NULL,
  
  -- 소스/대상
  fromWarehouseId UUID REFERENCES warehouse(id),
  fromLocationId UUID REFERENCES location(id),
  toWarehouseId UUID REFERENCES warehouse(id),
  toLocationId UUID REFERENCES location(id),
  
  skuId UUID NOT NULL REFERENCES sku(id),
  quantity INT NOT NULL,
  
  -- 참조
  grnId UUID REFERENCES grn(id),            -- 입고인 경우
  outboundId UUID,                          -- 출고인 경우
  orderId VARCHAR(50),
  
  -- 담당자
  initiatedBy UUID REFERENCES users(id),
  verifiedBy UUID REFERENCES users(id),
  
  -- 상태
  status ENUM('pending', 'in-transit', 'completed', 'cancelled', 'on-hold') DEFAULT 'pending',
  
  -- 이동 정보
  startTime TIMESTAMP,
  completionTime TIMESTAMP,
  reason TEXT,
  
  -- 타임스탬프
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_stockMovement_number ON stockMovement(movementNumber);
INDEX idx_stockMovement_type ON stockMovement(movementType);
INDEX idx_stockMovement_status ON stockMovement(status);
INDEX idx_stockMovement_skuId ON stockMovement(skuId);
```

#### 4.4 outbound (출고)

```sql
CREATE TABLE outbound (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outboundNumber VARCHAR(50) NOT NULL UNIQUE,  -- OUT-2024-11-001
  
  orderId VARCHAR(50),
  customerId VARCHAR(50),
  customerName VARCHAR(255),
  
  -- 출고 정보
  warehouseId UUID NOT NULL REFERENCES warehouse(id),
  shippingAddress TEXT,
  
  -- 수량
  totalItems INT,
  totalQuantity INT,
  totalWeight FLOAT,
  
  -- 예정/실제 일정
  expectedShippingDate DATE,
  actualShippingDate DATE,
  
  -- 배송 정보
  shippingCarrier VARCHAR(100),
  trackingNumber VARCHAR(100),
  
  -- 담당자
  pickedBy UUID REFERENCES users(id),
  packedBy UUID REFERENCES users(id),
  shippedBy UUID REFERENCES users(id),
  
  -- 상태
  status ENUM('pending', 'picking', 'picked', 'packing', 'packed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  
  -- 기타
  notes TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_outbound_number ON outbound(outboundNumber);
INDEX idx_outbound_orderId ON outbound(orderId);
INDEX idx_outbound_warehouseId ON outbound(warehouseId);
INDEX idx_outbound_status ON outbound(status);
```

#### 4.5 outboundLineItem (출고 명세)

```sql
CREATE TABLE outboundLineItem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outboundId UUID NOT NULL REFERENCES outbound(id) ON DELETE CASCADE,
  
  skuId UUID NOT NULL REFERENCES sku(id),
  
  -- 수량 정보
  orderedQuantity INT,
  pickedQuantity INT DEFAULT 0,
  packedQuantity INT DEFAULT 0,
  shippedQuantity INT DEFAULT 0,
  
  -- 위치
  pickedFromLocationId UUID REFERENCES location(id),
  
  -- 상태
  status ENUM('pending', 'picked', 'packed', 'shipped') DEFAULT 'pending',
  
  notes TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_outboundLineItem_outboundId ON outboundLineItem(outboundId);
```

---

### 🚨 알림 테이블 (Alert Tables)

#### 5.1 alert (알림)

```sql
CREATE TABLE alert (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alertCode VARCHAR(50) NOT NULL,            -- LOW_STOCK, OVERSTOCK, etc.
  alertType ENUM('info', 'warning', 'critical', 'error') NOT NULL,
  
  -- 연관 정보
  warehouseId UUID REFERENCES warehouse(id),
  skuId UUID REFERENCES sku(id),
  locationId UUID REFERENCES location(id),
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- 트리거 조건
  triggerValue FLOAT,
  currentValue FLOAT,
  threshold FLOAT,
  
  -- 상태
  status ENUM('active', 'acknowledged', 'resolved', 'dismissed') DEFAULT 'active',
  
  -- 담당자
  assignedTo UUID REFERENCES users(id),
  acknowledgedBy UUID REFERENCES users(id),
  resolvedBy UUID REFERENCES users(id),
  
  -- 시간
  triggeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledgedAt TIMESTAMP,
  resolvedAt TIMESTAMP,
  
  -- 액션
  actionRequired VARCHAR(255),
  actionTaken TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_alert_warehouseId ON alert(warehouseId);
INDEX idx_alert_status ON alert(status);
INDEX idx_alert_alertType ON alert(alertType);
INDEX idx_alert_triggeredAt ON alert(triggeredAt);
INDEX idx_alert_assignedTo ON alert(assignedTo);
```

#### 5.2 alertHistory (알림 이력)

```sql
CREATE TABLE alertHistory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alertId UUID NOT NULL REFERENCES alert(id) ON DELETE CASCADE,
  
  -- 상태 변경
  previousStatus VARCHAR(50),
  newStatus VARCHAR(50) NOT NULL,
  changedBy UUID REFERENCES users(id),
  
  -- 변경 내용
  action VARCHAR(255),                       -- "Acknowledged", "Resolved", "Escalated"
  notes TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_alertHistory_alertId ON alertHistory(alertId);
```

---

### 📝 감사/히스토리 테이블 (Audit/History Tables)

#### 6.1 auditLog (감사 로그)

```sql
CREATE TABLE auditLog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 사용자 정보
  userId UUID REFERENCES users(id),
  username VARCHAR(100),
  
  -- 행동 정보
  action VARCHAR(100) NOT NULL,              -- CREATE, UPDATE, DELETE, etc.
  entityType VARCHAR(100) NOT NULL,          -- stock, grn, outbound, etc.
  entityId VARCHAR(255),
  
  -- 변경 사항
  oldValues JSONB,                           -- 이전 값
  newValues JSONB,                           -- 새 값
  
  -- IP/세션
  ipAddress VARCHAR(50),
  userAgent TEXT,
  sessionId VARCHAR(255),
  
  -- 상태
  status ENUM('success', 'failure', 'partial') DEFAULT 'success',
  errorMessage TEXT,
  
  -- 시간
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_auditLog_userId ON auditLog(userId);
INDEX idx_auditLog_entityType ON auditLog(entityType);
INDEX idx_auditLog_action ON auditLog(action);
INDEX idx_auditLog_createdAt ON auditLog(createdAt);
```

#### 6.2 systemLog (시스템 로그)

```sql
CREATE TABLE systemLog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 로그 정보
  level ENUM('debug', 'info', 'warn', 'error', 'critical') DEFAULT 'info',
  category VARCHAR(100),
  message TEXT NOT NULL,
  
  -- 스택 트레이스
  stackTrace TEXT,
  
  -- 메타 정보
  metadata JSONB,
  
  -- 시간
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_systemLog_level ON systemLog(level);
INDEX idx_systemLog_category ON systemLog(category);
INDEX idx_systemLog_createdAt ON systemLog(createdAt);
```

#### 6.3 stockHistory (재고 변경 이력)

```sql
CREATE TABLE stockHistory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stockId UUID REFERENCES stock(id) ON DELETE SET NULL,
  
  -- 참조
  warehouseId UUID REFERENCES warehouse(id),
  skuId UUID REFERENCES sku(id),
  
  -- 수량 변경
  previousQuantity INT,
  newQuantity INT,
  quantityChange INT,
  
  -- 이유
  changeType ENUM('inbound', 'outbound', 'adjustment', 'audit', 'damage', 'expiration') NOT NULL,
  referenceId VARCHAR(100),                  -- GRN-001, MOVE-001 등
  reason TEXT,
  
  -- 담당자
  changedBy UUID REFERENCES users(id),
  
  -- 시간
  changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEX idx_stockHistory_stockId ON stockHistory(stockId);
INDEX idx_stockHistory_skuId ON stockHistory(skuId);
INDEX idx_stockHistory_changedAt ON stockHistory(changedAt);
```

---

## 3. ERD (Entity Relationship Diagram)

### ASCII 형식 ERD

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MASTER TABLES (기본 정보)                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│    warehouse     │ (창고)
│──────────────────│
│ id (PK)          │
│ code *           │
│ name             │
│ managerId (FK)   │◄─────┐
│ address          │      │
│ capacity         │      │
│ ...              │      │
└────────┬─────────┘      │
         │1               │
         │            ┌───────────┐
    ┌────▼─────┐      │ users     │
    │ 1:M      │      │ (사용자)  │
    │          │      └───────────┘
    ▼          │
┌──────────────┴────────┐
│      zone             │ (구역)
│──────────────────────│
│ id (PK)              │
│ warehouseId (FK) *   │◄─────────────────────┐
│ code                 │                      │
│ name                 │                      │
│ capacity             │                      │
│ ...                  │                      │
└─────────┬────────────┘                      │
          │1                                   │
          │                                    │
      ┌───▼────┐                              │
      │ 1:M    │                              │
      │        │                              │
      ▼        │                              │
┌────────────────────────────┐                │
│     location              │ (위치)         │
│────────────────────────────│                │
│ id (PK)                    │                │
│ warehouseId (FK) *         │◄───────────────┤
│ zoneId (FK) *              │                │
│ code                       │                │
│ locationType               │                │
│ maxCapacity                │                │
│ status                     │                │
│ ...                        │                │
└────────────┬───────────────┘                │
             │1                              │
             │                               │
         ┌───▼────┐                          │
         │ 1:M    │                          │
         │        │                          │
         ▼        │                          │
    ┌──────────┐  │                          │
    │ stock    │  │                          │
    │ (재고)   │  │                          │
    └──────────┘  │                          │
                  │
                  │
┌─────────────────────────────────────────────────────────────────────────────────┐
│               PRODUCT TABLES (상품 정보)                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│     product          │ (상품)
│──────────────────────│
│ id (PK)              │
│ sku *                │
│ name                 │
│ category             │
│ weight               │
│ minStockLevel        │
│ ...                  │
└────────┬─────────────┘
         │1
         │
     ┌───▼────┐
     │ 1:M    │
     │        │
     ▼        │
┌──────────────────────────────────┐
│         sku                      │ (SKU 변형)
│──────────────────────────────────│
│ id (PK)                          │
│ productId (FK) *                 │
│ skuCode *                        │
│ color, size, style               │
│ barcode                          │
│ totalQuantity (캐시)             │
│ availableQuantity (캐시)         │
│ ...                              │
└────────┬──────────────┬──────────┘
         │1             │1
         │              │
     ┌───▼────┐    ┌────▼───────┐
     │ 1:M    │    │ 1:M        │
     │        │    │            │
     ▼        │    ▼            │
   stock      │  stockMovement  │
             │  outboundLineItem
             │  grnLineItem
             │
┌─────────────────────────────────────────────────────────────────────────────────┐
│              INBOUND TABLES (입고)                                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│        grn           │ (입고)
│──────────────────────│
│ id (PK)              │
│ grnNumber *          │
│ warehouseId (FK)     │◄──┐
│ poNumber             │   │
│ status               │   │
│ totalQuantity        │   │
│ receivedBy (FK)      │───────────┐
│ ...                  │   │       │
└────────┬─────────────┘   │       │
         │1                │       │
         │                 │       │
     ┌───▼────┐            │       │
     │ 1:M    │            │       │
     │        │            │       │
     ▼        │            │       │
┌──────────────────────────┐       │
│   grnLineItem            │ (입고│
│──────────────────────────│  명세)
│ id (PK)                  │       │
│ grnId (FK) *             │       │
│ skuId (FK) *             │       │
│ orderedQuantity          │       │
│ receivedQuantity         │       │
│ locationId (FK)          │       │
│ status                   │       │
│ ...                      │       │
└──────────────────────────┘       │
                                   │
          ┌────────────────────────┘
          │
          └────────► users (담당자)

┌─────────────────────────────────────────────────────────────────────────────────┐
│           OUTBOUND TABLES (출고)                                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│     outbound         │ (출고)
│──────────────────────│
│ id (PK)              │
│ outboundNumber *     │
│ orderId              │
│ warehouseId (FK)     │
│ pickedBy (FK)        │
│ shippingCarrier      │
│ status               │
│ totalQuantity        │
│ ...                  │
└────────┬─────────────┘
         │1
         │
     ┌───▼────┐
     │ 1:M    │
     │        │
     ▼        │
┌──────────────────────────────────┐
│   outboundLineItem               │ (출고 명세)
│──────────────────────────────────│
│ id (PK)                          │
│ outboundId (FK) *                │
│ skuId (FK) *                     │
│ orderedQuantity                  │
│ pickedQuantity                   │
│ pickedFromLocationId (FK)        │
│ status                           │
│ ...                              │
└──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│          STOCK MANAGEMENT TABLES (재고 관리)                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   stockMovement      │ (재고 이동)
│──────────────────────│
│ id (PK)              │
│ movementNumber *     │
│ movementType         │
│ fromWarehouseId (FK) │
│ toWarehouseId (FK)   │
│ fromLocationId (FK)  │
│ toLocationId (FK)    │
│ skuId (FK) *         │
│ quantity             │
│ grnId (FK)           │
│ status               │
│ ...                  │
└──────────────────────┘

┌──────────────────────┐
│    stockAudit        │ (재고 실사)
│──────────────────────│
│ id (PK)              │
│ auditNumber *        │
│ warehouseId (FK)     │
│ skuId (FK) *         │
│ systemQuantity       │
│ actualQuantity       │
│ variance             │
│ status               │
│ auditedBy (FK)       │
│ ...                  │
└──────────────────────┘

┌──────────────────────┐
│   stockHistory       │ (재고 변경 이력)
│──────────────────────│
│ id (PK)              │
│ stockId (FK)         │
│ skuId (FK)           │
│ previousQuantity     │
│ newQuantity          │
│ changeType           │
│ referenceId          │
│ changedBy (FK)       │
│ changedAt            │
│ ...                  │
└──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│              ALERT TABLES (알림 시스템)                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│      alert           │ (알림)
│──────────────────────│
│ id (PK)              │
│ alertCode            │
│ alertType            │
│ warehouseId (FK)     │
│ skuId (FK)           │
│ title                │
│ message              │
│ status               │
│ assignedTo (FK)      │
│ triggeredAt          │
│ ...                  │
└────────┬─────────────┘
         │1
         │
     ┌───▼────┐
     │ 1:M    │
     │        │
     ▼        │
┌──────────────────────────────────┐
│     alertHistory                 │ (알림 이력)
│──────────────────────────────────│
│ id (PK)                          │
│ alertId (FK) *                   │
│ previousStatus                   │
│ newStatus                        │
│ action                           │
│ changedBy (FK)                   │
│ ...                              │
└──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│            AUDIT/LOG TABLES (감사 및 로깅)                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│     auditLog         │ (감사 로그)
│──────────────────────│
│ id (PK)              │
│ userId (FK)          │
│ action               │
│ entityType           │
│ entityId             │
│ oldValues (JSONB)    │
│ newValues (JSONB)    │
│ ipAddress            │
│ createdAt            │
│ ...                  │
└──────────────────────┘

┌──────────────────────┐
│    systemLog         │ (시스템 로그)
│──────────────────────│
│ id (PK)              │
│ level                │
│ category             │
│ message              │
│ stackTrace           │
│ metadata (JSONB)     │
│ createdAt            │
│ ...                  │
└──────────────────────┘
```

---

## 4. 관계도 요약

### Primary Key Relationships

```
warehouse (1) ───────────► (M) zone
warehouse (1) ───────────► (M) location
warehouse (1) ───────────► (M) stock
warehouse (1) ───────────► (M) grn
warehouse (1) ───────────► (M) outbound
warehouse (1) ───────────► (M) stockMovement

zone (1) ──────────────► (M) location

location (1) ──────────────► (M) stock
location (1) ──────────────► (M) grnLineItem
location (1) ──────────────► (M) outboundLineItem

product (1) ─────────────► (M) sku

sku (1) ────────────────► (M) stock
sku (1) ────────────────► (M) grnLineItem
sku (1) ────────────────► (M) outboundLineItem
sku (1) ────────────────► (M) stockMovement
sku (1) ────────────────► (M) stockAudit

grn (1) ────────────────► (M) grnLineItem
grn (1) ────────────────► (M) stockMovement

outbound (1) ───────────► (M) outboundLineItem

stock (1) ──────────────► (M) stockHistory

alert (1) ──────────────► (M) alertHistory

users (1) ──────────────► (M) grn (receivedBy)
users (1) ──────────────► (M) outbound (pickedBy, packedBy, shippedBy)
users (1) ──────────────► (M) stockMovement (initiatedBy, verifiedBy)
users (1) ──────────────► (M) stockAudit (auditedBy)
users (1) ──────────────► (M) alert (assignedTo)
users (1) ──────────────► (M) auditLog (userId)
users (1) ──────────────► (M) stockHistory (changedBy)
```

---

## 5. 핵심 설계 원칙

### 5.1 정규화 (Normalization)
- **3NF (Third Normal Form)** 준수
- 중복 데이터 최소화
- 데이터 무결성 보장

### 5.2 성능 최적화 (Performance)
- **캐시 컬럼**: `sku.totalQuantity`, `sku.availableQuantity`
- **인덱싱**: 자주 조회되는 칼럼에 인덱스 생성
- **파티셔닝 고려**: `stockHistory`, `auditLog` (시간 기반)

### 5.3 감사 및 추적성
- **auditLog**: 모든 중요 변경사항 기록
- **stockHistory**: 재고 변경 이력 추적
- **alertHistory**: 알림 상태 변경 이력
- **타임스탐프**: 모든 테이블에 `createdAt`, `updatedAt` 포함

### 5.4 데이터 무결성
- **Foreign Key 제약**: 참조 무결성 보장
- **Unique 제약**: SKU, GRN Number 등 중복 방지
- **Not Null 제약**: 필수 필드 보호
- **Enum**: 상태값 표준화

### 5.5 확장성 (Scalability)
- **UUID**: 분산 시스템 대비
- **JSONB**: 유연한 메타데이터 저장
- **파티셔닝 준비**: 대용량 데이터 처리 준비

---

## 6. 트랜잭션 설계

### 입고 프로세스 트랜잭션

```sql
BEGIN TRANSACTION;

-- 1. GRN 생성
INSERT INTO grn (grnNumber, poNumber, warehouseId, status) 
VALUES ('GRN-2024-11-001', 'PO-2024-1001', 'wh-001', 'pending');

-- 2. GRN 명세 생성
INSERT INTO grnLineItem (grnId, skuId, orderedQuantity, status)
VALUES (grn_id, sku_id, 100, 'pending');

-- 3. 입고 확정
UPDATE grnLineItem SET receivedQuantity = 100, status = 'received'
WHERE id = grn_line_id;

-- 4. 재고 생성/업데이트
INSERT INTO stock (warehouseId, locationId, skuId, quantity, batchNumber)
VALUES (warehouse_id, location_id, sku_id, 100, 'LOT-2024-11-001');

-- 5. SKU 캐시 업데이트
UPDATE sku SET totalQuantity = totalQuantity + 100
WHERE id = sku_id;

-- 6. 재고 이동 기록
INSERT INTO stockMovement (movementNumber, movementType, toWarehouseId, toLocationId, skuId, quantity, grnId)
VALUES ('MOVE-2024-11-001', 'inbound', warehouse_id, location_id, sku_id, 100, grn_id);

-- 7. 감사 로그
INSERT INTO auditLog (userId, action, entityType, entityId, newValues)
VALUES (user_id, 'CREATE', 'grn', grn_id, jsonb_object);

-- 8. 위치 상태 업데이트
UPDATE location SET status = 'occupied', currentUtilization = currentUtilization + 100
WHERE id = location_id;

COMMIT TRANSACTION;
```

### 출고 프로세스 트랜잭션

```sql
BEGIN TRANSACTION;

-- 1. 출고 주문 생성
INSERT INTO outbound (outboundNumber, orderId, warehouseId, status)
VALUES ('OUT-2024-11-001', 'ORD-2024-5001', 'wh-001', 'pending');

-- 2. 출고 명세 생성
INSERT INTO outboundLineItem (outboundId, skuId, orderedQuantity, status)
VALUES (outbound_id, sku_id, 50, 'pending');

-- 3. 피킹 처리
UPDATE outboundLineItem SET pickedQuantity = 50, pickedFromLocationId = location_id, status = 'picked'
WHERE id = line_item_id;

-- 4. 재고 업데이트
UPDATE stock SET quantity = quantity - 50, available = available - 50
WHERE id = stock_id;

-- 5. SKU 캐시 업데이트
UPDATE sku SET totalQuantity = totalQuantity - 50, availableQuantity = availableQuantity - 50
WHERE id = sku_id;

-- 6. 위치 상태 업데이트
UPDATE location SET currentUtilization = currentUtilization - 50
WHERE id = location_id;

-- 7. 재고 이동 기록
INSERT INTO stockMovement (movementNumber, movementType, fromWarehouseId, fromLocationId, toWarehouseId, skuId, quantity, outboundId)
VALUES ('MOVE-2024-11-002', 'outbound', warehouse_id, location_id, NULL, sku_id, 50, outbound_id);

-- 8. 재고 변경 이력
INSERT INTO stockHistory (stockId, skuId, previousQuantity, newQuantity, changeType, referenceId, changedBy)
VALUES (stock_id, sku_id, 100, 50, 'outbound', 'OUT-2024-11-001', user_id);

COMMIT TRANSACTION;
```

---

## 7. 알림 트리거 설계

### 알림 생성 규칙

```
1. LOW_STOCK: stock.available < product.minStockLevel
   → Alert Type: WARNING
   → Action: 자동 재주문 프로세스

2. OVERSTOCK: stock.quantity > product.maxStockLevel
   → Alert Type: INFO
   → Action: 출고 계획 수립

3. EXPIRATION_SOON: stock.expirationDate - TODAY < 30일
   → Alert Type: WARNING
   → Action: 선입선출(FIFO) 피킹

4. STOCK_DISCREPANCY: stockAudit.variance ≠ 0
   → Alert Type: CRITICAL
   → Action: 즉시 조정 필요

5. LOCATION_DAMAGED: location.status = 'damaged'
   → Alert Type: CRITICAL
   → Action: 위치 격리 및 재배치

6. AUDIT_PENDING: stockAudit.status = 'pending' AND age > 7일
   → Alert Type: WARNING
   → Action: 실사 완료 독촉

7. RECEIVING_DELAYED: grn.actualDeliveryDate > expectedDeliveryDate
   → Alert Type: WARNING
   → Action: 공급자 연락
```

---

## 8. 인덱싱 전략

### 필수 인덱스

```sql
-- 조회 성능
CREATE INDEX idx_stock_warehouseId_skuId ON stock(warehouseId, skuId);
CREATE INDEX idx_stock_status_expirationDate ON stock(status, expirationDate);

-- 검색 성능
CREATE INDEX idx_product_sku_status ON product(sku, status);
CREATE INDEX idx_sku_productId_status ON sku(productId, status);

-- 입출고 성능
CREATE INDEX idx_grn_warehouseId_status ON grn(warehouseId, status);
CREATE INDEX idx_outbound_warehouseId_status ON outbound(warehouseId, status);

-- 감사 성능
CREATE INDEX idx_auditLog_userId_createdAt ON auditLog(userId, createdAt DESC);
CREATE INDEX idx_stockHistory_skuId_changedAt ON stockHistory(skuId, changedAt DESC);

-- 알림 성능
CREATE INDEX idx_alert_warehouseId_status_type ON alert(warehouseId, status, alertType);
```

---

## 9. 마이그레이션 전략

### 단계별 구현

**Phase 1**: 마스터 테이블 (warehouse, zone, location, product, sku)
**Phase 2**: 재고 테이블 (stock, stockHistory)
**Phase 3**: 입출고 테이블 (grn, grnLineItem, outbound, outboundLineItem)
**Phase 4**: 이동 및 조사 (stockMovement, stockAudit)
**Phase 5**: 알림 및 감사 (alert, auditLog, systemLog)

