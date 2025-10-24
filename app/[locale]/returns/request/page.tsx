'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Input, Select, Card, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

export default function ReturnRequestPage() {
  const t = useTranslations()
  // Form state
  const [orderNumber, setOrderNumber] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Statistics
  const stats = [
    { label: t('returns.newReturns'), value: '23', subtitle: t('returns.thisWeek') },
    { label: t('common.pending'), value: '8', subtitle: t('returns.requests') },
    { label: t('returns.approved'), value: '12', subtitle: t('returns.thisWeek') },
    { label: t('returns.avgProcessing'), value: '2.4 days', subtitle: t('common.time') },
  ]

  // Return reason options
  const reasonOptions = [
    { value: '', label: t('returns.selectReason') },
    { value: 'damaged', label: t('returns.damaged') },
    { value: 'wrong-item', label: t('returns.wrongItem') },
    { value: 'defective', label: t('returns.defective') },
    { value: 'customer-request', label: t('returns.customerRequest') },
  ]

  const statusFilterOptions = [
    { value: 'all', label: t('picking.allStatus') },
    { value: 'pending', label: t('common.pending') },
    { value: 'approved', label: t('returns.approved') },
    { value: 'rejected', label: t('returns.rejected') },
  ]

  // Return list data
  const returnListData = [
    {
      returnId: 'RET-2024-001',
      orderNumber: 'ORD-2024-105',
      customer: 'Alice Cooper',
      reason: t('returns.damaged'),
      quantity: 2,
      status: t('common.pending'),
      statusType: 'warning' as const,
      date: '2024-01-15',
      amount: '$58.98',
    },
    {
      returnId: 'RET-2024-002',
      orderNumber: 'ORD-2024-098',
      customer: 'Bob Martin',
      reason: t('returns.wrongItem'),
      quantity: 1,
      status: t('returns.approved'),
      statusType: 'success' as const,
      date: '2024-01-14',
      amount: '$189.99',
    },
    {
      returnId: 'RET-2024-003',
      orderNumber: 'ORD-2024-112',
      customer: 'Carol White',
      reason: t('returns.defective'),
      quantity: 3,
      status: t('returns.processing'),
      statusType: 'warning' as const,
      date: '2024-01-13',
      amount: '$29.97',
    },
    {
      returnId: 'RET-2024-004',
      orderNumber: 'ORD-2024-156',
      customer: 'Dave Brown',
      reason: t('returns.customerRequest'),
      quantity: 1,
      status: t('common.pending'),
      statusType: 'warning' as const,
      date: '2024-01-12',
      amount: '$45.50',
    },
    {
      returnId: 'RET-2024-005',
      orderNumber: 'ORD-2024-201',
      customer: 'Emily Davis',
      reason: t('returns.defective'),
      quantity: 2,
      status: t('returns.rejected'),
      statusType: 'danger' as const,
      date: '2024-01-11',
      amount: '$0.00',
    },
  ]

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'returnId',
      label: t('returns.returnId'),
      align: 'left',
    },
    {
      key: 'orderNumber',
      label: t('picking.orderNumber'),
      align: 'left',
    },
    {
      key: 'customer',
      label: t('returns.customer'),
      align: 'left',
    },
    {
      key: 'reason',
      label: t('returns.reason'),
      align: 'left',
    },
    {
      key: 'quantity',
      label: t('common.quantity'),
      align: 'right',
    },
    {
      key: 'amount',
      label: t('returns.amount'),
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
      key: 'date',
      label: t('common.date'),
      align: 'center',
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({ orderNumber, returnReason, quantity, notes })
  }

  return (
    <PageWrapper>
      {/* Statistics */}
      <Section title={t('returns.returnRequest')}>
        <Grid columns={4} gap="md">
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Return List */}
        <Section title={t('returns.recentRequests')}>
          <div style={{ marginBottom: '16px' }}>
            <Select
              label={t('common.filter')}
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <Table columns={columns} data={returnListData} />
        </Section>

        {/* Right Column: Register New Return Form */}
        <Section title={t('returns.registerNew')}>
          <Card>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Input
                  label={t('returns.orderNumber')}
                  placeholder={t('returns.enterOrderNumber')}
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />

                <Select
                  label={t('returns.reason')}
                  options={reasonOptions}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                />

                <Input
                  label={t('common.quantity')}
                  type="number"
                  placeholder={t('returns.enterQuantity')}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                />

                <div>
                  <label
                    htmlFor="notes"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#333333',
                      marginBottom: '6px',
                    }}
                  >
                    {t('returns.notes')}
                  </label>
                  <textarea
                    id="notes"
                    placeholder={t('returns.enterNotes')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontFamily: 'Comfortaa, cursive',
                      border: '1px solid #cccccc',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#333333',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      setOrderNumber('')
                      setReturnReason('')
                      setQuantity('')
                      setNotes('')
                    }}
                  >
                    {t('returns.clear')}
                  </Button>
                  <Button type="submit" variant="primary">
                    {t('returns.submitReturn')}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </Section>
      </div>

      {/* Responsive: Stack on mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageWrapper>
  )
}
