'use client'

import { useState } from 'react'
import { Table, Button, Tabs, Breadcrumb, Pagination, Tag, Card, Space, Badge, Modal, Form, Input, Select } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { TableColumnsType, TabsProps } from 'antd'

interface LocationData {
  id: number
  locationCode: string
  locationName: string
  warehouseId: string
  warehouseName: string
  zone: string
  rackNumber: string
  level: string
  status: string
  statusColor: 'cyan' | 'blue' | 'red'
  capacity: number
  usedCapacity: number
  manager: string
  lastUpdated: string
}

export default function WarehouseLocationPage() {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<LocationData | null>(null)
  const [form] = Form.useForm()

  const locationData: LocationData[] = [
    {
      id: 1,
      locationCode: 'A-01-001',
      locationName: 'A Zone 1층 1번',
      warehouseId: 'WH-001',
      warehouseName: '서울 센터',
      zone: 'A',
      rackNumber: '01',
      level: '1',
      status: '사용 중',
      statusColor: 'cyan',
      capacity: 100,
      usedCapacity: 85,
      manager: '김관리',
      lastUpdated: '2025-11-01',
    },
    {
      id: 2,
      locationCode: 'A-01-002',
      locationName: 'A Zone 1층 2번',
      warehouseId: 'WH-001',
      warehouseName: '서울 센터',
      zone: 'A',
      rackNumber: '01',
      level: '2',
      status: '가용',
      statusColor: 'blue',
      capacity: 100,
      usedCapacity: 20,
      manager: '이관리',
      lastUpdated: '2025-11-01',
    },
    {
      id: 3,
      locationCode: 'B-02-001',
      locationName: 'B Zone 2층 1번',
      warehouseId: 'WH-002',
      warehouseName: '인천 센터',
      zone: 'B',
      rackNumber: '02',
      level: '2',
      status: '오류',
      statusColor: 'red',
      capacity: 100,
      usedCapacity: 0,
      manager: '박관리',
      lastUpdated: '2025-10-31',
    },
  ]

  const statusConfig = {
    cyan: { color: '#007C86', bgColor: '#E0F7FA' },
    blue: { color: '#004B92', bgColor: '#E3F2FD' },
    red: { color: '#E02D3C', bgColor: '#FFEBEE' },
  }

  const handleEdit = (record: LocationData) => {
    setSelectedRecord(record)
    form.setFieldsValue({
      locationCode: record.locationCode,
      locationName: record.locationName,
      warehouseId: record.warehouseId,
      zone: record.zone,
      rackNumber: record.rackNumber,
      level: record.level,
      manager: record.manager,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (record: LocationData) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  const handleEditOk = () => {
    setIsEditModalOpen(false)
  }

  const handleDeleteOk = () => {
    setIsDeleteModalOpen(false)
  }

  const columns: TableColumnsType<LocationData> = [
    {
      title: '위치 코드',
      dataIndex: 'locationCode',
      key: 'locationCode',
      width: '12%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 16, fontFamily: 'Pretendard', fontWeight: '400' }}>
          {text}
        </span>
      ),
    },
    {
      title: '위치명',
      dataIndex: 'locationName',
      key: 'locationName',
      width: '14%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 16, fontFamily: 'Pretendard', fontWeight: '400' }}>
          {text}
        </span>
      ),
    },
    {
      title: '창고',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: '12%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 16, fontFamily: 'Pretendard', fontWeight: '400' }}>
          {text}
        </span>
      ),
    },
    {
      title: '구역',
      dataIndex: 'zone',
      key: 'zone',
      width: '8%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 16, fontFamily: 'Pretendard', fontWeight: '400' }}>
          {text}
        </span>
      ),
    },
    {
      title: '랙번호',
      dataIndex: 'rackNumber',
      key: 'rackNumber',
      width: '10%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 16, fontFamily: 'Pretendard', fontWeight: '400' }}>
          {text}
        </span>
      ),
    },
    {
      title: '레벨',
      dataIndex: 'level',
      key: 'level',
      width: '8%',
      render: (text: string) => (
        <span style={{ color: '#464C53', fontSize: 16, fontFamily: 'Pretendard', fontWeight: '400' }}>
          {text}
        </span>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string, record: LocationData) => (
        <Tag
          color={statusConfig[record.statusColor].bgColor}
          style={{
            color: statusConfig[record.statusColor].color,
            fontSize: 14,
            fontWeight: 600,
            border: '1px solid ' + statusConfig[record.statusColor].color + '20',
          }}
          icon={
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: statusConfig[record.statusColor].color,
                marginRight: 6,
              }}
            />
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: '용량 (사용/전체)',
      dataIndex: 'capacity',
      key: 'capacity',
      width: '12%',
      render: (_, record: LocationData) => (
        <span style={{ color: '#464C53', fontSize: 16, fontFamily: 'Pretendard', fontWeight: '400' }}>
          {record.usedCapacity}/{record.capacity}
        </span>
      ),
    },
    {
      title: '액션',
      key: 'action',
      width: '14%',
      render: (_, record: LocationData) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              backgroundColor: '#5281C8',
              borderColor: '#5281C8',
              height: '36px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'Pretendard',
            }}
          >
            수정
          </Button>
          <Button
            type="default"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{
              color: '#464C53',
              borderColor: '#E5E7EB',
              height: '36px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'Pretendard',
            }}
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
      label: '위치(로케이션) 관리',
      children: null,
    },
    {
      key: '2',
      label: '일괄 관리',
      children: null,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* 탭 네비게이션 - 고정 위치 */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '2px solid #E5E7EB',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}
      >
        <div style={{ maxWidth: '1600px', margin: '0 auto', paddingLeft: 40, paddingRight: 40 }}>
          <Tabs
            items={tabItems}
            activeKey="1"
            tabBarStyle={{
              borderBottom: 'none',
              margin: 0,
              paddingBottom: 0,
            }}
            tabBarGutter={48}
          />
        </div>
      </div>

      {/* 페이지 콘텐츠 */}
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '창고관리' },
              { title: '위치(로케이션) 관리' },
            ]}
            style={{ marginBottom: '16px' }}
          />
          <h1
            style={{
              color: '#1F2B60',
              fontSize: 40,
              fontFamily: 'Pretendard',
              fontWeight: 700,
              lineHeight: '52px',
              margin: 0,
            }}
          >
            위치(로케이션) 관리
          </h1>
        </div>

        {/* 메인 카드 */}
        <Card
          style={{
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB',
          }}
          styles={{ body: { padding: '24px' } }}
        >
          {/* 헤더 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  color: '#06101D',
                  fontSize: 20,
                  fontFamily: 'Pretendard',
                  fontWeight: 600,
                }}
              >
                전체 위치
              </span>
              <Badge
                count={150}
                style={{
                  backgroundColor: '#007BED',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontFamily: 'Pretendard',
                  fontWeight: 600,
                }}
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                height: '40px',
                padding: '0 16px',
                fontSize: 16,
                fontFamily: 'Pretendard',
                fontWeight: 600,
                backgroundColor: '#007BED',
              }}
            >
              위치 추가
            </Button>
          </div>

          {/* 데이터 테이블 */}
          <Table
            columns={columns}
            dataSource={locationData}
            pagination={false}
            rowKey="id"
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
            }}
            scroll={{ x: 1400 }}
          />

          {/* 페이지네이션 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #E5E7EB',
            }}
          >
            <Pagination
              current={currentPage}
              onChange={setCurrentPage}
              total={150}
              pageSize={10}
              showSizeChanger={false}
              showQuickJumper={false}
              style={{ gap: '8px' }}
            />
          </div>
        </Card>
      </div>

      {/* 수정 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            위치 정보 수정
          </span>
        }
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText="저장"
        cancelText="취소"
        okButtonProps={{
          style: {
            backgroundColor: '#007BED',
            borderColor: '#007BED',
          },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="위치 코드" name="locationCode">
            <Input
              disabled
              style={{
                fontFamily: 'Pretendard',
                borderRadius: '8px',
                height: '36px',
              }}
            />
          </Form.Item>
          <Form.Item label="위치명" name="locationName">
            <Input
              style={{
                fontFamily: 'Pretendard',
                borderRadius: '8px',
                height: '36px',
              }}
            />
          </Form.Item>
          <Form.Item label="창고" name="warehouseId">
            <Select
              options={[
                { value: 'WH-001', label: '서울 센터' },
                { value: 'WH-002', label: '인천 센터' },
                { value: 'WH-003', label: '부산 센터' },
              ]}
            />
          </Form.Item>
          <Form.Item label="구역" name="zone">
            <Input
              style={{
                fontFamily: 'Pretendard',
                borderRadius: '8px',
                height: '36px',
              }}
            />
          </Form.Item>
          <Form.Item label="랙번호" name="rackNumber">
            <Input
              style={{
                fontFamily: 'Pretendard',
                borderRadius: '8px',
                height: '36px',
              }}
            />
          </Form.Item>
          <Form.Item label="레벨" name="level">
            <Input
              style={{
                fontFamily: 'Pretendard',
                borderRadius: '8px',
                height: '36px',
              }}
            />
          </Form.Item>
          <Form.Item label="담당자" name="manager">
            <Input
              style={{
                fontFamily: 'Pretendard',
                borderRadius: '8px',
                height: '36px',
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title={
          <span
            style={{
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ExclamationCircleOutlined style={{ color: '#E02D3C' }} />
            삭제 확인
          </span>
        }
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="삭제"
        cancelText="취소"
        okButtonProps={{
          style: {
            backgroundColor: '#E02D3C',
            borderColor: '#E02D3C',
          },
        }}
      >
        <p style={{ fontFamily: 'Pretendard', marginTop: 16 }}>
          {selectedRecord && '"' + selectedRecord.locationName + '" 위치를 삭제하시겠습니까?'}
        </p>
        <p style={{ fontFamily: 'Pretendard', color: '#6B7178', fontSize: 14 }}>
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  )
}
