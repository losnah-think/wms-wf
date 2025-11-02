'use client'

import { useState } from 'react'
import { Table, Button, Breadcrumb, Tag, Card, Space, Modal, Form, Input, Select, Row, Col, Statistic, DatePicker, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined, ArrowRightOutlined, SwapOutlined, HistoryOutlined, DownloadOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'

interface StockMoveData {
  id: number
  moveId: string
  fromLocation: string
  toLocation: string
  quantity: number
  sku: string
  productName: string
  moveType: 'internal' | 'incoming' | 'outgoing'
  moveTypeText: string
  moveTypeColor: 'blue' | 'green' | 'red'
  status: 'pending' | 'completed' | 'cancelled'
  statusText: string
  statusColor: 'orange' | 'green' | 'red'
  moveDate: string
  movedBy: string
  reason?: string
}

export default function StockMoveManagementPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<StockMoveData | null>(null)
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [moveTypeFilter, setMoveTypeFilter] = useState<string | null>(null)

  const [stockMoveList, setStockMoveList] = useState<StockMoveData[]>([
    {
      id: 1,
      moveId: 'MV-001',
      fromLocation: 'LOC-A1-01',
      toLocation: 'LOC-A1-02',
      quantity: 100,
      sku: 'SKU-001',
      productName: 'LCD 모니터 24인치',
      moveType: 'internal',
      moveTypeText: '내부이동',
      moveTypeColor: 'blue',
      status: 'completed',
      statusText: '완료',
      statusColor: 'green',
      moveDate: '2025-11-01',
      movedBy: '김관리',
      reason: '재정렬',
    },
    {
      id: 2,
      moveId: 'MV-002',
      fromLocation: 'LOC-B2-03',
      toLocation: 'LOC-C3-01',
      quantity: 50,
      sku: 'SKU-002',
      productName: 'LED 불투명 테이프',
      moveType: 'internal',
      moveTypeText: '내부이동',
      moveTypeColor: 'blue',
      status: 'completed',
      statusText: '완료',
      statusColor: 'green',
      moveDate: '2025-11-01',
      movedBy: '이관리',
    },
    {
      id: 3,
      moveId: 'MV-003',
      fromLocation: '입고존',
      toLocation: 'LOC-A2-02',
      quantity: 200,
      sku: 'SKU-003',
      productName: '마우스 무선',
      moveType: 'incoming',
      moveTypeText: '입고',
      moveTypeColor: 'green',
      status: 'pending',
      statusText: '대기중',
      statusColor: 'orange',
      moveDate: '2025-11-01',
      movedBy: '박관리',
      reason: '신규 입고',
    },
  ])

  const moveTypeConfig = {
    internal: { text: '내부이동', color: 'blue', icon: '↔️' },
    incoming: { text: '입고', color: 'green', icon: '📥' },
    outgoing: { text: '출고', color: 'red', icon: '📤' },
  }

  const statusConfig = {
    pending: { text: '대기중', color: 'orange' },
    completed: { text: '완료', color: 'green' },
    cancelled: { text: '취소', color: 'red' },
  }

  // 필터링 로직
  const filteredData = stockMoveList.filter((item) => {
    const matchesSearch = searchText === '' || 
      item.moveId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.fromLocation.toLowerCase().includes(searchText.toLowerCase()) ||
      item.toLocation.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = statusFilter === null || item.status === statusFilter
    const matchesMoveType = moveTypeFilter === null || item.moveType === moveTypeFilter
    
    return matchesSearch && matchesStatus && matchesMoveType
  })

  const stats = {
    totalMoves: filteredData.length,
    completedMoves: filteredData.filter(m => m.status === 'completed').length,
    pendingMoves: filteredData.filter(m => m.status === 'pending').length,
    totalQuantity: filteredData.reduce((sum, m) => sum + m.quantity, 0),
  }

  const handleEdit = (record: StockMoveData) => {
    setSelectedRecord(record)
    form.setFieldsValue({
      moveId: record.moveId,
      fromLocation: record.fromLocation,
      toLocation: record.toLocation,
      quantity: record.quantity,
      status: record.status,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (record: StockMoveData) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  const handleAdd = () => {
    addForm.resetFields()
    setIsAddModalOpen(true)
  }

  const handleEditOk = () => {
    form.validateFields().then((values) => {
      if (selectedRecord) {
        const statusData = statusConfig[values.status as keyof typeof statusConfig]
        setStockMoveList(prev => prev.map(item =>
          item.id === selectedRecord.id
            ? { 
                ...item, 
                fromLocation: values.fromLocation,
                toLocation: values.toLocation,
                quantity: values.quantity,
                status: values.status as 'pending' | 'completed' | 'cancelled',
                statusText: statusData.text,
                statusColor: statusData.color as 'orange' | 'green' | 'red',
              }
            : item
        ))
        setIsEditModalOpen(false)
        message.success('이동 정보가 수정되었습니다.')
      }
    })
  }

  const handleDeleteOk = () => {
    if (selectedRecord) {
      setStockMoveList(prev => prev.filter(item => item.id !== selectedRecord.id))
      setIsDeleteModalOpen(false)
      message.success('이동 기록이 삭제되었습니다.')
    }
  }

  const handleAddOk = () => {
    addForm.validateFields().then((values) => {
      const moveTypeData = moveTypeConfig[values.moveType as keyof typeof moveTypeConfig]
      const newMove: StockMoveData = {
        id: stockMoveList.length + 1,
        moveId: `MV-${String(stockMoveList.length + 1).padStart(3, '0')}`,
        fromLocation: values.fromLocation,
        toLocation: values.toLocation,
        quantity: values.quantity,
        sku: values.sku || 'SKU-NEW',
        productName: values.productName || '신규 상품',
        moveType: values.moveType as 'internal' | 'incoming' | 'outgoing',
        moveTypeText: moveTypeData.text,
        moveTypeColor: moveTypeData.color as 'blue' | 'green' | 'red',
        status: 'pending',
        statusText: '대기중',
        statusColor: 'orange',
        moveDate: new Date().toISOString().split('T')[0],
        movedBy: '관리자',
        reason: values.reason,
      }
      setStockMoveList(prev => [...prev, newMove])
      setIsAddModalOpen(false)
      message.success('재고 이동이 등록되었습니다.')
    })
  }

  const handleRefresh = () => {
    setSearchText('')
    setStatusFilter(null)
    setMoveTypeFilter(null)
    message.success('필터가 초기화되었습니다.')
  }

  const handleExport = () => {
    message.success('엑셀 파일 다운로드를 시작합니다.')
  }

  const columns: TableColumnsType<StockMoveData> = [
    {
      title: '이동 ID',
      dataIndex: 'moveId',
      key: 'moveId',
      width: '10%',
      render: (text: string) => (
        <span style={{ color: '#1F2B60', fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: '이동 유형',
      key: 'moveType',
      width: '10%',
      render: (_: any, record: StockMoveData) => (
        <Tag color={record.moveTypeColor}>
          {moveTypeConfig[record.moveType].icon} {record.moveTypeText}
        </Tag>
      ),
    },
    {
      title: '출발 / 도착',
      key: 'locations',
      width: '18%',
      render: (_: any, record: StockMoveData) => (
        <div style={{ fontSize: '13px', color: '#464C53' }}>
          <div>{record.fromLocation}</div>
          <div style={{ color: '#007BED', margin: '4px 0' }}><ArrowRightOutlined /> 이동</div>
          <div>{record.toLocation}</div>
        </div>
      ),
    },
    {
      title: 'SKU / 상품명',
      key: 'product',
      width: '16%',
      render: (_: any, record: StockMoveData) => (
        <div>
          <div style={{ fontSize: '12px', color: '#6B7178', fontFamily: 'monospace', marginBottom: '4px' }}>
            {record.sku}
          </div>
          <div style={{ color: '#1F2B60', fontWeight: 500, fontSize: '13px' }}>
            {record.productName}
          </div>
        </div>
      ),
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      render: (text: number) => (
        <span style={{ color: '#1F2B60', fontWeight: 600, fontSize: 14 }}>{text}개</span>
      ),
    },
    {
      title: '상태',
      key: 'status',
      width: '10%',
      render: (_: any, record: StockMoveData) => (
        <Tag color={statusConfig[record.status].color}>
          {statusConfig[record.status].text}
        </Tag>
      ),
    },
    {
      title: '이동일',
      dataIndex: 'moveDate',
      key: 'moveDate',
      width: '10%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 14 }}>{text}</span>
      ),
    },
    {
      title: '액션',
      key: 'action',
      width: '16%',
      render: (_: any, record: StockMoveData) => (
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
              { title: '재고 이동' },
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
            재고 이동
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            재고 이동(창고간/위치간) - 창고 내 재고 이동 현황을 관리합니다
          </p>
        </div>

        {/* 통계 섹션 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>총 이동</span>}
                value={stats.totalMoves}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>완료</span>}
                value={stats.completedMoves}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>대기중</span>}
                value={stats.pendingMoves}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>총 이동 수량</span>}
                value={stats.totalQuantity}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 컨트롤 */}
        <Card style={{ marginBottom: '24px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Space wrap>
            <Input.Search
              placeholder="이동ID, SKU, 상품명, 위치 검색..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="상태 필터"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              options={[
                { value: 'pending', label: '대기중' },
                { value: 'completed', label: '완료' },
                { value: 'cancelled', label: '취소' },
              ]}
              onChange={setStatusFilter}
            />
            <Select
              placeholder="이동 유형"
              allowClear
              style={{ width: 150 }}
              value={moveTypeFilter}
              options={[
                { value: 'internal', label: '내부이동' },
                { value: 'incoming', label: '입고' },
                { value: 'outgoing', label: '출고' },
              ]}
              onChange={setMoveTypeFilter}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#007BED' }}>
              이동 등록
            </Button>
            <Button icon={<HistoryOutlined />} onClick={handleRefresh}>필터 초기화</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>내보내기</Button>
          </Space>
        </Card>

        {/* 테이블 */}
        <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10, total: filteredData.length }}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>

      {/* 이동 정보 수정 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            이동 정보 수정
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
          <Form.Item label="이동 ID" name="moveId">
            <Input disabled />
          </Form.Item>
          <Form.Item label="출발 위치" name="fromLocation" rules={[{ required: true, message: '출발 위치를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="도착 위치" name="toLocation" rules={[{ required: true, message: '도착 위치를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="수량" name="quantity" rules={[{ required: true, message: '수량을 입력하세요' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="상태" name="status" rules={[{ required: true, message: '상태를 선택하세요' }]}>
            <Select
              options={[
                { value: 'pending', label: '대기중' },
                { value: 'completed', label: '완료' },
                { value: 'cancelled', label: '취소' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 이동 등록 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            새 이동 등록
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
          <Form.Item label="이동 유형" name="moveType" rules={[{ required: true, message: '이동 유형을 선택하세요' }]}>
            <Select
              options={[
                { value: 'internal', label: '내부이동' },
                { value: 'incoming', label: '입고' },
                { value: 'outgoing', label: '출고' },
              ]}
            />
          </Form.Item>
          <Form.Item label="SKU" name="sku" rules={[{ required: true, message: 'SKU를 입력하세요' }]}>
            <Input placeholder="예: SKU-001" />
          </Form.Item>
          <Form.Item label="상품명" name="productName" rules={[{ required: true, message: '상품명을 입력하세요' }]}>
            <Input placeholder="예: LCD 모니터 24인치" />
          </Form.Item>
          <Form.Item label="출발 위치" name="fromLocation" rules={[{ required: true, message: '출발 위치를 입력하세요' }]}>
            <Input placeholder="예: LOC-A1-01" />
          </Form.Item>
          <Form.Item label="도착 위치" name="toLocation" rules={[{ required: true, message: '도착 위치를 입력하세요' }]}>
            <Input placeholder="예: LOC-A1-02" />
          </Form.Item>
          <Form.Item label="수량" name="quantity" rules={[{ required: true, message: '수량을 입력하세요' }]}>
            <Input type="number" placeholder="100" />
          </Form.Item>
          <Form.Item label="사유" name="reason">
            <Input.TextArea placeholder="이동 사유를 입력하세요 (선택)" rows={3} />
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
          {selectedRecord && `"${selectedRecord.moveId}" 이동 기록을 삭제하시겠습니까?`}
        </p>
        <p style={{ fontFamily: 'Pretendard', color: '#6B7178', fontSize: 14 }}>
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  )
}
