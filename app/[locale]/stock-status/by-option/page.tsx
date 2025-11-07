'use client'

import { Table, Card, Space, Input, Row, Col, Statistic, Tag, Breadcrumb, Drawer, Divider } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { useState, useMemo } from 'react'

interface OptionStockItem {
  id: number
  productName: string
  optionName: string
  quantity: number
  optionCode: string
  category: string
  barcode: string
  globalBarcode: string
  brand: string
  price: number
  salesCount: number
  status: string
  statusText?: string
  stockValue?: number
  popularity?: string
}

// 대규모 옵션 데이터 생성 함수
const generateLargeOptionDataset = (): OptionStockItem[] => {
  const products = ['LCD 모니터 24"', 'LED 불투명 테이프', 'USB-C 케이블', 'HDMI 케이블', 'SSD 1TB', '무선 마우스', '기계식 키보드']
  const optionTypes = ['검정색', '흰색', '은색', '빨강', '파랑', '32GB', '64GB', '128GB', '1M', '2M', '3M', 'Pro', 'Standard', 'Lite']
  const categories = ['전자기기', '문구용품', '액세서리', '컴퓨터 부품', 'IT용품']
  const brands = ['LG', '삼성', 'ANKER', '3M', 'HP', 'DELL', 'Apple']
  const popularities = ['상', '중', '하']
  
  const data: OptionStockItem[] = []
  let id = 1
  
  for (let i = 0; i < 2800; i++) { // 2800개 옵션 생성
    const productIdx = i % products.length
    const optionIdx = Math.floor(i / products.length) % optionTypes.length
    const product = products[productIdx]
    const option = optionTypes[optionIdx]
    const quantity = Math.floor(Math.random() * 3000) + 5
    const price = Math.floor(Math.random() * 250000) + 10000
    const salesCount = Math.floor(quantity * Math.random() * 0.6)
    const status = quantity > 50 ? 'in_stock' : quantity > 10 ? 'low_stock' : 'out_of_stock'
    
    data.push({
      id: id++,
      productName: product,
      optionName: option,
      quantity,
      optionCode: `OPT-${String(i + 1).padStart(5, '0')}`,
      category: categories[i % categories.length],
      barcode: `880${String(i + 1).padStart(12, '0')}`,
      globalBarcode: `880${String(i + 1).padStart(12, '0')}`,
      brand: brands[i % brands.length],
      price,
      salesCount,
      status,
      statusText: status === 'in_stock' ? '재고충분' : status === 'low_stock' ? '적은재고' : '품절',
      stockValue: quantity * price,
      popularity: popularities[i % popularities.length]
    })
  }
  
  return data
}

