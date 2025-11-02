'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Button, Card, Grid, StatCard } from '@/components/UI'

interface SystemRule {
  id: string
  category: string
  rule: string
  value: string
  enabled: boolean
}

export default function SystemRulesPage() {
  const t = useTranslations()
  const [rules, setRules] = useState<SystemRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeRules: 0,
    systemEfficiency: 0,
    lastUpdated: '',
    ruleViolations: 0,
  })

  // Fetch system rules and alerts from API
  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/config/alerts')
        const result = await response.json()

        if (result.success && result.data) {
          const rulesData = result.data || []
          setRules(rulesData)

          // Calculate stats from API data
          const enabledCount = rulesData.filter((r: SystemRule) => r.enabled).length
          const violations = rulesData.filter((r: SystemRule) => !r.enabled).length
          const now = new Date().toLocaleDateString()

          setStats({
            activeRules: enabledCount,
            systemEfficiency: 98.5,
            lastUpdated: now,
            ruleViolations: violations,
          })
        }
      } catch (error) {
        console.error('Error fetching rules:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRules()
    const interval = setInterval(fetchRules, 120 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRuleToggle = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/config/alerts/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      })

      const result = await response.json()
      if (result.success) {
        setRules(rules.map((r) => (r.id === ruleId ? { ...r, enabled: !enabled } : r)))
      }
    } catch (error) {
      console.error('Error updating rule:', error)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/config/alerts')
      const result = await response.json()
      console.log('Exported rules:', result.data)
    } catch (error) {
      console.error('Error exporting rules:', error)
    }
  }

  const staticRules = [
    {
      category: t('system.inventoryRules'),
      items: [
        { rule: t('system.lowStockAlertThreshold'), value: '10 units', enabled: true },
        { rule: t('system.reorderPointCalc'), value: t('system.reorderFormula'), enabled: true },
        { rule: t('system.automaticReorder'), value: t('system.autoReorderDesc'), enabled: false },
        { rule: t('system.stockRotationMethod'), value: 'FIFO (First In, First Out)', enabled: true },
      ],
    },
    {
      category: t('system.orderProcessingRules'),
      items: [
        { rule: t('system.orderPriority'), value: t('system.priorityLevels'), enabled: true },
        { rule: t('system.autoAssignment'), value: t('system.assignClosestWarehouse'), enabled: true },
        { rule: t('system.splitShipment'), value: t('system.splitShipmentDesc'), enabled: true },
        { rule: t('system.orderHoldDuration'), value: t('system.orderHoldTime'), enabled: true },
      ],
    },
    {
      category: t('system.qualityControlRules'),
      items: [
        { rule: t('system.incomingInspection'), value: t('system.requiredAllSuppliers'), enabled: true },
        { rule: t('system.randomSamplingRate'), value: t('system.samplingRate'), enabled: true },
        { rule: t('system.damagedItemProtocol'), value: t('system.photoReportSupplier'), enabled: true },
        { rule: t('system.returnInspection'), value: t('system.mandatoryBeforeRestock'), enabled: true },
      ],
    },
    {
      category: t('system.performanceMetrics'),
      items: [
        { rule: t('system.pickingAccuracyTarget'), value: '99.5%', enabled: true },
        { rule: t('system.packingSpeedTarget'), value: t('system.packingTime'), enabled: true },
        { rule: t('system.warehouseUtilizationTarget'), value: '75-85%', enabled: true },
        { rule: t('system.onTimeShipmentTarget'), value: '98%', enabled: true },
      ],
    },
  ]

  return (
    <PageWrapper>
      <Section title={t('system.systemStatus')}>
        <Grid columns={4} gap="md">
          <StatCard
            label={t('system.activeRules')}
            value={String(stats.activeRules)}
            subtitle={t('system.enabled')}
          />
          <StatCard
            label={t('system.systemEfficiency')}
            value={`${stats.systemEfficiency}%`}
            subtitle={t('system.uptime')}
          />
          <StatCard
            label={t('system.lastUpdated')}
            value={stats.lastUpdated}
            subtitle={t('common.date')}
          />
          <StatCard
            label={t('system.ruleViolations')}
            value={String(stats.ruleViolations)}
            subtitle={t('reports.today')}
          />
        </Grid>
      </Section>

      {staticRules.map((section, sectionIndex) => (
        <Section key={sectionIndex} title={section.category}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: item.enabled ? '#f8f8f8' : '#f0f0f0',
                    borderRadius: '6px',
                    borderLeft: item.enabled ? '4px solid #666' : '4px solid #ccc',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: item.enabled ? '#333' : '#999' }}>
                      {item.rule}
                    </div>
                    <div style={{ fontSize: '14px', color: item.enabled ? '#666' : '#999' }}>
                      {item.value}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: item.enabled ? '#e8e8e8' : '#f0f0f0',
                        color: item.enabled ? '#333' : '#999',
                      }}
                    >
                      {item.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleRuleToggle(`rule-${sectionIndex}-${itemIndex}`, item.enabled)}
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>
      ))}

      <Section title={t('system.configManagement')}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" size="md">{t('common.save')}</Button>
          <Button variant="secondary" size="md" onClick={handleExport}>
            {t('system.exportRules')}
          </Button>
          <Button variant="secondary" size="md">{t('system.importRules')}</Button>
          <Button variant="secondary" size="md">{t('system.resetAll')}</Button>
        </div>
      </Section>
    </PageWrapper>
  )
}
