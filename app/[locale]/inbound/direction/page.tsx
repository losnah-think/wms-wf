'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  Tag,
  Button,
  Space,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  Pagination,
  Checkbox,
  Input,
  message,
  Modal,
  Tabs,
} from 'antd'
import { useTranslations } from 'next-intl'
import dayjs from 'dayjs'
import type { TableColumnsType } from 'antd'

interface InboundDirection {
  key: string
  orderId: string
  vendor: string
  inboundDate: string
  inboundTime: string
  plannedQty: string
  transportType: string
  price: string
  productBarcode?: string
  items?: Array<{
    productCode: string
    productName: string
    barcode: string
    unit: string
    unitPrice: string
    quantity: string
    remark?: string
  }>
}

const mockData: InboundDirection[] = [
  {
    key: '1',
    orderId: 'RV-20250515-0026',
    vendor: '(주)스타일 씨이',
    inboundDate: '2025.05.10',
    inboundTime: '12:00',
    plannedQty: '300개',
    transportType: '택배',
    price: '30,000원',
    productBarcode: '8809421080079',
    items: [
      { productCode: '0000002001', productName: '상품정보입니다. 상품설명', barcode: '0-001', unit: '상품2', unitPrice: '0-0001', quantity: '10000', remark: '0' },
      { productCode: '0000002002', productName: '상품정보입니다. 상품설명', barcode: '0-001', unit: '상품2', unitPrice: '0-0001', quantity: '10000', remark: '0' },
    ]
  },
  {
    key: '2',
    orderId: 'RV-20250515-0027',
    vendor: '(주)트렌드마켓',
    inboundDate: '2025.05.11',
    inboundTime: '14:00',
    plannedQty: '150개',
    transportType: '택배',
    price: '20,000원',
    productBarcode: '8809421080080',
    items: [
      { productCode: '0000003001', productName: '상품정보입니다. 상품설명', barcode: '0-002', unit: '상품2', unitPrice: '0-0001', quantity: '5000', remark: '0' },
    ]
  },
  {
    key: '3',
    orderId: 'RV-20250515-0028',
    vendor: '(주)보선산',
    inboundDate: '2025.05.12',
    inboundTime: '10:30',
    plannedQty: '200개',
    transportType: '퀵배송',
    price: '25,000원',
    productBarcode: '8809421080081',
    items: [
      { productCode: '0000004001', productName: '상품정보입니다. 상품설명', barcode: '0-003', unit: '상품2', unitPrice: '0-0001', quantity: '7500', remark: '0' },
      { productCode: '0000004002', productName: '상품정보입니다. 상품설명', barcode: '0-003', unit: '상품2', unitPrice: '0-0001', quantity: '7500', remark: '0' },
      { productCode: '0000004003', productName: '상품정보입니다. 상품설명', barcode: '0-003', unit: '상품2', unitPrice: '0-0001', quantity: '0', remark: '0' },
    ]
  },
  {
    key: '4',
    orderId: 'RV-20250515-0029',
    vendor: '(주)디지털스토어',
    inboundDate: '2025.05.13',
    inboundTime: '16:45',
    plannedQty: '100개',
    transportType: '택배',
    price: '15,000원',
    productBarcode: '8809421080082',
    items: [
      { productCode: '0000005001', productName: '상품정보입니다. 상품설명', barcode: '0-004', unit: '상품2', unitPrice: '0-0001', quantity: '3000', remark: '0' },
    ]
  },
  {
    key: '5',
    orderId: 'RV-20250515-0030',
    vendor: '(주)프리미엄샵',
    inboundDate: '2025.05.14',
    inboundTime: '09:15',
    plannedQty: '250개',
    transportType: '직접배송',
    price: '50,000원',
    productBarcode: '8809421080083',
    items: [
      { productCode: '0000006001', productName: '상품정보입니다. 상품설명', barcode: '0-005', unit: '상품2', unitPrice: '0-0001', quantity: '8000', remark: '0' },
      { productCode: '0000006002', productName: '상품정보입니다. 상품설명', barcode: '0-005', unit: '상품2', unitPrice: '0-0001', quantity: '8000', remark: '0' },
      { productCode: '0000006003', productName: '상품정보입니다. 상품설명', barcode: '0-005', unit: '상품2', unitPrice: '0-0001', quantity: '8000', remark: '0' },
      { productCode: '0000006004', productName: '상품정보입니다. 상품설명', barcode: '0-005', unit: '상품2', unitPrice: '0-0001', quantity: '8000', remark: '0' },
    ]
  },
]

