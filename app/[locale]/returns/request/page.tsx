'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Input, Select, Card, Badge, Grid, StatCard } from '@/components/UI'
import { TableColumn } from '@/components/UI'

interface ReturnRequest {
  returnId: string
  returnNumber: string
  status: string
  requestDate: string
  orderId: string
  orderNumber: string
  reason: string
  quantity: number
}

export default function ReturnRequestPage() {
  const t = useTranslations()
  // Form state
  const [orderNumber, setOrderNumber] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch return requests
  useEffect(() => {
    const fetchReturns = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          period: '30',
          status: statusFilter,
        })
        const response = await fetch(`/api/returns/request?${params}`)
        const result = await response.json()

        if (result.success) {
          setReturns(result.data.returns || [])
        }
      } catch (error) {
        console.error('Error fetching returns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReturns()
  }, [statusFilter])

  // Statistics
  const stats = [
    { label: t('returns.newReturns'), value: returns.length.toString(), subtitle: t('returns.thisWeek') },
    { label: t('common.pending'), value: returns.filter(r => r.status === '요청').length.toString(), subtitle: t('returns.requests') },
    { label: t('returns.approved'), value: returns.filter(r => r.status === '완료').length.toString(), subtitle: t('returns.thisWeek') },
    { label: '처리중', value: returns.filter(r => r.status === '접수').length.toString(), subtitle: t('common.time') },
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

  // Return list data from API
  const returnListData = returns.map(ret => ({
    returnId: ret.returnNumber,
    orderNumber: ret.orderNumber || ret.orderId,
    customer: 'Customer',
    reason: ret.reason,
    quantity: ret.quantity,
    status: ret.status,
    statusType: ret.status === '완료' ? 'success' as const : ret.status === '거절' ? 'danger' as const : 'warning' as const,
    date: new Date(ret.requestDate).toLocaleDateString('ko-KR'),
    amount: '-',
  }))

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/returns/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderNumber,
          reason: returnReason,
          returnQuantity: parseInt(quantity),
          customerNote: notes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('반품 요청이 등록되었습니다.')
        // Reset form
        setOrderNumber('')
        setReturnReason('')
        setQuantity('')
        setNotes('')
        // Refresh list
        window.location.reload()
      } else {
        alert(`등록 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting return request:', error)
      alert('반품 요청 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
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
