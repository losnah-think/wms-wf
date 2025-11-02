'use client'

import { useTranslations } from 'next-intl'

export default function LocationPage() {
  const t = useTranslations()

  return (
    <div>
      <h1>{t('nav.item.location')}</h1>
      <p>Location (Rack, Zone, Position) management page</p>
    </div>
  )
}
