'use client'

import React from 'react'
import { Layout as AntLayout, Menu, ConfigProvider, Breadcrumb, Avatar, Dropdown, Space } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { menuSections, getSectionTranslationKey, getItemTranslationKey } from '@/lib/navigation'
import antdTheme from '@/lib/antd-config'
import styles from './LayoutAntd.module.css'

const { Header, Sider, Content, Footer } = AntLayout

interface LayoutAntdProps {
  children: React.ReactNode
  locale?: string
}

export const LayoutAntd: React.FC<LayoutAntdProps> = ({ children, locale = 'ko' }) => {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()
  const [collapsed, setCollapsed] = React.useState(false)
  const [openKeys, setOpenKeys] = React.useState<string[]>([])

  // Initialize open keys on mount or pathname change
  React.useEffect(() => {
    const keys: string[] = []
    menuSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const isChildActive = item.children.some(child => pathname.includes(child.href))
          if (isChildActive) {
            keys.push(item.href)
          }
        }
      })
    })
    setOpenKeys(keys)
  }, [pathname])

  // Get current menu key from pathname
  const getCurrentMenuKey = (): string[] => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 1) {
      const path = `/${segments.slice(1).join('/')}`
      return [path]
    }
    return ['/']
  }

  // Build menu items from menuSections - memoized to prevent re-creation
  const buildMenuItems = React.useMemo(() => {
    return menuSections.map((section, index) => ({
      key: `section-${index}`,
      label: t(getSectionTranslationKey(section.titleKey)),
      children: section.items.map((item) => {
        // If item has children (3-level menu), create submenu
        if (item.children && item.children.length > 0) {
          return {
            key: item.href,
            label: t(getItemTranslationKey(item.labelKey)),
            children: item.children.map((child) => ({
              key: child.href,
              label: t(getItemTranslationKey(child.labelKey)),
              onClick: () => router.push(child.href),
            })),
          }
        }
        
        // Regular menu item (2-level menu)
        return {
          key: item.href,
          label: t(getItemTranslationKey(item.labelKey)),
          onClick: () => router.push(item.href),
        }
      }),
    }))
  }, [t, router])

  const userMenuItems = [
    {
      key: 'profile',
      label: '프로필',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: '설정',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '로그아웃',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ]

  return (
    <ConfigProvider theme={antdTheme}>
      <AntLayout style={{ minHeight: '100vh' }}>
        {/* Header */}
        <Header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <h1 style={{ color: 'white', margin: 0, fontSize: 18, fontWeight: 'bold' }}>
                WMS
              </h1>
            </div>

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <span style={{ color: 'white', fontSize: 14 }}>Admin User</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        <AntLayout>
          {/* Sidebar */}
          <Sider
            breakpoint="lg"
            collapsedWidth={0}
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            style={{ background: '#fff' }}
          >
            <Menu
              mode="inline"
              selectedKeys={getCurrentMenuKey()}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              items={buildMenuItems}
              style={{ height: '100%', borderRight: 0 }}
            />
          </Sider>

          {/* Main Content */}
          <AntLayout>
            <Content style={{ margin: '24px 16px', padding: 24, background: '#f5f5f5' }}>
              {children}
            </Content>

            <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
              WMS (Warehouse Management System) ©2025 by Your Company
            </Footer>
          </AntLayout>
        </AntLayout>
      </AntLayout>
    </ConfigProvider>
  )
}

export default LayoutAntd