export default function StockStatusByOptionPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedOption, setSelectedOption] = useState<OptionStockItem | null>(null)

  const optionData = useMemo(() => generateLargeOptionDataset(), [])

  const columns: TableColumnsType<OptionStockItem> = [
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: '10%',
    },
    {
      title: '옵션',
      dataIndex: 'optionName',
      key: 'optionName',
      width: '10%',
      render: (text, record) => (
        <a style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => setSelectedOption(record)}>
          {text}
        </a>
      ),
    },
    {
      title: '재고량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '8%',
      render: (text) => `${text}개`,
    },
    {
      title: '옵션코드',
      dataIndex: 'optionCode',
      key: 'optionCode',
      width: '10%',
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
      width: '10%',
    },
    {
      title: '글로벌바코드',
      dataIndex: 'globalBarcode',
      key: 'globalBarcode',
      width: '10%',
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
      width: '9%',
      render: (text) => `${text.toLocaleString()}원`,
    },
    {
      title: '판매수량',
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: '8%',
      render: (text) => `${text}개`,
    },
    {
      title: '상태',
      key: 'status',
      width: '9%',
      render: (_, record) => (
        <Tag color={record.status === 'in_stock' ? 'green' : record.status === 'low_stock' ? 'orange' : 'red'}>
          {record.statusText}
        </Tag>
      ),
    },
  ]

  const totalQuantity = useMemo(() => optionData.reduce((sum, item) => sum + item.quantity, 0), [])
  const optionCount = useMemo(() => optionData.length, [])
  const totalSalesCount = useMemo(() => optionData.reduce((sum, item) => sum + item.salesCount, 0), [])
  const avgPrice = useMemo(() => Math.round(optionData.reduce((sum, item) => sum + item.price, 0) / optionData.length), [])
  
  // 추가 지표
  const totalStockValue = useMemo(() => optionData.reduce((sum, item) => sum + (item.stockValue || 0), 0), [])
  const avgStockValue = useMemo(() => Math.round(totalStockValue / optionCount), [])
  const avgSalesPerOption = useMemo(() => Math.round(totalSalesCount / optionCount), [])
  const turnoverRate = useMemo(() => Math.round((totalSalesCount / totalQuantity) * 100), [])
  const healthyOptions = useMemo(() => optionData.filter(item => item.status === '재고충분').length, [])
  const healthScore = useMemo(() => Math.round((healthyOptions / optionCount) * 100), [])
  const bestSellingOption = useMemo(() => {
    const best = optionData.reduce((max, item) => item.salesCount > max.salesCount ? item : max)
    return best.optionName
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '재고 현황' },
              { title: '옵션별 현황' },
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
            옵션별 재고 현황
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            같은 상품의 서로 다른 옵션(색상, 사이즈 등)별 재고 현황을 확인합니다
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
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>등록옵션</span>}
                value={optionCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>회전율</span>}
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
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균판매량</span>}
                value={avgSalesPerOption}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>건강도</span>}
                value={healthScore}
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
              placeholder="상품명, 옵션 검색"
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
            dataSource={optionData}
            pagination={{ pageSize: 10 }}
            rowKey="id"
            scroll={{ x: true }}
          />
        </Card>

        <Drawer
          title="옵션 상세 통계"
          placement="right"
          onClose={() => setSelectedOption(null)}
          open={selectedOption !== null}
          width={500}
        >
          {selectedOption && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>기본 정보</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>상품명</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedOption.productName}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>옵션명</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedOption.optionName}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>옵션코드</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedOption.optionCode}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>카테고리</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedOption.category}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>브랜드</span>
                    <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedOption.brand}</p>
                  </div>
                  <div>
                    <span style={{ color: '#6B7178', fontSize: '12px' }}>인기도</span>
                    <Tag color={selectedOption.popularity === '상' ? 'red' : 'blue'}>{selectedOption.popularity}</Tag>
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
                        value={selectedOption.quantity}
                        suffix="개"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="단가"
                        value={selectedOption.price}
                        prefix="₩"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="재고액"
                        value={selectedOption.stockValue ? Math.round(selectedOption.stockValue / 1000000) : 0}
                        suffix="M원"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="상태"
                        value={selectedOption.statusText}
                        valueStyle={{ color: selectedOption.status === 'in_stock' ? '#52c41a' : '#faad14', fontSize: '16px', fontWeight: 'bold' }}
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
                        value={selectedOption.salesCount}
                        suffix="개"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card style={{ background: '#f0f2f5' }}>
                      <Statistic
                        title="회전율"
                        value={Math.round((selectedOption.salesCount / selectedOption.quantity) * 100)}
                        suffix="%"
                      />
                    </Card>
                  </Col>
                </Row>
              </div>

              <Divider />

              <div>
                <h3 style={{ marginBottom: '16px', color: '#1F2B60' }}>바코드 정보</h3>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#6B7178', fontSize: '12px' }}>바코드</span>
                  <p style={{ margin: '4px 0', fontSize: '12px', fontWeight: 'bold' }}>{selectedOption.barcode}</p>
                </div>
                <div>
                  <span style={{ color: '#6B7178', fontSize: '12px' }}>글로벌바코드</span>
                  <p style={{ margin: '4px 0', fontSize: '12px', fontWeight: 'bold' }}>{selectedOption.globalBarcode}</p>
                </div>
              </div>
            </Space>
          )}
        </Drawer>
      </div>
    </div>
  )
}
