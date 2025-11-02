'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface DailyReport {
  totalOrders: number
  totalRevenue: number
  itemsShipped: number
  returns: number
}

export default function CurrentReportPage() {
  const t = useTranslations()
  const [reportData, setReportData] = useState<DailyReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDailyReport = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/reports/daily')
        const result = await response.json()

        if (result.success) {
          setReportData(result.data)
        }
      } catch (error) {
        console.error('Error fetching daily report:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailyReport()
    
    // 5분마다 자동 새로고침
    const interval = setInterval(fetchDailyReport, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { label: t('dashboard.stats.totalOrders'), value: reportData?.totalOrders?.toString() || '0', subtitle: t('reports.today') },
    { label: t('dashboard.stats.revenue'), value: `$${reportData?.totalRevenue?.toLocaleString() || '0'}`, subtitle: t('reports.today') },
    { label: t('reports.itemsShipped'), value: reportData?.itemsShipped?.toString() || '0', subtitle: t('reports.today') },
    { label: t('returns.returns'), value: reportData?.returns?.toString() || '0', subtitle: t('reports.today') },
  ]

  const warehouseActivity = [
    {
      warehouse: 'WH-1 Main',
      inbound: 145,
      outbound: 189,
      picking: 78,
      packing: 65,
      utilization: '87%',
    },
    {
      warehouse: 'WH-2 North',
      inbound: 89,
      outbound: 112,
      picking: 45,
      packing: 38,
      utilization: '72%',
    },
    {
      warehouse: 'WH-3 South',
      inbound: 67,
      outbound: 95,
      picking: 34,
      packing: 29,
      utilization: '65%',
    },
  ]

  const topProducts = [
    { rank: 1, product: 'Wireless Mouse', sku: 'ELEC-001', sold: 156, revenue: '$4,668' },
    { rank: 2, product: 'USB-C Cable', sku: 'ELEC-089', sold: 234, revenue: '$2,338' },
    { rank: 3, product: 'Office Chair', sku: 'FURN-023', sold: 45, revenue: '$8,550' },
    { rank: 4, product: 'Organic Coffee', sku: 'FOOD-012', sold: 123, revenue: '$1,598' },
  ]

  const warehouseColumns: TableColumn[] = [
    { key: 'warehouse', label: t('warehouse.warehouse'), align: 'left' },
    { key: 'inbound', label: t('inboundOutbound.inbound'), align: 'right' },
    { key: 'outbound', label: t('inboundOutbound.outbound'), align: 'right' },
    { key: 'picking', label: t('picking.picking'), align: 'right' },
    { key: 'packing', label: t('packing.packing'), align: 'right' },
    { key: 'utilization', label: t('reports.utilization'), align: 'right' },
  ]

  const productColumns: TableColumn[] = [
    { key: 'rank', label: '#', align: 'center' },
    { key: 'product', label: t('products.product'), align: 'left' },
    { key: 'sku', label: t('products.sku'), align: 'left' },
    { key: 'sold', label: t('reports.unitsSold'), align: 'right' },
    { key: 'revenue', label: t('dashboard.stats.revenue'), align: 'right' },
  ]

  return (
    <PageWrapper>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
      ) : (
        <>
          <Section title={t('reports.todayPerformance')}>
            <Grid columns={4} gap="md">
              {stats.map((stat, index) => (
                <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
              ))}
            </Grid>
          </Section>

          <Section title={t('reports.warehouseActivity')}>
            <Table columns={warehouseColumns} data={warehouseActivity} />
          </Section>

          <Section title={t('reports.topProductsToday')}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <Button variant="primary" size="md">{t('reports.downloadReport')}</Button>
              <Button variant="secondary" size="md">{t('reports.exportExcel')}</Button>
              <Button variant="secondary" size="md">{t('common.refresh')}</Button>
            </div>
            <Table columns={productColumns} data={topProducts} />
          </Section>
        </>
      )}
    </PageWrapper>
  )
}
