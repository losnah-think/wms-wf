'use client'

import Link from 'next/link'

export default function LanguagePage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '60px 40px',
        maxWidth: '400px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#333333'
        }}>
          WMS
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666666',
          marginBottom: '40px'
        }}>
          Warehouse Management System
        </p>

        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '24px',
          color: '#333333'
        }}>
          Please select your language
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link href="/?lang=en" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#333333',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#555555')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#333333')}
            >
              🇺🇸 English
            </button>
          </Link>

          <Link href="/?lang=ko" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#333333',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#555555')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#333333')}
            >
              🇰🇷 한국어
            </button>
          </Link>

          <Link href="/?lang=vi" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#333333',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#555555')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#333333')}
            >
              🇻🇳 Tiếng Việt
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
