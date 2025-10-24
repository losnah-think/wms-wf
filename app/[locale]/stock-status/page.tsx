'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, SearchBar, Badge } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function StockStatusPage() {
  const t = useTranslations()
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Warehouse options
  const warehouseOptions = [
    { value: 'all', label: t('warehouse.allWarehouses') },
    { value: 'wh-1', label: t('warehouse.warehouse') + ' 1' },
    { value: 'wh-2', label: t('warehouse.warehouse') + ' 2' },
    { value: 'wh-3', label: t('warehouse.warehouse') + ' 3' },
  ]

  // Stock data
  const stockData = [
    {
      productName: 'Widget A',
      barcode: 'WGT-001-2024',
      quantity: 1250,
      available: 1180,
      status: t('stockStatus.inStock'),
      statusType: 'success' as const,
    },
    {
      productName: 'Component B',
      barcode: 'CMP-002-2024',
      quantity: 450,
      available: 380,
      status: t('stockStatus.lowStock'),
      statusType: 'warning' as const,
    },
    {
      productName: 'Part C',
      barcode: 'PRT-003-2024',
      quantity: 0,
      available: 0,
      status: t('stockStatus.outOfStock'),
      statusType: 'danger' as const,
    },
    {
      productName: 'Assembly D',
      barcode: 'ASM-004-2024',
      quantity: 850,
      available: 850,
      status: t('stockStatus.inStock'),
      statusType: 'success' as const,
    },
  ]

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
        <Badge type={row.statusType}>{value}</Badge>
      ),
    },
  ]

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
        <Table columns={columns} data={stockData} />
      </Section>
    </PageWrapper>
  )
}
