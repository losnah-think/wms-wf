'use client'

import { Layout, Menu, Badge, Avatar } from 'antd'
import { BellOutlined, LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout

export default function LayoutWrapperAntd({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const pathname = usePathname()
  const currentPath = pathname.replace(`/${locale}`, '')

  const warehouseMenuItems: MenuProps['items'] = [
    {
      key: '/warehouse-info',
      label: (
        <Link href={`/${locale}/warehouse-info`} style={{ textDecoration: 'none', color: 'inherit' }}>
          🏢 창고 정보 관리
        </Link>
      ),
    },
    {
      key: '/warehouse-layout',
      label: (
        <Link href={`/${locale}/warehouse-layout`} style={{ textDecoration: 'none', color: 'inherit' }}>
          🗂️ 구역 설정 (Zone)
        </Link>
      ),
    },
    {
      key: '/warehouse-location',
      label: (
        <Link href={`/${locale}/warehouse-location`} style={{ textDecoration: 'none', color: 'inherit' }}>
          📍 위치(로케이션) 등록
        </Link>
      ),
    },
    {
      key: '/warehouse-barcode',
      label: (
        <Link href={`/${locale}/warehouse-barcode`} style={{ textDecoration: 'none', color: 'inherit' }}>
          🔖 바코드 생성 및 관리
        </Link>
      ),
    },
  ]

  const inventoryMenuItems: MenuProps['items'] = [
    {
      key: '/stock-status',
      label: (
        <Link href={`/${locale}/stock-status`} style={{ textDecoration: 'none', color: 'inherit' }}>
          📊 재고 현황
        </Link>
      ),
    },
    {
      key: '/stock-move',
      label: (
        <Link href={`/${locale}/stock-move`} style={{ textDecoration: 'none', color: 'inherit' }}>
          🔄 재고 이동
        </Link>
      ),
    },
    {
      key: '/stock-audit',
      label: (
        <Link href={`/${locale}/stock-audit`} style={{ textDecoration: 'none', color: 'inherit' }}>
          ✅ 재고 조정/실사
        </Link>
      ),
    },
  ]

  // 1Depth 메뉴 - 아코디언 없이 평면 구조
  const menuItems: MenuProps['items'] = [
    // 창고관리 섹션
    {
      key: 'warehouse-1',
      label: <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2B60' }}>🏭 창고관리</span>,
      type: 'group',
    },
    {
      key: '/warehouse-info',
      label: (
        <Link href={`/${locale}/warehouse-info`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ paddingLeft: 16 }}>🏢 창고 정보 관리</span>
        </Link>
      ),
    },
    {
      key: '/warehouse-layout',
      label: (
        <Link href={`/${locale}/warehouse-layout`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ paddingLeft: 16 }}>🗂️ 구역 설정 (Zone)</span>
        </Link>
      ),
    },
    {
      key: '/warehouse-location',
      label: (
        <Link href={`/${locale}/warehouse-location`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ paddingLeft: 16 }}>📍 위치(로케이션) 등록</span>
        </Link>
      ),
    },
    {
      key: '/warehouse-barcode',
      label: (
        <Link href={`/${locale}/warehouse-barcode`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ paddingLeft: 16 }}>🔖 바코드 생성 및 관리</span>
        </Link>
      ),
    },

    // 구분선
    {
      key: 'divider-1',
      label: <div style={{ height: 1, backgroundColor: '#E5E7EB', margin: '8px 0' }} />,
      disabled: true,
    },

    // 재고관리 섹션
    {
      key: 'inventory-1',
      label: <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2B60' }}>📦 재고관리</span>,
      type: 'group',
    },
    {
      key: '/stock-status',
      label: (
        <Link href={`/${locale}/stock-status`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ paddingLeft: 16 }}>📊 재고 현황</span>
        </Link>
      ),
    },
    {
      key: '/stock-move',
      label: (
        <Link href={`/${locale}/stock-move`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ paddingLeft: 16 }}>🔄 재고 이동</span>
        </Link>
      ),
    },
    {
      key: '/stock-audit',
      label: (
        <Link href={`/${locale}/stock-audit`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ paddingLeft: 16 }}>✅ 재고 조정/실사</span>
        </Link>
      ),
    },

    // 구분선
    {
      key: 'divider-2',
      label: <div style={{ height: 1, backgroundColor: '#E5E7EB', margin: '8px 0' }} />,
      disabled: true,
    },

    // 테스트
    {
      key: '/error-showcase',
      label: (
        <Link href={`/${locale}/error-showcase`} style={{ textDecoration: 'none', color: 'inherit' }}>
          🧪 에러 쇼케이스
        </Link>
      ),
    },
  ]

  // Get the selected menu key
  const getSelectedKey = () => {
    if (currentPath.startsWith('/warehouse')) {
      return currentPath
    }
    return currentPath
  }

  const selectedKey = getSelectedKey()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 헤더 */}
      <Header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
          {/* 좌측 - WMS 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#E0F2FE',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: '#007BED',
              }}
            >
              WMS
            </div>
          </div>

          {/* 우측 - 사용자 정보 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* 알림 */}
            <Badge count={3} style={{ backgroundColor: '#E02D3C' }}>
              <BellOutlined style={{ fontSize: 18, color: '#6B7178', cursor: 'pointer' }} />
            </Badge>

            {/* 구분선 */}
            <div style={{ width: 1, height: 24, backgroundColor: '#E5E7EB' }} />

            {/* 사용자 정보 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar 
                size={40} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#007BED', flexShrink: 0 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2B60', lineHeight: 1.2 }}>
                  관리자
                </div>
                <div style={{ fontSize: 12, color: '#6B7178', lineHeight: 1.2 }}>
                  admin@example.com
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div style={{ width: 1, height: 24, backgroundColor: '#E5E7EB' }} />

            {/* 설정 아이콘 */}
            <SettingOutlined style={{ fontSize: 18, color: '#6B7178', cursor: 'pointer' }} />

            {/* 로그아웃 아이콘 */}
            <LogoutOutlined style={{ fontSize: 18, color: '#6B7178', cursor: 'pointer' }} />
          </div>
        </Header>

        <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
          {/* 사이드바 */}
          <Sider
            width={280}
            style={{
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E7EB',
              position: 'fixed',
              left: 0,
              top: 64,
              bottom: 0,
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
              zIndex: 50,
            }}
          >
            <Menu
              mode="inline"
              items={menuItems}
              selectedKeys={[selectedKey]}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: 16,
                fontFamily: 'Pretendard, sans-serif',
              }}
              theme="light"
            />
          </Sider>

          {/* 메인 콘텐츠 */}
          <Content
            style={{
              marginLeft: 280,
              padding: 40,
              backgroundColor: '#F8F9FA',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    )
}
