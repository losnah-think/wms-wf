'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface Transaction {
  id: string
  type: 'INBOUND' | 'OUTBOUND'
  productId: string
  productName: string
  quantity: number
  status: string
  createdAt: string
}

export default function InboundOutboundPage() {
  const t = useTranslations()
  const [selectedType, setSelectedType] = useState('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    todayInbound: 0,
    todayOutbound: 0,
    pending: 0,
    completed: 0,
  })

  const typeOptions = [
    { value: 'all', label: t('inboundOutbound.allTransactions') },
    { value: 'INBOUND', label: t('inboundOutbound.inboundOnly') },
    { value: 'OUTBOUND', label: t('inboundOutbound.outboundOnly') },
  ]

  // API에서 입출고 데이터 가져오기
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedType !== 'all') params.append('type', selectedType)

        const response = await fetch(`/api/inbound-outbound?${params}`)
        const result = await response.json()

        if (result.success) {
          setTransactions(result.data || [])

          // 통계 계산
          const inbound = result.data.filter((t: Transaction) => t.type === 'INBOUND').length
          const outbound = result.data.filter((t: Transaction) => t.type === 'OUTBOUND').length
          const pending = result.data.filter((t: Transaction) => t.status === 'PENDING').length
          const completed = result.data.filter((t: Transaction) => t.status === 'COMPLETED').length

          setStats({
            todayInbound: inbound,
            todayOutbound: outbound,
            pending,
            completed,
          })
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
    
    // 1분마다 자동 새로고침
    const interval = setInterval(fetchTransactions, 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedType])

  const statsDisplay = [
    { label: t('inboundOutbound.todayInbound'), value: stats.todayInbound.toString(), subtitle: t('inboundOutbound.transactions') },
    { label: t('inboundOutbound.todayOutbound'), value: stats.todayOutbound.toString(), subtitle: t('inboundOutbound.transactions') },
    { label: t('common.pending'), value: stats.pending.toString(), subtitle: t('common.items') },
    { label: t('common.completed'), value: stats.completed.toString(), subtitle: t('common.today') },
  ]

  const transactionData = transactions.map((txn) => ({
    id: txn.id,
    type: txn.type === 'INBOUND' ? t('inboundOutbound.inbound') : t('inboundOutbound.outbound'),
    typeIcon: txn.type === 'INBOUND' ? '📥' : '📤',
    product: txn.productName,
    quantity: txn.quantity,
    time: new Date(txn.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    status: txn.status === 'COMPLETED' ? t('common.completed') : 
            txn.status === 'IN_PROGRESS' ? t('common.inProgress') : 
            t('common.pending'),
    statusType: txn.status === 'COMPLETED' ? 'success' as const :
                txn.status === 'IN_PROGRESS' ? 'warning' as const :
                'default' as const,
  }))

  const columns: TableColumn[] = [
    { key: 'id', label: t('inboundOutbound.transactionId'), align: 'left' },
    {
      key: 'type',
      label: t('inboundOutbound.type'),
      align: 'left',
      render: (value, row) => `${row.typeIcon} ${value}`,
    },
    { key: 'product', label: t('inboundOutbound.product'), align: 'left' },
    { key: 'quantity', label: t('common.quantity'), align: 'right' },
    { key: 'time', label: t('common.time'), align: 'center' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'center',
      render: () => <Button size="sm" variant="secondary">{t('common.view')}</Button>,
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('inboundOutbound.overview')}>
        <Grid columns={4} gap="md">
          {statsDisplay.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('inboundOutbound.recentTransactions')}>
        <div style={{ marginBottom: '24px' }}>
          <Select
            label={t('inboundOutbound.filterByType')}
            options={typeOptions}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <Table columns={columns} data={transactionData} />
        )}
      </Section>
    </PageWrapper>
  )
}
