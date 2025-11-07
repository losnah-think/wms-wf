'use client'

import { Card, Row, Col, Statistic, Breadcrumb } from 'antd'
import { useState, useMemo, useRef, useEffect } from 'react'
import * as echarts from 'echarts'

interface LocationStats {
  location: string
  zone: string
  occupancy: number
  productVariety: number
  totalQuantity: number
  avgPrice: number
}

// 위치별 통계 데이터 생성
const generateLocationStats = (): LocationStats[] => {
  const locations = [
    { location: 'A-01', zone: 'A' },
    { location: 'A-02', zone: 'A' },
    { location: 'B-01', zone: 'B' },
    { location: 'B-02', zone: 'B' },
    { location: 'C-01', zone: 'C' },
    { location: 'C-02', zone: 'C' },
    { location: 'D-01', zone: 'D' },
    { location: 'D-02', zone: 'D' },
    { location: 'E-01', zone: 'E' },
    { location: 'E-02', zone: 'E' },
  ]

  return locations.map(item => ({
    location: item.location,
    zone: item.zone,
    occupancy: Math.floor(Math.random() * 90) + 10,
    productVariety: Math.floor(Math.random() * 30) + 5,
    totalQuantity: Math.floor(Math.random() * 3000) + 500,
    avgPrice: Math.floor(Math.random() * 150000) + 30000
  }))
}

export default function LocationStatisticsPage() {
  const occupancyRef = useRef<HTMLDivElement>(null)
  const varietyRef = useRef<HTMLDivElement>(null)
  const distributionRef = useRef<HTMLDivElement>(null)
  const zoneRef = useRef<HTMLDivElement>(null)

  const locationStats = useMemo(() => generateLocationStats(), [])

  const totalQuantity = useMemo(() => locationStats.reduce((sum, item) => sum + item.totalQuantity, 0), [locationStats])
  const locationCount = useMemo(() => locationStats.length, [locationStats])
  const avgOccupancy = useMemo(() => Math.round(locationStats.reduce((sum, item) => sum + item.occupancy, 0) / locationStats.length), [locationStats])
  const avgVariety = useMemo(() => Math.round(locationStats.reduce((sum, item) => sum + item.productVariety, 0) / locationStats.length), [locationStats])

  const totalValue = useMemo(() => locationStats.reduce((sum, item) => sum + (item.totalQuantity * item.avgPrice), 0), [locationStats])

  // 1. 위치별 점유율
  useEffect(() => {
    if (occupancyRef.current) {
      const chart = echarts.init(occupancyRef.current)
      const option = {
        title: { text: '위치별 점유율', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
        xAxis: { type: 'category', data: locationStats.map(item => item.location) },
        yAxis: { type: 'value', max: 100 },
        series: [{
          data: locationStats.map(item => item.occupancy),
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
  }, [locationStats])

  // 2. 위치별 제품 종류
  useEffect(() => {
    if (varietyRef.current) {
      const chart = echarts.init(varietyRef.current)
      const option = {
        title: { text: '위치별 제품 종류', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: locationStats.map(item => item.location) },
        yAxis: { type: 'value' },
        series: [{
          name: '종류(개)',
          data: locationStats.map(item => item.productVariety),
          type: 'line',
          smooth: true,
          itemStyle: { color: '#4facfe' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(79, 172, 254, 0.3)' },
              { offset: 1, color: 'rgba(79, 172, 254, 0)' }
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
  }, [locationStats])

  // 3. 위치별 재고량 분포
  useEffect(() => {
    if (distributionRef.current) {
      const chart = echarts.init(distributionRef.current)
      const option = {
        title: { text: '위치별 재고량 분포', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'item', formatter: '{b}: {c}개 ({d}%)' },
        series: [{
          name: '재고량',
          type: 'pie',
          radius: ['40%', '70%'],
          data: locationStats.map(item => ({
            name: item.location,
            value: item.totalQuantity
          })),
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
  }, [locationStats])

  // 4. 구역별 재고액
  useEffect(() => {
    if (zoneRef.current) {
      const chart = echarts.init(zoneRef.current)
      const zoneData = locationStats.reduce((acc, item) => {
        const existing = acc.find(z => z.zone === item.zone)
        if (existing) {
          existing.value += item.totalQuantity * item.avgPrice
        } else {
          acc.push({ zone: item.zone, value: item.totalQuantity * item.avgPrice })
        }
        return acc
      }, [] as { zone: string; value: number }[])

      const option = {
        title: { text: '구역별 재고액', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}원' },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: zoneData.map(item => `${item.zone}구역`) },
        series: [{
          data: zoneData.map(item => item.value),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#f5576c' },
              { offset: 1, color: '#f093fb' }
            ])
          }
        }],
        grid: { left: 80, right: 20, bottom: 20, top: 60 }
      }
      chart.setOption(option)
      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [locationStats])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '통계 분석' },
              { title: '위치별 통계' },
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
            위치별 통계 분석
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            각 위치의 점유율, 제품 종류, 재고액 등 상세한 통계를 제공합니다
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
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>위치 개수</span>}
                value={locationCount}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균 점유율</span>}
                value={avgOccupancy}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균 제품 종류</span>}
                value={avgVariety}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 차트 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={occupancyRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={varietyRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={distributionRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={zoneRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
