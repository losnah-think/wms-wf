'use client'

import { useTranslations } from 'next-intl'

export default function BarcodeManagementPage() {
  const t = useTranslations()

  return (
    <div>
      <h1>{t('nav.item.barcode')}</h1>
      <p>Barcode generation and management page</p>
    </div>
  )
}
