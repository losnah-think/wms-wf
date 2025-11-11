'use client'

import { useMemo, useState, useCallback } from 'react'
import { Table, Card, Space, Row, Col, Statistic, Input, Tag, Breadcrumb, Button, Collapse, Drawer, Slider, Select, List, Empty } from 'antd'
import { SearchOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { AllDateFiltersPanel, DateFilterValue, getInitialDateFilterState, isDateInRange } from '@/components/DateRangeFilter'

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
  // 상품의 옵션 목록
  options: ProductOption[]
  // 상품 전체 재고
  totalQuantity: number
  // 상품 전체 재고금액
  totalStockValue: number
}

// 대규모 샘플 데이터 생성 함수
const generateLargeDataset = (): StockItem[] => {
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
  const shippingStatus = ['있음', '없음']
  const displayStatus = ['등록', '미등록']
  const mergeStatus = ['포함', '미포함']
  
  const data: StockItem[] = []
  let productId = 1
  
  // 상품당 몇 개의 옵션을 가질지 결정
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

export default function StockStatusByProductPage() {
  const allStockData = useMemo(() => generateLargeDataset(), [])
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [dateFilters, setDateFilters] = useState<Record<string, DateFilterValue>>(getInitialDateFilterState())
  const [selectedWarehouse, setSelectedWarehouse] = useState<string[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string[]>([])
  const [selectedProductClass, setSelectedProductClass] = useState<string[]>([])
  const [selectedSoldOutClass, setSelectedSoldOutClass] = useState<string[]>([])
  const [selectedDesigner, setSelectedDesigner] = useState<string[]>([])
  const [selectedRegisteredBy, setSelectedRegisteredBy] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string[]>([])
  const [selectedSalesStatus, setSelectedSalesStatus] = useState<string[]>([])
  const [selectedFullySoldOut, setSelectedFullySoldOut] = useState<string[]>([])
  const [selectedLocationRegistered, setSelectedLocationRegistered] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string[]>([])
  const [selectedShippingHistory, setSelectedShippingHistory] = useState<string[]>([])
  const [selectedNonExhibition, setSelectedNonExhibition] = useState<string[]>([])
  const [selectedUnreceivedQty, setSelectedUnreceivedQty] = useState<string[]>([])
  const [selectedInventorySync, setSelectedInventorySync] = useState<string[]>([])
  const [selectedMergePrevention, setSelectedMergePrevention] = useState<string[]>([])
  const [showDetailFilters, setShowDetailFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'product' | 'option'>('product')  // 상품별/옵션별 보기
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())  // 펼쳐진 상품 ID
  
  // 상품 펼침/접기 토글
  const toggleProductExpanded = useCallback((productId: number) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }, [])
  
  // 범위 필터 state
  const [stockQuantityRange, setStockQuantityRange] = useState<[number, number]>([0, 10000])
  const [optionSalesAmountRange, setOptionSalesAmountRange] = useState<[number, number]>([0, 5000000])
  const [stockInventoryAmountRange, setStockInventoryAmountRange] = useState<[number, number]>([0, 10000000])

  // 날짜 필터 변경 핸들러
  const handleDateFilterChange = useCallback((filterId: string, value: DateFilterValue) => {
    setDateFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }))
  }, [])

  // 필터 초기화
  const handleFilterReset = useCallback(() => {
    setDateFilters(getInitialDateFilterState())
    setSearchText('')
    setSelectedWarehouse([])
    setSelectedSupplier([])
    setSelectedProductClass([])
    setSelectedSoldOutClass([])
    setSelectedDesigner([])
    setSelectedRegisteredBy([])
    setSelectedBrand([])
    setSelectedSalesStatus([])
    setSelectedFullySoldOut([])
    setSelectedLocationRegistered([])
    setSelectedYear([])
    setSelectedSeason([])
    setSelectedShippingHistory([])
    setSelectedNonExhibition([])
    setSelectedUnreceivedQty([])
    setSelectedInventorySync([])
    setSelectedMergePrevention([])
    setStockQuantityRange([0, 10000])
    setOptionSalesAmountRange([0, 5000000])
    setStockInventoryAmountRange([0, 10000000])
  }, [])

  // 다중 선택 핸들러 - 모든 항목을 선택하면 자동으로 전체 해제
  const handleMultiSelect = useCallback((
    value: string, 
    allOptions: string[], 
    currentSelected: string[], 
    setSetter: (values: string[]) => void
  ) => {
    let newSelected: string[]
    
    if (currentSelected.includes(value)) {
      // 선택된 항목 클릭 시 제거
      newSelected = currentSelected.filter(v => v !== value)
    } else {
      // 선택되지 않은 항목 클릭 시 추가
      newSelected = [...currentSelected, value]
      
      // 모든 항목이 선택되었으면 배열 비우기 (전체 상태로 변경)
      if (newSelected.length === allOptions.length) {
        newSelected = []
      }
    }
    
    setSetter(newSelected)
  }, [])

  // 기능별 액션 핸들러
  const handleAdjustment = useCallback((product: StockItem) => {
    console.log('조정:', product)
    alert(`${product.productName}의 재고 조정을 진행합니다.\n현재 총 재고: ${product.totalQuantity}개`)
  }, [])

  const handleInbound = useCallback((product: StockItem) => {
    console.log('입고:', product)
    alert(`${product.productName}의 입고를 신청합니다.\n공급처: ${product.supplier}`)
  }, [])

  const handleOutbound = useCallback((product: StockItem) => {
    console.log('출고:', product)
    alert(`${product.productName}의 출고를 신청합니다.\n현재 총 재고: ${product.totalQuantity}개`)
  }, [])

  const handleInventorySync = useCallback((product: StockItem) => {
    console.log('재고연동:', product)
    alert(`${product.productName}의 재고 연동 설정을 변경합니다.`)
  }, [])

  const handleOptionAction = useCallback((product: StockItem, option: ProductOption, action: string) => {
    console.log(`옵션 ${action}:`, product.productName, option.optionName)
    alert(`${product.productName} - ${option.optionName}의 ${action}을(를) 진행합니다.\n현재 재고: ${option.quantity}개`)
  }, [])

  // 필터 적용 (테이블 데이터 필터링)
  const filteredStockData = useMemo(() => {
    return allStockData.filter((item) => {
      // 검색 필터 - 상품명, 코드로만 필터
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        const matchesSearch =
          item.productName.toLowerCase().includes(searchLower) ||
          item.productCode.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // 날짜 필터
      if (!isDateInRange(item.productRegistrationDate, dateFilters.productRegistrationDate)) return false
      if (!isDateInRange(item.lastModifiedDate, dateFilters.lastModifiedDate)) return false
      if (!isDateInRange(item.productPublishDate, dateFilters.productPublishDate)) return false
      
      // 입고 예정일자 (미설정 포함 로직)
      if (dateFilters.expectedInboundDate.type !== 'all') {
        if (dateFilters.expectedInboundDate.type === 'notset' && item.expectedPoDate) return false
        if (dateFilters.expectedInboundDate.type !== 'notset' && !item.expectedPoDate) return false
        if (!isDateInRange(item.expectedPoDate, dateFilters.expectedInboundDate)) return false
      }
      
      if (!isDateInRange(item.poSettingDate, dateFilters.poSettingDate)) return false
      if (!isDateInRange(item.soldOutDate, dateFilters.soldOutDate)) return false
      if (!isDateInRange(item.stockRegistrationDate, dateFilters.stockRegistrationDate)) return false
      
      // 상품 필터 (다중 선택)
      if (selectedSupplier.length > 0 && !selectedSupplier.includes(item.supplier)) return false
      if (selectedProductClass.length > 0 && !selectedProductClass.includes(item.productClassification)) return false
      if (selectedDesigner.length > 0 && !selectedDesigner.includes(item.designer)) return false
      if (selectedRegisteredBy.length > 0 && !selectedRegisteredBy.includes(item.registeredBy)) return false
      if (selectedBrand.length > 0 && !selectedBrand.includes(item.brand)) return false
      if (selectedSalesStatus.length > 0 && !selectedSalesStatus.includes(item.salesStatus)) return false
      if (selectedFullySoldOut.length > 0 && !selectedFullySoldOut.includes(item.isFullySoldOut ? 'true' : 'false')) return false
      if (selectedLocationRegistered.length > 0 && !selectedLocationRegistered.includes(item.isProductLocationRegistered ? 'true' : 'false')) return false
      if (selectedYear.length > 0 && !selectedYear.includes(item.productYear)) return false
      if (selectedSeason.length > 0 && !selectedSeason.includes(item.productSeason)) return false
      if (selectedShippingHistory.length > 0 && !selectedShippingHistory.includes(item.hasShippingHistory ? 'true' : 'false')) return false
      if (selectedNonExhibition.length > 0 && !selectedNonExhibition.includes(item.isNonExhibitionShipped ? 'true' : 'false')) return false
      if (selectedUnreceivedQty.length > 0 && !selectedUnreceivedQty.includes(item.includesUnreceivedQuantity ? 'true' : 'false')) return false
      if (selectedMergePrevention.length > 0 && !selectedMergePrevention.includes(item.isOptionMergePrevented ? 'true' : 'false')) return false

      return true
    })
  }, [allStockData, searchText, dateFilters, selectedSupplier, selectedProductClass, selectedDesigner, selectedRegisteredBy, selectedBrand, selectedSalesStatus, selectedFullySoldOut, selectedLocationRegistered, selectedYear, selectedSeason, selectedShippingHistory, selectedNonExhibition, selectedUnreceivedQty, selectedMergePrevention])

  const totalQuantity = useMemo(() => filteredStockData.reduce((sum, item) => sum + item.totalQuantity, 0), [filteredStockData])
  const productCount = useMemo(() => filteredStockData.length, [filteredStockData])
  const lowStockCount = useMemo(() => filteredStockData.filter(item => item.options.some(opt => opt.status === 'low_stock' || opt.status === 'out_of_stock')).length, [filteredStockData])
  
  const totalStockValue = useMemo(() => filteredStockData.reduce((sum, item) => sum + item.totalStockValue, 0), [filteredStockData])
  const stockHealth = useMemo(() => {
    const healthyProducts = filteredStockData.filter(item => item.options.every(opt => opt.status === 'in_stock')).length
    return productCount > 0 ? Math.round((healthyProducts / productCount) * 100) : 0
  }, [filteredStockData, productCount])

  // 엑셀 다운로드 함수
  const handleExcelDownload = useCallback(() => {
    // CSV 형식으로 데이터 생성
    const headers = ['상품명', '상품코드', '카테고리', '브랜드', '공급처', '옵션명', '수량', '바코드', '위치', '원가', '판매가', '재고금액', '상태', '안전재고']
    
    const rows = filteredStockData.flatMap((product) =>
      product.options.map((option) => [
        product.productName,
        product.productCode,
        product.category,
        product.brand,
        product.supplier,
        option.optionName,
        option.quantity,
        option.barcode,
        option.location,
        option.cost,
        option.singleSalesPrice,
        option.stockValue,
        option.statusText,
        option.safetyStock,
      ])
    )

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    // Blob 생성 및 다운로드
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `재고현황_${dayjs().format('YYYY-MM-DD_HHmmss')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredStockData])

  // 날짜 필터 설정
  const dateFilterConfigs = {
    productManagement: [
      {
        id: 'productRegistrationDate',
        label: '상품 등록일자',
        group: 'productManagement' as const,
        value: dateFilters.productRegistrationDate,
        onChange: (value: DateFilterValue) => handleDateFilterChange('productRegistrationDate', value),
        presets: [
          { label: '지난 1주', value: '1week', getRange: () => [dayjs().subtract(7, 'day'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 1개월', value: '1month', getRange: () => [dayjs().subtract(1, 'month'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 3개월', value: '3months', getRange: () => [dayjs().subtract(3, 'month'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 1년', value: '1year', getRange: () => [dayjs().subtract(1, 'year'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
        ],
      },
      {
        id: 'lastModifiedDate',
        label: '최종 수정일',
        group: 'productManagement' as const,
        value: dateFilters.lastModifiedDate,
        onChange: (value: DateFilterValue) => handleDateFilterChange('lastModifiedDate', value),
        presets: [
          { label: '오늘', value: 'today', getRange: () => [dayjs(), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '이번 주', value: 'thisweek', getRange: () => [dayjs().startOf('week'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '이번 달', value: 'thismonth', getRange: () => [dayjs().startOf('month'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 달', value: 'lastmonth', getRange: () => [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] as [dayjs.Dayjs, dayjs.Dayjs] },
        ],
      },
      {
        id: 'productPublishDate',
        label: '상품 게시일자',
        group: 'productManagement' as const,
        value: dateFilters.productPublishDate,
        onChange: (value: DateFilterValue) => handleDateFilterChange('productPublishDate', value),
        presets: [
          { label: '지난 1주', value: '1week', getRange: () => [dayjs().subtract(7, 'day'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 1개월', value: '1month', getRange: () => [dayjs().subtract(1, 'month'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
        ],
      },
    ],
    inboundManagement: [
      {
        id: 'expectedInboundDate',
        label: '입고 예정일자',
        group: 'inboundManagement' as const,
        value: dateFilters.expectedInboundDate,
        onChange: (value: DateFilterValue) => handleDateFilterChange('expectedInboundDate', value),
        presets: [
          { label: '오늘', value: 'today', getRange: () => [dayjs(), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '내일', value: 'tomorrow', getRange: () => [dayjs().add(1, 'day'), dayjs().add(1, 'day')] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '이번 주', value: 'thisweek', getRange: () => [dayjs(), dayjs().add(7, 'day')] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '다음 주', value: 'nextweek', getRange: () => [dayjs().add(7, 'day'), dayjs().add(14, 'day')] as [dayjs.Dayjs, dayjs.Dayjs] },
        ],
        allowNotSet: true,
      },
      {
        id: 'poSettingDate',
        label: '입고 예정 설정일자',
        group: 'inboundManagement' as const,
        value: dateFilters.poSettingDate,
        onChange: (value: DateFilterValue) => handleDateFilterChange('poSettingDate', value),
        presets: [
          { label: '지난 1주', value: '1week', getRange: () => [dayjs().subtract(7, 'day'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 1개월', value: '1month', getRange: () => [dayjs().subtract(1, 'month'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
        ],
      },
    ],
    statusChange: [
      {
        id: 'soldOutDate',
        label: '품절 일자',
        group: 'statusChange' as const,
        value: dateFilters.soldOutDate,
        onChange: (value: DateFilterValue) => handleDateFilterChange('soldOutDate', value),
        presets: [
          { label: '이번 주', value: 'thisweek', getRange: () => [dayjs().startOf('week'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '이번 달', value: 'thismonth', getRange: () => [dayjs().startOf('month'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 3개월', value: '3months', getRange: () => [dayjs().subtract(3, 'month'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
        ],
        allowNotSet: true,
      },
      {
        id: 'stockRegistrationDate',
        label: '재고 등록일자',
        group: 'statusChange' as const,
        value: dateFilters.stockRegistrationDate,
        onChange: (value: DateFilterValue) => handleDateFilterChange('stockRegistrationDate', value),
        presets: [
          { label: '지난 1주', value: '1week', getRange: () => [dayjs().subtract(7, 'day'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 1개월', value: '1month', getRange: () => [dayjs().subtract(1, 'month'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
          { label: '지난 1년', value: '1year', getRange: () => [dayjs().subtract(1, 'year'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
        ],
      },
    ],
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '20px', maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '재고 현황' },
              { title: '상품별 현황' },
            ]}
            style={{ marginBottom: '16px' }}
          />
          <h1 style={{
            color: '#1F2B60',
            fontSize: 40,
            fontFamily: 'Pretendard',
            fontWeight: 700,
            margin: 0,
            marginBottom: '8px',
          }}>
            상품별 재고 현황
          </h1>
          <Row style={{ marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <Col>
              <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
                특정 상품의 모든 옵션별 재고 수량을 한눈에 비교합니다
              </p>
            </Col>
            <Col>
              <Space>
                <Button
                  type={viewMode === 'product' ? 'primary' : 'default'}
                  onClick={() => setViewMode('product')}
                  style={{ borderRadius: '6px' }}
                >
                  상품별 보기
                </Button>
                <Button
                  type={viewMode === 'option' ? 'primary' : 'default'}
                  onClick={() => setViewMode('option')}
                  style={{ borderRadius: '6px' }}
                >
                  옵션별 보기
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* KPI 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고량</span>}
                value={totalQuantity}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>등록상품</span>}
                value={productCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>저재고상품</span>}
                value={lowStockCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고액</span>}
                value={Math.round(totalStockValue / 100000000)}
                suffix="억원"
                precision={1}
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>건강도</span>}
                value={stockHealth}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 검색 및 필터 */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '16px' }}>
          <Col flex="auto">
            <Input
              placeholder="상품명, 상품코드, 바코드로 검색..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: '6px' }}
            />
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerOpen(true)}
              type={Object.values(dateFilters).some(f => f.type !== 'all') ? 'primary' : 'default'}
              style={{ borderRadius: '6px' }}
            >
              날짜 필터
              {Object.values(dateFilters).some(f => f.type !== 'all') && (
                <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  ●
                </span>
              )}
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => setShowDetailFilters(!showDetailFilters)}
              type={selectedWarehouse.length > 0 || selectedSupplier.length > 0 || selectedProductClass.length > 0 || selectedSoldOutClass.length > 0 || selectedDesigner.length > 0 || selectedRegisteredBy.length > 0 || selectedBrand.length > 0 || selectedSalesStatus.length > 0 || selectedFullySoldOut.length > 0 || selectedLocationRegistered.length > 0 || selectedYear.length > 0 || selectedSeason.length > 0 || selectedShippingHistory.length > 0 || selectedNonExhibition.length > 0 || selectedUnreceivedQty.length > 0 || selectedInventorySync.length > 0 || selectedMergePrevention.length > 0 || stockQuantityRange[0] !== 0 || stockQuantityRange[1] !== 10000 || optionSalesAmountRange[0] !== 0 || optionSalesAmountRange[1] !== 5000000 || stockInventoryAmountRange[0] !== 0 || stockInventoryAmountRange[1] !== 10000000 ? 'primary' : 'default'}
              style={{ borderRadius: '6px' }}
            >
              {showDetailFilters ? '▲ 필터 축소' : '▼ 필터 확장'}
              {(selectedWarehouse.length > 0 || selectedSupplier.length > 0 || selectedProductClass.length > 0 || selectedSoldOutClass.length > 0 || selectedDesigner.length > 0 || selectedRegisteredBy.length > 0 || selectedBrand.length > 0 || selectedSalesStatus.length > 0 || selectedFullySoldOut.length > 0 || selectedLocationRegistered.length > 0 || selectedYear.length > 0 || selectedSeason.length > 0 || selectedShippingHistory.length > 0 || selectedNonExhibition.length > 0 || selectedUnreceivedQty.length > 0 || selectedInventorySync.length > 0 || selectedMergePrevention.length > 0 || stockQuantityRange[0] !== 0 || stockQuantityRange[1] !== 10000 || optionSalesAmountRange[0] !== 0 || optionSalesAmountRange[1] !== 5000000 || stockInventoryAmountRange[0] !== 0 || stockInventoryAmountRange[1] !== 10000000) && (
                <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  ●
                </span>
              )}
            </Button>
          </Col>
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExcelDownload}
              type="primary"
              style={{ borderRadius: '6px', backgroundColor: '#52c41a' }}
            >
              엑셀 다운로드
            </Button>
          </Col>
        </Row>

        {/* 적용된 필터 표시 - 상단에 배치 */}
        {(searchText || Object.values(dateFilters).some(f => f.type !== 'all') || selectedWarehouse.length > 0 || selectedSupplier.length > 0 || selectedProductClass.length > 0 || selectedSoldOutClass.length > 0 || selectedDesigner.length > 0 || selectedRegisteredBy.length > 0 || selectedBrand.length > 0 || selectedSalesStatus.length > 0 || selectedFullySoldOut.length > 0 || selectedLocationRegistered.length > 0 || selectedYear.length > 0 || selectedSeason.length > 0 || selectedShippingHistory.length > 0 || selectedNonExhibition.length > 0 || selectedUnreceivedQty.length > 0 || selectedInventorySync.length > 0 || selectedMergePrevention.length > 0 || stockQuantityRange[0] !== 0 || stockQuantityRange[1] !== 10000 || optionSalesAmountRange[0] !== 0 || optionSalesAmountRange[1] !== 5000000 || stockInventoryAmountRange[0] !== 0 || stockInventoryAmountRange[1] !== 10000000) && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#FFF7E6', borderRadius: '6px', border: '2px solid #FFA940', boxShadow: '0 2px 4px rgba(255, 165, 0, 0.1)' }}>
            <Row gutter={[8, 8]} align="middle">
              <Col>
                <span style={{ fontSize: '12px', color: '#B8600B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>⚙️</span> 활성 필터 적용됨
                </span>
              </Col>
              <Col flex="auto">
                <Space size={[8, 8]} wrap>
                  {selectedSupplier.length > 0 && <Tag closable onClose={() => setSelectedSupplier([])} color="orange" style={{ margin: 0 }}>공급처: {selectedSupplier.join(', ')}</Tag>}
                  {selectedProductClass.length > 0 && <Tag closable onClose={() => setSelectedProductClass([])} color="orange" style={{ margin: 0 }}>상품분류: {selectedProductClass.join(', ')}</Tag>}
                  {selectedSoldOutClass.length > 0 && <Tag closable onClose={() => setSelectedSoldOutClass([])} color="orange" style={{ margin: 0 }}>품절분류: {selectedSoldOutClass.join(', ')}</Tag>}
                  {selectedDesigner.length > 0 && <Tag closable onClose={() => setSelectedDesigner([])} color="orange" style={{ margin: 0 }}>디자이너: {selectedDesigner.join(', ')}</Tag>}
                  {selectedRegisteredBy.length > 0 && <Tag closable onClose={() => setSelectedRegisteredBy([])} color="orange" style={{ margin: 0 }}>등록자: {selectedRegisteredBy.join(', ')}</Tag>}
                  {selectedBrand.length > 0 && <Tag closable onClose={() => setSelectedBrand([])} color="orange" style={{ margin: 0 }}>브랜드: {selectedBrand.join(', ')}</Tag>}
                  {selectedSalesStatus.length > 0 && <Tag closable onClose={() => setSelectedSalesStatus([])} color="orange" style={{ margin: 0 }}>판매상태: {selectedSalesStatus.map(s => s === 'active' ? '판매중' : s === 'inactive' ? '미판매' : '단종').join(', ')}</Tag>}
                  {selectedYear.length > 0 && <Tag closable onClose={() => setSelectedYear([])} color="orange" style={{ margin: 0 }}>연도: {selectedYear.join(', ')}</Tag>}
                  {selectedSeason.length > 0 && <Tag closable onClose={() => setSelectedSeason([])} color="orange" style={{ margin: 0 }}>시즌: {selectedSeason.join(', ')}</Tag>}
                  {(stockQuantityRange[0] !== 0 || stockQuantityRange[1] !== 10000) && <Tag closable onClose={() => setStockQuantityRange([0, 10000])} color="volcano" style={{ margin: 0 }}>재고수량: {stockQuantityRange[0].toLocaleString()}-{stockQuantityRange[1].toLocaleString()}</Tag>}
                  {(optionSalesAmountRange[0] !== 0 || optionSalesAmountRange[1] !== 5000000) && <Tag closable onClose={() => setOptionSalesAmountRange([0, 5000000])} color="volcano" style={{ margin: 0 }}>옵션판매: ₩{optionSalesAmountRange[0].toLocaleString()}-₩{optionSalesAmountRange[1].toLocaleString()}</Tag>}
                  {(stockInventoryAmountRange[0] !== 0 || stockInventoryAmountRange[1] !== 10000000) && <Tag closable onClose={() => setStockInventoryAmountRange([0, 10000000])} color="volcano" style={{ margin: 0 }}>재고금액: ₩{stockInventoryAmountRange[0].toLocaleString()}-₩{stockInventoryAmountRange[1].toLocaleString()}</Tag>}
                  {Object.values(dateFilters).some(f => f.type !== 'all') && <Tag closable onClose={() => setFilterDrawerOpen(true)} color="blue" style={{ margin: 0 }}>날짜 필터 적용</Tag>}
                  {searchText && <Tag closable onClose={() => setSearchText('')} color="cyan" style={{ margin: 0 }}>검색: {searchText}</Tag>}
                </Space>
              </Col>
              <Col>
                <Button type="text" size="small" onClick={handleFilterReset} style={{ color: '#B8600B', fontWeight: '600', fontSize: '12px' }}>전체 초기화</Button>
              </Col>
            </Row>
          </div>
        )}

        {/* 창고 선택 필터 + 상세 필터 */}
        {showDetailFilters && (
          <div style={{ marginBottom: '16px', padding: '16px', background: '#FAFAFA', borderRadius: '6px', border: '1px solid #E8E8E8' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">

              {/* ===== 섹션 1: 주요 필터 ===== */}
              <div style={{ borderBottom: '2px solid #F0F0F0', paddingBottom: '16px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '700', color: '#333', letterSpacing: '0.5px' }}>주요 필터</h4>

                {/* Row 1 */}
                <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
                  <Col span={12}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>공급처</div>
                      <Select
                        mode="multiple"
                        placeholder="공급처 선택"
                        value={selectedSupplier}
                        onChange={setSelectedSupplier}
                        options={[
                          { label: '공급처A', value: '공급처A' },
                          { label: '공급처B', value: '공급처B' },
                          { label: '공급처C', value: '공급처C' },
                          { label: '공급처D', value: '공급처D' },
                          { label: '공급처E', value: '공급처E' },
                          { label: '공급처F', value: '공급처F' },
                          { label: '공급처G', value: '공급처G' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>상품 분류</div>
                      <Select
                        mode="multiple"
                        placeholder="상품 분류 선택"
                        value={selectedProductClass}
                        onChange={setSelectedProductClass}
                        options={[
                          { label: '상의', value: '상의' },
                          { label: '하의', value: '하의' },
                          { label: '아우터', value: '아우터' },
                          { label: '가방', value: '가방' },
                          { label: '신발', value: '신발' },
                          { label: '언더웨어', value: '언더웨어' },
                          { label: '악세서리', value: '악세서리' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                </Row>

                {/* Row 2 */}
                <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
                  <Col span={12}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>디자이너</div>
                      <Select
                        mode="multiple"
                        placeholder="디자이너 선택"
                        value={selectedDesigner}
                        onChange={setSelectedDesigner}
                        options={[
                          { label: '김디자이너', value: '김디자이너' },
                          { label: '이디자이너', value: '이디자이너' },
                          { label: '박디자이너', value: '박디자이너' },
                          { label: '최디자이너', value: '최디자이너' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>브랜드</div>
                      <Select
                        mode="multiple"
                        placeholder="브랜드 선택"
                        value={selectedBrand}
                        onChange={setSelectedBrand}
                        options={[
                          { label: '아르마니', value: '아르마니' },
                          { label: '지방시', value: '지방시' },
                          { label: '발렌시아가', value: '발렌시아가' },
                          { label: '세인트로랑', value: '세인트로랑' },
                          { label: '톰포드', value: '톰포드' },
                          { label: '프라다', value: '프라다' },
                          { label: '구찌', value: '구찌' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                </Row>

                {/* Row 3 */}
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>등록자</div>
                      <Select
                        mode="multiple"
                        placeholder="등록자 선택"
                        value={selectedRegisteredBy}
                        onChange={setSelectedRegisteredBy}
                        options={[
                          { label: '영업담당1', value: '영업담당1' },
                          { label: '영업담당2', value: '영업담당2' },
                          { label: '마케팅', value: '마케팅' },
                          { label: '품질관리', value: '품질관리' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ visibility: 'hidden' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>공간</div>
                      <div />
                    </div>
                  </Col>
                </Row>
              </div>

              {/* ===== 섹션 2: 카테고리 필터 ===== */}
              <div style={{ borderBottom: '2px solid #F0F0F0', paddingBottom: '16px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '700', color: '#333', letterSpacing: '0.5px' }}>카테고리 필터</h4>

                {/* Row 1 */}
                <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>품절 분류</div>
                      <Select
                        mode="multiple"
                        placeholder="품절 분류 선택"
                        value={selectedSoldOutClass}
                        onChange={setSelectedSoldOutClass}
                        options={[
                          { label: '미품절', value: '미품절' },
                          { label: '품절', value: '품절' },
                          { label: '입시품절', value: '입시품절' },
                          { label: '소진 시 품절', value: '소진 시 품절' },
                          { label: '공정 소진 품절', value: '공정 소진 품절' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>판매 상태</div>
                      <Select
                        mode="multiple"
                        placeholder="판매 상태 선택"
                        value={selectedSalesStatus}
                        onChange={setSelectedSalesStatus}
                        options={[
                          { label: '판매중', value: 'active' },
                          { label: '미판매', value: 'inactive' },
                          { label: '단종', value: 'discontinued' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>전체 품절 여부</div>
                      <Select
                        mode="multiple"
                        placeholder="전체 품절 여부 선택"
                        value={selectedFullySoldOut}
                        onChange={setSelectedFullySoldOut}
                        options={[
                          { label: '정상', value: 'false' },
                          { label: '품절', value: 'true' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                </Row>

                {/* Row 2 */}
                <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>상품위치 등록 여부</div>
                      <Select
                        mode="multiple"
                        placeholder="등록 여부 선택"
                        value={selectedLocationRegistered}
                        onChange={setSelectedLocationRegistered}
                        options={[
                          { label: '등록', value: 'true' },
                          { label: '미등록', value: 'false' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>상품 연도</div>
                      <Select
                        mode="multiple"
                        placeholder="상품 연도 선택"
                        value={selectedYear}
                        onChange={setSelectedYear}
                        options={[
                          { label: '2023', value: '2023' },
                          { label: '2024', value: '2024' },
                          { label: '2025', value: '2025' },
                          { label: '2026', value: '2026' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>상품 시즌</div>
                      <Select
                        mode="multiple"
                        placeholder="상품 시즌 선택"
                        value={selectedSeason}
                        onChange={setSelectedSeason}
                        options={[
                          { label: '봄', value: '봄' },
                          { label: '여름', value: '여름' },
                          { label: '가을', value: '가을' },
                          { label: '겨울', value: '겨울' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                </Row>

                {/* Row 3 */}
                <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>전부품절</div>
                      <Select
                        mode="multiple"
                        placeholder="선택"
                        value={selectedShippingHistory}
                        onChange={setSelectedShippingHistory}
                        options={[
                          { label: '있음', value: 'true' },
                          { label: '없음', value: 'false' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>미진열 출고여부</div>
                      <Select
                        mode="multiple"
                        placeholder="선택"
                        value={selectedNonExhibition}
                        onChange={setSelectedNonExhibition}
                        options={[
                          { label: '있음', value: 'true' },
                          { label: '없음', value: 'false' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>미입고수량 포함여부</div>
                      <Select
                        mode="multiple"
                        placeholder="선택"
                        value={selectedUnreceivedQty}
                        onChange={setSelectedUnreceivedQty}
                        options={[
                          { label: '포함', value: 'true' },
                          { label: '미포함', value: 'false' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                </Row>

                {/* Row 4 */}
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>재고 연동</div>
                      <Select
                        mode="multiple"
                        placeholder="선택"
                        value={selectedInventorySync}
                        onChange={setSelectedInventorySync}
                        options={[
                          { label: '사용', value: 'true' },
                          { label: '미사용', value: 'false' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>옵션 합포</div>
                      <Select
                        mode="multiple"
                        placeholder="선택"
                        value={selectedMergePrevention}
                        onChange={setSelectedMergePrevention}
                        options={[
                          { label: '방지', value: 'true' },
                          { label: '미방지', value: 'false' },
                        ]}
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                      />
                    </div>
                  </Col>
                  <Col span={8}></Col>
                </Row>
              </div>

              {/* ===== 섹션 3: 범위 필터 ===== */}
              <div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '700', color: '#333', letterSpacing: '0.5px' }}>범위 필터</h4>

                {/* Range Filters Row: 3열 그리드 */}
                <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
                  {/* 재고 수량 */}
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>재고 수량</div>
                      <Space direction="vertical" style={{ width: '100%' }} size={6}>
                        <Slider
                          range
                          min={0}
                          max={10000}
                          step={100}
                          value={stockQuantityRange}
                          onChange={(value) => setStockQuantityRange(value as [number, number])}
                          marks={{ 0: '0', 5000: '5K', 10000: '10K' }}
                          style={{ marginBottom: '8px' }}
                        />
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <Input
                              size="small"
                              type="number"
                              placeholder="최소"
                              value={stockQuantityRange[0]}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(parseInt(e.target.value) || 0, stockQuantityRange[1]))
                                setStockQuantityRange([val, stockQuantityRange[1]])
                              }}
                              style={{ fontSize: '11px' }}
                            />
                          </Col>
                          <Col span={12}>
                            <Input
                              size="small"
                              type="number"
                              placeholder="최대"
                              value={stockQuantityRange[1]}
                              onChange={(e) => {
                                const val = Math.min(10000, Math.max(parseInt(e.target.value) || 10000, stockQuantityRange[0]))
                                setStockQuantityRange([stockQuantityRange[0], val])
                              }}
                              style={{ fontSize: '11px' }}
                            />
                          </Col>
                        </Row>
                      </Space>
                    </div>
                  </Col>

                  {/* 옵션 판매 금액 */}
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>옵션판매금액</div>
                      <Space direction="vertical" style={{ width: '100%' }} size={6}>
                        <Slider
                          range
                          min={0}
                          max={5000000}
                          step={100000}
                          value={optionSalesAmountRange}
                          onChange={(value) => setOptionSalesAmountRange(value as [number, number])}
                          marks={{ 0: '0', 2500000: '250만', 5000000: '500만' }}
                          style={{ marginBottom: '8px' }}
                        />
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <Input
                              size="small"
                              type="number"
                              placeholder="최소"
                              value={optionSalesAmountRange[0]}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(parseInt(e.target.value) || 0, optionSalesAmountRange[1]))
                                setOptionSalesAmountRange([val, optionSalesAmountRange[1]])
                              }}
                              style={{ fontSize: '11px' }}
                            />
                          </Col>
                          <Col span={12}>
                            <Input
                              size="small"
                              type="number"
                              placeholder="최대"
                              value={optionSalesAmountRange[1]}
                              onChange={(e) => {
                                const val = Math.min(5000000, Math.max(parseInt(e.target.value) || 5000000, optionSalesAmountRange[0]))
                                setOptionSalesAmountRange([optionSalesAmountRange[0], val])
                              }}
                              style={{ fontSize: '11px' }}
                            />
                          </Col>
                        </Row>
                      </Space>
                    </div>
                  </Col>

                  {/* 재고 금액 */}
                  <Col span={8}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>재고 금액</div>
                      <Space direction="vertical" style={{ width: '100%' }} size={6}>
                        <Slider
                          range
                          min={0}
                          max={10000000}
                          step={500000}
                          value={stockInventoryAmountRange}
                          onChange={(value) => setStockInventoryAmountRange(value as [number, number])}
                          marks={{ 0: '0', 5000000: '500만', 10000000: '1000만' }}
                          style={{ marginBottom: '8px' }}
                        />
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <Input
                              size="small"
                              type="number"
                              placeholder="최소"
                              value={stockInventoryAmountRange[0]}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(parseInt(e.target.value) || 0, stockInventoryAmountRange[1]))
                                setStockInventoryAmountRange([val, stockInventoryAmountRange[1]])
                              }}
                              style={{ fontSize: '11px' }}
                            />
                          </Col>
                          <Col span={12}>
                            <Input
                              size="small"
                              type="number"
                              placeholder="최대"
                              value={stockInventoryAmountRange[1]}
                              onChange={(e) => {
                                const val = Math.min(10000000, Math.max(parseInt(e.target.value) || 10000000, stockInventoryAmountRange[0]))
                                setStockInventoryAmountRange([stockInventoryAmountRange[0], val])
                              }}
                              style={{ fontSize: '11px' }}
                            />
                          </Col>
                        </Row>
                      </Space>
                    </div>
                  </Col>
                </Row>

                {/* 초기화 버튼 */}
                <Row justify="end" gutter={[8, 0]}>
                  <Col>
                    <Button onClick={handleFilterReset} style={{ borderRadius: '4px' }}>필터 초기화</Button>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      onClick={() => setShowDetailFilters(false)}
                      style={{ borderRadius: '4px', backgroundColor: '#1890ff' }}
                    >
                      필터 적용
                    </Button>
                  </Col>
                </Row>
              </div>
            </Space>
          </div>
        )}

        {/* 날짜 필터 드로어 */}
        <Drawer
          title="날짜 필터"
          placement="right"
          onClose={() => setFilterDrawerOpen(false)}
          open={filterDrawerOpen}
          width={500}
        >
          <AllDateFiltersPanel
            filters={dateFilterConfigs}
            onApply={() => {
              setFilterDrawerOpen(false)
            }}
            onReset={handleFilterReset}
          />
        </Drawer>

        {/* 카드 리스트 뷰 */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          {viewMode === 'product' ? (
            // 상품별 보기: 상품 + 클릭 시 옵션 펼침
            <List
              dataSource={filteredStockData}
              pagination={{ pageSize: 10 }}
              renderItem={(product) => {
                const isExpanded = expandedProducts.has(product.id)
                return (
                  <div key={product.id} style={{ marginBottom: '16px', backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
                    {/* 상품 헤더 */}
                    <div
                      onClick={() => toggleProductExpanded(product.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        backgroundColor: isExpanded ? '#f5f7fa' : '#fafbfc',
                        borderBottom: isExpanded ? '1px solid #e8e8e8' : 'none',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Row gutter={12} style={{ alignItems: 'center', width: '100%' }}>
                        {/* 펼침/접기 화살표 */}
                        <Col xs={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontSize: '14px', color: '#1F2B60', fontWeight: 'bold', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            ▶
                          </div>
                        </Col>
                        
                        {/* 썸네일 이미지 */}
                        <Col xs={5} sm={2} style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={product.thumbnail}
                            alt={product.productName}
                            style={{
                              width: '100%',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              backgroundColor: '#f0f0f0'
                            }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/60x60?text=No+Image'
                            }}
                          />
                        </Col>
                        
                        {/* 상품 정보 - 좌측 */}
                        <Col xs={18} sm={7} style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                          <div style={{ width: '100%', overflow: 'hidden' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1F2B60', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {product.productName}
                            </div>
                            <div style={{ fontSize: '9px', color: '#666', marginBottom: '1px' }}>
                              {product.productCode}
                            </div>
                            <div style={{ fontSize: '9px', color: '#999', marginBottom: '2px' }}>
                              {product.brand} · {product.category}
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: '600', color: '#e74c3c' }}>
                              ₩{product.price?.toLocaleString() || 0}
                            </div>
                          </div>
                        </Col>

                        {/* 상태 태그 */}
                        <Col xs={6} sm={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Tag color={product.options.every(opt => opt.status === 'in_stock') ? 'green' : product.options.some(opt => opt.status === 'out_of_stock') ? 'red' : 'orange'} style={{ fontSize: '9px', marginRight: 0 }}>
                            {product.options.every(opt => opt.status === 'in_stock') ? '정상' : product.options.some(opt => opt.status === 'out_of_stock') ? '품절' : '저재고'}
                          </Tag>
                        </Col>

                        {/* 옵션 개수 */}
                        <Col xs={6} sm={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontSize: '9px', color: '#999' }}>옵션:</div>
                          <div style={{ fontWeight: '600', color: '#1F2B60', fontSize: '11px', marginLeft: '2px' }}>{product.options.length}개</div>
                        </Col>

                        {/* 총 재고 */}
                        <Col xs={12} sm={3} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontSize: '9px', color: '#999' }}>재고:</div>
                          <div style={{ fontWeight: '600', color: '#1F2B60', fontSize: '11px', marginLeft: '2px' }}>{product.totalQuantity}개</div>
                        </Col>

                        {/* 액션 버튼 - 우측 끝 세로 정렬 */}
                        <Col xs={24} sm={7} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Space direction="vertical" size={2} style={{ width: 'auto' }}>
                            {/* 조정 버튼 - 조정 필요 여부 확인 */}
                            <Button
                              size="small"
                              type={product.options.some(opt => opt.adjustmentRequired) ? 'primary' : 'default'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAdjustment(product)
                              }}
                              style={{ fontSize: '10px', padding: '2px 8px', height: '24px', lineHeight: '22px', width: '70px' }}
                            >
                              조정
                            </Button>
                            
                            {/* 입고 버튼 - 입고 필요 여부 확인 */}
                            <Button
                              size="small"
                              type={product.options.some(opt => opt.inboundRequired) ? 'primary' : 'default'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInbound(product)
                              }}
                              style={{ fontSize: '10px', padding: '2px 8px', height: '24px', lineHeight: '22px', width: '70px' }}
                            >
                              입고
                            </Button>
                            
                            {/* 출고 버튼 - 출고 필요 여부 확인 */}
                            <Button
                              size="small"
                              type={product.options.some(opt => opt.outboundRequired) ? 'primary' : 'default'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOutbound(product)
                              }}
                              style={{ fontSize: '10px', padding: '2px 8px', height: '24px', lineHeight: '22px', width: '70px' }}
                            >
                              출고
                            </Button>
                            
                            {/* 재고연동 버튼 - 재고연동 필요 여부 확인 */}
                            <Button
                              size="small"
                              type={product.options.some(opt => opt.isInventorySyncEnabled) ? 'primary' : 'default'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInventorySync(product)
                              }}
                              style={{ fontSize: '10px', padding: '2px 8px', height: '24px', lineHeight: '22px', width: '70px' }}
                            >
                              재고연동
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </div>

                    {/* 펼쳐진 옵션 목록 */}
                    {isExpanded && (
                      <div style={{ backgroundColor: '#fafbfc', padding: '12px 16px' }}>
                        <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: '600', color: '#666' }}>
                          옵션 상세 정보 ({product.options.length}개)
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {product.options.map((option, idx) => (
                            <div key={option.id} style={{ backgroundColor: 'white', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
                              <Row gutter={12} style={{ alignItems: 'center' }}>
                                {/* 상태 + 옵션명 */}
                                <Col xs={24} sm={4}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Tag color={option.status === 'in_stock' ? 'green' : option.status === 'low_stock' ? 'orange' : 'red'} style={{ margin: 0, fontSize: '9px' }}>
                                      {option.statusText}
                                    </Tag>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#1F2B60' }}>
                                      {option.optionName}
                                    </div>
                                  </div>
                                </Col>
                                
                                {/* 수량 */}
                                <Col xs={12} sm={3}>
                                  <div style={{ fontSize: '9px', color: '#999', marginBottom: '2px' }}>수량</div>
                                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#1F2B60' }}>
                                    {option.quantity}개
                                  </div>
                                </Col>
                                
                                {/* 위치 */}
                                <Col xs={12} sm={3}>
                                  <div style={{ fontSize: '9px', color: '#999', marginBottom: '2px' }}>위치</div>
                                  <div style={{ fontSize: '9px' }}>
                                    {option.location}
                                  </div>
                                </Col>
                                
                                {/* 원가 */}
                                <Col xs={12} sm={3}>
                                  <div style={{ fontSize: '9px', color: '#999', marginBottom: '2px' }}>원가</div>
                                  <div style={{ fontSize: '10px' }}>
                                    ₩{option.cost.toLocaleString()}
                                  </div>
                                </Col>
                                
                                {/* 재고금액 */}
                                <Col xs={12} sm={3}>
                                  <div style={{ fontSize: '9px', color: '#999', marginBottom: '2px' }}>재고금액</div>
                                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#11998e' }}>
                                    ₩{(option.stockValue / 10000).toFixed(0)}만
                                  </div>
                                </Col>
                                
                                {/* 옵션 액션 버튼 */}
                                <Col xs={24} sm={8}>
                                  <Space size={2} style={{ width: '100%', justifyContent: 'flex-end' }}>
                                    <Button
                                      size="small"
                                      type={option.adjustmentRequired ? 'primary' : 'default'}
                                      ghost={!option.adjustmentRequired}
                                      onClick={() => handleOptionAction(product, option, '조정')}
                                      style={{ fontSize: '9px', padding: '2px 6px', height: '20px', lineHeight: '18px' }}
                                    >
                                      조정
                                    </Button>
                                    <Button
                                      size="small"
                                      type={option.inboundRequired ? 'primary' : 'default'}
                                      ghost={!option.inboundRequired}
                                      onClick={() => handleOptionAction(product, option, '입고')}
                                      style={{ fontSize: '9px', padding: '2px 6px', height: '20px', lineHeight: '18px' }}
                                    >
                                      입고
                                    </Button>
                                    <Button
                                      size="small"
                                      type={option.outboundRequired ? 'primary' : 'default'}
                                      ghost={!option.outboundRequired}
                                      onClick={() => handleOptionAction(product, option, '출고')}
                                      style={{ fontSize: '9px', padding: '2px 6px', height: '20px', lineHeight: '18px' }}
                                    >
                                      출고
                                    </Button>
                                  </Space>
                                </Col>
                              </Row>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }}
            />
          ) : (
            // 옵션별 보기: 상세 정보 포함
            <List
              dataSource={filteredStockData.flatMap((product) =>
                product.options.map((option) => ({ product, option }))
              )}
              pagination={{ pageSize: 10 }}
              renderItem={({ product, option }) => (
                <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100%' }}>
                    <Row gutter={16} style={{ alignItems: 'flex-start', marginBottom: '12px' }}>
                      {/* 썸네일 이미지 */}
                      <Col xs={24} sm={4}>
                        <img
                          src={product.thumbnail}
                          alt={product.productName}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            backgroundColor: '#f5f5f5'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/120x120?text=No+Image'
                          }}
                        />
                      </Col>
                      {/* 상품/옵션 정보 */}
                      <Col xs={24} sm={20}>
                        <Row gutter={[16, 8]} style={{ alignItems: 'flex-start' }}>
                          <Col xs={24} sm={12}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2B60', marginBottom: '4px' }}>
                                {product.productName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                                옵션: <strong>{option.optionName}</strong>
                              </div>
                              <div style={{ fontSize: '11px', color: '#666' }}>
                                {product.productCode} | {option.barcode}
                              </div>
                            </div>
                          </Col>
                          <Col xs={24} sm={4}>
                            <div style={{ textAlign: 'center' }}>
                              <Tag color={option.status === 'in_stock' ? 'green' : option.status === 'low_stock' ? 'orange' : 'red'}>
                                {option.statusText}
                              </Tag>
                              <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>
                                {option.quantity}개
                              </div>
                            </div>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Space size="small" wrap>
                              <Button
                                size="small"
                                type={option.adjustmentRequired ? 'primary' : 'default'}
                                ghost={!option.adjustmentRequired}
                                onClick={() => handleOptionAction(product, option, '조정')}
                                style={{ fontSize: '11px', padding: '2px 6px', height: '22px' }}
                              >
                                조정
                              </Button>
                              <Button
                                size="small"
                                type={option.inboundRequired ? 'primary' : 'default'}
                                ghost={!option.inboundRequired}
                                onClick={() => handleOptionAction(product, option, '입고')}
                                style={{ fontSize: '11px', padding: '2px 6px', height: '22px' }}
                              >
                                입고
                              </Button>
                              <Button
                                size="small"
                                type={option.outboundRequired ? 'primary' : 'default'}
                                ghost={!option.outboundRequired}
                                onClick={() => handleOptionAction(product, option, '출고')}
                                style={{ fontSize: '11px', padding: '2px 6px', height: '22px' }}
                              >
                                출고
                              </Button>
                              <Button
                                size="small"
                                type={option.isInventorySyncEnabled ? 'primary' : 'default'}
                                ghost={!option.isInventorySyncEnabled}
                                onClick={() => handleOptionAction(product, option, '재고연동')}
                                style={{ fontSize: '11px', padding: '2px 6px', height: '22px' }}
                              >
                                재고연동
                              </Button>
                            </Space>
                          </Col>
                        </Row>

                        {/* 상품 상세정보 */}
                        <Row gutter={16} style={{ marginTop: '12px' }}>
                          <Col xs={24} sm={6}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>대표판매가</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1F2B60' }}>{product.representativeSalesPrice.toLocaleString()}원</div>
                          </Col>
                          <Col xs={24} sm={6}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>판매단가</div>
                            <div style={{ fontSize: '12px' }}>{option.singleSalesPrice.toLocaleString()}원</div>
                          </Col>
                          <Col xs={24} sm={6}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>원가</div>
                            <div style={{ fontSize: '12px' }}>{option.cost.toLocaleString()}원</div>
                          </Col>
                          <Col xs={24} sm={6}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>재고금액</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#11998e' }}>{(option.stockValue / 10000).toFixed(0)}만원</div>
                          </Col>
                        </Row>

                        {/* 재고 상세정보 */}
                        <Row gutter={16} style={{ marginTop: '8px' }}>
                          <Col xs={24} sm={6}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>안정재고</div>
                            <div style={{ fontSize: '12px' }}>{option.safetyStock}개</div>
                          </Col>
                          <Col xs={24} sm={6}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>위치</div>
                            <div style={{ fontSize: '10px' }}>{option.location}</div>
                          </Col>
                          <Col xs={24} sm={6}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>등급</div>
                            <Tag color="blue" style={{ fontSize: '10px' }}>{option.grade}</Tag>
                          </Col>
                          <Col xs={24} sm={6}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>상품연도</div>
                            <div style={{ fontSize: '12px' }}>{product.productYear}</div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="조건에 맞는 옵션이 없습니다" /> }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
