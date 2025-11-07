'use client'

import { useMemo } from 'react'
import { Table, Card, Row, Col, Statistic, Tag, Breadcrumb } from 'antd'
import type { TableColumnsType } from 'antd'

interface LocationStockItem {
  id: number
  location: string
  zone: string
  shelf: string
  quantity: number
  maxCapacity: number
  itemCount: number
  occupancyRate: number
  lastUpdated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  statusText: string
}

const generateLocationDataset = (): LocationStockItem[] => {
  const zones = ['A', 'B', 'C', 'D', 'E']
  
  const data: LocationStockItem[] = []
  let id = 1
  
  for (let i = 0; i < 100; i++) {
    const zone = zones[i % zones.length]
    const shelf = String(Math.floor(i / zones.length) + 1).padStart(2, '0')
    const quantity = Math.floor(Math.random() * 3000) + 5
    const maxCapacity = Math.floor(Math.random() * 5000) + 1000
    const itemCount = Math.floor(Math.random() * 50) + 1
    const occupancyRate = Math.round((quantity / maxCapacity) * 100)
    const status = occupancyRate > 70 ? 'in_stock' : occupancyRate > 30 ? 'low_stock' : 'out_of_stock'
    
    data.push({
      id: id++,
      location: `${zone}-${shelf}-${String(i + 1).padStart(3, '0')}`,
      zone,
      shelf,
      quantity,
      maxCapacity,
      itemCount,
      occupancyRate,
      lastUpdated: new Date(Date.now() - Math.random() * 86400000).toLocaleDateString('ko-KR'),
      status,
      statusText: status === 'in_stock' ? '사용중' : status === 'low_stock' ? '부분사용' : '미사용',
    })
  }
  
  return data
}

export default function StockStatusByLocationPage() {
  const locationData = useMemo(() => generateLocationDataset(), [])

  const columns: TableColumnsType<LocationStockItem> = [
    { title: '로케이션', dataIndex: 'location', key: 'location', width: '12%' },
    { title: '존', dataIndex: 'zone', key: 'zone', width: '8%' },
    { title: '선반', dataIndex: 'shelf', key: 'shelf', width: '8%' },
    { title: '현재재고', dataIndex: 'quantity', key: 'quantity', width: '10%', render: (text) => `${text}개` },
    { title: '최대용량', dataIndex: 'maxCapacity', key: 'maxCapacity', width: '10%', render: (text) => `${text}개` },
    { title: '상품수', dataIndex: 'itemCount', key: 'itemCount', width: '8%' },
    { title: '점유율', dataIndex: 'occupancyRate', key: 'occupancyRate', width: '10%', render: (text) => `${text}%` },
    { title: '마지막 업데이트', dataIndex: 'lastUpdated', key: 'lastUpdated', width: '15%' },
    { title: '상태', key: 'status', width: '12%', render: (_, record) => <Tag color={record.status === 'in_stock' ? 'green' : record.status === 'low_stock' ? 'orange' : 'red'}>{record.statusText}</Tag> },
  ]

  const totalQuantity = useMemo(() => locationData.reduce((sum, item) => sum + item.quantity, 0), [locationData])
  const locationCount = useMemo(() => locationData.length, [locationData])
  const lowStockCount = useMemo(() => locationData.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length, [locationData])
  const totalMaxCapacity = useMemo(() => locationData.reduce((sum, item) => sum + item.maxCapacity, 0), [locationData])
  const averageOccupancy = useMemo(() => Math.round(locationData.reduce((sum, item) => sum + item.occupancyRate, 0) / locationData.length), [locationData])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb items={[{ title: '재고관리' }, { title: '재고 현황' }, { title: '로케이션별 현황' }]} style={{ marginBottom: '16px' }} />
          <h1 style={{ color: '#1F2B60', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 700, margin: 0, marginBottom: '8px' }}>로케이션별 재고 현황</h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>각 로케이션의 현재 재고 상태를 확인합니다</p>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고량</span>} value={totalQuantity} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>로케이션수</span>} value={locationCount} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>미사용로케이션</span>} value={lowStockCount} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 용량</span>} value={totalMaxCapacity} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균 점유율</span>} value={averageOccupancy} suffix="%" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
        </Row>

        <Card>
          <Table columns={columns} dataSource={locationData} pagination={{ pageSize: 10 }} rowKey="id" scroll={{ x: true }} />
        </Card>
      </div>
    </div>
  )
}
