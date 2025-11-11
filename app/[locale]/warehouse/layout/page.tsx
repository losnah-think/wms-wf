'use client'

import React, { useState } from 'react'
import { Card, Row, Col, Button, Space, Tag, Tabs } from 'antd'
import { LayoutOutlined, PlusOutlined } from '@ant-design/icons'

export default function WarehouseLayoutPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', padding: '20px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#1F2B60' }}>
            <LayoutOutlined /> 창고 레이아웃
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            창고의 레이아웃과 구역을 시각적으로 관리합니다.
          </p>
        </div>

        {/* 메인 카드 */}
        <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', textAlign: 'center', padding: '60px 20px' }}>
          <LayoutOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '20px' }} />
          <h2 style={{ color: '#666', marginBottom: '10px' }}>창고 레이아웃 관리</h2>
          <p style={{ color: '#999', marginBottom: '30px' }}>
            창고의 구역과 레이아웃을 설계하고 관리할 수 있습니다.
          </p>
          <Space>
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              레이아웃 생성
            </Button>
            <Button size="large">
              기존 레이아웃 불러오기
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  )
}
