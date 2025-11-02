'use client'

import LayoutAntd from '@/components/LayoutAntd'
import StockStatusAntd from '@/components/StockStatusAntd'

export default function StockStatusAntdPage() {
  return (
    <LayoutAntd>
      <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
        <StockStatusAntd />
      </div>
    </LayoutAntd>
  )
}
