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

interface InspectionItem {
  key: string
  productCode: string
  productName: string
  supplier: string
  quantityMethod: string
  loadType: string
  plannedQty: number
  actualQty: number
  inspectionMethod: string
}

const mockInspectionItems: InspectionItem[] = [
  {
    key: '1',
    productCode: '100000920001',
    productName: '심곰명버나나 심곰명\n심곰 운전',
    supplier: '공급처1',
    quantityMethod: '자동',
    loadType: '로드 번호',
    plannedQty: 10000,
    actualQty: 0,
    inspectionMethod: '검수 방법',
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
    inspectionMethod: '검수 방법',
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
    inspectionMethod: '검수 방법',
  },
]

export default function InboundExecutionDetailPage() {
  const t = useTranslations('inbound.inspection')
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = params.id as string
  const status = searchParams.get('status') || 'inspecting'

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>(mockInspectionItems)

  // 로컬스토리지에서 검수 데이터 로드
  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem(`inspection_${orderId}`)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setInspectionItems(parsedData)
      }
    } catch (error) {
      console.error('Error loading inspection data:', error)
    }
  }, [orderId])

  const columns: TableColumnsType<InspectionItem> = [
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
      title: t('inspectionMethod'),
      dataIndex: 'inspectionMethod',
      key: 'inspectionMethod',
      width: 120,
      render: () => (
        <Select
          style={{ width: '100%' }}
          placeholder={t('inspectionMethod')}
          options={[
            { label: t('inspectionMethod'), value: 'method1' },
            { label: '검사', value: 'method2' },
          ]}
        />
      ),
    },
    {
      title: t('inspectionWaiting'),
      dataIndex: 'plannedQty',
      key: 'plannedQty',
      width: 100,
      align: 'right' as const,
    },
    {
      title: t('inspectionQty'),
      dataIndex: 'actualQty',
      key: 'actualQty',
      width: 100,
      render: (_, record) => (
        <InputNumber
          value={record.actualQty}
          onChange={(value) => {
            const updated = inspectionItems.map((item) =>
              item.key === record.key ? { ...item, actualQty: value || 0 } : item
            )
            setInspectionItems(updated)
            // 로컬스토리지에 저장
            localStorage.setItem(`inspection_${orderId}`, JSON.stringify(updated))
          }}
          style={{ width: '100%' }}
        />
      ),
    },
  ]

  const handlePrevious = () => {
    // 현재 검수 데이터를 로컬스토리지에 저장
    localStorage.setItem(`inspection_${orderId}`, JSON.stringify(inspectionItems))
    
    // 상태에 따라 다른 탭으로 이동
    if (status === 'inspecting') {
      // 검수 중 탭으로 돌아가기
      router.push('/inbound/execution?tab=inspecting')
    } else {
      // 기본적으로 이전 페이지로
      router.back()
    }
  }

  const handleConfirm = () => {
    try {
      // 현재 검수 데이터를 로컬스토리지에 저장
      const inspectionData = {
        orderId,
        items: inspectionItems,
        completedAt: new Date().toISOString(),
        status: 'inspection_complete',
      }
      
      localStorage.setItem(`inspection_${orderId}`, JSON.stringify(inspectionItems))
      
      // 검수 완료된 오더를 별도로 저장
      const completedInspections = JSON.parse(localStorage.getItem('completedInspections') || '[]')
      completedInspections.push(inspectionData)
      localStorage.setItem('completedInspections', JSON.stringify(completedInspections))
      
      message.success(t('successMessage'))
      
      // 검수 완료 탭으로 이동
      router.push('/inbound/execution?tab=inspection_complete')
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
          { title: t('breadcrumb.execution') },
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
            <div style={{ marginBottom: '8px' }}>입고 오더</div>
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
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{t('inspectingStatus')}</div>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      {/* Inspection Items Section */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, fontWeight: 'bold' }}>{t('inspectionItems')}</h3>
          <Button type="text" style={{ color: '#ff4d4f' }} disabled>
            {t('deleteSelected')}
          </Button>
        </div>

        <Card style={{ marginBottom: '20px' }}>
          <Table
            columns={columns}
            dataSource={inspectionItems}
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
              defaultValue="로그인 사용자"
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
