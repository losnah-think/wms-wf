'use client'

import { useState } from 'react'
import { Table, Button, Breadcrumb, Tag, Card, Space, Modal, Form, Input, Row, Col, Statistic, DatePicker, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'

interface AuditData {
  id: number
  auditId: string
  sku: string
  productName: string
  systemQty: number
  actualQty: number
  variance: number
  location: string
  auditDate: string
  auditor: string
  status: 'pending' | 'completed' | 'discrepancy'
  statusText: string
}

export default function StockAuditPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AuditData | null>(null)
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()

  const auditData: AuditData[] = [
    {
      id: 1,
      auditId: 'AU-001',
      sku: 'SKU-001',
      productName: 'LCD 모니터 24인치',
      systemQty: 250,
      actualQty: 248,
      variance: -2,
      location: 'LOC-A1-01',
      auditDate: '2025-11-01',
      auditor: '김감시',
      status: 'completed',
      statusText: '완료',
    },
    {
      id: 2,
      auditId: 'AU-002',
      sku: 'SKU-002',
      productName: 'LED 불투명 테이프',
      systemQty: 100,
      actualQty: 95,
      variance: -5,
      location: 'LOC-B2-03',
      auditDate: '2025-11-01',
      auditor: '이감시',
      status: 'discrepancy',
      statusText: '불일치',
    },
    {
      id: 3,
      auditId: 'AU-003',
      sku: 'SKU-003',
      productName: '마우스 무선',
      systemQty: 50,
      actualQty: 50,
      variance: 0,
      location: 'LOC-C3-01',
      auditDate: '2025-11-01',
      auditor: '박감시',
      status: 'completed',
      statusText: '완료',
    },
  ]

  const stats = {
    totalAudits: auditData.length,
    completedAudits: auditData.filter(a => a.status === 'completed').length,
    discrepancies: auditData.filter(a => a.status === 'discrepancy').length,
    avgVariance: Math.abs(Math.round(auditData.reduce((sum, a) => sum + a.variance, 0) / auditData.length)),
  }

  const handleEdit = (record: AuditData) => {
    setSelectedRecord(record)
    form.setFieldsValue({
      auditId: record.auditId,
      actualQty: record.actualQty,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (record: AuditData) => {
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
      message.success('조정 정보가 수정되었습니다.')
    })
  }

  const handleDeleteOk = () => {
    setIsDeleteModalOpen(false)
    message.success('조정 기록이 삭제되었습니다.')
  }

  const handleAddOk = () => {
    addForm.validateFields().then(() => {
      setIsAddModalOpen(false)
      message.success('조정이 등록되었습니다.')
    })
  }

  const columns: TableColumnsType<AuditData> = [
    {
      title: '조정 ID',
      dataIndex: 'auditId',
      key: 'auditId',
      width: '10%',
      render: (text: string) => (
        <span style={{ color: '#1F2B60', fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: '10%',
      render: (text: string) => (
        <span style={{ color: '#6B7178', fontSize: 12, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: '18%',
      render: (text: string) => (
        <span style={{ color: '#1F2B60', fontSize: 14 }}>{text}</span>
      ),
    },
    {
      title: '시스템 수량',
      dataIndex: 'systemQty',
      key: 'systemQty',
      width: '12%',
      render: (text: number) => (
        <span style={{ color: '#464C53', fontSize: 14 }}>{text}개</span>
      ),
    },
    {
      title: '실제 수량',
      dataIndex: 'actualQty',
      key: 'actualQty',
      width: '12%',
      render: (text: number) => (
        <span style={{ color: '#1F2B60', fontWeight: 600, fontSize: 14 }}>{text}개</span>
      ),
    },
    {
      title: '차이',
      key: 'variance',
      width: '10%',
      render: (_: any, record: AuditData) => (
        <span style={{
          color: record.variance > 0 ? '#28a745' : record.variance < 0 ? '#E02D3C' : '#464C53',
          fontWeight: 600,
          fontSize: 14,
        }}>
          {record.variance > 0 ? '+' : ''}{record.variance}개
        </span>
      ),
    },
    {
      title: '상태',
      key: 'status',
      width: '12%',
      render: (_: any, record: AuditData) => {
        let icon = <CheckCircleOutlined />
        let color = 'green'
        if (record.status === 'discrepancy') {
          icon = <CloseCircleOutlined />
          color = 'red'
        }

        return (
          <Tag color={color} icon={icon} style={{ fontSize: 12, fontWeight: 600 }}>
            {record.statusText}
          </Tag>
        )
      },
    },
    {
      title: '액션',
      key: 'action',
      width: '16%',
      render: (_: any, record: AuditData) => (
        <Space size="small">
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
              { title: '재고관리' },
              { title: '조정(조사)' },
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
            재고 조정
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            조정(수량/상태 수정) 및 실사(Inventory Audit) - 실사를 통한 재고 조정 및 불일치 관리
          </p>
        </div>

        {/* 통계 섹션 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>총 조정</span>}
                value={stats.totalAudits}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>완료</span>}
                value={stats.completedAudits}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>불일치</span>}
                value={stats.discrepancies}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>평균 차이</span>}
                value={stats.avgVariance}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 컨트롤 */}
        <Card style={{ marginBottom: '24px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#007BED' }}>
              조정 등록
            </Button>
          </Space>
        </Card>

        {/* 테이블 */}
        <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Table
            columns={columns}
            dataSource={auditData}
            pagination={{ pageSize: 10, total: auditData.length }}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>

      {/* 조정 정보 수정 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            조정 정보 수정
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
          <Form.Item label="조정 ID" name="auditId" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item label="실제 수량" name="actualQty" rules={[{ required: true, message: '실제 수량을 입력하세요' }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 조정 등록 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            새 조정 등록
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
          <Form.Item label="상품 SKU" name="sku" rules={[{ required: true, message: 'SKU를 입력하세요' }]}>
            <Input placeholder="예: SKU-001" />
          </Form.Item>
          <Form.Item label="실제 수량" name="actualQty" rules={[{ required: true, message: '실제 수량을 입력하세요' }]}>
            <Input type="number" placeholder="0" />
          </Form.Item>
          <Form.Item label="조정 사유" name="reason" rules={[{ required: true, message: '조정 사유를 입력하세요' }]}>
            <Input.TextArea rows={3} placeholder="조정 사유를 입력하세요" />
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
          {selectedRecord && `"${selectedRecord.auditId}" 조정 기록을 삭제하시겠습니까?`}
        </p>
        <p style={{ fontFamily: 'Pretendard', color: '#6B7178', fontSize: 14 }}>
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  )
}
