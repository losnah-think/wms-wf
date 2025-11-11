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
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const isChildActive = (children?: any[]): boolean => {
    if (!children) return false
    return children.some(child => isActive(child.href))
  }

  const toggleExpand = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(h => h !== href)
        : [...prev, href]
    )
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
                    {item.children && item.children.length > 0 ? (
                      <>
                        <button
                          className={`${styles.menuLink} ${styles.menuLinkParent} ${
                            isActive(item.href) || isChildActive(item.children) ? styles.menuLinkActive : ''
                          } ${expandedItems.includes(item.href) ? styles.menuLinkExpanded : ''}`}
                          onClick={() => toggleExpand(item.href)}
                        >
                          <span>{t(getItemTranslationKey(item.labelKey))}</span>
                          <span className={styles.expandIcon}>▼</span>
                        </button>
                        {expandedItems.includes(item.href) && (
                          <ul className={styles.subMenuList}>
                            {item.children.map((child, childIndex) => (
                              <li key={childIndex} className={styles.subMenuItem}>
                                <Link
                                  href={child.href}
                                  className={`${styles.subMenuLink} ${
                                    isActive(child.href) ? styles.subMenuLinkActive : ''
                                  }`}
                                >
                                  {t(getItemTranslationKey(child.labelKey))}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className={`${styles.menuLink} ${
                          isActive(item.href) ? styles.menuLinkActive : ''
                        }`}
                      >
                        {t(getItemTranslationKey(item.labelKey))}
                      </Link>
                    )}
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
