'use client'

import React, { useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons'

interface Warehouse {
  id: string
  code: string
  name: string
  address: string
  city: string
  manager: string
  capacity: number
  currentStock: number
  status: 'active' | 'inactive' | 'maintenance'
  zoneCount: number
  locationCount: number
}

// 더미 데이터
const generateDummyWarehouses = (): Warehouse[] => {
  return [
    {
      id: 'WH-001',
      code: 'WH-001',
      name: '본점 창고',
      address: '서울시 강남구 테헤란로 123',
      city: '서울',
      manager: '김담당',
      capacity: 10000,
      currentStock: 7500,
      status: 'active',
      zoneCount: 5,
      locationCount: 120,
    },
    {
      id: 'WH-002',
      code: 'WH-002',
      name: '부산 물류센터',
      address: '부산시 해운대구 센텀로 456',
      city: '부산',
      manager: '이담당',
      capacity: 15000,
      currentStock: 12000,
      status: 'active',
      zoneCount: 8,
      locationCount: 200,
    },
    {
      id: 'WH-003',
      code: 'WH-003',
      name: '인천 물류센터',
      address: '인천시 연수구 센트럴로 789',
      city: '인천',
      manager: '박담당',
      capacity: 20000,
      currentStock: 15000,
      status: 'active',
      zoneCount: 10,
      locationCount: 300,
    },
    {
      id: 'WH-004',
      code: 'WH-004',
      name: '대구 센터',
      address: '대구시 수성구 달구벌대로 321',
      city: '대구',
      manager: '최담당',
      capacity: 8000,
      currentStock: 5000,
      status: 'active',
      zoneCount: 4,
      locationCount: 80,
    },
    {
      id: 'WH-005',
      code: 'WH-005',
      name: '임시 창고',
      address: '경기도 안산시 단원구 ...',
      city: '경기',
      manager: '정담당',
      capacity: 5000,
      currentStock: 2000,
      status: 'maintenance',
      zoneCount: 2,
      locationCount: 40,
    },
  ]
}

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(generateDummyWarehouses())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [form] = Form.useForm()

  // 통계 계산
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0)
  const totalStock = warehouses.reduce((sum, w) => sum + w.currentStock, 0)
  const activeWarehouses = warehouses.filter(w => w.status === 'active').length
  const utilizationRate = ((totalStock / totalCapacity) * 100).toFixed(1)

  const columns = [
    {
      title: '창고 코드',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: '창고명',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '위치',
      key: 'location',
      width: 250,
      render: (_: any, record: Warehouse) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: '#999' }} />
          <span style={{ fontSize: '12px' }}>{record.city} - {record.address}</span>
        </Space>
      ),
    },
    {
      title: '담당자',
      dataIndex: 'manager',
      key: 'manager',
      width: 100,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig: { [key: string]: { color: string; text: string } } = {
          active: { color: 'success', text: '운영중' },
          inactive: { color: 'default', text: '비활성' },
          maintenance: { color: 'warning', text: '정비중' },
        }
        const config = statusConfig[status]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '용량',
      key: 'capacity',
      width: 150,
      render: (_: any, record: Warehouse) => {
        const rate = (record.currentStock / record.capacity) * 100
        return (
          <div>
            <div style={{ fontSize: '12px' }}>
              {record.currentStock.toLocaleString()} / {record.capacity.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>
              {rate.toFixed(1)}% 사용중
            </div>
          </div>
        )
      },
    },
    {
      title: '구역/위치',
      key: 'zones',
      width: 120,
      render: (_: any, record: Warehouse) => (
        <div style={{ fontSize: '12px' }}>
          <div>{record.zoneCount}개 구역</div>
          <div style={{ color: '#999' }}>{record.locationCount}개 위치</div>
        </div>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Warehouse) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            수정
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ]

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    form.setFieldsValue(warehouse)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '창고 삭제',
      content: '정말로 이 창고를 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk() {
        setWarehouses(warehouses.filter(w => w.id !== id))
        message.success('창고가 삭제되었습니다.')
      },
    })
  }

  const handleSubmit = (values: any) => {
    if (editingWarehouse) {
      // 수정
      setWarehouses(warehouses.map(w =>
        w.id === editingWarehouse.id ? { ...w, ...values } : w
      ))
      message.success('창고 정보가 수정되었습니다.')
    } else {
      // 추가
      const newWarehouse: Warehouse = {
        id: `WH-${String(warehouses.length + 1).padStart(3, '0')}`,
        code: `WH-${String(warehouses.length + 1).padStart(3, '0')}`,
        ...values,
        currentStock: 0,
        zoneCount: 0,
        locationCount: 0,
      }
      setWarehouses([...warehouses, newWarehouse])
      message.success('새 창고가 추가되었습니다.')
    }
    setIsModalOpen(false)
    setEditingWarehouse(null)
    form.resetFields()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', padding: '20px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#1F2B60' }}>
              창고 관리
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              창고 정보 및 운영 현황을 관리합니다.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingWarehouse(null)
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            새 창고 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="총 창고 수"
                value={warehouses.length}
                suffix="개"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="운영 중"
                value={activeWarehouses}
                suffix="개"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="총 재고량"
                value={totalStock}
                suffix={`/ ${totalCapacity.toLocaleString()}`}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="평균 가동률"
                value={parseFloat(utilizationRate)}
                suffix="%"
                precision={1}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 테이블 */}
        <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <Table
            columns={columns}
            dataSource={warehouses}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}개`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 추가/수정 모달 */}
        <Modal
          title={editingWarehouse ? '창고 수정' : '새 창고 추가'}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingWarehouse(null)
            form.resetFields()
          }}
          onOk={() => form.submit()}
          okText={editingWarehouse ? '수정' : '추가'}
          cancelText="취소"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="창고명"
                  name="name"
                  rules={[{ required: true, message: '창고명을 입력하세요' }]}
                >
                  <Input placeholder="예: 본점 창고" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="도시"
                  name="city"
                  rules={[{ required: true, message: '도시를 입력하세요' }]}
                >
                  <Input placeholder="예: 서울" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="주소"
              name="address"
              rules={[{ required: true, message: '주소를 입력하세요' }]}
            >
              <Input placeholder="예: 서울시 강남구 테헤란로 123" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="담당자"
                  name="manager"
                  rules={[{ required: true, message: '담당자를 입력하세요' }]}
                >
                  <Input placeholder="예: 김담당" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="용량"
                  name="capacity"
                  rules={[{ required: true, message: '용량을 입력하세요' }]}
                >
                  <Input type="number" placeholder="10000" suffix="개" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="상태"
              name="status"
              rules={[{ required: true, message: '상태를 선택하세요' }]}
            >
              <Select placeholder="상태 선택">
                <Select.Option value="active">운영중</Select.Option>
                <Select.Option value="inactive">비활성</Select.Option>
                <Select.Option value="maintenance">정비중</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}
