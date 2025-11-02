'use client'

import React, { useState } from 'react'
import styles from './Header.module.css'

export interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const [selectedTeam, setSelectedTeam] = useState('본사 창고')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const teams = ['본사 창고', '지점 A', '지점 B', '물류센터']

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logo}>WMS</div>

        <div className={styles.teamSelector}>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className={styles.teamSelect}
            aria-label="팀 선택"
          >
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {(title || subtitle) && (
          <div className={styles.headerInfo}>
            {title && <h1 className={styles.headerTitle}>{title}</h1>}
            {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
          </div>
        )}
      </div>

      <div className={styles.headerRight}>
        {actions && <div className={styles.headerActions}>{actions}</div>}

        <div className={styles.profileWrapper}>
          <button
            className={styles.profileButton}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="프로필 메뉴"
            aria-expanded={isProfileOpen}
          >
            <div className={styles.profileIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>

          {isProfileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileDropdownItem}>
                <strong>관리자</strong>
                <span className={styles.profileEmail}>admin@wms.com</span>
              </div>
              <div className={styles.profileDropdownDivider} />
              <button className={styles.profileDropdownButton}>프로필 설정</button>
              <button className={styles.profileDropdownButton}>로그아웃</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
