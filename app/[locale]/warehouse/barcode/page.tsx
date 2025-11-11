'use client'

import React, { useState } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd'
import { BarcodeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined } from '@ant-design/icons'

interface Barcode {
  id: string
  barcode: string
  productName: string
  productCode: string
  optionName: string
  type: 'product' | 'location' | 'pallet'
  status: 'active' | 'inactive'
  createdAt: Date
  createdBy: string
}

const generateDummyBarcodes = (): Barcode[] => {
  const types: Array<'product' | 'location' | 'pallet'> = ['product', 'location', 'pallet']
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: `BC-${i + 1}`,
    barcode: `882${String(i + 1).padStart(10, '0')}`,
    productName: `상품 ${i + 1}`,
    productCode: `FSH-${String(i + 1).padStart(5, '0')}`,
    optionName: ['XS', 'S', 'M', 'L', 'XL'][i % 5],
    type: types[i % types.length],
    status: i % 10 === 0 ? 'inactive' : 'active',
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    createdBy: ['관리자', '김담당', '이담당'][i % 3],
  }))
}

export default function BarcodeManagementPage() {
  const [barcodes, setBarcodes] = useState<Barcode[]>(generateDummyBarcodes())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const columns = [
    {
      title: '바코드',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 150,
      render: (text: string) => (
        <Space>
          <BarcodeOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
    },
    {
      title: '상품코드',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '옵션',
      dataIndex: 'optionName',
      key: 'optionName',
      width: 100,
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeConfig: { [key: string]: { color: string; text: string } } = {
          product: { color: 'blue', text: '상품' },
          location: { color: 'green', text: '위치' },
          pallet: { color: 'purple', text: '팔레트' },
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
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: Date) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      title: '생성자',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: '작업',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Barcode) => (
        <Space size="small">
          <Button
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => handlePrint(record)}
          >
            출력
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

  const handlePrint = (barcode: Barcode) => {
    message.info(`${barcode.barcode} 바코드를 출력합니다.`)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '바코드 삭제',
      content: '정말로 이 바코드를 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk() {
        setBarcodes(barcodes.filter(b => b.id !== id))
        message.success('바코드가 삭제되었습니다.')
      },
    })
  }

  const handleSubmit = (values: any) => {
    const newBarcode: Barcode = {
      id: `BC-${barcodes.length + 1}`,
      ...values,
      createdAt: new Date(),
      createdBy: '관리자',
    }
    setBarcodes([newBarcode, ...barcodes])
    message.success('새 바코드가 생성되었습니다.')
    setIsModalOpen(false)
    form.resetFields()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', padding: '20px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#1F2B60' }}>
              <BarcodeOutlined /> 바코드 관리
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              바코드 생성 및 관리를 수행합니다.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            새 바코드 생성
          </Button>
        </div>

        {/* 테이블 */}
        <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <Table
            columns={columns}
            dataSource={barcodes}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}개`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 생성 모달 */}
        <Modal
          title="새 바코드 생성"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false)
            form.resetFields()
          }}
          onOk={() => form.submit()}
          okText="생성"
          cancelText="취소"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="바코드 번호"
              name="barcode"
              rules={[{ required: true, message: '바코드 번호를 입력하세요' }]}
            >
              <Input placeholder="882XXXXXXXXXX" />
            </Form.Item>

            <Form.Item
              label="상품명"
              name="productName"
              rules={[{ required: true, message: '상품명을 입력하세요' }]}
            >
              <Input placeholder="예: 베이직 티셔츠" />
            </Form.Item>

            <Form.Item
              label="상품코드"
              name="productCode"
              rules={[{ required: true, message: '상품코드를 입력하세요' }]}
            >
              <Input placeholder="예: FSH-00001" />
            </Form.Item>

            <Form.Item
              label="옵션명"
              name="optionName"
              rules={[{ required: true, message: '옵션명을 입력하세요' }]}
            >
              <Input placeholder="예: M" />
            </Form.Item>

            <Form.Item
              label="타입"
              name="type"
              rules={[{ required: true, message: '타입을 선택하세요' }]}
            >
              <Select placeholder="타입 선택">
                <Select.Option value="product">상품</Select.Option>
                <Select.Option value="location">위치</Select.Option>
                <Select.Option value="pallet">팔레트</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="상태"
              name="status"
              rules={[{ required: true, message: '상태를 선택하세요' }]}
            >
              <Select placeholder="상태 선택">
                <Select.Option value="active">활성</Select.Option>
                <Select.Option value="inactive">비활성</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}
