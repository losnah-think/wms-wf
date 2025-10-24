'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function WorkersPage() {
  const t = useTranslations()
  const [selectedShift, setSelectedShift] = useState('all')

  const shiftOptions = [
    { value: 'all', label: t('workers.allShifts') },
    { value: 'morning', label: t('workers.morning') },
    { value: 'afternoon', label: t('workers.afternoon') },
    { value: 'night', label: t('workers.night') },
  ]

  const stats = [
    { label: t('workers.totalWorkers'), value: '24', subtitle: t('common.active') },
    { label: t('workers.onDuty'), value: '18', subtitle: t('workers.currently') },
    { label: t('workers.avgProductivity'), value: '92%', subtitle: t('workers.efficiency') },
    { label: t('workers.tasksCompleted'), value: '156', subtitle: t('common.today') },
  ]

  const workersData = [
    {
      workerId: 'WRK-2024-001',
      name: 'John Smith',
      role: t('workers.picker'),
      shift: t('workers.morning').split(' ')[0],
      zone: 'Zone A',
      tasksToday: 45,
      productivity: '95%',
      status: t('common.active'),
      statusType: 'success' as const,
      startTime: '06:00 AM',
      endTime: '02:00 PM',
    },
    {
      workerId: 'WRK-2024-002',
      name: 'Sarah Johnson',
      role: t('workers.packer'),
      shift: t('workers.morning').split(' ')[0],
      zone: 'Station 2',
      tasksToday: 38,
      productivity: '92%',
      status: t('common.active'),
      statusType: 'success' as const,
      startTime: '06:00 AM',
      endTime: '02:00 PM',
    },
    {
      workerId: 'WRK-2024-003',
      name: 'Mike Davis',
      role: t('workers.picker'),
      shift: t('workers.afternoon').split(' ')[0],
      zone: 'Zone C',
      tasksToday: 28,
      productivity: '88%',
      status: t('common.active'),
      statusType: 'success' as const,
      startTime: '02:00 PM',
      endTime: '10:00 PM',
    },
    {
      workerId: 'WRK-2024-004',
      name: 'Emily Brown',
      role: t('workers.supervisor'),
      shift: t('workers.morning').split(' ')[0],
      zone: 'All',
      tasksToday: 12,
      productivity: '100%',
      status: t('common.active'),
      statusType: 'success' as const,
      startTime: '06:00 AM',
      endTime: '02:00 PM',
    },
    {
      workerId: 'WRK-2024-005',
      name: 'David Wilson',
      role: t('workers.packer'),
      shift: t('workers.afternoon').split(' ')[0],
      zone: 'Station 1',
      tasksToday: 31,
      productivity: '85%',
      status: 'On Break',
      statusType: 'warning' as const,
      startTime: '02:00 PM',
      endTime: '10:00 PM',
    },
  ]

  const columns: TableColumn[] = [
    { key: 'workerId', label: t('workers.workerId'), align: 'left' },
    { key: 'name', label: t('workers.name'), align: 'left' },
    { key: 'role', label: t('workers.role'), align: 'center' },
    { key: 'shift', label: t('workers.shift'), align: 'center' },
    { key: 'zone', label: t('workers.zone'), align: 'center' },
    { key: 'tasksToday', label: t('workers.tasksToday'), align: 'right' },
    { key: 'productivity', label: t('workers.productivity'), align: 'right' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
  ]

  return (
    <PageWrapper>
      
      <Section title={t('workers.overview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('workers.workerList')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('workers.filterByShift')}
              options={shiftOptions}
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('workers.filterByRole')}
              options={[
                { value: '', label: t('workers.allRoles') },
                { value: 'picker', label: t('workers.picker') },
                { value: 'packer', label: t('workers.packer') },
                { value: 'supervisor', label: t('workers.supervisor') },
              ]}
              value=""
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('workers.assignWork')}</Button>
          <Button variant="secondary" size="md">{t('workers.viewPerformance')}</Button>
          <Button variant="secondary" size="md">{t('workers.scheduleShift')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        <Table columns={columns} data={workersData} />
      </Section>
    </PageWrapper>
  )
}
