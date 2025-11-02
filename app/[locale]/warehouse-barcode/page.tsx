'use client'

import { useState } from 'react'
import { Card, Button, Breadcrumb, Row, Col, Form, Input, Select, message, Space, Upload, InputNumber, Table, Radio, Divider } from 'antd'
import { PrinterOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'

interface BarcodeItem {
  id: string
  code: string
  name: string
  type: string
  quantity: number
}

interface DesignSettings {
  paperSize: string
  labelSize: string
  labelWidth: number
  labelHeight: number
  showTitle: boolean
  titleSize: number
  showBarcode: boolean
  barcodeSize: string
  showCode: boolean
  codeSize: number
  showName: boolean
  nameSize: number
}

const labelSizes = [
  { label: '4x6 (102x152mm)', value: '4x6', width: 102, height: 152 },
  { label: '3x4 (76x102mm)', value: '3x4', width: 76, height: 102 },
  { label: '2x3 (50x75mm)', value: '2x3', width: 50, height: 75 },
  { label: '1x2 (25x50mm)', value: '1x2', width: 25, height: 50 },
]

const barcodeSizes = [
  { label: '소 (Small)', value: 'small' },
  { label: '중 (Medium)', value: 'medium' },
  { label: '대 (Large)', value: 'large' },
]

export default function WarehouseBarcodeManagementPage() {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [barcodeItems, setBarcodeItems] = useState<BarcodeItem[]>([
    { id: '1', code: 'BAR-001-WH', name: 'A1층 위치 01', type: '팔레트', quantity: 10 },
    { id: '2', code: 'BAR-002-WH', name: 'A1층 위치 02', type: '대봉', quantity: 5 },
    { id: '3', code: 'BAR-003-WH', name: 'B2층 위치 03', type: '박스', quantity: 20 },
  ])
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    paperSize: 'a4',
    labelSize: '4x6',
    labelWidth: 102,
    labelHeight: 152,
    showTitle: true,
    titleSize: 10,
    showBarcode: true,
    barcodeSize: 'medium',
    showCode: true,
    codeSize: 8,
    showName: true,
    nameSize: 9,
  })
  const [designForm] = Form.useForm()
  const [dataForm] = Form.useForm()

  // 스텝 1: 용지 설정
  const PaperSettingsStep = () => (
    <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#1F2B60', marginBottom: '16px' }}>용지 선택</h3>
        <Radio.Group
          value={designSettings.paperSize}
          onChange={(e) => setDesignSettings({ ...designSettings, paperSize: e.target.value })}
          style={{ width: '100%' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div
                style={{
                  padding: '16px',
                  border: designSettings.paperSize === 'a4' ? '2px solid #007BED' : '1px solid #E5E7EB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: designSettings.paperSize === 'a4' ? '#F0F7FF' : '#FFFFFF',
                }}
              >
                <Radio value="a4">
                  <div style={{ fontWeight: 600, color: '#1F2B60', marginBottom: '4px' }}>A4 (210x297mm)</div>
                  <div style={{ fontSize: '12px', color: '#6B7178' }}>표준 용지 - 라벨 용지</div>
                </Radio>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  padding: '16px',
                  border: designSettings.paperSize === 'a5' ? '2px solid #007BED' : '1px solid #E5E7EB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: designSettings.paperSize === 'a5' ? '#F0F7FF' : '#FFFFFF',
                }}
              >
                <Radio value="a5">
                  <div style={{ fontWeight: 600, color: '#1F2B60', marginBottom: '4px' }}>A5 (148x210mm)</div>
                  <div style={{ fontSize: '12px', color: '#6B7178' }}>카드 크기</div>
                </Radio>
              </div>
            </Col>
          </Row>
        </Radio.Group>
      </div>

      <Divider />

      <div>
        <h3 style={{ color: '#1F2B60', marginBottom: '16px' }}>라벨 크기</h3>
        <Form layout="vertical">
          <Form.Item label="라벨 크기 선택" required>
            <Select
              value={designSettings.labelSize}
              onChange={(value) => {
                const selectedLabel = labelSizes.find((s) => s.value === value)
                if (selectedLabel) {
                  setDesignSettings({
                    ...designSettings,
                    labelSize: value,
                    labelWidth: selectedLabel.width,
                    labelHeight: selectedLabel.height,
                  })
                }
              }}
              options={labelSizes}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <Button
          type="primary"
          size="large"
          onClick={() => setCurrentStep(1)}
          style={{ backgroundColor: '#007BED', minWidth: '120px' }}
        >
          다음: 라벨 디자인
        </Button>
      </div>
    </Card>
  )

  // 스텝 2: 라벨 디자인
  const DesignStep = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* 왼쪽: 설정 */}
      <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ color: '#1F2B60', marginBottom: '16px' }}>라벨 디자인</h3>
        <Form form={designForm} layout="vertical">
          <Form.Item label="제목 표시">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#F8F9FA',
                borderRadius: '6px',
              }}
            >
              <input
                type="checkbox"
                checked={designSettings.showTitle}
                onChange={(e) => setDesignSettings({ ...designSettings, showTitle: e.target.checked })}
              />
              <span style={{ color: '#1F2B60', marginBottom: 0 }}>위치명 표시</span>
            </div>
          </Form.Item>

          {designSettings.showTitle && (
            <Form.Item label="제목 크기 (pt)">
              <InputNumber
                value={designSettings.titleSize}
                onChange={(val) => setDesignSettings({ ...designSettings, titleSize: val || 10 })}
                min={6}
                max={20}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}

          <Divider />

          <Form.Item label="바코드 표시">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#F8F9FA',
                borderRadius: '6px',
              }}
            >
              <input
                type="checkbox"
                checked={designSettings.showBarcode}
                onChange={(e) => setDesignSettings({ ...designSettings, showBarcode: e.target.checked })}
              />
              <span style={{ color: '#1F2B60', marginBottom: 0 }}>바코드 표시</span>
            </div>
          </Form.Item>

          {designSettings.showBarcode && (
            <Form.Item label="바코드 크기">
              <Select
                value={designSettings.barcodeSize}
                onChange={(val) => setDesignSettings({ ...designSettings, barcodeSize: val })}
                options={barcodeSizes}
              />
            </Form.Item>
          )}

          <Form.Item label="바코드 텍스트 표시">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#F8F9FA',
                borderRadius: '6px',
              }}
            >
              <input
                type="checkbox"
                checked={designSettings.showCode}
                onChange={(e) => setDesignSettings({ ...designSettings, showCode: e.target.checked })}
              />
              <span style={{ color: '#1F2B60', marginBottom: 0 }}>바코드 번호 표시</span>
            </div>
          </Form.Item>

          {designSettings.showCode && (
            <Form.Item label="바코드 텍스트 크기 (pt)">
              <InputNumber
                value={designSettings.codeSize}
                onChange={(val) => setDesignSettings({ ...designSettings, codeSize: val || 8 })}
                min={6}
                max={12}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}

          <Divider />

          <Form.Item label="상품명 표시">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#F8F9FA',
                borderRadius: '6px',
              }}
            >
              <input
                type="checkbox"
                checked={designSettings.showName}
                onChange={(e) => setDesignSettings({ ...designSettings, showName: e.target.checked })}
              />
              <span style={{ color: '#1F2B60', marginBottom: 0 }}>상품명 표시</span>
            </div>
          </Form.Item>

          {designSettings.showName && (
            <Form.Item label="상품명 크기 (pt)">
              <InputNumber
                value={designSettings.nameSize}
                onChange={(val) => setDesignSettings({ ...designSettings, nameSize: val || 9 })}
                min={6}
                max={14}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}
        </Form>

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <Button onClick={() => setCurrentStep(0)} style={{ flex: 1 }}>
            이전
          </Button>
          <Button
            type="primary"
            onClick={() => setCurrentStep(2)}
            style={{ flex: 1, backgroundColor: '#007BED' }}
          >
            다음: 데이터 입력
          </Button>
        </div>
      </Card>

      {/* 오른쪽: 미리보기 */}
      <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F8F9FA' }}>
        <h3 style={{ color: '#1F2B60', marginBottom: '16px' }}>미리보기</h3>
        <div
          style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#FFFFFF',
            border: '2px dashed #D9D9D9',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              width: `${designSettings.labelWidth * 2}px`,
              height: `${designSettings.labelHeight * 2}px`,
              border: '1px solid #1F2B60',
              borderRadius: '4px',
              padding: '8px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-around',
              textAlign: 'center',
            }}
          >
            {designSettings.showTitle && (
              <div
                style={{
                  fontSize: `${designSettings.titleSize * 1.5}px`,
                  fontWeight: 600,
                  color: '#1F2B60',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                }}
              >
                A1층 위치 01
              </div>
            )}

            {designSettings.showBarcode && (
              <div
                style={{
                  fontSize: '32px',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                  color: '#1F2B60',
                  fontFamily: 'monospace',
                }}
              >
                ▓▒░▒▓
              </div>
            )}

            {designSettings.showCode && (
              <div
                style={{
                  fontSize: `${designSettings.codeSize * 1.5}px`,
                  color: '#1F2B60',
                  fontFamily: 'monospace',
                }}
              >
                BAR-001-WH
              </div>
            )}

            {designSettings.showName && (
              <div
                style={{
                  fontSize: `${designSettings.nameSize * 1.5}px`,
                  color: '#464C53',
                }}
              >
                팔레트
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )

  // 스텝 3: 데이터 입력
  const DataInputStep = () => {
    const columns: TableColumnsType<BarcodeItem> = [
      {
        title: 'No.',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
        render: (_, __, index) => index + 1,
      },
      {
        title: '바코드 번호',
        dataIndex: 'code',
        key: 'code',
        render: (text: string) => (
          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1F2B60' }}>{text}</span>
        ),
      },
      {
        title: '위치명',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <span style={{ color: '#1F2B60' }}>{text}</span>,
      },
      {
        title: '위치 유형',
        dataIndex: 'type',
        key: 'type',
        render: (text: string) => (
          <span style={{ padding: '4px 12px', backgroundColor: '#E3F2FD', borderRadius: '4px', color: '#007BED', fontSize: '12px', fontWeight: 600 }}>
            {text}
          </span>
        ),
      },
      {
        title: '인쇄 수량',
        dataIndex: 'quantity',
        key: 'quantity',
        width: '15%',
        render: (text: number) => <span style={{ color: '#1F2B60', fontWeight: 600 }}>{text}장</span>,
      },
      {
        title: '액션',
        key: 'action',
        width: '15%',
        render: (_, record) => (
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => setBarcodeItems(barcodeItems.filter((item) => item.id !== record.id))}
          >
            삭제
          </Button>
        ),
      },
    ]

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* 왼쪽: 데이터 입력 */}
        <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ color: '#1F2B60', marginBottom: '16px' }}>데이터 입력</h3>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2B60', marginBottom: '12px' }}>방법 선택</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                block
                icon={<UploadOutlined />}
                style={{ height: '40px', textAlign: 'left' }}
              >
                엑셀 파일 업로드
              </Button>
              <Button
                block
                icon={<PlusOutlined />}
                style={{ height: '40px', textAlign: 'left' }}
              >
                수동으로 추가
              </Button>
            </Space>
          </div>

          <Divider />

          <Form form={dataForm} layout="vertical">
            <Form.Item label="바코드 번호" required>
              <Input placeholder="예: BAR-001-WH" />
            </Form.Item>
            <Form.Item label="위치명" required>
              <Input placeholder="예: A1층 위치 01" />
            </Form.Item>
            <Form.Item label="위치 유형" required>
              <Select
                placeholder="선택"
                options={[
                  { label: '팔레트', value: '팔레트' },
                  { label: '대봉', value: '대봉' },
                  { label: '박스', value: '박스' },
                  { label: '선반', value: '선반' },
                ]}
              />
            </Form.Item>
            <Form.Item label="인쇄 수량" required>
              <InputNumber min={1} max={100} defaultValue={1} style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" style={{ backgroundColor: '#007BED', width: '100%' }}>
              추가
            </Button>
          </Form>

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
            <Button onClick={() => setCurrentStep(1)} style={{ flex: 1 }}>
              이전
            </Button>
            <Button
              type="primary"
              onClick={() => message.success('인쇄 준비가 완료되었습니다!')}
              icon={<PrinterOutlined />}
              style={{ flex: 1, backgroundColor: '#007BED' }}
            >
              인쇄
            </Button>
          </div>
        </Card>

        {/* 오른쪽: 데이터 목록 */}
        <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ color: '#1F2B60', marginBottom: '16px' }}>데이터 목록 ({barcodeItems.length})</h3>
          <Table
            columns={columns}
            dataSource={barcodeItems}
            pagination={{ pageSize: 5 }}
            rowKey="id"
            size="small"
          />
        </Card>
      </div>
    )
  }

  const steps = [
    {
      title: '1. 용지 설정',
      description: '라벨 용지와 크기를 선택합니다',
    },
    {
      title: '2. 라벨 디자인',
      description: '라벨의 레이아웃을 커스터마이징합니다',
    },
    {
      title: '3. 데이터 입력',
      description: '인쇄할 바코드 데이터를 입력합니다',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: '32px' }}>
          <Breadcrumb
            items={[
              { title: '창고관리' },
              { title: '바코드 생성 및 관리' },
            ]}
            style={{ marginBottom: '16px' }}
          />
          <h1 style={{
            color: '#1F2B60',
            fontSize: 40,
            fontFamily: 'Pretendard',
            fontWeight: 700,
            lineHeight: '52px',
            margin: 0,
            marginBottom: '8px',
          }}>
            바코드 생성 및 인쇄
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            바코드 생성 및 부착 - BoxHero 스타일의 직관적인 라벨 인쇄 도구
          </p>
        </div>

        {/* 진행 상황 */}
        <Card style={{ marginBottom: '32px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {steps.map((step, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: index <= currentStep ? '#007BED' : '#E5E7EB',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ marginLeft: '12px', flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1F2B60' }}>{step.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B7178' }}>{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    style={{
                      height: '2px',
                      flex: 1,
                      backgroundColor: index < currentStep ? '#007BED' : '#E5E7EB',
                      margin: '0 16px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 스텝별 콘텐츠 */}
        {currentStep === 0 && <PaperSettingsStep />}
        {currentStep === 1 && <DesignStep />}
        {currentStep === 2 && <DataInputStep />}
      </div>
    </div>
  )
}
