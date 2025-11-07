import { ConfigProvider } from 'antd'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import LayoutWrapperAntd from '@/components/LayoutWrapperAntd'
import '../globals.css'

const antdTheme = {
  token: {
    fontFamily: 'Pretendard, sans-serif',
    colorPrimary: '#007BED',
    borderRadius: 10,
    colorBgContainer: '#FFFFFF',
    colorBorder: '#E5E7EB',
    fontSize: 14,
    lineHeight: 1.5,
  },
  components: {
    Menu: {
      itemSelectedBg: '#E0F2FE',
      itemSelectedColor: '#007BED',
    },
  },
}

const locales = ['en', 'ko']

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
        <ConfigProvider theme={antdTheme}>
          <NextIntlClientProvider messages={messages}>
            <LayoutWrapperAntd>
              {children}
            </LayoutWrapperAntd>
          </NextIntlClientProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}
