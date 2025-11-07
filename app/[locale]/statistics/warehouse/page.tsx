'use client'

import { Card, Row, Col, Statistic, Breadcrumb } from 'antd'
import { useState, useMemo, useRef, useEffect } from 'react'
import * as echarts from 'echarts'

interface WarehouseStats {
  warehouse: string
  totalQuantity: number
  capacity: number
  utilization: number
  productCount: number
  avgPrice: number
}

// 창고 통계 데이터 생성
const generateWarehouseStats = (): WarehouseStats[] => {
  const warehouses = ['서울 센터', '부산 센터', '인천 센터', '대구 센터', '광주 센터']
  const capacities = [10000, 8000, 6000, 5000, 4000]

  return warehouses.map((warehouse, idx) => ({
    warehouse,
    totalQuantity: Math.floor(Math.random() * 5000) + 1000,
    capacity: capacities[idx],
    utilization: Math.floor(Math.random() * 80) + 20,
    productCount: Math.floor(Math.random() * 200) + 50,
    avgPrice: Math.floor(Math.random() * 200000) + 50000
  }))
}

export default function WarehouseStatisticsPage() {
  const capacityRef = useRef<HTMLDivElement>(null)
  const utilizationRef = useRef<HTMLDivElement>(null)
  const distributionRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLDivElement>(null)

  const warehouseStats = useMemo(() => generateWarehouseStats(), [])

  const totalQuantity = useMemo(() => warehouseStats.reduce((sum, item) => sum + item.totalQuantity, 0), [warehouseStats])
  const totalCapacity = useMemo(() => warehouseStats.reduce((sum, item) => sum + item.capacity, 0), [warehouseStats])
  const avgUtilization = useMemo(() => Math.round(warehouseStats.reduce((sum, item) => sum + item.utilization, 0) / warehouseStats.length), [warehouseStats])
  const totalValue = useMemo(() => warehouseStats.reduce((sum, item) => sum + (item.totalQuantity * item.avgPrice), 0), [warehouseStats])

  // 1. 창고별 용량
  useEffect(() => {
    if (capacityRef.current) {
      const chart = echarts.init(capacityRef.current)
      const option = {
        title: { text: '창고별 용량', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}개' },
        xAxis: { type: 'category', data: warehouseStats.map(item => item.warehouse) },
        yAxis: { type: 'value' },
        series: [{
          data: warehouseStats.map(item => item.capacity),
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
  }, [warehouseStats])

  // 2. 창고별 점유율
  useEffect(() => {
    if (utilizationRef.current) {
      const chart = echarts.init(utilizationRef.current)
      const option = {
        title: { text: '창고별 점유율', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: warehouseStats.map(item => item.warehouse) },
        yAxis: { type: 'value', max: 100 },
        series: [{
          name: '점유율(%)',
          data: warehouseStats.map(item => item.utilization),
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
  }, [warehouseStats])

  // 3. 창고별 재고 분포
  useEffect(() => {
    if (distributionRef.current) {
      const chart = echarts.init(distributionRef.current)
      const option = {
        title: { text: '창고별 재고량 분포', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'item', formatter: '{b}: {c}개 ({d}%)' },
        series: [{
          name: '재고량',
          type: 'pie',
          radius: ['40%', '70%'],
          data: warehouseStats.map(item => ({
            name: item.warehouse,
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
  }, [warehouseStats])

  // 4. 창고별 재고액
  useEffect(() => {
    if (valueRef.current) {
      const chart = echarts.init(valueRef.current)
      const data = warehouseStats.map(item => ({
        name: item.warehouse,
        value: item.totalQuantity * item.avgPrice
      }))

      const option = {
        title: { text: '창고별 재고액', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}원' },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: data.map(item => item.name) },
        series: [{
          data: data.map(item => item.value),
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
  }, [warehouseStats])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '통계 분석' },
              { title: '창고별 통계' },
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
            창고별 통계 분석
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            각 창고의 용량, 점유율, 재고액 등 상세한 통계를 제공합니다
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
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>전체 용량</span>}
                value={totalCapacity}
                suffix="개"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white', borderRadius: '10px' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>평균 점유율</span>}
                value={avgUtilization}
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
              <div ref={capacityRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '10px' }}>
              <div ref={utilizationRef} style={{ width: '100%', height: '300px' }} />
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
              <div ref={valueRef} style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
