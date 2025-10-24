'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { menuSections, getSectionTranslationKey, getItemTranslationKey } from '@/lib/navigation'
import styles from './Sidebar.module.css'

export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const t = useTranslations()

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <nav className={styles.navigation}>
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.menuSection}>
              <h3 className={styles.sectionTitle}>
                {t(getSectionTranslationKey(section.titleKey))}</h3>
              <ul className={styles.menuList}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className={styles.menuItem}>
                    <Link
                      href={item.href}
                      className={`${styles.menuLink} ${
                        isActive(item.href) ? styles.menuLinkActive : ''
                      }`}
                    >
                      {t(getItemTranslationKey(item.labelKey))}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
