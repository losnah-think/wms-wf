'use client'

import React, { useState, useMemo } from 'react'
import {
  Layout,
  Card,
  Button,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Divider,
  Statistic,
  Timeline,
  Badge,
  Descriptions,
  Empty,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface TransferItem {
  id: string
  productName: string
  productCode: string
  optionName: string
  quantity: number
  fromLocation: string
  toLocation: string
  singlePrice: number
  totalPrice: number
}

interface TransferHistory {
  id: string
  transferNo: string
  fromLocations: string[]
  toLocation: string
  items: TransferItem[]
  totalQuantity: number
  totalPrice: number
  status: 'completed' | 'pending' | 'processing'
  createdAt: Date
  createdBy: string
  completedAt?: Date
  completedBy?: string
  notes?: string
}

interface TimelineEvent {
  timestamp: Date
  status: 'pending' | 'processing' | 'completed'
  actor: string
  description: string
}

// 더미 데이터 생성
const generateTransferDetail = (id: string): TransferHistory | null => {
  const statuses: Array<'completed' | 'pending' | 'processing'> = ['completed', 'pending', 'processing']
  const idx = parseInt(id.split('-')[1]) || 1

  if (idx > 50) return null

  const fromLocations = [
    `A-01-01-1-${(idx % 5) + 1}`,
    `B-02-02-2-${((idx + 1) % 5) + 1}`,
  ].slice(0, Math.random() > 0.5 ? 2 : 1)

  const toLocation = `C-03-03-3-${(idx % 3) + 1}`
  const itemCount = Math.floor(Math.random() * 10) + 1
  const status = statuses[idx % statuses.length]

  // 상품 목록 생성
  const items: TransferItem[] = Array.from({ length: itemCount }, (_, i) => {
    const quantity = Math.floor(Math.random() * 50) + 5
    const singlePrice = (Math.floor(Math.random() * 100) + 10) * 1000
    return {
      id: `ITEM-${idx}-${i + 1}`,
      productName: ['노트북', '마우스', '키보드', '모니터', '헤드폰'][i % 5],
      productCode: `PRD-${String(idx * 10 + i).padStart(5, '0')}`,
      optionName: ['검정', '흰색', '회색'][i % 3],
      quantity,
      fromLocation: fromLocations[i % fromLocations.length],
      toLocation: toLocation,
      singlePrice,
      totalPrice: quantity * singlePrice,
    }
  })

  const createdAt = new Date(Date.now() - idx * 24 * 60 * 60 * 1000)
  const completedAt = status === 'completed' ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) : undefined

  return {
    id,
    transferNo: `TRF-20251111-${String(idx).padStart(4, '0')}`,
    fromLocations,
    toLocation,
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.totalPrice, 0),
    status,
    createdAt,
    createdBy: ['관리자', '김담당', '이담당'][idx % 3],
    completedAt,
    completedBy: status === 'completed' ? ['관리자', '김담당', '이담당'][(idx + 1) % 3] : undefined,
    notes: status === 'completed' ? '정상 이동 완료' : status === 'processing' ? '이동 중입니다' : '승인 대기 중',
  }
}

// 타임라인 이벤트 생성
const generateTimeline = (transfer: TransferHistory): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    {
      timestamp: transfer.createdAt,
      status: 'pending',
      actor: transfer.createdBy,
      description: '이동 요청 생성됨',
    },
  ]

  if (transfer.status === 'processing' || transfer.status === 'completed') {
    events.push({
      timestamp: new Date(transfer.createdAt.getTime() + 1 * 60 * 60 * 1000),
      status: 'processing',
      actor: ['관리자', '김담당', '이담당'][Math.floor(Math.random() * 3)],
      description: '이동 시작',
    })
  }

  if (transfer.status === 'completed' && transfer.completedAt && transfer.completedBy) {
    events.push({
      timestamp: transfer.completedAt,
      status: 'completed',
      actor: transfer.completedBy,
      description: '이동 완료',
    })
  }

  return events
}

