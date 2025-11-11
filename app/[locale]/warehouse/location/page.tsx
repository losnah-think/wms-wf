'use client'

import React, { useState } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons'

interface Location {
  id: string
  code: string
  warehouse: string
  zone: string
  aisle: string
  rack: string
  shelf: string
  bin: string
  type: 'storage' | 'picking' | 'receiving' | 'shipping' | 'returns'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  capacity: number
  currentStock: number
  productName?: string
}

const generateDummyLocations = (): Location[] => {
  const warehouses = ['본점 창고', '부산 물류센터', '인천 물류센터']
  const zones = ['A', 'B', 'C', 'D', 'E']
  const types: Array<'storage' | 'picking' | 'receiving' | 'shipping' | 'returns'> = ['storage', 'picking', 'receiving', 'shipping', 'returns']
  const statuses: Array<'available' | 'occupied' | 'reserved' | 'maintenance'> = ['available', 'occupied', 'reserved', 'maintenance']
  
  return Array.from({ length: 50 }, (_, i) => {
    const zone = zones[i % zones.length]
    const aisle = String(Math.floor(i / 10) + 1).padStart(2, '0')
    const rack = String((i % 10) + 1).padStart(2, '0')
    const shelf = String((i % 5) + 1)
    const bin = String((i % 3) + 1)
    
    return {
      id: `LOC-${i + 1}`,
      code: `${zone}-${aisle}-${rack}-${shelf}-${bin}`,
      warehouse: warehouses[i % warehouses.length],
      zone,
      aisle,
      rack,
      shelf,
      bin,
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      capacity: 100,
      currentStock: statuses[i % statuses.length] === 'occupied' ? Math.floor(Math.random() * 100) : 0,
      productName: statuses[i % statuses.length] === 'occupied' ? `상품 ${i + 1}` : undefined,
    }
  })
}

export default function LocationManagementPage() {
  const [locations, setLocations] = useState<Location[]>(generateDummyLocations())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [form] = Form.useForm()

  const columns = [
    {
      title: '위치 코드',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: '창고',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 120,
    },
    {
      title: '구역',
      dataIndex: 'zone',
      key: 'zone',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeConfig: { [key: string]: { color: string; text: string } } = {
          storage: { color: 'blue', text: '보관' },
          picking: { color: 'green', text: '피킹' },
          receiving: { color: 'purple', text: '입고' },
          shipping: { color: 'orange', text: '출고' },
          returns: { color: 'red', text: '반품' },
        }
        const config = typeConfig[type]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig: { [key: string]: { color: string; text: string } } = {
          available: { color: 'success', text: '사용가능' },
          occupied: { color: 'processing', text: '사용중' },
          reserved: { color: 'warning', text: '예약됨' },
          maintenance: { color: 'default', text: '정비중' },
        }
        const config = statusConfig[status]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '재고',
      key: 'stock',
      width: 120,
      render: (_: any, record: Location) => (
        <div style={{ fontSize: '12px' }}>
          {record.currentStock} / {record.capacity}
          <div style={{ fontSize: '11px', color: '#999' }}>
            {((record.currentStock / record.capacity) * 100).toFixed(0)}%
          </div>
        </div>
      ),
    },
    {
      title: '상품',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      render: (text: string) => text || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Location) => (
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

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    form.setFieldsValue(location)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '위치 삭제',
      content: '정말로 이 위치를 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk() {
        setLocations(locations.filter(l => l.id !== id))
        message.success('위치가 삭제되었습니다.')
      },
    })
  }

  const handleSubmit = (values: any) => {
    const code = `${values.zone}-${values.aisle}-${values.rack}-${values.shelf}-${values.bin}`
    
    if (editingLocation) {
      setLocations(locations.map(l =>
        l.id === editingLocation.id ? { ...l, ...values, code } : l
      ))
      message.success('위치 정보가 수정되었습니다.')
    } else {
      const newLocation: Location = {
        id: `LOC-${locations.length + 1}`,
        code,
        ...values,
        currentStock: 0,
      }
      setLocations([...locations, newLocation])
      message.success('새 위치가 추가되었습니다.')
    }
    
    setIsModalOpen(false)
    setEditingLocation(null)
    form.resetFields()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', padding: '20px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#1F2B60' }}>
              <EnvironmentOutlined /> 위치 관리
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              창고 내 위치 정보를 관리합니다.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingLocation(null)
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            새 위치 추가
          </Button>
        </div>

        {/* 테이블 */}
        <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <Table
            columns={columns}
            dataSource={locations}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}개`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 추가/수정 모달 */}
        <Modal
          title={editingLocation ? '위치 수정' : '새 위치 추가'}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingLocation(null)
            form.resetFields()
          }}
          onOk={() => form.submit()}
          okText={editingLocation ? '수정' : '추가'}
          cancelText="취소"
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="창고"
              name="warehouse"
              rules={[{ required: true, message: '창고를 선택하세요' }]}
            >
              <Select placeholder="창고 선택">
                <Select.Option value="본점 창고">본점 창고</Select.Option>
                <Select.Option value="부산 물류센터">부산 물류센터</Select.Option>
                <Select.Option value="인천 물류센터">인천 물류센터</Select.Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="구역"
                  name="zone"
                  rules={[{ required: true, message: '구역을 입력하세요' }]}
                >
                  <Input placeholder="A" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="통로"
                  name="aisle"
                  rules={[{ required: true, message: '통로를 입력하세요' }]}
                >
                  <Input placeholder="01" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="랙"
                  name="rack"
                  rules={[{ required: true, message: '랙을 입력하세요' }]}
                >
                  <Input placeholder="01" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="선반"
                  name="shelf"
                  rules={[{ required: true, message: '선반을 입력하세요' }]}
                >
                  <Input placeholder="1" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="빈"
                  name="bin"
                  rules={[{ required: true, message: '빈을 입력하세요' }]}
                >
                  <Input placeholder="1" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="타입"
                  name="type"
                  rules={[{ required: true, message: '타입을 선택하세요' }]}
                >
                  <Select placeholder="타입 선택">
                    <Select.Option value="storage">보관</Select.Option>
                    <Select.Option value="picking">피킹</Select.Option>
                    <Select.Option value="receiving">입고</Select.Option>
                    <Select.Option value="shipping">출고</Select.Option>
                    <Select.Option value="returns">반품</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="상태"
                  name="status"
                  rules={[{ required: true, message: '상태를 선택하세요' }]}
                >
                  <Select placeholder="상태 선택">
                    <Select.Option value="available">사용가능</Select.Option>
                    <Select.Option value="occupied">사용중</Select.Option>
                    <Select.Option value="reserved">예약됨</Select.Option>
                    <Select.Option value="maintenance">정비중</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="용량"
              name="capacity"
              rules={[{ required: true, message: '용량을 입력하세요' }]}
            >
              <Input type="number" placeholder="100" suffix="개" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}
