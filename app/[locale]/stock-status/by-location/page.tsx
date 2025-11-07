'use client'

import { Table, Card, Space, Input, Row, Col, Statistic, Tag, Breadcrumb, Drawer, Divider } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { useState, useMemo } from 'react'

interface LocationStockItem {
  id: number
  location: string
  zone: string
  productName: string
  optionName: string
  quantity: number
  productCode: string
  category: string
  barcode: string
  globalBarcode: string
  brand: string
  price: number
  occupancy: number
  productVariety: number
  capacity?: number
  warehouse?: string
}

// 대규모 로케이션 데이터 생성 함수
const generateLargeLocationDataset = (): LocationStockItem[] => {
  const zones = ['A', 'B', 'C', 'D', 'E']
  const products = ['LCD 모니터', 'LED 테이프', 'USB-C 케이블', 'HDMI 케이블', 'SSD', 'RAM', '냉각팬']
  const categories = ['전자기기', '문구용품', '액세서리', '컴퓨터 부품', 'IT용품']
  const brands = ['LG', '삼성', 'ANKER', '3M', 'HP', 'CORSAIR', 'Kingston']
  const warehouses = ['서울 센터', '부산 센터', '인천 센터', '대구 센터']
  
  const data: LocationStockItem[] = []
  let id = 1
  
  for (let i = 0; i < 980; i++) { // 980개 생성
    const zoneIdx = i % zones.length
    const zone = zones[zoneIdx]
    const shelfNum = Math.floor(i / zones.length) + 1
    const location = `${zone}-${String(shelfNum).padStart(3, '0')}`
    const product = products[i % products.length]
    const quantity = Math.floor(Math.random() * 2000) + 50
    const occupancy = Math.floor(Math.random() * 80) + 20
    const productVariety = Math.floor(Math.random() * 15) + 3
    const price = Math.floor(Math.random() * 200000) + 10000
    const capacity = Math.floor(Math.random() * 3000) + 1000
    
    data.push({
      id: id++,
      location,
      zone,
      productName: `${product}`,
      optionName: ['검정색', '흰색', '은색', '32GB', '64GB', '1TB', '2TB'][i % 7],
      quantity,
      productCode: `PROD-${String(i + 1).padStart(5, '0')}`,
      category: categories[i % categories.length],
      barcode: `880${String(i + 1).padStart(12, '0')}`,
      globalBarcode: `880${String(i + 1).padStart(12, '0')}`,
      brand: brands[i % brands.length],
      price,
      occupancy: Math.min(occupancy, 95),
      productVariety,
      capacity,
      warehouse: warehouses[Math.floor(i / 200) % warehouses.length]
    })
  }
  
  return data
}

