'use client'

import { Table, Card, Space, Input, Row, Col, Statistic, Breadcrumb, Drawer, Divider } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { useState, useMemo } from 'react'

interface WarehouseStockItem {
  id: number
  warehouse: string
  productName: string
  optionName: string
  quantity: number
  productCode: string
  category: string
  barcode: string
  globalBarcode: string
  brand: string
  price: number
  totalQuantity: number
  productCount: number
  utilization: number
  capacity?: number
  avgProductPrice?: number
}

// 대규모 창고 데이터 생성 함수
const generateLargeWarehouseDataset = (): WarehouseStockItem[] => {
  const warehouses = ['서울 센터', '부산 센터', '인천 센터', '대구 센터', '광주 센터']
  const products = ['LCD 모니터', 'LED 테이프', 'USB-C 케이블', 'HDMI 케이블', 'SSD']
  const categories = ['전자기기', '문구용품', '액세서리', '컴퓨터 부품', 'IT용품']
  const brands = ['LG', '삼성', 'ANKER', '3M', 'HP']
  const capacities = [10000, 8000, 6000, 5000, 4000]
  
  const data: WarehouseStockItem[] = []
  let id = 1
  
  for (let i = 0; i < 1200; i++) { // 1200개 생성
    const warehouseIdx = i % warehouses.length
    const warehouse = warehouses[warehouseIdx]
    const product = products[Math.floor(i / warehouses.length) % products.length]
    const quantity = Math.floor(Math.random() * 1000) + 50
    const capacity = capacities[warehouseIdx]
    const totalQuantity = Math.floor(Math.random() * 10000) + 500
    const productCount = Math.floor(Math.random() * 500) + 50
    const price = Math.floor(Math.random() * 200000) + 10000
    const utilization = Math.floor((totalQuantity / capacity) * 100)
    const avgProductPrice = Math.floor(Math.random() * 150000) + 20000
    
    data.push({
      id: id++,
      warehouse,
      productName: `${product}`,
      optionName: ['검정색', '흰색', '은색', '32GB', '64GB'][i % 5],
      quantity,
      productCode: `PROD-${String(i + 1).padStart(5, '0')}`,
      category: categories[i % categories.length],
      barcode: `880${String(i + 1).padStart(12, '0')}`,
      globalBarcode: `880${String(i + 1).padStart(12, '0')}`,
      brand: brands[i % brands.length],
      price,
      totalQuantity,
      productCount,
      utilization: Math.min(utilization, 95),
      capacity,
      avgProductPrice
    })
  }
  
  return data
}

export default function StockStatusByWarehousePage() {
  const [searchText, setSearchText] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)

  const warehouseData = useMemo(() => generateLargeWarehouseDataset(), [])

  const columns: TableColumnsType<WarehouseStockItem> = [
    {
      title: '창고명',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: '8%',
      render: (text) => (
        <a style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => setSelectedWarehouse(text)}>
          {text}
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
      title: '재고량',
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
  ]

  const totalQuantity = useMemo(() => warehouseData.reduce((sum, item) => sum + item.quantity, 0), [])
  const warehouseCount = useMemo(() => new Set(warehouseData.map(item => item.warehouse)).size, [])
  const avgUtilization = useMemo(() => Math.round(warehouseData.reduce((sum, item) => sum + item.utilization, 0) / warehouseData.length), [])
  const avgProductCount = useMemo(() => Math.round(warehouseData.reduce((sum, item) => sum + item.productCount, 0) / warehouseData.length), [])
  
  // 추가 지표
  const totalCapacity = useMemo(() => warehouseData.reduce((sum, item) => sum + (item.capacity || 0), 0), [])
  const utilizedCapacity = useMemo(() => Math.round((totalQuantity / totalCapacity) * 100), [])
  const totalStockValue = useMemo(() => warehouseData.reduce((sum, item) => sum + (item.totalQuantity * (item.avgProductPrice || 0)), 0), [])
  const avgStockValue = useMemo(() => Math.round(totalStockValue / warehouseCount), [])
  const highUtilizationCount = useMemo(() => warehouseData.filter(item => item.utilization > 80).length, [])
  const warehouseHealth = useMemo(() => Math.round(((warehouseCount - highUtilizationCount) / warehouseCount) * 100), [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '재고 현황' },
              { title: '창고별 분포' },
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
            창고별 재고 분포
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            재고를 창고별로 분류하여 지역별/창고별 재고 분포 현황을 파악합니다
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
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>창고 수</span>}
                value={warehouseCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>점유율</span>}
                value={avgUtilization}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>전체용량</span>}
                value={totalCapacity}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총재고액</span>}
                value={Math.round(totalStockValue / 1000000)}
                suffix="M원"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>건강도</span>}
                value={warehouseHealth}
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
              placeholder="창고명 검색"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={warehouseData}
            pagination={{ pageSize: 10 }}
            rowKey="id"
            scroll={{ x: true }}
          />
        </Card>

        <Drawer
          title="창고 상세 통계"
          placement="right"
          onClose={() => setSelectedWarehouse(null)}
          open={selectedWarehouse !== null}
          width={500}
        >
          {selectedWarehouse && warehouseData.find(w => w.warehouse === selectedWarehouse) && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {(() => {
                const warehouse = warehouseData.find(w => w.warehouse === selectedWarehouse)!
                return (
                  <>
                    <div>
                      <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>기본 정보</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div>
                          <span style={{ color: '#6B7178', fontSize: '12px' }}>창고명</span>
                          <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{warehouse.warehouse}</p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>재고 통계</h3>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Card style={{ background: '#f0f2f5' }}>
                            <Statistic
                              title="총재고량"
                              value={warehouse.totalQuantity}
                              suffix="개"
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card style={{ background: '#f0f2f5' }}>
                            <Statistic
                              title="총용량"
                              value={warehouse.capacity || 0}
                              suffix="개"
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card style={{ background: '#f0f2f5' }}>
                            <Statistic
                              title="점유율"
                              value={warehouse.utilization}
                              suffix="%"
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card style={{ background: '#f0f2f5' }}>
                            <Statistic
                              title="여유용량"
                              value={(warehouse.capacity || 0) - warehouse.totalQuantity}
                              suffix="개"
                            />
                          </Card>
                        </Col>
                      </Row>
                    </div>

                    <Divider />

                    <div>
                      <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>상품 통계</h3>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Card style={{ background: '#f0f2f5' }}>
                            <Statistic
                              title="등록상품"
                              value={warehouse.productCount}
                              suffix="개"
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card style={{ background: '#f0f2f5' }}>
                            <Statistic
                              title="평균재고액"
                              value={warehouse.avgProductPrice ? Math.round(warehouse.avgProductPrice / 1000000) : 0}
                              suffix="M원"
                            />
                          </Card>
                        </Col>
                      </Row>
                    </div>

                    <Divider />

                    <div>
                      <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>상태</h3>
                      <Card style={{ background: warehouse.utilization > 80 ? '#fff2e8' : '#f6ffed' }}>
                        <span style={{ color: warehouse.utilization > 80 ? '#ff7a45' : '#52c41a', fontSize: '14px', fontWeight: 'bold' }}>
                          {warehouse.utilization > 80 ? '⚠️ 고이용률' : '✓ 정상'}
                        </span>
                      </Card>
                    </div>
                  </>
                )
              })()}
            </Space>
          )}
        </Drawer>
      </div>
    </div>
  )
}
