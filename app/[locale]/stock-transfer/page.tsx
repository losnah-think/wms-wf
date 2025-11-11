'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Modal,
  message,
  Tabs,
  Upload,
  Tag,
  Badge,
  Drawer,
  List,
  Divider,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  BarcodeOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd'
import dayjs from 'dayjs'

// ===== 인터페이스 정의 =====

interface Warehouse {
  id: string
  name: string
  location: string
}

interface ProductOption {
  id: number
  optionName: string
  quantity: number
  barcode: string
  location: string
  grade: string
  safetyStock: number
  singleSalesPrice: number
  cost: number
  stockValue: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  statusText: string
  warehouse: string
  warehouseDistribution: { [key: string]: number }
  soldOutClassification: string
  isInventorySyncEnabled: boolean
  adjustmentRequired: boolean
  inboundRequired: boolean
  outboundRequired: boolean
}

interface StockItem {
  id: number
  productName: string
  purchasedProductName: string
  productCode: string
  category: string
  brand: string
  price: number
  representativeSalesPrice: number
  thumbnail: string
  registrationDate: dayjs.Dayjs
  productRegistrationDate: dayjs.Dayjs
  lastModifiedDate: dayjs.Dayjs
  productPublishDate: dayjs.Dayjs
  expectedPoDate: dayjs.Dayjs | null
  poSettingDate: dayjs.Dayjs | null
  soldOutDate: dayjs.Dayjs | null
  stockRegistrationDate: dayjs.Dayjs
  supplier: string
  productClassification: string
  designer: string
  registeredBy: string
  salesStatus: 'active' | 'inactive' | 'discontinued'
  isFullySoldOut: boolean
  isProductLocationRegistered: boolean
  productYear: string
  productSeason: string
  hasShippingHistory: boolean
  isNonExhibitionShipped: boolean
  includesUnreceivedQuantity: boolean
  isOptionMergePrevented: boolean
  daysWithoutOptionOrder: number
  daysWithoutProductOrder: number
  options: ProductOption[]
  totalQuantity: number
  totalStockValue: number
}

interface TransferItem {
  id: string
  productId: number
  optionId: number
  productName: string
  optionName: string
  barcode: string
  transferQuantity: number
  fromWarehouse: string
  toWarehouse: string
  fromLocation: string
  toLocation?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  reason: string
  createdAt: Date
  createdBy: string
}

interface TransferRequest {
  transferNo: string
  items: TransferItem[]
  totalQuantity: number
  createdAt: Date
  createdBy: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// ===== 더미 데이터 =====

const WAREHOUSES: Warehouse[] = [
  { id: 'WH-001', name: '본점 창고', location: '서울 강남' },
  { id: 'WH-002', name: '부산 창고', location: '부산 해운대' },
  { id: 'WH-003', name: '대구 창고', location: '대구 중구' },
  { id: 'WH-004', name: '임시 창고', location: '경기 안산' },
]

const generateDummyStockData = (): StockItem[] => {
  const products = ['베이직 라운드 티셔츠', '슬림핏 청바지', '오버핏 후드집업', '미니 크로스백', '캔버스 스니커즈', 'V넥 카디건', '롱 코트', '스타킹', '스포츠 브라', '핸드백']
  const options = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '검정색', '흰색', '베이지', '네이비', '카키']
  const categories = ['상의', '하의', '아우터', '가방', '신발', '언더웨어', '악세서리']
  const brands = ['아르마니', '지방시', '발렌시아가', '세인트로랑', '톰포드', '프라다', '구찌', '에르메스', '돌체앤가바나', '버버리']
  const warehouses = ['서울 센터', '부산 센터', '인천 센터', '대구 센터', '광주 센터']
  const suppliers = ['공급처A', '공급처B', '공급처C', '공급처D', '공급처E', '공급처F', '공급처G']
  const designers = ['김디자이너', '이디자이너', '박디자이너', '최디자이너']
  const registeredUsers = ['영업담당1', '영업담당2', '마케팅', '품질관리']
  const years = ['2023', '2024', '2025', '2026']
  const seasons = ['봄', '여름', '가을', '겨울']
  const soldOutStatus = ['미품절', '품절', '입시품절', '소진 시 품절', '공정 소진 품절']

  const data: StockItem[] = []
  let productId = 1

