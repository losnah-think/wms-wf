'use client'

import { useMemo, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Select,
  DatePicker,
  Checkbox,
  Button,
  Table,
  Input,
  Tag,
  Tabs,
  Space,
  Breadcrumb,
  InputNumber,
} from 'antd'
import { SearchOutlined, FilterOutlined, DeleteOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'

interface InventoryItem {
  id: number
  productCode: string
  productName: string
  category: string
  brand: string
  warehouse: string
  zone: string
  quantity: number
  price: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  statusText: string
  createdDate: string
  modifiedDate: string
  saleStatus: 'selling' | 'sold_out' | 'discontinued'
  saleStatusText: string
  supplier: string
  season: string
  year: string
}

// 샘플 데이터 생성
const generateInventoryData = (): InventoryItem[] => {
  const products = ['상품A', '상품B', '상품C', '상품D', '상품E', '상품F']
  const categories = ['의류', '신발', '가방', '액세서리']
  const brands = ['브랜드1', '브랜드2', '브랜드3', '브랜드4']
  const warehouses = ['서울 본점', '인천 센터', '대구 센터', '부산 센터']
  const zones = ['A', 'B', 'C', 'D']
  const suppliers = ['공급처A', '공급처B', '공급처C']
  const seasons = ['봄', '여름', '가을', '겨울']
  const years = ['2023', '2024', '2025']
  const saleStatuses = ['selling', 'sold_out', 'discontinued']

  const data: InventoryItem[] = []

  for (let i = 1; i <= 100; i++) {
    const quantity = Math.floor(Math.random() * 5000)
    const status =
      quantity > 100 ? 'in_stock' : quantity > 20 ? 'low_stock' : 'out_of_stock'
    const saleStatus = saleStatuses[Math.floor(Math.random() * saleStatuses.length)] as
      | 'selling'
      | 'sold_out'
      | 'discontinued'

    data.push({
      id: i,
      productCode: `PROD-${String(i).padStart(5, '0')}`,
      productName: `${products[i % products.length]} #${i}`,
      category: categories[i % categories.length],
      brand: brands[i % brands.length],
      warehouse: warehouses[i % warehouses.length],
      zone: zones[i % zones.length],
      quantity,
      price: Math.floor(Math.random() * 300000) + 5000,
      status,
      statusText: status === 'in_stock' ? '재고충분' : status === 'low_stock' ? '적은재고' : '품절',
      createdDate: dayjs().subtract(Math.random() * 30, 'days').format('YYYY-MM-DD'),
      modifiedDate: dayjs().subtract(Math.random() * 7, 'days').format('YYYY-MM-DD'),
      saleStatus,
      saleStatusText: saleStatus === 'selling' ? '판매중' : saleStatus === 'sold_out' ? '품절' : '단종',
      supplier: suppliers[i % suppliers.length],
      season: seasons[i % seasons.length],
      year: years[i % years.length],
    })
  }

  return data
}

export default function AdvancedInventoryPage() {
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({
    warehouse: 'all',
    search: '',
    category: [],
    brand: [],
    saleStatus: 'all',
    supplier: [],
    dateRange: [null, null] as any,
    quantityRange: [0, 5000],
    priceRange: [0, 300000],
    includeOutOfStock: true,
    showDeletedWarehouse: false,
  })

  const allData = useMemo(() => generateInventoryData(), [])

  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      // 창고 필터
      if (filters.warehouse !== 'all' && item.warehouse !== filters.warehouse) {
        return false
      }

      // 검색어 필터
      if (
        filters.search &&
        !item.productName.includes(filters.search) &&
        !item.productCode.includes(filters.search)
      ) {
        return false
      }

      // 카테고리 필터
      if (filters.category.length > 0 && !filters.category.includes(item.category)) {
        return false
      }

      // 브랜드 필터
      if (filters.brand.length > 0 && !filters.brand.includes(item.brand)) {
        return false
      }

      // 판매상태 필터
      if (filters.saleStatus !== 'all' && item.saleStatus !== filters.saleStatus) {
        return false
      }

      // 공급처 필터
      if (filters.supplier.length > 0 && !filters.supplier.includes(item.supplier)) {
        return false
      }

      // 재고량 범위 필터
      if (
        item.quantity < filters.quantityRange[0] ||
        item.quantity > filters.quantityRange[1]
      ) {
        return false
      }

      // 가격 범위 필터
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
        return false
      }

      // 재고 상태 필터
      if (!filters.includeOutOfStock && item.status === 'out_of_stock') {
        return false
      }

      return true
    })
  }, [allData, filters])

  const columns: TableColumnsType<InventoryItem> = [
    {
      title: '상품코드',
      dataIndex: 'productCode',
      key: 'productCode',
      width: '10%',
    },
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: '15%',
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: '10%',
    },
    {
      title: '브랜드',
      dataIndex: 'brand',
      key: 'brand',
      width: '10%',
    },
    {
      title: '창고',
      dataIndex: 'warehouse',
      key: 'warehouse',
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
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      width: '10%',
      render: (text) => `${text.toLocaleString()}원`,
    },
    {
      title: '판매상태',
      key: 'saleStatus',
      width: '8%',
      render: (_, record) => (
        <Tag
          color={
            record.saleStatus === 'selling'
              ? 'green'
              : record.saleStatus === 'sold_out'
                ? 'orange'
                : 'red'
          }
        >
          {record.saleStatusText}
        </Tag>
      ),
    },
    {
      title: '상태',
      key: 'status',
      width: '8%',
      render: (_, record) => (
        <Tag
          color={
            record.status === 'in_stock'
              ? 'green'
              : record.status === 'low_stock'
                ? 'orange'
                : 'red'
          }
        >
          {record.statusText}
        </Tag>
      ),
    },
  ]

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleReset = () => {
    form.resetFields()
    setFilters({
      warehouse: 'all',
      search: '',
      category: [],
      brand: [],
      saleStatus: 'all',
      supplier: [],
      dateRange: [null, null],
      quantityRange: [0, 5000],
      priceRange: [0, 300000],
      includeOutOfStock: true,
      showDeletedWarehouse: false,
    })
  }

  const warehouses = ['서울 본점', '인천 센터', '대구 센터', '부산 센터']
  const categories = ['의류', '신발', '가방', '액세서리']
  const brands = ['브랜드1', '브랜드2', '브랜드3', '브랜드4']
  const suppliers = ['공급처A', '공급처B', '공급처C']

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', padding: '40px' }}>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[{ title: '재고관리' }, { title: '고급 재고 관리' }]}
            style={{ marginBottom: '16px' }}
          />
          <h1
            style={{
              color: '#1F2B60',
              fontSize: 40,
              fontFamily: 'Pretendard',
              fontWeight: 700,
              margin: 0,
              marginBottom: '8px',
            }}
          >
            고급 재고 관리
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            다양한 필터로 재고를 검색하고 관리합니다
          </p>
        </div>

        {/* 필터 섹션 */}
        <Card style={{ marginBottom: '24px' }}>
          <Tabs
            items={[
              {
                key: '1',
                label: (
                  <span>
                    <FilterOutlined /> 기본 필터
                  </span>
                ),
                children: (
                  <Form form={form} layout="vertical">
                    <Row gutter={16}>
                      {/* 통합 검색 */}
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="통합검색">
                          <Input
                            placeholder="상품명, 코드 검색"
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                          />
                        </Form.Item>
                      </Col>

                      {/* 창고 */}
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="창고">
                          <Select
                            value={filters.warehouse}
                            onChange={(value) => handleFilterChange('warehouse', value)}
                            options={[
                              { label: '전체 창고', value: 'all' },
                              ...warehouses.map((w) => ({ label: w, value: w })),
                            ]}
                          />
                        </Form.Item>
                      </Col>

                      {/* 카테고리 */}
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="카테고리">
                          <Select
                            mode="multiple"
                            placeholder="카테고리 선택"
                            value={filters.category}
                            onChange={(value) => handleFilterChange('category', value)}
                            options={categories.map((c) => ({ label: c, value: c }))}
                          />
                        </Form.Item>
                      </Col>

                      {/* 브랜드 */}
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="브랜드">
                          <Select
                            mode="multiple"
                            placeholder="브랜드 선택"
                            value={filters.brand}
                            onChange={(value) => handleFilterChange('brand', value)}
                            options={brands.map((b) => ({ label: b, value: b }))}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      {/* 판매상태 */}
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="판매상태">
                          <Select
                            value={filters.saleStatus}
                            onChange={(value) => handleFilterChange('saleStatus', value)}
                            options={[
                              { label: '전체', value: 'all' },
                              { label: '판매중', value: 'selling' },
                              { label: '품절', value: 'sold_out' },
                              { label: '단종', value: 'discontinued' },
                            ]}
                          />
                        </Form.Item>
                      </Col>

                      {/* 공급처 */}
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="공급처">
                          <Select
                            mode="multiple"
                            placeholder="공급처 선택"
                            value={filters.supplier}
                            onChange={(value) => handleFilterChange('supplier', value)}
                            options={suppliers.map((s) => ({ label: s, value: s }))}
                          />
                        </Form.Item>
                      </Col>

                      {/* 재고량 범위 */}
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="재고량 범위 (개)">
                          <Row gutter={8}>
                            <Col flex="auto">
                              <InputNumber
                                min={0}
                                value={filters.quantityRange[0]}
                                onChange={(value) =>
                                  handleFilterChange('quantityRange', [value || 0, filters.quantityRange[1]])
                                }
                                style={{ width: '100%' }}
                              />
                            </Col>
                            <Col>~</Col>
                            <Col flex="auto">
                              <InputNumber
                                min={0}
                                value={filters.quantityRange[1]}
                                onChange={(value) =>
                                  handleFilterChange('quantityRange', [filters.quantityRange[0], value || 5000])
                                }
                                style={{ width: '100%' }}
                              />
                            </Col>
                          </Row>
                        </Form.Item>
                      </Col>

                      {/* 가격 범위 */}
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="가격 범위 (원)">
                          <Row gutter={8}>
                            <Col flex="auto">
                              <InputNumber
                                min={0}
                                value={filters.priceRange[0]}
                                onChange={(value) =>
                                  handleFilterChange('priceRange', [value || 0, filters.priceRange[1]])
                                }
                                style={{ width: '100%' }}
                              />
                            </Col>
                            <Col>~</Col>
                            <Col flex="auto">
                              <InputNumber
                                min={0}
                                value={filters.priceRange[1]}
                                onChange={(value) =>
                                  handleFilterChange('priceRange', [filters.priceRange[0], value || 300000])
                                }
                                style={{ width: '100%' }}
                              />
                            </Col>
                          </Row>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                ),
              },
              {
                key: '2',
                label: (
                  <span>
                    <FilterOutlined /> 고급 옵션
                  </span>
                ),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Checkbox
                      checked={filters.includeOutOfStock}
                      onChange={(e) => handleFilterChange('includeOutOfStock', e.target.checked)}
                    >
                      품절 상품 포함
                    </Checkbox>
                    <Checkbox
                      checked={filters.showDeletedWarehouse}
                      onChange={(e) => handleFilterChange('showDeletedWarehouse', e.target.checked)}
                    >
                      삭제된 창고 포함
                    </Checkbox>
                  </Space>
                ),
              },
            ]}
          />

          {/* 버튼 */}
          <Row gutter={8} style={{ marginTop: '16px' }}>
            <Col>
              <Button type="primary" icon={<SearchOutlined />}>
                검색
              </Button>
            </Col>
            <Col>
              <Button icon={<DeleteOutlined />} onClick={handleReset}>
                초기화
              </Button>
            </Col>
            <Col>
              <span style={{ color: '#666', fontSize: '12px' }}>
                검색 결과: <strong>{filteredData.length}</strong>개
              </span>
            </Col>
          </Row>
        </Card>

        {/* 테이블 */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 20 }}
            rowKey="id"
            scroll={{ x: true }}
            size="small"
          />
        </Card>
      </div>
    </div>
  )
}
