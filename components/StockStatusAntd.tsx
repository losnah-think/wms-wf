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
} from 'antd'
import { SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ExportOutlined } from '@ant-design/icons'
import { useTranslations } from 'next-intl'
import LayoutAntd from '@/components/LayoutAntd'

interface StockItem {
  key: string
  productId: string
  productName: string
  warehouse: string
  quantity: number
  reserved: number
  available: number
  status: 'inStock' | 'lowStock' | 'outOfStock'
  lastUpdated: string
}

export default function StockStatusAntd() {
  const t = useTranslations()
  const [loading, setLoading] = React.useState(false)
  const [searchText, setSearchText] = React.useState('')
  const [warehouseFilter, setWarehouseFilter] = React.useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [form] = Form.useForm()

  const mockData: StockItem[] = [
    {
      key: '1',
      productId: 'PRD-001',
      productName: '전자 제품 A',
      warehouse: 'A 창고',
      quantity: 500,
      reserved: 150,
      available: 350,
      status: 'inStock',
      lastUpdated: '2024-11-01 10:30',
    },
    {
      key: '2',
      productId: 'PRD-002',
      productName: '전자 제품 B',
      warehouse: 'B 창고',
      quantity: 50,
      reserved: 30,
      available: 20,
      status: 'lowStock',
      lastUpdated: '2024-11-01 09:15',
    },
    {
      key: '3',
      productId: 'PRD-003',
      productName: '전자 제품 C',
      warehouse: 'C 창고',
      quantity: 0,
      reserved: 0,
      available: 0,
      status: 'outOfStock',
      lastUpdated: '2024-11-01 08:00',
    },
  ]

  const [data, setData] = React.useState<StockItem[]>(mockData)

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
      title: '상품 ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '창고',
      dataIndex: 'warehouse',
      key: 'warehouse',
      filters: [
        { text: 'A 창고', value: 'A' },
        { text: 'B 창고', value: 'B' },
        { text: 'C 창고', value: 'C' },
      ],
    },
    {
      title: '총 수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number) => <span>{text.toLocaleString()}</span>,
    },
    {
      title: '예약 수량',
      dataIndex: 'reserved',
      key: 'reserved',
      render: (text: number) => <span style={{ color: '#ff7a45' }}>{text.toLocaleString()}</span>,
    },
    {
      title: '가능 수량',
      dataIndex: 'available',
      key: 'available',
      render: (text: number) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{text.toLocaleString()}</span>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>,
    },
    {
      title: '마지막 업데이트',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (text: string) => <small>{text}</small>,
    },
    {
      title: '작업',
      key: 'action',
      width: 100,
      render: (_: any, record: StockItem) => (
        <Space size="small">
          <Tooltip title="수정">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="삭제">
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (value) {
      setData(
        mockData.filter(
          (item) =>
            item.productId.toLowerCase().includes(value.toLowerCase()) ||
            item.productName.toLowerCase().includes(value.toLowerCase()),
        ),
      )
    } else {
      setData(mockData)
    }
  }

  return (
    <LayoutAntd>
      <div style={{ background: '#f5f5f5', padding: '24px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            재고 현황
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
            전체 창고의 재고 상황을 실시간으로 확인하세요
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                  {mockData.length}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  전체 상품
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                  {mockData.filter((item) => item.status === 'inStock').length}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  충분한 재고
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>
                  {mockData.filter((item) => item.status === 'lowStock').length}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  부족한 재고
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f5222d' }}>
                  {mockData.filter((item) => item.status === 'outOfStock').length}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  재고 없음
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Card
          style={{ marginBottom: '24px', borderRadius: '8px' }}
          bordered={false}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12}>
              <Input
                placeholder="상품명 또는 ID로 검색..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ borderRadius: '4px' }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Select
                placeholder="창고 선택"
                style={{ width: '100%', borderRadius: '4px' }}
                onChange={(value) => setWarehouseFilter(value)}
                options={[
                  { label: 'A 창고', value: 'A' },
                  { label: 'B 창고', value: 'B' },
                  { label: 'C 창고', value: 'C' },
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
              dataSource={data}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}개 항목`,
              }}
              scroll={{ x: 1200 }}
            />
          </Spin>
        </Card>

        {/* Edit Modal */}
        <Modal
          title="재고 수정"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="상품 ID">
              <Input disabled />
            </Form.Item>
            <Form.Item label="수량">
              <InputNumber min={0} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutAntd>
  )
}
