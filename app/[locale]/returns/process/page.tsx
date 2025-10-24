'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function ReturnProcessPage() {
  const t = useTranslations()
  const [selectedAction, setSelectedAction] = useState('all')

  const actionOptions = [
    { value: 'all', label: t('returns.allActions') },
    { value: 'inspect', label: t('returns.inspection') },
    { value: 'restock', label: t('returns.restock') },
    { value: 'refund', label: t('returns.refund') },
    { value: 'discard', label: t('returns.discard') },
  ]

  const stats = [
    { label: t('returns.pendingProcessing'), value: '12', subtitle: t('dashboard.returns') },
    { label: t('returns.inInspection'), value: '5', subtitle: t('common.items') },
    { label: t('returns.processedToday'), value: '34', subtitle: t('dashboard.returns') },
    { label: t('returns.restocked'), value: '28', subtitle: t('common.items') },
  ]

  const processData = [
    {
      returnId: 'RET-2024-001',
      orderId: 'ORD-2024-105',
      product: 'Wireless Mouse',
      reason: t('returns.defective'),
      inspectedBy: 'John Smith',
      action: t('returns.refund'),
      actionType: 'warning' as const,
      condition: t('returns.damaged'),
      date: '2024-01-15',
      refundAmount: '$29.99',
    },
    {
      returnId: 'RET-2024-002',
      orderId: 'ORD-2024-098',
      product: 'Office Chair',
      reason: t('returns.wrongItem'),
      inspectedBy: 'Sarah Johnson',
      action: t('returns.restock'),
      actionType: 'success' as const,
      condition: t('returns.good'),
      date: '2024-01-15',
      refundAmount: '$189.99',
    },
    {
      returnId: 'RET-2024-003',
      orderId: 'ORD-2024-112',
      product: 'USB-C Cable',
      reason: 'Not Needed',
      inspectedBy: 'Mike Davis',
      action: t('returns.restock'),
      actionType: 'success' as const,
      condition: 'Excellent',
      date: '2024-01-14',
      refundAmount: '$9.99',
    },
    {
      returnId: 'RET-2024-004',
      orderId: 'ORD-2024-089',
      product: 'Cotton T-Shirt',
      reason: t('returns.damaged'),
      inspectedBy: t('common.pending'),
      action: t('common.pending'),
      actionType: 'default' as const,
      condition: 'Unknown',
      date: '2024-01-14',
      refundAmount: '$0.00',
    },
    {
      returnId: 'RET-2024-005',
      orderId: 'ORD-2024-156',
      product: 'Keyboard',
      reason: 'Not Working',
      inspectedBy: 'Emily Brown',
      action: t('returns.refund'),
      actionType: 'warning' as const,
      condition: t('returns.defective'),
      date: '2024-01-13',
      refundAmount: '$79.99',
    },
  ]

  const columns: TableColumn[] = [
    { key: 'returnId', label: t('returns.returnId'), align: 'left' },
    { key: 'orderId', label: t('packing.orderId'), align: 'left' },
    { key: 'product', label: t('products.product'), align: 'left' },
    { key: 'reason', label: t('returns.reason'), align: 'left' },
    { key: 'condition', label: t('returns.condition'), align: 'center' },
    { key: 'inspectedBy', label: t('returns.inspectedBy'), align: 'left' },
    { key: 'refundAmount', label: t('returns.refund'), align: 'right' },
    {
      key: 'action',
      label: t('returns.action'),
      align: 'center',
      render: (value, row) => <Badge type={row.actionType}>{value}</Badge>,
    },
    { key: 'date', label: t('common.date'), align: 'center' },
  ]

  return (
    <PageWrapper>
      
      <Section title={t('returns.processingOverview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('returns.processQueue')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('returns.filterByAction')}
              options={actionOptions}
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('returns.approveSelected')}</Button>
          <Button variant="secondary" size="md">{t('returns.inspect')}</Button>
          <Button variant="secondary" size="md">{t('returns.generateLabels')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        <Table columns={columns} data={processData} />
      </Section>
    </PageWrapper>
  )
}
