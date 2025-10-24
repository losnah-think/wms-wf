'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface ReturnProcess {
  id: string
  returnRequestId: string
  orderId: string
  productId: string
  productName: string
  reason: string
  status: string
  condition: string
  inspectedBy?: string
  action?: string
  refundAmount: number
  createdAt: string
}

export default function ReturnProcessPage() {
  const t = useTranslations()
  const [selectedAction, setSelectedAction] = useState('all')
  const [processes, setProcesses] = useState<ReturnProcess[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    inspection: 0,
    processed: 0,
    restocked: 0,
  })

  const actionOptions = [
    { value: 'all', label: t('returns.allActions') },
    { value: 'INSPECTION', label: t('returns.inspection') },
    { value: 'RESTOCK', label: t('returns.restock') },
    { value: 'REFUND', label: t('returns.refund') },
    { value: 'DISCARD', label: t('returns.discard') },
  ]

  // API에서 반품 처리 데이터 가져오기
  useEffect(() => {
    const fetchReturnProcess = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedAction !== 'all') params.append('action', selectedAction)

        const response = await fetch(`/api/returns/process?${params}`)
        const result = await response.json()

        if (result.success) {
          setProcesses(result.data || [])

          // 통계 계산
          const pending = result.data.filter((r: ReturnProcess) => r.status === 'PENDING').length
          const inspection = result.data.filter((r: ReturnProcess) => r.status === 'INSPECTION').length
          const processed = result.data.filter((r: ReturnProcess) => r.status === 'COMPLETED').length

          setStats({
            pending,
            inspection,
            processed,
            restocked: Math.floor(processed * 0.9),
          })
        }
      } catch (error) {
        console.error('Error fetching return process data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReturnProcess()
    
    // 1분마다 자동 새로고침
    const interval = setInterval(fetchReturnProcess, 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedAction])

  const statsDisplay = [
    { label: t('returns.pendingProcessing'), value: stats.pending.toString(), subtitle: t('dashboard.returns') },
    { label: t('returns.inInspection'), value: stats.inspection.toString(), subtitle: t('common.items') },
    { label: t('returns.processedToday'), value: stats.processed.toString(), subtitle: t('dashboard.returns') },
    { label: t('returns.restocked'), value: stats.restocked.toString(), subtitle: t('common.items') },
  ]

  const processData = processes.map((process) => ({
    returnId: `RET-${process.id.substring(0, 8)}`,
    orderId: process.orderId,
    product: process.productName,
    reason: process.reason,
    inspectedBy: process.inspectedBy || t('common.pending'),
    action: process.action || t('common.pending'),
    actionType: process.action === 'REFUND' ? 'warning' as const :
                process.action === 'RESTOCK' ? 'success' as const :
                'default' as const,
    condition: process.condition,
    date: new Date(process.createdAt).toLocaleDateString('ko-KR'),
    refundAmount: `$${process.refundAmount.toFixed(2)}`,
  }))

  const columns: TableColumn[] = [
    { key: 'returnId', label: t('returns.returnId'), align: 'left' },
    { key: 'orderId', label: t('packing.orderId'), align: 'left' },
    { key: 'product', label: t('products.product'), align: 'left' },
    { key: 'reason', label: t('returns.reason'), align: 'left' },
    { key: 'condition', label: t('returns.condition'), align: 'center' },
    { key: 'inspectedBy', label: t('returns.inspectedBy'), align: 'left' },
    { key: 'refundAmount', label: t('returns.refund'), align: 'right' },
    {
      key: 'action',
      label: t('returns.action'),
      align: 'center',
      render: (value, row) => <Badge type={row.actionType}>{value}</Badge>,
    },
    { key: 'date', label: t('common.date'), align: 'center' },
  ]

  return (
    <PageWrapper>
      <Section title={t('returns.processingOverview')}>
        <Grid columns={4} gap="md">
          {statsDisplay.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('returns.processQueue')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('returns.filterByAction')}
              options={actionOptions}
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('returns.approveSelected')}</Button>
          <Button variant="secondary" size="md">{t('returns.inspect')}</Button>
          <Button variant="secondary" size="md">{t('returns.generateLabels')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <Table columns={columns} data={processData} />
        )}
      </Section>
    </PageWrapper>
  )
}
