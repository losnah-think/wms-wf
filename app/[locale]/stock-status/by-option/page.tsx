'use client'

import { useMemo } from 'react'
import { Table, Card, Row, Col, Statistic, Tag, Breadcrumb } from 'antd'
import type { TableColumnsType } from 'antd'

interface OptionStockItem {
  id: number
  productName: string
  optionName: string
  quantity: number
  optionCode: string
  category: string
  barcode: string
  brand: string
  price: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  statusText: string
}

const generateOptionDataset = (): OptionStockItem[] => {
  const products = ['LCD 모니터 24"', 'LED 불투명 테이프', 'USB-C 케이블', 'HDMI 케이블', 'SSD 1TB', '무선 마우스', '기계식 키보드']
  const optionTypes = ['검정색', '흰색', '은색', '빨강', '파랑', '32GB', '64GB', '128GB', '1M', '2M', '3M']
  const categories = ['전자기기', '문구용품', '액세서리', '컴퓨터 부품', 'IT용품']
  const brands = ['LG', '삼성', 'ANKER', '3M', 'HP', 'DELL', 'Apple']
  
  const data: OptionStockItem[] = []
  let id = 1
  
  for (let i = 0; i < 100; i++) {
    const product = products[i % products.length]
    const option = optionTypes[Math.floor(i / products.length) % optionTypes.length]
    const quantity = Math.floor(Math.random() * 3000) + 5
    const price = Math.floor(Math.random() * 250000) + 10000
    const status = quantity > 50 ? 'in_stock' : quantity > 10 ? 'low_stock' : 'out_of_stock'
    
    data.push({
      id: id++,
      productName: product,
      optionName: option,
      quantity,
      optionCode: `OPT-${String(i + 1).padStart(5, '0')}`,
      category: categories[i % categories.length],
      barcode: `880${String(i + 1).padStart(12, '0')}`,
      brand: brands[i % brands.length],
      price,
      status,
      statusText: status === 'in_stock' ? '재고충분' : status === 'low_stock' ? '적은재고' : '품절',
    })
  }
  
  return data
}

export default function StockStatusByOptionPage() {
  const optionData = useMemo(() => generateOptionDataset(), [])

  const columns: TableColumnsType<OptionStockItem> = [
    { title: '상품명', dataIndex: 'productName', key: 'productName', width: '12%' },
    { title: '옵션', dataIndex: 'optionName', key: 'optionName', width: '10%' },
    { title: '재고량', dataIndex: 'quantity', key: 'quantity', width: '8%', render: (text) => `${text}개` },
    { title: '옵션코드', dataIndex: 'optionCode', key: 'optionCode', width: '10%' },
    { title: '카테고리', dataIndex: 'category', key: 'category', width: '12%' },
    { title: '바코드', dataIndex: 'barcode', key: 'barcode', width: '12%' },
    { title: '브랜드', dataIndex: 'brand', key: 'brand', width: '10%' },
    { title: '가격', dataIndex: 'price', key: 'price', width: '10%', render: (text) => `${text.toLocaleString()}원` },
    { title: '상태', key: 'status', width: '10%', render: (_, record) => <Tag color={record.status === 'in_stock' ? 'green' : record.status === 'low_stock' ? 'orange' : 'red'}>{record.statusText}</Tag> },
  ]

  const totalQuantity = useMemo(() => optionData.reduce((sum, item) => sum + item.quantity, 0), [optionData])
  const optionCount = useMemo(() => optionData.length, [optionData])
  const lowStockCount = useMemo(() => optionData.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length, [optionData])
  const totalStockValue = useMemo(() => optionData.reduce((sum, item) => sum + (item.quantity * item.price), 0), [optionData])
  const stockHealth = useMemo(() => { const healthyOptions = optionData.filter(item => item.status === 'in_stock').length; return Math.round((healthyOptions / optionCount) * 100) }, [optionData, optionCount])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb items={[{ title: '재고관리' }, { title: '재고 현황' }, { title: '옵션별 현황' }]} style={{ marginBottom: '16px' }} />
          <h1 style={{ color: '#1F2B60', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 700, margin: 0, marginBottom: '8px' }}>옵션별 재고 현황</h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>각 상품별 옵션의 현재 재고 상태를 확인합니다</p>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고량</span>} value={totalQuantity} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>등록옵션</span>} value={optionCount} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>저재고옵션</span>} value={lowStockCount} suffix="개" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고액</span>} value={Math.round(totalStockValue / 100000000)} suffix="억원" precision={1} valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>건강도</span>} value={stockHealth} suffix="%" valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }} />
            </Card>
          </Col>
        </Row>

        <Card>
          <Table columns={columns} dataSource={optionData} pagination={{ pageSize: 10 }} rowKey="id" scroll={{ x: true }} />
        </Card>
      </div>
    </div>
  )
}
