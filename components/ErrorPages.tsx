'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import styles from './ErrorPages.module.css'

interface ErrorPageProps {
  code: number
  errorId?: string
  details?: string
  showRetry?: boolean
  onRetry?: () => void
}

export const ErrorPage = ({
  code,
  errorId,
  details,
  showRetry = true,
  onRetry,
}: ErrorPageProps) => {
  const t = useTranslations()

  const getErrorInfo = (code: number) => {
    const errorMap: Record<number, { title: string; description: string; icon: string }> = {
      400: {
        title: 'error.400.title',
        description: 'error.400.description',
        icon: '❌',
      },
      401: {
        title: 'error.401.title',
        description: 'error.401.description',
        icon: '🔐',
      },
      403: {
        title: 'error.403.title',
        description: 'error.403.description',
        icon: '🚫',
      },
      404: {
        title: 'error.404.title',
        description: 'error.404.description',
        icon: '🔍',
      },
      408: {
        title: 'error.408.title',
        description: 'error.408.description',
        icon: '⏱️',
      },
      409: {
        title: 'error.409.title',
        description: 'error.409.description',
        icon: '⚠️',
      },
      410: {
        title: 'error.410.title',
        description: 'error.410.description',
        icon: '🗑️',
      },
      422: {
        title: 'error.422.title',
        description: 'error.422.description',
        icon: '📋',
      },
      429: {
        title: 'error.429.title',
        description: 'error.429.description',
        icon: '⏳',
      },
      500: {
        title: 'error.500.title',
        description: 'error.500.description',
        icon: '💥',
      },
      502: {
        title: 'error.502.title',
        description: 'error.502.description',
        icon: '🌉',
      },
      503: {
        title: 'error.503.title',
        description: 'error.503.description',
        icon: '🔧',
      },
      504: {
        title: 'error.504.title',
        description: 'error.504.description',
        icon: '⏲️',
      },
    }

    return (
      errorMap[code] || {
        title: 'error.unknown.title',
        description: 'error.unknown.description',
        icon: '❓',
      }
    )
  }

  const errorInfo = getErrorInfo(code)

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>{errorInfo.icon}</div>

        <h1 className={styles.errorCode}>{code}</h1>

        <h2 className={styles.errorTitle}>{t(errorInfo.title)}</h2>

        <p className={styles.errorDescription}>{t(errorInfo.description)}</p>

        {details && <p className={styles.errorDetails}>{details}</p>}

        {errorId && (
          <div className={styles.errorId}>
            <small>
              {t('error.errorId')}: <code className={styles.errorIdCode}>{errorId}</code>
            </small>
          </div>
        )}

        <div className={styles.errorActions}>
          {showRetry && onRetry && (
            <button className={styles.btnRetry} onClick={onRetry}>
              {t('error.retry')}
            </button>
          )}

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

// WMS 특화 에러 컴포넌트
export const InventoryError = () => (
  <ErrorPage code={422} errorId="WMS-1001" details="재고 정보를 불러올 수 없습니다." />
)

export const OrderLockedError = () => (
  <ErrorPage code={409} errorId="WMS-2001" details="다른 사용자가 현재 주문을 처리 중입니다." />
)

export const CarrierUnavailableError = () => (
  <ErrorPage code={503} errorId="WMS-3001" details="현재 배송업체 서비스를 이용할 수 없습니다." />
)

export const InsufficientStockError = () => (
  <ErrorPage code={422} errorId="WMS-1002" details="재고가 부족합니다." />
)

export const SessionExpiredError = () => (
  <ErrorPage code={401} errorId="WMS-4001" details="세션이 만료되었습니다. 다시 로그인해주세요." />
)
