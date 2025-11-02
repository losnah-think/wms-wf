'use client'

import { useState } from 'react'
import { Table, Button, Breadcrumb, Tag, Progress, Card, Space, Badge, Modal, Form, Input, Select, Row, Col, Statistic, Tabs } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined } from '@ant-design/icons'
import type { TableColumnsType, TabsProps } from 'antd'

interface WarehouseData {
  id: number
  name: string
  code: string
  status: 'syncing' | 'collecting' | 'error'
  statusText: string
  statusColor: 'cyan' | 'blue' | 'red'
  capacity: number
  capacityPercent: number
  totalItems: number
  occupiedItems: number
  manager: string
  phone: string
  address: string
  area: number
  temperature?: number
  humidity?: number
}

export default function WarehouseInfoPage() {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<WarehouseData | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('1')

  const warehouseData: WarehouseData[] = [
    {
      id: 1,
      name: '서울 센터',
      code: 'WH-001',
      status: 'syncing',
      statusText: '연동 중',
      statusColor: 'cyan',
      capacity: 1000,
      capacityPercent: 72,
      totalItems: 720,
      occupiedItems: 650,
      manager: '김관리',
      phone: '010-1111-1111',
      address: '서울시 강남구',
      area: 5000,
      temperature: 22,
      humidity: 45,
    },
    {
      id: 2,
      name: '인천 센터',
      code: 'WH-002',
      status: 'collecting',
      statusText: '수집 중',
      statusColor: 'blue',
      capacity: 1200,
      capacityPercent: 58,
      totalItems: 696,
      occupiedItems: 580,
      manager: '이관리',
      phone: '010-2222-2222',
      address: '인천시 남동구',
      area: 6000,
      temperature: 21,
      humidity: 48,
    },
    {
      id: 3,
      name: '부산 센터',
      code: 'WH-003',
      status: 'error',
      statusText: '오류',
      statusColor: 'red',
      capacity: 800,
      capacityPercent: 85,
      totalItems: 680,
      occupiedItems: 450,
      manager: '박관리',
      phone: '010-3333-3333',
      address: '부산시 중구',
      area: 4500,
    },
  ]

  const statusConfig = {
    cyan: { color: '#007C86', bgColor: '#E0F7FA', icon: <SyncOutlined /> },
    blue: { color: '#004B92', bgColor: '#E3F2FD', icon: <CheckCircleOutlined /> },
    red: { color: '#E02D3C', bgColor: '#FFEBEE', icon: <CloseCircleOutlined /> },
  }

  // 통계 계산
  const stats = {
    totalWarehouses: warehouseData.length,
    totalCapacity: warehouseData.reduce((sum, w) => sum + w.capacity, 0),
    totalOccupied: warehouseData.reduce((sum, w) => sum + w.totalItems, 0),
    avgUtilization: Math.round(warehouseData.reduce((sum, w) => sum + w.capacityPercent, 0) / warehouseData.length),
  }

  const handleEdit = (record: WarehouseData) => {
    setSelectedRecord(record)
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      manager: record.manager,
      phone: record.phone,
      address: record.address,
      area: record.area,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (record: WarehouseData) => {
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
      alert('창고 정보가 수정되었습니다.')
    })
  }

  const handleDeleteOk = () => {
    setIsDeleteModalOpen(false)
    alert('창고가 삭제되었습니다.')
  }

  const handleAddOk = () => {
    addForm.validateFields().then(() => {
      setIsAddModalOpen(false)
      alert('창고가 등록되었습니다.')
    })
  }

  const columns: TableColumnsType<WarehouseData> = [
    {
      title: '창고명',
      dataIndex: 'name',
      key: 'name',
      width: '12%',
      render: (text: string) => (
        <span style={{ color: '#1F2B60', fontWeight: 600, fontSize: 14 }}>{text}</span>
      ),
    },
    {
      title: '창고 코드',
      dataIndex: 'code',
      key: 'code',
      width: '10%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 14, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: string, record: WarehouseData) => (
        <Tag
          color={statusConfig[record.statusColor].bgColor}
          style={{
            color: statusConfig[record.statusColor].color,
            fontSize: 12,
            fontWeight: 600,
            border: `1px solid ${statusConfig[record.statusColor].color}20`,
            padding: '4px 12px',
          }}
          icon={statusConfig[record.statusColor].icon}
        >
          {record.statusText}
        </Tag>
      ),
    },
    {
      title: '용량 / 점유',
      key: 'capacity',
      width: '15%',
      render: (_: any, record: WarehouseData) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: '4px', color: '#1F2B60', fontWeight: 600 }}>
            {record.totalItems} / {record.capacity}
          </div>
          <Progress 
            percent={record.capacityPercent} 
            size="small" 
            strokeColor={record.capacityPercent > 80 ? '#ff4d4f' : '#1890ff'}
          />
        </div>
      ),
    },
    {
      title: '담당자',
      dataIndex: 'manager',
      key: 'manager',
      width: '10%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 14 }}>{text}</span>
      ),
    },
    {
      title: '연락처',
      dataIndex: 'phone',
      key: 'phone',
      width: '13%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 14 }}>{text}</span>
      ),
    },
    {
      title: '위치',
      dataIndex: 'address',
      key: 'address',
      width: '15%',
      render: (text: string) => (
        <span style={{ color: '#6B7178', fontSize: 12 }}>{text}</span>
      ),
    },
    {
      title: '액션',
      key: 'action',
      width: '15%',
      render: (_: any, record: WarehouseData) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ backgroundColor: '#5281C8' }}
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

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: '📊 창고 현황',
      children: (
        <div style={{ marginTop: '20px' }}>
          <Table
            columns={columns}
            dataSource={warehouseData}
            pagination={{ pageSize: 10, total: warehouseData.length }}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: '📈 상세 분석',
      children: (
        <div style={{ marginTop: '20px' }}>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {warehouseData.map((warehouse) => (
              <Col key={warehouse.id} xs={24} sm={12} lg={8}>
                <Card style={{ borderRadius: '10px', height: '100%' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1F2B60', marginBottom: '4px' }}>
                      {warehouse.name}
                    </div>
                    <Tag
                      color={statusConfig[warehouse.statusColor].bgColor}
                      style={{
                        color: statusConfig[warehouse.statusColor].color,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {warehouse.statusText}
                    </Tag>
                  </div>

                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '12px', color: '#6B7178', marginBottom: '4px' }}>주소</div>
                    <div style={{ fontSize: '13px', color: '#1F2B60', fontWeight: 500 }}>
                      {warehouse.address || '-'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6B7178', marginBottom: '8px' }}>점유율</div>
                    <Progress percent={warehouse.capacityPercent} />
                    <div style={{ fontSize: '12px', color: '#464C53', marginTop: '4px', textAlign: 'right' }}>
                      {warehouse.capacityPercent}%
                    </div>
                  </div>

                  {warehouse.temperature && (
                    <div style={{ fontSize: '12px', color: '#6B7178', marginBottom: '4px' }}>
                      🌡️ 온도: {warehouse.temperature}°C
                    </div>
                  )}
                  {warehouse.humidity && (
                    <div style={{ fontSize: '12px', color: '#6B7178' }}>
                      💧 습도: {warehouse.humidity}%
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
    {
      key: '3',
      label: '�� 필터링',
      children: (
        <div style={{ marginTop: '20px' }}>
          <Card style={{ marginBottom: '20px' }}>
            <Space wrap>
              <Select
                placeholder="상태 필터"
                allowClear
                style={{ width: 200 }}
                options={[
                  { value: 'syncing', label: '연동 중' },
                  { value: 'collecting', label: '수집 중' },
                  { value: 'error', label: '오류' },
                ]}
                onChange={setStatusFilter}
              />
              <Input.Search
                placeholder="창고명 검색..."
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button icon={<ReloadOutlined />}>새로고침</Button>
            </Space>
          </Card>

          <Table
            columns={columns}
            dataSource={warehouseData.filter(w => 
              (!statusFilter || w.status === statusFilter) &&
              (!searchText || w.name.includes(searchText))
            )}
            pagination={{ pageSize: 10 }}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </div>
      ),
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* 페이지 콘텐츠 */}
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '창고관리' },
              { title: '창고 정보 관리' },
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
            창고 정보 관리
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            창고 등록 및 담당자 관리 - 전체 창고의 현황과 상세 정보를 관리합니다
          </p>
        </div>

        {/* 통계 섹션 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>총 창고 수</span>}
                value={stats.totalWarehouses}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>전체 용량</span>}
                value={stats.totalCapacity}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>총 점유</span>}
                value={stats.totalOccupied}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>평균 점유율</span>}
                value={stats.avgUtilization}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 컨트롤 */}
        <Card style={{ marginBottom: '24px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Space wrap>
            <Badge count={warehouseData.length} style={{ backgroundColor: '#007BED' }} />
            <span style={{ color: '#6B7178', fontSize: '14px' }}>총 {warehouseData.length}개 창고</span>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#007BED' }}>
              창고 등록
            </Button>
            <Button icon={<DownloadOutlined />}>내보내기</Button>
            <Button icon={<ReloadOutlined />}>새로고침</Button>
          </Space>
        </Card>

        {/* 탭 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>

      {/* 창고 수정 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            창고 정보 수정
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
          <Form.Item label="창고명" name="name" rules={[{ required: true, message: '창고명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="창고 코드" name="code" rules={[{ required: true, message: '창고 코드를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="주소" name="address">
            <Input />
          </Form.Item>
          <Form.Item label="넓이 (m²)" name="area">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="담당자명" name="manager" rules={[{ required: true, message: '담당자명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="담당자 연락처" name="phone" rules={[{ required: true, message: '연락처를 입력하세요' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 창고 등록 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            새 창고 등록
          </span>
        }
        open={isAddModalOpen}
        onOk={handleAddOk}
        onCancel={() => setIsAddModalOpen(false)}
        okText="등록"
        cancelText="취소"
        okButtonProps={{ style: { backgroundColor: '#007BED' } }}
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="창고명" name="name" rules={[{ required: true, message: '창고명을 입력하세요' }]}>
            <Input placeholder="예: 서울 센터" />
          </Form.Item>
          <Form.Item label="창고 코드" name="code" rules={[{ required: true, message: '창고 코드를 입력하세요' }]}>
            <Input placeholder="예: WH-001" />
          </Form.Item>
          <Form.Item label="주소" name="address">
            <Input placeholder="예: 서울시 강남구" />
          </Form.Item>
          <Form.Item label="넓이 (m²)" name="area">
            <Input type="number" placeholder="5000" />
          </Form.Item>
          <Form.Item label="담당자명" name="manager" rules={[{ required: true, message: '담당자명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="담당자 연락처" name="phone" rules={[{ required: true, message: '연락처를 입력하세요' }]}>
            <Input placeholder="010-0000-0000" />
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
          {selectedRecord && `"${selectedRecord.name}" 창고를 삭제하시겠습니까?`}
        </p>
        <p style={{ fontFamily: 'Pretendard', color: '#6B7178', fontSize: 14 }}>
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  )
}
