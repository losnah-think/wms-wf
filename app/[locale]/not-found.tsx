'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function NotFound() {
  const t = useTranslations()

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      padding: '20px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        fontFamily: 'Pretendard, sans-serif',
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px',
        }}>🔍</div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1F2B60',
          marginBottom: '12px',
        }}>404</h1>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1F2B60',
          marginBottom: '12px',
        }}>{t('error.404.title')}</h2>

        <p style={{
          fontSize: '16px',
          color: '#6B7178',
          marginBottom: '24px',
        }}>{t('error.404.description')}</p>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column',
          marginBottom: '24px',
        }}>
          <Link href="/" style={{
            padding: '12px 24px',
            backgroundColor: '#007BED',
            color: '#FFFFFF',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
            fontFamily: 'Pretendard, sans-serif',
          }}>
            {t('error.backHome')}
          </Link>

          <Link href="/warehouse-info" style={{
            padding: '12px 24px',
            backgroundColor: '#E5E7EB',
            color: '#464C53',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
            fontFamily: 'Pretendard, sans-serif',
          }}>
            {t('error.backDashboard')}
          </Link>
        </div>

        <div style={{
          fontSize: '14px',
          color: '#6B7178',
        }}>
          <p>
            {t('error.needHelp')}
            <a href="mailto:support@example.com" style={{
              color: '#007BED',
              textDecoration: 'none',
              marginLeft: '4px',
            }}>
              {t('error.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
