'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  Tag,
  Button,
  Space,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  Pagination,
} from 'antd'
import { useTranslations } from 'next-intl'
import dayjs from 'dayjs'
import type { TableColumnsType } from 'antd'

interface InboundOrder {
  key: string
  orderId: string
  vendor: string
  productCode: string
  inspectionRequestDate: string
  inspectionCompletionDate: string
  placementRequestDate: string
  placementCompletionDate: string
  plannedQty: number
  inspectionCompletedQty: number
  placementCompletedQty: number
  status: 'receipt' | 'inspecting' | 'inspection_complete' | 'pending' | 'placed' | 'completed'
  worker: string
}

const mockData: InboundOrder[] = [
  {
    key: '1',
    orderId: 'RV-20250515-0026',
    vendor: '(주)스타일 씨이',
    productCode: '10000890001',
    inspectionRequestDate: '12.09',
    inspectionCompletionDate: '12.11',
    placementRequestDate: '12.11',
    placementCompletionDate: '12.12',
    plannedQty: 300,
    inspectionCompletedQty: 300,
    placementCompletedQty: 300,
    status: 'completed',
    worker: '이상현',
  },
  {
    key: '2',
    orderId: 'RV-20250402-0012',
    vendor: '(주)팬벨드',
    productCode: '10000890002',
    inspectionRequestDate: '12.09',
    inspectionCompletionDate: '-',
    placementRequestDate: '-',
    placementCompletionDate: '-',
    plannedQty: 200,
    inspectionCompletedQty: 0,
    placementCompletedQty: 0,
    status: 'receipt',
    worker: '-',
  },
  {
    key: '3',
    orderId: 'RV-20250301-0001',
    vendor: '(주)디그래프',
    productCode: '10000890003',
    inspectionRequestDate: '12.10',
    inspectionCompletionDate: '12.10',
    placementRequestDate: '12.10',
    placementCompletionDate: '12.13',
    plannedQty: 150,
    inspectionCompletedQty: 150,
    placementCompletedQty: 150,
    status: 'completed',
    worker: '박진민',
  },
  {
    key: '4',
    orderId: 'RV-20250515-0027',
    vendor: '(주)스타일 씨이',
    productCode: '10000890004',
    inspectionRequestDate: '12.10',
    inspectionCompletionDate: '12.10',
    placementRequestDate: '-',
    placementCompletionDate: '-',
    plannedQty: 250,
    inspectionCompletedQty: 250,
    placementCompletedQty: 0,
    status: 'inspection_complete',
    worker: '김한주',
  },
  {
    key: '5',
    orderId: 'RV-20250620-0030',
    vendor: '(주)팬벨드',
    productCode: '10000890005',
    inspectionRequestDate: '12.11',
    inspectionCompletionDate: '12.12',
    placementRequestDate: '12.12',
    placementCompletionDate: '-',
    plannedQty: 180,
    inspectionCompletedQty: 180,
    placementCompletedQty: 0,
    status: 'placed',
    worker: '이정우',
  },
]

const statusColorMap: Record<string, string> = {
  receipt: 'blue',
  inspecting: 'cyan',
  inspection_complete: 'green',
  pending: 'orange',
  placed: 'orange',
  completed: 'green',
}

const statusLabelMap: Record<string, string> = {
  receipt: '검수 예정',
  inspecting: '검수 중',
  inspection_complete: '검수 완료',
  pending: '적치 예정',
  placed: '적치 중',
  completed: '적치 완료',
}

