'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import styles from '@/components/ErrorPages.module.css'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations()

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>💥</div>

        <h1 className={styles.errorCode}>500</h1>

        <h2 className={styles.errorTitle}>{t('error.500.title')}</h2>

        <p className={styles.errorDescription}>{t('error.500.description')}</p>

        {error.message && (
          <div className={styles.errorDetails}>
            <strong>{t('error.details')}:</strong>
            <p>{error.message}</p>
          </div>
        )}

        {error.digest && (
          <div className={styles.errorId}>
            <small>
              {t('error.errorId')}: <code>{error.digest}</code>
            </small>
          </div>
        )}

        <div className={styles.errorActions}>
          <button className={styles.btnRetry} onClick={() => reset()}>
            {t('error.retry')}
          </button>

          <Link href="/" className={styles.btnLink}>
            {t('error.backHome')}
          </Link>

          <Link href="/dashboard" className={styles.btnLink}>
            {t('error.backDashboard')}
          </Link>
        </div>

        <div className={styles.errorSupport}>
          <p>
            {t('error.needHelp')}
            <a href="mailto:support@example.com">{t('error.contactSupport')}</a>
          </p>
        </div>
      </div>
    </div>
  )
}
