'use client'

import { useState } from 'react'
import { Table, Button, Breadcrumb, Tag, Card, Space, Modal, Form, Input, Row, Col, Statistic, Upload, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined, PrinterOutlined, DownloadOutlined, ScanOutlined, UploadOutlined } from '@ant-design/icons'
import type { TableColumnsType, UploadFile } from 'antd'

interface BarcodeData {
  id: number
  barcodeNumber: string
  locationCode: string
  locationName: string
  aisle: string
  rack: number
  level: number
  locationType: 'pallet' | 'daebong' | 'box' | 'shelf'
  typeText: string
  typeColor: 'green' | 'orange' | 'blue' | 'purple'
  capacity: number
  createdDate: string
  status: 'active' | 'inactive'
  statusText: string
}

const locationTypeConfig = {
  pallet: { text: '팔레트', color: 'green', icon: '📦' },
  daebong: { text: '대봉', color: 'orange', icon: '🏗️' },
  box: { text: '박스', color: 'blue', icon: '📫' },
  shelf: { text: '선반', color: 'purple', icon: '🛒' },
}

export default function WarehouseBarcodeManagementPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<BarcodeData | null>(null)
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('1')

  const barcodeData: BarcodeData[] = [
    {
      id: 1,
      barcodeNumber: 'BAR-001-WH',
      locationCode: 'LOC-A1-01',
      locationName: 'A1층 위치 01',
      aisle: 'A',
      rack: 1,
      level: 1,
      locationType: 'pallet',
      typeText: '팔레트',
      typeColor: 'green',
      capacity: 1000,
      createdDate: '2025-10-15',
      status: 'active',
      statusText: '활성화',
    },
    {
      id: 2,
      barcodeNumber: 'BAR-002-WH',
      locationCode: 'LOC-A1-02',
      locationName: 'A1층 위치 02',
      aisle: 'A',
      rack: 1,
      level: 2,
      locationType: 'daebong',
      typeText: '대봉',
      typeColor: 'orange',
      capacity: 800,
      createdDate: '2025-10-16',
      status: 'active',
      statusText: '활성화',
    },
    {
      id: 3,
      barcodeNumber: 'BAR-003-WH',
      locationCode: 'LOC-B2-03',
      locationName: 'B2층 위치 03',
      aisle: 'B',
      rack: 2,
      level: 3,
      locationType: 'box',
      typeText: '박스',
      typeColor: 'blue',
      capacity: 500,
      createdDate: '2025-10-17',
      status: 'active',
      statusText: '활성화',
    },
  ]

  const stats = {
    totalBarcodes: barcodeData.length,
    activeBarcodes: barcodeData.filter(b => b.status === 'active').length,
    inactiveBarcodes: barcodeData.filter(b => b.status === 'inactive').length,
    totalLocations: new Set(barcodeData.map(b => b.locationCode)).size,
  }

  const handleEdit = (record: BarcodeData) => {
    setSelectedRecord(record)
    form.setFieldsValue({
      barcodeNumber: record.barcodeNumber,
      locationCode: record.locationCode,
      locationName: record.locationName,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (record: BarcodeData) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  const handleAdd = () => {
    addForm.resetFields()
    setIsAddModalOpen(true)
  }

  const handleEditOk = () => {
    form.validateFields().then(() => {
      setIsEditModalOpen(false)
      message.success('바코드 정보가 수정되었습니다.')
    })
  }

  const handleDeleteOk = () => {
    setIsDeleteModalOpen(false)
    message.success('바코드가 삭제되었습니다.')
  }

  const handleAddOk = () => {
    addForm.validateFields().then(() => {
      setIsAddModalOpen(false)
      message.success('바코드가 등록되었습니다.')
    })
  }

  const columns: TableColumnsType<BarcodeData> = [
    {
      title: '바코드 번호',
      dataIndex: 'barcodeNumber',
      key: 'barcodeNumber',
      width: '15%',
      render: (text: string) => (
        <span style={{ color: '#1F2B60', fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: '위치 코드',
      dataIndex: 'locationCode',
      key: 'locationCode',
      width: '12%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 14, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: '위치명',
      dataIndex: 'locationName',
      key: 'locationName',
      width: '14%',
      render: (text: string) => (
        <span style={{ color: '#1F2B60', fontSize: 14 }}>{text}</span>
      ),
    },
    {
      title: '위치 유형',
      key: 'locationType',
      width: '12%',
      render: (_: any, record: BarcodeData) => (
        <Tag
          color={locationTypeConfig[record.locationType].color}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
          }}
        >
          {locationTypeConfig[record.locationType].icon} {record.typeText}
        </Tag>
      ),
    },
    {
      title: '통로/랙/레벨',
      key: 'hierarchy',
      width: '12%',
      render: (_: any, record: BarcodeData) => (
        <span style={{ color: '#464C53', fontSize: 14 }}>
          {record.aisle} / {record.rack} / {record.level}
        </span>
      ),
    },
    {
      title: '용량',
      dataIndex: 'capacity',
      key: 'capacity',
      width: '10%',
      render: (text: number) => (
        <span style={{ color: '#6B7178', fontSize: 14 }}>{text}개</span>
      ),
    },
    {
      title: '상태',
      key: 'status',
      width: '10%',
      render: (_: any, record: BarcodeData) => (
        <Tag color={record.status === 'active' ? 'green' : 'red'}>
          {record.statusText}
        </Tag>
      ),
    },
    {
      title: '액션',
      key: 'action',
      width: '15%',
      render: (_: any, record: BarcodeData) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<PrinterOutlined />}
            style={{ backgroundColor: '#5281C8' }}
          >
            인쇄
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            수정
          </Button>
          <Button
            type="default"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            danger
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '창고관리' },
              { title: '위치 바코드 관리' },
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
            위치 바코드 관리
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            [Step 4/6] 바코드 생성 및 부착 - 창고 위치별 바코드를 생성, 관리 및 인쇄합니다
          </p>
        </div>

        {/* 통계 섹션 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>총 바코드</span>}
                value={stats.totalBarcodes}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>활성화</span>}
                value={stats.activeBarcodes}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>비활성화</span>}
                value={stats.inactiveBarcodes}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>등록된 위치</span>}
                value={stats.totalLocations}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 컨트롤 */}
        <Card style={{ marginBottom: '24px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#007BED' }}>
              바코드 생성
            </Button>
            <Button icon={<ScanOutlined />}>바코드 스캔</Button>
            <Button icon={<PrinterOutlined />}>일괄 인쇄</Button>
            <Button icon={<DownloadOutlined />}>내보내기</Button>
          </Space>
        </Card>

        {/* 테이블 */}
        <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Table
            columns={columns}
            dataSource={barcodeData}
            pagination={{ pageSize: 10, total: barcodeData.length }}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>

      {/* 바코드 수정 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            바코드 정보 수정
          </span>
        }
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText="저장"
        cancelText="취소"
        okButtonProps={{ style: { backgroundColor: '#007BED' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="바코드 번호" name="barcodeNumber" rules={[{ required: true, message: '바코드 번호를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="위치 코드" name="locationCode" rules={[{ required: true, message: '위치 코드를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="위치명" name="locationName" rules={[{ required: true, message: '위치명을 입력하세요' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 바코드 생성 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            새 바코드 생성
          </span>
        }
        open={isAddModalOpen}
        onOk={handleAddOk}
        onCancel={() => setIsAddModalOpen(false)}
        okText="생성"
        cancelText="취소"
        okButtonProps={{ style: { backgroundColor: '#007BED' } }}
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="위치 코드" name="locationCode" rules={[{ required: true, message: '위치 코드를 입력하세요' }]}>
            <Input placeholder="예: LOC-A1-01" />
          </Form.Item>
          <Form.Item label="위치명" name="locationName" rules={[{ required: true, message: '위치명을 입력하세요' }]}>
            <Input placeholder="예: A1층 위치 01" />
          </Form.Item>
          <Form.Item label="위치 유형" name="locationType" rules={[{ required: true, message: '위치 유형을 선택하세요' }]}>
            <Input placeholder="예: 팔레트" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#E02D3C' }} />
            삭제 확인
          </span>
        }
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="삭제"
        cancelText="취소"
        okButtonProps={{ style: { backgroundColor: '#E02D3C' } }}
      >
        <p style={{ fontFamily: 'Pretendard', marginTop: 16 }}>
          {selectedRecord && `"${selectedRecord.barcodeNumber}" 바코드를 삭제하시겠습니까?`}
        </p>
        <p style={{ fontFamily: 'Pretendard', color: '#6B7178', fontSize: 14 }}>
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  )
}
