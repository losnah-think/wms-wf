'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Tabs, Empty, Spin, Badge } from 'antd'
import {
  BoxPlotOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { useTranslations } from 'next-intl'
import LayoutAntd from '@/components/LayoutAntd'

interface WarehouseStats {
  total: number
  available: number
  reserved: number
  damaged: number
}

export default function DashboardAntd() {
  const t = useTranslations()
  const [loading, setLoading] = React.useState(false)
  const [warehouseStats, setWarehouseStats] = React.useState<WarehouseStats>({
    total: 12500,
    available: 9200,
    reserved: 2800,
    damaged: 500,
  })

  const recentActivityData = [
    {
      key: '1',
      operation: '입고',
      warehouse: 'A 창고',
      quantity: 250,
      time: '2024-11-01 14:30',
      status: 'completed',
    },
    {
      key: '2',
      operation: '출고',
      warehouse: 'B 창고',
      quantity: 150,
      time: '2024-11-01 13:15',
      status: 'processing',
    },
    {
      key: '3',
      operation: '위치 이동',
      warehouse: 'C 창고',
      quantity: 80,
      time: '2024-11-01 12:00',
      status: 'completed',
    },
    {
      key: '4',
      operation: '실사',
      warehouse: 'A 창고',
      quantity: 500,
      time: '2024-11-01 10:30',
      status: 'pending',
    },
  ]

  const activityColumns = [
    {
      title: '작업',
      dataIndex: 'operation',
      key: 'operation',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '창고',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number) => <span>{text.toLocaleString()}</span>,
    },
    {
      title: '시간',
      dataIndex: 'time',
      key: 'time',
      render: (text: string) => <small>{text}</small>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default'
        let label = status
        if (status === 'completed') {
          color = 'green'
          label = '완료'
        } else if (status === 'processing') {
          color = 'blue'
          label = '진행중'
        } else if (status === 'pending') {
          color = 'orange'
          label = '대기중'
        }
        return <Tag color={color}>{label}</Tag>
      },
    },
  ]

  return (
    <LayoutAntd>
      <div style={{ background: '#f5f5f5', padding: '24px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            대시보드
          </h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
            창고 관리 시스템의 실시간 현황을 확인하세요
          </p>
        </div>

        {/* Key Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>총 재고</span>}
                value={warehouseStats.total}
                suffix="개"
                valueStyle={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}
                prefix={<BoxPlotOutlined style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>가능 재고</span>}
                value={warehouseStats.available}
                suffix="개"
                valueStyle={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}
                prefix={<CheckCircleOutlined style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>예약 중</span>}
                value={warehouseStats.reserved}
                suffix="개"
                valueStyle={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}
                prefix={<ShoppingCartOutlined style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>손상 재고</span>}
                value={warehouseStats.damaged}
                suffix="개"
                valueStyle={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}
                prefix={<ExclamationCircleOutlined style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge color="blue" />
                  <span>최근 활동</span>
                </div>
              }
              extra={<Button type="link">더보기</Button>}
              bordered={false}
              style={{ borderRadius: '8px' }}
            >
              <Table
                columns={activityColumns}
                dataSource={recentActivityData}
                pagination={{ pageSize: 10 }}
                loading={loading}
                size="middle"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutAntd>
  )
}
