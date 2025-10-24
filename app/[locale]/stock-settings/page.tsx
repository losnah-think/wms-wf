'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Input, Select, Button, Card, Grid } from '@/components/UI'

interface StockSettings {
  id: string
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  reorderQuantity: number
  leadTime: number
  stockMethod: string
  lowStockAlerts: boolean
  overstockAlerts: boolean
  expiryAlerts: boolean
  updatedAt: string
}

export default function StockSettingsPage() {
  const t = useTranslations()
  const [minStockLevel, setMinStockLevel] = useState('10')
  const [maxStockLevel, setMaxStockLevel] = useState('1000')
  const [reorderPoint, setReorderPoint] = useState('50')
  const [reorderQuantity, setReorderQuantity] = useState('200')
  const [leadTime, setLeadTime] = useState('7')
  const [stockMethod, setStockMethod] = useState('fifo')
  const [isLoading, setIsLoading] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState(true)
  const [overstockAlerts, setOverstockAlerts] = useState(true)
  const [expiryAlerts, setExpiryAlerts] = useState(true)

  const methodOptions = [
    { value: 'fifo', label: 'FIFO' },
    { value: 'lifo', label: 'LIFO' },
    { value: 'fefo', label: 'FEFO' },
  ]

  // Fetch stock settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/config/warehouse')
        const result = await response.json()

        if (result.success && result.data) {
          const settings = result.data[0] || {}
          setMinStockLevel(String(settings.minStockLevel || 10))
          setMaxStockLevel(String(settings.maxStockLevel || 1000))
          setReorderPoint(String(settings.reorderPoint || 50))
          setReorderQuantity(String(settings.reorderQuantity || 200))
          setLeadTime(String(settings.leadTime || 7))
          setStockMethod(settings.stockMethod || 'fifo')
          setLowStockAlerts(settings.lowStockAlerts !== false)
          setOverstockAlerts(settings.overstockAlerts !== false)
          setExpiryAlerts(settings.expiryAlerts !== false)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      const response = await fetch('/api/config/warehouse', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minStockLevel: parseInt(minStockLevel),
          maxStockLevel: parseInt(maxStockLevel),
          reorderPoint: parseInt(reorderPoint),
          reorderQuantity: parseInt(reorderQuantity),
          leadTime: parseInt(leadTime),
          stockMethod,
          lowStockAlerts,
          overstockAlerts,
          expiryAlerts,
        }),
      })

      const result = await response.json()
      if (result.success) {
        console.log('Settings saved successfully')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  return (
    <PageWrapper>
      <Section title={t('stockSettings.stockLevelSettings')}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Grid columns={2} gap="md">
              <Input
                label={t('stockSettings.minStockLevel')}
                type="number"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                placeholder={t('stockSettings.minQuantity')}
              />
              <Input
                label={t('stockSettings.maxStockLevel')}
                type="number"
                value={maxStockLevel}
                onChange={(e) => setMaxStockLevel(e.target.value)}
                placeholder={t('stockSettings.maxQuantity')}
              />
            </Grid>

            <Grid columns={2} gap="md">
              <Input
                label={t('stockSettings.reorderPoint')}
                type="number"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                placeholder={t('stockSettings.reorderThreshold')}
              />
              <Input
                label={t('stockSettings.reorderQuantity')}
                type="number"
                value={reorderQuantity}
                onChange={(e) => setReorderQuantity(e.target.value)}
                placeholder={t('stockSettings.quantityToReorder')}
              />
            </Grid>

            <Grid columns={2} gap="md">
              <Input
                label={t('stockSettings.leadTimeDays')}
                type="number"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                placeholder={t('stockSettings.deliveryLeadTime')}
              />
              <Select
                label={t('stockSettings.stockValuationMethod')}
                options={methodOptions}
                value={stockMethod}
                onChange={(e) => setStockMethod(e.target.value)}
              />
            </Grid>
          </div>
        </Card>
      </Section>

      <Section title={t('stockSettings.alertSettings')}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('stockSettings.lowStockAlerts')}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{t('stockSettings.lowStockDesc')}</div>
              </div>
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('stockSettings.overstockAlerts')}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{t('stockSettings.overstockDesc')}</div>
              </div>
              <input
                type="checkbox"
                checked={overstockAlerts}
                onChange={(e) => setOverstockAlerts(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('stockSettings.expiryAlerts')}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{t('stockSettings.expiryDesc')}</div>
              </div>
              <input
                type="checkbox"
                checked={expiryAlerts}
                onChange={(e) => setExpiryAlerts(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
            </div>
            <Button variant="primary" size="md" onClick={handleSave}>
              {t('common.save')}
            </Button>
          </div>
        </Card>
      </Section>
    </PageWrapper>
  )
}
