'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Input, Select, Button, Card, Grid } from '@/components/UI'

export default function ShippingSettingsPage() {
  const t = useTranslations()
  const [defaultCarrier, setDefaultCarrier] = useState('ups')
  const [packageWeight, setPackageWeight] = useState('1.0')
  const [handlingTime, setHandlingTime] = useState('24')
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('50')

  const carrierOptions = [
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'usps', label: 'USPS' },
    { value: 'dhl', label: 'DHL' },
  ]

  const boxSizeOptions = [
    { value: 'small', label: t('packing.small') + ' (8x6x4 in)' },
    { value: 'medium', label: t('packing.medium') + ' (12x10x8 in)' },
    { value: 'large', label: t('packing.large') + ' (18x14x12 in)' },
    { value: 'xlarge', label: t('packing.extraLarge') + ' (24x18x16 in)' },
  ]

  return (
    <PageWrapper>
      
      <Section title={t('shipping.carrierConfig')}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Grid columns={2} gap="md">
              <Select
                label={t('shipping.defaultCarrier')}
                options={carrierOptions}
                value={defaultCarrier}
                onChange={(e) => setDefaultCarrier(e.target.value)}
              />
              <Input
                label={t('shipping.packageWeight')}
                type="number"
                step="0.1"
                value={packageWeight}
                onChange={(e) => setPackageWeight(e.target.value)}
                placeholder={t('shipping.weightInKg')}
              />
            </Grid>

            <Grid columns={2} gap="md">
              <Input
                label={t('shipping.handlingTime')}
                type="number"
                value={handlingTime}
                onChange={(e) => setHandlingTime(e.target.value)}
                placeholder={t('shipping.processingTime')}
              />
              <Input
                label={t('shipping.freeShippingThreshold')}
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder={t('shipping.minOrderValue')}
              />
            </Grid>
          </div>
        </Card>
      </Section>

      <Section title={t('shipping.packageSizes')}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {boxSizeOptions.map((box) => (
              <div key={box.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{box.label.split('(')[0]}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{box.label.match(/\((.*?)\)/)?.[1]}</div>
                </div>
                <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title={t('shipping.shippingRules')}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('shipping.autoAssign')}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{t('shipping.autoAssignDesc')}</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('shipping.signatureRequired')}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{t('shipping.signatureDesc')}</div>
              </div>
              <input type="checkbox" style={{ width: '20px', height: '20px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('shipping.insurance')}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{t('shipping.insuranceDesc')}</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
            </div>
          </div>
        </Card>
      </Section>

      <Section title={t('common.actions')}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" size="md">{t('common.save')}</Button>
          <Button variant="secondary" size="md">{t('shipping.exportConfig')}</Button>
          <Button variant="secondary" size="md">{t('shipping.resetToDefault')}</Button>
        </div>
      </Section></PageWrapper>
  )
}
