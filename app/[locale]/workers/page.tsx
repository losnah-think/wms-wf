'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface Worker {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  lastLoginAt?: string
}

export default function WorkersPage() {
  const t = useTranslations()
  const [selectedShift, setSelectedShift] = useState('all')
  const [workers, setWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    onDuty: 0,
    productivity: '92',
    tasksCompleted: 0,
  })

  // API에서 작업자 데이터 가져오기
  useEffect(() => {
    const fetchWorkers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/users')
        const result = await response.json()

        if (result.success) {
          setWorkers(result.data || [])
          
          const active = result.data.filter((w: Worker) => w.status === 'ACTIVE').length
          
          setStats({
            total: result.data.length,
            onDuty: active,
            productivity: '92',
            tasksCompleted: active * 8,
          })
        }
      } catch (error) {
        console.error('Error fetching workers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkers()
    
    // 1분마다 자동 새로고침
    const interval = setInterval(fetchWorkers, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const statsDisplay = [
    { label: t('workers.totalWorkers'), value: stats.total.toString(), subtitle: t('common.active') },
    { label: t('workers.onDuty'), value: stats.onDuty.toString(), subtitle: t('workers.currently') },
    { label: t('workers.avgProductivity'), value: stats.productivity + '%', subtitle: t('workers.efficiency') },
    { label: t('workers.tasksCompleted'), value: stats.tasksCompleted.toString(), subtitle: t('common.today') },
  ]

  const shiftOptions = [
    { value: 'all', label: t('workers.allShifts') },
    { value: 'morning', label: t('workers.morning') },
    { value: 'afternoon', label: t('workers.afternoon') },
    { value: 'night', label: t('workers.night') },
  ]

  const workersData = workers.map((worker, index) => ({
    workerId: worker.id,
    name: worker.name,
    role: worker.role === 'admin' ? t('workers.supervisor') : 
          worker.role === 'manager' ? t('workers.supervisor') : 
          t('workers.picker'),
    shift: index % 3 === 0 ? t('workers.morning').split(' ')[0] :
           index % 3 === 1 ? t('workers.afternoon').split(' ')[0] :
           t('workers.night').split(' ')[0],
    zone: `Zone ${String.fromCharCode(65 + (index % 3))}`,
    tasksToday: Math.floor(Math.random() * 50) + 20,
    productivity: `${Math.floor(Math.random() * 20) + 80}%`,
    status: worker.status === 'ACTIVE' ? t('common.active') : 'Inactive',
    statusType: worker.status === 'ACTIVE' ? 'success' as const : 'default' as const,
    startTime: index % 3 === 0 ? '06:00 AM' : index % 3 === 1 ? '02:00 PM' : '10:00 PM',
    endTime: index % 3 === 0 ? '02:00 PM' : index % 3 === 1 ? '10:00 PM' : '06:00 AM',
  }))

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
          {statsDisplay.map((stat, index) => (
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

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <Table columns={columns} data={workersData} />
        )}
      </Section>
    </PageWrapper>
  )
}
