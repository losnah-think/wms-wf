'use client'

import { useState, useMemo } from 'react'
import { Table, Card, Space, Row, Col, Statistic, Input, Select, Tag, Breadcrumb, Drawer, Divider } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'

interface StockItem {
  id: number
  productName: string
  optionName: string
  quantity: number
  productCode: string
  category: string
  barcode: string
  globalBarcode: string
  brand: string
  price: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  statusText: string
  warehouse: string
  salesCount?: number
  stockValue?: number
}

// 대규모 샘플 데이터 생성 함수
const generateLargeDataset = (): StockItem[] => {
  const products = ['LCD 모니터', 'LED 불투명 테이프', 'USB-C 케이블', 'HDMI 케이블', 'SSD 1TB', '무선 마우스', '기계식 키보드', 'USB 허브', '화면 보호 필름', '노트북 스탠드']
  const options = ['검정색', '흰색', '은색', '빨강', '파랑', '32GB', '64GB', '128GB', '1M', '2M', '3M']
  const categories = ['전자기기', '문구용품', '액세서리', '컴퓨터 부품', 'IT용품']
  const brands = ['LG', '삼성', '소니', 'ANKER', '3M', 'HP', 'DELL', 'Apple', 'Microsoft', 'ASUS']
  const warehouses = ['서울 센터', '부산 센터', '인천 센터', '대구 센터', '광주 센터']
  
  const data: StockItem[] = []
  let id = 1
  
  for (let i = 0; i < 950; i++) { // 950개 생성 (페이지네이션 테스트용)
    const product = products[i % products.length]
    const option = options[Math.floor(i / products.length) % options.length]
    const quantity = Math.floor(Math.random() * 5000) + 10
    const price = Math.floor(Math.random() * 300000) + 5000
    const salesCount = Math.floor(quantity * Math.random() * 0.8)
    const status = quantity > 100 ? 'in_stock' : quantity > 20 ? 'low_stock' : 'out_of_stock'
    
    data.push({
      id: id++,
      productName: `${product} ${i % 10 === 0 ? '24"' : i % 10 === 1 ? '27"' : i % 10 === 2 ? '32"' : ''}`,
      optionName: option,
      quantity,
      productCode: `PROD-${String(i + 1).padStart(5, '0')}`,
      category: categories[i % categories.length],
      barcode: `880${String(i + 1).padStart(12, '0')}`,
      globalBarcode: `880${String(i + 1).padStart(12, '0')}`,
      brand: brands[i % brands.length],
      price,
      status,
      statusText: status === 'in_stock' ? '재고충분' : status === 'low_stock' ? '적은재고' : '품절',
      warehouse: warehouses[i % warehouses.length],
      salesCount,
      stockValue: quantity * price
    })
  }
  
  return data
}

