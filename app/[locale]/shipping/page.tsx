'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function ShippingPage() {
  const t = useTranslations()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCarrier, setSelectedCarrier] = useState('all')

  // Statistics
  const stats = [
    { label: t('shipping.pendingShipments'), value: '12', subtitle: t('shipping.awaitingPickup') },
    { label: t('shipping.inTransit'), value: '34', subtitle: t('common.active') },
    { label: t('shipping.deliveredToday'), value: '89', subtitle: t('dashboard.stats.totalOrders') },
    { label: t('shipping.avgDeliveryTime'), value: '2.3 days', subtitle: t('shipping.duration') },
  ]

  // Status options
  const statusOptions = [
    { value: 'all', label: t('picking.allStatus') },
    { value: 'pending', label: t('common.pending') },
    { value: 'in-transit', label: t('shipping.inTransit') },
    { value: 'delivered', label: t('shipping.delivered') },
  ]

  // Carrier options
  const carrierOptions = [
    { value: 'all', label: t('shipping.allCarriers') },
    { value: 'fedex', label: 'FedEx' },
    { value: 'ups', label: 'UPS' },
    { value: 'dhl', label: 'DHL' },
    { value: 'usps', label: 'USPS' },
  ]

  // Shipping data
  const shippingData = [
    {
      shipNumber: 'SHP-2024-001',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'UPS',
      destination: 'New York, NY',
      weight: '2.5 kg',
      status: t('shipping.inTransit'),
      statusType: 'warning' as const,
      eta: '2024-01-18',
      cost: '$15.99',
    },
    {
      shipNumber: 'SHP-2024-002',
      trackingNumber: '9400111899223344556677',
      carrier: 'USPS',
      destination: 'Los Angeles, CA',
      weight: '1.2 kg',
      status: t('shipping.delivered'),
      statusType: 'success' as const,
      eta: '2024-01-15',
      cost: '$8.50',
    },
    {
      shipNumber: 'SHP-2024-003',
      trackingNumber: '794612345671',
      carrier: 'FedEx',
      destination: 'Chicago, IL',
      weight: '3.8 kg',
      status: t('common.pending'),
      statusType: 'default' as const,
      eta: '2024-01-20',
      cost: '$22.50',
    },
    {
      shipNumber: 'SHP-2024-004',
      trackingNumber: '1Z888AA20456789012',
      carrier: 'UPS',
      destination: 'Miami, FL',
      weight: '1.5 kg',
      status: t('shipping.delivered'),
      statusType: 'success' as const,
      eta: '2024-01-16',
      cost: '$12.99',
    },
    {
      shipNumber: 'SHP-2024-005',
      trackingNumber: '940011234567890123',
      carrier: 'USPS',
      destination: 'Seattle, WA',
      weight: '0.8 kg',
      status: t('shipping.inTransit'),
      statusType: 'warning' as const,
      eta: '2024-01-19',
      cost: '$6.50',
    },
  ]

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'shipNumber',
      label: t('shipping.shipNumber'),
      align: 'left',
    },
    {
      key: 'trackingNumber',
      label: t('shipping.trackingNumber'),
      align: 'left',
    },
    {
      key: 'carrier',
      label: t('shipping.carrier'),
      align: 'left',
    },
    {
      key: 'destination',
      label: t('shipping.destination'),
      align: 'left',
    },
    {
      key: 'weight',
      label: t('packing.weight'),
      align: 'right',
    },
    {
      key: 'cost',
      label: t('shipping.cost'),
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
    {
      key: 'eta',
      label: t('shipping.eta'),
      align: 'center',
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('shipping.shippingOverview')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      <Section title={t('shipping.shipments')}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('common.status')}
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('shipping.carrier')}
              options={carrierOptions}
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button variant="primary" size="md">{t('shipping.createShipment')}</Button>
          <Button variant="secondary" size="md">{t('shipping.generateLabels')}</Button>
          <Button variant="secondary" size="md">{t('shipping.trackAll')}</Button>
          <Button variant="secondary" size="md">{t('common.refresh')}</Button>
        </div>

        {/* Shipping Table */}
        <Table columns={columns} data={shippingData} />
      </Section>
    </PageWrapper>
  )
}
