'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard, Input } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function PickingPage() {
  const t = useTranslations()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedWorker, setSelectedWorker] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Status options
  const statusOptions = [
    { value: 'all', label: t('picking.allStatus') },
    { value: 'pending', label: t('common.pending') },
    { value: 'in-progress', label: t('common.inProgress') },
    { value: 'completed', label: t('common.completed') },
  ]

  // Worker options
  const workerOptions = [
    { value: 'all', label: t('picking.allWorkers') },
    { value: 'john', label: 'John Smith' },
    { value: 'sarah', label: 'Sarah Johnson' },
    { value: 'mike', label: 'Mike Davis' },
  ]

  // Statistics
  const stats = [
    { label: t('dashboard.stats.totalOrders'), value: '45', subtitle: t('common.pending') },
    { label: t('dashboard.stats.inProgress'), value: '12', subtitle: t('common.active') },
    { label: t('picking.completedToday'), value: '89', subtitle: t('dashboard.stats.totalOrders') },
    { label: t('picking.avgPickTime'), value: '3.2 min', subtitle: t('picking.perItem') },
  ]

  // Picking data
  const pickingData = [
    {
      orderNumber: 'ORD-2024-001',
      items: 8,
      assignedTo: 'John Smith',
      status: t('common.inProgress'),
      statusType: 'warning' as const,
      time: '10:30 AM',
      zone: 'Zone A',
      priority: t('picking.high'),
    },
    {
      orderNumber: 'ORD-2024-002',
      items: 5,
      assignedTo: 'Sarah Johnson',
      status: t('common.completed'),
      statusType: 'success' as const,
      time: '09:15 AM',
      zone: 'Zone B',
      priority: t('picking.normal'),
    },
    {
      orderNumber: 'ORD-2024-003',
      items: 12,
      assignedTo: 'Unassigned',
      status: t('common.pending'),
      statusType: 'default' as const,
      time: '11:45 AM',
      zone: 'Zone C',
      priority: t('picking.high'),
    },
    {
      orderNumber: 'ORD-2024-004',
      items: 6,
      assignedTo: 'Mike Davis',
      status: t('common.inProgress'),
      statusType: 'warning' as const,
      time: '10:00 AM',
      zone: 'Zone A',
      priority: t('picking.normal'),
    },
    {
      orderNumber: 'ORD-2024-005',
      items: 3,
      assignedTo: 'Sarah Johnson',
      status: t('common.completed'),
      statusType: 'success' as const,
      time: '11:00 AM',
      zone: 'Zone B',
      priority: t('picking.low'),
    },
  ]

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'orderNumber',
      label: t('picking.orderNumber'),
      align: 'left',
    },
    {
      key: 'items',
      label: t('common.items'),
      align: 'right',
    },
    {
      key: 'zone',
      label: t('picking.zone'),
      align: 'center',
    },
    {
      key: 'assignedTo',
      label: t('picking.assignedTo'),
      align: 'left',
    },
    {
      key: 'priority',
      label: t('picking.priority'),
      align: 'center',
      render: (value) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: value === t('picking.high') ? '#ffe8e8' : value === t('picking.low') ? '#e8f8f8' : '#f0f0f0',
          color: value === t('picking.high') ? '#d32f2f' : value === t('picking.low') ? '#0097a7' : '#333',
        }}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => (
        <Badge type={row.statusType}>{value}</Badge>
      ),
    },
    {
      key: 'time',
      label: t('common.time'),
      align: 'center',
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('picking.pickingOverview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('picking.pickingTasks')}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '150px' }}>
            <Select
              label={t('common.status')}
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <Select
              label={t('picking.worker')}
              options={workerOptions}
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Input
              label={t('common.search')}
              placeholder={t('picking.searchOrder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('picking.assignTask')}</Button>
          <Button variant="secondary" size="md">{t('picking.printLabels')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        {/* Picking Table */}
        <Table columns={columns} data={pickingData} />
      </Section>
    </PageWrapper>
  )
}
