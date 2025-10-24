'use client'

import { useTranslations } from 'next-intl'
import { PageWrapper } from '@/components/PageWrapper'
import { Section, Button, Card, Grid, StatCard } from '@/components/UI'

export default function SystemRulesPage() {
  const t = useTranslations()
  const stats = [
    { label: t('system.activeRules'), value: '14', subtitle: t('system.enabled') },
    { label: t('system.systemEfficiency'), value: '98.5%', subtitle: t('system.uptime') },
    { label: t('system.lastUpdated'), value: '2024-01-15', subtitle: t('common.date') },
    { label: t('system.ruleViolations'), value: '0', subtitle: t('reports.today') },
  ]

  const rules = [
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
          {stats.map((stat, index) => (
            <StatCard key={index} label={stat.label} value={stat.value} subtitle={stat.subtitle} />
          ))}
        </Grid>
      </Section>

      {rules.map((section, sectionIndex) => (
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
                      defaultChecked={item.enabled}
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
          <Button variant="secondary" size="md">{t('system.exportRules')}</Button>
          <Button variant="secondary" size="md">{t('system.importRules')}</Button>
          <Button variant="secondary" size="md">{t('system.resetAll')}</Button>
        </div>
      </Section>
    </PageWrapper>
  )
}
