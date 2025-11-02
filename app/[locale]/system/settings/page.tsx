'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Button, Select, Input, Card } from '@/components/UI'

interface SystemConfig {
  language: string
  timezone: string
  currency: string
  dateFormat: string
  emailNotifications: boolean
  smsNotifications: boolean
  autoBackup: boolean
  backupFrequency: string
}

export default function SystemSettingsPage() {
  const t = useTranslations()
  const [config, setConfig] = useState<SystemConfig>({
    language: 'ko',
    timezone: 'Asia/Seoul',
    currency: 'KRW',
    dateFormat: 'YYYY-MM-DD',
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/config/system')
        const result = await response.json()

        if (result.success && result.data) {
          setConfig(result.data)
        }
      } catch (error) {
        console.error('Error fetching system config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/config/system', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const result = await response.json()

      if (result.success) {
        alert('설정이 저장되었습니다.')
      } else {
        alert(`저장 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving config:', error)
      alert('설정 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const languageOptions = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Tiếng Việt' },
  ]

  const timezoneOptions = [
    { value: 'Asia/Seoul', label: 'Asia/Seoul (KST)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  ]

  const currencyOptions = [
    { value: 'KRW', label: '₩ KRW' },
    { value: 'USD', label: '$ USD' },
    { value: 'EUR', label: '€ EUR' },
    { value: 'JPY', label: '¥ JPY' },
  ]

  const backupFrequencyOptions = [
    { value: 'hourly', label: '매시간' },
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
  ]

  if (isLoading) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Section title="시스템 설정">
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>일반 설정</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <Select
                  label="언어"
                  options={languageOptions}
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                />
                <Select
                  label="시간대"
                  options={timezoneOptions}
                  value={config.timezone}
                  onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                />
                <Select
                  label="통화"
                  options={currencyOptions}
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                />
                <Input
                  label="날짜 형식"
                  value={config.dateFormat}
                  onChange={(e) => setConfig({ ...config, dateFormat: e.target.value })}
                />
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>알림 설정</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.emailNotifications}
                    onChange={(e) => setConfig({ ...config, emailNotifications: e.target.checked })}
                  />
                  <span>이메일 알림 활성화</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.smsNotifications}
                    onChange={(e) => setConfig({ ...config, smsNotifications: e.target.checked })}
                  />
                  <span>SMS 알림 활성화</span>
                </label>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>백업 설정</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.autoBackup}
                    onChange={(e) => setConfig({ ...config, autoBackup: e.target.checked })}
                  />
                  <span>자동 백업 활성화</span>
                </label>
                {config.autoBackup && (
                  <div style={{ marginLeft: '24px' }}>
                    <Select
                      label="백업 주기"
                      options={backupFrequencyOptions}
                      value={config.backupFrequency}
                      onChange={(e) => setConfig({ ...config, backupFrequency: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : '설정 저장'}
              </Button>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => window.location.reload()}
              >
                취소
              </Button>
            </div>
          </div>
        </Card>
      </Section>

      <Section title="위험 지역">
        <Card>
          <div style={{ padding: '16px', backgroundColor: '#fff3e0', borderRadius: '6px', borderLeft: '4px solid #ff9800' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600, color: '#e65100' }}>
              ⚠️ 주의가 필요한 작업
            </h4>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button variant="secondary" size="md">데이터베이스 초기화</Button>
              <Button variant="secondary" size="md">모든 로그 삭제</Button>
              <Button variant="secondary" size="md">시스템 재시작</Button>
            </div>
          </div>
        </Card>
      </Section>
    </PageWrapper>
  )
}
