'use client'

import { useTranslations } from 'next-intl'

export default function StockMovementPage() {
  const t = useTranslations()

  return (
    <div>
      <h1>{t('nav.item.stockMovement')}</h1>
      <p>Stock movement between warehouses and locations</p>
    </div>
  )
}
