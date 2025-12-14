import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'ko', 'my'],
  defaultLocale: 'ko'
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
