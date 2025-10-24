'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard, Input } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface PickingOrder {
  orderId: string
  orderNumber: string
  orderDate: string
  expectedDelivery: string | null
  isUrgent: boolean
  totalQuantity: number
  itemCount: number
  waitingMinutes: number
  products: Array<{
    productId: string
    productCode: string
    productName: string
    quantity: number
  }>
}

export default function PickingPage() {
  const t = useTranslations()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedWorker, setSelectedWorker] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pickingOrders, setPickingOrders] = useState<PickingOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCount: 0,
    urgentCount: 0,
    normalCount: 0,
    averageWaitingMinutes: 0,
  })

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

  // API에서 피킹 대기열 데이터 가져오기
  useEffect(() => {
    const fetchPickingQueue = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          sortBy: 'orderDate',
          filter: selectedStatus === 'pending' ? 'all' : selectedStatus,
        })

        const response = await fetch(`/api/picking/queue?${params}`)
        const result = await response.json()

        if (result.success) {
          setPickingOrders(result.data.orders)
          setStats({
            totalCount: result.data.totalCount,
            urgentCount: result.data.urgentCount,
            normalCount: result.data.normalCount,
            averageWaitingMinutes: result.data.averageWaitingMinutes,
          })
        }
      } catch (error) {
        console.error('Error fetching picking queue:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPickingQueue()
    
    // 1분마다 자동 새로고침
    const interval = setInterval(fetchPickingQueue, 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedStatus])

  // 통계 데이터
  const statsData = [
    { label: '대기 주문', value: stats.totalCount.toString(), subtitle: t('common.pending') },
    { label: '긴급 주문', value: stats.urgentCount.toString(), subtitle: '2일 이내 배송' },
    { label: '일반 주문', value: stats.normalCount.toString(), subtitle: t('common.active') },
    { label: '평균 대기시간', value: `${stats.averageWaitingMinutes}분`, subtitle: t('picking.perItem') },
  ]

  // 피킹 데이터 변환
  const pickingData = pickingOrders.map(order => ({
    orderNumber: order.orderNumber,
    items: order.itemCount,
    assignedTo: 'Unassigned',
    status: order.isUrgent ? '긴급' : t('common.pending'),
    statusType: order.isUrgent ? 'danger' as const : 'default' as const,
    time: new Date(order.orderDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    zone: 'Zone A',
    priority: order.isUrgent ? t('picking.high') : t('picking.normal'),
    waitingTime: `${order.waitingMinutes}분`,
    orderId: order.orderId,
  }))

  // 작업 할당 핸들러
  const handleAssignTask = async (orderId: string, workerId: string) => {
    try {
      const response = await fetch('/api/picking/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          workerId: workerId || 'WORKER-001',
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('작업이 할당되었습니다.')
        // 목록 새로고침
        window.location.reload()
      } else {
        alert(`할당 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('Error assigning task:', error)
      alert('작업 할당 중 오류가 발생했습니다.')
    }
  }

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
      key: 'waitingTime',
      label: '대기시간',
      align: 'center',
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
      label: '접수시간',
      align: 'center',
    },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'center',
      render: (value, row) => (
        <Button 
          size="sm" 
          variant="primary"
          onClick={() => handleAssignTask(row.orderId, 'WORKER-001')}
        >
          할당
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('picking.pickingOverview')}>
        <Grid columns={4} gap="md">
          {statsData.map((stat, index) => (
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
          <Button variant="secondary" size="md" onClick={() => window.location.reload()}>{t('common.refresh')}</Button>
        </div>

        {/* Picking Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <Table columns={columns} data={pickingData} />
        )}
      </Section>
    </PageWrapper>
  )
}
