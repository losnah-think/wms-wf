'use client'

import React from 'react'
import {
  Card,
  Row,
  Col,
  Table,
  Space,
  Button,
  Input,
  Select,
  Tag,
  Badge,
  Tooltip,
  Empty,
  Spin,
  Modal,
  Form,
  InputNumber,
  Drawer,
  Descriptions,
  Typography,
  Statistic,
  Progress,
} from 'antd'
import { SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ExportOutlined, EyeOutlined, ShopOutlined } from '@ant-design/icons'
import { useTranslations } from 'next-intl'
import LayoutAntd from '@/components/LayoutAntd'

const { Title, Text } = Typography

// 창고 위치 데이터 구조
interface LocationData {
  locationId: number
  warehouseId: number
  name: string
  warehouseName: string
  stock: number
  notShippedStock: number
  variants: VariantData[]
  variantCount: number
}

// 상품 변형 데이터 구조
interface VariantData {
  productId: number
  variantId: number
  domainId: number
  domainName: string
  productCode: string
  productName: string
  variantName: string
  barcode1: string
  sguid: string
  stock: number
  notShippedQty: number
  categoryId: number
  categoryName: string
}

// 테이블 표시용 통합 데이터
interface StockTableItem {
  key: string
  locationId: number
  locationName: string
  warehouseName: string
  productId: number
  variantId: number
  productCode: string
  productName: string
  variantName: string
  domainName: string
  categoryName: string
  barcode: string
  stock: number
  notShippedQty: number
  availableQty: number
  status: 'inStock' | 'lowStock' | 'outOfStock'
}

