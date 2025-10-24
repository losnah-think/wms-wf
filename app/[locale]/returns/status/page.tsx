'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, SearchBar, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function ReturnStatusPage() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { label: t('returns.totalReturns'), value: '87', subtitle: t('returns.thisMonth') },
    { label: t('returns.approved'), value: '65', subtitle: t('dashboard.returns') },
    { label: t('returns.rejected'), value: '8', subtitle: t('dashboard.returns') },
    { label: t('common.pending'), value: '14', subtitle: t('dashboard.returns') },
  ]

  const statusData = [
    {
      returnId: 'RET-2024-001',
      orderId: 'ORD-2024-105',
      customer: 'Alice Cooper',
      product: 'Wireless Mouse',
      requestDate: '2024-01-10',
      processDate: '2024-01-12',
      daysToProcess: '2',
      status: t('returns.approved'),
      statusType: 'success' as const,
      refundAmount: '$29.99',
      resolution: t('returns.refunded'),
    },
    {
      returnId: 'RET-2024-002',
      orderId: 'ORD-2024-098',
      customer: 'Bob Martin',
      product: 'Office Chair',
      requestDate: '2024-01-11',
      processDate: '2024-01-13',
      daysToProcess: '2',
      status: t('returns.approved'),
      statusType: 'success' as const,
      refundAmount: '$189.99',
      resolution: t('returns.exchanged'),
    },
    {
      returnId: 'RET-2024-003',
      orderId: 'ORD-2024-112',
      customer: 'Carol White',
      product: 'USB-C Cable',
      requestDate: '2024-01-12',
      processDate: '-',
      daysToProcess: '1',
      status: t('common.pending'),
      statusType: 'warning' as const,
      refundAmount: '$9.99',
      resolution: t('common.pending'),
    },
    {
      returnId: 'RET-2024-004',
      orderId: 'ORD-2024-089',
      customer: 'Dave Brown',
      product: 'Cotton T-Shirt',
      requestDate: '2024-01-09',
      processDate: '2024-01-11',
      daysToProcess: '2',
      status: t('returns.rejected'),
      statusType: 'danger' as const,
      refundAmount: '$0.00',
      resolution: t('returns.outsideWindow'),
    },
    {
      returnId: 'RET-2024-005',
      orderId: 'ORD-2024-156',
      customer: 'Emily Davis',
      product: 'Keyboard',
      requestDate: '2024-01-08',
      processDate: '2024-01-10',
      daysToProcess: '2',
      status: t('returns.approved'),
      statusType: 'success' as const,
      refundAmount: '$79.99',
      resolution: t('returns.refunded'),
    },
  ]

  const columns: TableColumn[] = [
    { key: 'returnId', label: t('returns.returnId'), align: 'left' },
    { key: 'orderId', label: t('packing.orderId'), align: 'left' },
    { key: 'customer', label: t('returns.customer'), align: 'left' },
    { key: 'product', label: t('products.product'), align: 'left' },
    { key: 'requestDate', label: t('returns.requestDate'), align: 'center' },
    { key: 'processDate', label: t('returns.processDate'), align: 'center' },
    { key: 'daysToProcess', label: t('returns.days'), align: 'right' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
    { key: 'refundAmount', label: t('returns.refund'), align: 'right' },
    { key: 'resolution', label: t('returns.resolution'), align: 'center' },
  ]

  return (
    <PageWrapper>
      
      <Section title={t('returns.statusOverview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('returns.returnStatus')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <SearchBar
              placeholder={t('returns.searchPlaceholder')}
              onSearch={setSearchQuery}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('returns.exportReport')}</Button>
          <Button variant="secondary" size="md">{t('picking.printLabels')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        <Table columns={columns} data={statusData} />
      </Section>
    </PageWrapper>
  )
}