export default function InboundDirectionPage() {
  const t = useTranslations()
  const router = useRouter()
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [directionData, setDirectionData] = useState<InboundDirection[]>(mockData)
  const [filters, setFilters] = useState({
    vendor: undefined,
    orderList: undefined,
    productCode: undefined,
    receiptDateRange: [undefined, undefined] as any[],
    expectedDateRange: [undefined, undefined] as any[],
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<InboundDirection | null>(null)
  const [activeTab, setActiveTab] = useState('items')

  // LocalStorage에서 저장된 등록된 오더 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrders = localStorage.getItem('registeredInboundOrders')
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders)
          setDirectionData((prevData) => [...prevData, ...parsedOrders])
          localStorage.removeItem('registeredInboundOrders')
          message.success('새로운 입고 예정이 등록되었습니다.')
        } catch (error) {
          console.error('Error loading saved orders:', error)
        }
      }
    }
  }, [])

  const filteredData = useMemo(() => {
    return directionData.filter((item) => {
      if (filters.vendor && item.vendor !== filters.vendor) return false
      return true
    })
  }, [filters, directionData])

  const paginatedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredData.slice(start, end)
  }, [filteredData, pagination])

  const columns: TableColumnsType<InboundDirection> = [
    {
      title: (
        <Checkbox
          indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
          checked={selectedRows.length === filteredData.length && filteredData.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(filteredData.map((item) => item.key))
            } else {
              setSelectedRows([])
            }
          }}
        />
      ),
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record.key])
            } else {
              setSelectedRows(selectedRows.filter((key) => key !== record.key))
            }
          }}
        />
      ),
    },
    {
      title: '입고 오더 번호',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string, record) => (
        <Button 
          type="link" 
          style={{ color: '#0066cc', padding: 0 }}
          onClick={() => {
            setSelectedOrder(record)
            setModalVisible(true)
          }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '화주사',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: '입고 요청일',
      dataIndex: 'inboundDate',
      key: 'inboundDate',
    },
    {
      title: '입고 예정일',
      dataIndex: 'inboundDate',
      key: 'inboundDate2',
    },
    {
      title: '입고 예정 시간',
      dataIndex: 'inboundTime',
      key: 'inboundTime',
    },
    {
      title: '운송 유형',
      dataIndex: 'transportType',
      key: 'transportType',
    },
    {
      title: '운송비',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '입',
      key: 'action',
      width: 60,
      align: 'center',
      render: () => '-',
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1>입고 지시</h1>
      </div>

      {/* Filter Section */}
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>화주명</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="select"
              value={filters.vendor}
              onChange={(value) => setFilters({ ...filters, vendor: value })}
              options={[
                { label: '(주)스타일 씨이', value: '(주)스타일 씨이' },
                { label: '(주)트렌드마켓', value: '(주)트렌드마켓' },
                { label: '(주)보선산', value: '(주)보선산' },
                { label: '(주)디지털스토어', value: '(주)디지털스토어' },
                { label: '(주)프리미엄샵', value: '(주)프리미엄샵' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>입고 오더 목록</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="select"
              value={filters.orderList}
              onChange={(value) => setFilters({ ...filters, orderList: value })}
              options={[
                { label: 'RV-20250515-0026', value: 'RV-20250515-0026' },
                { label: 'RV-20250515-0027', value: 'RV-20250515-0027' },
                { label: 'RV-20250515-0028', value: 'RV-20250515-0028' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>
              <label>품목 코드</label>
            </div>
            <Input
              placeholder="search"
              value={filters.productCode as any}
              onChange={(e) => setFilters({ ...filters, productCode: e.target.value })}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>입고 접수일</label>
            </div>
            <DatePicker.RangePicker
              value={
                filters.receiptDateRange[0] && filters.receiptDateRange[1]
                  ? [dayjs(filters.receiptDateRange[0]), dayjs(filters.receiptDateRange[1])]
                  : [null, null]
              }
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  receiptDateRange: dates ? [dates[0]?.toDate(), dates[1]?.toDate()] : [undefined, undefined],
                })
              }}
              format="YYYY.MM.DD"
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <label>입고 예정일</label>
            </div>
            <DatePicker.RangePicker
              value={
                filters.expectedDateRange[0] && filters.expectedDateRange[1]
                  ? [dayjs(filters.expectedDateRange[0]), dayjs(filters.expectedDateRange[1])]
                  : [null, null]
              }
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  expectedDateRange: dates ? [dates[0]?.toDate(), dates[1]?.toDate()] : [undefined, undefined],
                })
              }}
              format="YYYY.MM.DD"
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Summary and Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <span>
            전체 상품 187 건 | 선택 32 건
          </span>
        </div>
        <Space>
          <Button onClick={() => {
            if (selectedRows.length === 0) {
              message.warning('출력할 항목을 선택해주세요.')
              return
            }
            
            // 선택된 항목들 가져오기
            const selectedOrders = paginatedData.filter(item => selectedRows.includes(item.key))
            
            // 출력할 HTML 생성
            const printContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>입고 지시서</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                  <style>
                    * { margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .print-container { max-width: 210mm; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { font-size: 24px; margin-bottom: 10px; }
                    .header p { font-size: 12px; color: #666; }
                    .barcode-section { display: flex; gap: 30px; margin-bottom: 20px; justify-content: center; }
                    .barcode-item { text-align: center; }
                    .barcode-item svg { max-width: 100px; height: auto; }
                    .barcode-label { font-size: 12px; margin-top: 5px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    td input[type="checkbox"] { width: 16px; height: 16px; }
                    .order-section { margin-bottom: 40px; page-break-inside: avoid; }
                    .order-info { margin-bottom: 15px; }
                    .order-info p { margin: 5px 0; font-size: 13px; }
                    .label { font-weight: bold; width: 100px; display: inline-block; }
                    .signature { margin-top: 40px; text-align: right; }
                    .signature-line { width: 150px; border-bottom: 1px solid #000; display: inline-block; margin-top: 20px; }
                    @media print {
                      body { padding: 0; }
                      .print-container { max-width: 100%; }
                    }
                  </style>
              </head>
              <body>
                <div class="print-container">
                  <div class="header">
                    <h1>입고 지시서</h1>
                    <p>작성일: ${new Date().toLocaleDateString('ko-KR')}</p>
                  </div>
                  
                  ${selectedOrders.map((order, index) => `
                    <div class="order-section">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div class="order-info" style="flex: 1;">
                          <p><span class="label">오더번호:</span> ${order.orderId}</p>
                          <p><span class="label">화주사:</span> ${order.vendor}</p>
                          <p><span class="label">입고 요청일:</span> ${order.inboundDate}</p>
                          <p><span class="label">입고 예정일:</span> ${order.inboundDate}</p>
                          <p><span class="label">입고 예정 시간:</span> ${order.inboundTime}</p>
                          <p><span class="label">예정 수량:</span> ${order.plannedQty}</p>
                          <p><span class="label">운송 유형:</span> ${order.transportType}</p>
                          <p><span class="label">운송비:</span> ${order.price}</p>
                        </div>
                        <div class="barcode-item" style="text-align: center; margin-left: 30px;">
                          <div class="barcode-label">입고 바코드</div>
                          <svg id="inbound-barcode-${index}"></svg>
                        </div>
                      </div>
                      
                      <table>
                        <thead>
                          <tr>
                            <th style="width: 50px;"></th>
                            <th style="width: 120px;">품목 바코드</th>
                            <th>품목명</th>
                            <th>상품명</th>
                            <th>단위 단가</th>
                            <th>포장 단위</th>
                            <th>포장 단가</th>
                            <th style="width: 60px;">수량</th>
                            <th style="width: 60px;">기타 수량</th>
                            <th style="width: 50px;">비고</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${order.items?.map((item, itemIndex) => `
                            <tr>
                              <td><input type="checkbox"></td>
                              <td><svg id="product-barcode-${index}-${itemIndex}" style="max-width: 80px; height: auto;"></svg></td>
                              <td>${item.productCode}</td>
                              <td>${item.productName}</td>
                              <td>${item.unitPrice}</td>
                              <td>${item.unit}</td>
                              <td>-0001</td>
                              <td>${item.quantity}</td>
                              <td>0</td>
                              <td>${item.remark}</td>
                            </tr>
                          `).join('') || '<tr><td colspan="10">상품 정보 없음</td></tr>'}
                        </tbody>
                      </table>
                      
                      <div class="signature">
                        <p>담당자: ___________</p>
                        <p style="margin-top: 30px;">서명</p>
                        <div class="signature-line"></div>
                      </div>
                    </div>
                  `).join('<hr style="page-break-after: always; border: none; margin: 40px 0;" />')}
                </div>
                
                <script>
                  // 바코드 생성
                  ${selectedOrders.map((order, index) => {
                    let script = `
                    JsBarcode("#inbound-barcode-${index}", "${order.orderId}", {
                      format: "CODE128",
                      width: 2,
                      height: 50,
                      displayValue: true
                    });
                    `;
                    if (order.items && order.items.length > 0) {
                      order.items.forEach((item, itemIndex) => {
                        script += `
                    JsBarcode("#product-barcode-${index}-${itemIndex}", "${item.barcode}", {
                      format: "CODE128",
                      width: 1.5,
                      height: 40,
                      displayValue: true,
                      fontSize: 10
                    });
                        `;
                      });
                    }
                    return script;
                  }).join('')}
                  
                  setTimeout(function() {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  }, 500);
                </script>
              </body>
              </html>
            `
            
            // 새 창에서 출력
            const printWindow = window.open('', '', 'width=800,height=600')
            if (printWindow) {
              printWindow.document.write(printContent)
              printWindow.document.close()
            }
          }}>지시서 출력</Button>
          <Button onClick={() => router.push('/inbound/expected-registration')}>
            입고 예정 등록
          </Button>
          <Button
            type="primary"
            disabled={selectedRows.length === 0}
            onClick={() => {
              if (selectedRows.length > 0) {
                const selectedOrders = paginatedData.filter(item => selectedRows.includes(item.key))
                router.push(
                  `/inbound/execution?orders=${JSON.stringify(selectedOrders)}`
                )
              }
            }}
          >
            입고 지시
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          scroll={{ x: 1200 }}
          style={{ marginBottom: '20px' }}
        />

        {/* Pagination */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={filteredData.length}
            onChange={(page) => setPagination({ ...pagination, current: page })}
            showQuickJumper
            showTotal={(total) => `총 ${total}개`}
          />
        </div>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title="입고 지시"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            이동 취소
          </Button>,
          <Button key="back" onClick={() => setModalVisible(false)}>
            뒤로가기
          </Button>,
          <Button key="submit" type="primary" onClick={() => {
            message.success('입고 지시가 완료되었습니다.')
            setModalVisible(false)
          }}>
            이동 지시
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div>
            {/* 기본정보 섹션 */}
            <Card style={{ marginBottom: '20px' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div><strong>오더번호:</strong> {selectedOrder.orderId}</div>
                </Col>
                <Col xs={24} sm={12}>
                  <div><strong>화주사:</strong> {selectedOrder.vendor}</div>
                </Col>
                <Col xs={24} sm={12}>
                  <div><strong>입고 요청일:</strong> {selectedOrder.inboundDate}</div>
                </Col>
                <Col xs={24} sm={12}>
                  <div><strong>입고 예정일:</strong> {selectedOrder.inboundDate}</div>
                </Col>
                <Col xs={24} sm={12}>
                  <div><strong>입고 예정 시간:</strong> {selectedOrder.inboundTime}</div>
                </Col>
                <Col xs={24} sm={12}>
                  <div><strong>예정 수량:</strong> {selectedOrder.plannedQty}</div>
                </Col>
                <Col xs={24} sm={12}>
                  <div><strong>운송 유형:</strong> {selectedOrder.transportType}</div>
                </Col>
                <Col xs={24} sm={12}>
                  <div><strong>운송비:</strong> {selectedOrder.price}</div>
                </Col>
              </Row>
            </Card>

            {/* 탭 섹션 */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'items',
                  label: '품목 상세',
                  children: (
                    <Table
                      columns={[
                        {
                          title: '품목 바코드',
                          dataIndex: 'barcode',
                          key: 'barcode',
                          width: 100,
                        },
                        {
                          title: '품목명',
                          dataIndex: 'productCode',
                          key: 'productCode',
                        },
                        {
                          title: '상품명',
                          dataIndex: 'productName',
                          key: 'productName',
                        },
                        {
                          title: '단위 단가',
                          dataIndex: 'unitPrice',
                          key: 'unitPrice',
                          width: 100,
                        },
                        {
                          title: '포장 단위',
                          dataIndex: 'unit',
                          key: 'unit',
                          width: 100,
                        },
                        {
                          title: '수량',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          width: 80,
                          align: 'right',
                        },
                      ]}
                      dataSource={selectedOrder.items?.map((item, index) => ({
                        ...item,
                        key: index,
                      })) || []}
                      pagination={false}
                      size="small"
                    />
                  ),
                },
                {
                  key: 'history',
                  label: '작업 내역',
                  children: (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      작업 내역이 없습니다.
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
