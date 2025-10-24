'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function PackingPage() {
  const t = useTranslations()
  const [selectedStation, setSelectedStation] = useState('all')

  const stationOptions = [
    { value: 'all', label: t('packing.allStations') },
    { value: 'station-1', label: t('packing.station') + ' 1' },
    { value: 'station-2', label: t('packing.station') + ' 2' },
    { value: 'station-3', label: t('packing.station') + ' 3' },
  ]

  const stats = [
    { label: t('packing.activeStations'), value: '3', subtitle: t('packing.stations') },
    { label: t('packing.packedToday'), value: '156', subtitle: t('dashboard.stats.totalOrders') },
    { label: t('common.inProgress'), value: '12', subtitle: t('dashboard.stats.totalOrders') },
    { label: t('packing.avgPackTime'), value: '4.2', subtitle: t('packing.minPerOrder') },
  ]

  const packingData = [
    {
      packId: 'PACK-2024-001',
      orderId: 'ORD-2024-145',
      items: 5,
      station: t('packing.station') + ' 1',
      packer: 'John Smith',
      boxSize: t('packing.medium'),
      weight: '2.5 kg',
      status: t('common.completed'),
      statusType: 'success' as const,
      time: '3.2 min',
      quality: '✓',
    },
    {
      packId: 'PACK-2024-002',
      orderId: 'ORD-2024-146',
      items: 3,
      station: t('packing.station') + ' 2',
      packer: 'Sarah Johnson',
      boxSize: t('packing.small'),
      weight: '1.2 kg',
      status: t('common.inProgress'),
      statusType: 'warning' as const,
      time: '2.1 min',
      quality: '-',
    },
    {
      packId: 'PACK-2024-003',
      orderId: 'ORD-2024-147',
      items: 8,
      station: t('packing.station') + ' 3',
      packer: 'Mike Davis',
      boxSize: t('packing.large'),
      weight: '5.8 kg',
      status: t('common.inProgress'),
      statusType: 'warning' as const,
      time: '5.5 min',
      quality: '-',
    },
    {
      packId: 'PACK-2024-004',
      orderId: 'ORD-2024-148',
      items: 2,
      station: t('packing.station') + ' 1',
      packer: 'Emily Brown',
      boxSize: t('packing.small'),
      weight: '0.8 kg',
      status: t('common.completed'),
      statusType: 'success' as const,
      time: '2.8 min',
      quality: '✓',
    },
    {
      packId: 'PACK-2024-005',
      orderId: 'ORD-2024-149',
      items: 6,
      station: t('packing.station') + ' 2',
      packer: 'David Wilson',
      boxSize: t('packing.medium'),
      weight: '3.5 kg',
      status: t('common.pending'),
      statusType: 'default' as const,
      time: '-',
      quality: '-',
    },
  ]

  const columns: TableColumn[] = [
    { key: 'packId', label: t('packing.packId'), align: 'left' },
    { key: 'orderId', label: t('packing.orderId'), align: 'left' },
    { key: 'items', label: t('common.items'), align: 'right' },
    { key: 'station', label: t('packing.station'), align: 'center' },
    { key: 'packer', label: t('packing.packer'), align: 'left' },
    { key: 'boxSize', label: t('packing.boxSize'), align: 'center' },
    { key: 'weight', label: t('packing.weight'), align: 'right' },
    { key: 'quality', label: t('packing.qc'), align: 'center' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
    { key: 'time', label: t('common.time'), align: 'right' },
  ]

  return (
    <PageWrapper>
      
      <Section title={t('packing.overview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('packing.packingOperations')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('packing.filterByStation')}
              options={stationOptions}
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('packing.startPacking')}</Button>
          <Button variant="secondary" size="md">{t('packing.printManifests')}</Button>
          <Button variant="secondary" size="md">{t('packing.qualityCheck')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        <Table columns={columns} data={packingData} />
      </Section></PageWrapper>
  )
}
