import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WMS - Warehouse Management System',
  description: 'Low fidelity warehouse management system built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
