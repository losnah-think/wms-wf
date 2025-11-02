'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, SearchBar, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface ReturnStatus {
  id: string
  returnRequestId: string
  orderId: string
  customerName: string
  productName: string
  status: string
  createdAt: string
  processedAt?: string
  refundAmount: number
  resolution?: string
}

export default function ReturnStatusPage() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [statuses, setStatuses] = useState<ReturnStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  })

  // API에서 반품 상태 데이터 가져오기
  useEffect(() => {
    const fetchReturnStatus = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)

        const response = await fetch(`/api/returns/status?${params}`)
        const result = await response.json()

        if (result.success) {
          setStatuses(result.data || [])

          // 통계 계산
          const total = result.data.length
          const approved = result.data.filter((r: ReturnStatus) => r.status === 'APPROVED').length
          const rejected = result.data.filter((r: ReturnStatus) => r.status === 'REJECTED').length
          const pending = result.data.filter((r: ReturnStatus) => r.status === 'PENDING').length

          setStats({
            total,
            approved,
            rejected,
            pending,
          })
        }
      } catch (error) {
        console.error('Error fetching return status data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchReturnStatus, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const statsDisplay = [
    { label: t('returns.totalReturns'), value: stats.total.toString(), subtitle: t('returns.thisMonth') },
    { label: t('returns.approved'), value: stats.approved.toString(), subtitle: t('dashboard.returns') },
    { label: t('returns.rejected'), value: stats.rejected.toString(), subtitle: t('dashboard.returns') },
    { label: t('common.pending'), value: stats.pending.toString(), subtitle: t('dashboard.returns') },
  ]

  const statusData = statuses.map((status) => {
    const daysToProcess = status.processedAt 
      ? Math.floor((new Date(status.processedAt).getTime() - new Date(status.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : '-'

    return {
      returnId: `RET-${status.id.substring(0, 8)}`,
      orderId: status.orderId,
      customer: status.customerName,
      product: status.productName,
      requestDate: new Date(status.createdAt).toLocaleDateString('ko-KR'),
      processDate: status.processedAt ? new Date(status.processedAt).toLocaleDateString('ko-KR') : '-',
      daysToProcess: daysToProcess.toString(),
      status: status.status === 'APPROVED' ? t('returns.approved') :
              status.status === 'REJECTED' ? t('returns.rejected') :
              t('common.pending'),
      statusType: status.status === 'APPROVED' ? 'success' as const :
                  status.status === 'REJECTED' ? 'danger' as const :
                  'warning' as const,
      refundAmount: `$${status.refundAmount.toFixed(2)}`,
      resolution: status.resolution || t('common.pending'),
    }
  })

  const columns: TableColumn[] = [
    { key: 'returnId', label: t('returns.returnId'), align: 'left' },
    { key: 'orderId', label: t('packing.orderId'), align: 'left' },
    { key: 'customer', label: t('returns.customer'), align: 'left' },
    { key: 'product', label: t('products.product'), align: 'left' },
    { key: 'requestDate', label: t('returns.requestDate'), align: 'center' },
    { key: 'processDate', label: t('returns.processDate'), align: 'center' },
    { key: 'daysToProcess', label: t('returns.days'), align: 'right' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
    { key: 'refundAmount', label: t('returns.refund'), align: 'right' },
    { key: 'resolution', label: t('returns.resolution'), align: 'center' },
  ]

  return (
    <PageWrapper>
      <Section title={t('returns.statusOverview')}>
        <Grid columns={4} gap="md">
          {statsDisplay.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('returns.returnStatus')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <SearchBar
              placeholder={t('returns.searchPlaceholder')}
              onSearch={setSearchQuery}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('returns.exportReport')}</Button>
          <Button variant="secondary" size="md">{t('picking.printLabels')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <Table columns={columns} data={statusData} />
        )}
      </Section>
    </PageWrapper>
  )
}
