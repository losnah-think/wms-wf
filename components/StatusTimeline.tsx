'use client'

import styles from './StatusTimeline.module.css'

interface TimelineStep {
  key: string
  label: string
  icon: string
  isCompleted: boolean
  isCurrent: boolean
}

interface StatusTimelineProps {
  steps: TimelineStep[]
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        {steps.map((step, index) => (
          <div key={step.key} className={styles.stepWrapper}>
            <div
              className={`${styles.step} ${step.isCompleted ? styles.completed : ''} ${
                step.isCurrent ? styles.current : ''
              }`}
            >
              <div className={styles.icon}>{step.icon}</div>
              <div className={styles.label}>{step.label}</div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`${styles.connector} ${
                  step.isCompleted || step.isCurrent ? styles.active : ''
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