export default function StockStatusAntd() {
  const t = useTranslations()
  const [loading, setLoading] = React.useState(false)
  const [searchText, setSearchText] = React.useState('')
  const [warehouseFilter, setWarehouseFilter] = React.useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = React.useState(false)
  const [selectedLocation, setSelectedLocation] = React.useState<LocationData | null>(null)
  const [form] = Form.useForm()

  // 실제 데이터 구조에 맞는 Mock 데이터 (더 많은 샘플 데이터 포함)
  const mockLocationData: LocationData = {
    locationId: 2782,
    warehouseId: 1,
    name: "A-BOX-1",
    warehouseName: "A센터",
    stock: 40,
    notShippedStock: 2,
    variants: [
      {
        productId: 64325,
        variantId: 460455,
        domainId: 0,
        domainName: "안나앤모드",
        productCode: "P0000IWE",
        productName: "♥조이세인트티셔츠[티셔츠BDKT57]",
        variantName: "그린,S",
        barcode1: "16432520015",
        sguid: "A07G0460455",
        stock: 1,
        notShippedQty: 0,
        categoryId: 211,
        categoryName: "B-동일등록상품(H/L)"
      },
      {
        productId: 65927,
        variantId: 477718,
        domainId: 0,
        domainName: "안나앤모드",
        productCode: "P0000PVY",
        productName: "(아동)한복과함께귀마개[아이템BDM613]",
        variantName: "민트,FREE",
        barcode1: "16592720001",
        sguid: "A07G0477718",
        stock: 1,
        notShippedQty: 0,
        categoryId: 44,
        categoryName: "B-베베르망"
      },
      {
        productId: 78145,
        variantId: 611087,
        domainId: 0,
        domainName: "안나앤모드",
        productCode: "P0000PHR",
        productName: "(아동)B.비비드슈퍼티[티셔츠BEBG180D]",
        variantName: "그린,M",
        barcode1: "17814520013",
        sguid: "A07G0611087",
        stock: 15,
        notShippedQty: 2,
        categoryId: 211,
        categoryName: "B-동일등록상품(H/L)"
      },
      {
        productId: 65677,
        variantId: 475285,
        domainId: 0,
        domainName: "안나앤모드",
        productCode: "P0000PUO",
        productName: "베베한복보넷[모자BDMV99]",
        variantName: "핑크,S",
        barcode1: "16567720001",
        sguid: "A07G0475285",
        stock: 0,
        notShippedQty: 0,
        categoryId: 44,
        categoryName: "B-베베르망"
      },
      {
        productId: 76596,
        variantId: 596915,
        domainId: 0,
        domainName: "안나앤모드",
        productCode: "P0000SHL",
        productName: "(아동)플라워귀도리[시즌BDY5286C]",
        variantName: "민트도트,FREE",
        barcode1: "17659620003",
        sguid: "A07G0596915",
        stock: 2,
        notShippedQty: 0,
        categoryId: 44,
        categoryName: "B-베베르망"
      },
      {
        productId: 92162,
        variantId: 743330,
        domainId: 0,
        domainName: "안나앤모드",
        productCode: "P0000PHR",
        productName: "(아동)곰돌유에스에이맨투맨[티셔츠BEMQ75D]",
        variantName: "백멜란지,2XL",
        barcode1: "19216220012",
        sguid: "A07G0743330",
        stock: 2,
        notShippedQty: 0,
        categoryId: 211,
        categoryName: "B-동일등록상품(H/L)"
      },
      {
        productId: 86481,
        variantId: 703699,
        domainId: 0,
        domainName: "안나앤모드",
        productCode: "P0000KDR",
        productName: "(아동)91엘에이후드티[티셔츠BEHC268A]",
        variantName: "그린,7호",
        barcode1: "18648120002",
        sguid: "A07G0703699",
        stock: 1,
        notShippedQty: 0,
        categoryId: 193,
        categoryName: "B-리틀브로"
      },
      {
        productId: 85980,
        variantId: 698682,
        domainId: 0,
        domainName: "안나앤모드",
        productCode: "P0000OJQ",
        productName: "(아동)캐주얼포켓크롭집업 [자켓BEGT639B]",
        variantName: "핑크,XL",
        barcode1: "18598020016",
        sguid: "A07G0698682",
        stock: 1,
        notShippedQty: 0,
        categoryId: 50,
        categoryName: "B-하루키즈"
      }
    ],
    variantCount: 8
  }

  // 테이블용 데이터 변환
  const transformToTableData = (locationData: LocationData): StockTableItem[] => {
    return locationData.variants.map(variant => {
      const availableQty = variant.stock - variant.notShippedQty
      let status: 'inStock' | 'lowStock' | 'outOfStock' = 'outOfStock'
      
      if (availableQty > 10) status = 'inStock'
      else if (availableQty > 0) status = 'lowStock'

      return {
        key: `${locationData.locationId}-${variant.variantId}`,
        locationId: locationData.locationId,
        locationName: locationData.name,
        warehouseName: locationData.warehouseName,
        productId: variant.productId,
        variantId: variant.variantId,
        productCode: variant.productCode,
        productName: variant.productName,
        variantName: variant.variantName,
        domainName: variant.domainName,
        categoryName: variant.categoryName,
        barcode: variant.barcode1,
        stock: variant.stock,
        notShippedQty: variant.notShippedQty,
        availableQty: availableQty,
        status
      }
    })
  }

  const [tableData, setTableData] = React.useState<StockTableItem[]>(() => 
    transformToTableData(mockLocationData)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inStock':
        return 'green'
      case 'lowStock':
        return 'orange'
      case 'outOfStock':
        return 'red'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'inStock':
        return '재고 충분'
      case 'lowStock':
        return '재고 부족'
      case 'outOfStock':
        return '재고 없음'
      default:
        return status
    }
  }

  const columns = [
    {
      title: '상품 코드',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: 250,
      render: (text: string, record: StockTableItem) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '2px' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.variantName}</div>
        </div>
      ),
    },
    {
      title: '브랜드',
      dataIndex: 'domainName',
      key: 'domainName',
      width: 100,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '카테고리',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
      render: (text: string) => <span style={{ fontSize: '12px' }}>{text}</span>,
    },
    {
      title: '창고 위치',
      key: 'location',
      width: 120,
      render: (_, record: StockTableItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.warehouseName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.locationName}</div>
        </div>
      ),
    },
    {
      title: '재고 수량',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      sorter: (a: StockTableItem, b: StockTableItem) => a.stock - b.stock,
      render: (stock: number) => (
        <span style={{ 
          color: stock > 0 ? '#52c41a' : '#f5222d',
          fontWeight: 'bold'
        }}>
          {stock.toLocaleString()}
        </span>
      ),
    },
    {
      title: '미출하',
      dataIndex: 'notShippedQty',
      key: 'notShippedQty',
      width: 80,
      render: (qty: number) => (
        <span style={{ color: qty > 0 ? '#ff7a45' : '#666' }}>
          {qty.toLocaleString()}
        </span>
      ),
    },
    {
      title: '가용 재고',
      dataIndex: 'availableQty',
      key: 'availableQty',
      width: 100,
      sorter: (a: StockTableItem, b: StockTableItem) => a.availableQty - b.availableQty,
      render: (qty: number) => (
        <span style={{ 
          color: qty > 0 ? '#52c41a' : '#f5222d',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {qty.toLocaleString()}
        </span>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '재고 충분', value: 'inStock' },
        { text: '재고 부족', value: 'lowStock' },
        { text: '재고 없음', value: 'outOfStock' },
      ],
      onFilter: (value: any, record: StockTableItem) => record.status === value,
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>,
    },
    {
      title: '바코드',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 130,
      render: (barcode: string) => (
        <Text code style={{ fontSize: '11px' }}>{barcode}</Text>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: StockTableItem) => (
        <Space size="small">
          <Tooltip title="상세 보기">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="수정">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleSearch = (value: string) => {
    setSearchText(value)
    const baseData = transformToTableData(mockLocationData)
    
    if (value) {
      const filteredData = baseData.filter(
        (item) =>
          item.productCode.toLowerCase().includes(value.toLowerCase()) ||
          item.productName.toLowerCase().includes(value.toLowerCase()) ||
          item.variantName.toLowerCase().includes(value.toLowerCase()) ||
          item.barcode.toLowerCase().includes(value.toLowerCase())
      )
      setTableData(filteredData)
    } else {
      setTableData(baseData)
    }
  }

  const handleViewDetails = (record: StockTableItem) => {
    setSelectedLocation(mockLocationData)
    setDetailDrawerVisible(true)
  }

  const handleEdit = (record: StockTableItem) => {
    form.setFieldsValue({
      productCode: record.productCode,
      productName: record.productName,
      variantName: record.variantName,
      stock: record.stock,
      notShippedQty: record.notShippedQty
    })
    setIsModalVisible(true)
  }

  return (
    <LayoutAntd>
      <div style={{ background: '#f5f5f5', padding: '24px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: '0 0 8px 0' }}>
            📦 재고 현황 관리
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            창고별 위치의 상품 변형 재고를 실시간으로 모니터링하고 관리하세요
          </Text>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <Statistic
                title="전체 상품 변형"
                value={tableData.length}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <Statistic
                title="재고 충분"
                value={tableData.filter((item) => item.status === 'inStock').length}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                suffix={`/ ${tableData.length}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <Statistic
                title="재고 부족"
                value={tableData.filter((item) => item.status === 'lowStock').length}
                valueStyle={{ color: '#faad14', fontSize: '24px' }}
                suffix={`/ ${tableData.length}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: '8px' }}>
              <Statistic
                title="재고 없음"
                value={tableData.filter((item) => item.status === 'outOfStock').length}
                valueStyle={{ color: '#f5222d', fontSize: '24px' }}
                suffix={`/ ${tableData.length}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Card
          style={{ marginBottom: '24px', borderRadius: '8px' }}
          bordered={false}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={8}>
              <Input.Search
                placeholder="상품명, 코드, 바코드로 검색..."
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ borderRadius: '4px' }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="창고 선택"
                style={{ width: '100%', borderRadius: '4px' }}
                onChange={(value) => setWarehouseFilter(value)}
                options={[
                  { label: 'A센터', value: 'A센터' },
                  { label: 'B센터', value: 'B센터' },
                  { label: 'C센터', value: 'C센터' },
                ]}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="카테고리 선택"
                style={{ width: '100%', borderRadius: '4px' }}
                onChange={(value) => setCategoryFilter(value)}
                options={[
                  { label: 'B-베베르망', value: 'B-베베르망' },
                  { label: 'B-동일등록상품(H/L)', value: 'B-동일등록상품(H/L)' },
                  { label: 'B-하루키즈', value: 'B-하루키즈' },
                  { label: 'B-리틀브로', value: 'B-리틀브로' },
                ]}
                allowClear
              />
            </Col>
          </Row>
          <Row gutter={[8, 8]}>
            <Col>
              <Button type="primary" icon={<PlusOutlined />}>
                신규 추가
              </Button>
            </Col>
            <Col>
              <Button icon={<ExportOutlined />}>
                내보내기
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card bordered={false} style={{ borderRadius: '8px' }}>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `총 ${total}개 상품 변형`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              scroll={{ x: 1400 }}
              size="middle"
            />
          </Spin>
        </Card>

        {/* Edit Modal */}
        <Modal
          title="재고 수정"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => form.submit()}
          width={600}
        >
          <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="상품 코드" name="productCode">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="바코드" name="barcode">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="상품명" name="productName">
              <Input disabled />
            </Form.Item>
            <Form.Item label="변형명" name="variantName">
              <Input disabled />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="재고 수량" name="stock" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="미출하 수량" name="notShippedQty" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Detail Drawer */}
        <Drawer
          title="창고 위치 상세 정보"
          placement="right"
          width={720}
          open={detailDrawerVisible}
          onClose={() => setDetailDrawerVisible(false)}
        >
          {selectedLocation && (
            <div>
              <Card style={{ marginBottom: '16px' }}>
                <Descriptions title="위치 정보" bordered size="small">
                  <Descriptions.Item label="위치 ID" span={2}>
                    {selectedLocation.locationId}
                  </Descriptions.Item>
                  <Descriptions.Item label="창고 ID">
                    {selectedLocation.warehouseId}
                  </Descriptions.Item>
                  <Descriptions.Item label="위치명" span={2}>
                    {selectedLocation.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="창고명">
                    {selectedLocation.warehouseName}
                  </Descriptions.Item>
                  <Descriptions.Item label="총 재고" span={2}>
                    <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                      {selectedLocation.stock.toLocaleString()}개
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="미출하 재고">
                    <span style={{ color: '#ff7a45' }}>
                      {selectedLocation.notShippedStock.toLocaleString()}개
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="상품 변형 수" span={3}>
                    <Badge count={selectedLocation.variantCount} showZero color="blue" />
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="재고 현황">
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                  <Col span={8}>
                    <Statistic 
                      title="재고 있음" 
                      value={selectedLocation.variants.filter(v => v.stock > 0).length}
                      suffix={`/ ${selectedLocation.variants.length}`}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="총 재고량" 
                      value={selectedLocation.variants.reduce((sum, v) => sum + v.stock, 0)}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="미출하량" 
                      value={selectedLocation.variants.reduce((sum, v) => sum + v.notShippedQty, 0)}
                      valueStyle={{ color: '#ff7a45' }}
                    />
                  </Col>
                </Row>

                <Table
                  dataSource={selectedLocation.variants.map(v => ({
                    ...v,
                    key: v.variantId,
                    availableQty: v.stock - v.notShippedQty
                  }))}
                  columns={[
                    {
                      title: '상품명',
                      dataIndex: 'productName',
                      key: 'productName',
                      render: (text: string, record: any) => (
                        <div>
                          <div style={{ fontWeight: 500 }}>{text}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{record.variantName}</div>
                        </div>
                      )
                    },
                    {
                      title: '재고',
                      dataIndex: 'stock',
                      key: 'stock',
                      width: 80,
                      render: (stock: number) => (
                        <span style={{ color: stock > 0 ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
                          {stock}
                        </span>
                      )
                    },
                    {
                      title: '가용',
                      dataIndex: 'availableQty',
                      key: 'availableQty',
                      width: 80,
                      render: (qty: number) => (
                        <span style={{ color: qty > 0 ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
                          {qty}
                        </span>
                      )
                    }
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </div>
          )}
        </Drawer>
      </div>
    </LayoutAntd>
  )
}
