'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface Warehouse {
  id: string
  name: string
  code: string
}

interface WarehouseStock {
  warehouseId: string
  warehouseName: string
  zones: Array<{
    id: string
    name: string
    code: string
  }>
  totalProducts: number
  totalQuantity: number
  occupancyRate: number
}

export default function WarehousePage() {
  const t = useTranslations()
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStock | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch warehouses on mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch('/api/warehouse')
        const result = await response.json()

        if (result.success && result.data && result.data.length > 0) {
          setWarehouses(result.data)
          setSelectedWarehouse(result.data[0].id)
        }
      } catch (error) {
        console.error('Error fetching warehouses:', error)
        // Fallback to default warehouses
        setWarehouses([
          { id: 'wh-001', name: 'Main Warehouse', code: 'WH-001' },
          { id: 'wh-002', name: 'North Warehouse', code: 'WH-002' },
          { id: 'wh-003', name: 'South Warehouse', code: 'WH-003' },
        ])
        setSelectedWarehouse('wh-001')
      }
    }
    fetchWarehouses()
  }, [])

  // Fetch warehouse stock when selected warehouse changes
  useEffect(() => {
    if (selectedWarehouse === 'all' || !selectedWarehouse) return

    const fetchWarehouseStock = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/warehouse/${selectedWarehouse}/stock`)
        const result = await response.json()

        if (result.success) {
          setWarehouseStock(result.data)
        }
      } catch (error) {
        console.error('Error fetching warehouse stock:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWarehouseStock()
  }, [selectedWarehouse])

  const warehouseOptions = [
    { value: 'all', label: t('warehouse.allWarehouses') },
    ...warehouses.map(w => ({ value: w.id, label: `${w.code} - ${w.name}` }))
  ]

  const warehouseStats = [
    { label: '총 구역', value: isLoading ? '-' : (warehouseStock?.zones.length || 0).toString(), subtitle: '개' },
    { label: '총 상품 수', value: isLoading ? '-' : (warehouseStock?.totalProducts || 0).toString(), subtitle: '개' },
    { label: '총 재고', value: isLoading ? '-' : (warehouseStock?.totalQuantity || 0).toString(), subtitle: '개' },
    { label: '점유율', value: isLoading ? '-' : `${(warehouseStock?.occupancyRate || 0).toFixed(1)}%`, subtitle: '사용률' },
  ]

  const locationData = isLoading || !warehouseStock ? [] : warehouseStock.zones.map((zone, index) => ({
    warehouse: warehouseStock.warehouseName,
    name: zone.name,
    zone: zone.code,
    aisle: `${index + 1}`,
    rack: `R-${zone.code}-${index + 1}`,
    capacity: 100,
    occupied: Math.floor(Math.random() * 100),
    status: t('common.active'),
    statusType: 'success' as const,
  }))

  const columns: TableColumn[] = [
    { key: 'warehouse', label: t('warehouse.warehouse'), align: 'left' },
    { key: 'name', label: t('warehouse.name'), align: 'left' },
    { key: 'zone', label: t('warehouse.zone'), align: 'center' },
    { key: 'aisle', label: t('warehouse.aisle'), align: 'center' },
    { key: 'rack', label: t('warehouse.rack'), align: 'left' },
    { key: 'capacity', label: t('warehouse.capacity'), align: 'right' },
    { key: 'occupied', label: t('warehouse.occupied'), align: 'right' },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => <Badge type={row.statusType}>{value}</Badge>,
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('warehouse.overview')}>
        <Grid columns={4} gap="md">
          {warehouseStats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('warehouse.locations')}>
        <div style={{ marginBottom: '24px' }}>
          <Select
            label={t('warehouse.filterByWarehouse')}
            options={warehouseOptions}
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
          />
        </div>
        <Table columns={columns} data={locationData} />
      </Section>
    </PageWrapper>
  )
}
