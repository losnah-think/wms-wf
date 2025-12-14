'use client'

import React, { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
      title: '품목 코드',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '상품명/상품 속성',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
    },
    {
      title: '공급처',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 100,
    },
    {
      title: '검수 방법',
      dataIndex: 'inspectionMethod',
      key: 'inspectionMethod',
      width: 120,
      render: () => (
        <Select
          style={{ width: '100%' }}
          placeholder="검수 방법"
          options={[
            { label: '검수 방법', value: 'method1' },
            { label: '검사', value: 'method2' },
          ]}
        />
      ),
    },
    {
      title: '검수 대기',
      dataIndex: 'plannedQty',
      key: 'plannedQty',
      width: 100,
      align: 'right' as const,
    },
    {
      title: '검수 수량',
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
      
      message.success('검수가 확정되었습니다.')
      
      // 검수 완료 탭으로 이동
      router.push('/inbound/execution?tab=inspection_complete')
    } catch (error) {
      message.error('검수 저장 중 오류가 발생했습니다.')
      console.error(error)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { title: '입고' },
          { title: '입고 실행' },
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
            <label style={{ color: '#999', fontSize: '12px', fontWeight: '500' }}>로케이션 정보</label>
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
            바코드 스캔
          </div>
        </div>

        {/* Right side - Barcode input (9) */}
        <div style={{ flex: '0 0 calc(75% - 6px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ color: '#999', fontSize: '12px', fontWeight: '500' }}>{'{로케이션 코드}'}</label>
          </div>
          <Input
            placeholder="입력한 클릭 후, 바코드를 스캔해주세요."
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
            <label style={{ color: '#999', fontSize: '12px', fontWeight: '500' }}>로케이션 정보</label>
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
            <label style={{ color: '#999', fontSize: '12px', fontWeight: '500' }}>상세 정보</label>
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
                  <label style={{ color: '#999', fontSize: '11px' }}>입고 일자</label>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>2025.05.11</div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ color: '#999', fontSize: '11px' }}>공급업체</label>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>(주)트렌드마켓</div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ color: '#999', fontSize: '11px' }}>상태</label>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>검수 중</div>
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
          <h3 style={{ margin: 0, fontWeight: 'bold' }}>검수 대상 품목</h3>
          <Button type="text" style={{ color: '#ff4d4f' }} disabled>
            선택 삭제
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
              <label style={{ color: '#666', fontSize: '12px', fontWeight: '500' }}>* 작업자</label>
            </div>
            <Input
              placeholder="작업자를 입력해주세요"
              defaultValue="로그인 사용자"
              disabled
              style={{ height: '36px' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ color: '#666', fontSize: '12px', fontWeight: '500' }}>사유</label>
            </div>
            <Input
              placeholder="사유를 입력해주세요"
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
        <Button onClick={handlePrevious}>이전</Button>
        <Button type="primary" onClick={handleConfirm}>
          확정
        </Button>
      </div>
    </div>
  )
}
