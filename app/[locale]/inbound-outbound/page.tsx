'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function InboundOutboundPage() {
  const t = useTranslations()
  const [selectedType, setSelectedType] = useState('all')

  const typeOptions = [
    { value: 'all', label: t('inboundOutbound.allTransactions') },
    { value: 'inbound', label: t('inboundOutbound.inboundOnly') },
    { value: 'outbound', label: t('inboundOutbound.outboundOnly') },
  ]

  const stats = [
    { label: t('inboundOutbound.todayInbound'), value: '48', subtitle: t('inboundOutbound.transactions') },
    { label: t('inboundOutbound.todayOutbound'), value: '73', subtitle: t('inboundOutbound.transactions') },
    { label: t('common.pending'), value: '12', subtitle: t('common.items') },
    { label: t('common.completed'), value: '109', subtitle: t('common.today') },
  ]

  const transactionData = [
    {
      id: 'TXN-2024-001',
      type: t('inboundOutbound.inbound'),
      typeIcon: '📥',
      product: 'Wireless Mouse',
      quantity: 100,
      time: '09:30 AM',
      status: t('common.completed'),
      statusType: 'success' as const,
    },
    {
      id: 'TXN-2024-002',
      type: t('inboundOutbound.outbound'),
      typeIcon: '📤',
      product: 'Office Chair',
      quantity: 15,
      time: '10:15 AM',
      status: t('common.inProgress'),
      statusType: 'warning' as const,
    },
    {
      id: 'TXN-2024-003',
      type: t('inboundOutbound.inbound'),
      typeIcon: '📥',
      product: 'USB-C Cable',
      quantity: 250,
      time: '11:00 AM',
      status: t('common.pending'),
      statusType: 'default' as const,
    },
    {
      id: 'TXN-2024-004',
      type: t('inboundOutbound.outbound'),
      typeIcon: '📤',
      product: 'Cotton T-Shirt',
      quantity: 50,
      time: '11:45 AM',
      status: t('common.completed'),
      statusType: 'success' as const,
    },
  ]

  const columns: TableColumn[] = [
    { key: 'id', label: t('inboundOutbound.transactionId'), align: 'left' },
    {
      key: 'type',
      label: t('inboundOutbound.type'),
      align: 'left',
      render: (value, row) => `${row.typeIcon} ${value}`,
    },
    { key: 'product', label: t('inboundOutbound.product'), align: 'left' },
    { key: 'quantity', label: t('common.quantity'), align: 'right' },
    { key: 'time', label: t('common.time'), align: 'center' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'center',
      render: () => <Button size="sm" variant="secondary">{t('common.view')}</Button>,
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('inboundOutbound.overview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('inboundOutbound.recentTransactions')}>
        <div style={{ marginBottom: '24px' }}>
          <Select
            label={t('inboundOutbound.filterByType')}
            options={typeOptions}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />
        </div>
        <Table columns={columns} data={transactionData} />
      </Section>
    </PageWrapper>
  )
}
