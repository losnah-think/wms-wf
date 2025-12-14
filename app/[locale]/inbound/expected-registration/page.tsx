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
    message.success('품목이 등록되었습니다.')
  }

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      message.warning('삭제할 품목을 선택해주세요.')
      return
    }
    Modal.confirm({
      title: '품목 삭제',
      content: `${selectedRows.length}개의 품목을 삭제하시겠습니까?`,
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk() {
        const newData = tableData.filter(item => !selectedRows.includes(item.key))
        setTableData(newData)
        setSelectedRows([])
        message.success('품목이 삭제되었습니다.')
      },
    })
  }

  const handleRegister = () => {
    // 필수 필드 검증
    if (!formData.vendor) {
      message.error('공급업체를 선택해주세요')
      return
    }
    if (!formData.inboundDate) {
      message.error('입고일을 선택해주세요')
      return
    }
    if (!formData.inboundTime) {
      message.error('입고시간을 선택해주세요')
      return
    }
    if (tableData.length === 0) {
      message.error('최소 1개 이상의 품목을 등록해주세요')
      return
    }

    // 새로운 입고 지시 데이터 생성
    const newOrders = tableData.map((item, index) => ({
      key: `direction-${Date.now()}-${index}`,
      orderId: `RV-${formData.inboundDate.replace(/-/g, '')}-${String(index + 1).padStart(4, '0')}`,
      vendor: formData.vendor,
      date: formData.inboundDate,
      time: formData.inboundTime,
      quantity: parseInt(item.moveQty || '0') || 0,
      status: 'pending' as const,
      expectedDate: formData.inboundDate,
      transportType: formData.transportType,
      transportPrice: formData.transportPrice,
      memo: formData.memo,
    }))

    try {
      // localStorage에 저장
      localStorage.setItem('registeredInboundOrders', JSON.stringify(newOrders))
      message.success('입고 예정이 등록되었습니다')
      
      // 지시 페이지로 이동
      router.push('/inbound/direction')
    } catch (error) {
      message.error('등록 중 오류가 발생했습니다')
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
      title: '품목 코드',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: '상품명/상품 속성',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
    },
    {
      title: '공급처',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '검수 방법',
      dataIndex: 'quantityMethod',
      key: 'quantityMethod',
    },
    {
      title: '로트 번호',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
    },
    {
      title: '이동 수량',
      dataIndex: 'moveQty',
      key: 'moveQty',
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
        <span>입고</span>
        <span style={{ margin: '0 10px' }}>/</span>
        <span>입고 지시</span>
        <span style={{ margin: '0 10px' }}>/</span>
        <span>입고 예정 등록</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1>입고 예정 등록</h1>
      </div>

      {/* Filter Section - Warehouse Info */}
      <Card style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px', fontWeight: 'bold' }}>화주사</h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>* 화주명</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="select"
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
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>* 입고 예정일</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="select"
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
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>* 입고 예정 시간</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="select"
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
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>* 운송 유형</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="select"
              value={formData.transportType}
              onChange={(value) => setFormData({ ...formData, transportType: value })}
              options={[
                { label: '택배', value: 'delivery' },
                { label: '퀵배송', value: 'quick' },
                { label: '직접배송', value: 'direct' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>* 운송비</label>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="운송비 입력"
              value={formData.transportPrice as any}
              onChange={(value) => setFormData({ ...formData, transportPrice: value as any })}
              formatter={(value) => `${value}원`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseInt(value!.replace(/원/g, '').replace(/,/g, '')) as any}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>메모</label>
            </div>
            <Input
              placeholder="메모 입력"
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
          <h3 style={{ margin: 0, fontWeight: 'bold' }}>재고 이동 예정 목록</h3>
          <Space>
            <Button
              type="text"
              style={{ color: '#ff4d4f' }}
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >
              선택 삭제
            </Button>
            <Button
              type="text"
              style={{ color: '#0066cc' }}
              onClick={() => setIsModalVisible(true)}
            >
              품목 등록
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
              showTotal={(total) => `총 ${total}개`}
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
        <Button onClick={handlePrevious}>이전</Button>
        <Button type="primary" disabled={tableData.length === 0} onClick={handleRegister}>
          등록
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
      message.warning('추가할 상품을 선택해주세요.')
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
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '상품 옵션',
      dataIndex: 'productOption',
      key: 'productOption',
    },
    {
      title: '상품 코드',
      dataIndex: 'productCode',
      key: 'productCode',
    },
  ]

  return (
    <Modal
      title="품목 검색"
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
          취소하기
        </Button>,
        <Button key="submit" type="primary" onClick={handleAdd}>
          추가
        </Button>,
      ]}
    >
      {/* Search Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '15px', fontWeight: 'bold' }}>품목 검색</h4>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>화주명</label>
            </div>
            <Input disabled value="onedns_test" />
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>상품명</label>
            </div>
            <Input
              placeholder="품목명을 입력해주세요"
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
              <label>상품 코드</label>
            </div>
            <Input
              placeholder="품목코드를 입력해주세요"
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
          전체 상품 <span style={{ color: '#0066cc' }}>총 187 건</span>
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
            showTotal={(total) => `총 ${total}개`}
          />
        </div>
      </div>
    </Modal>
  )
}
