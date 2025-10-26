'use client'

import { useState } from 'react'
import styles from '@/components/Layout.module.css'

interface PageSection {
  title: string
  path: string
  status: 'completed' | 'in-progress' | 'pending'
  apis: string[]
}

interface ApiEndpoint {
  method: string
  path: string
  description: string
  status: 'working' | 'testing' | 'pending'
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    pending: 'bg-red-100 text-red-800',
    working: 'bg-green-100 text-green-800',
    testing: 'bg-yellow-100 text-yellow-800',
  }
  
  const labels = {
    completed: '완료',
    'in-progress': '진행중',
    pending: '미처리',
    working: '작동중',
    testing: '테스트',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[status as keyof typeof colors] || 'bg-gray-100'}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

export default function Sitemap() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [expandedApiGroup, setExpandedApiGroup] = useState<string | null>(null)

  const pages: PageSection[] = [
    { title: '대시보드', path: '/dashboard', status: 'in-progress', apis: ['GET /api/dashboard/stats'] },
    { title: '입고 예정표', path: '/inbound/schedule', status: 'completed', apis: ['GET /api/inbound/schedule'] },
    { title: '입고 승인', path: '/inbound/approval', status: 'in-progress', apis: ['GET /api/inbound/approval'] },
    { title: '재고 현황', path: '/stock-status', status: 'completed', apis: ['GET /api/stock/status'] },
    { title: '재고 설정', path: '/stock-settings', status: 'in-progress', apis: ['GET /api/config/warehouse'] },
    { title: '재고 이동', path: '/advanced-inventory', status: 'in-progress', apis: ['GET /api/stock/movement'] },
    { title: '피킹', path: '/picking', status: 'in-progress', apis: ['GET /api/picking/pick'] },
    { title: '포장', path: '/packing', status: 'in-progress', apis: ['GET /api/picking/packing-list'] },
    { title: '입출고', path: '/inbound-outbound', status: 'in-progress', apis: ['GET /api/inbound/schedule'] },
    { title: '반품요청', path: '/returns/request', status: 'in-progress', apis: ['GET /api/returns/request'] },
    { title: '반품처리', path: '/returns/process', status: 'in-progress', apis: ['GET /api/returns/process'] },
    { title: '반품현황', path: '/returns/status', status: 'in-progress', apis: ['GET /api/returns/status'] },
    { title: '반품피킹', path: '/return-picking', status: 'in-progress', apis: ['GET /api/picking/queue'] },
    { title: '배송관리', path: '/shipping', status: 'in-progress', apis: ['GET /api/shipping/process'] },
    { title: '배송설정', path: '/shipping/settings', status: 'in-progress', apis: ['GET /api/config/warehouse'] },
    { title: '보고서', path: '/reports/current', status: 'in-progress', apis: ['GET /api/reports/daily'] },
    { title: '분석', path: '/reports/analysis', status: 'in-progress', apis: ['GET /api/reports/inventory/monthly'] },
    { title: '시스템규칙', path: '/system/rules', status: 'pending', apis: ['GET /api/config/system'] },
    { title: '작업자관리', path: '/workers', status: 'in-progress', apis: ['GET /api/users'] },
    { title: '창고관리', path: '/warehouse', status: 'in-progress', apis: ['GET /api/config/warehouse'] },
    { title: '상품관리', path: '/products', status: 'in-progress', apis: ['GET /api/products'] },
  ]

  const allApis: ApiEndpoint[] = [
    // Inbound APIs
    { method: 'GET', path: '/api/inbound/schedule', description: '입고 예정표 조회', status: 'working' },
    { method: 'GET', path: '/api/inbound-requests', description: '입고 요청 목록', status: 'working' },
    { method: 'GET', path: '/api/inbound/approval', description: '입고 승인 목록', status: 'testing' },
    { method: 'POST', path: '/api/inbound/manual', description: '수동 입고 등록', status: 'testing' },
    { method: 'GET', path: '/api/inbound-status/[id]', description: '입고 상태 조회', status: 'testing' },

    // Outbound APIs
    { method: 'POST', path: '/api/outbound/manual', description: '수동 출고 등록', status: 'pending' },

    // Stock APIs
    { method: 'GET', path: '/api/stock/status', description: '재고 상태 조회', status: 'working' },
    { method: 'GET', path: '/api/stock/movement', description: '재고 이동 기록', status: 'testing' },
    { method: 'GET', path: '/api/stock/trends', description: '재고 추세', status: 'testing' },
    { method: 'GET', path: '/api/stock/audit', description: '재고 감시', status: 'testing' },
    { method: 'GET', path: '/api/stock/location', description: '재고 위치', status: 'testing' },
    { method: 'GET', path: '/api/stock/[id]', description: '재고 상세', status: 'testing' },
    { method: 'GET', path: '/api/stock/available/[id]', description: '이용 가능 재고', status: 'pending' },
    { method: 'POST', path: '/api/stock/import', description: '재고 수입', status: 'pending' },
    { method: 'POST', path: '/api/stock/reserve', description: '재고 예약', status: 'pending' },
    { method: 'GET', path: '/api/stock/movement/[id]', description: '이동 상세 조회', status: 'testing' },

    // Picking APIs
    { method: 'GET', path: '/api/picking/queue', description: '피킹 대기열', status: 'testing' },
    { method: 'POST', path: '/api/picking/assign', description: '피킹 할당', status: 'testing' },
    { method: 'POST', path: '/api/picking/pick', description: '피킹 실행', status: 'testing' },
    { method: 'GET', path: '/api/picking/efficiency', description: '피킹 효율', status: 'testing' },
    { method: 'GET', path: '/api/picking/packing-list', description: '포장 목록', status: 'testing' },
    { method: 'POST', path: '/api/picking/shipping-tag', description: '배송 태그 생성', status: 'testing' },
    { method: 'GET', path: '/api/picking/batch', description: '피킹 배치', status: 'pending' },
    { method: 'POST', path: '/api/picking/cancel', description: '피킹 취소', status: 'pending' },
    { method: 'POST', path: '/api/picking/reassign', description: '피킹 재할당', status: 'pending' },

    // Returns APIs
    { method: 'GET', path: '/api/returns/request', description: '반품 요청', status: 'testing' },
    { method: 'POST', path: '/api/returns/process', description: '반품 처리', status: 'testing' },
    { method: 'GET', path: '/api/returns/status', description: '반품 상태', status: 'testing' },
    { method: 'POST', path: '/api/returns/inspect', description: '반품 검사', status: 'pending' },
    { method: 'POST', path: '/api/returns/classify', description: '반품 분류', status: 'pending' },
    { method: 'POST', path: '/api/returns/refund', description: '환불 처리', status: 'pending' },

    // Shipping APIs
    { method: 'POST', path: '/api/shipping/process', description: '배송 처리', status: 'testing' },
    { method: 'GET', path: '/api/shipping/track/[trackingNumber]', description: '배송 추적', status: 'testing' },
    { method: 'GET', path: '/api/shipping/carrier', description: '배송사 정보', status: 'testing' },
    { method: 'POST', path: '/api/shipping/notify', description: '배송 알림', status: 'pending' },
    { method: 'POST', path: '/api/shipping/cancel', description: '배송 취소', status: 'pending' },

    // Reports APIs
    { method: 'GET', path: '/api/reports/daily', description: '일일 보고서', status: 'testing' },
    { method: 'GET', path: '/api/reports/weekly', description: '주간 보고서', status: 'testing' },
    { method: 'GET', path: '/api/reports/inventory/monthly', description: '월간 재고 보고서', status: 'testing' },
    { method: 'GET', path: '/api/reports/sales', description: '판매 보고서', status: 'testing' },
    { method: 'GET', path: '/api/reports/custom', description: '맞춤 보고서', status: 'pending' },
    { method: 'GET', path: '/api/reports/turnover', description: '회전율 보고서', status: 'pending' },

    // Barcode APIs
    { method: 'POST', path: '/api/barcode/generate', description: '바코드 생성', status: 'pending' },
    { method: 'POST', path: '/api/barcode/scan', description: '바코드 스캔', status: 'pending' },
    { method: 'POST', path: '/api/barcode/verify', description: '바코드 확인', status: 'pending' },

    // Users APIs
    { method: 'GET', path: '/api/users', description: '사용자 목록', status: 'testing' },
    { method: 'GET', path: '/api/users/activity', description: '사용자 활동', status: 'testing' },
    { method: 'GET', path: '/api/users/permissions', description: '사용자 권한', status: 'pending' },

    // Config APIs
    { method: 'GET', path: '/api/config/system', description: '시스템 설정', status: 'pending' },
    { method: 'GET', path: '/api/config/warehouse', description: '창고 설정', status: 'testing' },
    { method: 'GET', path: '/api/config/alerts', description: '알림 설정', status: 'pending' },
    { method: 'GET', path: '/api/config/backup', description: '백업 설정', status: 'pending' },

    // Warehouse APIs
    { method: 'GET', path: '/api/warehouse/[id]/stock', description: '창고 재고', status: 'testing' },

    // Dashboard APIs
    { method: 'GET', path: '/api/dashboard/stats', description: '대시보드 통계', status: 'testing' },

    // Auth APIs
    { method: 'POST', path: '/api/auth/login', description: '로그인', status: 'pending' },
  ]

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    pending: 'bg-red-100 text-red-800',
  }

  const apiStatusColors = {
    working: 'bg-green-50 border-l-4 border-green-500',
    testing: 'bg-yellow-50 border-l-4 border-yellow-500',
    pending: 'bg-red-50 border-l-4 border-red-500',
  }

  const apiStatusBadges = {
    working: 'bg-green-200 text-green-800',
    testing: 'bg-yellow-200 text-yellow-800',
    pending: 'bg-red-200 text-red-800',
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>WMS 사이트맵</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>전체 페이지 및 API 엔드포인트 현황</p>

        {/* Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>{pages.length}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>총 페이지</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
              {pages.filter(p => p.status === 'completed').length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>완료</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
              {pages.filter(p => p.status === 'in-progress').length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>진행 중</div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>
              {pages.filter(p => p.status === 'pending').length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>미처리</div>
          </div>
        </div>

        {/* Pages Table */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>페이지 목록</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>#</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>페이지</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>경로</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page, idx) => (
                  <tr key={page.path} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '12px' }}>{idx + 1}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{page.title}</td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '12px', fontFamily: 'monospace' }}>{page.path}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <StatusBadge status={page.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Stats */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>API 현황</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#388e3c' }}>
                {allApis.filter(a => a.status === 'working').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>작동 중</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f57c00' }}>
                {allApis.filter(a => a.status === 'testing').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>테스트 중</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d32f2f' }}>
                {allApis.filter(a => a.status === 'pending').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>미구현</div>
            </div>
          </div>
        </div>

        {/* API List */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>API 상세</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>METHOD</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>경로</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>설명</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {allApis.map((api) => (
                  <tr key={api.path} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: api.method === 'GET' ? '#1976d2' : '#f57c00' }}>
                      {api.method}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '11px' }}>{api.path}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{api.description}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <StatusBadge status={api.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>범례</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#4caf50', borderRadius: '2px', marginRight: '8px' }}></span>
              완료 / 작동 중
            </div>
            <div>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ff9800', borderRadius: '2px', marginRight: '8px' }}></span>
              진행 중 / 테스트
            </div>
            <div>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f44336', borderRadius: '2px', marginRight: '8px' }}></span>
              미처리 / 미구현
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
