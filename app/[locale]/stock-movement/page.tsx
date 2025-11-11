'use client'

import React, { useState, useMemo } from 'react'
import {
  Layout,
  Card,
  Button,
  Table,
  Space,
  Tag,
  Badge,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TransferHistory {
  id: string
  transferNo: string
  fromLocations: string[]
  toLocation: string
  items: number
  totalQuantity: number
  status: 'completed' | 'pending' | 'processing'
  createdAt: Date
  createdBy: string
}

const generateDummyHistory = (): TransferHistory[] => {
  const statuses: Array<'completed' | 'pending' | 'processing'> = ['completed', 'pending', 'processing']
  return Array.from({ length: 50 }, (_, i) => ({
    id: `HIST-${i + 1}`,
    transferNo: `TRF-20251111-${String(i + 1).padStart(4, '0')}`,
    fromLocations: [
      `A-01-01-1-${(i % 5) + 1}`,
      `B-02-02-2-${((i + 1) % 5) + 1}`,
    ].slice(0, Math.random() > 0.5 ? 2 : 1),
    toLocation: `C-03-03-3-${(i % 3) + 1}`,
    items: Math.floor(Math.random() * 10) + 1,
    totalQuantity: Math.floor(Math.random() * 100) + 10,
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    createdBy: ['관리자', '김담당', '이담당'][i % 3],
  }))
}

export default function StockMovementListPage() {
  const router = useRouter()
  const [history] = useState<TransferHistory[]>(generateDummyHistory())
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

  const filteredData = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = 
        item.transferNo.toLowerCase().includes(searchText.toLowerCase()) ||
        item.fromLocations.some((loc) => loc.toLowerCase().includes(searchText.toLowerCase())) ||
        item.toLocation.toLowerCase().includes(searchText.toLowerCase())

      const matchesStatus = !statusFilter || item.status === statusFilter

      const matchesDate = !dateRange || !dateRange[0] || !dateRange[1] || 
        (dayjs(item.createdAt).isAfter(dateRange[0]) && dayjs(item.createdAt).isBefore(dateRange[1]))

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [history, searchText, statusFilter, dateRange])

  const historyColumns = [
    {
      title: '이동번호',
      dataIndex: 'transferNo',
      key: 'transferNo',
      width: '15%',
      render: (text: string) => <strong>{text}</strong>,
      sorter: (a: TransferHistory, b: TransferHistory) => a.transferNo.localeCompare(b.transferNo),
    },
    {
      title: '출발지 (다중)',
      dataIndex: 'fromLocations',
      key: 'fromLocations',
      width: '20%',
      render: (locations: string[]) => (
        <Space wrap size="small">
          {locations.map((loc) => (
            <Tag key={loc} color="blue">
              {loc}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '목적지',
      dataIndex: 'toLocation',
      key: 'toLocation',
      width: '12%',
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: '항목/수량',
      key: 'count',
      width: '12%',
      render: (_: any, record: TransferHistory) => (
        <div style={{ fontSize: '12px' }}>
          <div>{record.items}개 항목</div>
          <div style={{ color: '#999' }}>{record.totalQuantity}개 수량</div>
        </div>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: string) => {
        const statusConfig: { [key: string]: { color: string; text: string } } = {
          completed: { color: 'success', text: '완료' },
          pending: { color: 'warning', text: '대기' },
          processing: { color: 'processing', text: '진행중' },
        }
        const config = statusConfig[status]
        return <Tag color={config.color}>{config.text}</Tag>
      },
      filters: [
        { text: '완료', value: 'completed' },
        { text: '대기', value: 'pending' },
        { text: '진행중', value: 'processing' },
      ],
      onFilter: (value: string | number | boolean, record: TransferHistory) => record.status === value,
    },
    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a: TransferHistory, b: TransferHistory) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '담당자',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: '10%',
    },
    {
      title: '작업',
      key: 'action',
      width: '9%',
      fixed: 'right' as const,
      render: (_: any, record: TransferHistory) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/stock-movement/${record.id}`)}
          >
            보기
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <Layout.Content style={{ padding: '20px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2B60', margin: 0 }}>
              📦 재고 이동
            </h1>
            <p style={{ color: '#666', marginTop: '8px' }}>
              재고 이동 내역을 조회하고 새로운 이동을 등록합니다.
            </p>
          </div>
          <Link href="/stock-movement/new">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
            >
              새 재고 이동
            </Button>
          </Link>
        </div>

        {/* 필터 섹션 */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="이동번호, 위치 검색"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="상태 선택"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                options={[
                  { label: '완료', value: 'completed' },
                  { label: '대기', value: 'pending' },
                  { label: '진행중', value: 'processing' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                onChange={(dates) => {
                  if (dates) {
                    setDateRange([dates[0], dates[1]])
                  } else {
                    setDateRange(null)
                  }
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* 이력 테이블 */}
        <Card
          title={
            <Space>
              <EditOutlined />
              재고 이동 이력
              <Badge count={filteredData.length} />
            </Space>
          }
        >
          {filteredData.length > 0 ? (
            <Table
              columns={historyColumns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{ pageSize: 20, showTotal: (total) => `총 ${total}개` }}
              size="small"
              scroll={{ x: 1200 }}
            />
          ) : (
            <Empty description="조회 결과가 없습니다" />
          )}
        </Card>
      </Layout.Content>
    </Layout>
  )
}
