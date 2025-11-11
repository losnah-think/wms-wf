'use client'

import { useState, useCallback } from 'react'
import { DatePicker, Button, Space, Tag, Select, Collapse, Row, Col, Card } from 'antd'
import { DeleteOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import type { RangePickerProps } from 'antd/es/date-picker'

dayjs.locale('ko')

export interface DateFilterValue {
  type: 'all' | 'preset' | 'custom' | 'notset'
  preset?: string
  customRange?: [Dayjs, Dayjs] | null
}

export interface DateFilterConfig {
  id: string
  label: string
  group: 'productManagement' | 'inboundManagement' | 'statusChange'
  value: DateFilterValue
  onChange: (value: DateFilterValue) => void
  presets?: Array<{
    label: string
    value: string
    getRange: () => [Dayjs, Dayjs]
  }>
  allowNotSet?: boolean
}

/**
 * 📅 날짜 범위 필터 컴포넌트
 * 
 * 사용 방법:
 * <DateRangeFilter
 *   id="productRegistrationDate"
 *   label="상품 등록일자"
 *   value={dateFilterState}
 *   onChange={handleDateFilterChange}
 *   presets={[
 *     { label: '지난 1주', value: '1week', getRange: () => [dayjs().subtract(7, 'd'), dayjs()] }
 *   ]}
 * />
 */

const DEFAULT_PRESETS: Array<{
  label: string
  value: string
  getRange: () => [Dayjs, Dayjs]
}> = [
  {
    label: '지난 1주',
    value: '1week',
    getRange: () => [dayjs().subtract(7, 'day'), dayjs()] as [Dayjs, Dayjs],
  },
  {
    label: '지난 1개월',
    value: '1month',
    getRange: () => [dayjs().subtract(1, 'month'), dayjs()] as [Dayjs, Dayjs],
  },
  {
    label: '지난 3개월',
    value: '3months',
    getRange: () => [dayjs().subtract(3, 'month'), dayjs()] as [Dayjs, Dayjs],
  },
  {
    label: '지난 1년',
    value: '1year',
    getRange: () => [dayjs().subtract(1, 'year'), dayjs()] as [Dayjs, Dayjs],
  },
]

export function DateRangeFilter({
  id,
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  allowNotSet = false,
}: DateFilterConfig) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePresetClick = useCallback(
    (presetValue: string) => {
      const preset = presets.find((p) => p.value === presetValue)
      if (preset) {
        onChange({
          type: 'preset',
          preset: presetValue,
          customRange: preset.getRange(),
        })
      }
    },
    [presets, onChange]
  )

  const handleCustomRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onChange({
        type: 'custom',
        customRange: [dates[0], dates[1]],
      })
    }
  }

  const handleClear = useCallback(() => {
    onChange({ type: 'all' })
  }, [onChange])

  const handleSetNotSet = useCallback(() => {
    onChange({ type: 'notset' })
  }, [onChange])

  // 현재 선택된 날짜 범위 표시
  const getDisplayText = (): string => {
    if (value.type === 'all') return '전체'
    if (value.type === 'notset') return '미설정'
    if (value.type === 'preset') {
      const preset = presets.find((p) => p.value === value.preset)
      return preset?.label || ''
    }
    if (value.type === 'custom' && value.customRange) {
      return `${value.customRange[0].format('YYYY-MM-DD')} ~ ${value.customRange[1].format('YYYY-MM-DD')}`
    }
    return ''
  }

  const getDisplayColor = (): string => {
    if (value.type === 'all') return 'default'
    if (value.type === 'notset') return 'default'
    return 'blue'
  }

  return (
    <div className="date-range-filter" style={{ marginBottom: '12px' }}>
      {/* 헤더: 라벨 + 선택 결과 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          padding: '8px 0',
        }}
      >
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#1F2B60' }}>
          <CalendarOutlined style={{ marginRight: '6px' }} />
          {label}
        </label>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {value.type !== 'all' && (
            <>
              <Tag color={getDisplayColor()} style={{ margin: 0 }}>
                {getDisplayText()}
              </Tag>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleClear}
                style={{ color: '#999' }}
              />
            </>
          )}
        </div>
      </div>

      {/* 프리셋 버튼들 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        {presets.map((preset) => (
          <Button
            key={preset.value}
            size="small"
            type={value.preset === preset.value ? 'primary' : 'default'}
            onClick={() => handlePresetClick(preset.value)}
            style={{
              borderRadius: '4px',
              fontSize: '12px',
              padding: '4px 12px',
              height: '28px',
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* 커스텀 범위 선택 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
        <DatePicker.RangePicker
          style={{ flex: 1 }}
          placeholder={['시작일', '종료일']}
          format="YYYY-MM-DD"
          value={value.type === 'custom' ? value.customRange : null}
          onChange={handleCustomRangeChange}
          size="small"
          presets={[
            {
              label: '오늘',
              value: [dayjs(), dayjs()],
            },
            {
              label: '이번주',
              value: [dayjs().startOf('week'), dayjs().endOf('week')],
            },
            {
              label: '이번달',
              value: [dayjs().startOf('month'), dayjs().endOf('month')],
            },
          ]}
        />
      </div>

      {/* 추가 옵션 (미설정, 전체) */}
      {(allowNotSet || true) && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            size="small"
            type={value.type === 'notset' ? 'primary' : 'default'}
            onClick={handleSetNotSet}
            style={{
              borderRadius: '4px',
              fontSize: '12px',
              padding: '4px 12px',
              height: '28px',
            }}
          >
            미설정
          </Button>
          <Button
            size="small"
            type={value.type === 'all' ? 'primary' : 'default'}
            onClick={handleClear}
            style={{
              borderRadius: '4px',
              fontSize: '12px',
              padding: '4px 12px',
              height: '28px',
            }}
          >
            전체
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * 📦 그룹화된 날짜 필터 패널 컴포넌트
 */
interface DateFilterGroupProps {
  groupTitle: string
  groupKey: string
  color: string
  filters: DateFilterConfig[]
  isExpanded?: boolean
}

export function DateFilterGroup({ groupTitle, groupKey, color, filters, isExpanded = true }: DateFilterGroupProps) {
  const items = [
    {
      key: groupKey,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>{groupTitle}</span>
          <Tag color="blue" style={{ marginLeft: '8px' }}>
            {filters.length}
          </Tag>
        </div>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {filters.map((filter) => (
            <DateRangeFilter key={filter.id} {...filter} />
          ))}
        </Space>
      ),
    },
  ]

  return (
    <Collapse
      items={items}
      defaultActiveKey={isExpanded ? [groupKey] : []}
      style={{
        marginBottom: '12px',
        border: `1px solid ${color}33`,
        borderRadius: '8px',
      }}
    />
  )
}

/**
 * 📅 전체 날짜 필터 패널 컴포넌트
 */
interface AllDateFiltersProps {
  filters: {
    productManagement: DateFilterConfig[]
    inboundManagement: DateFilterConfig[]
    statusChange: DateFilterConfig[]
  }
  onApply: () => void
  onReset: () => void
  isLoading?: boolean
}

export function AllDateFiltersPanel({
  filters,
  onApply,
  onReset,
  isLoading = false,
}: AllDateFiltersProps) {
  const groupConfigs = [
    {
      groupKey: 'productManagement',
      title: '📌 상품 관리',
      color: '#1890ff',
      filters: filters.productManagement,
    },
    {
      groupKey: 'inboundManagement',
      title: '📦 입고 관리',
      color: '#52c41a',
      filters: filters.inboundManagement,
    },
    {
      groupKey: 'statusChange',
      title: '⚠️ 상태 변경',
      color: '#faad14',
      filters: filters.statusChange,
    },
  ]

  // 전체 활성 필터 개수 계산
  const activeFilterCount = Object.values(filters)
    .flat()
    .filter((f) => f.value.type !== 'all')
    .length

  return (
    <Card
      style={{
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
          <span style={{ fontSize: '15px', fontWeight: 600 }}>날짜 필터</span>
          {activeFilterCount > 0 && (
            <Tag color="blue">
              {activeFilterCount}개 선택
            </Tag>
          )}
        </div>
      </div>

      {/* 필터 그룹들 */}
      <div style={{ marginBottom: '16px' }}>
        {groupConfigs.map((config) => (
          <DateFilterGroup
            key={config.groupKey}
            groupTitle={config.title}
            groupKey={config.groupKey}
            color={config.color}
            filters={config.filters}
            isExpanded={true}
          />
        ))}
      </div>

      {/* 액션 버튼 */}
      <Row gutter={[12, 12]} justify="end">
        <Col>
          <Button onClick={onReset} disabled={isLoading}>
            필터 초기화
          </Button>
        </Col>
        <Col>
          <Button type="primary" onClick={onApply} loading={isLoading}>
            필터 적용
          </Button>
        </Col>
      </Row>
    </Card>
  )
}

// 유틸리티 함수: 날짜 필터 상태 초기화
export const getInitialDateFilterState = (): Record<string, DateFilterValue> => {
  return {
    productRegistrationDate: { type: 'all' },
    lastModifiedDate: { type: 'all' },
    productPublishDate: { type: 'all' },
    expectedInboundDate: { type: 'all' },
    poSettingDate: { type: 'all' },
    soldOutDate: { type: 'all' },
    stockRegistrationDate: { type: 'all' },
  }
}

// 유틸리티 함수: 날짜 범위 검증
export const isDateInRange = (date: Dayjs | null, filterValue: DateFilterValue): boolean => {
  if (!date || filterValue.type === 'all') return true
  if (filterValue.type === 'notset' && !date) return true
  if (filterValue.type === 'notset' && date) return false
  
  if (filterValue.type === 'custom' && filterValue.customRange) {
    const [start, end] = filterValue.customRange
    return date.isAfter(start) && date.isBefore(end.add(1, 'day'))
  }
  
  return true
}
