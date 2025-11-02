'use client'

import { Card, Row, Col, Statistic, Button, Space, Select, Input, Modal, Form, Table, Tag, Tooltip, Breadcrumb, Progress, Tabs, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, ExclamationCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import { useState } from 'react'

interface LocationItem {
  id: string
  code: string
  name: string
  zone: string
  rack: number
  level: number
  status: 'empty' | 'occupied' | 'error'
  capacity: number
  occupancy: number
  lastUpdated: string
  manager: string
  sku?: string
  locationType: 'pallet' | 'daebong' | 'box' | 'shelf' // 팔레트, 대봉, 박스, 선반
}

interface RackData {
  rackId: number
  zone: string
  total: number
  occupied: number
  levels: Array<{
    level: number
    occupied: boolean
  }>
}

export default function WarehouseLayoutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('WH-001')
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null)
  const [searchText, setSearchText] = useState('')
  const [selectedLocationType, setSelectedLocationType] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('1')

  const [locationList, setLocationList] = useState<LocationItem[]>([
    { id: 'A-1-1', code: 'A1L1', name: '통로A 랙1 레벨1', zone: 'A', rack: 1, level: 1, status: 'occupied', capacity: 20, occupancy: 18, lastUpdated: '2025-11-01', manager: '김관리', sku: 'SKU-001', locationType: 'pallet' },
    { id: 'A-1-2', code: 'A1L2', name: '통로A 랙1 레벨2', zone: 'A', rack: 1, level: 2, status: 'occupied', capacity: 20, occupancy: 19, lastUpdated: '2025-11-01', manager: '이관리', sku: 'SKU-002', locationType: 'daebong' },
    { id: 'B-1-1', code: 'B1L1', name: '통로B 랙1 레벨1', zone: 'B', rack: 1, level: 1, status: 'empty', capacity: 20, occupancy: 5, lastUpdated: '2025-10-31', manager: '박관리', locationType: 'box' },
    { id: 'C-2-3', code: 'C2L3', name: '통로C 랙2 레벨3', zone: 'C', rack: 2, level: 3, status: 'occupied', capacity: 20, occupancy: 20, lastUpdated: '2025-11-01', manager: '최관리', sku: 'SKU-045', locationType: 'shelf' },
  ])

  // Mock 데이터
  const warehouses = [
    { value: 'WH-001', label: '서울 센터' },
    { value: 'WH-002', label: '인천 센터' },
    { value: 'WH-003', label: '부산 센터' },
  ]

  // 종단(Aisle) 데이터
  const aisleData = [
    { id: 'A', name: '통로 A', total: 36, occupied: 24, available: 12 },
    { id: 'B', name: '통로 B', total: 36, occupied: 18, available: 18 },
    { id: 'C', name: '통로 C', total: 36, occupied: 30, available: 6 },
  ]

  // 횡렬(Rack) 데이터 - 각 통로별
  const rackDataByAisle: Record<string, RackData[]> = {
    A: [
      { rackId: 1, zone: 'A', total: 12, occupied: 8, levels: [{ level: 1, occupied: true }, { level: 2, occupied: true }, { level: 3, occupied: true }, { level: 4, occupied: true }] },
      { rackId: 2, zone: 'A', total: 12, occupied: 8, levels: [{ level: 1, occupied: true }, { level: 2, occupied: false }, { level: 3, occupied: true }, { level: 4, occupied: true }] },
      { rackId: 3, zone: 'A', total: 12, occupied: 8, levels: [{ level: 1, occupied: false }, { level: 2, occupied: true }, { level: 3, occupied: true }, { level: 4, occupied: true }] },
    ],
    B: [
      { rackId: 1, zone: 'B', total: 12, occupied: 6, levels: [{ level: 1, occupied: true }, { level: 2, occupied: false }, { level: 3, occupied: true }, { level: 4, occupied: false }] },
      { rackId: 2, zone: 'B', total: 12, occupied: 6, levels: [{ level: 1, occupied: true }, { level: 2, occupied: false }, { level: 3, occupied: false }, { level: 4, occupied: true }] },
      { rackId: 3, zone: 'B', total: 12, occupied: 6, levels: [{ level: 1, occupied: false }, { level: 2, occupied: true }, { level: 3, occupied: true }, { level: 4, occupied: false }] },
    ],
    C: [
      { rackId: 1, zone: 'C', total: 12, occupied: 10, levels: [{ level: 1, occupied: true }, { level: 2, occupied: true }, { level: 3, occupied: true }, { level: 4, occupied: true }] },
      { rackId: 2, zone: 'C', total: 12, occupied: 10, levels: [{ level: 1, occupied: true }, { level: 2, occupied: true }, { level: 3, occupied: true }, { level: 4, occupied: false }] },
      { rackId: 3, zone: 'C', total: 12, occupied: 10, levels: [{ level: 1, occupied: true }, { level: 2, occupied: true }, { level: 3, occupied: true }, { level: 4, occupied: true }] },
    ],
  }

  // 필터링 로직
  const filteredLocations = locationList.filter((item) => {
    const matchesSearch = searchText === '' || 
      item.code.toLowerCase().includes(searchText.toLowerCase()) ||
      item.name.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesType = selectedLocationType === null || item.locationType === selectedLocationType
    const matchesZone = selectedZone === null || item.zone === selectedZone
    
    return matchesSearch && matchesType && matchesZone
  })

  const stats = {
    totalLocations: locationList.length,
    occupied: locationList.filter(l => l.status === 'occupied').length,
    available: locationList.filter(l => l.status === 'empty').length,
    utilizationRate: locationList.length > 0 ? Math.round((locationList.filter(l => l.status === 'occupied').length / locationList.length) * 100) : 0,
    aisles: 3,
    racksPerAisle: 3,
    levelsPerRack: 4,
  }

  // 위치 타입별 통계
  const locationTypeStats = {
    pallet: { label: '팔레트', count: locationList.filter(l => l.locationType === 'pallet').length, icon: '📦', color: '#1890ff' },
    daebong: { label: '대봉', count: locationList.filter(l => l.locationType === 'daebong').length, icon: '🏗️', color: '#faad14' },
    box: { label: '박스', count: locationList.filter(l => l.locationType === 'box').length, icon: '📫', color: '#52c41a' },
    shelf: { label: '선반', count: locationList.filter(l => l.locationType === 'shelf').length, icon: '🛒', color: '#f5576c' },
  }

  // 모달 함수들
  const handleAddLocation = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEditLocation = (location: LocationItem) => {
    setSelectedLocation(location)
    editForm.setFieldsValue({
      code: location.code,
      name: location.name,
      manager: location.manager,
      locationType: location.locationType,
      capacity: location.capacity,
      status: location.status,
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteLocation = (location: LocationItem) => {
    setSelectedLocation(location)
    setIsDeleteModalOpen(true)
  }

  const handleSaveAdd = () => {
    form.validateFields().then((values) => {
      const newLocation: LocationItem = {
        id: `${values.zone}-${values.rack}-${values.level}`,
        code: `${values.zone}${values.rack}L${values.level}`,
        name: values.name,
        zone: values.zone,
        rack: parseInt(values.rack),
        level: parseInt(values.level),
        status: 'empty',
        capacity: values.capacity || 20,
        occupancy: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        manager: values.manager,
        locationType: values.locationType,
      }
      setLocationList(prev => [...prev, newLocation])
      setIsModalOpen(false)
      message.success('위치가 추가되었습니다.')
    })
  }

  const handleSaveEdit = () => {
    editForm.validateFields().then((values) => {
      if (selectedLocation) {
        setLocationList(prev => prev.map(item =>
          item.id === selectedLocation.id
            ? { 
                ...item, 
                name: values.name,
                manager: values.manager,
                locationType: values.locationType,
                capacity: values.capacity,
                status: values.status as 'empty' | 'occupied' | 'error',
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : item
        ))
        setIsEditModalOpen(false)
        message.success('위치가 수정되었습니다.')
      }
    })
  }

  const handleConfirmDelete = () => {
    if (selectedLocation) {
      setLocationList(prev => prev.filter(item => item.id !== selectedLocation.id))
      setIsDeleteModalOpen(false)
      message.success('위치가 삭제되었습니다.')
    }
  }

  const handleRefresh = () => {
    setSearchText('')
    setSelectedLocationType(null)
    setSelectedZone(null)
    message.success('필터가 초기화되었습니다.')
  }

  const handleExport = () => {
    message.success('엑셀 파일 다운로드를 시작합니다.')
  }

  // 테이블 컬럼
  const columns = [
    {
      title: '위치 코드',
      dataIndex: 'code',
      key: 'code',
      width: '10%',
      render: (text: string) => <span style={{ fontWeight: 600, color: '#1F2B60' }}>{text}</span>,
    },
    {
      title: '위치명',
      dataIndex: 'name',
      key: 'name',
      width: '22%',
    },
    {
      title: '통로/랙/레벨',
      key: 'location',
      width: '15%',
      render: (_: any, record: LocationItem) => <span>{record.zone}/{record.rack}/{record.level}</span>,
    },
    {
      title: '용량/점유',
      key: 'capacity',
      width: '15%',
      render: (_: any, record: LocationItem) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>{record.occupancy}/{record.capacity}</div>
          <Progress percent={Math.round((record.occupancy / record.capacity) * 100)} size="small" />
        </div>
      ),
    },
    {
      title: '위치 타입',
      dataIndex: 'locationType',
      key: 'locationType',
      width: '12%',
      render: (type: string) => {
        const typeConfig: any = {
          pallet: { label: '📦 팔레트', color: '#1890ff' },
          daebong: { label: '🏗️ 대봉', color: '#faad14' },
          box: { label: '📫 박스', color: '#52c41a' },
          shelf: { label: '🛒 선반', color: '#f5576c' },
        }
        const config = typeConfig[type]
        return <span style={{ color: config.color, fontWeight: 600 }}>{config.label}</span>
      },
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string) => {
        const statusConfig: any = {
          empty: { color: '#52c41a', label: '가용', bgColor: '#f6ffed' },
          occupied: { color: '#1890ff', label: '사용중', bgColor: '#e6f7ff' },
          error: { color: '#ff4d4f', label: '오류', bgColor: '#fff1f0' },
        }
        const config = statusConfig[status]
        return (
          <Tag color={config.bgColor} style={{ color: config.color, borderColor: config.color }}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: '12%',
      render: (text: string) => text || '-',
    },
    {
      title: '액션',
      key: 'action',
      width: '14%',
      render: (_: any, record: LocationItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditLocation(record)}
            style={{ backgroundColor: '#5281C8' }}
          >
            수정
          </Button>
          <Button
            type="default"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteLocation(record)}
            danger
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ]

  // 종단별 3D 구조 시각화
  const renderAisleVisualization = (aisle: typeof aisleData[0]) => {
    const racks = rackDataByAisle[aisle.id] || []
    const utilRate = Math.round((aisle.occupied / aisle.total) * 100)

    return (
      <Card key={aisle.id} style={{ marginBottom: '16px', borderRadius: '10px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#1F2B60', fontSize: '16px', fontWeight: 600 }}>
              📍 {aisle.name}
            </h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span>총 {aisle.total}개</span>
              <span style={{ color: '#52c41a', fontWeight: 600 }}>사용중 {aisle.occupied}개</span>
              <span style={{ color: '#1890ff', fontWeight: 600 }}>가용 {aisle.available}개</span>
            </div>
          </div>
          <Progress percent={utilRate} strokeColor={utilRate > 80 ? '#ff4d4f' : '#1890ff'} />
        </div>

        {/* 횡렬 구조 */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${racks.length}, 1fr)`, gap: '16px', marginTop: '20px' }}>
          {racks.map((rack) => (
            <div key={rack.rackId} style={{
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: '#F8F9FA',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
                랙 {rack.rackId}
              </div>

              {/* 레벨별 시각화 (위에서 아래로) */}
              <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '4px' }}>
                {rack.levels.map((level) => (
                  <Tooltip key={level.level} title={`레벨 ${level.level} - ${level.occupied ? '사용중' : '가용'}`}>
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: level.occupied ? '#f5576c' : '#52c41a',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      L{level.level}
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* 페이지 콘텐츠 */}
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '창고관리' },
              { title: '구역 설정 (Zone)' },
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
              marginBottom: '8px',
            }}
          >
            구역 설정 (Zone)
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            구역(Zone) 설정 - 통로(Aisle) → 랙(Rack) → 레벨(Level)의 계층 구조로 창고 구역 관리
          </p>
        </div>

        {/* 전체 통계 섹션 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>총 위치</span>}
                value={stats.totalLocations}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>사용중</span>}
                value={stats.occupied}
                suffix={`/${stats.totalLocations}`}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>가용</span>}
                value={stats.available}
                suffix={`/${stats.totalLocations}`}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>점유율</span>}
                value={stats.utilizationRate}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 구조 정보 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: 'center', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007BED' }}>{stats.aisles}</div>
              <div style={{ fontSize: '12px', color: '#6B7178', marginTop: '8px' }}>통로 (Aisles)</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: 'center', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007BED' }}>{stats.racksPerAisle}</div>
              <div style={{ fontSize: '12px', color: '#6B7178', marginTop: '8px' }}>통로당 랙 수</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: 'center', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007BED' }}>{stats.levelsPerRack}</div>
              <div style={{ fontSize: '12px', color: '#6B7178', marginTop: '8px' }}>랙당 레벨 수</div>
            </Card>
          </Col>
        </Row>

        {/* 위치 타입별 통계 */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#1F2B60', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            📦 위치 타입별 현황
          </h3>
          <Row gutter={[16, 16]}>
            {Object.entries(locationTypeStats).map(([key, data]: any) => (
              <Col key={key} xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: '10px',
                    border: selectedLocationType === key ? `2px solid ${data.color}` : '1px solid #E5E7EB',
                    cursor: 'pointer',
                    backgroundColor: selectedLocationType === key ? `${data.color}15` : '#FFFFFF',
                    transition: 'all 0.3s',
                  }}
                  hoverable
                  onClick={() => setSelectedLocationType(selectedLocationType === key ? null : key)}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{data.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: data.color }}>{data.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2B60', marginTop: '8px' }}>
                      {data.count}개
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 컨트롤 섹션 */}
        <Card style={{ marginBottom: '24px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Space wrap>
            <Select
              placeholder="창고 선택"
              style={{ width: 200 }}
              value={selectedWarehouse}
              options={warehouses}
              onChange={setSelectedWarehouse}
            />
            <Select
              placeholder="통로(Zone) 필터"
              allowClear
              style={{ width: 150 }}
              value={selectedZone}
              options={[
                { value: 'A', label: '통로 A' },
                { value: 'B', label: '통로 B' },
                { value: 'C', label: '통로 C' },
              ]}
              onChange={setSelectedZone}
            />
            <Select
              placeholder="위치 타입"
              allowClear
              style={{ width: 150 }}
              value={selectedLocationType}
              options={[
                { value: 'pallet', label: '📦 팔레트' },
                { value: 'daebong', label: '🏗️ 대봉' },
                { value: 'box', label: '📫 박스' },
                { value: 'shelf', label: '🛒 선반' },
              ]}
              onChange={setSelectedLocationType}
            />
            <Input.Search
              placeholder="위치 코드, 위치명 검색..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 240 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLocation} style={{ backgroundColor: '#007BED' }}>
              새 위치 추가
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              내보내기
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              초기화
            </Button>
          </Space>
        </Card>

        {/* 탭 네비게이션 */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: '📊 종단횡렬 구조도',
              children: (
                <div style={{ marginTop: '20px' }}>
                  {aisleData.map((aisle) => renderAisleVisualization(aisle))}
                </div>
              ),
            },
            {
              key: '2',
              label: '📋 위치 목록',
              children: (
                <div style={{ marginTop: '20px' }}>
                  <Table
                    columns={columns}
                    dataSource={filteredLocations}
                    pagination={{ pageSize: 10, total: filteredLocations.length }}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                  />
                </div>
              ),
            },
            {
              key: '3',
              label: '🔥 히트맵 분석',
              children: (
                <div style={{ marginTop: '20px' }}>
                  <Card>
                    <div style={{ color: '#6B7178', textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌡️</div>
                      <p>통로별 점유율 분석</p>
                      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                        {aisleData.map((aisle) => (
                          <Col key={aisle.id} xs={24} sm={12} lg={8}>
                            <Card style={{ textAlign: 'center', backgroundColor: '#F8F9FA' }}>
                              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{aisle.name}</div>
                              <Progress
                                type="circle"
                                percent={Math.round((aisle.occupied / aisle.total) * 100)}
                                size={120}
                                format={(percent) => `${percent}%`}
                              />
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* 위치 추가 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            새 위치 추가
          </span>
        }
        open={isModalOpen}
        onOk={handleSaveAdd}
        onCancel={() => setIsModalOpen(false)}
        okText="추가"
        cancelText="취소"
        okButtonProps={{ style: { backgroundColor: '#007BED' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="위치명" name="name" rules={[{ required: true, message: '위치명을 입력하세요' }]}>
            <Input placeholder="예: 통로A 랙1 레벨1" />
          </Form.Item>
          <Form.Item label="통로(Zone)" name="zone" rules={[{ required: true, message: '통로를 입력하세요' }]}>
            <Select
              placeholder="통로 선택"
              options={[
                { value: 'A', label: 'A' },
                { value: 'B', label: 'B' },
                { value: 'C', label: 'C' },
              ]}
            />
          </Form.Item>
          <Form.Item label="랙 번호" name="rack" rules={[{ required: true, message: '랙 번호를 입력하세요' }]}>
            <Input type="number" placeholder="1" />
          </Form.Item>
          <Form.Item label="레벨" name="level" rules={[{ required: true, message: '레벨을 입력하세요' }]}>
            <Input type="number" placeholder="1" />
          </Form.Item>
          <Form.Item label="위치 타입" name="locationType" rules={[{ required: true, message: '위치 타입을 선택하세요' }]}>
            <Select
              placeholder="위치 타입 선택"
              options={[
                { value: 'pallet', label: '📦 팔레트' },
                { value: 'daebong', label: '🏗️ 대봉' },
                { value: 'box', label: '📫 박스' },
                { value: 'shelf', label: '🛒 선반' },
              ]}
            />
          </Form.Item>
          <Form.Item label="용량" name="capacity">
            <Input type="number" placeholder="20" />
          </Form.Item>
          <Form.Item label="담당자" name="manager" rules={[{ required: true, message: '담당자를 입력하세요' }]}>
            <Input placeholder="담당자명" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 위치 수정 모달 */}
      <Modal
        title={
          <span style={{ fontFamily: 'Pretendard', fontWeight: 700, fontSize: 18 }}>
            위치 정보 수정
          </span>
        }
        open={isEditModalOpen}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="저장"
        cancelText="취소"
        okButtonProps={{ style: { backgroundColor: '#007BED' } }}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="위치 코드" name="code">
            <Input disabled />
          </Form.Item>
          <Form.Item label="위치명" name="name" rules={[{ required: true, message: '위치명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="위치 타입" name="locationType" rules={[{ required: true, message: '위치 타입을 선택하세요' }]}>
            <Select
              options={[
                { value: 'pallet', label: '📦 팔레트' },
                { value: 'daebong', label: '🏗️ 대봉' },
                { value: 'box', label: '📫 박스' },
                { value: 'shelf', label: '🛒 선반' },
              ]}
            />
          </Form.Item>
          <Form.Item label="용량" name="capacity" rules={[{ required: true, message: '용량을 입력하세요' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="상태" name="status" rules={[{ required: true, message: '상태를 선택하세요' }]}>
            <Select
              options={[
                { value: 'empty', label: '가용' },
                { value: 'occupied', label: '사용중' },
                { value: 'error', label: '오류' },
              ]}
            />
          </Form.Item>
          <Form.Item label="담당자" name="manager" rules={[{ required: true, message: '담당자를 입력하세요' }]}>
            <Input />
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
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="삭제"
        cancelText="취소"
        okButtonProps={{ style: { backgroundColor: '#E02D3C' } }}
      >
        <p style={{ fontFamily: 'Pretendard', marginTop: 16 }}>
          {selectedLocation && '"' + selectedLocation.name + '" 위치를 삭제하시겠습니까?'}
        </p>
        <p style={{ fontFamily: 'Pretendard', color: '#6B7178', fontSize: 14 }}>
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  )
}
