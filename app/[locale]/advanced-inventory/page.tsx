'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard, Input } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function AdvancedInventoryPage() {
  const t = useTranslations()
  const [selectedMovement, setSelectedMovement] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const movementOptions = [
    { value: 'all', label: t('advancedInventory.allMovements') },
    { value: 'transfer', label: t('advancedInventory.transfers') },
    { value: 'adjustment', label: t('advancedInventory.adjustments') },
    { value: 'cycle-count', label: t('advancedInventory.cycleCounts') },
  ]

  const stats = [
    { label: t('advancedInventory.transfersToday'), value: '23', subtitle: t('advancedInventory.movements') },
    { label: t('advancedInventory.adjustments'), value: '8', subtitle: t('advancedInventory.corrections') },
    { label: t('advancedInventory.cycleCounts'), value: '5', subtitle: t('common.completed') },
    { label: t('advancedInventory.discrepancies'), value: '2', subtitle: t('common.items') },
  ]

  const movementData = [
    {
      id: 'MOV-2024-001',
      type: t('advancedInventory.transfer'),
      product: 'Wireless Mouse',
      from: 'WH-1, Zone A',
      to: 'WH-2, Zone B',
      quantity: 50,
      reason: 'Rebalancing',
      status: t('common.completed'),
      statusType: 'success' as const,
      date: '2024-01-15',
    },
    {
      id: 'MOV-2024-002',
      type: t('advancedInventory.adjustment'),
      product: 'Office Chair',
      from: 'WH-1, Zone A',
      to: '-',
      quantity: -3,
      reason: 'Damaged Items',
      status: t('common.active'),
      statusType: 'warning' as const,
      date: '2024-01-15',
    },
    {
      id: 'MOV-2024-003',
      type: t('advancedInventory.cycleCountType'),
      product: 'USB-C Cable',
      from: 'WH-3, Zone C',
      to: '-',
      quantity: 0,
      reason: 'Regular Audit',
      status: t('common.inProgress'),
      statusType: 'warning' as const,
      date: '2024-01-15',
    },
    {
      id: 'MOV-2024-004',
      type: t('advancedInventory.transfer'),
      product: 'Cotton T-Shirt',
      from: 'WH-2, Zone B',
      to: 'WH-1, Zone A',
      quantity: 100,
      reason: 'Restocking',
      status: t('common.pending'),
      statusType: 'default' as const,
      date: '2024-01-14',
    },
  ]

  const columns: TableColumn[] = [
    { key: 'id', label: t('advancedInventory.movementId'), align: 'left' },
    { key: 'type', label: t('inboundOutbound.type'), align: 'left' },
    { key: 'product', label: t('products.product'), align: 'left' },
    { key: 'from', label: t('advancedInventory.from'), align: 'left' },
    { key: 'to', label: t('advancedInventory.to'), align: 'left' },
    {
      key: 'quantity',
      label: t('common.quantity'),
      align: 'right',
      render: (value) => value > 0 ? `+${value}` : value,
    },
    { key: 'reason', label: t('advancedInventory.reason'), align: 'left' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('advancedInventory.overview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('advancedInventory.movementHistory')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('advancedInventory.movementType')}
              options={movementOptions}
              value={selectedMovement}
              onChange={(e) => setSelectedMovement(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Input
              label={t('common.search')}
              placeholder={t('advancedInventory.searchMovements')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Table columns={columns} data={movementData} />
      </Section>
    </PageWrapper>
  )
}
