'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Badge, Grid, StatCard, Select } from '@/components/UI'
import styles from './schedule.module.css'

interface InboundSchedule {
  id: string
  scheduleNumber: string
  requestNumber: string
  supplier: string
  supplierCode: string
  expectedDate: string
  itemCount: number
  quantity: number
  estimatedArrival: string
  status: 'pending' | 'on-schedule' | 'delayed' | 'arrived'
  carrier: string
  trackingNumber?: string
  items?: any[]
}

export default function InboundSchedulePage() {
  const t = useTranslations()
  const [schedules, setSchedules] = useState<InboundSchedule[]>([])
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [listFilter, setListFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date('2025-10-24'))

  // Fetch data from API
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          view: viewMode,
          ...(viewMode === 'list' && { page: page.toString(), limit: '20' }),
          ...(listFilter !== 'all' && { status: listFilter }),
        })

        // 캘린더 뷰일 때 현재 월의 데이터만 가져오기
        if (viewMode === 'calendar') {
          const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
          const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
          params.set('startDate', startOfMonth.toISOString().split('T')[0])
          params.set('endDate', endOfMonth.toISOString().split('T')[0])
        }

        const response = await fetch(`/api/inbound/schedule?${params}`)
        const result = await response.json()

        if (result.success) {
          const formattedData = result.data.map((item: any) => ({
            id: item.id,
            scheduleNumber: item.scheduleNumber,
            requestNumber: item.requestNumber,
            supplier: item.supplierName,
            supplierCode: item.supplierCode,
            expectedDate: new Date(item.expectedDate).toLocaleDateString('ko-KR'),
            itemCount: item.items?.length || 0,
            quantity: item.totalQuantity,
            estimatedArrival: item.estimatedArrival 
              ? new Date(item.estimatedArrival).toLocaleString('ko-KR') 
              : '-',
            status: item.status,
            carrier: item.carrier || '-',
            trackingNumber: item.trackingNumber,
            items: item.items,
          }))
          setSchedules(formattedData)
          if (result.pagination) {
            setTotal(result.pagination.total)
          } else {
            setTotal(formattedData.length)
          }
        }
      } catch (error) {
        console.error('Error fetching schedule data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedules()
  }, [viewMode, listFilter, page, selectedDate])

  // 날짜 유틸리티 함수들
  const today = new Date('2025-10-24')
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const getEndOfWeek = (date: Date) => {
    const d = new Date(getStartOfWeek(date))
    d.setDate(d.getDate() + 6)
    return d
  }

  const getStartOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  const getEndOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  const isDateBetween = (date: string, start: Date, end: Date) => {
    const d = new Date(date)
    return d >= start && d <= end
  }

  // 리스트 필터링
  const getFilteredSchedules = () => {
    const startOfWeek = getStartOfWeek(today)
    const endOfWeek = getEndOfWeek(today)
    const startOfMonth = getStartOfMonth(today)
    const endOfMonth = getEndOfMonth(today)

    switch (listFilter) {
      case 'today':
        return schedules.filter(s => {
          const date = new Date(s.expectedDate)
          return date.toDateString() === today.toDateString()
        })
      case 'week':
        return schedules.filter(s => isDateBetween(s.expectedDate, startOfWeek, endOfWeek))
      case 'month':
        return schedules.filter(s => isDateBetween(s.expectedDate, startOfMonth, endOfMonth))
      default:
        return schedules
    }
  }

  // 캘린더 데이터 생성
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getSchedulesForDate = (day: number) => {
    const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    const targetDateStr = targetDate.toLocaleDateString('ko-KR')
    return schedules.filter(s => s.expectedDate === targetDateStr)
  }

  // 통계 계산
  const filteredSchedules = getFilteredSchedules()
  const stats = [
    {
      label: '예정된 입고',
      value: filteredSchedules.filter(s => s.status === 'on-schedule').length,
      subtitle: '건',
    },
    {
      label: '지연된 입고',
      value: filteredSchedules.filter(s => s.status === 'delayed').length,
      subtitle: '건',
    },
    {
      label: '도착 완료',
      value: filteredSchedules.filter(s => s.status === 'arrived').length,
      subtitle: '건',
    },
    {
      label: '총 입고량',
      value: filteredSchedules.reduce((acc, s) => acc + s.quantity, 0),
      subtitle: '개',
    },
  ]

  const getStatusBadgeType = (status: string): 'warning' | 'success' | 'default' | 'danger' => {
    switch (status) {
      case 'pending':
        return 'default'
      case 'on-schedule':
        return 'success'
      case 'delayed':
        return 'danger'
      case 'arrived':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기'
      case 'on-schedule':
        return '정상 진행'
      case 'delayed':
        return '지연'
      case 'arrived':
        return '도착'
      default:
        return status
    }
  }

  const columns: any[] = [
    { key: 'scheduleNumber', label: '일정ID', align: 'left' as const },
    { key: 'requestNumber', label: '요청ID', align: 'left' as const },
    { key: 'supplier', label: '공급사', align: 'left' as const },
    { key: 'expectedDate', label: '예정일', align: 'center' as const },
    {
      key: 'quantity',
      label: '수량',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString(),
    },
    { key: 'estimatedArrival', label: '예상 도착', align: 'center' as const },
    { key: 'carrier', label: '배송사', align: 'left' as const },
    { key: 'trackingNumber', label: '추적번호', align: 'center' as const },
    {
      key: 'status',
      label: '상태',
      align: 'center' as const,
      render: (value: string) => (
        <Badge type={getStatusBadgeType(value)}>
          {getStatusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
      render: () => (
        <Button size="sm" variant="secondary">
          추적
        </Button>
      ),
    },
  ]

  // 캘린더 렌더링
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate)
    const firstDay = getFirstDayOfMonth(selectedDate)
    const monthName = selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
    const days = ['일', '월', '화', '수', '목', '금', '토']

    return (
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
          >
            ←
          </Button>
          <h3 className={styles.calendarTitle}>{monthName}</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
          >
            →
          </Button>
        </div>

        <div className={styles.calendarGrid}>
          {days.map(day => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}

          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptyDay} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const daySchedules = getSchedulesForDate(day)
            const isToday = selectedDate.getFullYear() === today.getFullYear() && 
                           selectedDate.getMonth() === today.getMonth() && 
                           day === today.getDate()

            return (
              <div
                key={day}
                className={`${styles.calendarDay} ${isToday ? styles.today : ''}`}
              >
                <div className={styles.dayNumber}>{day}</div>
                <div className={styles.daySchedules}>
                  {daySchedules.map(schedule => (
                    <div
                      key={schedule.id}
                      className={`${styles.scheduleItem} ${styles[`status-${schedule.status}`]}`}
                      title={`${schedule.supplier} - ${schedule.quantity}개`}
                    >
                      {schedule.quantity}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <PageWrapper>
      <Section title="입고 예정표">
        <div className={styles.viewToggle}>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            📅 캘린더
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            📋 리스트
          </Button>
        </div>
      </Section>

      {viewMode === 'calendar' ? (
        <>
          <Section>
            <div>{renderCalendar()}</div>
          </Section>
        </>
      ) : (
        <>
          <Section>
            <div className={styles.filterActions}>
              <Select
                label="필터"
                options={[
                  { value: 'all', label: '전체' },
                  { value: 'pending', label: '대기중' },
                  { value: 'on-schedule', label: '정상' },
                  { value: 'delayed', label: '지연' },
                  { value: 'arrived', label: '도착' },
                ]}
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value)}
              />
            </div>
          </Section>

          <Section>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>
            ) : (
              <>
                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  총 {schedules.length.toLocaleString()}건
                </div>
                <Table columns={columns} data={schedules} />
                {viewMode === 'list' && total > 20 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', padding: '16px' }}>
                    <Button 
                      variant="secondary" 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      이전
                    </Button>
                    <span style={{ fontSize: '14px', color: '#666', lineHeight: '32px' }}>
                      {page} / {Math.ceil(total / 20)}
                    </span>
                    <Button 
                      variant="secondary"
                      disabled={page >= Math.ceil(total / 20)}
                      onClick={() => setPage(p => p + 1)}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </>
            )}
          </Section>
        </>
      )}
    </PageWrapper>
  )
}
