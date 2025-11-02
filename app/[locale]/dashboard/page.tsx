'use client'

import DashboardAntd from '@/components/DashboardAntd'
import LayoutAntd from '@/components/LayoutAntd'

export default function DashboardPage() {
  return (
    <LayoutAntd>
      <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
        <DashboardAntd />
      </div>
    </LayoutAntd>
  )
}
