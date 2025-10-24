'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Input, Select, Button, Card, Grid } from '@/components/UI'

export default function StockSettingsPage() {
  const t = useTranslations()
  const [minStockLevel, setMinStockLevel] = useState('10')
  const [maxStockLevel, setMaxStockLevel] = useState('1000')
  const [reorderPoint, setReorderPoint] = useState('50')
  const [reorderQuantity, setReorderQuantity] = useState('200')
  const [leadTime, setLeadTime] = useState('7')
  const [stockMethod, setStockMethod] = useState('fifo')

  const methodOptions = [
    { value: 'fifo', label: 'FIFO' },
    { value: 'lifo', label: 'LIFO' },
    { value: 'fefo', label: 'FEFO' },
  ]

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
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('stockSettings.overstockAlerts')}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{t('stockSettings.overstockDesc')}</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('stockSettings.expiryAlerts')}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{t('stockSettings.expiryDesc')}</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
            </div>
          </div>
        </Card>
      </Section>
    </PageWrapper>
  )
}