export default function StockStatusByLocationPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationStockItem | null>(null)

  const locationData = useMemo(() => generateLargeLocationDataset(), [])

  const columns: TableColumnsType<LocationStockItem> = [
    {
      title: '창고',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: '8%',
    },
    {
      title: '위치',
      dataIndex: 'location',
      key: 'location',
      width: '8%',
      render: (text, record) => (
        <a style={{ cursor: 'pointer' }}>
          <Tag color="blue" onClick={() => setSelectedLocation(record)}>{text}</Tag>
        </a>
      ),
    },
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: '10%',
    },
    {
      title: '옵션명',
      dataIndex: 'optionName',
      key: 'optionName',
      width: '10%',
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '8%',
      render: (text) => `${text}개`,
    },
    {
      title: '상품코드',
      dataIndex: 'productCode',
      key: 'productCode',
      width: '9%',
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: '9%',
    },
    {
      title: '바코드',
      dataIndex: 'barcode',
      key: 'barcode',
      width: '9%',
    },
    {
      title: '글로벌바코드',
      dataIndex: 'globalBarcode',
      key: 'globalBarcode',
      width: '9%',
    },
    {
      title: '브랜드',
      dataIndex: 'brand',
      key: 'brand',
      width: '7%',
    },
    {
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      width: '8%',
      render: (text) => `${text.toLocaleString()}원`,
    },
    {
      title: '업데이트',
      dataIndex: 'warehouse',
      key: 'updated',
      width: '9%',
      render: () => new Date().toLocaleDateString('ko-KR'),
    },
  ]

  const totalQuantity = useMemo(() => locationData.reduce((sum, item) => sum + item.quantity, 0), [])
  const locationCount = useMemo(() => new Set(locationData.map(item => item.location)).size, [])
  const warehouseCount = useMemo(() => new Set(locationData.map(item => item.warehouse)).size, [])
  const latestUpdate = useMemo(() => new Date().toLocaleDateString('ko-KR'), [locationData])
  
  // 추가 지표
  const avgOccupancyRate = useMemo(() => Math.round(locationData.reduce((sum, item) => sum + (item.occupancy || 0), 0) / locationData.length), [locationData])
  const totalProductVariety = useMemo(() => locationData.reduce((sum, item) => sum + (item.productVariety || 0), 0), [])
  const avgProductVariety = useMemo(() => Math.round(totalProductVariety / locationCount), [])
  const avgStockPerLocation = useMemo(() => Math.round(totalQuantity / locationCount), [])
  const highOccupancyLocations = useMemo(() => locationData.filter(item => (item.occupancy || 0) > 80).length, [locationData])
  const locationHealth = useMemo(() => Math.round(((locationCount - highOccupancyLocations) / locationCount) * 100), [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '재고 현황' },
              { title: '위치별 분포' },
            ]}
            style={{ marginBottom: '16px' }}
          />
          <h1 style={{
            color: '#1F2B60',
            fontSize: 40,
            fontFamily: 'Pretendard',
            fontWeight: 700,
            margin: 0,
            marginBottom: '8px',
          }}>
            위치별 재고 분포
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            창고 내 각 위치(선반, 구역)별로 어떤 상품이 몇 개씩 있는지 상세하게 확인합니다
          </p>
        </div>

        {/* KPI 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고량</span>}
                value={totalQuantity}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>위치 수</span>}
                value={locationCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>점유율</span>}
                value={avgOccupancyRate}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>창고 수</span>}
                value={warehouseCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>상품다양도</span>}
                value={avgProductVariety}
                suffix="종류"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>건강도</span>}
                value={locationHealth}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* EChart 시각화 제거 - 통계관리 메뉴로 이동 */}

        <Card style={{ marginBottom: '24px' }}>
          <Space wrap>
            <Input
              placeholder="창고, 위치, 상품명 검색"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 350 }}
              allowClear
            />
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={locationData}
            pagination={{ pageSize: 10 }}
            rowKey="id"
            scroll={{ x: true }}
          />
        </Card>

        <Drawer
          title="위치 상세 통계"
          placement="right"
          onClose={() => setSelectedLocation(null)}
          open={selectedLocation !== null}
          width={500}
        >
          {selectedLocation && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>기본 정보</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>창고명</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedLocation.warehouse}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>위치코드</span>
                    <Tag color="blue">{selectedLocation.location}</Tag>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>상품명</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedLocation.productName}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>상품코드</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedLocation.productCode}</p>
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>재고 정보</h3>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="재고량"
                        value={selectedLocation.quantity}
                        suffix="개"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="단가"
                        value={selectedLocation.price}
                        prefix="₩"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="점유율"
                        value={selectedLocation.occupancy || 0}
                        suffix="%"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="상품다양도"
                        value={selectedLocation.productVariety || 0}
                        suffix="종류"
                      />
                    </Card>
                  </Col>
                </Row>
              </div>

              <Divider />

              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>상품 정보</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>옵션명</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedLocation.optionName}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>카테고리</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedLocation.category}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>브랜드</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedLocation.brand}</p>
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>관리 정보</h3>
                <div>
                  <span style={{ color: '#6B7178', fontSize: '12px' }}>마지막 업데이트</span>
                  <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{new Date().toLocaleDateString('ko-KR')}</p>
                </div>
              </div>
            </Space>
          )}
        </Drawer>
      </div>
    </div>
  )
}
