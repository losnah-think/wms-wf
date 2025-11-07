'use client'

import { useMemo } from 'react'
import { Table, Card, Row, Col, Statistic, Tag, Breadcrumb } from 'antd'
import type { TableColumnsType } from 'antd'

interface WarehouseStockItem {
  id: number
  warehouseName: string
  quantity: number
  capacity: number
  zone: string
  location: string
  lastUpdated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  statusText: string
}

const generateWarehouseDataset = (): WarehouseStockItem[] => {
  const warehouses = ['서울 본점', '인천 2창고', '대구 3창고', '부산 4창고', '광주 5창고']
  const zones = ['A', 'B', 'C', 'D', 'E']
  
  const data: WarehouseStockItem[] = []
  let id = 1
  
  for (let i = 0; i < 100; i++) {
    const warehouse = warehouses[i % warehouses.length]
    const zone = zones[Math.floor(i / warehouses.length) % zones.length]
    const quantity = Math.floor(Math.random() * 3000) + 5
    const capacity = Math.floor(Math.random() * 5000) + 1000
    const status = quantity > 500 ? 'in_stock' : quantity > 100 ? 'low_stock' : 'out_of_stock'
    
    data.push({
      id: id++,
      warehouseName: warehouse,
      quantity,
      capacity,
      zone,
      location: `${zone}-${String(i + 1).padStart(3, '0')}`,
      lastUpdated: new Date(Date.now() - Math.random() * 86400000).toLocaleDateString('ko-KR'),
      status,
      statusText: status === 'in_stock' ? '충분' : status === 'low_stock' ? '부족' : '없음',
    })
  }
  
  return data
}

export default function StockStatusByWarehousePage() {
  const warehouseData = useMemo(() => generateWarehouseDataset(), [])

  const columns: TableColumnsType<WarehouseStockItem> = [
    { title: '창고명', dataIndex: 'warehouseName', key: 'warehouseName', width: '15%' },
    { title: '현재재고', dataIndex: 'quantity', key: 'quantity', width: '10%', render: (text) => `${text}개` },
    { title: '용량', dataIndex: 'capacity', key: 'capacity', width: '10%', render: (text) => `${text}개` },
    { title: '존', dataIndex: 'zone', key: 'zone', width: '8%' },
    { title: '로케이션', dataIndex: 'location', key: 'location', width: '12%' },
    { title: '마지막 업데이트', dataIndex: 'lastUpdated', key: 'lastUpdated', width: '15%' },
    { title: '상태', key: 'status', width: '12%', render: (_, record) => <Tag color={record.status === 'in_stock' ? 'green' : record.status === 'low_stock' ? 'orange' : 'red'}>{record.statusText}</Tag> },
  ]

  const totalQuantity = useMemo(() => warehouseData.reduce((sum, item) => sum + item.quantity, 0), [warehouseData])
  const warehouseCount = useMemo(() => new Set(warehouseData.map(item => item.warehouseName)).size, [warehouseData])
  const lowStockCount = useMemo(() => warehouseData.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length, [warehouseData])
  const totalCapacity = useMemo(() => warehouseData.reduce((sum, item) => sum + item.capacity, 0), [warehouseData])
  const utilizationRate = useMemo(() => Math.round((totalQuantity / totalCapacity) * 100), [totalQuantity, totalCapacity])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb items={[{ title: '재고관리' }, { title: '재고 현황' }, { title: '창고별 현황' }]} style={{ marginBottom: '16px' }} />
          <h1 style={{ color: '#1F2B60', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 700, margin: 0, marginBottom: '8px' }}>창고별 재고 현황</h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>각 창고의 현재 재고 상태를 확인합니다</p>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고량</span>} value={totalQuantity} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>창고수</span>} value={warehouseCount} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>부족로케이션</span>} value={lowStockCount} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 용량</span>} value={totalCapacity} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>점유율</span>} value={utilizationRate} suffix="%" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
        </Row>

        <Card>
          <Table columns={columns} dataSource={warehouseData} pagination={{ pageSize: 10 }} rowKey="id" scroll={{ x: true }} />
        </Card>
      </div>
    </div>
  )
}