export default function TransferDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : params.id?.[0]

  const transfer = useMemo(() => {
    if (!id) return null
    return generateTransferDetail(id)
  }, [id])

  const timeline = useMemo(() => {
    if (!transfer) return []
    return generateTimeline(transfer)
  }, [transfer])

  if (!transfer) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        <Layout.Content style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Link href="/stock-movement">
              <Button icon={<ArrowLeftOutlined />}>뒤로</Button>
            </Link>
          </div>
          <Card>
            <Empty description="이동 이력을 찾을 수 없습니다" />
          </Card>
        </Layout.Content>
      </Layout>
    )
  }

  const statusColor = {
    pending: 'default',
    processing: 'processing',
    completed: 'success',
  }

  const statusText = {
    pending: '승인 대기',
    processing: '진행 중',
    completed: '완료',
  }

  const statusIcon = {
    pending: <ExclamationCircleOutlined />,
    processing: <ClockCircleOutlined />,
    completed: <CheckCircleOutlined />,
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <Layout.Content style={{ padding: '20px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/stock-movement">
              <Button icon={<ArrowLeftOutlined />}>뒤로</Button>
            </Link>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2B60', margin: 0 }}>
                📋 이동 상세 정보
              </h1>
              <p style={{ color: '#666', marginTop: '8px' }}>
                {transfer.transferNo}
              </p>
            </div>
          </div>
          <Badge
            count={
              <Tag color={statusColor[transfer.status] as any}>
                {statusIcon[transfer.status]}
                {statusText[transfer.status]}
              </Tag>
            }
          />
        </div>

        {/* 기본 정보 */}
        <Card style={{ marginBottom: '20px' }}>
          <Descriptions
            column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            size="small"
            bordered
          >
            <Descriptions.Item label="이동번호">
              <strong>{transfer.transferNo}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="상태">
              <Tag color={statusColor[transfer.status] as any}>
                {statusIcon[transfer.status]}
                {statusText[transfer.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="생성일시">
              {dayjs(transfer.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="생성자">
              {transfer.createdBy}
            </Descriptions.Item>
            <Descriptions.Item label="출발지">
              <Space wrap>
                {transfer.fromLocations.map((loc) => (
                  <Tag key={loc} color="blue">
                    {loc}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="목적지">
              <Tag color="green">{transfer.toLocation}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="상품 개수">
              <strong>{transfer.items.length}개</strong>
            </Descriptions.Item>
            <Descriptions.Item label="총 수량">
              <strong>{transfer.totalQuantity}개</strong>
            </Descriptions.Item>
            {transfer.completedAt && (
              <>
                <Descriptions.Item label="완료일시">
                  {dayjs(transfer.completedAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="완료자">
                  {transfer.completedBy}
                </Descriptions.Item>
              </>
            )}
            {transfer.notes && (
              <Descriptions.Item label="비고" span={3}>
                {transfer.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Row gutter={16}>
          {/* 좌측: 통계 */}
          <Col xs={24} lg={8}>
            <Card style={{ marginBottom: '20px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="총 수량"
                    value={transfer.totalQuantity}
                    suffix="개"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="총 금액"
                    value={transfer.totalPrice}
                    prefix="₩"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* 타임라인 */}
            <Card title="이동 현황" style={{ marginBottom: '20px' }}>
              <Timeline
                items={timeline.map((event) => ({
                  dot:
                    event.status === 'completed' ? (
                      <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                    ) : event.status === 'processing' ? (
                      <ClockCircleOutlined style={{ fontSize: '16px', color: '#faad14' }} />
                    ) : (
                      <ExclamationCircleOutlined style={{ fontSize: '16px', color: '#d9d9d9' }} />
                    ),
                  children: (
                    <div>
                      <p style={{ marginBottom: '4px', fontWeight: 700 }}>
                        {event.description}
                      </p>
                      <p style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                        {dayjs(event.timestamp).format('YYYY-MM-DD HH:mm')}
                      </p>
                      <p style={{ marginBottom: 0, fontSize: '12px', color: '#999' }}>
                        담당: {event.actor}
                      </p>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>

          {/* 우측: 상품 목록 */}
          <Col xs={24} lg={16}>
            <Card title="이동 상품 목록" style={{ marginBottom: '20px' }}>
              <Table
                columns={[
                  {
                    title: '상품명',
                    dataIndex: 'productName',
                    key: 'productName',
                    width: '20%',
                    render: (text: string) => <strong>{text}</strong>,
                  },
                  {
                    title: '상품코드',
                    dataIndex: 'productCode',
                    key: 'productCode',
                    width: '15%',
                    render: (text: string) => (
                      <span style={{ fontSize: '12px', color: '#666' }}>{text}</span>
                    ),
                  },
                  {
                    title: '옵션',
                    dataIndex: 'optionName',
                    key: 'optionName',
                    width: '10%',
                    render: (text: string) => <Tag>{text}</Tag>,
                  },
                  {
                    title: '수량',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: '10%',
                    align: 'right' as const,
                    render: (text: number) => <strong>{text}개</strong>,
                  },
                  {
                    title: '단가',
                    dataIndex: 'singlePrice',
                    key: 'singlePrice',
                    width: '12%',
                    align: 'right' as const,
                    render: (text: number) => (
                      <span>₩{text.toLocaleString('ko-KR')}</span>
                    ),
                  },
                  {
                    title: '합계',
                    dataIndex: 'totalPrice',
                    key: 'totalPrice',
                    width: '15%',
                    align: 'right' as const,
                    render: (text: number) => (
                      <strong style={{ color: '#1890ff' }}>
                        ₩{text.toLocaleString('ko-KR')}
                      </strong>
                    ),
                  },
                  {
                    title: '출발지',
                    dataIndex: 'fromLocation',
                    key: 'fromLocation',
                    width: '13%',
                    render: (text: string) => <Tag color="blue">{text}</Tag>,
                  },
                ]}
                dataSource={transfer.items}
                rowKey="id"
                pagination={false}
                size="small"
              />
              <Divider style={{ margin: '16px 0' }} />
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="총 항목"
                    value={transfer.items.length}
                    suffix="개"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="총 수량"
                    value={transfer.totalQuantity}
                    suffix="개"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  )
}
