import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'

const locales = ['en', 'ko', 'vi']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as any)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <header style={{
            backgroundColor: 'var(--color-white)',
            borderBottom: '1px solid var(--color-gray-lighter)',
            padding: '20px 0',
            marginBottom: '40px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100
          }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>WMS</h1>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--color-gray-dark)',
                  marginTop: '4px'
                }}>
                  Warehouse Management System
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href="/en" style={{ padding: '6px 12px', textDecoration: 'none', color: locale === 'en' ? '#ffffff' : '#333333', backgroundColor: locale === 'en' ? '#333333' : '#f5f5f5', borderRadius: '4px', fontSize: '13px' }}>🇺🇸 EN</a>
                <a href="/ko" style={{ padding: '6px 12px', textDecoration: 'none', color: locale === 'ko' ? '#ffffff' : '#333333', backgroundColor: locale === 'ko' ? '#333333' : '#f5f5f5', borderRadius: '4px', fontSize: '13px' }}>🇰🇷 KO</a>
                <a href="/vi" style={{ padding: '6px 12px', textDecoration: 'none', color: locale === 'vi' ? '#ffffff' : '#333333', backgroundColor: locale === 'vi' ? '#333333' : '#f5f5f5', borderRadius: '4px', fontSize: '13px' }}>🇻🇳 VI</a>
              </div>
            </div>
          </header>
          <div style={{ marginTop: '84px' }}></div>
          <main className="container">
            {children}
          </main>
          <footer style={{
            marginTop: '60px',
            padding: '30px 0',
            borderTop: '1px solid var(--color-gray-lighter)',
            textAlign: 'center',
            color: 'var(--color-gray-medium)',
            fontSize: '12px'
          }}>
            <div className="container">
              &copy; 2024 WMS. All rights reserved.
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
