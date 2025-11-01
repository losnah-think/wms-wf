'use client'

import { useState } from 'react'
import { Card, Form, Input, Button, Row, Col, Breadcrumb, Space, Select, Switch, message, Divider } from 'antd'
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons'

export default function StockSettingsPage() {
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)

  const initialSettings = {
    minStockLevel: '10',
    maxStockLevel: '1000',
    reorderPoint: '50',
    reorderQuantity: '200',
    leadTime: '7',
    stockMethod: 'fifo',
    lowStockAlerts: true,
    overstockAlerts: true,
    expiryAlerts: true,
    autoReorder: false,
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      setIsLoading(true)
      setTimeout(() => {
        message.success('설정이 저장되었습니다.')
        setIsLoading(false)
      }, 500)
    })
  }

  const handleReset = () => {
    form.resetFields()
    message.info('설정이 초기화되었습니다.')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: '30px' }}>
          <Breadcrumb
            items={[
              { title: '재고관리' },
              { title: '환경설정' },
            ]}
            style={{ marginBottom: '16px' }}
          />
          <h1 style={{
            color: '#1F2B60',
            fontSize: 40,
            fontFamily: 'Pretendard',
            fontWeight: 700,
            lineHeight: '52px',
            margin: 0,
            marginBottom: '8px',
          }}>
            재고 환경설정
          </h1>
          <p style={{ color: '#6B7178', fontSize: '14px', margin: 0 }}>
            재고 관리 설정을 조정합니다
          </p>
        </div>

        {/* 설정 폼 */}
        <Card style={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={initialSettings}
            style={{ marginTop: 24 }}
          >
            {/* 기본 재고 설정 */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#1F2B60', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                기본 재고 설정
              </h2>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="최소 재고량"
                    name="minStockLevel"
                    rules={[{ required: true, message: '최소 재고량을 입력하세요' }]}
                  >
                    <Input type="number" placeholder="10" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="최대 재고량"
                    name="maxStockLevel"
                    rules={[{ required: true, message: '최대 재고량을 입력하세요' }]}
                  >
                    <Input type="number" placeholder="1000" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="재주문 포인트"
                    name="reorderPoint"
                    rules={[{ required: true, message: '재주문 포인트를 입력하세요' }]}
                  >
                    <Input type="number" placeholder="50" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="재주문 수량"
                    name="reorderQuantity"
                    rules={[{ required: true, message: '재주문 수량을 입력하세요' }]}
                  >
                    <Input type="number" placeholder="200" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="납기 리드타임 (일)"
                    name="leadTime"
                    rules={[{ required: true, message: '리드타임을 입력하세요' }]}
                  >
                    <Input type="number" placeholder="7" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* 재고 방식 설정 */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#1F2B60', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                재고 방식
              </h2>

              <Form.Item
                label="재고 평가 방식"
                name="stockMethod"
                rules={[{ required: true, message: '재고 방식을 선택하세요' }]}
              >
                <Select
                  options={[
                    { value: 'fifo', label: 'FIFO (First In First Out) - 선입선출' },
                    { value: 'lifo', label: 'LIFO (Last In First Out) - 후입선출' },
                    { value: 'fefo', label: 'FEFO (First Expire First Out) - 기한 경과 우선' },
                  ]}
                />
              </Form.Item>
            </div>

            <Divider />

            {/* 알림 설정 */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#1F2B60', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                알림 설정
              </h2>

              <Form.Item
                label="저재고 알림"
                name="lowStockAlerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="과다재고 알림"
                name="overstockAlerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="만료 임박 알림"
                name="expiryAlerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>

            <Divider />

            {/* 자동화 설정 */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#1F2B60', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                자동화 설정
              </h2>

              <Form.Item
                label="자동 재주문"
                name="autoReorder"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>

            {/* 버튼 */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={isLoading}
                  style={{ backgroundColor: '#007BED' }}
                >
                  저장
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                >
                  초기화
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}
