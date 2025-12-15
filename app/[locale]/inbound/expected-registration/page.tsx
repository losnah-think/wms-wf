'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Table,
  Button,
  Space,
  Select,
  Card,
  Row,
  Col,
  Pagination,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  Form,
  message,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { TableColumnsType } from 'antd'

interface InboundItem {
  key: string
  productCode: string
  productName: string
  supplier: string
  quantityMethod: string
  lotNumber: string
  moveQty: string
}

const mockData: InboundItem[] = [
  {
    key: '1',
    productCode: '10000890001',
    productName: '스타일 반팔 티셔츠\n블랙 칼러',
    supplier: '(주)스타일 씨이',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0001',
    moveQty: '100',
  },
  {
    key: '2',
    productCode: '10000890002',
    productName: '트렌드 긴팔 셔츠\n화이트 칼러',
    supplier: '(주)트렌드마켓',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0002',
    moveQty: '150',
  },
  {
    key: '3',
    productCode: '10000890003',
    productName: '보션산 청바지\n블루 칼러',
    supplier: '(주)보션산',
    quantityMethod: '수동',
    lotNumber: 'LOT-2025-0003',
    moveQty: '80',
  },
  {
    key: '4',
    productCode: '10000890004',
    productName: '디지털 스포츠화\n검정색',
    supplier: '(주)디지털스토어',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0004',
    moveQty: '120',
  },
  {
    key: '5',
    productCode: '10000890005',
    productName: '프리미엄 코트\n그레이 칼러',
    supplier: '(주)프리미엄샵',
    quantityMethod: '수동',
    lotNumber: 'LOT-2025-0005',
    moveQty: '50',
  },
]

