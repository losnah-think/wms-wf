'use client'

import { Card, Row, Col, Statistic, Breadcrumb } from 'antd'
import { useState, useMemo, useRef, useEffect } from 'react'
import * as echarts from 'echarts'

interface OptionStats {
  optionName: string
  quantity: number
  salesCount: number
  popularity: string
  price: number
}

// 옵션 통계 데이터 생성
const generateOptionStats = (): OptionStats[] => {
  const options = ['검정색', '흰색', '은색', '빨강', '파랑', '32GB', '64GB', '128GB', '1M', '2M', '3M']
  const popularity = ['높음', '중간', '낮음']
  return options.map(option => ({
    optionName: option,
    quantity: Math.floor(Math.random() * 30000) + 2000,
    salesCount: Math.floor(Math.random() * 5000) + 500,
    popularity: popularity[Math.floor(Math.random() * popularity.length)],
    price: Math.floor(Math.random() * 300000) + 10000
  }))
}

export default function OptionStatisticsPage() {
  const optionRef = useRef<HTMLDivElement>(null)
  const popularityRef = useRef<HTMLDivElement>(null)
  const salesRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  const optionStats = useMemo(() => generateOptionStats(), [])

  const totalQuantity = useMemo(() => optionStats.reduce((sum, item) => sum + item.quantity, 0), [optionStats])
  const totalSales = useMemo(() => optionStats.reduce((sum, item) => sum + item.salesCount, 0), [optionStats])
  const totalValue = useMemo(() => optionStats.reduce((sum, item) => sum + (item.quantity * item.price), 0), [optionStats])
  const avgTurnover = useMemo(() => Math.round((totalSales / totalQuantity) * 100), [optionStats, totalQuantity, totalSales])
  const topOption = useMemo(() => optionStats.reduce((max, item) => item.quantity > max.quantity ? item : max), [optionStats])

  // 1. 옵션별 재고량 (상위 10)
  useEffect(() => {
    if (optionRef.current) {
      const chart = echarts.init(optionRef.current)
      const topOptions = optionStats.sort((a, b) => b.quantity - a.quantity).slice(0, 10)

      const option = {
        title: { text: '인기 옵션 TOP 10 (재고량)', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}개' },
        xAxis: { type: 'category', data: topOptions.map(item => item.optionName) },
        yAxis: { type: 'value' },
        series: [{
          data: topOptions.map(item => item.quantity),
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
  }, [optionStats])

  // 2. 인기도별 분포
  useEffect(() => {
    if (popularityRef.current) {
      const chart = echarts.init(popularityRef.current)
      const popularityCount: { [key: string]: number } = {}
      optionStats.forEach(item => {
        popularityCount[item.popularity] = (popularityCount[item.popularity] || 0) + 1
      })

      const data = Object.entries(popularityCount).map(([name, count]) => ({
        name,
        value: count
      }))

      const option = {
        title: { text: '인기도별 옵션 분포', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'item', formatter: '{b}: {c}개 ({d}%)' },
        series: [{
          name: '옵션 수',
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
  }, [optionStats])

  // 3. 판매량 vs 회전율
  useEffect(() => {
    if (salesRef.current) {
      const chart = echarts.init(salesRef.current)
      const topOptions = optionStats.sort((a, b) => b.salesCount - a.salesCount).slice(0, 8)

      const option = {
        title: { text: '옵션별 판매 성과 (상위 8)', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis' },
        legend: { data: ['판매량', '회전율(%)'], top: 30 },
        xAxis: { type: 'category', data: topOptions.map(item => item.optionName) },
        yAxis: [
          { type: 'value', name: '판매량' },
          { type: 'value', name: '회전율(%)', position: 'right', max: 100 }
        ],
        series: [
          {
            name: '판매량',
            data: topOptions.map(item => item.salesCount),
            type: 'bar',
            itemStyle: { color: '#4facfe' }
          },
          {
            name: '회전율(%)',
            data: topOptions.map(item => Math.round((item.salesCount / item.quantity) * 100)),
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
  }, [optionStats])

  // 4. 상태별 분포
  useEffect(() => {
    if (statusRef.current) {
      const chart = echarts.init(statusRef.current)
      const goodStock = optionStats.filter(item => item.quantity > 100).length
      const lowStock = optionStats.filter(item => item.quantity >= 20 && item.quantity <= 100).length
      const outOfStock = optionStats.filter(item => item.quantity < 20).length

      const data = [
        { name: '재고충분', value: goodStock },
        { name: '저재고', value: lowStock },
        { name: '품절', value: outOfStock }
      ]

      const option = {
        title: { text: '옵션 상태별 분포', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: data.map(item => item.name) },
        series: [{
          data: data.map(item => ({
            value: item.value,
            itemStyle: {
              color: item.name === '재고충분' ? '#11998e' : item.name === '저재고' ? '#fa709a' : '#f5576c'
            }
          })),
          type: 'bar'
        }],
        grid: { left: 80, right: 20, bottom: 20, top: 60 }
      }
      chart.setOption(option)
      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [optionStats])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '통계 분석' },
              { title: '옵션별 통계' },
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
            옵션별 통계 분석
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            각 옵션의 재고 분포, 판매 성과, 인기도 등을 분석합니다
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
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>인기 옵션</span>}
                value={topOption.optionName}
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 차트 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={optionRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={popularityRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={salesRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={statusRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
