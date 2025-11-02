import React from 'react'
import { Sidebar } from './Sidebar'
import { Header, HeaderProps } from './Header'
import styles from './Layout.module.css'

export interface LayoutProps extends HeaderProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />

      <div className={styles.layoutMain}>
        <Header title={title} subtitle={subtitle} actions={actions} />

        <main className={styles.layoutContent}>
          {children}
        </main>
      </div>
    </div>
  )
}
