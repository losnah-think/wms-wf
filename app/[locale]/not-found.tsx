'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import styles from '@/components/ErrorPages.module.css'

export default function NotFound() {
  const t = useTranslations()

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>🔍</div>

        <h1 className={styles.errorCode}>404</h1>

        <h2 className={styles.errorTitle}>{t('error.404.title')}</h2>

        <p className={styles.errorDescription}>{t('error.404.description')}</p>

        <div className={styles.errorActions}>
          <Link href="/" className={styles.btnLink}>
            {t('error.backHome')}
          </Link>

          <Link href="/dashboard" className={styles.btnLink}>
            {t('error.backDashboard')}
          </Link>
        </div>

        <div className={styles.errorSupport}>
          <p className={styles.errorSupportText}>
            {t('error.needHelp')}
            <a href="mailto:support@example.com" className={styles.errorSupportLink}>
              {t('error.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
