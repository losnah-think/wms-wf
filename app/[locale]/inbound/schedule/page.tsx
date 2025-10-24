'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Table, Button, Badge, Grid, StatCard, Select } from '@/components/UI'
import styles from './schedule.module.css'

interface InboundSchedule {
  id: string
  requestId: string
  supplier: string
  expectedDate: string
  itemCount: number
  quantity: number
  estimatedArrival: string
  status: 'pending' | 'on-schedule' | 'delayed' | 'arrived'
  carrier: string
  trackingNumber?: string
}

const mockSchedules: InboundSchedule[] = [
  {
    id: 'SCH-2024-001',
    requestId: 'REQ-2024-001',
    supplier: 'ABC Supply Co.',
    expectedDate: '2024-10-28',
    itemCount: 8,
    quantity: 250,
    estimatedArrival: '2024-10-28 14:00',
    status: 'on-schedule',
    carrier: 'FastShip Express',
    trackingNumber: 'FS-2024-001234',
  },
  {
    id: 'SCH-2024-002',
    requestId: 'REQ-2024-002',
    supplier: 'XYZ Corporation',
    expectedDate: '2024-10-27',
    itemCount: 12,
    quantity: 500,
    estimatedArrival: '2024-10-27 10:30',
    status: 'on-schedule',
    carrier: 'Premium Logistics',
    trackingNumber: 'PM-2024-005678',
  },
  {
    id: 'SCH-2024-003',
    requestId: 'REQ-2024-003',
    supplier: 'Global Logistics',
    expectedDate: '2024-10-26',
    itemCount: 5,
    quantity: 100,
    estimatedArrival: '2024-10-26 09:00',
    status: 'delayed',
    carrier: 'International Freight',
    trackingNumber: 'IF-2024-009999',
  },
  {
    id: 'SCH-2024-004',
    requestId: 'REQ-2024-004',
    supplier: 'Premier Distributors',
    expectedDate: '2024-10-24',
    itemCount: 15,
    quantity: 800,
    estimatedArrival: '2024-10-24 16:45',
    status: 'arrived',
    carrier: 'Direct Delivery',
    trackingNumber: 'DD-2024-003333',
  },
  {
    id: 'SCH-2024-005',
    requestId: 'REQ-2024-005',
    supplier: 'Tech Distributors',
    expectedDate: '2024-10-25',
    itemCount: 6,
    quantity: 300,
    estimatedArrival: '2024-10-25 11:00',
    status: 'on-schedule',
    carrier: 'FastShip Express',
    trackingNumber: 'FS-2024-001111',
  },
  {
    id: 'SCH-2024-006',
    requestId: 'REQ-2024-006',
    supplier: 'Major Suppliers Inc',
    expectedDate: '2024-10-31',
    itemCount: 20,
    quantity: 1200,
    estimatedArrival: '2024-10-31 09:30',
    status: 'pending',
    carrier: 'Premium Logistics',
    trackingNumber: 'PM-2024-007777',
  },
]

export default function InboundSchedulePage() {
  const t = useTranslations()
  const [schedules] = useState<InboundSchedule[]>(mockSchedules)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [listFilter, setListFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date())

  // 날짜 유틸리티 함수들
  const today = new Date('2024-10-24')
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
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
      .toISOString()
      .split('T')[0]
    return schedules.filter(s => s.expectedDate === dateStr)
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
    { key: 'id', label: '일정ID', align: 'left' as const },
    { key: 'requestId', label: '요청ID', align: 'left' as const },
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
                  { value: 'today', label: '오늘' },
                  { value: 'week', label: '이번 주' },
                  { value: 'month', label: '이번 달' },
                ]}
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value)}
              />
            </div>
          </Section>

          <Section>
            <Grid columns={4} gap="md">
              {stats.map((stat, index) => (
                <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
              ))}
            </Grid>
          </Section>

          <Section title="예정 목록">
            <Table columns={columns} data={filteredSchedules} />
          </Section>
        </>
      )}
    </PageWrapper>
  )
}
