'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  Tag,
  message,
  Modal,
  Tabs,
  DatePicker
} from 'antd'
import dayjs from 'dayjs'
import type { TableColumnsType } from 'antd'

interface InboundExecution {
  key: string
  orderId: string
  vendor: string
  productCode: string
  inspectionRequestDate: string
  inspectionCompletionDate: string
  placementRequestDate: string
  placementCompletionDate: string
  plannedQty: string
  inspectionCompletedQty: string
  placementCompletedQty: string
  status: 'receipt' | 'inspecting' | 'inspection_complete' | 'pending' | 'placed' | 'completed'
  worker: string
  inspectionProgressDate?: string
  placementProgressDate?: string
  transportType?: string
  transportPrice?: string
  expectedDate?: string
  placementProgressQty?: string
}

const mockData: InboundExecution[] = [
  {
    key: '1',
    orderId: 'RV-20250515-0026',
    vendor: '(주)스타일 씨이',
    productCode: '10000890001',
    inspectionRequestDate: '2025.12.10',
    inspectionCompletionDate: '2025.12.11',
    placementRequestDate: '2025.12.12',
    placementCompletionDate: '2025.12.13',
    plannedQty: '300개',
    inspectionCompletedQty: '300개',
    placementCompletedQty: '300개',
    status: 'completed',
    worker: '이상현',
    transportType: '택배',
    transportPrice: '50,000',
  },
  {
    key: '2',
    orderId: 'RV-20250515-0027',
    vendor: '(주)트렌드마켓',
    productCode: '10000890002',
    inspectionRequestDate: '2025.12.11',
    inspectionCompletionDate: '2025.12.12',
    placementRequestDate: '2025.12.13',
    placementCompletionDate: '-',
    plannedQty: '150개',
    inspectionCompletedQty: '150개',
    placementCompletedQty: '0개',
    status: 'pending',
    worker: '박진민',
    transportType: '화물',
    transportPrice: '80,000',
  },
  {
    key: '3',
    orderId: 'RV-20250515-0028',
    vendor: '(주)보션산',
    productCode: '10000890003',
    inspectionRequestDate: '2025.12.09',
    inspectionCompletionDate: '2025.12.10',
    placementRequestDate: '2025.12.11',
    placementCompletionDate: '2025.12.14',
    plannedQty: '200개',
    inspectionCompletedQty: '200개',
    placementCompletedQty: '200개',
    status: 'completed',
    worker: '김한주',
    transportType: '택배',
    transportPrice: '60,000',
  },
  {
    key: '4',
    orderId: 'RV-20250515-0029',
    vendor: '(주)디지털스토어',
    productCode: '10000890004',
    inspectionRequestDate: '2025.12.12',
    inspectionCompletionDate: '-',
    placementRequestDate: '-',
    placementCompletionDate: '-',
    plannedQty: '100개',
    inspectionCompletedQty: '0개',
    placementCompletedQty: '0개',
    status: 'receipt',
    worker: '이정우',
    transportType: '택배',
    transportPrice: '40,000',
  },
  {
    key: '5',
    orderId: 'RV-20250515-0030',
    vendor: '(주)프리미엄샵',
    productCode: '10000890005',
    inspectionRequestDate: '2025.12.13',
    inspectionCompletionDate: '2025.12.13',
    placementRequestDate: '2025.12.14',
    placementCompletionDate: '-',
    plannedQty: '250개',
    inspectionCompletedQty: '250개',
    placementCompletedQty: '0개',
    status: 'pending',
    worker: '최준흠',
    transportType: '화물',
    transportPrice: '100,000',
  },
]

const statusTabs = [
  { key: 'receipt', label: 'Inspection Scheduled', count: 5 },
  { key: 'inspecting', label: 'Inspecting', count: 0 },
  { key: 'inspection_complete', label: 'Inspection Complete', count: 0 },
  { key: 'pending', label: 'Placement Scheduled', count: 0 },
  { key: 'placed', label: 'Placing', count: 0 },
  { key: 'completed', label: 'Placement Complete', count: 0 },
]