export default function InboundExpectedRegistrationPage() {
  const router = useRouter()
  const t = useTranslations('inbound.expectedRegistration')
  const [form] = Form.useForm()
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [tableData, setTableData] = useState<InboundItem[]>(mockData)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [formData, setFormData] = useState({
    vendor: undefined,
    inboundDate: undefined,
    inboundTime: undefined,
    transportType: undefined,
    transportPrice: undefined,
    memo: undefined,
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })

  const paginatedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return tableData.slice(start, end)
  }, [tableData, pagination])

  const handleAddItem = (newItem: InboundItem) => {
    const key = Date.now().toString()
    setTableData([...tableData, { ...newItem, key }])
    setIsModalVisible(false)
    message.success(t('itemAddedSuccess'))
  }

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      message.warning(t('selectDelete'))
      return
    }
    Modal.confirm({
      title: t('registerItem'),
      content: t('confirmDelete').replace('{count}', selectedRows.length.toString()),
      okText: t('register'),
      cancelText: t('selectCancel'),
      okButtonProps: { danger: true },
      onOk() {
        const newData = tableData.filter(item => !selectedRows.includes(item.key))
        setTableData(newData)
        setSelectedRows([])
        message.success(t('deleteSuccess'))
      },
    })
  }

  const handleRegister = () => {
    // 필수 필드 검증
    if (!formData.vendor) {
      message.error(t('selectVendor'))
      return
    }
    if (!formData.inboundDate) {
      message.error(t('selectInboundDate'))
      return
    }
    if (!formData.inboundTime) {
      message.error(t('selectInboundTime'))
      return
    }
    if (tableData.length === 0) {
      message.error(t('noItems'))
      return
    }

    // 모든 상품을 하나의 오더로 생성
    const orderId = `RV-${formData.inboundDate.replace(/-/g, '')}-${String(1).padStart(4, '0')}`
    const newOrder = {
      key: `direction-${Date.now()}`,
      orderId: orderId,
      vendor: formData.vendor,
      date: formData.inboundDate,
      time: formData.inboundTime,
      items: tableData,
      totalQuantity: tableData.reduce((sum, item) => sum + (parseInt(item.moveQty || '0') || 0), 0),
      status: 'pending' as const,
      expectedDate: formData.inboundDate,
      transportType: formData.transportType,
      transportPrice: formData.transportPrice,
      memo: formData.memo,
    }

    try {
      // localStorage에 저장
      const existingOrders = JSON.parse(localStorage.getItem('registeredInboundOrders') || '[]')
      existingOrders.push(newOrder)
      localStorage.setItem('registeredInboundOrders', JSON.stringify(existingOrders))
      message.success(t('registerSuccess'))
      
      // 지시 페이지로 이동
      router.push('/inbound/direction')
    } catch (error) {
      message.error(t('registerError'))
      console.error(error)
    }
  }

  const handlePrevious = () => {
    router.push('/inbound/direction')
  }

  const columns: TableColumnsType<InboundItem> = [
    {
      title: (
        <Checkbox
          indeterminate={selectedRows.length > 0 && selectedRows.length < tableData.length}
          checked={selectedRows.length === tableData.length && tableData.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(tableData.map((item) => item.key))
            } else {
              setSelectedRows([])
            }
          }}
        />
      ),
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record.key])
            } else {
              setSelectedRows(selectedRows.filter((key) => key !== record.key))
            }
          }}
        />
      ),
    },
    {
      title: t('productCode'),
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: t('productName'),
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
    },
    {
      title: t('supplier'),
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: t('quantityMethod'),
      dataIndex: 'quantityMethod',
      key: 'quantityMethod',
    },
    {
      title: t('lotNumber'),
      dataIndex: 'lotNumber',
      key: 'lotNumber',
    },
    {
      title: t('moveQuantity'),
      dataIndex: 'moveQty',
      key: 'moveQty',
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
        <span>{t('breadcrumb.inbound')}</span>
        <span style={{ margin: '0 10px' }}>/</span>
        <span>{t('breadcrumb.direction')}</span>
        <span style={{ margin: '0 10px' }}>/</span>
        <span>{t('breadcrumb.registration')}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1>{t('title')}</h1>
      </div>

      {/* Filter Section - Warehouse Info */}
      <Card style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px', fontWeight: 'bold' }}>{t('vendor')}</h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>{t('requiredVendor')}</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder={t('selectPlaceholder')}
              value={formData.vendor}
              onChange={(value) => setFormData({ ...formData, vendor: value })}
              options={[
                { label: '(주)스타일 씨이', value: 'vendor1' },
                { label: '(주)트렌드마켓', value: 'vendor2' },
                { label: '(주)보선산', value: 'vendor3' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>{t('requiredInboundDate')}</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder={t('selectPlaceholder')}
              value={formData.inboundDate}
              onChange={(value) => setFormData({ ...formData, inboundDate: value })}
              options={[
                { label: '2025-05-10', value: '2025-05-10' },
                { label: '2025-05-11', value: '2025-05-11' },
                { label: '2025-05-12', value: '2025-05-12' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>{t('requiredInboundTime')}</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder={t('selectPlaceholder')}
              value={formData.inboundTime}
              onChange={(value) => setFormData({ ...formData, inboundTime: value })}
              options={[
                { label: '09:00', value: '09:00' },
                { label: '10:00', value: '10:00' },
                { label: '14:00', value: '14:00' },
                { label: '16:00', value: '16:00' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>{t('requiredTransportType')}</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder={t('selectPlaceholder')}
              value={formData.transportType}
              onChange={(value) => setFormData({ ...formData, transportType: value })}
              options={[
                { label: t('deliveryType'), value: 'delivery' },
                { label: t('quickType'), value: 'quick' },
                { label: t('directType'), value: 'direct' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>{t('requiredTransportPrice')}</label>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              placeholder={t('transportPricePlaceholder')}
              value={formData.transportPrice as any}
              onChange={(value) => setFormData({ ...formData, transportPrice: value as any })}
              formatter={(value) => `${value}원`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseInt(value!.replace(/원/g, '').replace(/,/g, '')) as any}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('memo')}</label>
            </div>
            <Input
              placeholder={t('memoPlaceholder')}
              value={formData.memo as any}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            />
          </Col>
        </Row>
      </Card>

      {/* Filter Section - Items */}
      <Card style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, fontWeight: 'bold' }}>{t('inventory')}</h3>
          <Space>
            <Button
              type="text"
              style={{ color: '#ff4d4f' }}
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >
              {t('deleteSelected')}
            </Button>
            <Button
              type="text"
              style={{ color: '#0066cc' }}
              onClick={() => setIsModalVisible(true)}
            >
              {t('registerItem')}
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          scroll={{ x: 1200 }}
          style={{ marginBottom: '20px' }}
        />

        {/* Pagination */}
        {tableData.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
            }}
          >
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={tableData.length}
              onChange={(page) => setPagination({ ...pagination, current: page })}
              showQuickJumper
              showTotal={(total) => t('total').replace('{total}', total.toString())}
            />
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}
      >
        <Button onClick={handlePrevious}>{t('previous')}</Button>
        <Button type="primary" disabled={tableData.length === 0} onClick={handleRegister}>
          {t('register')}
        </Button>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onAdd={handleAddItem}
      />
    </div>
  )
}

interface AddItemModalProps {
  visible: boolean
  onCancel: () => void
  onAdd: (item: InboundItem) => void
}

const mockProducts = [
  {
    key: '1',
    productName: '스타일 반팔 티셔츠',
    productOption: '블랙',
    productCode: '10000890001',
    supplier: '(주)스타일 씨이',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0001',
  },
  {
    key: '2',
    productName: '트렌드 긴팔 셔츠',
    productOption: '화이트',
    productCode: '10000890002',
    supplier: '(주)트렌드마켓',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0002',
  },
  {
    key: '3',
    productName: '보션산 청바지',
    productOption: '블루',
    productCode: '10000890003',
    supplier: '(주)보션산',
    quantityMethod: '수동',
    lotNumber: 'LOT-2025-0003',
  },
  {
    key: '4',
    productName: '디지털 스포츠화',
    productOption: '검정색',
    productCode: '10000890004',
    supplier: '(주)디지털스토어',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0004',
  },
  {
    key: '5',
    productName: '프리미엄 코트',
    productOption: '그레이',
    productCode: '10000890005',
    supplier: '(주)프리미엄샵',
    quantityMethod: '수동',
    lotNumber: 'LOT-2025-0005',
  },
  {
    key: '6',
    productName: '캐주얼 반바지',
    productOption: '카키',
    productCode: '10000890006',
    supplier: '(주)스타일 씨이',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0006',
  },
  {
    key: '7',
    productName: '운동화 에어쿠션',
    productOption: '화이트/블랙',
    productCode: '10000890007',
    supplier: '(주)트렌드마켓',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0007',
  },
  {
    key: '8',
    productName: '스타일 니트 가디건',
    productOption: '크림색',
    productCode: '10000890008',
    supplier: '(주)보션산',
    quantityMethod: '수동',
    lotNumber: 'LOT-2025-0008',
  },
  {
    key: '9',
    productName: '데님 점퍼',
    productOption: '라이트 블루',
    productCode: '10000890009',
    supplier: '(주)디지털스토어',
    quantityMethod: '자동',
    lotNumber: 'LOT-2025-0009',
  },
]

function AddItemModal({ visible, onCancel, onAdd }: AddItemModalProps) {
  const [form] = Form.useForm()
  const t = useTranslations('inbound.expectedRegistration')
  const [searchParams, setSearchParams] = useState({
    productName: '',
    productCode: '',
  })
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [selectedProductKeys, setSelectedProductKeys] = useState<string[]>([])

  const handleSearch = () => {
    const filtered = mockProducts.filter((product) => {
      const nameMatch =
        searchParams.productName === '' ||
        product.productName.includes(searchParams.productName)
      const codeMatch =
        searchParams.productCode === '' ||
        product.productCode.includes(searchParams.productCode)
      return nameMatch && codeMatch
    })
    setFilteredProducts(filtered)
    setPagination({ current: 1, pageSize: 10 })
  }

  const handleClear = () => {
    setSearchParams({ productName: '', productCode: '' })
    setFilteredProducts(mockProducts)
    setPagination({ current: 1, pageSize: 10 })
  }

  const paginatedProducts = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredProducts.slice(start, end)
  }, [filteredProducts, pagination])

  const handleAdd = () => {
    if (selectedProductKeys.length === 0) {
      message.warning(t('selectProduct'))
      return
    }

    selectedProductKeys.forEach((selectedProductKey) => {
      const selectedProduct = filteredProducts.find((p) => p.key === selectedProductKey)
      if (selectedProduct) {
        const newItem: InboundItem = {
          key: Date.now().toString() + Math.random(),
          productCode: selectedProduct.productCode,
          productName: selectedProduct.productName,
          supplier: selectedProduct.supplier || '',
          quantityMethod: selectedProduct.quantityMethod || '자동',
          lotNumber: selectedProduct.lotNumber || '',
          moveQty: '',
        }
        onAdd(newItem)
      }
    })
    handleClear()
    setSelectedProductKeys([])
  }

  const columns: TableColumnsType<(typeof mockProducts)[0]> = [
    {
      title: (
        <Checkbox
          indeterminate={selectedProductKeys.length > 0 && selectedProductKeys.length < paginatedProducts.length}
          checked={selectedProductKeys.length === paginatedProducts.length && paginatedProducts.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProductKeys(paginatedProducts.map((p) => p.key))
            } else {
              setSelectedProductKeys([])
            }
          }}
        />
      ),
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedProductKeys.includes(record.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProductKeys([...selectedProductKeys, record.key])
            } else {
              setSelectedProductKeys(selectedProductKeys.filter((key) => key !== record.key))
            }
          }}
        />
      ),
    },
    {
      title: t('productName'),
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: t('productOption'),
      dataIndex: 'productOption',
      key: 'productOption',
    },
    {
      title: t('productCode'),
      dataIndex: 'productCode',
      key: 'productCode',
    },
  ]

  return (
    <Modal
      title={t('productSearch')}
      open={visible}
      onCancel={() => {
        onCancel()
        handleClear()
        setSelectedProductKeys([])
      }}
      width={1000}
      footer={[
        <Button key="cancel" onClick={() => {
          onCancel()
          handleClear()
          setSelectedProductKeys([])
        }}>
          {t('selectCancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleAdd}>
          {t('registerItem')}
        </Button>,
      ]}
    >
      {/* Search Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '15px', fontWeight: 'bold' }}>{t('productSearch')}</h4>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('vendorName')}</label>
            </div>
            <Input disabled value="onedns_test" />
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('productName')}</label>
            </div>
            <Input
              placeholder={t('searchByName')}
              value={searchParams.productName}
              onChange={(e) => setSearchParams({ ...searchParams, productName: e.target.value })}
              suffix={
                <Button
                  type="text"
                  style={{ color: '#0066cc', padding: '0 4px' }}
                  onClick={handleSearch}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M7 13C10.314 13 13 10.314 13 7C13 3.686 10.314 1 7 1C3.686 1 1 3.686 1 7C1 10.314 3.686 13 7 13Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 15L11 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              }
            />
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('productCode')}</label>
            </div>
            <Input
              placeholder={t('searchByCode')}
              value={searchParams.productCode}
              onChange={(e) => setSearchParams({ ...searchParams, productCode: e.target.value })}
              suffix={
                <Button
                  type="text"
                  style={{ color: '#0066cc', padding: '0 4px' }}
                  onClick={handleSearch}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M7 13C10.314 13 13 10.314 13 7C13 3.686 10.314 1 7 1C3.686 1 1 3.686 1 7C1 10.314 3.686 13 7 13Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 15L11 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              }
            />
          </Col>
        </Row>
      </div>

      {/* Products List Section */}
      <div>
        <h4 style={{ marginBottom: '15px', fontWeight: 'bold' }}>
          {t('allProducts')} <span style={{ color: '#0066cc' }}>{t('total').replace('{total}', filteredProducts.length.toString())}</span>
        </h4>
        <Table
          columns={columns}
          dataSource={paginatedProducts}
          pagination={false}
          scroll={{ x: 800 }}
          size="small"
          style={{ marginBottom: '20px' }}
        />

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={filteredProducts.length}
            onChange={(page) => setPagination({ ...pagination, current: page })}
            showQuickJumper
            showTotal={(total) => t('total').replace('{total}', total.toString())}
          />
        </div>
      </div>
    </Modal>
  )
}
