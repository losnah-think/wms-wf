'use client'

import React, { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Card,
  Button,
  Space,
  Table,
  Select,
  Input,
  Row,
  Col,
  Breadcrumb,
  InputNumber,
  message,
} from 'antd'
import type { TableColumnsType } from 'antd'

interface PlacementItem {
  key: string
  productCode: string
  productName: string
  supplier: string
  quantityMethod: string
  loadType: string
  plannedQty: number
  actualQty: number
  placementMethod: string
}

const mockPlacementItems: PlacementItem[] = [
  {
    key: '1',
    productCode: '100000920001',
    productName: '심곰명버나나 심곰명\n심곰 운전',
    supplier: '공급처1',
    quantityMethod: '자동',
    loadType: '로드 번호',
    plannedQty: 10000,
    actualQty: 0,
    placementMethod: '적치 방법',
  },
  {
    key: '2',
    productCode: '100000920002',
    productName: '상품2',
    supplier: '공급처2',
    quantityMethod: '자동',
    loadType: '로드 번호',
    plannedQty: 5000,
    actualQty: 0,
    placementMethod: '적치 방법',
  },
  {
    key: '3',
    productCode: '100000920003',
    productName: '상품3',
    supplier: '공급처3',
    quantityMethod: '수동',
    loadType: '로드 번호',
    plannedQty: 3000,
    actualQty: 0,
    placementMethod: '적치 방법',
  },
]

