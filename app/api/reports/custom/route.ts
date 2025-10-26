import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// RPT-006: 커스텀 리포트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reportType, // inventory, sales, movements, efficiency
      filters,
      groupBy, // product, warehouse, date, worker
      dateRange,
      userId,
    } = body;

    // 필수값 검증
    if (!reportType || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['reportType', 'userId'],
        },
        { status: 400 }
      );
    }

    // 날짜 범위 설정
    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();

    let reportData: any = {};

    // 리포트 타입별 처리
    switch (reportType) {
      case 'inventory':
        reportData = await generateInventoryReport(filters, groupBy, startDate, endDate);
        break;
      case 'sales':
        reportData = await generateSalesReport(filters, groupBy, startDate, endDate);
        break;
      case 'movements':
        reportData = await generateMovementsReport(filters, groupBy, startDate, endDate);
        break;
      case 'efficiency':
        reportData = await generateEfficiencyReport(filters, groupBy, startDate, endDate);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: '유효하지 않은 리포트 타입입니다.',
            validTypes: ['inventory', 'sales', 'movements', 'efficiency'],
          },
          { status: 400 }
        );
    }

    // 리포트 ID 생성
    const reportId = `RPT${Date.now()}`;

    // 감사 로그 기록
    await prisma.auditLog.create({
      data: {
        action: 'CUSTOM_REPORT_GENERATE',
        entity: 'Report',
        entityId: reportId,
        userId,
        changes: JSON.stringify({
          reportId,
          reportType,
          filters: filters || {},
          groupBy: groupBy || 'none',
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          generatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reportId,
        reportType,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
        filters: filters || {},
        groupBy: groupBy || 'none',
        data: reportData,
        generatedBy: userId,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Custom report generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '커스텀 리포트 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function generateInventoryReport(filters: any, groupBy: string, startDate: Date, endDate: Date) {
  const products = await prisma.product.findMany({
    include: {
      warehouseProducts: true,
    },
  });

  if (groupBy === 'warehouse') {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      groupedBy: 'warehouse',
      groups: warehouses.map(wh => ({
        warehouseId: wh.id,
        warehouseName: wh.name,
        totalProducts: wh.products.length,
        totalQuantity: wh.products.reduce((sum, p) => sum + p.quantity, 0),
        products: wh.products.map(p => ({
          productCode: p.product.code,
          productName: p.product.name,
          quantity: p.quantity,
        })),
      })),
    };
  }

  return {
    groupedBy: 'product',
    totalProducts: products.length,
    totalQuantity: products.reduce((sum, p) => {
      return sum + p.warehouseProducts.reduce((s, wp) => s + wp.quantity, 0);
    }, 0),
    products: products.map(p => ({
      productCode: p.code,
      productName: p.name,
      totalQuantity: p.warehouseProducts.reduce((s, wp) => s + wp.quantity, 0),
      warehouses: p.warehouseProducts.length,
    })),
  };
}

async function generateSalesReport(filters: any, groupBy: string, startDate: Date, endDate: Date) {
  const orders = await prisma.outboundOrder.findMany({
    where: {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['shipped', 'delivered'],
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (groupBy === 'product') {
    const productSales = new Map();

    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.productId;
        if (!productSales.has(key)) {
          productSales.set(key, {
            productCode: item.product.code,
            productName: item.product.name,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0,
          });
        }
        const data = productSales.get(key);
        data.totalQuantity += item.quantity;
        data.totalRevenue += item.quantity * Number(item.product.price);
        data.orderCount += 1;
      });
    });

    return {
      groupedBy: 'product',
      products: Array.from(productSales.values()).sort((a, b) => b.totalRevenue - a.totalRevenue),
    };
  }

  return {
    groupedBy: 'date',
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => {
      return sum + order.items.reduce((s, item) => s + item.quantity * Number(item.product.price), 0);
    }, 0),
  };
}

async function generateMovementsReport(filters: any, groupBy: string, startDate: Date, endDate: Date) {
  const inboundItems = await prisma.inboundRequestItem.findMany({
    where: {
      request: {
        requestDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      product: true,
      request: true,
    },
  });

  const outboundItems = await prisma.outboundOrderItem.findMany({
    where: {
      order: {
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      product: true,
      order: true,
    },
  });

  return {
    summary: {
      totalInbound: inboundItems.reduce((sum, item) => sum + item.quantity, 0),
      totalOutbound: outboundItems.reduce((sum, item) => sum + item.quantity, 0),
      inboundTransactions: inboundItems.length,
      outboundTransactions: outboundItems.length,
    },
    inbound: inboundItems.map(item => ({
      date: item.request.requestDate.toISOString().split('T')[0],
      productCode: item.product.code,
      productName: item.product.name,
      quantity: item.quantity,
    })),
    outbound: outboundItems.map(item => ({
      date: item.order.orderDate.toISOString().split('T')[0],
      productCode: item.product.code,
      productName: item.product.name,
      quantity: item.quantity,
    })),
  };
}

async function generateEfficiencyReport(filters: any, groupBy: string, startDate: Date, endDate: Date) {
  const pickingTasks = await prisma.pickingTask.findMany({
    where: {
      status: 'completed',
      completionTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
    },
  });

  const packingTasks = await prisma.packingTask.findMany({
    where: {
      status: 'completed',
      completionTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
    },
  });

  if (groupBy === 'worker') {
    const workerStats = new Map();

    pickingTasks.forEach(task => {
      const worker = task.assignedWorker || 'unassigned';
      if (!workerStats.has(worker)) {
        workerStats.set(worker, {
          workerId: worker,
          pickingTasks: 0,
          packingTasks: 0,
          totalItems: 0,
        });
      }
      const stats = workerStats.get(worker);
      stats.pickingTasks += 1;
      stats.totalItems += task.order.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    packingTasks.forEach(task => {
      const worker = task.assignedWorker || 'unassigned';
      if (!workerStats.has(worker)) {
        workerStats.set(worker, {
          workerId: worker,
          pickingTasks: 0,
          packingTasks: 0,
          totalItems: 0,
        });
      }
      const stats = workerStats.get(worker);
      stats.packingTasks += 1;
    });

    return {
      groupedBy: 'worker',
      workers: Array.from(workerStats.values()),
    };
  }

  return {
    groupedBy: 'overall',
    summary: {
      totalPickingTasks: pickingTasks.length,
      totalPackingTasks: packingTasks.length,
      totalItems: pickingTasks.reduce((sum, task) => {
        return sum + task.order.items.reduce((s, item) => s + item.quantity, 0);
      }, 0),
    },
  };
}
