'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { StatCard, Grid, Section, Table, Button, Badge, Card } from '@/components/UI'
import { TableColumn } from '@/components/UI'
import Link from 'next/link'

export default function DashboardPage() {
  const t = useTranslations()
  const [inboundStats, setInboundStats] = useState({
    scheduled: 0,
    pendingApproval: 0,
    inProgress: 0,
    todayInbound: 0,
  })
  const [outboundStats, setOutboundStats] = useState({
    awaitingPicking: 0,
    pickingInProgress: 0,
    awaitingPacking: 0,
    todayShipment: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const result = await response.json()

        if (result.success) {
          setInboundStats(result.data.inbound)
          setOutboundStats(result.data.outbound)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])
  
  const todayStats = [
    { label: t('dashboard.stats.totalOrders'), value: '287', subtitle: t('common.today') },
    { label: t('dashboard.stats.revenue'), value: '$45.6K', subtitle: t('common.today') },
    { label: t('nav.picking'), value: '95', subtitle: t('dashboard.stats.inProgress') },
    { label: t('nav.returns'), value: '12', subtitle: t('dashboard.stats.pending') },
  ]

  const inboundStatsData = [
    { label: '입고 예정', value: isLoading ? '-' : inboundStats.scheduled.toString(), subtitle: '건' },
    { label: '승인 대기', value: isLoading ? '-' : inboundStats.pendingApproval.toString(), subtitle: '건' },
    { label: '입고 진행중', value: isLoading ? '-' : inboundStats.inProgress.toString(), subtitle: '건' },
    { label: '오늘 입고', value: isLoading ? '-' : inboundStats.todayInbound.toString(), subtitle: '건' },
  ]

  const outboundStatsData = [
    { label: '피킹 대기', value: isLoading ? '-' : outboundStats.awaitingPicking.toString(), subtitle: '건' },
    { label: '피킹 진행중', value: isLoading ? '-' : outboundStats.pickingInProgress.toString(), subtitle: '건' },
    { label: '패킹 대기', value: isLoading ? '-' : outboundStats.awaitingPacking.toString(), subtitle: '건' },
    { label: '오늘 출고', value: isLoading ? '-' : outboundStats.todayShipment.toString(), subtitle: '건' },
  ]

  const quickStats = [
    { label: t('dashboard.stats.warehouseUtilization'), value: '78%', subtitle: t('dashboard.stats.occupied') },
    { label: t('dashboard.stats.onTimeDelivery'), value: '97.8%', subtitle: t('dashboard.stats.rate') },
    { label: t('dashboard.stats.workerEfficiency'), value: '92%', subtitle: t('dashboard.stats.average') },
    { label: t('dashboard.stats.systemUptime'), value: '99.9%', subtitle: t('dashboard.stats.availability') },
  ]

  const workSummaryData = [
    { item: t('nav.inboundOutbound'), status: t('dashboard.stats.inProgress'), statusType: 'warning' as const, count: 48, link: '/inbound-outbound' },
    { item: t('nav.picking'), status: t('dashboard.stats.inProgress'), statusType: 'warning' as const, count: 95, link: '/picking' },
    { item: t('nav.packing'), status: t('common.active'), statusType: 'success' as const, count: 73, link: '/packing' },
    { item: t('nav.returns'), status: t('dashboard.stats.processing'), statusType: 'warning' as const, count: 12, link: '/returns/request' },
  ]

  const modules = [
    { title: t('nav.inbound'), items: [
      { name: t('nav.inboundSchedule'), link: '/inbound/schedule' },
      { name: t('nav.inboundApproval'), link: '/inbound/approval' },
    ]},
    { title: t('nav.outbound'), items: [
      { name: t('nav.pickingMgmt'), link: '/picking' },
      { name: t('nav.packingMgmt'), link: '/packing' },
    ]},
    { title: t('nav.inventory'), items: [
      { name: t('nav.products'), link: '/products' },
      { name: t('nav.warehouse'), link: '/warehouse' },
      { name: t('nav.stockStatus'), link: '/stock-status' },
      { name: t('nav.stockSettings'), link: '/stock-settings' },
    ]},
    { title: t('dashboard.operations'), items: [
      { name: t('nav.inboundOutbound'), link: '/inbound-outbound' },
      { name: t('nav.advancedInventory'), link: '/advanced-inventory' },
      { name: t('nav.workers'), link: '/workers' },
      { name: t('nav.returnPicking'), link: '/return-picking' },
    ]},
    { title: t('dashboard.returnsShipping'), items: [
      { name: t('nav.returnRequest'), link: '/returns/request' },
      { name: t('nav.returnProcess'), link: '/returns/process' },
      { name: t('nav.returnStatus'), link: '/returns/status' },
      { name: t('nav.shipments'), link: '/shipping' },
      { name: t('nav.shippingSettings'), link: '/shipping/settings' },
    ]},
    { title: t('dashboard.managementReports'), items: [
      { name: t('nav.currentReport'), link: '/reports/current' },
      { name: t('nav.analysisReport'), link: '/reports/analysis' },
      { name: t('nav.systemRules'), link: '/system/rules' },
    ]},
  ]

  const workSummaryColumns: TableColumn[] = [
    { key: 'item', label: t('dashboard.table.operation'), align: 'left' },
    { key: 'status', label: t('common.status'), align: 'left', render: (value, row) => <Badge type={row.statusType}>{value}</Badge> },
    { key: 'count', label: t('dashboard.table.count'), align: 'right' },
    { key: 'link', label: t('common.actions'), align: 'center', render: (value) => <Link href={value as string}><Button size="sm" variant="secondary">{t('common.view')}</Button></Link> },
  ]

  return (
    <PageWrapper>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333333', marginBottom: '8px' }}>{t('dashboard.title')}</h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>{t('dashboard.subtitle')}</p>
      </div>
      <Section title={t('dashboard.todayPerformance')}>
        <Grid columns={4} gap="md">{todayStats.map((stat, index) => <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />)}</Grid>
      </Section>
      <Section title="📦 입고 현황">
        <Grid columns={4} gap="md">{inboundStatsData.map((stat, index) => <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />)}</Grid>
      </Section>
      <Section title="📤 출고 현황">
        <Grid columns={4} gap="md">{outboundStatsData.map((stat, index) => <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />)}</Grid>
      </Section>
      <Section title={t('dashboard.systemHealth')}>
        <Grid columns={4} gap="md">{quickStats.map((stat, index) => <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />)}</Grid>
      </Section>
      <Section title={t('dashboard.activeOperations')}>
        <Table columns={workSummaryColumns} data={workSummaryData} />
      </Section>
      <Section title={t('dashboard.quickAccess')}>
        <Grid columns={2} gap="lg">
          {modules.map((module, index) => (
            <Card key={index}>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#333333' }}>{module.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {module.items.map((item, itemIndex) => (
                    <Link key={itemIndex} href={item.link} style={{ textDecoration: 'none' }}>
                      <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', color: '#333333', fontWeight: '500' }} className="nav-item">→ {item.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>
    </PageWrapper>
  )
}
