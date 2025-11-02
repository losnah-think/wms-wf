'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard, Input } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface InventoryMovement {
  id: string
  type: string
  productName: string
  from: string
  to: string
  quantity: number
  reason: string
  status: string
  createdAt: string
}

export default function AdvancedInventoryPage() {
  const t = useTranslations()
  const [selectedMovement, setSelectedMovement] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [movementData, setMovementData] = useState<InventoryMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    transfers: 0,
    adjustments: 0,
    cycleCounts: 0,
    discrepancies: 0,
  })

  const movementOptions = [
    { value: 'all', label: t('advancedInventory.allMovements') },
    { value: 'transfer', label: t('advancedInventory.transfers') },
    { value: 'adjustment', label: t('advancedInventory.adjustments') },
    { value: 'cycle-count', label: t('advancedInventory.cycleCounts') },
  ]

  // Fetch inventory movement data from API
  useEffect(() => {
    const fetchMovements = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedMovement !== 'all') params.append('type', selectedMovement)
        if (searchQuery) params.append('search', searchQuery)

        const response = await fetch(`/api/stock/movement?${params}`)
        const result = await response.json()

        if (result.success) {
          const items = result.data || []
          setMovementData(items)

          // Calculate stats from API data
          const transferCount = items.filter((item: InventoryMovement) => item.type === 'transfer').length
          const adjustmentCount = items.filter((item: InventoryMovement) => item.type === 'adjustment').length
          const cycleCountCount = items.filter((item: InventoryMovement) => item.type === 'cycle-count').length
          const discrepancyCount = items.filter((item: InventoryMovement) => Math.abs(item.quantity) > 100).length

          setStats({
            transfers: transferCount,
            adjustments: adjustmentCount,
            cycleCounts: cycleCountCount,
            discrepancies: discrepancyCount,
          })
        }
      } catch (error) {
        console.error('Error fetching movements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovements()
    const interval = setInterval(fetchMovements, 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedMovement, searchQuery])

  const getStatusType = (status: string) => {
    if (status === 'completed') return 'success'
    if (status === 'in-progress' || status === 'active') return 'warning'
    if (status === 'pending') return 'default'
    return 'danger'
  }

  const statsDisplay = [
    { label: t('advancedInventory.transfersToday'), value: String(stats.transfers), subtitle: t('advancedInventory.movements') },
    { label: t('advancedInventory.adjustments'), value: String(stats.adjustments), subtitle: t('advancedInventory.corrections') },
    { label: t('advancedInventory.cycleCounts'), value: String(stats.cycleCounts), subtitle: t('common.completed') },
    { label: t('advancedInventory.discrepancies'), value: String(stats.discrepancies), subtitle: t('common.items') },
  ]

  const filteredData = movementData.filter((item) =>
    !searchQuery ||
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: TableColumn[] = [
    { key: 'id', label: t('advancedInventory.movementId'), align: 'left' },
    { key: 'type', label: t('inboundOutbound.type'), align: 'left' },
    { key: 'productName', label: t('products.product'), align: 'left' },
    { key: 'from', label: t('advancedInventory.from'), align: 'left' },
    { key: 'to', label: t('advancedInventory.to'), align: 'left' },
    {
      key: 'quantity',
      label: t('common.quantity'),
      align: 'right',
      render: (value) => value > 0 ? `+${value}` : value,
    },
    { key: 'reason', label: t('advancedInventory.reason'), align: 'left' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value) => <Badge type={getStatusType(value)}>{value}</Badge>,
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('advancedInventory.overview')}>
        <Grid columns={4} gap="md">
          {statsDisplay.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('advancedInventory.movementHistory')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('advancedInventory.movementType')}
              options={movementOptions}
              value={selectedMovement}
              onChange={(e) => setSelectedMovement(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Input
              label={t('common.search')}
              placeholder={t('advancedInventory.searchMovements')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Table columns={columns} data={filteredData} />
      </Section>
    </PageWrapper>
  )
}
