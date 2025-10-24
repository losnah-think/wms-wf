'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface ReturnPickingTask {
  id: string
  returnRequestId: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  reason: string
  status: string
  assignedTo?: string
  createdAt: string
  priority?: string
}

export default function ReturnPickingPage() {
  const t = useTranslations()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [tasks, setTasks] = useState<ReturnPickingTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    restocked: 0,
  })

  const statusOptions = [
    { value: 'all', label: t('picking.allStatus') },
    { value: 'PENDING', label: t('common.pending') },
    { value: 'IN_PROGRESS', label: t('common.inProgress') },
    { value: 'COMPLETED', label: t('common.completed') },
  ]

  // API에서 반품 피킹 데이터 가져오기
  useEffect(() => {
    const fetchReturnPicking = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedStatus !== 'all') params.append('status', selectedStatus)

        const response = await fetch(`/api/return-picking?${params}`)
        const result = await response.json()

        if (result.success) {
          setTasks(result.data || [])

          // 통계 계산
          const total = result.data.length
          const inProgress = result.data.filter((t: ReturnPickingTask) => t.status === 'IN_PROGRESS').length
          const completed = result.data.filter((t: ReturnPickingTask) => t.status === 'COMPLETED').length

          setStats({
            total,
            inProgress,
            completed,
            restocked: Math.floor(completed * 0.95),
          })
        }
      } catch (error) {
        console.error('Error fetching return picking data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReturnPicking()
    
    // 1분마다 자동 새로고침
    const interval = setInterval(fetchReturnPicking, 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedStatus])

  const statsDisplay = [
    { label: t('returnPicking.totalReturns'), value: stats.total.toString(), subtitle: t('common.items') },
    { label: t('common.inProgress'), value: stats.inProgress.toString(), subtitle: t('common.items') },
    { label: t('returnPicking.completedToday'), value: stats.completed.toString(), subtitle: t('common.items') },
    { label: t('returnPicking.restocked'), value: stats.restocked.toString(), subtitle: t('common.items') },
  ]

  const returnPickingData = tasks.map((task) => ({
    returnId: `RET-${task.id.substring(0, 8)}`,
    orderId: task.orderId,
    product: task.productName,
    location: 'WH-1, A-12',
    quantity: task.quantity,
    pickedBy: task.assignedTo || 'Unassigned',
    status: task.status === 'COMPLETED' ? t('common.completed') :
            task.status === 'IN_PROGRESS' ? t('common.inProgress') :
            t('common.pending'),
    statusType: task.status === 'COMPLETED' ? 'success' as const :
                task.status === 'IN_PROGRESS' ? 'warning' as const :
                'default' as const,
    time: new Date(task.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    reason: task.reason,
    priority: task.priority || t('picking.normal'),
  }))

  const columns: TableColumn[] = [
    { key: 'returnId', label: t('returnPicking.returnId'), align: 'left' },
    { key: 'orderId', label: t('packing.orderId'), align: 'left' },
    { key: 'product', label: t('products.product'), align: 'left' },
    { key: 'reason', label: t('returns.reason'), align: 'center' },
    { key: 'location', label: t('returnPicking.location'), align: 'center' },
    { key: 'quantity', label: t('common.quantity'), align: 'right' },
    { key: 'pickedBy', label: t('returnPicking.picker'), align: 'left' },
    {
      key: 'priority',
      label: t('picking.priority'),
      align: 'center',
      render: (value) => {
        const colors: { [key: string]: string } = {
          [t('picking.high')]: '#ff4444',
          [t('picking.normal')]: '#333333',
          [t('picking.low')]: '#00b4d8',
        }
        return <span style={{ color: colors[value as string] || '#333333', fontWeight: 'bold' }}>{value}</span>
      },
    },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('returnPicking.overview')}>
        <Grid columns={4} gap="md">
          {statsDisplay.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('returnPicking.tasks')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('common.filter')}
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('returnPicking.assignPick')}</Button>
          <Button variant="secondary" size="md">{t('picking.printLabels')}</Button>
          <Button variant="secondary" size="md">{t('returns.exportReport')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <Table columns={columns} data={returnPickingData} />
        )}
      </Section></PageWrapper>
  )
}
