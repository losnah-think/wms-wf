'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Input, Select, Badge, Grid, Card, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface Product {
  id: string
  code: string
  name: string
  sku: string
  barcode?: string
  price: number
  totalStock: number
  availableStock: number
  category?: string
}

export default function ProductsPage() {
  const t = useTranslations()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const pageSize = 20

  const categoryOptions = [
    { value: 'all', label: t('products.allCategories') },
    { value: 'electronics', label: t('products.categories.electronics') },
    { value: 'furniture', label: t('products.categories.furniture') },
    { value: 'clothing', label: t('products.categories.clothing') },
    { value: 'food', label: t('products.categories.food') },
  ]

  const searchTypeOptions = [
    { value: 'all', label: '전체' },
    { value: 'code', label: '상품코드' },
    { value: 'name', label: '상품명' },
    { value: 'sku', label: 'SKU' },
  ]

  // API에서 상품 데이터 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
        })
        
        if (searchQuery) {
          params.append('search', searchQuery)
          params.append('searchType', searchType)
        }

        const response = await fetch(`/api/products?${params}`)
        const result = await response.json()

        if (result.success) {
          setProducts(result.data.products)
          setTotalProducts(result.data.total)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, searchQuery, searchType])

  // 통계 계산
  const productStats = [
    { label: t('products.totalProducts'), value: totalProducts.toString(), subtitle: t('common.items') },
    { label: t('common.active'), value: products.filter(p => p.totalStock > 0).length.toString(), subtitle: t('products.inStock') },
    { label: t('products.lowStock'), value: products.filter(p => p.totalStock > 0 && p.totalStock < 10).length.toString(), subtitle: t('common.items') },
    { label: t('products.outOfStock'), value: products.filter(p => p.totalStock === 0).length.toString(), subtitle: t('common.items') },
  ]

  const productData = products.map(product => ({
    sku: product.sku || product.code,
    name: product.name,
    category: product.category || '-',
    price: product.price || 0,
    stock: product.totalStock,
    available: product.availableStock,
    status: product.totalStock === 0 ? t('products.outOfStock') : product.totalStock < 10 ? t('products.lowStock') : t('common.active'),
    statusType: product.totalStock === 0 ? 'danger' as const : product.totalStock < 10 ? 'warning' as const : 'success' as const,
  }))

  const columns: TableColumn[] = [
    { key: 'sku', label: t('products.sku'), align: 'left' },
    { key: 'name', label: t('products.productName'), align: 'left' },
    { key: 'category', label: t('products.category'), align: 'left' },
    { key: 'price', label: t('products.price'), align: 'right', render: (value) => `$${Number(value).toFixed(2)}` },
    { key: 'stock', label: t('products.stock'), align: 'right' },
    { key: 'available', label: '가용재고', align: 'right' },
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

  const handleSearch = () => {
    setCurrentPage(1) // 검색 시 첫 페이지로
  }

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
          <div style={{ minWidth: '150px' }}>
            <Select
              label="검색 유형"
              options={searchTypeOptions}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Input
              label={t('common.search')}
              placeholder={t('products.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div style={{ paddingTop: '24px' }}>
            <Button onClick={handleSearch}>{t('common.search')}</Button>
          </div>
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <>
            <Table columns={columns} data={productData} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <div>
                총 {totalProducts}개 상품 (페이지 {currentPage})
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={products.length < pageSize}
                >
                  다음
                </Button>
              </div>
            </div>
          </>
        )}
      </Section>
    </PageWrapper>
  )
}
