'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Badge } from '@/components/UI'
import { StatusTimeline } from '@/components/StatusTimeline'
import { ApprovalDrawer } from '@/components/ApprovalDrawer'
import styles from './approval.module.css'

interface InboundRequest {
  id: string
  approvalNumber: string
  requestNumber: string
  clientName: string
  item: string
  quantity: number
  requestDate: string
  expectedDate: string
  status: 'requested' | 'pending' | 'approved' | 'allocated' | 'completed'
  approver?: string
  remark?: string
  requesterName?: string
  requesterContact?: string
  requesterCompany?: string
  inspectionStatus?: 'passed' | 'failed'
  inspectionDate?: string
  inspectionRemarks?: string
  allocatedZone?: string
  allocatedBin?: string
  allocationTime?: string
  supplierCode?: string
  items?: any[]
}

export default function InboundApprovalPage() {
  const t = useTranslations()
  const tApproval = useTranslations('inboundApproval')
  const [data, setData] = useState<InboundRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<InboundRequest | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(statusFilter !== 'all' && { status: statusFilter }),
        })

        const response = await fetch(`/api/inbound/approval?${params}`)
        const result = await response.json()

        if (result.success) {
          const formattedData = result.data.map((item: any) => ({
            id: item.id,
            approvalNumber: item.approvalNumber,
            requestNumber: item.requestNumber,
            clientName: item.supplierName,
            supplierCode: item.supplierCode,
            item: item.items?.[0]?.productName || '-',
            quantity: item.totalQuantity,
            requestDate: new Date(item.requestDate).toLocaleDateString('ko-KR'),
            expectedDate: new Date(item.expectedDate).toLocaleDateString('ko-KR'),
            status: item.status,
            approver: item.approverName,
            allocatedZone: item.allocatedZone,
            allocatedBin: item.allocatedLocation,
            items: item.items,
          }))
          setData(formattedData)
          setTotal(result.pagination.total)
        }
      } catch (error) {
        console.error('Error fetching approval data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [page, statusFilter])

  const getStatusBadgeType = (status: string): 'warning' | 'success' | 'default' | 'danger' => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'allocated':
        return 'success'
      case 'completed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'requested':
        return tApproval('requestedStatus')
      case 'pending':
        return tApproval('approvalPendingStatus')
      case 'approved':
        return tApproval('approvedStatus')
      case 'allocated':
        return tApproval('zoneAllocatedStatus')
      case 'completed':
        return tApproval('inboundCompletedStatus')
      default:
        return status
    }
  }

  const handleRowClick = (row: any) => {
    const request = data.find((item) => item.id === row.id)
    if (request) {
      setSelectedRequest(request)
      setIsDrawerOpen(true)
    }
  }

  const handleApprove = useCallback(async (request: InboundRequest) => {
    setIsLoading(true)
    try {
      // Zone allocation API call
      // const zoneResponse = await fetch('/api/zone/allocate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ requestId: request.id }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setData((prevData) =>
        prevData.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status: 'allocated' as const,
                allocatedZone: 'A-1',
                allocatedBin: 'A-1-C-05',
                allocationTime: new Date().toLocaleString('ko-KR'),
                approver: '현재사용자',
              }
            : item,
        ),
      )

      // Show toast notification
      alert(tApproval('zoneAutoAllocated'))

      // Update approval status API call
      // await fetch('/api/inbound-status', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ requestId: request.id, status: 'approved' }),
      // })

      setIsDrawerOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error approving request:', error)
      alert('승인 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [tApproval])

  const handleReject = useCallback(async (request: InboundRequest) => {
    if (!window.confirm('정말 반려하시겠습니까?')) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setData((prevData) =>
        prevData.filter((item) => item.id !== request.id),
      )

      alert(tApproval('rejectionComplete'))
      setIsDrawerOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('반려 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [tApproval])

  const timelineSteps = [
    { key: 'requested', label: tApproval('requestStatus'), icon: '📋', isCompleted: true, isCurrent: false },
    { key: 'pending', label: tApproval('approvalPending'), icon: '⏳', isCompleted: true, isCurrent: false },
    { key: 'approved', label: tApproval('approved'), icon: '✓', isCompleted: false, isCurrent: true },
    { key: 'allocated', label: tApproval('zoneAllocated'), icon: '📍', isCompleted: false, isCurrent: false },
    { key: 'completed', label: tApproval('inboundCompleted'), icon: '🎉', isCompleted: false, isCurrent: false },
  ]

  const columns: any[] = [
    { key: 'approvalNumber', label: tApproval('approvalNumber'), align: 'left' as const },
    { key: 'requestNumber', label: tApproval('requestId'), align: 'left' as const },
    { key: 'clientName', label: tApproval('clientName'), align: 'left' as const },
    { key: 'item', label: tApproval('item'), align: 'left' as const },
    {
      key: 'quantity',
      label: t('common.quantity'),
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    { key: 'requestDate', label: tApproval('requestDate'), align: 'center' as const },
    { key: 'expectedDate', label: tApproval('expectedDate'), align: 'center' as const },
    {
      key: 'status',
      label: t('common.status'),
      align: 'center' as const,
      render: (value: string) => (
        <Badge type={getStatusBadgeType(value)}>
          {getStatusLabel(value)}
        </Badge>
      ),
    },
    { key: 'approver', label: tApproval('approver'), align: 'left' as const },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
      render: (_: any, row: any) => (
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => handleRowClick(row)}
        >
          {t('common.view')}
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper>
      <Section title={tApproval('statusTimeline')}>
        <StatusTimeline steps={timelineSteps} />
      </Section>

      <Section title={tApproval('requestList')}>
        <div className={styles.filterContainer}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">{t('common.all')}</option>
            <option value="pending">{tApproval('approvalPendingStatus')}</option>
            <option value="approved">{tApproval('approvedStatus')}</option>
            <option value="rejected">{t('common.rejected')}</option>
          </select>
          <div className={styles.stats}>
            {t('common.total')}: {total.toLocaleString()}
          </div>
        </div>
        <div className={styles.tableContainer}>
          {isLoading ? (
            <div className={styles.loading}>{t('common.loading')}</div>
          ) : (
            <Table 
              columns={columns} 
              data={data}
              onRowClick={(row) => handleRowClick(row)}
            />
          )}
        </div>
        {!isLoading && total > 20 && (
          <div className={styles.pagination}>
            <Button 
              variant="secondary" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              {t('common.previous')}
            </Button>
            <span>{page} / {Math.ceil(total / 20)}</span>
            <Button 
              variant="secondary"
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setPage(p => p + 1)}
            >
              {t('common.next')}
            </Button>
          </div>
        )}
      </Section>

      <ApprovalDrawer
        isOpen={isDrawerOpen}
        data={selectedRequest}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedRequest(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={isLoading}
      />
    </PageWrapper>
  )
}
