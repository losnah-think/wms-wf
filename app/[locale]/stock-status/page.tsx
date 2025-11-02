'use client'

import { useState } from 'react'
import { Table, Button, Breadcrumb, Tag, Card, Space, Row, Col, Statistic, Input, Select } from 'antd'
import { SearchOutlined, FilterOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'

interface StockItem {
  id: number
  sku: string
  productName: string
  quantity: number
  available: number
  warehouse: string
  location: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  statusText: string
  lastUpdated: string
}

export default function StockStatusPage() {
  const [searchText, setSearchText] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState<string | null>(null)

  const stockData: StockItem[] = [
    {
      id: 1,
      sku: 'SKU-001',
      productName: 'LCD 모니터 24인치',
      quantity: 250,
      available: 245,
      warehouse: '서울 센터',
      location: 'LOC-A1-01',
      status: 'in_stock',
      statusText: '재고충분',
      lastUpdated: '2025-11-01 14:30',
    },
    {
      id: 2,
      sku: 'SKU-002',
      productName: 'LED 불투명 테이프',
      quantity: 45,
      available: 40,
      warehouse: '인천 센터',
      location: 'LOC-B2-03',
      status: 'low_stock',
      statusText: '적은재고',
      lastUpdated: '2025-11-01 14:25',
    },
    {
      id: 3,
      sku: 'SKU-003',
      productName: '마우스 무선',
      quantity: 0,
      available: 0,
      warehouse: '부산 센터',
      location: 'LOC-C3-01',
      status: 'out_of_stock',
      statusText: '재고없음',
      lastUpdated: '2025-11-01 14:15',
    },
  ]

  const stats = {
    totalItems: stockData.length,
    inStock: stockData.filter(s => s.status === 'in_stock').length,
    lowStock: stockData.filter(s => s.status === 'low_stock').length,
    outOfStock: stockData.filter(s => s.status === 'out_of_stock').length,
  }

  const columns: TableColumnsType<StockItem> = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: '12%',
      render: (text: string) => (
        <span style={{ color: '#1F2B60', fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: '20%',
      render: (text: string) => (
        <span style={{ color: '#1F2B60', fontSize: 14 }}>{text}</span>
      ),
    },
    {
      title: '창고',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: '13%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 14 }}>{text}</span>
      ),
    },
    {
      title: '위치',
      dataIndex: 'location',
      key: 'location',
      width: '12%',
      render: (text: string) => (
        <span style={{ color: '#6B7178', fontSize: 12, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: '총수량 / 가용',
      key: 'quantity',
      width: '13%',
      render: (_: any, record: StockItem) => (
        <div>
          <div style={{ fontSize: '13px', color: '#1F2B60', fontWeight: 600 }}>
            {record.quantity} / {record.available}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7178' }}>
            {record.available > 0 ? `${Math.round((record.available / record.quantity) * 100)}%` : '-'}
          </div>
        </div>
      ),
    },
    {
      title: '상태',
      key: 'status',
      width: '14%',
      render: (_: any, record: StockItem) => {
        let color = 'green'
        if (record.status === 'low_stock') color = 'orange'
        if (record.status === 'out_of_stock') color = 'red'

        return (
          <Tag
            color={color}
            icon={record.status === 'out_of_stock' ? <WarningOutlined /> : undefined}
            style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px' }}
          >
            {record.statusText}
          </Tag>
        )
      },
    },
    {
      title: '최종 업데이트',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: '16%',
      render: (text: string) => (
        <span style={{ color: '#6B7178', fontSize: 12 }}>{text}</span>
      ),
    },
  ]

  const filteredData = stockData.filter(item =>
    (!warehouseFilter || item.warehouse === warehouseFilter) &&
    (!searchText || item.productName.includes(searchText) || item.sku.includes(searchText))
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '현황' },
            ]}
            style={{ marginBottom: '16px' }}
          />
          <h1 style={{
            color: '#1F2B60',
            fontSize: 40,
            fontFamily: 'Pretendard',
            fontWeight: 700,
            lineHeight: '52px',
            margin: 0,
            marginBottom: '8px',
          }}>
            재고 현황
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            [Step 1/5] 재고 현황 - 전체 창고의 재고 상황을 한눈에 파악합니다
          </p>
        </div>

        {/* 통계 섹션 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>총 상품</span>}
                value={stats.totalItems}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>재고충분</span>}
                value={stats.inStock}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5aa4d 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>적은재고</span>}
                value={stats.lowStock}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>재고없음</span>}
                value={stats.outOfStock}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 필터 */}
        <Card style={{ marginBottom: '24px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Space wrap>
            <Input.Search
              placeholder="상품명 또는 SKU 검색..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="창고 필터"
              allowClear
              style={{ width: 200 }}
              options={[
                { value: '서울 센터', label: '서울 센터' },
                { value: '인천 센터', label: '인천 센터' },
                { value: '부산 센터', label: '부산 센터' },
              ]}
              onChange={setWarehouseFilter}
            />
            <Button icon={<FilterOutlined />}>필터 초기화</Button>
            <Button icon={<DownloadOutlined />}>내보내기</Button>
          </Space>
        </Card>

        {/* 테이블 */}
        <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10, total: filteredData.length }}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </div>
  )
}
