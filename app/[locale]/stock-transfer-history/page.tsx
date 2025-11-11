'use client'

import React, { useState } from 'react'
import { Card, Table, Tag, Space, Button, DatePicker, Select, Input, Row, Col, Drawer, Descriptions, Badge } from 'antd'
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

interface TransferItem {
  id: string
  productId: number
  optionId: number
  productName: string
  optionName: string
  barcode: string
  transferQuantity: number
  fromWarehouse: string
  toWarehouse: string
  fromLocation: string
  toLocation?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  reason: string
  createdAt: Date
  createdBy: string
}

interface TransferRequest {
  transferNo: string
  items: TransferItem[]
  totalQuantity: number
  createdAt: Date
  createdBy: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// 더미 데이터
const generateDummyHistory = (): TransferRequest[] => {
  const statuses: Array<'completed' | 'processing' | 'failed'> = ['completed', 'processing', 'failed']
  const warehouses = ['본점 창고', '부산 창고', '대구 창고', '인천 창고']
  const users = ['관리자', '김담당', '이담당', '박담당']
  
  return Array.from({ length: 50 }, (_, i) => {
    const itemCount = Math.floor(Math.random() * 5) + 1
    const items: TransferItem[] = Array.from({ length: itemCount }, (_, j) => ({
      id: `ITEM-${i}-${j}`,
      productId: Math.floor(Math.random() * 10) + 1,
      optionId: j,
      productName: `상품 ${Math.floor(Math.random() * 20) + 1}`,
      optionName: ['XS', 'S', 'M', 'L', 'XL'][j % 5],
      barcode: `882${String(i * 10 + j).padStart(10, '0')}`,
      transferQuantity: Math.floor(Math.random() * 50) + 1,
      fromWarehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
      toWarehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
      fromLocation: `A-${String(Math.floor(Math.random() * 9) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9) + 1).padStart(2, '0')}`,
      toLocation: `B-${String(Math.floor(Math.random() * 9) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9) + 1).padStart(2, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      reason: ['정상이동', '재고조정', '반품처리', '창고이전'][Math.floor(Math.random() * 4)],
      createdAt: dayjs().subtract(i, 'day').toDate(),
      createdBy: users[Math.floor(Math.random() * users.length)],
    }))
    
    return {
      transferNo: `TRANS-${dayjs().subtract(i, 'day').format('YYYYMMDD')}-${String(i).padStart(4, '0')}`,
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.transferQuantity, 0),
      createdAt: dayjs().subtract(i, 'day').toDate(),
      createdBy: users[Math.floor(Math.random() * users.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }
  })
}

export default function StockTransferHistoryPage() {
  const [transferHistory, setTransferHistory] = useState<TransferRequest[]>(generateDummyHistory())
  const [filteredHistory, setFilteredHistory] = useState<TransferRequest[]>(transferHistory)
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  
  // 필터 상태
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])

  // 필터 적용
  const applyFilters = () => {
    let filtered = [...transferHistory]
    
    // 검색어
    if (searchText) {
      filtered = filtered.filter(t => 
        t.transferNo.toLowerCase().includes(searchText.toLowerCase()) ||
        t.items.some(item => 
          item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.barcode.includes(searchText)
        )
      )
    }
    
    // 상태
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }
    
    // 날짜 범위
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(t => {
        const date = dayjs(t.createdAt)
        return date.isAfter(dateRange[0]) && date.isBefore(dateRange[1].add(1, 'day'))
      })
    }
    
    setFilteredHistory(filtered)
  }

  const columns = [
    {
      title: '이동번호',
      dataIndex: 'transferNo',
      key: 'transferNo',
      width: 180,
      fixed: 'left' as const,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>{text}</span>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig: { [key: string]: { color: string; text: string } } = {
          completed: { color: 'success', text: '완료' },
          processing: { color: 'processing', text: '진행중' },
          failed: { color: 'error', text: '실패' },
        }
        const config = statusConfig[status] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '항목 수',
      dataIndex: 'items',
      key: 'itemCount',
      width: 100,
      align: 'center' as const,
      render: (items: TransferItem[]) => (
        <Badge count={items.length} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: '총 수량',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
      align: 'center' as const,
      render: (qty: number) => <span style={{ fontWeight: 600 }}>{qty}개</span>,
    },
    {
      title: '주요 경로',
      key: 'route',
      width: 200,
      render: (_: any, record: TransferRequest) => {
        const firstItem = record.items[0]
        return (
          <Space size={4}>
            <span style={{ fontSize: '12px' }}>{firstItem.fromWarehouse}</span>
            <span style={{ color: '#999' }}>→</span>
            <span style={{ fontSize: '12px' }}>{firstItem.toWarehouse}</span>
          </Space>
        )
      },
    },
    {
      title: '이동일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '담당자',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: '작업',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: TransferRequest) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedTransfer(record)
            setIsDetailDrawerOpen(true)
          }}
        >
          상세
        </Button>
      ),
    },
  ]

  const itemColumns = [
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '옵션',
      dataIndex: 'optionName',
      key: 'optionName',
    },
    {
      title: '바코드',
      dataIndex: 'barcode',
      key: 'barcode',
    },
    {
      title: '수량',
      dataIndex: 'transferQuantity',
      key: 'transferQuantity',
      align: 'center' as const,
    },
    {
      title: '출발',
      key: 'from',
      render: (_: any, record: TransferItem) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600 }}>{record.fromWarehouse}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>{record.fromLocation}</div>
        </div>
      ),
    },
    {
      title: '도착',
      key: 'to',
      render: (_: any, record: TransferItem) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600 }}>{record.toWarehouse}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>{record.toLocation || '-'}</div>
        </div>
      ),
    },
    {
      title: '사유',
      dataIndex: 'reason',
      key: 'reason',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', padding: '20px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#1F2B60' }}>
            재고 이동 이력
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            모든 재고 이동 내역을 조회하고 관리합니다.
          </p>
        </div>

        {/* 필터 */}
        <Card style={{ marginBottom: '20px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Input
                placeholder="이동번호, 상품명, 바코드 검색"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={applyFilters}
              />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Select
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: '전체 상태', value: 'all' },
                  { label: '완료', value: 'completed' },
                  { label: '진행중', value: 'processing' },
                  { label: '실패', value: 'failed' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                format="YYYY-MM-DD"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={applyFilters}>
                  검색
                </Button>
                <Button
                  onClick={() => {
                    setSearchText('')
                    setStatusFilter('all')
                    setDateRange([null, null])
                    setFilteredHistory(transferHistory)
                  }}
                >
                  초기화
                </Button>
                <Button icon={<DownloadOutlined />}>엑셀</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 테이블 */}
        <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <Table
            columns={columns}
            dataSource={filteredHistory}
            rowKey="transferNo"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}건`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>

      {/* 상세보기 드로어 */}
      <Drawer
        title={`이동 상세: ${selectedTransfer?.transferNo}`}
        placement="right"
        width={800}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      >
        {selectedTransfer && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="이동번호" span={2}>
                <strong>{selectedTransfer.transferNo}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="상태">
                {selectedTransfer.status === 'completed' && <Tag color="success">완료</Tag>}
                {selectedTransfer.status === 'processing' && <Tag color="processing">진행중</Tag>}
                {selectedTransfer.status === 'failed' && <Tag color="error">실패</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="총 수량">
                {selectedTransfer.totalQuantity}개
              </Descriptions.Item>
              <Descriptions.Item label="이동일시">
                {dayjs(selectedTransfer.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="담당자">
                {selectedTransfer.createdBy}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h3 style={{ marginBottom: '16px' }}>이동 항목 ({selectedTransfer.items.length}개)</h3>
              <Table
                columns={itemColumns}
                dataSource={selectedTransfer.items}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  )
}
