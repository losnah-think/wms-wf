const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedStockData() {
  try {
    console.log('🌱 시작: Stock 데이터 생성...\n');

    // 1. 기존 데이터 확인
    const warehouse = await prisma.warehouse.findFirst();
    const products = await prisma.product.findMany({ take: 10 });

    if (!warehouse) {
      console.log('❌ 창고 데이터가 없습니다.');
      return;
    }

    if (products.length === 0) {
      console.log('❌ 상품 데이터가 없습니다.');
      return;
    }

    console.log(`✅ 창고: ${warehouse.name}`);
    console.log(`✅ 상품: ${products.length}개\n`);

    // 2. WarehouseProduct 데이터 생성 (또는 기존 데이터 조회)
    let existingStocks = await prisma.warehouseProduct.findMany({
      where: {
        warehouseId: warehouse.id,
      },
    });

    if (existingStocks.length === 0) {
      const stocks = [];
      for (const product of products) {
        const quantity = Math.floor(Math.random() * 1000) + 50; // 50~1050
        stocks.push({
          warehouseId: warehouse.id,
          productId: product.id,
          quantity,
          safeStock: Math.floor(quantity * 0.1), // 10% 안전 재고
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const createdStocks = await prisma.warehouseProduct.createMany({
        data: stocks,
      });

      console.log(`✅ ${createdStocks.count}개의 재고 정보 생성됨\n`);
      existingStocks = stocks;
    } else {
      console.log(`✅ 기존 ${existingStocks.length}개의 재고 정보 사용됨\n`);
    }

    // 3. 생성된 데이터 확인
    const samples = await prisma.warehouseProduct.findMany({
      take: 5,
      where: {
        warehouseId: warehouse.id,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    console.log('📦 생성된 재고 샘플:');
    samples.forEach((s) => {
      console.log(
        `  • ${s.product.name} (${s.warehouse.name}): ${s.quantity}개`
      );
    });

    // 4. 감사 로그 생성 (Stock Movement용)
    const auditLogs = [];
    for (let i = 0; i < 20; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const randomStock = existingStocks[Math.floor(Math.random() * existingStocks.length)];
      const types = ['STOCK_INBOUND', 'STOCK_OUTBOUND', 'STOCK_ADJUSTMENT'];
      const type = types[Math.floor(Math.random() * types.length)];

      auditLogs.push({
        action: type,
        entity: 'WarehouseProduct',
        entityId: randomStock.productId || product.id,
        userId: 'system',
        changes: JSON.stringify({
          productName: product.name,
          quantity: Math.floor(Math.random() * 100) + 10,
          reason:
            type === 'STOCK_INBOUND'
              ? 'transfer'
              : type === 'STOCK_ADJUSTMENT'
                ? 'adjustment'
                : 'cycle-count',
          fromLocation: 'WH-1',
          toLocation: 'WH-1',
        }),
        createdAt: new Date(Date.now() - Math.random() * 86400000),
      });
    }

    // Check if logs already exist
    const existingLogCount = await prisma.auditLog.count({
      where: {
        entity: 'WarehouseProduct',
      },
    });

    if (existingLogCount === 0) {
      const createdLogs = await prisma.auditLog.createMany({
        data: auditLogs,
      });

      console.log(`\n✅ ${createdLogs.count}개의 감사 로그 생성됨\n`);
    } else {
      console.log(`\n✅ 기존 ${existingLogCount}개의 감사 로그 사용됨\n`);
    }

    // 5. 최종 통계
    const finalWarehouseProductCount = await prisma.warehouseProduct.count();
    const finalAuditLogCount = await prisma.auditLog.count({
      where: {
        entity: 'WarehouseProduct',
      },
    });

    console.log('📊 최종 데이터 현황:');
    console.log(`  • WarehouseProduct: ${finalWarehouseProductCount}개`);
    console.log(`  • AuditLog: ${finalAuditLogCount}개`);
    console.log('\n✨ 데이터 생성 완료!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStockData();