export default function InboundExecutionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('inbound.execution')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const tabParam = searchParams.get('tab') || 'receipt'
  const [activeTab, setActiveTab] = useState(tabParam)
  const [executionData, setExecutionData] = useState<InboundExecution[]>(mockData)
  const [todayFilter, setTodayFilter] = useState(true)

  // URL의 tab 파라미터가 변경될 때 activeTab 업데이트
  React.useEffect(() => {
    const newTab = searchParams.get('tab') || 'receipt'
    setActiveTab(newTab)
  }, [searchParams])
  const [filters, setFilters] = useState({
    vendor: undefined as string | undefined,
    orderId: undefined as string | undefined,
    productCode: undefined as string | undefined,
    status: undefined as string | undefined,
    inspectionRequestDateRange: [undefined, undefined] as any[],
    inspectionCompletionDateRange: [undefined, undefined] as any[],
    placementRequestDateRange: [undefined, undefined] as any[],
    placementCompletionDateRange: [undefined, undefined] as any[],
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<InboundExecution | null>(null)

  useEffect(() => {
    const ordersParam = searchParams.get('orders')
    if (ordersParam) {
      try {
        const orders = JSON.parse(ordersParam)
        const ordersWithStatus = orders.map((order: any) => ({
          ...order,
          status: 'receipt' as const,
        }))
        setExecutionData(ordersWithStatus)
        message.success(`${orders.length} ${t('ordersMovedMessage')}`)
      } catch (error) {
        console.error('Error parsing orders:', error)
        message.error(t('loadingErrorDetail'))
      }
    }

    // 로컬스토리지에서 검수 완료된 오더 확인
    try {
      const completedInspections = JSON.parse(localStorage.getItem('completedInspections') || '[]')
      if (completedInspections.length > 0) {
        setExecutionData((prevData) => {
          const updatedData = prevData.map((item) => {
            const completed = completedInspections.find((c: any) => c.orderId === item.orderId)
            if (completed) {
              return { ...item, status: 'inspection_complete' as const }
            }
            return item
          })
          return updatedData
        })
        // 처리된 데이터 삭제
        localStorage.removeItem('completedInspections')
      }
    } catch (error) {
      console.error('Error processing completed inspections:', error)
    }

    // 로컬스토리지에서 적치 완료된 오더 확인
    try {
      const completedPlacements = JSON.parse(localStorage.getItem('completedPlacements') || '[]')
      if (completedPlacements.length > 0) {
        setExecutionData((prevData) => {
          const updatedData = prevData.map((item) => {
            const completed = completedPlacements.find((c: any) => c.orderId === item.orderId)
            if (completed) {
              return {
                ...item,
                status: 'completed' as const,
                placementExpectedDate: item.expectedDate,
                placementInstructionDate: item.inspectionRequestDate,
                placementCompletionDate: completed.placementCompletionDate,
                placementConfirmedQty: item.plannedQty,
                placementWorker: completed.placementWorker,
              }
            }
            return item
          })
          return updatedData
        })
        // 처리된 데이터 삭제
        localStorage.removeItem('completedPlacements')
      }
    } catch (error) {
      console.error('Error processing completed placements:', error)
    }
  }, [searchParams])

  const handleInspectionComplete = () => {
    if (selectedRows.length === 0) {
      message.warning('검수를 완료할 오더를 선택해주세요.')
      return
    }

    // 선택된 행의 상태를 'inspection_complete'로 변경
    const updatedData = executionData.map((item) => {
      if (selectedRows.includes(item.key)) {
        return { ...item, status: 'inspection_complete' as const }
      }
      return item
    })

    setExecutionData(updatedData)
    setSelectedRows([])
    message.success(t('inspectionCompleteMessage'))
  }

  const handlePlacementInstruction = () => {
    if (selectedRows.length === 0) {
      message.warning(t('selectOrderForPlacement'))
      return
    }

    // 선택된 행의 상태를 'pending'(적치 예정)으로 변경
    const updatedData = executionData.map((item) => {
      if (selectedRows.includes(item.key)) {
        return { ...item, status: 'pending' as const }
      }
      return item
    })

    setExecutionData(updatedData)
    setSelectedRows([])
    message.success(t('placementInstructionMessage'))
  }

  const handlePlacementQuantityConfirmation = () => {
    if (selectedRows.length === 0) {
      message.warning(t('selectOrderForQuantity'))
      return
    }

    // 선택된 행의 상태를 'placed'(적치 중)로 변경
    const updatedData = executionData.map((item) => {
      if (selectedRows.includes(item.key)) {
        return { ...item, status: 'placed' as const }
      }
      return item
    })

    setExecutionData(updatedData)
    
    // 첫 번째 선택된 오더의 정보를 가져와서 상세 페이지로 이동
    const firstSelectedOrderId = selectedRows[0]
    const selectedOrder = executionData.find(item => item.key === firstSelectedOrderId)
    if (selectedOrder) {
      // 상태 정보를 쿼리 파라미터로 전달
      router.push(`/inbound/placement/${selectedOrder.orderId}?status=placed`)
      setSelectedRows([])
    }
  }

  const handlePlacementComplete = () => {
    if (selectedRows.length === 0) {
      message.warning(t('selectOrderForCompletion'))
      return
    }

    // 선택된 행의 상태를 'completed'(적치 완료)로 변경
    const updatedData = executionData.map((item) => {
      if (selectedRows.includes(item.key)) {
        return { ...item, status: 'completed' as const }
      }
      return item
    })

    setExecutionData(updatedData)
    setSelectedRows([])
    message.success(t('placementCompleteMessage'))
  }

  const handleQuantityConfirmation = () => {
    if (selectedRows.length === 0) {
      message.warning(t('selectOrderForQuantity'))
      return
    }

    // 선택된 행의 상태를 'inspecting'로 변경
    const updatedData = executionData.map((item) => {
      if (selectedRows.includes(item.key)) {
        return { ...item, status: 'inspecting' as const }
      }
      return item
    })

    setExecutionData(updatedData)
    
    // 첫 번째 선택된 오더의 정보를 가져와서 상세 페이지로 이동
    const firstSelectedOrderId = selectedRows[0]
    const selectedOrder = executionData.find(item => item.key === firstSelectedOrderId)
    if (selectedOrder) {
      // 상태 정보를 쿼리 파라미터로 전달
      router.push(`/inbound/execution/${selectedOrder.orderId}?status=inspecting`)
      setSelectedRows([])
    }
  }

  const filteredData = useMemo(() => {
    let data = executionData

    // 탭 기반 상태 필터 (activeTab에 따라 상태로 필터링)
    data = data.filter((item) => item.status === activeTab)

    // 화주명 필터
    if (filters.vendor) {
      data = data.filter((item) => item.vendor === filters.vendor)
    }

    // 입고 오더 목록 필터
    if (filters.orderId) {
      data = data.filter((item) => item.orderId.includes(filters.orderId))
    }

    // 품목 코드 필터
    if (filters.productCode) {
      data = data.filter((item) => item.productCode.includes(filters.productCode!))
    }

    // 검수 요청일 필터
    if (filters.inspectionRequestDateRange[0] && filters.inspectionRequestDateRange[1]) {
      const startDate = dayjs(filters.inspectionRequestDateRange[0]).format('YYYY.MM.DD')
      const endDate = dayjs(filters.inspectionRequestDateRange[1]).format('YYYY.MM.DD')
      data = data.filter((item) => {
        const itemDate = item.inspectionRequestDate
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // 검수 완료일 필터
    if (filters.inspectionCompletionDateRange[0] && filters.inspectionCompletionDateRange[1]) {
      const startDate = dayjs(filters.inspectionCompletionDateRange[0]).format('YYYY.MM.DD')
      const endDate = dayjs(filters.inspectionCompletionDateRange[1]).format('YYYY.MM.DD')
      data = data.filter((item) => {
        const itemDate = item.inspectionCompletionDate
        return itemDate !== '-' && itemDate >= startDate && itemDate <= endDate
      })
    }

    // 적치 요청일 필터
    if (filters.placementRequestDateRange[0] && filters.placementRequestDateRange[1]) {
      const startDate = dayjs(filters.placementRequestDateRange[0]).format('YYYY.MM.DD')
      const endDate = dayjs(filters.placementRequestDateRange[1]).format('YYYY.MM.DD')
      data = data.filter((item) => {
        const itemDate = item.placementRequestDate
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // 적치 완료일 필터
    if (filters.placementCompletionDateRange[0] && filters.placementCompletionDateRange[1]) {
      const startDate = dayjs(filters.placementCompletionDateRange[0]).format('YYYY.MM.DD')
      const endDate = dayjs(filters.placementCompletionDateRange[1]).format('YYYY.MM.DD')
      data = data.filter((item) => {
        const itemDate = item.placementCompletionDate
        return itemDate !== '-' && itemDate >= startDate && itemDate <= endDate
      })
    }

    return data
  }, [executionData, filters, activeTab])

  const paginatedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredData.slice(start, end)
  }, [filteredData, pagination])

  const getColumns = (): TableColumnsType<InboundExecution> => {
    const baseColumns: TableColumnsType<InboundExecution> = [
      {
        title: (
          <Checkbox
            indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
            checked={selectedRows.length === filteredData.length && filteredData.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows(filteredData.map((item) => item.key))
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
        title: t('orderId'),
        dataIndex: 'orderId',
        key: 'orderId',
        width: 150,
        render: (text: string, record: InboundExecution) => (
          <Button 
            type="link" 
            style={{ color: '#0066cc', padding: 0 }}
            onClick={() => {
              setSelectedOrderDetail(record)
              setIsModalVisible(true)
            }}
          >
            {text}
          </Button>
        ),
      },
      {
        title: t('vendor'),
        dataIndex: 'vendor',
        key: 'vendor',
        width: 120,
      },
      {
        title: t('receipt'),
        dataIndex: 'inspectionRequestDate',
        key: 'inspectionRequestDate',
        width: 110,
      },
      {
        title: t('inspection_complete'),
        dataIndex: 'inspectionCompletionDate',
        key: 'inspectionCompletionDate',
        width: 110,
      },
      {
        title: t('pending'),
        dataIndex: 'placementRequestDate',
        key: 'placementRequestDate',
        width: 110,
      },
      {
        title: t('completed'),
        dataIndex: 'placementCompletionDate',
        key: 'placementCompletionDate',
        width: 110,
      },
      {
        title: t('plannedQty'),
        dataIndex: 'plannedQty',
        key: 'plannedQty',
        width: 110,
        align: 'right' as const,
      },
      {
        title: t('confirmedQty'),
        dataIndex: 'inspectionCompletedQty',
        key: 'inspectionCompletedQty',
        width: 120,
        align: 'right' as const,
      },
      {
        title: t('confirmedQty'),
        dataIndex: 'placementCompletedQty',
        key: 'placementCompletedQty',
        width: 120,
        align: 'right' as const,
      },
      {
        title: t('status'),
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => {
          const statusMap: Record<string, { label: string; color: string }> = {
            'receipt': { label: t('receipt'), color: '#2db7f5' },
            'inspecting': { label: t('inspecting'), color: '#f57602' },
            'inspection_complete': { label: t('inspection_complete'), color: '#87d068' },
            'pending': { label: t('pending'), color: '#2db7f5' },
            'placed': { label: t('placed'), color: '#f57602' },
            'completed': { label: t('completed'), color: '#87d068' },
          }
          const info = statusMap[status] || { label: status, color: '#999' }
          return <Tag color={info.color}>{info.label}</Tag>
        },
      },
      {
        title: t('worker'),
        dataIndex: 'worker',
        key: 'worker',
        width: 100,
      },
    ]

    return baseColumns
  }

  const columns = getColumns()

  return (
    <div style={{ padding: '20px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
        <span>입고</span>
        <span style={{ margin: '0 10px' }}>/</span>
        <span>입고 실행</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1>입고 실행</h1>
      </div>

      {/* Filter Section */}
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('filterVendor')}</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="select"
              value={filters.vendor}
              onChange={(value) => setFilters({ ...filters, vendor: value })}
              options={[
                { label: '(주)스타일 씨이', value: '(주)스타일 씨이' },
                { label: '(주)트렌드마켓', value: '(주)트렌드마켓' },
                { label: '(주)보션산', value: '(주)보션산' },
                { label: '(주)디지털스토어', value: '(주)디지털스토어' },
                { label: '(주)프리미엄샵', value: '(주)프리미엄샵' },
              ]}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('filterOrderId')}</label>
            </div>
            <Input
              placeholder={t('filterOrderId')}
              value={filters.orderId || ''}
              onChange={(e) => setFilters({ ...filters, orderId: e.target.value || undefined })}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('filterProductCode')}</label>
            </div>
            <Input
              placeholder={t('filterProductCode')}
              value={filters.productCode || ''}
              onChange={(e) => setFilters({ ...filters, productCode: e.target.value || undefined })}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('filterStatus')}</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="select"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: t('receipt'), value: 'receipt' },
                { label: t('inspecting'), value: 'inspecting' },
                { label: t('inspection_complete'), value: 'inspection_complete' },
                { label: t('pending'), value: 'pending' },
                { label: t('placed'), value: 'placed' },
                { label: t('completed'), value: 'completed' },
              ]}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#0066cc', fontWeight: 'bold' }}>{t('receipt')}</label>
            </div>
            <DatePicker.RangePicker
              value={
                filters.inspectionRequestDateRange[0] && filters.inspectionRequestDateRange[1]
                  ? [dayjs(filters.inspectionRequestDateRange[0]), dayjs(filters.inspectionRequestDateRange[1])]
                  : [null, null]
              }
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  inspectionRequestDateRange: dates ? [dates[0]?.toDate(), dates[1]?.toDate()] : [undefined, undefined],
                })
              }}
              format="YYYY.MM.DD"
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('inspection_complete')}</label>
            </div>
            <DatePicker.RangePicker
              value={
                filters.inspectionCompletionDateRange[0] && filters.inspectionCompletionDateRange[1]
                  ? [dayjs(filters.inspectionCompletionDateRange[0]), dayjs(filters.inspectionCompletionDateRange[1])]
                  : [null, null]
              }
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  inspectionCompletionDateRange: dates ? [dates[0]?.toDate(), dates[1]?.toDate()] : [undefined, undefined],
                })
              }}
              format="YYYY.MM.DD"
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('pending')}</label>
            </div>
            <DatePicker.RangePicker
              value={
                filters.placementRequestDateRange[0] && filters.placementRequestDateRange[1]
                  ? [dayjs(filters.placementRequestDateRange[0]), dayjs(filters.placementRequestDateRange[1])]
                  : [null, null]
              }
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  placementRequestDateRange: dates ? [dates[0]?.toDate(), dates[1]?.toDate()] : [undefined, undefined],
                })
              }}
              format="YYYY.MM.DD"
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>{t('completed')}</label>
            </div>
            <DatePicker.RangePicker
              value={
                filters.placementCompletionDateRange[0] && filters.placementCompletionDateRange[1]
                  ? [dayjs(filters.placementCompletionDateRange[0]), dayjs(filters.placementCompletionDateRange[1])]
                  : [null, null]
              }
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  placementCompletionDateRange: dates ? [dates[0]?.toDate(), dates[1]?.toDate()] : [undefined, undefined],
                })
              }}
              format="YYYY.MM.DD"
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Status Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
          {statusTabs.map((tab) => {
            const tabCount = executionData.filter(item => item.status === tab.key).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '10px 0',
                  fontSize: '14px',
                  color: activeTab === tab.key ? '#0066cc' : '#666',
                  fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                  borderBottom: activeTab === tab.key ? '3px solid #0066cc' : 'none',
                  marginBottom: '-10px',
                  cursor: 'pointer',
                }}
              >
                {tab.label}{' '}
                <Tag color="blue" style={{ marginLeft: '8px' }}>
                  {tabCount}
                </Tag>
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary and Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <span>
            {t('all')} {filteredData.length} {t('items')} | {t('search')} {selectedRows.length} {t('items')}
          </span>
        </div>
        <Space>
          {activeTab === 'receipt' && (
            <>
              <Button onClick={handleQuantityConfirmation} disabled={selectedRows.length === 0}>
                {t('confirmQuantity')}
              </Button>
              <Button onClick={handleInspectionComplete} disabled={selectedRows.length === 0}>
                {t('inspectionComplete')}
              </Button>
            </>
          )}
          {activeTab === 'inspecting' && (
            <Button onClick={handleInspectionComplete} disabled={selectedRows.length === 0}>
              {t('inspectionComplete')}
            </Button>
          )}
          {activeTab === 'inspection_complete' && (
            <Button type="primary" onClick={handlePlacementInstruction} disabled={selectedRows.length === 0}>
              {t('placementInstruction')}
            </Button>
          )}
          {activeTab === 'pending' && (
            <Button onClick={handlePlacementQuantityConfirmation} disabled={selectedRows.length === 0}>
              {t('confirmQuantity')}
            </Button>
          )}
          {activeTab === 'placed' && (
            <Button onClick={handlePlacementComplete} disabled={selectedRows.length === 0}>
              {t('placementQuantity')}
            </Button>
          )}
        </Space>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          scroll={{ x: 1200 }}
          style={{ marginBottom: '20px' }}
        />

        {/* Pagination */}
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
            total={filteredData.length}
            onChange={(page) => setPagination({ ...pagination, current: page })}
            showQuickJumper
            showTotal={(total) => `총 ${total}개`}
          />
        </div>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`${selectedOrderDetail?.orderId}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setSelectedOrderDetail(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsModalVisible(false)
            setSelectedOrderDetail(null)
          }}>
            {t('modal.goBack')}
          </Button>,
          <Button key="confirm" type="primary">
            {t('modal.confirm')}
          </Button>,
        ]}
        width={800}
      >
        {selectedOrderDetail && (
          <div>
            {/* Basic Info - Fixed at top */}
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#666', fontSize: '12px' }}>{t('modal.fields.orderId')}</label>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedOrderDetail.orderId}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#666', fontSize: '12px' }}>{t('modal.fields.vendor')}</label>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedOrderDetail.vendor}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#666', fontSize: '12px' }}>{t('modal.fields.plannedDate')}</label>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedOrderDetail.expectedDate}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#666', fontSize: '12px' }}>{t('modal.fields.inspectionDate')}</label>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedOrderDetail.inspectionRequestDate}</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Tabs for detailed info */}
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: t('modal.tabs.productDetails'),
                  children: (
                    <Table
                      dataSource={[
                        {
                          key: '1',
                          productCode: 'PRD-20250101-0001',
                          productName: '상품1',
                          quantity: '100개',
                        },
                      ]}
                      columns={[
                        { title: t('modal.productColumns.productCode'), dataIndex: 'productCode', key: 'productCode' },
                        { title: t('modal.productColumns.productName'), dataIndex: 'productName', key: 'productName' },
                        { title: t('modal.productColumns.quantity'), dataIndex: 'quantity', key: 'quantity' },
                      ]}
                      pagination={false}
                    />
                  ),
                },
                {
                  key: '2',
                  label: t('modal.tabs.workHistory'),
                  children: (
                    <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                      {t('modal.noHistory')}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
