'use client'

import { useState } from 'react'
import { Card, Button, Breadcrumb, Row, Col, Form, Input, Select, message, Space, InputNumber, Table, Upload, Divider } from 'antd'
import { PrinterOutlined, PlusOutlined, DeleteOutlined, UploadOutlined, CloudDownloadOutlined } from '@ant-design/icons'
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

  // 엑셀 파일 업로드 핸들러
  const handleFileUpload = (file: any) => {
    message.success(`${file.name} 파일이 업로드되었습니다.`)
    // TODO: 엑셀 파싱 로직 추가
    return false // 자동 업로드 방지
  }

  // 데이터 추가 핸들러
  const handleAddItem = () => {
    dataForm.validateFields().then((values) => {
      const newItem: BarcodeItem = {
        id: Date.now().toString(),
        code: values.code,
        name: values.name,
        type: values.type,
        quantity: values.quantity || 1,
      }
      setBarcodeItems([...barcodeItems, newItem])
      dataForm.resetFields()
      message.success('바코드 데이터가 추가되었습니다.')
    }).catch(() => {
      message.error('모든 필드를 입력해주세요.')
    })
  }

  // 데이터 삭제 핸들러
  const handleDeleteItem = (id: string) => {
    setBarcodeItems(barcodeItems.filter((item) => item.id !== id))
    message.success('삭제되었습니다.')
  }

  // 인쇄 핸들러
  const handlePrint = () => {
    if (barcodeItems.length === 0) {
      message.warning('인쇄할 데이터가 없습니다.')
      return
    }
    message.success(`${barcodeItems.length}개 항목 인쇄를 시작합니다.`)
    // TODO: 실제 인쇄 로직 추가
  }

  // 엑셀 내보내기 핸들러
  const handleExportExcel = () => {
    if (barcodeItems.length === 0) {
      message.warning('내보낼 데이터가 없습니다.')
      return
    }
    message.success('엑셀 파일 다운로드를 시작합니다.')
    // TODO: 엑셀 export 로직 추가
  }

  const columns: TableColumnsType<BarcodeItem> = [
    {
      title: 'No.',
      dataIndex: 'id',
      key: 'id',
      width: '8%',
      render: (_, __, index) => index + 1,
    },
    {
      title: '바코드 번호',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1F2B60', fontSize: '12px' }}>{text}</span>
      ),
    },
    {
      title: '위치명',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ color: '#1F2B60', fontSize: '13px' }}>{text}</span>,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: '12%',
      render: (text: string) => (
        <span style={{ padding: '2px 8px', backgroundColor: '#E3F2FD', borderRadius: '4px', color: '#007BED', fontSize: '11px', fontWeight: 600 }}>
          {text}
        </span>
      ),
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      align: 'center',
      render: (text: number) => <span style={{ color: '#1F2B60', fontWeight: 600, fontSize: '13px' }}>{text}장</span>,
    },
    {
      title: '액션',
      key: 'action',
      width: '8%',
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDeleteItem(record.id)}
        />
      ),
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: '24px' }}>
          <Breadcrumb
            items={[
              { title: '창고관리' },
              { title: '바코드 생성 및 관리' },
            ]}
            style={{ marginBottom: '12px' }}
          />
          <h1 style={{
            color: '#1F2B60',
            fontSize: 40,
            fontFamily: 'Pretendard',
            fontWeight: 700,
            lineHeight: '52px',
            margin: 0,
            marginBottom: '4px',
          }}>
            바코드 생성 및 인쇄
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            바코드 생성 및 부착 - BoxHero 스타일의 직관적인 라벨 인쇄 도구
          </p>
        </div>

        {/* 상단: 용지 설정 + 라벨 디자인 + 미리보기 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          {/* 좌측: 용지 설정 */}
          <Col xs={24} sm={24} lg={8}>
            <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB', height: '100%' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ color: '#1F2B60', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                  1. 용지 설정
                </h3>
                <Form layout="vertical" size="small">
                  <Form.Item label="용지 크기" required style={{ marginBottom: '12px' }}>
                    <Select
                      value={designSettings.paperSize}
                      onChange={(val) => setDesignSettings({ ...designSettings, paperSize: val })}
                      options={[
                        { label: 'A4 (210x297mm)', value: 'a4' },
                        { label: 'A5 (148x210mm)', value: 'a5' },
                      ]}
                      size="small"
                    />
                  </Form.Item>

                  <Form.Item label="라벨 크기" required style={{ marginBottom: '12px' }}>
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
                      size="small"
                    />
                  </Form.Item>
                </Form>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div>
                <h3 style={{ color: '#1F2B60', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                  2. 라벨 디자인
                </h3>
                <Form layout="vertical" size="small">
                  <Form.Item style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={designSettings.showTitle}
                        onChange={(e) => setDesignSettings({ ...designSettings, showTitle: e.target.checked })}
                      />
                      <label style={{ marginBottom: 0, color: '#464C53', fontSize: '13px' }}>위치명 표시</label>
                    </div>
                  </Form.Item>

                  {designSettings.showTitle && (
                    <Form.Item label="크기 (pt)" style={{ marginBottom: '12px' }}>
                      <InputNumber
                        value={designSettings.titleSize}
                        onChange={(val) => setDesignSettings({ ...designSettings, titleSize: val || 10 })}
                        min={6}
                        max={20}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  )}

                  <Form.Item style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={designSettings.showBarcode}
                        onChange={(e) => setDesignSettings({ ...designSettings, showBarcode: e.target.checked })}
                      />
                      <label style={{ marginBottom: 0, color: '#464C53', fontSize: '13px' }}>바코드 표시</label>
                    </div>
                  </Form.Item>

                  {designSettings.showBarcode && (
                    <Form.Item label="크기" style={{ marginBottom: '12px' }}>
                      <Select
                        value={designSettings.barcodeSize}
                        onChange={(val) => setDesignSettings({ ...designSettings, barcodeSize: val })}
                        options={barcodeSizes}
                        size="small"
                      />
                    </Form.Item>
                  )}

                  <Form.Item style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={designSettings.showCode}
                        onChange={(e) => setDesignSettings({ ...designSettings, showCode: e.target.checked })}
                      />
                      <label style={{ marginBottom: 0, color: '#464C53', fontSize: '13px' }}>바코드 번호</label>
                    </div>
                  </Form.Item>

                  {designSettings.showCode && (
                    <Form.Item label="크기 (pt)" style={{ marginBottom: '12px' }}>
                      <InputNumber
                        value={designSettings.codeSize}
                        onChange={(val) => setDesignSettings({ ...designSettings, codeSize: val || 8 })}
                        min={6}
                        max={12}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  )}

                  <Form.Item style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={designSettings.showName}
                        onChange={(e) => setDesignSettings({ ...designSettings, showName: e.target.checked })}
                      />
                      <label style={{ marginBottom: 0, color: '#464C53', fontSize: '13px' }}>상품명 표시</label>
                    </div>
                  </Form.Item>

                  {designSettings.showName && (
                    <Form.Item label="크기 (pt)">
                      <InputNumber
                        value={designSettings.nameSize}
                        onChange={(val) => setDesignSettings({ ...designSettings, nameSize: val || 9 })}
                        min={6}
                        max={14}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  )}
                </Form>
              </div>
            </Card>
          </Col>

          {/* 중앙: 데이터 입력 */}
          <Col xs={24} sm={24} lg={8}>
            <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB', height: '100%' }}>
              <h3 style={{ color: '#1F2B60', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                3. 데이터 입력
              </h3>

              <div style={{ marginBottom: '12px' }}>
                <Upload
                  beforeUpload={handleFileUpload}
                  accept=".xlsx,.xls"
                  showUploadList={false}
                >
                  <Button
                    block
                    icon={<CloudDownloadOutlined />}
                    size="small"
                    style={{ marginBottom: '8px' }}
                  >
                    엑셀 파일 끌어서 올리기
                  </Button>
                </Upload>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <Form form={dataForm} layout="vertical" size="small">
                <Form.Item 
                  label="바코드 번호" 
                  name="code"
                  required 
                  rules={[{ required: true, message: '바코드 번호를 입력하세요' }]}
                  style={{ marginBottom: '10px' }}
                >
                  <Input placeholder="예: BAR-001-WH" size="small" />
                </Form.Item>
                <Form.Item 
                  label="위치명" 
                  name="name"
                  required 
                  rules={[{ required: true, message: '위치명을 입력하세요' }]}
                  style={{ marginBottom: '10px' }}
                >
                  <Input placeholder="예: A1층 위치 01" size="small" />
                </Form.Item>
                <Form.Item 
                  label="위치 유형" 
                  name="type"
                  required 
                  rules={[{ required: true, message: '위치 유형을 선택하세요' }]}
                  style={{ marginBottom: '10px' }}
                >
                  <Select
                    placeholder="선택"
                    size="small"
                    options={[
                      { label: '팔레트', value: '팔레트' },
                      { label: '대봉', value: '대봉' },
                      { label: '박스', value: '박스' },
                      { label: '선반', value: '선반' },
                    ]}
                  />
                </Form.Item>
                <Form.Item 
                  label="인쇄 수량" 
                  name="quantity"
                  required 
                  rules={[{ required: true, message: '인쇄 수량을 입력하세요' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <InputNumber min={1} max={100} defaultValue={1} size="small" style={{ width: '100%' }} />
                </Form.Item>
                <Button 
                  type="primary" 
                  block 
                  size="small" 
                  icon={<PlusOutlined />} 
                  style={{ backgroundColor: '#007BED' }}
                  onClick={handleAddItem}
                >
                  추가
                </Button>
              </Form>
            </Card>
          </Col>

          {/* 우측: 미리보기 */}
          <Col xs={24} sm={24} lg={8}>
            <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F8F9FA', height: '100%' }}>
              <h3 style={{ color: '#1F2B60', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                미리보기
              </h3>
              <div
                style={{
                  width: '100%',
                  height: '300px',
                  backgroundColor: '#FFFFFF',
                  border: '2px dashed #D9D9D9',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: `${designSettings.labelWidth * 1.5}px`,
                    height: `${designSettings.labelHeight * 1.5}px`,
                    border: '1px solid #1F2B60',
                    borderRadius: '3px',
                    padding: '6px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  {designSettings.showTitle && (
                    <div
                      style={{
                        fontSize: `${designSettings.titleSize * 1.2}px`,
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
                        fontSize: '20px',
                        letterSpacing: '1px',
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
                        fontSize: `${designSettings.codeSize * 1.2}px`,
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
                        fontSize: `${designSettings.nameSize * 1.2}px`,
                        color: '#464C53',
                      }}
                    >
                      팔레트
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 하단: 데이터 목록 + 인쇄 버튼 */}
        <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#1F2B60', fontSize: '14px', fontWeight: 600, margin: 0 }}>
              데이터 목록 ({barcodeItems.length}개)
            </h3>
            <Space>
              <Button icon={<UploadOutlined />} size="small" onClick={handleExportExcel}>
                엑셀 내보내기
              </Button>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                style={{ backgroundColor: '#007BED' }}
                size="small"
              >
                인쇄
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={barcodeItems}
            pagination={{ pageSize: 10, simple: true }}
            rowKey="id"
            size="small"
            style={{ backgroundColor: '#FFFFFF' }}
          />
        </Card>
      </div>
    </div>
  )
}
