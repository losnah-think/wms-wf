'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Badge } from '@/components/UI'
import { StatusTimeline } from '@/components/StatusTimeline'
import { ApprovalDrawer } from '@/components/ApprovalDrawer'
import styles from './approval.module.css'

interface InboundRequest {
  id: string
  clientName: string
  item: string
  quantity: number
  requestDate: string
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
}

const mockData: InboundRequest[] = [
  {
    id: 'INB-2024-001',
    clientName: '코플 유통',
    item: 'Laptop Dell XPS 13',
    quantity: 50,
    requestDate: '2024-10-24',
    status: 'pending',
    remark: '긴급 입고',
    requesterName: '김철수',
    requesterContact: '010-1234-5678',
    requesterCompany: '코플 유통',
    inspectionStatus: 'passed',
    inspectionDate: '2024-10-24',
    inspectionRemarks: '검수 완료',
  },
  {
    id: 'INB-2024-002',
    clientName: 'SK에너지',
    item: 'Mobile Phone Samsung',
    quantity: 100,
    requestDate: '2024-10-23',
    status: 'approved',
    allocatedZone: 'A-1',
    allocatedBin: 'A-1-C-05',
    allocationTime: '2024-10-24 10:30',
    approver: '이순신',
    remark: '정상 처리',
    requesterName: '박영희',
    requesterContact: '010-9876-5432',
    requesterCompany: 'SK에너지',
    inspectionStatus: 'passed',
    inspectionDate: '2024-10-23',
  },
  {
    id: 'INB-2024-003',
    clientName: 'LG화학',
    item: 'Tablet Apple iPad',
    quantity: 30,
    requestDate: '2024-10-22',
    status: 'allocated',
    allocatedZone: 'B-2',
    allocatedBin: 'B-2-A-12',
    allocationTime: '2024-10-23 14:15',
    approver: '이순신',
    remark: '자동 할당됨',
    requesterName: '최민준',
    requesterContact: '010-5555-6666',
    requesterCompany: 'LG화학',
    inspectionStatus: 'passed',
    inspectionDate: '2024-10-22',
  },
]

export default function InboundApprovalPage() {
  const t = useTranslations()
  const tApproval = useTranslations('inboundApproval')
  const [data, setData] = useState<InboundRequest[]>(mockData)
  const [selectedRequest, setSelectedRequest] = useState<InboundRequest | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    { key: 'id', label: tApproval('requestId'), align: 'left' as const },
    { key: 'clientName', label: tApproval('clientName'), align: 'left' as const },
    { key: 'item', label: tApproval('item'), align: 'left' as const },
    {
      key: 'quantity',
      label: t('common.quantity'),
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    { key: 'requestDate', label: tApproval('requestDate'), align: 'center' as const },
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
      render: (_, row: any) => (
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
        <div className={styles.tableContainer}>
          <Table 
            columns={columns} 
            data={data}
            onRowClick={(row) => handleRowClick(row)}
          />
        </div>
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
