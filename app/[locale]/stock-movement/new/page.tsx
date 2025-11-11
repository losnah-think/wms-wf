'use client'

import React, { useState, useMemo } from 'react'
import {
  Layout,
  Card,
  Tree,
  Button,
  Table,
  Space,
  InputNumber,
  message,
  Badge,
  Tag,
  Modal,
  Empty,
  Divider,
  Statistic,
  Row,
  Col,
  Steps,
  Alert,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ===== 인터페이스 정의 =====

interface Location {
  id: string
  code: string
  zone: string
  aisle: string
  rack: string
  shelf: string
  bin: string
  type: 'storage' | 'picking' | 'receiving' | 'shipping' | 'returns'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  currentStock: number
  capacity: number
}

interface LocationProduct {
  id: string
  barcode: string
  productName: string
  productCode: string
  optionName: string
  quantity: number
  singlePrice: number
  locationId: string
  locationCode: string
}

interface CartItem {
  id: string
  productName: string
  productCode: string
  optionName: string
  barcode: string
  quantity: number
  singlePrice: number
  fromLocationId: string
  fromLocationCode: string
  toLocationId?: string
  toLocationCode?: string
}

// ===== 더미 데이터 생성 함수 =====

const generateDummyLocations = (): Location[] => {
  const zones = ['A', 'B', 'C']
  const aisles = ['01', '02', '03']
  const racks = ['01', '02', '03']
  const shelves = ['1', '2', '3']
  const bins = ['1', '2', '3', '4', '5']

  const locations: Location[] = []
  let id = 1

  zones.forEach((zone) => {
    aisles.forEach((aisle) => {
      racks.forEach((rack) => {
        shelves.forEach((shelf) => {
          bins.forEach((bin) => {
            const statuses: Array<'available' | 'occupied' | 'reserved' | 'maintenance'> = [
              'available',
              'occupied',
              'reserved',
              'maintenance',
            ]
            const types: Array<'storage' | 'picking' | 'receiving' | 'shipping' | 'returns'> = [
              'storage',
              'picking',
              'receiving',
              'shipping',
              'returns',
            ]

            locations.push({
              id: `LOC-${String(id).padStart(4, '0')}`,
              code: `${zone}-${aisle}-${rack}-${shelf}-${bin}`,
              zone,
              aisle,
              rack,
              shelf,
              bin,
              type: types[id % types.length],
              status: statuses[id % statuses.length],
              currentStock: Math.floor(Math.random() * 100),
              capacity: 100,
            })
            id++
          })
        })
      })
    })
  })

  return locations.slice(0, 60)
}

const generateDummyProducts = (locations: Location[]): LocationProduct[] => {
  const products = [
    { productName: '베이직 티셔츠', productCode: 'FSH-00001', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { productName: '데님 팬츠', productCode: 'FSH-00002', options: ['28', '30', '32', '34', '36'] },
    { productName: '캐주얼 셔츠', productCode: 'FSH-00003', options: ['S', 'M', 'L', 'XL'] },
    { productName: '스웨터', productCode: 'FSH-00004', options: ['S', 'M', 'L'] },
    { productName: '자켓', productCode: 'FSH-00005', options: ['M', 'L', 'XL'] },
  ]

  const locationProducts: LocationProduct[] = []
  let id = 1

  locations.slice(0, 20).forEach((location) => {
    products.forEach((product) => {
      product.options.forEach((option) => {
        if (Math.random() > 0.5) {
          locationProducts.push({
            id: `PROD-${String(id).padStart(4, '0')}`,
            barcode: `882${String(id).padStart(10, '0')}`,
            productName: product.productName,
            productCode: product.productCode,
            optionName: option,
            quantity: Math.floor(Math.random() * 50) + 1,
            singlePrice: Math.floor(Math.random() * 100000) + 10000,
            locationId: location.id,
            locationCode: location.code,
          })
          id++
        }
      })
    })
  })

  return locationProducts
}

// ===== 메인 컴포넌트 =====

export default function StockMovementNewPage() {
  const router = useRouter()
  const [locations] = useState<Location[]>(generateDummyLocations())
  const [locationProducts] = useState<LocationProduct[]>(generateDummyProducts(generateDummyLocations()))
  
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedSourceLocations, setSelectedSourceLocations] = useState<string[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedTargetLocation, setSelectedTargetLocation] = useState<string | null>(null)

  // 창고/구역/위치별 트리 구조 생성
  const locationTreeData = useMemo(() => {
    const zones: { [key: string]: any } = {}

    locations.forEach((loc) => {
      if (!zones[loc.zone]) {
        zones[loc.zone] = {
          title: `구역 ${loc.zone}`,
          key: `zone-${loc.zone}`,
          children: [],
        }
      }

      const existingLocation = zones[loc.zone].children.find((l: any) => l.code === loc.code)
      if (!existingLocation) {
        zones[loc.zone].children.push({
          title: `${loc.code} (${loc.type}) - 재고: ${loc.currentStock}/${loc.capacity}`,
          key: loc.id,
          code: loc.code,
          isLeaf: true,
          selectable: loc.status === 'available' || loc.status === 'occupied',
        })
      }
    })

    return Object.values(zones)
  }, [locations])

  // 선택된 모든 출발지의 상품 목록
  const sourceLocationProducts = useMemo(() => {
    if (selectedSourceLocations.length === 0) return []
    return locationProducts.filter((p) => selectedSourceLocations.includes(p.locationId))
  }, [selectedSourceLocations, locationProducts])

  // 로케이션 정보 조회
  const getLocationInfo = (locationId: string | null) => {
    if (!locationId) return null
    return locations.find((l) => l.id === locationId)
  }

  const selectedSourceLocationInfos = useMemo(() => {
    return selectedSourceLocations.map((id) => getLocationInfo(id)).filter(Boolean)
  }, [selectedSourceLocations, locations])

  const targetLocationInfo = getLocationInfo(selectedTargetLocation)

  // 장바구니에 상품 추가
  const addToCart = (product: LocationProduct) => {
    const existingItem = cart.find(
      (item) =>
        item.productCode === product.productCode &&
        item.optionName === product.optionName &&
        item.fromLocationId === product.locationId
    )

    if (existingItem) {
      message.info('이미 장바구니에 추가된 상품입니다. 수량을 조정해주세요.')
      return
    }

    const newItem: CartItem = {
      id: `CART-${Date.now()}-${Math.random()}`,
      productName: product.productName,
      productCode: product.productCode,
      optionName: product.optionName,
      barcode: product.barcode,
      quantity: 1,
      singlePrice: product.singlePrice,
      fromLocationId: product.locationId,
      fromLocationCode: product.locationCode,
    }

    setCart([...cart, newItem])
    message.success(`${product.productName} (${product.optionName})이(가) 장바구니에 추가되었습니다.`)
  }

  // 장바구니에서 상품 제거
  const removeFromCart = (cartId: string) => {
    setCart(cart.filter((item) => item.id !== cartId))
    message.success('장바구니에서 제거되었습니다.')
  }

  // 장바구니 상품 수량 변경
  const updateCartQuantity = (cartId: string, quantity: number) => {
    setCart(
      cart.map((item) =>
        item.id === cartId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, 999)) }
          : item
      )
    )
  }

  // 전체 장바구니에 목적지 할당
  const assignAllTargetLocations = () => {
    if (!selectedTargetLocation) {
      message.warning('먼저 목적지 로케이션을 선택해주세요.')
      return
    }

    const targetLoc = getLocationInfo(selectedTargetLocation)
    if (!targetLoc) return

    setCart(
      cart.map((item) => ({
        ...item,
        toLocationId: selectedTargetLocation,
        toLocationCode: targetLoc.code,
      }))
    )

    message.success('모든 항목의 목적지가 설정되었습니다.')
  }

  // 이동 확정
  const confirmTransfer = () => {
    if (cart.length === 0) {
      message.warning('이동할 상품을 선택해주세요.')
      return
    }

    const itemsWithoutTarget = cart.filter((item) => !item.toLocationId)
    if (itemsWithoutTarget.length > 0) {
      message.warning('모든 상품의 목적지를 설정해주세요.')
      return
    }

    Modal.confirm({
      title: '재고 이동 확정',
      content: (
        <div>
          <p>총 {cart.length}개 항목을 이동하시겠습니까?</p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            출발지: {selectedSourceLocationInfos.map((l) => l?.code).join(', ')}
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            목적지: {targetLocationInfo?.code}
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            총 수량: {cart.reduce((sum, item) => sum + item.quantity, 0)}개
          </p>
        </div>
      ),
      okText: '확정',
      cancelText: '취소',
      onOk() {
        const transferNo = `TRF-${dayjs().format('YYYYMMDD')}-${String(Math.random()).slice(2, 6)}`
        message.success(`이동 번호: ${transferNo}로 완료되었습니다.`)
        router.push('/stock-movement')
      },
    })
  }

  // Step별 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 0: // 출발지 선택
        return (
          <div>
            <h3 style={{ marginBottom: '16px' }}>1단계: 출발지 로케이션 선택 (다중 선택 가능)</h3>
            <Alert
              message="여러 위치에서 상품을 수집할 수 있습니다. 체크박스로 선택해주세요."
              type="info"
              style={{ marginBottom: '16px' }}
            />
            <Card style={{ maxHeight: '500px', overflow: 'auto' }}>
              <Tree
                checkable
                treeData={locationTreeData}
                checkedKeys={selectedSourceLocations}
                onCheck={(checked) => {
                  setSelectedSourceLocations(checked as string[])
                }}
              />
            </Card>
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
              선택된 위치: {selectedSourceLocations.length}개
              {selectedSourceLocations.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {selectedSourceLocationInfos.map((loc) => (
                    <Tag key={loc?.id} color="blue" style={{ marginRight: '8px', marginBottom: '4px' }}>
                      {loc?.code} ({loc?.type})
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 1: // 상품 선택 및 장바구니
        return (
          <div>
            <h3 style={{ marginBottom: '16px' }}>2단계: 상품 선택 및 장바구니</h3>
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card
                  title={`출발지 상품 (${sourceLocationProducts.length}개)`}
                  style={{ height: '600px', overflow: 'auto' }}
                >
                  {sourceLocationProducts.length > 0 ? (
                    <Table
                      columns={[
                        {
                          title: '출발지',
                          dataIndex: 'locationCode',
                          key: 'locationCode',
                          width: '25%',
                          render: (text: string) => <Tag color="blue">{text}</Tag>,
                        },
                        {
                          title: '상품명',
                          dataIndex: 'productName',
                          key: 'productName',
                          width: '35%',
                        },
                        {
                          title: '옵션',
                          dataIndex: 'optionName',
                          key: 'optionName',
                          width: '15%',
                        },
                        {
                          title: '작업',
                          key: 'action',
                          width: '25%',
                          render: (_: any, record: LocationProduct) => (
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => addToCart(record)}
                            >
                              추가
                            </Button>
                          ),
                        },
                      ]}
                      dataSource={sourceLocationProducts}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <Empty description="출발지를 먼저 선택해주세요" />
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <ShoppingCartOutlined />
                      장바구니 ({cart.length}개)
                    </Space>
                  }
                  style={{ height: '600px', overflow: 'auto' }}
                >
                  {cart.length > 0 ? (
                    <>
                      <Table
                        columns={[
                          {
                            title: '출발지',
                            dataIndex: 'fromLocationCode',
                            key: 'fromLocationCode',
                            width: '25%',
                            render: (text: string) => <Tag color="blue">{text}</Tag>,
                          },
                          {
                            title: '상품',
                            dataIndex: 'productName',
                            key: 'productName',
                            width: '35%',
                            render: (text, record: CartItem) => (
                              <div style={{ fontSize: '12px' }}>
                                <div>{text}</div>
                                <div style={{ color: '#999', fontSize: '11px' }}>
                                  {record.optionName}
                                </div>
                              </div>
                            ),
                          },
                          {
                            title: '수량',
                            key: 'quantity',
                            width: '20%',
                            render: (_: any, record: CartItem) => (
                              <InputNumber
                                min={1}
                                max={999}
                                value={record.quantity}
                                onChange={(val) => updateCartQuantity(record.id, val || 1)}
                                size="small"
                                style={{ width: '70px' }}
                              />
                            ),
                          },
                          {
                            title: '삭제',
                            key: 'action',
                            width: '20%',
                            render: (_: any, record: CartItem) => (
                              <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => removeFromCart(record.id)}
                              />
                            ),
                          },
                        ]}
                        dataSource={cart}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                      <Divider />
                      <Statistic
                        title="총 수량"
                        value={cart.reduce((sum, item) => sum + item.quantity, 0)}
                        suffix="개"
                      />
                    </>
                  ) : (
                    <Empty description="장바구니가 비어있습니다" />
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )

      case 2: // 목적지 선택
        return (
          <div>
            <h3 style={{ marginBottom: '16px' }}>3단계: 목적지 로케이션 선택</h3>
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card title="로케이션 트리" style={{ height: '500px', overflow: 'auto' }}>
                  <Tree
                    treeData={locationTreeData}
                    onSelect={(keys) => {
                      if (keys.length > 0) {
                        setSelectedTargetLocation(keys[0] as string)
                      }
                    }}
                    selectedKeys={selectedTargetLocation ? [selectedTargetLocation] : []}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                {targetLocationInfo && (
                  <Card title="목적지 정보">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <strong>로케이션:</strong> {targetLocationInfo.code}
                      </div>
                      <div>
                        <strong>타입:</strong> {targetLocationInfo.type}
                      </div>
                      <div>
                        <strong>상태:</strong>{' '}
                        <Tag
                          color={
                            targetLocationInfo.status === 'available' ? 'green' : 'orange'
                          }
                        >
                          {targetLocationInfo.status}
                        </Tag>
                      </div>
                      <div>
                        <strong>재고:</strong> {targetLocationInfo.currentStock}/
                        {targetLocationInfo.capacity}
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <Button
                        block
                        type="primary"
                        onClick={() => assignAllTargetLocations()}
                      >
                        모든 항목에 목적지 할당
                      </Button>
                    </Space>
                  </Card>
                )}
              </Col>
            </Row>
          </div>
        )

      case 3: // 확정
        return (
          <div>
            <h3 style={{ marginBottom: '16px' }}>4단계: 이동 내용 확인</h3>
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card title="출발지 (다중)">
                  <Space direction="vertical">
                    {selectedSourceLocationInfos.map((loc) => (
                      <div key={loc?.id}>
                        <Tag color="blue">{loc?.code}</Tag>
                        <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                          ({loc?.type})
                        </span>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="목적지">
                  <div>
                    <Tag color="green">{targetLocationInfo?.code}</Tag>
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                      ({targetLocationInfo?.type})
                    </span>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card style={{ marginTop: '16px' }} title="이동 상품 목록">
              <Table
                columns={[
                  {
                    title: '출발지',
                    dataIndex: 'fromLocationCode',
                    key: 'fromLocationCode',
                    width: '20%',
                    render: (text: string) => <Tag color="blue">{text}</Tag>,
                  },
                  {
                    title: '상품명',
                    dataIndex: 'productName',
                    key: 'productName',
                    width: '25%',
                  },
                  {
                    title: '옵션',
                    dataIndex: 'optionName',
                    key: 'optionName',
                    width: '15%',
                  },
                  {
                    title: '수량',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: '15%',
                  },
                  {
                    title: '도착지',
                    dataIndex: 'toLocationCode',
                    key: 'toLocationCode',
                    width: '25%',
                    render: (text: string) => <Tag color="green">{text}</Tag>,
                  },
                ]}
                dataSource={cart}
                rowKey="id"
                pagination={false}
                size="small"
              />
              <Divider />
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="총 항목"
                    value={cart.length}
                    suffix="개"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="총 수량"
                    value={cart.reduce((sum, item) => sum + item.quantity, 0)}
                    suffix="개"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="예상 금액"
                    value={cart.reduce((sum, item) => sum + item.quantity * item.singlePrice, 0)}
                    prefix="₩"
                    precision={0}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0:
        return selectedSourceLocations.length > 0
      case 1:
        return cart.length > 0
      case 2:
        return selectedTargetLocation !== null && cart.every((item) => item.toLocationId)
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <Layout.Content style={{ padding: '20px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/stock-movement">
              <Button icon={<ArrowLeftOutlined />}>뒤로</Button>
            </Link>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2B60', margin: 0 }}>
                📦 새 재고 이동
              </h1>
              <p style={{ color: '#666', marginTop: '8px' }}>
                단계별로 출발지, 상품, 목적지를 선택합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 스텝퍼 */}
        <Card style={{ marginBottom: '20px' }}>
          <Steps
            current={currentStep}
            items={[
              {
                title: '출발지 선택',
                description: '여러 위치 선택 가능',
              },
              {
                title: '상품 선택',
                description: '장바구니에 추가',
              },
              {
                title: '목적지 선택',
                description: '도착 위치 지정',
              },
              {
                title: '확인',
                description: '이동 확정',
              },
            ]}
          />
        </Card>

        {/* 스텝 콘텐츠 */}
        <Card style={{ marginBottom: '20px', minHeight: '600px' }}>
          {renderStep()}
        </Card>

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {currentStep > 0 && (
            <Button size="large" onClick={() => setCurrentStep(currentStep - 1)}>
              이전
            </Button>
          )}
          {currentStep < 3 && (
            <Button
              type="primary"
              size="large"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNextStep()}
            >
              다음
            </Button>
          )}
          {currentStep === 3 && (
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => confirmTransfer()}
            >
              확정
            </Button>
          )}
        </div>
      </Layout.Content>
    </Layout>
  )
}
