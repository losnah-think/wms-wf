'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Select, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface Shipment {
  id: string
  orderId: string
  trackingNumber: string
  carrier: string
  status: string
  shippedAt?: string
  deliveredAt?: string
  estimatedDelivery?: string
}

export default function ShippingPage() {
  const t = useTranslations()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCarrier, setSelectedCarrier] = useState('all')
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    inTransit: 0,
    delivered: 0,
    avgDeliveryTime: '2.3',
  })

  // API에서 배송 데이터 가져오기
  useEffect(() => {
    const fetchShippingData = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedStatus !== 'all') params.append('status', selectedStatus)
        if (selectedCarrier !== 'all') params.append('carrier', selectedCarrier)

        const response = await fetch(`/api/shipping/track?${params}`)
        const result = await response.json()

        if (result.success) {
          setShipments(result.data || [])
          
          // 통계 계산
          const pending = result.data.filter((s: Shipment) => s.status === 'PENDING').length
          const inTransit = result.data.filter((s: Shipment) => s.status === 'IN_TRANSIT').length
          const delivered = result.data.filter((s: Shipment) => s.status === 'DELIVERED').length
          
          setStats({
            pending,
            inTransit,
            delivered,
            avgDeliveryTime: '2.3',
          })
        }
      } catch (error) {
        console.error('Error fetching shipping data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShippingData()
    
    // 1분마다 자동 새로고침
    const interval = setInterval(fetchShippingData, 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedStatus, selectedCarrier])

  const statsDisplay = [
    { label: t('shipping.pendingShipments'), value: stats.pending.toString(), subtitle: t('shipping.awaitingPickup') },
    { label: t('shipping.inTransit'), value: stats.inTransit.toString(), subtitle: t('common.active') },
    { label: t('shipping.deliveredToday'), value: stats.delivered.toString(), subtitle: t('dashboard.stats.totalOrders') },
    { label: t('shipping.avgDeliveryTime'), value: stats.avgDeliveryTime + ' days', subtitle: t('shipping.duration') },
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

  // 배송 데이터 변환
  const shippingData = shipments.map((shipment, index) => ({
    shipNumber: `SHP-${shipment.id}`,
    trackingNumber: shipment.trackingNumber || 'N/A',
    carrier: shipment.carrier || 'CJ',
    destination: 'Seoul, KR',
    weight: '2.5 kg',
    status: shipment.status === 'DELIVERED' ? t('shipping.delivered') :
            shipment.status === 'IN_TRANSIT' ? t('shipping.inTransit') :
            t('common.pending'),
    statusType: shipment.status === 'DELIVERED' ? 'success' as const :
                shipment.status === 'IN_TRANSIT' ? 'warning' as const :
                'default' as const,
    eta: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString('ko-KR') : '-',
    cost: '$15.99',
  }))

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
          {statsDisplay.map((stat, index) => (
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
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
        ) : (
          <Table columns={columns} data={shippingData} />
        )}
      </Section>
    </PageWrapper>
  )
}