  // 상품 10개 생성
  for (let p = 0; p < 10; p++) {
    const product = products[p % products.length]
    const price = Math.floor(Math.random() * 800000) + 30000
    const representativeSalesPrice = price

    const registrationDate = dayjs().subtract(Math.floor(Math.random() * 365), 'day')
    const modifiedDate = registrationDate.add(Math.floor(Math.random() * 180), 'day')
    const publishDate = registrationDate.add(1, 'day')
    const expectedPoDate = Math.random() > 0.3 ? dayjs().add(Math.floor(Math.random() * 60), 'day') : null
    const poSettingDate = expectedPoDate ? dayjs().subtract(Math.floor(Math.random() * 30), 'day') : null
    const soldOutDate = Math.random() > 0.7 ? dayjs().subtract(Math.floor(Math.random() * 90), 'day') : null
    const stockRegDate = dayjs().subtract(Math.floor(Math.random() * 365), 'day')

    // 이 상품의 옵션들 생성 (각 상품당 3~8개의 옵션)
    const numOptions = Math.floor(Math.random() * 6) + 3
    const productOptions: ProductOption[] = []
    let totalQuantity = 0
    let totalStockValue = 0

    for (let o = 0; o < numOptions; o++) {
      const optionName = options[o % options.length]
      const quantity = Math.floor(Math.random() * 5000) + 10
      const status = quantity > 100 ? 'in_stock' : quantity > 20 ? 'low_stock' : 'out_of_stock'

      const safetyStock = Math.floor(Math.random() * 500) + 50
      const cost = Math.floor(price * (Math.random() * 0.3 + 0.4))
      const singleSalesPrice = Math.floor(price * (Math.random() * 0.1 + 0.95))
      const stockValue = quantity * cost

      const warehouseDistribution: { [key: string]: number } = {}
      warehouses.forEach((wh) => {
        warehouseDistribution[wh] = Math.floor(Math.random() * quantity)
      })

      productOptions.push({
        id: o,
        optionName,
        quantity,
        barcode: `882${String(p * 100 + o + 1).padStart(12, '0')}`,
        location: `${warehouses[o % warehouses.length]} - 구역 ${String.fromCharCode(65 + (o % 5))}`,
        grade: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        safetyStock,
        singleSalesPrice,
        cost,
        stockValue,
        status,
        statusText: status === 'in_stock' ? '재고충분' : status === 'low_stock' ? '적은재고' : '품절',
        warehouse: warehouses[o % warehouses.length],
        warehouseDistribution,
        soldOutClassification: soldOutStatus[Math.floor(Math.random() * soldOutStatus.length)],
        isInventorySyncEnabled: Math.random() > 0.1,
        adjustmentRequired: quantity < safetyStock || Math.random() > 0.8,
        inboundRequired: quantity < safetyStock * 2 || Math.random() > 0.7,
        outboundRequired: quantity > 5000 || Math.random() > 0.9,
      })

      totalQuantity += quantity
      totalStockValue += stockValue
    }

    data.push({
      id: productId++,
      productName: `${product} ${p % 10 === 0 ? '프리미엄' : p % 10 === 1 ? '클래식' : p % 10 === 2 ? '트렌디' : ''}`,
      purchasedProductName: `[사입] ${product}`,
      productCode: `FSH-${String(p + 1).padStart(5, '0')}`,
      category: categories[p % categories.length],
      brand: brands[p % brands.length],
      price,
      representativeSalesPrice,
      thumbnail: `https://images.unsplash.com/photo-${[
        '1595777671160-35851218e0f0?w=400&h=400&fit=crop',
        '1542272604-787c62bf2638?w=400&h=400&fit=crop',
        '1548345540-40ddbc30900f?w=400&h=400&fit=crop',
        '1547994396-fb3fc6f95f98?w=400&h=400&fit=crop',
        '1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        '1584411462286-6f2a4b3f7b9a?w=400&h=400&fit=crop',
        '1539533057143-dae2055cbcc1?w=400&h=400&fit=crop',
        '1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        '1590195753519-f1b582be3b6a?w=400&h=400&fit=crop',
        '1548036328-c9fa89d128fa?w=400&h=400&fit=crop'
      ][p % 10]}`,
      registrationDate,
      productRegistrationDate: registrationDate,
      lastModifiedDate: modifiedDate,
      productPublishDate: publishDate,
      expectedPoDate,
      poSettingDate,
      soldOutDate,
      stockRegistrationDate: stockRegDate,
      supplier: suppliers[p % suppliers.length],
      productClassification: categories[p % categories.length],
      designer: designers[p % designers.length],
      registeredBy: registeredUsers[p % registeredUsers.length],
      salesStatus: Math.random() > 0.8 ? 'discontinued' : Math.random() > 0.7 ? 'inactive' : 'active',
      isFullySoldOut: productOptions.every(opt => opt.status === 'out_of_stock'),
      isProductLocationRegistered: Math.random() > 0.2,
      productYear: years[p % years.length],
      productSeason: seasons[p % seasons.length],
      hasShippingHistory: Math.random() > 0.3,
      isNonExhibitionShipped: Math.random() > 0.8,
      includesUnreceivedQuantity: Math.random() > 0.85,
      isOptionMergePrevented: Math.random() > 0.9,
      daysWithoutOptionOrder: Math.floor(Math.random() * 365),
      daysWithoutProductOrder: Math.floor(Math.random() * 365),
      options: productOptions,
      totalQuantity,
      totalStockValue,
    })
  }

  return data
}

// ===== 메인 컴포넌트 =====

