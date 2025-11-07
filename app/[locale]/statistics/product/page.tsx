'use client'

import { Card, Row, Col, Statistic, Breadcrumb, Select, Space } from 'antd'
import { useState, useMemo, useRef, useEffect } from 'react'
import * as echarts from 'echarts'

interface ProductStats {
  category: string
  quantity: number
  salesCount: number
  price: number
}

// 상품 통계 데이터 생성
const generateProductStats = (): ProductStats[] => {
  const categories = ['전자기기', '문구용품', '액세서리', '컴퓨터 부품', 'IT용품']
  return categories.map(category => ({
    category,
    quantity: Math.floor(Math.random() * 50000) + 5000,
    salesCount: Math.floor(Math.random() * 10000) + 1000,
    price: Math.floor(Math.random() * 500000) + 50000
  }))
}

export default function ProductStatisticsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // EChart refs
  const categoryDistRef = useRef<HTMLDivElement>(null)
  const salesPerformanceRef = useRef<HTMLDivElement>(null)
  const statusDistributionRef = useRef<HTMLDivElement>(null)
  const categoryValueRef = useRef<HTMLDivElement>(null)

  const productStats = useMemo(() => generateProductStats(), [])

  const totalQuantity = useMemo(() => productStats.reduce((sum, item) => sum + item.quantity, 0), [productStats])
  const totalSales = useMemo(() => productStats.reduce((sum, item) => sum + item.salesCount, 0), [productStats])
  const totalValue = useMemo(() => productStats.reduce((sum, item) => sum + (item.quantity * item.price), 0), [productStats])
  const avgTurnover = useMemo(() => productStats.length > 0 ? Math.round((totalSales / totalQuantity) * 100) : 0, [productStats, totalQuantity, totalSales])

  // 1. 카테고리별 재고 분포 (%)
  useEffect(() => {
    if (categoryDistRef.current) {
      const chart = echarts.init(categoryDistRef.current)
      const totalQty = productStats.reduce((sum, item) => sum + item.quantity, 0)
      const data = productStats.map(item => ({
        name: item.category,
        value: Math.round((item.quantity / totalQty) * 100)
      }))

      const option = {
        title: { text: '카테고리별 재고 분포 (%)', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
        xAxis: { type: 'category', data: productStats.map(item => item.category) },
        yAxis: { type: 'value', max: 100 },
        series: [{
          data: data.map(item => item.value),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ])
          }
        }],
        grid: { left: 40, right: 20, bottom: 30, top: 60 }
      }
      chart.setOption(option)
      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [productStats])

  // 2. 카테고리별 판매 성과
  useEffect(() => {
    if (salesPerformanceRef.current) {
      const chart = echarts.init(salesPerformanceRef.current)
      const option = {
        title: { text: '카테고리별 판매 성과', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['판매량', '회전율(%)'], top: 30 },
        xAxis: { type: 'category', data: productStats.map(item => item.category) },
        yAxis: [
          { type: 'value', name: '판매량', axisLabel: { formatter: '{value}개' } },
          { type: 'value', name: '회전율(%)', position: 'right', max: 100 }
        ],
        series: [
          {
            name: '판매량',
            data: productStats.map(item => item.salesCount),
            type: 'bar',
            itemStyle: { color: '#4facfe' }
          },
          {
            name: '회전율(%)',
            data: productStats.map(item => Math.round((item.salesCount / item.quantity) * 100)),
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            itemStyle: { color: '#f5576c' }
          }
        ],
        grid: { left: 60, right: 60, bottom: 30, top: 80 }
      }
      chart.setOption(option)
      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [productStats])

  // 3. 상품 상태별 분포 (도넛)
  useEffect(() => {
    if (statusDistributionRef.current) {
      const chart = echarts.init(statusDistributionRef.current)
      const goodStock = productStats.filter(item => item.quantity > 100).length
      const lowStock = productStats.filter(item => item.quantity >= 20 && item.quantity <= 100).length
      const outOfStock = productStats.filter(item => item.quantity < 20).length

      const data = [
        { name: '재고충분\n(100개 이상)', value: goodStock },
        { name: '저재고\n(20-100개)', value: lowStock },
        { name: '품절\n(20개 미만)', value: outOfStock }
      ]

      const option = {
        title: { text: '상품 상태별 분포', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'item', formatter: '{b}: {c}개 ({d}%)' },
        series: [{
          name: '상태',
          type: 'pie',
          radius: ['40%', '70%'],
          data,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#11998e' },
              { offset: 0.5, color: '#fa709a' },
              { offset: 1, color: '#f5576c' }
            ])
          },
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }],
        grid: { left: 0, right: 0, bottom: 0, top: 40 }
      }
      chart.setOption(option)
      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [productStats])

  // 4. 카테고리별 재고액
  useEffect(() => {
    if (categoryValueRef.current) {
      const chart = echarts.init(categoryValueRef.current)
      const data = productStats
        .map(item => ({
          name: item.category,
          value: item.quantity * item.price
        }))
        .sort((a, b) => b.value - a.value)

      const option = {
        title: { text: '카테고리별 재고액 (상위 5)', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}원' },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: data.slice(0, 5).map(item => item.name) },
        series: [{
          data: data.slice(0, 5).map(item => item.value),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#f5576c' },
              { offset: 1, color: '#f093fb' }
            ])
          }
        }],
        grid: { left: 100, right: 20, bottom: 20, top: 60 }
      }
      chart.setOption(option)
      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [productStats])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '통계 분석' },
              { title: '상품별 통계' },
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
            상품별 통계 분석
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            카테고리별 재고 분포, 판매 성과, 상품 상태 등 상세한 통계를 제공합니다
          </p>
        </div>

        {/* KPI 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고량</span>}
                value={totalQuantity}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 판매량</span>}
                value={totalSales}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균 회전율</span>}
                value={avgTurnover}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>총 재고액</span>}
                value={Math.round(totalValue / 100000000)}
                suffix="억원"
                precision={1}
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 차트 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={categoryDistRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={salesPerformanceRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={statusDistributionRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={categoryValueRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
