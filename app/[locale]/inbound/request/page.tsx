'use client'

import { PageWrapper } from '@/components/PageWrapper'
import { Section, Card } from '@/components/UI'

export default function InboundRequestPage() {
  return (
    <PageWrapper>
      <Section title="입고 신청">
        <Card>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
              📊 입고 신청은 OMS에서만 진행됩니다
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
              입고 신청은 통합 주문 관리 시스템(OMS)에서 생성되며,<br />
              여기서는 <strong>입고 예정표</strong>와 <strong>입고 승인</strong>만 진행할 수 있습니다.
            </p>
            <div style={{ background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
              <p style={{ color: '#0284c7', fontSize: '14px', margin: 0 }}>
                💡 팁: 입고 신청이 필요하신 경우 OMS 시스템을 통해 진행해주세요.
              </p>
            </div>
          </div>
        </Card>
      </Section>
    </PageWrapper>
  )
}