export default function InboundOrdersPage() {
  const t = useTranslations()
  const router = useRouter()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filters, setFilters] = useState({
    vendor: '',
    orderId: '',
    productCode: '',
    status: '',
    inspectionRequestDateRange: [null, null] as [any, any],
    inspectionCompletionDateRange: [null, null] as [any, any],
    placementRequestDateRange: [null, null] as [any, any],
    placementCompletionDateRange: [null, null] as [any, any],
  })

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    let data = mockData

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
      data = data.filter((item) => item.productCode.includes(filters.productCode))
    }

    // 오더 상태 필터
    if (filters.status) {
      data = data.filter((item) => item.status === filters.status)
    }

    // 검수 요청일 필터
    if (filters.inspectionRequestDateRange[0] && filters.inspectionRequestDateRange[1]) {
      const startDate = dayjs(filters.inspectionRequestDateRange[0]).format('MM.DD')
      const endDate = dayjs(filters.inspectionRequestDateRange[1]).format('MM.DD')
      data = data.filter((item) => {
        const itemDate = item.inspectionRequestDate
        return itemDate !== '-' && itemDate >= startDate && itemDate <= endDate
      })
    }

    // 검수 완료일 필터
    if (filters.inspectionCompletionDateRange[0] && filters.inspectionCompletionDateRange[1]) {
      const startDate = dayjs(filters.inspectionCompletionDateRange[0]).format('MM.DD')
      const endDate = dayjs(filters.inspectionCompletionDateRange[1]).format('MM.DD')
      data = data.filter((item) => {
        const itemDate = item.inspectionCompletionDate
        return itemDate !== '-' && itemDate >= startDate && itemDate <= endDate
      })
    }

    // 적치 요청일 필터
    if (filters.placementRequestDateRange[0] && filters.placementRequestDateRange[1]) {
      const startDate = dayjs(filters.placementRequestDateRange[0]).format('MM.DD')
      const endDate = dayjs(filters.placementRequestDateRange[1]).format('MM.DD')
      data = data.filter((item) => {
        const itemDate = item.placementRequestDate
        return itemDate !== '-' && itemDate >= startDate && itemDate <= endDate
      })
    }

    // 적치 완료일 필터
    if (filters.placementCompletionDateRange[0] && filters.placementCompletionDateRange[1]) {
      const startDate = dayjs(filters.placementCompletionDateRange[0]).format('MM.DD')
      const endDate = dayjs(filters.placementCompletionDateRange[1]).format('MM.DD')
      data = data.filter((item) => {
        const itemDate = item.placementCompletionDate
        return itemDate !== '-' && itemDate >= startDate && itemDate <= endDate
      })
    }

    return data
  }, [filters])

  const paginatedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredData.slice(start, end)
  }, [filteredData, pagination])

  const columns: TableColumnsType<InboundOrder> = [
    {
      title: '입고 오더',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 150,
      render: (text, record) => (
        <Button
          type="link"
          style={{ color: '#0066cc', padding: 0 }}
          onClick={() => router.push(`/inbound/orders/${record.orderId}`)}
        >
          <strong>{text}</strong>
        </Button>
      ),
    },
    {
      title: '화주명',
      dataIndex: 'vendor',
      key: 'vendor',
      width: 120,
    },
    {
      title: '품목코드',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '검수요청일',
      dataIndex: 'inspectionRequestDate',
      key: 'inspectionRequestDate',
      width: 100,
      render: (text) => <span>{text}</span>,
    },
    {
      title: '검수완료일',
      dataIndex: 'inspectionCompletionDate',
      key: 'inspectionCompletionDate',
      width: 100,
      render: (text) => <span>{text}</span>,
    },
    {
      title: '적치요청일',
      dataIndex: 'placementRequestDate',
      key: 'placementRequestDate',
      width: 100,
      render: (text) => <span>{text}</span>,
    },
    {
      title: '적치완료일',
      dataIndex: 'placementCompletionDate',
      key: 'placementCompletionDate',
      width: 100,
      render: (text) => <span>{text}</span>,
    },
    {
      title: '계획수량',
      dataIndex: 'plannedQty',
      key: 'plannedQty',
      width: 80,
      render: (text) => <span>{text}개</span>,
    },
    {
      title: '검수완료수량',
      dataIndex: 'inspectionCompletedQty',
      key: 'inspectionCompletedQty',
      width: 100,
      render: (text) => <span>{text}개</span>,
    },
    {
      title: '적치완료수량',
      dataIndex: 'placementCompletedQty',
      key: 'placementCompletedQty',
      width: 100,
      render: (text) => <span>{text}개</span>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={statusColorMap[status]}>
          {statusLabelMap[status]}
        </Tag>
      ),
    },
    {
      title: '담당자',
      dataIndex: 'worker',
      key: 'worker',
      width: 80,
      render: (text) => <span>{text}</span>,
    },
  ]

  const vendors = Array.from(new Set(mockData.map((item) => item.vendor)))
  const productCodes = Array.from(new Set(mockData.map((item) => item.productCode)))

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>입고 오더 목록</h1>
        <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>입고 예정 오더를 확인하고 관리합니다</p>
      </div>

      {/* Filter Section */}
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col md={6} sm={12} xs={24}>
            <Select
              allowClear
              placeholder="화주명"
              style={{ width: '100%' }}
              value={filters.vendor || undefined}
              onChange={(value) => {
                setFilters({ ...filters, vendor: value || '' })
                setPagination({ ...pagination, current: 1 })
              }}
              options={[
                { value: '', label: '전체' },
                ...vendors.map((vendor) => ({ value: vendor, label: vendor })),
              ]}
            />
          </Col>
          <Col md={6} sm={12} xs={24}>
            <input
              type="text"
              placeholder="입고 오더 번호"
              value={filters.orderId}
              onChange={(e) => {
                setFilters({ ...filters, orderId: e.target.value })
                setPagination({ ...pagination, current: 1 })
              }}
              style={{
                width: '100%',
                padding: '8px 11px',
                border: '1px solid #d9d9d9',
                borderRadius: '2px',
                fontSize: '14px',
              }}
            />
          </Col>
          <Col md={6} sm={12} xs={24}>
            <Select
              allowClear
              placeholder="품목코드"
              style={{ width: '100%' }}
              value={filters.productCode || undefined}
              onChange={(value) => {
                setFilters({ ...filters, productCode: value || '' })
                setPagination({ ...pagination, current: 1 })
              }}
              options={[
                { value: '', label: '전체' },
                ...productCodes.map((code) => ({ value: code, label: code })),
              ]}
            />
          </Col>
          <Col md={6} sm={12} xs={24}>
            <Select
              allowClear
              placeholder="상태"
              style={{ width: '100%' }}
              value={filters.status || undefined}
              onChange={(value) => {
                setFilters({ ...filters, status: value || '' })
                setPagination({ ...pagination, current: 1 })
              }}
              options={[
                { value: '', label: '전체' },
                { value: 'receipt', label: '검수 예정' },
                { value: 'inspecting', label: '검수 중' },
                { value: 'inspection_complete', label: '검수 완료' },
                { value: 'pending', label: '적치 예정' },
                { value: 'placed', label: '적치 중' },
                { value: 'completed', label: '적치 완료' },
              ]}
            />
          </Col>
          <Col md={6} sm={12} xs={24}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={filters.inspectionRequestDateRange}
              onChange={(dates) => {
                setFilters({ ...filters, inspectionRequestDateRange: dates as [any, any] })
                setPagination({ ...pagination, current: 1 })
              }}
              placeholder={['검수요청일 시작', '검수요청일 끝']}
            />
          </Col>
          <Col md={6} sm={12} xs={24}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={filters.inspectionCompletionDateRange}
              onChange={(dates) => {
                setFilters({ ...filters, inspectionCompletionDateRange: dates as [any, any] })
                setPagination({ ...pagination, current: 1 })
              }}
              placeholder={['검수완료일 시작', '검수완료일 끝']}
            />
          </Col>
          <Col md={6} sm={12} xs={24}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={filters.placementRequestDateRange}
              onChange={(dates) => {
                setFilters({ ...filters, placementRequestDateRange: dates as [any, any] })
                setPagination({ ...pagination, current: 1 })
              }}
              placeholder={['적치요청일 시작', '적치요청일 끝']}
            />
          </Col>
          <Col md={6} sm={12} xs={24}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={filters.placementCompletionDateRange}
              onChange={(dates) => {
                setFilters({ ...filters, placementCompletionDateRange: dates as [any, any] })
                setPagination({ ...pagination, current: 1 })
              }}
              placeholder={['적치완료일 시작', '적치완료일 끝']}
            />
          </Col>
        </Row>
      </Card>

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
            전체 상품 {filteredData.length} 건
          </span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          scroll={{ x: 1400 }}
          style={{ marginBottom: '20px' }}
          rowKey="key"
        />

        {/* Pagination */}
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={filteredData.length}
          onChange={(page, pageSize) => {
            setPagination({ current: page, pageSize })
          }}
          onShowSizeChange={(current, pageSize) => {
            setPagination({ current, pageSize })
          }}
          showSizeChanger
          pageSizeOptions={['10', '20', '50']}
          showTotal={(total) => `총 ${total}건`}
        />
      </Card>
    </div>
  )
}