export default function InboundPlacementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('inbound.placement')
  const orderId = params.id as string
  const status = searchParams.get('status') || 'placed'

  const [placementItems, setPlacementItems] = useState<PlacementItem[]>(mockPlacementItems)
  const [worker, setWorker] = useState('로그인 사용자')
  const [reason, setReason] = useState('')
  const [selectedLocation, setSelectedLocation] = useState({
    warehouse: undefined as string | undefined,
    zone: undefined as string | undefined,
    location: undefined as string | undefined,
  })

  // 로컬스토리지에서 적치 데이터 로드
  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem(`placement_${orderId}`)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setPlacementItems(parsedData)
      }
    } catch (error) {
      console.error('Error loading placement data:', error)
    }
  }, [orderId])

  const columns: TableColumnsType<PlacementItem> = [
    {
      title: t('productCode'),
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: t('productName'),
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
    },
    {
      title: t('supplier'),
      dataIndex: 'supplier',
      key: 'supplier',
      width: 100,
    },
    {
      title: t('locationSetting'),
      key: 'locationSetting',
      width: 300,
      render: () => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Select
            style={{ flex: 1, minWidth: '80px' }}
            placeholder={t('warehouse')}
            value={selectedLocation.warehouse}
            onChange={(value) => setSelectedLocation({ ...selectedLocation, warehouse: value })}
            options={[
              { label: t('warehouseA'), value: 'warehouse_a' },
              { label: t('warehouseB'), value: 'warehouse_b' },
            ]}
          />
          <Select
            style={{ flex: 1, minWidth: '80px' }}
            placeholder={t('zone')}
            value={selectedLocation.zone}
            onChange={(value) => setSelectedLocation({ ...selectedLocation, zone: value })}
            options={[
              { label: t('zone1'), value: 'zone_1' },
              { label: t('zone2'), value: 'zone_2' },
            ]}
          />
          <Select
            style={{ flex: 1, minWidth: '80px' }}
            placeholder={t('location')}
            value={selectedLocation.location}
            onChange={(value) => setSelectedLocation({ ...selectedLocation, location: value })}
            options={[
              { label: t('location1'), value: 'location_1' },
              { label: t('location2'), value: 'location_2' },
            ]}
          />
        </div>
      ),
    },
    {
      title: t('placementWaiting'),
      dataIndex: 'plannedQty',
      key: 'plannedQty',
      width: 100,
      align: 'right' as const,
    },
    {
      title: t('placementQty'),
      dataIndex: 'actualQty',
      key: 'actualQty',
      width: 100,
      render: (_, record) => (
        <InputNumber
          value={record.actualQty}
          onChange={(value) => {
            const updated = placementItems.map((item) =>
              item.key === record.key ? { ...item, actualQty: value || 0 } : item
            )
            setPlacementItems(updated)
            // 로컬스토리지에 저장
            localStorage.setItem(`placement_${orderId}`, JSON.stringify(updated))
          }}
          style={{ width: '100%' }}
        />
      ),
    },
  ]

  const handlePrevious = () => {
    // 현재 적치 데이터를 로컬스토리지에 저장
    localStorage.setItem(`placement_${orderId}`, JSON.stringify(placementItems))
    
    // 상태에 따라 다른 탭으로 이동
    if (status === 'placed') {
      // 적치 중 탭으로 돌아가기
      router.push('/inbound/execution?tab=placed')
    } else {
      // 기본적으로 이전 페이지로
      router.back()
    }
  }

  const handleConfirm = () => {
    try {
      // 현재 적치 데이터를 로컬스토리지에 저장
      const today = new Date()
      const completionDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
      
      const placementData = {
        orderId,
        items: placementItems,
        completedAt: new Date().toISOString(),
        placementCompletionDate: completionDate,
        placementWorker: worker,
        reason: reason,
        status: 'completed',
      }
      
      localStorage.setItem(`placement_${orderId}`, JSON.stringify(placementItems))
      
      // 적치 완료된 오더를 별도로 저장
      const completedPlacements = JSON.parse(localStorage.getItem('completedPlacements') || '[]')
      completedPlacements.push(placementData)
      localStorage.setItem('completedPlacements', JSON.stringify(completedPlacements))
      
      message.success(t('successMessage'))
      
      // 적치 완료 탭으로 이동
      router.push('/inbound/execution?tab=completed')
    } catch (error) {
      message.error(t('errorMessage'))
      console.error(error)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { title: t('breadcrumb.inbound') },
          { title: t('breadcrumb.inboundExecution') },
          { title: orderId },
        ]}
        style={{ marginBottom: '20px' }}
      />

      {/* Title */}
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        {orderId}
      </h1>

      {/* Top Info Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {/* Left side - Location info (3) */}
        <div style={{ flex: '0 0 calc(25% - 6px)', minWidth: '150px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: '#999', fontSize: '12px', fontWeight: '500' }}>{t('locationInfo')}</label>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            backgroundColor: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px', 
            border: '1px solid #e8e8e8',
            textAlign: 'center',
            fontWeight: '500',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            {t('barcodeScan')}
          </div>
        </div>

        {/* Right side - Barcode input (9) */}
        <div style={{ flex: '0 0 calc(75% - 6px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: '#999', fontSize: '12px', fontWeight: '500' }}>{t('locationCode')}</label>
          </div>
          <Input
            placeholder={t('barcodePlaceholder')}
            style={{
              borderColor: '#ffd666',
              backgroundColor: '#fffbe6',
              borderRadius: '4px',
              height: '60px',
              padding: '10px 12px'
            }}
          />
        </div>
      </div>

      {/* Location Info Section - 3:9 Layout */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {/* Left side - Label (3) */}
        <div style={{ flex: '0 0 calc(25% - 6px)', minWidth: '150px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: '#999', fontSize: '12px', fontWeight: '500' }}>{t('locationInfo')}</label>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            backgroundColor: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px', 
            border: '1px solid #e8e8e8',
            textAlign: 'center',
            fontWeight: '500',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ marginBottom: '8px' }}>{t('breadcrumb.inbound')}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{orderId}</div>
          </div>
        </div>

        {/* Right side - Details (9) */}
        <div style={{ flex: '0 0 calc(75% - 6px)' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: '#999', fontSize: '12px', fontWeight: '500' }}>{t('detailedInfo')}</label>
          </div>
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e8e8e8',
            borderRadius: '4px',
            padding: '12px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Row gutter={16} style={{ height: '100%' }}>
              <Col span={8}>
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ color: '#999', fontSize: '11px' }}>{t('inboundDate')}</label>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>2025.05.11</div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ color: '#999', fontSize: '11px' }}>{t('supplier')}</label>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>(주)트렌드마켓</div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ color: '#999', fontSize: '11px' }}>{t('status')}</label>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{t('placingStatus')}</div>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      {/* Placement Items Section */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, fontWeight: 'bold' }}>{t('placementItems')}</h3>
          <Button type="text" style={{ color: '#ff4d4f' }} disabled>
            {t('deleteSelected')}
          </Button>
        </div>

        <Card style={{ marginBottom: '20px' }}>
          <Table
            columns={columns}
            dataSource={placementItems}
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>

      {/* Worker and Reason Section */}
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#666', fontSize: '12px', fontWeight: '500' }}>{t('requiredWorker')}</label>
            </div>
            <Input
              placeholder={t('workerPlaceholder')}
              value={worker}
              onChange={(e) => setWorker(e.target.value)}
              disabled
              style={{ height: '36px' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#666', fontSize: '12px', fontWeight: '500' }}>{t('reason')}</label>
            </div>
            <Input
              placeholder={t('reasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ height: '36px' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}
      >
        <Button onClick={handlePrevious}>{t('previous')}</Button>
        <Button type="primary" onClick={handleConfirm}>
          {t('confirm')}
        </Button>
      </div>
    </div>
  )
}
