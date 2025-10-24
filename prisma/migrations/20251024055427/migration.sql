-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "type" TEXT NOT NULL DEFAULT 'supplier',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "zoneId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "barcode" VARCHAR(100),
    "sku" VARCHAR(100),
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weight" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseProduct" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "safeStock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarehouseProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" VARCHAR(50) NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundRequestItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "InboundRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundSchedule" (
    "id" TEXT NOT NULL,
    "scheduleNumber" VARCHAR(50) NOT NULL,
    "requestId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "estimatedArrival" TIMESTAMP(3),
    "carrier" VARCHAR(100),
    "trackingNumber" VARCHAR(100),
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "receivedQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboundSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundApproval" (
    "id" TEXT NOT NULL,
    "approvalNumber" VARCHAR(50) NOT NULL,
    "requestId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approverName" VARCHAR(100),
    "approvalDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "allocatedZone" VARCHAR(100),
    "allocatedLocation" VARCHAR(100),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboundApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" VARCHAR(50) NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shippingDate" TIMESTAMP(3),
    "expectedDelivery" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pickedQty" INTEGER NOT NULL DEFAULT 0,
    "packedQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OutboundOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickingTask" (
    "id" TEXT NOT NULL,
    "pickingNumber" VARCHAR(50) NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedWorker" VARCHAR(100),
    "startTime" TIMESTAMP(3),
    "completionTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingTask" (
    "id" TEXT NOT NULL,
    "packingNumber" VARCHAR(50) NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "station" VARCHAR(50),
    "assignedWorker" VARCHAR(100),
    "boxSize" VARCHAR(20),
    "weight" DECIMAL(10,2),
    "startTime" TIMESTAMP(3),
    "completionTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(100) NOT NULL,
    "userId" VARCHAR(100),
    "changes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE INDEX "Supplier_code_idx" ON "Supplier"("code");

-- CreateIndex
CREATE INDEX "Supplier_type_idx" ON "Supplier"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");

-- CreateIndex
CREATE INDEX "Warehouse_code_idx" ON "Warehouse"("code");

-- CreateIndex
CREATE INDEX "Zone_warehouseId_idx" ON "Zone"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_warehouseId_code_key" ON "Zone"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "Location_zoneId_idx" ON "Location"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_zoneId_code_key" ON "Location"("zoneId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_code_idx" ON "Product"("code");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "WarehouseProduct_productId_idx" ON "WarehouseProduct"("productId");

-- CreateIndex
CREATE INDEX "WarehouseProduct_warehouseId_idx" ON "WarehouseProduct"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseProduct_productId_warehouseId_key" ON "WarehouseProduct"("productId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "InboundRequest_requestNumber_key" ON "InboundRequest"("requestNumber");

-- CreateIndex
CREATE INDEX "InboundRequest_supplierId_idx" ON "InboundRequest"("supplierId");

-- CreateIndex
CREATE INDEX "InboundRequest_status_idx" ON "InboundRequest"("status");

-- CreateIndex
CREATE INDEX "InboundRequest_requestDate_idx" ON "InboundRequest"("requestDate");

-- CreateIndex
CREATE INDEX "InboundRequestItem_requestId_idx" ON "InboundRequestItem"("requestId");

-- CreateIndex
CREATE INDEX "InboundRequestItem_productId_idx" ON "InboundRequestItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "InboundSchedule_scheduleNumber_key" ON "InboundSchedule"("scheduleNumber");

-- CreateIndex
CREATE INDEX "InboundSchedule_requestId_idx" ON "InboundSchedule"("requestId");

-- CreateIndex
CREATE INDEX "InboundSchedule_supplierId_idx" ON "InboundSchedule"("supplierId");

-- CreateIndex
CREATE INDEX "InboundSchedule_status_idx" ON "InboundSchedule"("status");

-- CreateIndex
CREATE INDEX "InboundSchedule_expectedDate_idx" ON "InboundSchedule"("expectedDate");

-- CreateIndex
CREATE UNIQUE INDEX "InboundApproval_approvalNumber_key" ON "InboundApproval"("approvalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InboundApproval_requestId_key" ON "InboundApproval"("requestId");

-- CreateIndex
CREATE INDEX "InboundApproval_status_idx" ON "InboundApproval"("status");

-- CreateIndex
CREATE INDEX "InboundApproval_approvalDate_idx" ON "InboundApproval"("approvalDate");

-- CreateIndex
CREATE UNIQUE INDEX "OutboundOrder_orderNumber_key" ON "OutboundOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "OutboundOrder_orderDate_idx" ON "OutboundOrder"("orderDate");

-- CreateIndex
CREATE INDEX "OutboundOrder_status_idx" ON "OutboundOrder"("status");

-- CreateIndex
CREATE INDEX "OutboundOrder_expectedDelivery_idx" ON "OutboundOrder"("expectedDelivery");

-- CreateIndex
CREATE INDEX "OutboundOrderItem_orderId_idx" ON "OutboundOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OutboundOrderItem_productId_idx" ON "OutboundOrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "PickingTask_pickingNumber_key" ON "PickingTask"("pickingNumber");

-- CreateIndex
CREATE INDEX "PickingTask_orderId_idx" ON "PickingTask"("orderId");

-- CreateIndex
CREATE INDEX "PickingTask_status_idx" ON "PickingTask"("status");

-- CreateIndex
CREATE INDEX "PickingTask_assignedWorker_idx" ON "PickingTask"("assignedWorker");

-- CreateIndex
CREATE UNIQUE INDEX "PackingTask_packingNumber_key" ON "PackingTask"("packingNumber");

-- CreateIndex
CREATE INDEX "PackingTask_orderId_idx" ON "PackingTask"("orderId");

-- CreateIndex
CREATE INDEX "PackingTask_status_idx" ON "PackingTask"("status");

-- CreateIndex
CREATE INDEX "PackingTask_station_idx" ON "PackingTask"("station");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseProduct" ADD CONSTRAINT "WarehouseProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseProduct" ADD CONSTRAINT "WarehouseProduct_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundRequest" ADD CONSTRAINT "InboundRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundRequestItem" ADD CONSTRAINT "InboundRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "InboundRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundRequestItem" ADD CONSTRAINT "InboundRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundSchedule" ADD CONSTRAINT "InboundSchedule_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "InboundRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundSchedule" ADD CONSTRAINT "InboundSchedule_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundOrderItem" ADD CONSTRAINT "OutboundOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OutboundOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundOrderItem" ADD CONSTRAINT "OutboundOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickingTask" ADD CONSTRAINT "PickingTask_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OutboundOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingTask" ADD CONSTRAINT "PackingTask_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OutboundOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
