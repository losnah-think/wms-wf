'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, SearchBar, Badge } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface StockItem {
  id: string
  productName: string
  barcode: string
  quantity: number
  available: number
  warehouse: string
  status: string
  createdAt: string
}

export default function StockStatusPage() {
  const t = useTranslations()
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stockData, setStockData] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  })

  // Warehouse options
  const warehouseOptions = [
    { value: 'all', label: t('warehouse.allWarehouses') },
    { value: 'wh-1', label: t('warehouse.warehouse') + ' 1' },
    { value: 'wh-2', label: t('warehouse.warehouse') + ' 2' },
    { value: 'wh-3', label: t('warehouse.warehouse') + ' 3' },
  ]

  // Fetch stock data from API
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedWarehouse !== 'all') params.append('warehouse', selectedWarehouse)
        if (searchQuery) params.append('search', searchQuery)

        const response = await fetch(`/api/stock/status?${params}`)
        const result = await response.json()

        if (result.success) {
          const items = result.data || []
          setStockData(items)

          // Calculate stats from API data
          const inStockCount = items.filter((item: StockItem) => item.quantity > 0 && item.available > 0).length
          const lowStockCount = items.filter((item: StockItem) => item.quantity > 0 && item.quantity <= 100).length
          const outOfStockCount = items.filter((item: StockItem) => item.quantity === 0).length

          setStats({
            inStock: inStockCount,
            lowStock: lowStockCount,
            outOfStock: outOfStockCount,
          })
        }
      } catch (error) {
        console.error('Error fetching stock data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStockData()
    const interval = setInterval(fetchStockData, 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedWarehouse, searchQuery])

  // Get status type for badge
  const getStatusType = (item: StockItem) => {
    if (item.quantity === 0) return 'danger'
    if (item.quantity <= 100) return 'warning'
    return 'success'
  }

  // Get status label
  const getStatusLabel = (item: StockItem) => {
    if (item.quantity === 0) return t('stockStatus.outOfStock')
    if (item.quantity <= 100) return t('stockStatus.lowStock')
    return t('stockStatus.inStock')
  }

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'productName',
      label: t('stockStatus.productName'),
      align: 'left',
    },
    {
      key: 'barcode',
      label: t('stockStatus.barcode'),
      align: 'left',
    },
    {
      key: 'quantity',
      label: t('common.quantity'),
      align: 'right',
    },
    {
      key: 'available',
      label: t('stockStatus.available'),
      align: 'right',
    },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center',
      render: (value, row) => (
        <Badge type={getStatusType(row)}>{getStatusLabel(row)}</Badge>
      ),
    },
  ]

  // Filter data based on search
  const filteredData = stockData.filter((item) =>
    !searchQuery ||
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageWrapper>
      <Section title={t('stockStatus.title')}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('warehouse.warehouse')}
              options={warehouseOptions}
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <SearchBar
              placeholder={t('stockStatus.searchPlaceholder')}
              onSearch={setSearchQuery}
            />
          </div>
        </div>

        {/* Stock Table */}
        <Table columns={columns} data={filteredData} />
      </Section>
    </PageWrapper>
  )
}
