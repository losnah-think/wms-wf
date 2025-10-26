'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface PackingTask {
  id: string
  orderId: string
  productId: string
  productCode: string
  productName: string
  quantity: number
  workerId: string
  status: string
  priority: string
  createdAt: string
  assignedAt?: string
  packedAt?: string
}

export default function PackingPage() {
  const t = useTranslations()
  const [selectedStation, setSelectedStation] = useState('all')
  const [packingTasks, setPackingTasks] = useState<PackingTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeStations: 0,
    packedToday: 0,
    inProgress: 0,
    avgPackTime: 0,
  })

  const stationOptions = [
    { value: 'all', label: t('packing.allStations') },
    { value: 'station-1', label: t('packing.station') + ' 1' },
    { value: 'station-2', label: t('packing.station') + ' 2' },
    { value: 'station-3', label: t('packing.station') + ' 3' },
  ]

  // API에서 패킹 태스크 데이터 가져오기
  useEffect(() => {
    const fetchPackingData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/picking/packing')
        const result = await response.json()

        if (result.success) {
          setPackingTasks(result.data || [])
          
          // 통계 계산
          const packed = result.data.filter((t: PackingTask) => t.status === 'completed').length
          const inProgress = result.data.filter((t: PackingTask) => t.status === 'packing').length
          
          setStats({
            activeStations: 3,
            packedToday: packed,
            inProgress: inProgress,
            avgPackTime: 4.2,
          })
        }
      } catch (error) {
        console.error('Error fetching packing data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackingData()
    
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchPackingData, 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  const statsDisplay = [
    { label: t('packing.activeStations'), value: stats.activeStations.toString(), subtitle: t('packing.stations') },
    { label: t('packing.packedToday'), value: stats.packedToday.toString(), subtitle: t('dashboard.stats.totalOrders') },
    { label: t('common.inProgress'), value: stats.inProgress.toString(), subtitle: t('dashboard.stats.totalOrders') },
    { label: t('packing.avgPackTime'), value: stats.avgPackTime.toFixed(1), subtitle: t('packing.minPerOrder') },
  ]

  const packingData = packingTasks.map((task, index) => ({
    packId: `PACK-${task.id}`,
    orderId: task.orderId,
    items: task.quantity,
    station: t('packing.station') + ' ' + ((index % 3) + 1),
    packer: task.workerId || 'Unassigned',
    boxSize: task.quantity <= 3 ? t('packing.small') : task.quantity <= 6 ? t('packing.medium') : t('packing.large'),
    weight: (task.quantity * 0.5).toFixed(1) + ' kg',
    status: task.status === 'COMPLETED' ? t('common.completed') : 
            task.status === 'IN_PROGRESS' ? t('common.inProgress') : 
            t('common.pending'),
    statusType: task.status === 'COMPLETED' ? 'success' as const :
                task.status === 'IN_PROGRESS' ? 'warning' as const :
                'default' as const,
    time: task.packedAt ? 
          `${Math.floor((new Date().getTime() - new Date(task.packedAt).getTime()) / 60000)} min` : 
          '-',
    quality: task.status === 'COMPLETED' ? '✓' : '-',
  }))

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
          {statsDisplay.map((stat, index) => (
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
