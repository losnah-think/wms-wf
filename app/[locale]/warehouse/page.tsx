'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function WarehousePage() {
  const t = useTranslations()
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')

  const warehouseOptions = [
    { value: 'all', label: t('warehouse.allWarehouses') },
    { value: 'wh1', label: t('warehouse.warehouse') + ' 1 - ' + t('warehouse.main') },
    { value: 'wh2', label: t('warehouse.warehouse') + ' 2 - ' + t('warehouse.north') },
    { value: 'wh3', label: t('warehouse.warehouse') + ' 3 - ' + t('warehouse.south') },
  ]

  const warehouseStats = [
    { label: t('warehouse.totalWarehouses'), value: '3', subtitle: t('warehouse.locations') },
    { label: t('warehouse.totalCapacity'), value: '50,000', subtitle: t('warehouse.sqFt') },
    { label: t('warehouse.occupied'), value: '38,450', subtitle: t('warehouse.sqFt') },
    { label: t('warehouse.available'), value: '11,550', subtitle: t('warehouse.sqFt') },
  ]

  const locationData = [
    {
      warehouse: 'WH-1',
      name: t('warehouse.mainWarehouse'),
      zone: 'A',
      aisle: '1',
      rack: 'R-101',
      capacity: 100,
      occupied: 85,
      status: t('common.active'),
      statusType: 'success' as const,
    },
    {
      warehouse: 'WH-1',
      name: t('warehouse.mainWarehouse'),
      zone: 'A',
      aisle: '2',
      rack: 'R-102',
      capacity: 100,
      occupied: 98,
      status: t('warehouse.nearFull'),
      statusType: 'warning' as const,
    },
    {
      warehouse: 'WH-2',
      name: t('warehouse.northWarehouse'),
      zone: 'B',
      aisle: '1',
      rack: 'R-201',
      capacity: 150,
      occupied: 45,
      status: t('common.active'),
      statusType: 'success' as const,
    },
    {
      warehouse: 'WH-3',
      name: t('warehouse.southWarehouse'),
      zone: 'C',
      aisle: '3',
      rack: 'R-301',
      capacity: 120,
      occupied: 120,
      status: t('warehouse.full'),
      statusType: 'danger' as const,
    },
  ]

  const columns: TableColumn[] = [
    { key: 'warehouse', label: t('warehouse.warehouse'), align: 'left' },
    { key: 'name', label: t('warehouse.name'), align: 'left' },
    { key: 'zone', label: t('warehouse.zone'), align: 'center' },
    { key: 'aisle', label: t('warehouse.aisle'), align: 'center' },
    { key: 'rack', label: t('warehouse.rack'), align: 'left' },
    { key: 'capacity', label: t('warehouse.capacity'), align: 'right' },
    { key: 'occupied', label: t('warehouse.occupied'), align: 'right' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('warehouse.overview')}>
        <Grid columns={4} gap="md">
          {warehouseStats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('warehouse.locations')}>
        <div style={{ marginBottom: '24px' }}>
          <Select
            label={t('warehouse.filterByWarehouse')}
            options={warehouseOptions}
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
          />
        </div>
        <Table columns={columns} data={locationData} />
      </Section>
    </PageWrapper>
  )
}
