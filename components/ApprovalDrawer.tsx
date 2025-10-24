'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import styles from './ApprovalDrawer.module.css'

interface InboundRequest {
  id: string
  clientName: string
  item: string
  quantity: number
  requestDate: string
  status: string
  approver?: string
  remark?: string
  requesterName?: string
  requesterContact?: string
  requesterCompany?: string
  inspectionStatus?: string
  inspectionDate?: string
  inspectionRemarks?: string
  allocatedZone?: string
  allocatedBin?: string
  allocationTime?: string
}

interface ApprovalDrawerProps {
  isOpen: boolean
  data: InboundRequest | null
  onClose: () => void
  onApprove: (data: InboundRequest) => void
  onReject: (data: InboundRequest) => void
  isLoading?: boolean
}

export function ApprovalDrawer({
  isOpen,
  data,
  onClose,
  onApprove,
  onReject,
  isLoading,
}: ApprovalDrawerProps) {
  const t = useTranslations('inboundApproval')
  const [activeTab, setActiveTab] = useState<'basic' | 'requester' | 'inspection'>('basic')

  if (!isOpen || !data) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <h2>{t('requestId')}: {data.id}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'basic' ? styles.active : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            {t('basicInfo')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'requester' ? styles.active : ''}`}
            onClick={() => setActiveTab('requester')}
          >
            {t('requesterInfo')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'inspection' ? styles.active : ''}`}
            onClick={() => setActiveTab('inspection')}
          >
            {t('inspectionResult')}
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'basic' && (
            <div className={styles.tabContent}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>{t('clientName')}</label>
                  <p>{data.clientName}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('item')}</label>
                  <p>{data.item}</p>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>{t('quantity')}</label>
                  <p>{data.quantity}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('requestDate')}</label>
                  <p>{data.requestDate}</p>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>{t('remark')}</label>
                  <p>{data.remark || '-'}</p>
                </div>
              </div>

              {data.allocatedZone && (
                <>
                  <div className={styles.divider} />
                  <div className={styles.allocatedInfo}>
                    <h4>할당 정보</h4>
                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label>{t('allocatedZone')}</label>
                        <p className={styles.badge}>{data.allocatedZone}</p>
                      </div>
                      <div className={styles.field}>
                        <label>{t('allocatedBin')}</label>
                        <p className={styles.badge}>{data.allocatedBin}</p>
                      </div>
                    </div>
                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label>{t('allocationTime')}</label>
                        <p>{data.allocationTime}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'requester' && (
            <div className={styles.tabContent}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>{t('requesterName')}</label>
                  <p>{data.requesterName || '-'}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('requesterCompany')}</label>
                  <p>{data.requesterCompany || '-'}</p>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>{t('requesterContact')}</label>
                  <p>{data.requesterContact || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inspection' && (
            <div className={styles.tabContent}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>{t('inspectionStatus')}</label>
                  <p className={`${styles.badge} ${
                    data.inspectionStatus === t('passedInspection') 
                      ? styles.badgeSuccess 
                      : styles.badgeDanger
                  }`}>
                    {data.inspectionStatus || '-'}
                  </p>
                </div>
                <div className={styles.field}>
                  <label>{t('inspectionDate')}</label>
                  <p>{data.inspectionDate || '-'}</p>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>{t('inspectionRemarks')}</label>
                  <p>{data.inspectionRemarks || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.btnReject}
            onClick={() => onReject(data)}
            disabled={isLoading}
          >
            {t('reject')}
          </button>
          <button
            className={styles.btnApprove}
            onClick={() => onApprove(data)}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : t('approve')}
          </button>
        </div>
      </div>
    </>
  )
}
