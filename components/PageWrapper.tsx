'use client'

import { Sidebar } from './Sidebar'
import styles from './Layout.module.css'

interface PageWrapperProps {
  children: React.ReactNode
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.layoutMain}>
        <main className={styles.layoutContent}>{children}</main>
      </div>
    </div>
  )
}
