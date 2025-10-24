'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Select, Button, Grid, StatCard, Card } from '@/components/UI'

interface WeeklyReport {
  totalRevenue: number
  ordersProcessed: number
  avgOrderValue: number
  growthRate: number
}

export default function AnalysisReportPage() {
  const t = useTranslations()
  const [timePeriod, setTimePeriod] = useState('month')
  const [reportData, setReportData] = useState<WeeklyReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWeeklyReport = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/reports/weekly')
        const result = await response.json()

        if (result.success) {
          setReportData(result.data)
        }
      } catch (error) {
        console.error('Error fetching weekly report:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeeklyReport()
  }, [timePeriod])

  const periodOptions = [
    { value: 'week', label: t('reports.last7Days') },
    { value: 'month', label: t('reports.last30Days') },
    { value: 'quarter', label: t('reports.lastQuarter') },
    { value: 'year', label: t('reports.lastYear') },
  ]

  const stats = [
    { label: t('reports.totalRevenue'), value: `$${(reportData?.totalRevenue || 0).toLocaleString()}`, subtitle: t('reports.last30Days') },
    { label: t('reports.ordersProcessed'), value: (reportData?.ordersProcessed || 0).toLocaleString(), subtitle: t('reports.last30Days') },
    { label: t('reports.avgOrderValue'), value: `$${reportData?.avgOrderValue || 0}`, subtitle: t('reports.last30Days') },
    { label: t('reports.growthRate'), value: `+${reportData?.growthRate || 0}%`, subtitle: t('reports.vsLastPeriod') },
  ]

  const trends = [
    { metric: t('reports.revenueTrend'), current: '$1.2M', previous: '$1.07M', change: '+12.1%', status: 'up' },
    { metric: t('reports.orderVolume'), current: '8,543', previous: '7,623', change: '+12.1%', status: 'up' },
    { metric: t('reports.returnRate'), current: '2.8%', previous: '3.2%', change: '-12.5%', status: 'down' },
    { metric: t('reports.customerSatisfaction'), current: '4.7/5', previous: '4.5/5', change: '+4.4%', status: 'up' },
  ]

  return (
    <PageWrapper>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
      ) : (
        <>
          <Section title={t('reports.performanceAnalysis')}>
            <div style={{ marginBottom: '24px' }}>
              <Select
                label={t('reports.timePeriod')}
                options={periodOptions}
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              />
            </div>
            <Grid columns={4} gap="md">
              {stats.map((stat, index) => (
                <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
              ))}
            </Grid>
          </Section>

      <Section title={t('reports.keyTrends')}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {trends.map((trend, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8f8f8', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{trend.metric}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {t('reports.current')}: {trend.current} | {t('reports.previous')}: {trend.previous}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: trend.status === 'up' ? '#666' : '#999' }}>
                    {trend.change}
                  </span>
                  <span style={{ fontSize: '20px' }}>
                    {trend.status === 'up' ? '📈' : '📉'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title={t('reports.insights')}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8f8f8', borderRadius: '6px', borderLeft: '4px solid #666' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{t('reports.strongPerformance')}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {t('reports.strongPerformanceDesc')}
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8f8f8', borderRadius: '6px', borderLeft: '4px solid #999' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{t('reports.improvedReturns')}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {t('reports.improvedReturnsDesc')}
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8f8f8', borderRadius: '6px', borderLeft: '4px solid #666' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{t('reports.customerSatisfaction')}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {t('reports.customerSatisfactionDesc')}
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section title={t('reports.reportActions')}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" size="md">{t('reports.generatePDF')}</Button>
          <Button variant="secondary" size="md">{t('reports.emailReport')}</Button>
          <Button variant="secondary" size="md">{t('reports.scheduleReport')}</Button>
          <Button variant="secondary" size="md">{t('reports.exportData')}</Button>
        </div>
      </Section>
        </>
      )}
    </PageWrapper>
  )
}