export default function StockTransferPage() {
  const [form] = Form.useForm()
  
  // 탭별 상태
  const [transferItems, setTransferItems] = useState<TransferItem[]>([])
  const [stockData, setStockData] = useState<StockItem[]>(generateDummyStockData())
  
  // UI 상태
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  
  // ===== 1. 창고간 이동 =====
  const handleWarehouseTransfer = useCallback(async (values: any) => {
    // 현재 재고 확인
    const product = stockData.find(p => p.id === values.productId)
    const option = product?.options.find(o => o.id === values.optionId)
    
    if (!option) {
      message.error('옵션 정보를 찾을 수 없습니다.')
      return
    }
    
    if (values.transferQuantity > option.quantity) {
      message.error(`재고 부족: 현재 재고는 ${option.quantity}개입니다.`)
      return
    }
    
    const newTransfer: TransferItem = {
      id: `TRN-${Date.now()}-${Math.random()}`,
      productId: values.productId,
      optionId: values.optionId,
      productName: values.productName,
      optionName: values.optionName,
      barcode: values.barcode,
      transferQuantity: values.transferQuantity,
      fromWarehouse: values.fromWarehouse,
      toWarehouse: values.toWarehouse,
      fromLocation: values.fromLocation,
      toLocation: values.toLocation,
      status: 'pending',
      reason: values.reason || '',
      createdAt: new Date(),
      createdBy: 'Admin',
    }
    
    setTransferItems([...transferItems, newTransfer])
    form.resetFields(['transferQuantity', 'toLocation', 'reason'])
    message.success('이동 항목이 추가되었습니다.')
  }, [transferItems, form, stockData])
  
  // ===== 2. 개별 창고 이동 =====
  const handleIndividualTransfer = useCallback((product: StockItem, option: ProductOption) => {
    form.setFieldsValue({
      productId: product.id,
      productName: product.productName,
      optionId: option.id,
      optionName: option.optionName,
      barcode: option.barcode,
      fromLocation: option.location,
    })
  }, [form])

  // ===== 2-1. CSV 이동 =====
  const handleCsvUpload = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        return {
          productCode: values[0],
          optionName: values[1],
          transferQuantity: parseInt(values[2]),
          fromWarehouse: values[3],
          toWarehouse: values[4],
          reason: values[5] || '',
        }
      })
      
      setCsvPreview(data)
      message.success(`${data.length}개의 이동 항목을 읽어왔습니다.`)
    } catch (error) {
      message.error('CSV 파일 읽기 실패')
    }
  }, [])
  
  const handleCsvApply = useCallback(() => {
    const newTransfers: TransferItem[] = []
    const errors: string[] = []
    
    csvPreview.forEach((item, idx) => {
      const product = stockData.find(p => p.productCode === item.productCode)
      const option = product?.options.find(o => o.optionName === item.optionName)
      
      if (!product || !option) {
        errors.push(`${idx + 1}행: 상품 또는 옵션을 찾을 수 없습니다.`)
        return
      }
      
      if (item.transferQuantity > option.quantity) {
        errors.push(`${idx + 1}행: 재고 부족 (현재: ${option.quantity}개, 요청: ${item.transferQuantity}개)`)
        return
      }
      
      newTransfers.push({
        id: `TRN-CSV-${Date.now()}-${idx}`,
        productId: product.id,
        optionId: option.id,
        productName: product.productName,
        optionName: item.optionName,
        barcode: option.barcode,
        transferQuantity: item.transferQuantity,
        fromWarehouse: item.fromWarehouse,
        toWarehouse: item.toWarehouse,
        fromLocation: option.location,
        status: 'pending',
        reason: item.reason,
        createdAt: new Date(),
        createdBy: 'Admin',
      })
    })
    
    if (errors.length > 0) {
      Modal.error({
        title: 'CSV 처리 오류',
        content: (
          <div>
            <p>다음 항목에서 오류가 발생했습니다:</p>
            <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {errors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </div>
        ),
      })
      return
    }
    
    setTransferItems([...transferItems, ...newTransfers])
    setCsvPreview([])
    setFileList([])
    message.success(`${newTransfers.length}개의 이동 항목이 추가되었습니다.`)
  }, [csvPreview, transferItems, stockData])
  
  // ===== 4. 바코드 이동 =====
  const handleBarcodeTransfer = useCallback(async (barcode: string, values: any) => {
    let foundItem = false
    
    for (const product of stockData) {
      const option = product.options.find(o => o.barcode === barcode)
      if (option) {
        // 재고 검증
        if (values.barcodeTransferQuantity > option.quantity) {
          message.error(`재고 부족: 현재 재고는 ${option.quantity}개입니다.`)
          return
        }
        
        const newTransfer: TransferItem = {
          id: `TRN-BC-${Date.now()}`,
          productId: product.id,
          optionId: option.id,
          productName: product.productName,
          optionName: option.optionName,
          barcode: option.barcode,
          transferQuantity: values.barcodeTransferQuantity,
          fromWarehouse: values.barcodeFromWarehouse,
          toWarehouse: values.barcodeToWarehouse,
          fromLocation: option.location,
          status: 'pending',
          reason: values.barcodeReason || '',
          createdAt: new Date(),
          createdBy: 'Admin',
        }
        
        setTransferItems(prev => [...prev, newTransfer])
        foundItem = true
        message.success(`${product.productName} - ${option.optionName}이 추가되었습니다. (${option.quantity}개 재고)`)
        break
      }
    }
    
    if (!foundItem) {
      message.error('해당 바코드를 찾을 수 없습니다.')
    }
  }, [stockData])
  
  // ===== 이동 항목 관리 =====
  const removeTransferItem = useCallback((id: string) => {
    setTransferItems(prev => prev.filter(item => item.id !== id))
    message.success('항목이 삭제되었습니다.')
  }, [])
  
  const confirmTransfer = useCallback(() => {
    if (transferItems.length === 0) {
      message.warning('이동할 항목이 없습니다.')
      return
    }
    
    Modal.confirm({
      title: '재고 이동 확인',
      content: `총 ${transferItems.length}개 항목, ${transferItems.reduce((sum, item) => sum + item.transferQuantity, 0)}개 상품을 이동하시겠습니까?`,
      okText: '확인',
      cancelText: '취소',
      onOk() {
        const transferNo = `TRANS-${dayjs().format('YYYYMMDD')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        
        // 실제 재고 데이터 업데이트
        setStockData(prevStockData => {
          const newStockData = prevStockData.map(product => {
            const productTransfers = transferItems.filter(item => item.productId === product.id)
            
            if (productTransfers.length === 0) return product
            
            // 옵션별로 수량 차감
            const updatedOptions = product.options.map(option => {
              const optionTransfer = productTransfers.find(t => t.optionId === option.id)
              
              if (!optionTransfer) return option
              
              const newQuantity = Math.max(0, option.quantity - optionTransfer.transferQuantity)
              const newStatus = newQuantity > 100 ? 'in_stock' : newQuantity > 20 ? 'low_stock' : 'out_of_stock'
              
              return {
                ...option,
                quantity: newQuantity,
                status: newStatus as 'in_stock' | 'low_stock' | 'out_of_stock',
                statusText: newStatus === 'in_stock' ? '재고충분' : newStatus === 'low_stock' ? '적은재고' : '품절',
                stockValue: newQuantity * option.cost,
                adjustmentRequired: newQuantity < option.safetyStock,
                inboundRequired: newQuantity < option.safetyStock * 2,
              }
            })
            
            // 전체 수량 및 금액 재계산
            const newTotalQuantity = updatedOptions.reduce((sum, opt) => sum + opt.quantity, 0)
            const newTotalStockValue = updatedOptions.reduce((sum, opt) => sum + opt.stockValue, 0)
            
            return {
              ...product,
              options: updatedOptions,
              totalQuantity: newTotalQuantity,
              totalStockValue: newTotalStockValue,
              isFullySoldOut: updatedOptions.every(opt => opt.status === 'out_of_stock'),
            }
          })
          
          return newStockData
        })
        
        const request: TransferRequest = {
          transferNo,
          items: transferItems.map(item => ({ ...item, status: 'completed' as const })),
          totalQuantity: transferItems.reduce((sum, item) => sum + item.transferQuantity, 0),
          createdAt: new Date(),
          createdBy: 'Admin',
          status: 'completed',
        }
        
        // 이동 이력은 별도 페이지에서 관리 (추후 API 연동)
        console.log('Transfer completed:', request)
        
        setTransferItems([])
        setCsvPreview([])
        setFileList([])
        form.resetFields()
        message.success(`이동 번호: ${transferNo}로 완료되었습니다. 재고가 업데이트되었습니다.`)
      },
    })
  }, [transferItems, form])
  
  // ===== 컬럼 정의 =====
  const transferColumns = [
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '옵션',
      dataIndex: 'optionName',
      key: 'optionName',
      width: 100,
    },
    {
      title: '바코드',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 120,
    },
    {
      title: '수량',
      dataIndex: 'transferQuantity',
      key: 'transferQuantity',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '출발',
      key: 'from',
      width: 120,
      render: (_: any, record: TransferItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{record.fromWarehouse}</span>
          <span style={{ fontSize: '11px', color: '#999' }}>{record.fromLocation}</span>
        </Space>
      ),
    },
    {
      title: '',
      key: 'arrow',
      width: 30,
      align: 'center' as const,
      render: () => <ArrowRightOutlined style={{ color: '#1890ff', fontWeight: 'bold' }} />,
    },
    {
      title: '도착',
      key: 'to',
      width: 120,
      render: (_: any, record: TransferItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{record.toWarehouse}</span>
          <span style={{ fontSize: '11px', color: '#999' }}>{record.toLocation || '-'}</span>
        </Space>
      ),
    },
    {
      title: '상태',
      key: 'status',
      width: 80,
      render: (_: any, record: TransferItem) => {
        const statusMap = {
          pending: { color: 'orange', text: '대기중' },
          processing: { color: 'blue', text: '진행중' },
          completed: { color: 'green', text: '완료' },
          failed: { color: 'red', text: '실패' },
        }
        return <Tag color={statusMap[record.status].color}>{statusMap[record.status].text}</Tag>
      },
    },
    {
      title: '작업',
      key: 'action',
      width: 80,
      render: (_: any, record: TransferItem) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeTransferItem(record.id)}
        />
      ),
    },
  ]
  
  // CSV 템플릿 다운로드
  const downloadCsvTemplate = () => {
    // 실제 상품 데이터 기반 예시 생성
    const exampleProduct = stockData[0]
    const exampleOption = exampleProduct?.options[0]
    
    const template = `상품코드,옵션명,수량,출발창고,도착창고,사유
${exampleProduct?.productCode || 'FSH-00001'},${exampleOption?.optionName || 'XS'},10,본점 창고,부산 창고,정상이동
${exampleProduct?.productCode || 'FSH-00001'},${exampleProduct?.options[1]?.optionName || 'S'},5,본점 창고,대구 창고,재고조정`
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transfer_template_${dayjs().format('YYYYMMDD')}.csv`
    link.click()
    message.success('CSV 템플릿이 다운로드되었습니다.')
  }
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', padding: '20px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#1F2B60' }}>재고 이동 등록</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>창고 간 재고 이동 및 위치 변경을 등록합니다.</p>
        </div>
        
        {/* 이동 방식 탭 */}
        <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <Tabs
            items={[
                      {
                        key: 'warehouse',
                        label: (
                          <span>
                            창고간 이동
                          </span>
                        ),
                        children: (
                          <>
                            <Form layout="vertical" form={form} onFinish={handleWarehouseTransfer}>
                            <Row gutter={16}>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item
                                  label="출발 창고"
                                  name="fromWarehouse"
                                  rules={[{ required: true, message: '선택하세요' }]}
                                >
                                  <Select placeholder="창고 선택">
                                    {WAREHOUSES.map(w => (
                                      <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item
                                  label="도착 창고"
                                  name="toWarehouse"
                                  rules={[{ required: true, message: '선택하세요' }]}
                                >
                                  <Select placeholder="창고 선택">
                                    {WAREHOUSES.map(w => (
                                      <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>
                            
                            <Form.Item
                              label="상품 선택"
                              name="productId"
                              rules={[{ required: true, message: '상품을 선택하세요' }]}
                            >
                              <div style={{ 
                                border: '1px solid #d9d9d9', 
                                borderRadius: '6px', 
                                maxHeight: '300px', 
                                overflowY: 'auto',
                                padding: '8px'
                              }}>
                                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                  {stockData.map(product => (
                                    <div
                                      key={product.id}
                                      onClick={() => {
                                        form.setFieldValue('productId', product.id)
                                        form.setFieldValue('productName', product.productName)
                                        form.setFieldValue('optionId', undefined)
                                        form.setFieldValue('optionName', undefined)
                                      }}
                                      style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        border: form.getFieldValue('productId') === product.id ? '2px solid #1890ff' : '1px solid #e8e8e8',
                                        background: form.getFieldValue('productId') === product.id ? '#e6f7ff' : '#fff',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                      }}
                                    >
                                      <img 
                                        src={product.thumbnail} 
                                        alt={product.productName}
                                        style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                                      />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {product.productName}
                                        </p>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                                          {product.productCode} | {product.brand}
                                        </p>
                                        <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                                          재고: {product.totalQuantity}개 | ₩{product.price.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </Space>
                              </div>
                            </Form.Item>
                            
                            {form.getFieldValue('productId') && (
                              <Form.Item
                                label="옵션 선택"
                                name="optionId"
                                rules={[{ required: true, message: '옵션을 선택하세요' }]}
                              >
                                <div style={{ 
                                  border: '1px solid #d9d9d9', 
                                  borderRadius: '6px', 
                                  maxHeight: '250px', 
                                  overflowY: 'auto',
                                  padding: '8px'
                                }}>
                                  <Row gutter={[8, 8]}>
                                    {stockData
                                      .find(p => p.id === form.getFieldValue('productId'))
                                      ?.options.map(option => (
                                        <Col key={option.id} xs={12} sm={8} lg={6}>
                                          <div
                                            onClick={() => {
                                              form.setFieldValue('optionId', option.id)
                                              form.setFieldValue('optionName', option.optionName)
                                              form.setFieldValue('barcode', option.barcode)
                                              form.setFieldValue('fromLocation', option.location)
                                            }}
                                            style={{
                                              padding: '12px',
                                              borderRadius: '6px',
                                              border: form.getFieldValue('optionId') === option.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                              background: form.getFieldValue('optionId') === option.id ? '#e6f7ff' : '#fff',
                                              cursor: 'pointer',
                                              textAlign: 'center',
                                              transition: 'all 0.3s',
                                            }}
                                          >
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '12px' }}>
                                              {option.optionName}
                                            </p>
                                            <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#1890ff', fontWeight: '600' }}>
                                              {option.quantity}개
                                            </p>
                                            <p style={{ margin: '0', fontSize: '10px', color: '#999' }}>
                                              {option.warehouse}
                                            </p>
                                          </div>
                                        </Col>
                                      ))}
                                  </Row>
                                </div>
                              </Form.Item>
                            )}
                            
                            <Row gutter={16}>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item
                                  label="현재 위치"
                                  name="fromLocation"
                                  rules={[{ required: true }]}
                                >
                                  <Input readOnly />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item
                                  label="도착 위치"
                                  name="toLocation"
                                >
                                  <Input placeholder="예: A-01-01" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item
                                  label="이동 수량"
                                  name="transferQuantity"
                                  rules={[{ required: true, message: '수량을 입력하세요' }]}
                                >
                                  <InputNumber min={1} style={{ width: '100%' }} />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item label="&nbsp;" style={{ marginBottom: 0 }}>
                                  <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                    추가
                                  </Button>
                                </Form.Item>
                              </Col>
                            </Row>
                            
                            <Form.Item
                              label="사유"
                              name="reason"
                            >
                              <Input.TextArea rows={2} placeholder="이동 사유를 입력하세요." />
                            </Form.Item>
                          </Form>
                          
                          <Divider style={{ margin: '24px 0' }} />
                          
                          <h3 style={{ marginBottom: '16px' }}>대량 선택 이동</h3>
                          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>아래에서 여러 상품을 선택하여 한 번에 이동할 수 있습니다.</p>
                          
                          <Row gutter={16} style={{ marginBottom: '16px' }}>
                            <Col xs={24} sm={12} lg={8}>
                              <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px' }}>
                                <p style={{ margin: '0 0 12px 0', fontWeight: 600 }}>출발 창고</p>
                                <Select
                                  placeholder="선택"
                                  value={form.getFieldValue('fromWarehouse')}
                                  onChange={(val) => form.setFieldValue('fromWarehouse', val)}
                                  style={{ width: '100%' }}
                                >
                                  {WAREHOUSES.map(w => (
                                    <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                                  ))}
                                </Select>
                              </div>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                              <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px' }}>
                                <p style={{ margin: '0 0 12px 0', fontWeight: 600 }}>도착 창고</p>
                                <Select
                                  placeholder="선택"
                                  value={form.getFieldValue('toWarehouse')}
                                  onChange={(val) => form.setFieldValue('toWarehouse', val)}
                                  style={{ width: '100%' }}
                                >
                                  {WAREHOUSES.map(w => (
                                    <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                                  ))}
                                </Select>
                              </div>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                              <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px' }}>
                                <p style={{ margin: '0 0 12px 0', fontWeight: 600 }}>선택된 수량</p>
                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                                  {selectedItems.size}개 상품
                                </p>
                              </div>
                            </Col>
                          </Row>
                          
                          <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                              {stockData.map(product => (
                                <div key={product.id} style={{ background: 'white', padding: '16px', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
                                  <Row gutter={16} align="middle" style={{ marginBottom: '12px' }}>
                                    <Col xs={4} sm={3}>
                                      <img 
                                        src={product.thumbnail} 
                                        alt={product.productName}
                                        style={{ width: '100%', borderRadius: '4px', aspectRatio: '1/1', objectFit: 'cover' }}
                                      />
                                    </Col>
                                    <Col xs={20} sm={21}>
                                      <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '14px' }}>
                                        {product.productName}
                                      </p>
                                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                                        상품코드: {product.productCode} | 브랜드: {product.brand}
                                      </p>
                                      <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                                        공급처: {product.supplier} | 가격: ₩{product.price.toLocaleString()}
                                      </p>
                                    </Col>
                                  </Row>
                                  <Row gutter={[8, 8]}>
                                    {product.options.map(option => {
                                      const itemKey = `${product.id}-${option.id}`
                                      const isSelected = selectedItems.has(itemKey)
                                      const statusColors: { [key: string]: string } = {
                                        'in_stock': '#52c41a',
                                        'low_stock': '#faad14',
                                        'out_of_stock': '#f5222d',
                                      }
                                      const isOutOfStock = option.quantity === 0
                                      
                                      return (
                                        <Col key={option.id} xs={12} sm={8} lg={6}>
                                          <Button
                                            block
                                            disabled={isOutOfStock}
                                            style={{
                                              whiteSpace: 'normal',
                                              height: 'auto',
                                              minHeight: '56px',
                                              background: isOutOfStock ? '#f5f5f5' : isSelected ? '#1890ff' : '#fff',
                                              color: isOutOfStock ? '#bbb' : isSelected ? '#fff' : '#000',
                                              border: isSelected ? '2px solid #0050b3' : '1px solid #d9d9d9',
                                              fontWeight: isSelected ? '600' : '400',
                                              position: 'relative',
                                              opacity: isOutOfStock ? 0.5 : 1,
                                            }}
                                            onClick={() => {
                                              if (isOutOfStock) return
                                              const newSet = new Set(selectedItems)
                                              if (newSet.has(itemKey)) {
                                                newSet.delete(itemKey)
                                              } else {
                                                newSet.add(itemKey)
                                              }
                                              setSelectedItems(newSet)
                                            }}
                                          >
                                            <div>
                                              <div style={{ fontSize: '12px', fontWeight: 'inherit', marginBottom: '2px' }}>
                                                {option.optionName}
                                              </div>
                                              <div style={{ 
                                                fontSize: '13px', 
                                                fontWeight: '600', 
                                                marginBottom: '2px', 
                                                color: isOutOfStock ? '#999' : isSelected ? '#fff' : statusColors[option.status]
                                              }}>
                                                {option.quantity}개
                                              </div>
                                              <div style={{ fontSize: '10px', marginTop: '2px', opacity: isSelected ? 0.9 : 0.7 }}>
                                                {option.warehouse}
                                              </div>
                                              {isOutOfStock && (
                                                <div style={{ fontSize: '10px', color: '#f5222d', marginTop: '2px' }}>
                                                  품절
                                                </div>
                                              )}
                                            </div>
                                          </Button>
                                        </Col>
                                      )
                                    })}
                                  </Row>
                                </div>
                              ))}
                            </Space>
                          </div>
                          
                          <Row justify="end" gutter={8} style={{ marginTop: '16px' }}>
                            <Col>
                              <Button onClick={() => setSelectedItems(new Set())}>선택 초기화</Button>
                            </Col>
                            <Col>
                              <Button
                                type="primary"
                                onClick={() => {
                                  const fromWarehouse = form.getFieldValue('fromWarehouse')
                                  const toWarehouse = form.getFieldValue('toWarehouse')
                                  
                                  if (!fromWarehouse || !toWarehouse) {
                                    message.warning('출발/도착 창고를 선택하세요.')
                                    return
                                  }
                                  
                                  if (selectedItems.size === 0) {
                                    message.warning('이동할 상품을 선택하세요.')
                                    return
                                  }
                                  
                                  const newTransfers: TransferItem[] = []
                                  const errors: string[] = []
                                  
                                  Array.from(selectedItems).forEach((itemKey, idx) => {
                                    const [productId, optionId] = itemKey.split('-').map(Number)
                                    const product = stockData.find(p => p.id === productId)
                                    const option = product?.options.find(o => o.id === optionId)
                                    
                                    if (!product || !option) {
                                      errors.push(`상품을 찾을 수 없습니다: ${itemKey}`)
                                      return
                                    }
                                    
                                    if (option.quantity === 0) {
                                      errors.push(`${product.productName} - ${option.optionName}: 재고 없음`)
                                      return
                                    }
                                    
                                    newTransfers.push({
                                      id: `TRN-MULTI-${Date.now()}-${idx}`,
                                      productId: productId,
                                      optionId: optionId,
                                      productName: product.productName,
                                      optionName: option.optionName,
                                      barcode: option.barcode,
                                      transferQuantity: option.quantity,
                                      fromWarehouse: fromWarehouse,
                                      toWarehouse: toWarehouse,
                                      fromLocation: option.location,
                                      toLocation: form.getFieldValue('toLocation'),
                                      status: 'pending',
                                      reason: form.getFieldValue('reason') || '',
                                      createdAt: new Date(),
                                      createdBy: 'Admin',
                                    })
                                  })
                                  
                                  if (errors.length > 0) {
                                    Modal.warning({
                                      title: '일부 항목 오류',
                                      content: (
                                        <div>
                                          <p>다음 항목은 추가할 수 없습니다:</p>
                                          <ul>
                                            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                                          </ul>
                                        </div>
                                      ),
                                    })
                                  }
                                  
                                  if (newTransfers.length > 0) {
                                    setTransferItems([...transferItems, ...newTransfers])
                                    setSelectedItems(new Set())
                                    message.success(`${newTransfers.length}개 항목이 추가되었습니다.`)
                                  }
                                }}
                              >
                                선택한 상품 이동추가
                              </Button>
                            </Col>
                          </Row>
                          </>
                        ),
                      },
                      {
                        key: 'individual',
                        label: (
                          <span>
                            개별 이동
                          </span>
                        ),
                        children: (
                          <Space direction="vertical" style={{ width: '100%' }} size="large">
                            {stockData.map(product => (
                              <div key={product.id} style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                                <Row gutter={16} align="middle" style={{ marginBottom: '12px' }}>
                                  <Col xs={4} sm={3}>
                                    <img 
                                      src={product.thumbnail} 
                                      alt={product.productName}
                                      style={{ width: '100%', borderRadius: '4px', aspectRatio: '1/1', objectFit: 'cover' }}
                                    />
                                  </Col>
                                  <Col xs={20} sm={21}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '14px' }}>
                                      {product.productName}
                                    </p>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                                      상품코드: {product.productCode} | 브랜드: {product.brand}
                                    </p>
                                    <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                                      총 재고: {product.totalQuantity}개 | 가격: ₩{product.price.toLocaleString()}
                                    </p>
                                  </Col>
                                </Row>
                                <Row gutter={[8, 8]}>
                                  {product.options.map(option => {
                                    const isOutOfStock = option.quantity === 0
                                    const statusColors: { [key: string]: string } = {
                                      'in_stock': '#52c41a',
                                      'low_stock': '#faad14',
                                      'out_of_stock': '#f5222d',
                                    }
                                    
                                    return (
                                      <Col key={option.id} xs={12} sm={8} lg={6}>
                                        <Button
                                          block
                                          disabled={isOutOfStock}
                                          style={{ 
                                            whiteSpace: 'normal', 
                                            height: 'auto', 
                                            minHeight: '56px',
                                            background: isOutOfStock ? '#f5f5f5' : '#fff',
                                            border: '1px solid #d9d9d9',
                                            opacity: isOutOfStock ? 0.5 : 1,
                                          }}
                                          onClick={() => handleIndividualTransfer(product, option)}
                                        >
                                          <div>
                                            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                                              {option.optionName}
                                            </div>
                                            <div style={{ 
                                              fontSize: '13px', 
                                              fontWeight: '600', 
                                              marginBottom: '2px', 
                                              color: isOutOfStock ? '#999' : statusColors[option.status]
                                            }}>
                                              {option.quantity}개
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.7 }}>
                                              {option.warehouse}
                                            </div>
                                            {isOutOfStock && (
                                              <div style={{ fontSize: '10px', color: '#f5222d', marginTop: '2px' }}>
                                                품절
                                              </div>
                                            )}
                                          </div>
                                        </Button>
                                      </Col>
                                    )
                                  })}
                                </Row>
                              </div>
                            ))}
                          </Space>
                        ),
                      },
                      {
                        key: 'csv',
                        label: (
                          <span>
                            CSV 일괄
                          </span>
                        ),
                        children: (
                          <Space direction="vertical" style={{ width: '100%' }} size="large">
                            <div>
                              <Button 
                                icon={<DownloadOutlined />} 
                                onClick={downloadCsvTemplate}
                              >
                                CSV 템플릿 다운로드
                              </Button>
                              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                위 템플릿을 다운로드하여 데이터를 입력한 후 업로드하세요.
                              </p>
                            </div>
                            
                            <Upload
                              accept=".csv"
                              maxCount={1}
                              fileList={fileList}
                              onChange={({ fileList: newFileList }) => {
                                setFileList(newFileList)
                                if (newFileList.length > 0) {
                                  handleCsvUpload(newFileList[0].originFileObj as File)
                                }
                              }}
                            >
                              <Button>CSV 파일 선택</Button>
                            </Upload>
                            
                            {csvPreview.length > 0 && (
                              <>
                                <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px' }}>
                                  <p style={{ margin: '0 0 12px 0', fontWeight: 600 }}>미리보기 ({csvPreview.length}개)</p>
                                  <Table
                                    columns={[
                                      { title: '상품코드', dataIndex: 'productCode', key: 'productCode', width: 100 },
                                      { title: '옵션명', dataIndex: 'optionName', key: 'optionName', width: 100 },
                                      { title: '수량', dataIndex: 'transferQuantity', key: 'transferQuantity', width: 80 },
                                      { title: '출발', dataIndex: 'fromWarehouse', key: 'fromWarehouse', width: 100 },
                                      { title: '도착', dataIndex: 'toWarehouse', key: 'toWarehouse', width: 100 },
                                    ]}
                                    dataSource={csvPreview}
                                    pagination={false}
                                    size="small"
                                  />
                                </div>
                                <Button type="primary" onClick={handleCsvApply}>
                                  적용
                                </Button>
                              </>
                            )}
                          </Space>
                        ),
                      },
                      {
                        key: 'barcode',
                        label: (
                          <span>
                            바코드 스캔
                          </span>
                        ),
                        children: (
                          <Form
                            layout="vertical"
                            onFinish={(values) => {
                              handleBarcodeTransfer(values.barcode, values)
                            }}
                          >
                            <Row gutter={16}>
                              <Col xs={24} lg={8}>
                                <Form.Item
                                  label="바코드"
                                  name="barcode"
                                  rules={[{ required: true, message: '바코드를 스캔하세요' }]}
                                >
                                  <Input 
                                    placeholder="바코드를 스캔하세요" 
                                    autoFocus
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                            
                            <Row gutter={16}>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item
                                  label="출발 창고"
                                  name="barcodeFromWarehouse"
                                  rules={[{ required: true }]}
                                >
                                  <Select placeholder="선택">
                                    {WAREHOUSES.map(w => (
                                      <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item
                                  label="도착 창고"
                                  name="barcodeToWarehouse"
                                  rules={[{ required: true }]}
                                >
                                  <Select placeholder="선택">
                                    {WAREHOUSES.map(w => (
                                      <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item
                                  label="이동 수량"
                                  name="barcodeTransferQuantity"
                                  rules={[{ required: true }]}
                                >
                                  <InputNumber min={1} style={{ width: '100%' }} />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} lg={6}>
                                <Form.Item label="&nbsp;" style={{ marginBottom: 0 }}>
                                  <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                    추가
                                  </Button>
                                </Form.Item>
                              </Col>
                            </Row>
                            
                            <Form.Item
                              label="사유"
                              name="barcodeReason"
                            >
                              <Input placeholder="이동 사유" />
                            </Form.Item>
                          </Form>
                        ),
                      },
                    ]}
                  />
                  
                  <Divider />
                  
                  {/* 이동 항목 목록 */}
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ marginBottom: '16px' }}>
                      대기 중인 이동 항목 ({transferItems.length}개, {transferItems.reduce((sum, item) => sum + item.transferQuantity, 0)}개)
                    </h3>
                    
                    {transferItems.length === 0 ? (
                      <Empty description="이동 항목이 없습니다." />
                    ) : (
                      <Table
                        columns={transferColumns}
                        dataSource={transferItems}
                        pagination={{ pageSize: 10 }}
                        rowKey="id"
                        size="small"
                      />
                    )}
                  </div>
                  
                  {transferItems.length > 0 && (
                    <Row justify="end" gutter={8}>
                      <Col>
                        <Button onClick={() => setTransferItems([])}>전체 삭제</Button>
                      </Col>
                      <Col>
                        <Button type="primary" size="large" onClick={confirmTransfer}>
                          이동 확인
                        </Button>
                      </Col>
                    </Row>
                  )}
        </Card>
      </div>
    </div>
  )
}
