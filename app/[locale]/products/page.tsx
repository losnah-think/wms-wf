'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Input, Select, Badge, Grid, Card, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function ProductsPage() {
  const t = useTranslations()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categoryOptions = [
    { value: 'all', label: t('products.allCategories') },
    { value: 'electronics', label: t('products.categories.electronics') },
    { value: 'furniture', label: t('products.categories.furniture') },
    { value: 'clothing', label: t('products.categories.clothing') },
    { value: 'food', label: t('products.categories.food') },
  ]

  const productStats = [
    { label: t('products.totalProducts'), value: '1,247', subtitle: t('common.items') },
    { label: t('common.active'), value: '1,180', subtitle: t('products.inStock') },
    { label: t('products.lowStock'), value: '45', subtitle: t('common.items') },
    { label: t('products.outOfStock'), value: '22', subtitle: t('common.items') },
  ]

  const productData = [
    {
      sku: 'ELEC-001',
      name: 'Wireless Mouse',
      category: t('products.categories.electronics'),
      price: 29.99,
      stock: 145,
      status: t('common.active'),
      statusType: 'success' as const,
    },
    {
      sku: 'FURN-023',
      name: 'Office Chair',
      category: t('products.categories.furniture'),
      price: 189.99,
      stock: 8,
      status: t('products.lowStock'),
      statusType: 'warning' as const,
    },
    {
      sku: 'CLOT-045',
      name: 'Cotton T-Shirt',
      category: t('products.categories.clothing'),
      price: 19.99,
      stock: 0,
      status: t('products.outOfStock'),
      statusType: 'danger' as const,
    },
    {
      sku: 'FOOD-012',
      name: 'Organic Coffee',
      category: t('products.categories.food'),
      price: 12.99,
      stock: 234,
      status: t('common.active'),
      statusType: 'success' as const,
    },
    {
      sku: 'ELEC-089',
      name: 'USB-C Cable',
      category: t('products.categories.electronics'),
      price: 9.99,
      stock: 456,
      status: t('common.active'),
      statusType: 'success' as const,
    },
  ]

  const columns: TableColumn[] = [
    { key: 'sku', label: t('products.sku'), align: 'left' },
    { key: 'name', label: t('products.productName'), align: 'left' },
    { key: 'category', label: t('products.category'), align: 'left' },
    { key: 'price', label: t('products.price'), align: 'right', render: (value) => `$${value}` },
    { key: 'stock', label: t('products.stock'), align: 'right' },
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
      render: () => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button size="sm" variant="secondary">{t('common.edit')}</Button>
        </div>
      ),
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('products.overview')}>
        <Grid columns={4} gap="md">
          {productStats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('products.catalog')}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('products.category')}
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Input
              label={t('common.search')}
              placeholder={t('products.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Table columns={columns} data={productData} />
      </Section>
    </PageWrapper>
  )
}
