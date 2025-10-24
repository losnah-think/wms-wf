'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Badge, Grid, StatCard, Select } from '@/components/UI'
import styles from './schedule.module.css'

interface InboundSchedule {
  id: string
  requestId: string
  supplier: string
  expectedDate: string
  itemCount: number
  quantity: number
  estimatedArrival: string
  status: 'pending' | 'on-schedule' | 'delayed' | 'arrived'
  carrier: string
  trackingNumber?: string
}

const mockSchedules: InboundSchedule[] = [
  {
    id: 'SCH-2024-001',
    requestId: 'REQ-2024-001',
    supplier: 'ABC Supply Co.',
    expectedDate: '2024-10-28',
    itemCount: 8,
    quantity: 250,
    estimatedArrival: '2024-10-28 14:00',
    status: 'on-schedule',
    carrier: 'FastShip Express',
    trackingNumber: 'FS-2024-001234',
  },
  {
    id: 'SCH-2024-002',
    requestId: 'REQ-2024-002',
    supplier: 'XYZ Corporation',
    expectedDate: '2024-10-27',
    itemCount: 12,
    quantity: 500,
    estimatedArrival: '2024-10-27 10:30',
    status: 'on-schedule',
    carrier: 'Premium Logistics',
    trackingNumber: 'PM-2024-005678',
  },
  {
    id: 'SCH-2024-003',
    requestId: 'REQ-2024-003',
    supplier: 'Global Logistics',
    expectedDate: '2024-10-26',
    itemCount: 5,
    quantity: 100,
    estimatedArrival: '2024-10-26 09:00',
    status: 'delayed',
    carrier: 'International Freight',
    trackingNumber: 'IF-2024-009999',
  },
  {
    id: 'SCH-2024-004',
    requestId: 'REQ-2024-004',
    supplier: 'Premier Distributors',
    expectedDate: '2024-10-24',
    itemCount: 15,
    quantity: 800,
    estimatedArrival: '2024-10-24 16:45',
    status: 'arrived',
    carrier: 'Direct Delivery',
    trackingNumber: 'DD-2024-003333',
  },
]

export default function InboundSchedulePage() {
  const t = useTranslations()
  const [schedules, setSchedules] = useState<InboundSchedule[]>(mockSchedules)
  const [dateFilter, setDateFilter] = useState('all')

  const stats = [
    { label: '예정된 입고', value: schedules.filter(s => s.status === 'on-schedule').length, subtitle: '건' },
    { label: '지연된 입고', value: schedules.filter(s => s.status === 'delayed').length, subtitle: '건' },
    { label: '도착 완료', value: schedules.filter(s => s.status === 'arrived').length, subtitle: '건' },
    { label: '총 입고량', value: schedules.reduce((acc, s) => acc + s.quantity, 0), subtitle: '개' },
  ]

  const getStatusBadgeType = (status: string): 'warning' | 'success' | 'default' | 'danger' => {
    switch (status) {
      case 'pending':
        return 'default'
      case 'on-schedule':
        return 'success'
      case 'delayed':
        return 'danger'
      case 'arrived':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기'
      case 'on-schedule':
        return '정상 진행'
      case 'delayed':
        return '지연'
      case 'arrived':
        return '도착'
      default:
        return status
    }
  }

  const columns: any[] = [
    { key: 'id', label: '일정ID', align: 'left' as const },
    { key: 'requestId', label: '요청ID', align: 'left' as const },
    { key: 'supplier', label: '공급사', align: 'left' as const },
    { key: 'expectedDate', label: '예정일', align: 'center' as const },
    {
      key: 'quantity',
      label: '수량',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    { key: 'estimatedArrival', label: '예상 도착', align: 'center' as const },
    { key: 'carrier', label: '배송사', align: 'left' as const },
    { key: 'trackingNumber', label: '추적번호', align: 'center' as const },
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
      key: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
      render: () => (
        <Button size="sm" variant="secondary">
          추적
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper>
      <Section title="입고 예정표">
        <div className={styles.filterActions}>
          <Select
            label="필터"
            options={[
              { value: 'all', label: '전체' },
              { value: 'today', label: '오늘' },
              { value: 'week', label: '이번 주' },
              { value: 'month', label: '이번 달' },
            ]}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </Section>

      <Section>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title="예정 목록">
        <Table columns={columns} data={schedules} />
      </Section>
    </PageWrapper>
  )
}
