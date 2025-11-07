'use client'

import { Layout, Menu, Badge, Avatar } from 'antd'
import { BellOutlined, LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { MenuProps } from 'antd'
import { menuSections, getSectionTranslationKey, getItemTranslationKey } from '@/lib/navigation'

const { Header, Sider, Content } = Layout

export default function LayoutWrapperAntd({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const pathname = usePathname()
  const currentPath = pathname.replace(`/${locale}`, '')
  const t = useTranslations()

  function getLabel(labelKey: string): string {
    return t(`nav.item.${labelKey}`)
  }

  function getSectionLabel(sectionKey: string): string {
    return t(`nav.section.${sectionKey}`)
  }

  // 3Depth 메뉴 구조 생성
  const menuItems: MenuProps['items'] = menuSections.flatMap((section, sectionIdx) => {
    const items: MenuProps['items'] = []

    // 섹션 타이틀 추가
    items.push({
      key: `section-${sectionIdx}`,
      label: (
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2B60' }}>
          {getSectionLabel(section.titleKey)}
        </span>
      ),
      type: 'group',
    })

    // 섹션 아이템들 추가
    section.items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        // 자식 메뉴가 있는 경우 (3Depth)
        items.push({
          key: item.href,
          label: <span style={{ paddingLeft: 16 }}>{getLabel(item.labelKey)}</span>,
          children: item.children.map((child) => ({
            key: child.href,
            label: (
              <Link href={`/${locale}${child.href}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {getLabel(child.labelKey)}
              </Link>
            ),
          })),
        })
      } else {
        // 자식 메뉴가 없는 경우 (2Depth)
        items.push({
          key: item.href,
          label: (
            <Link href={`/${locale}${item.href}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <span style={{ paddingLeft: 16 }}>{getLabel(item.labelKey)}</span>
            </Link>
          ),
        })
      }
    })

    // 구분선 추가 (마지막 섹션 제외)
    if (sectionIdx < menuSections.length - 1) {
      items.push({
        key: `divider-${sectionIdx}`,
        label: <div style={{ height: 1, backgroundColor: '#E5E7EB', margin: '8px 0' }} />,
        disabled: true,
      })
    }

    return items
  })

  // Get the selected menu key
  const getSelectedKey = () => {
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
            defaultOpenKeys={getDefaultOpenKeys()}
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

  // 기본으로 열린 메뉴 키 계산
  function getDefaultOpenKeys(): string[] {
    if (currentPath.startsWith('/stock-status')) {
      return ['/stock-status']
    }
    return []
  }
}
