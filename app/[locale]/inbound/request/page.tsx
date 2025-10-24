'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Badge, Grid, StatCard, Card } from '@/components/UI'
import styles from './request.module.css'

interface InboundRequest {
  id: string
  supplier: string
  itemCount: number
  quantity: number
  requestDate: string
  expectedDate: string
  status: 'draft' | 'submitted' | 'approved' | 'in-transit' | 'received'
  priority: 'low' | 'normal' | 'high'
}

const mockRequests: InboundRequest[] = [
  {
    id: 'REQ-2024-001',
    supplier: 'ABC Supply Co.',
    itemCount: 8,
    quantity: 250,
    requestDate: '2024-10-24',
    expectedDate: '2024-10-28',
    status: 'submitted',
    priority: 'high',
  },
  {
    id: 'REQ-2024-002',
    supplier: 'XYZ Corporation',
    itemCount: 12,
    quantity: 500,
    requestDate: '2024-10-23',
    expectedDate: '2024-10-27',
    status: 'approved',
    priority: 'normal',
  },
  {
    id: 'REQ-2024-003',
    supplier: 'Global Logistics',
    itemCount: 5,
    quantity: 100,
    requestDate: '2024-10-22',
    expectedDate: '2024-10-26',
    status: 'in-transit',
    priority: 'low',
  },
  {
    id: 'REQ-2024-004',
    supplier: 'Premier Distributors',
    itemCount: 15,
    quantity: 800,
    requestDate: '2024-10-21',
    expectedDate: '2024-10-24',
    status: 'received',
    priority: 'high',
  },
]

export default function InboundRequestPage() {
  const t = useTranslations()
  const [requests, setRequests] = useState<InboundRequest[]>(mockRequests)

  const stats = [
    { label: t('common.pending'), value: requests.filter(r => r.status === 'submitted').length, subtitle: t('common.requests') },
    { label: t('common.approved'), value: requests.filter(r => r.status === 'approved').length, subtitle: t('common.requests') },
    { label: t('common.inProgress'), value: requests.filter(r => r.status === 'in-transit').length, subtitle: t('common.requests') },
    { label: t('common.completed'), value: requests.filter(r => r.status === 'received').length, subtitle: t('common.requests') },
  ]

  const getStatusBadgeType = (status: string): 'warning' | 'success' | 'default' | 'danger' => {
    switch (status) {
      case 'draft':
        return 'default'
      case 'submitted':
        return 'warning'
      case 'approved':
        return 'success'
      case 'in-transit':
        return 'success'
      case 'received':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '임시저장'
      case 'submitted':
        return '제출됨'
      case 'approved':
        return '승인됨'
      case 'in-transit':
        return '배송중'
      case 'received':
        return '수령됨'
      default:
        return status
    }
  }

  const getPriorityBadgeType = (priority: string): 'warning' | 'success' | 'default' | 'danger' => {
    switch (priority) {
      case 'high':
        return 'danger'
      case 'normal':
        return 'default'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '긴급'
      case 'normal':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return priority
    }
  }

  const columns: any[] = [
    { key: 'id', label: '요청ID', align: 'left' as const },
    { key: 'supplier', label: '공급사', align: 'left' as const },
    { key: 'itemCount', label: '품목수', align: 'center' as const },
    {
      key: 'quantity',
      label: '수량',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    { key: 'requestDate', label: '신청일', align: 'center' as const },
    { key: 'expectedDate', label: '예정일', align: 'center' as const },
    {
      key: 'status',
      label: '상태',
      align: 'center' as const,
      render: (value: string) => (
        <Badge type={getStatusBadgeType(value)}>
          {getStatusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'priority',
      label: '우선순위',
      align: 'center' as const,
      render: (value: string) => (
        <Badge type={getPriorityBadgeType(value)}>
          {getPriorityLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
      render: () => (
        <Button size="sm" variant="secondary">
          {t('common.view')}
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper>
      <Section title="입고 신청">
        <div className={styles.headerActions}>
          <Button variant="primary">+ 새 신청</Button>
        </div>
      </Section>

      <Section>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title="신청 목록">
        <Table columns={columns} data={requests} />
      </Section>
    </PageWrapper>
  )
}
