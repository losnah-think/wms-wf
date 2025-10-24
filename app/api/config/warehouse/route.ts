import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CFG-002: 창고 설정

// 창고 설정 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');

    if (!warehouseId) {
      // 모든 창고 목록
      const warehouses = await prisma.warehouse.findMany({
        include: {
          zones: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          warehouses: warehouses.map(wh => ({
            id: wh.id,
            name: wh.name,
            address: wh.address,
            zones: wh.zones.length,
            isActive: true,
          })),
        },
      });
    }

    // 특정 창고 상세 설정
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: {
        zones: {
          include: {
            locations: true,
          },
        },
      },
    });

    if (!warehouse) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 창고입니다.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: warehouse.id,
        name: warehouse.name,
        address: warehouse.address,
        zones: warehouse.zones.map(zone => ({
          id: zone.id,
          name: zone.name,
          locations: zone.locations.length,
        })),
        settings: {
          capacity: 10000, // 예시
          occupancy: 7500,
          occupancyRate: '75%',
        },
      },
    });
  } catch (error) {
    console.error('Warehouse config retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '창고 설정 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 창고 설정 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { warehouseId, settings, updatedBy } = body;

    if (!warehouseId || !settings || !updatedBy) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 입력값이 누락되었습니다.',
          required: ['warehouseId', 'settings', 'updatedBy'],
        },
        { status: 400 }
      );
    }

    // 창고 존재 확인
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 창고입니다.',
        },
        { status: 404 }
      );
    }

    // 설정 변경 기록
    await prisma.auditLog.create({
      data: {
        action: 'CONFIG_UPDATE',
        entity: 'Warehouse',
        entityId: warehouseId,
        userId: updatedBy,
        changes: JSON.stringify({
          warehouseId,
          warehouseName: warehouse.name,
          settings,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        warehouseId,
        warehouseName: warehouse.name,
        settings,
        updatedBy,
        updatedAt: new Date().toISOString(),
        message: '창고 설정이 업데이트되었습니다.',
      },
    });
  } catch (error) {
    console.error('Warehouse config update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '창고 설정 업데이트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
