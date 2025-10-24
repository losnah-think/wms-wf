'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function ReturnPickingPage() {
  const t = useTranslations()
  const [selectedStatus, setSelectedStatus] = useState('all')

  const statusOptions = [
    { value: 'all', label: t('status.all') },
    { value: 'pending', label: t('status.pending') },
    { value: 'in-progress', label: t('status.inProgress') },
    { value: 'completed', label: t('status.completed') },
  ]

  const stats = [
    { label: t('returnPicking.pendingReturns'), value: '15', subtitle: t('common.items') },
    { label: t('status.inProgress'), value: '8', subtitle: t('common.items') },
    { label: t('returnPicking.completedToday'), value: '42', subtitle: t('common.items') },
    { label: t('returnPicking.restocked'), value: '38', subtitle: t('common.items') },
  ]

  const returnPickingData = [
    {
      returnId: 'RET-PICK-001',
      orderId: 'ORD-2024-105',
      product: 'Wireless Mouse',
      location: 'WH-1, A-12',
      quantity: 2,
      pickedBy: 'John Smith',
      status: t('status.completed'),
      statusType: 'success' as const,
      time: '09:30 AM',
      reason: t('returnPicking.defective'),
      priority: t('common.normal'),
    },
    {
      returnId: 'RET-PICK-002',
      orderId: 'ORD-2024-098',
      product: 'Office Chair',
      location: 'WH-1, B-05',
      quantity: 1,
      pickedBy: 'Sarah Johnson',
      status: t('status.inProgress'),
      statusType: 'warning' as const,
      time: '10:15 AM',
      reason: t('returnPicking.damage'),
      priority: t('common.high'),
    },
    {
      returnId: 'RET-PICK-003',
      orderId: 'ORD-2024-112',
      product: 'USB-C Cable',
      location: 'WH-2, C-08',
      quantity: 3,
      pickedBy: t('common.unassigned'),
      status: t('status.pending'),
      statusType: 'default' as const,
      time: '11:00 AM',
      reason: t('returnPicking.wrongItem'),
      priority: t('common.normal'),
    },
    {
      returnId: 'RET-PICK-004',
      orderId: 'ORD-2024-089',
      product: 'Cotton T-Shirt',
      location: 'WH-1, A-15',
      quantity: 5,
      pickedBy: 'Mike Davis',
      status: t('status.completed'),
      statusType: 'success' as const,
      time: '08:45 AM',
      reason: t('returnPicking.sizeIssue'),
      priority: t('common.low'),
    },
    {
      returnId: 'RET-PICK-005',
      orderId: 'ORD-2024-156',
      product: 'Keyboard',
      location: 'WH-2, B-18',
      quantity: 1,
      pickedBy: 'Emily Brown',
      status: t('status.inProgress'),
      statusType: 'warning' as const,
      time: '10:45 AM',
      reason: t('returnPicking.notWorking'),
      priority: t('common.high'),
    },
  ]

  const columns: TableColumn[] = [
    { key: 'returnId', label: t('returnPicking.returnPickId'), align: 'left' },
    { key: 'orderId', label: t('common.orderId'), align: 'left' },
    { key: 'product', label: t('products.product'), align: 'left' },
    { key: 'reason', label: t('returnPicking.reason'), align: 'center' },
    { key: 'location', label: t('warehouse.location'), align: 'center' },
    { key: 'quantity', label: t('common.qty'), align: 'right' },
    { key: 'pickedBy', label: t('returnPicking.pickedBy'), align: 'left' },
    {
      key: 'priority',
      label: t('common.priority'),
      align: 'center',
      render: (value: any) => {
        const colors: { [key: string]: string } = {
          [t('common.high')]: '#ff4444',
          [t('common.normal')]: '#333333',
          [t('common.low')]: '#00b4d8',
        }
        return <span style={{ color: colors[value as string] || '#333333', fontWeight: 'bold' }}>{value}</span>
      },
    },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value: any, row: any) => <Badge type={row.statusType}>{value}</Badge>,
    },
  ]

  return (
    <PageWrapper>
      
      <Section title={t('returnPicking.overview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('returnPicking.tasks')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('returnPicking.filterByStatus')}
              options={statusOptions}
              value={selectedStatus}
              onChange={(e: any) => setSelectedStatus(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('returnPicking.assignTask')}</Button>
          <Button variant="secondary" size="md">{t('returnPicking.printLabels')}</Button>
          <Button variant="secondary" size="md">{t('returnPicking.generateReport')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        <Table columns={columns} data={returnPickingData} />
      </Section></PageWrapper>
  )
}
