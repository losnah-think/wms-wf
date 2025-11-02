'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface ExternalLink {
  id: string
  platform: 'CAFE24' | 'COUPANG' | 'NAVER' | 'OTHER'
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  syncedAt: string
  lastError?: string
}

export default function ExternalLinkPage() {
  const t = useTranslations()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [links, setLinks] = useState<ExternalLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeLinks: 0,
    inactiveLinks: 0,
    errorCount: 0,
    totalSynced: 0,
  })

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ERROR', label: 'Error' },
  ]

  // API에서 연동 정보 가져오기
  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedStatus !== 'all') params.append('status', selectedStatus)

        const response = await fetch(`/api/inbound-outbound?${params}`)
        const result = await response.json()

        if (result.success) {
          setLinks(result.data || [])

          // 통계 계산
          const active = result.data.filter((l: ExternalLink) => l.status === 'ACTIVE').length
          const inactive = result.data.filter((l: ExternalLink) => l.status === 'INACTIVE').length
          const errors = result.data.filter((l: ExternalLink) => l.status === 'ERROR').length

          setStats({
            activeLinks: active,
            inactiveLinks: inactive,
            errorCount: errors,
            totalSynced: result.data.length,
          })
        }
      } catch (error) {
        console.error('Error fetching links:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLinks()
    
    // 5분마다 자동 새로고침
    const interval = setInterval(fetchLinks, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedStatus])

  const statsDisplay = [
    { label: 'Active Links', value: stats.activeLinks.toString(), subtitle: 'connections' },
    { label: 'Inactive', value: stats.inactiveLinks.toString(), subtitle: 'links' },
    { label: 'Errors', value: stats.errorCount.toString(), subtitle: 'issues' },
    { label: 'Total Synced', value: stats.totalSynced.toString(), subtitle: 'platforms' },
  ]

  const linkData = links.map((link) => ({
    id: link.id,
    platform: link.platform,
    status: link.status === 'ACTIVE' ? 'Active' : link.status === 'INACTIVE' ? 'Inactive' : 'Error',
    statusType: link.status === 'ACTIVE' ? 'success' as const :
                link.status === 'INACTIVE' ? 'default' as const :
                'danger' as const,
    syncedAt: new Date(link.syncedAt).toLocaleString('ko-KR'),
    lastError: link.lastError || '-',
  }))

  const columns: TableColumn[] = [
    { key: 'platform', label: 'Platform', align: 'left' },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
    { key: 'syncedAt', label: 'Last Synced', align: 'center' },
    { key: 'lastError', label: 'Last Error', align: 'left' },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: () => <Button size="sm" variant="secondary">Settings</Button>,
    },
  ]

  return (
    <PageWrapper>
      <Section title="External Link Management">
        <Grid columns={4} gap="md">
          {statsDisplay.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title="Connected Platforms">
        <div style={{ marginBottom: '24px' }}>
          <Select
            label="Filter by Status"
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : (
          <Table columns={columns} data={linkData} />
        )}
      </Section>
    </PageWrapper>
  )
}