export default function StockStatusByProductPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null)

  const stockData = useMemo(() => generateLargeDataset(), [])

  const columns: TableColumnsType<StockItem> = [
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: '12%',
      render: (text, record) => (
        <a style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => setSelectedProduct(record)}>
          {text}
        </a>
      ),
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
      width: '10%',
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: '10%',
    },
    {
      title: '바코드',
      dataIndex: 'barcode',
      key: 'barcode',
      width: '11%',
    },
    {
      title: '글로벌바코드',
      dataIndex: 'globalBarcode',
      key: 'globalBarcode',
      width: '11%',
    },
    {
      title: '브랜드',
      dataIndex: 'brand',
      key: 'brand',
      width: '8%',
    },
    {
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      width: '10%',
      render: (text) => `${text.toLocaleString()}원`,
    },
    {
      title: '상태',
      key: 'status',
      width: '10%',
      render: (_, record) => (
        <Tag color={record.status === 'in_stock' ? 'green' : record.status === 'low_stock' ? 'orange' : 'red'}>
          {record.statusText}
        </Tag>
      ),
    },
  ]

  const totalQuantity = useMemo(() => stockData.reduce((sum, item) => sum + item.quantity, 0), [])
  const productCount = useMemo(() => stockData.length, [])
  const lowStockCount = useMemo(() => stockData.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length, [])
  const avgPrice = useMemo(() => Math.round(stockData.reduce((sum, item) => sum + item.price, 0) / stockData.length), [])
  
  // 추가 지표 계산
  const totalStockValue = useMemo(() => stockData.reduce((sum, item) => sum + (item.stockValue || 0), 0), [])
  const totalSalesCount = useMemo(() => stockData.reduce((sum, item) => sum + (item.salesCount || 0), 0), [])
  const avgSalesPerProduct = useMemo(() => Math.round(totalSalesCount / productCount), [])
  const avgStockValue = useMemo(() => Math.round(totalStockValue / productCount), [])
  const turnoverRate = useMemo(() => totalSalesCount > 0 ? Math.round((totalSalesCount / totalQuantity) * 100) : 0, [])
  const stockHealth = useMemo(() => {
    const healthyProducts = stockData.filter(item => item.status === 'in_stock').length
    return Math.round((healthyProducts / productCount) * 100)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '재고 현황' },
              { title: '상품별 현황' },
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
            상품별 재고 현황
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            특정 상품의 모든 옵션별 재고 수량을 한눈에 비교합니다
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
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>등록상품</span>}
                value={productCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>저재고상품</span>}
                value={lowStockCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균 판매량</span>}
                value={avgSalesPerProduct}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균 회전율</span>}
                value={turnoverRate}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고액</span>}
                value={Math.round(totalStockValue / 100000000)}
                suffix="억원"
                precision={1}
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>건강도</span>}
                value={stockHealth}
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
              placeholder="상품명, 코드 검색"
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
            dataSource={stockData}
            pagination={{ pageSize: 10 }}
            rowKey="id"
            scroll={{ x: true }}
          />
        </Card>

        <Drawer
          title="상품 상세 통계"
          placement="right"
          onClose={() => setSelectedProduct(null)}
          open={selectedProduct !== null}
          width={500}
        >
          {selectedProduct && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>기본 정보</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>상품명</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedProduct.productName}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>상품코드</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedProduct.productCode}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>카테고리</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedProduct.category}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>브랜드</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedProduct.brand}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>바코드</span>
                    <p style={{ margin: '4px 0', fontSize: '12px', fontWeight: 'bold' }}>{selectedProduct.barcode}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>글로벌바코드</span>
                    <p style={{ margin: '4px 0', fontSize: '12px', fontWeight: 'bold' }}>{selectedProduct.globalBarcode}</p>
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
                        title="재고량"
                        value={selectedProduct.quantity}
                        suffix="개"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="단가"
                        value={selectedProduct.price}
                        prefix="₩"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="재고액"
                        value={selectedProduct.stockValue ? Math.round(selectedProduct.stockValue / 1000000) : 0}
                        suffix="M원"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="상태"
                        value={selectedProduct.statusText}
                        valueStyle={{ color: selectedProduct.status === 'in_stock' ? '#52c41a' : '#faad14', fontSize: '16px', fontWeight: 'bold' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>

              <Divider />

              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>판매 통계</h3>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="총판매량"
                        value={selectedProduct.salesCount || 0}
                        suffix="개"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="회전율"
                        value={selectedProduct.salesCount && selectedProduct.quantity ? Math.round((selectedProduct.salesCount / selectedProduct.quantity) * 100) : 0}
                        suffix="%"
                      />
                    </Card>
                  </Col>
                </Row>
              </div>

              <Divider />

              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>위치 정보</h3>
                <div>
                  <span style={{ color: '#6B7178', fontSize: '12px' }}>저장 창고</span>
                  <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedProduct.warehouse}</p>
                </div>
              </div>
            </Space>
          )}
        </Drawer>
      </div>
    </div>
  )
}
