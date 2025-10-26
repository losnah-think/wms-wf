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

export default function Sitemap() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [expandedApiGroup, setExpandedApiGroup] = useState<string | null>(null)

  const pages: PageSection[] = [
    {
      title: '📊 대시보드',
      path: '/dashboard',
      status: 'in-progress',
      apis: ['GET /api/dashboard/stats'],
    },
    {
      title: '📥 입고 관리',
      path: '/inbound',
      status: 'completed',
      apis: [
        'GET /api/inbound/schedule',
        'GET /api/inbound-requests',
        'GET /api/inbound/approval',
        'POST /api/inbound/manual',
      ],
    },
    {
      title: '📦 입고 예정표',
      path: '/inbound/schedule',
      status: 'completed',
      apis: ['GET /api/inbound/schedule'],
    },
    {
      title: '📋 입고 요청',
      path: '/inbound/requests',
      status: 'in-progress',
      apis: ['GET /api/inbound-requests'],
    },
    {
      title: '✅ 입고 승인',
      path: '/inbound/approval',
      status: 'in-progress',
      apis: ['GET /api/inbound/approval', 'POST /api/inbound/approval'],
    },
    {
      title: '📤 출고 관리',
      path: '/outbound',
      status: 'pending',
      apis: ['POST /api/outbound/manual'],
    },
    {
      title: '🎯 피킹',
      path: '/picking',
      status: 'in-progress',
      apis: [
        'GET /api/picking/queue',
        'POST /api/picking/assign',
        'POST /api/picking/pick',
        'GET /api/picking/efficiency',
      ],
    },
    {
      title: '📪 반품',
      path: '/returns',
      status: 'in-progress',
      apis: [
        'GET /api/returns/request',
        'POST /api/returns/process',
        'GET /api/returns/status',
      ],
    },
    {
      title: '🚚 배송',
      path: '/shipping',
      status: 'in-progress',
      apis: [
        'POST /api/shipping/process',
        'GET /api/shipping/track',
        'GET /api/shipping/carrier',
      ],
    },
    {
      title: '📊 재고 상태',
      path: '/stock-status',
      status: 'completed',
      apis: ['GET /api/stock/status'],
    },
    {
      title: '⚙️ 재고 설정',
      path: '/stock-settings',
      status: 'in-progress',
      apis: ['GET /api/stock/location', 'POST /api/stock/import'],
    },
    {
      title: '🔍 고급 재고',
      path: '/advanced-inventory',
      status: 'in-progress',
      apis: [
        'GET /api/stock/movement',
        'GET /api/stock/trends',
        'GET /api/stock/audit',
      ],
    },
    {
      title: '📈 보고서',
      path: '/reports',
      status: 'in-progress',
      apis: [
        'GET /api/reports/daily',
        'GET /api/reports/weekly',
        'GET /api/reports/inventory/monthly',
        'GET /api/reports/sales',
      ],
    },
    {
      title: '👥 작업자 관리',
      path: '/workers',
      status: 'in-progress',
      apis: ['GET /api/users', 'GET /api/users/activity'],
    },
    {
      title: '🏢 창고 관리',
      path: '/warehouse',
      status: 'in-progress',
      apis: ['GET /api/warehouse/[id]/stock', 'GET /api/config/warehouse'],
    },
    {
      title: '📦 상품 관리',
      path: '/products',
      status: 'in-progress',
      apis: ['GET /api/products'],
    },
    {
      title: '⚙️ 시스템 규칙',
      path: '/system/rules',
      status: 'pending',
      apis: ['GET /api/config/system', 'GET /api/config/alerts'],
    },
    {
      title: '🔄 입출 관리',
      path: '/inbound-outbound',
      status: 'in-progress',
      apis: [
        'GET /api/inbound/schedule',
        'POST /api/outbound/manual',
      ],
    },
    {
      title: '📦 포장',
      path: '/packing',
      status: 'in-progress',
      apis: [
        'GET /api/picking/packing-list',
        'POST /api/picking/shipping-tag',
      ],
    },
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
        <h1>📍 WMS 사이트맵</h1>
        <p className="text-gray-600 mb-8">전체 페이지 및 API 엔드포인트 현황</p>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{pages.length}</div>
            <div className="text-sm text-gray-600">총 페이지</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">
              {pages.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">완료</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">
              {pages.filter(p => p.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600">진행 중</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">
              {pages.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">미처리</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pages Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">📄 페이지 목록</h2>
            <div className="space-y-2">
              {pages.map((page) => (
                <div key={page.path} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === page.path ? null : page.path
                      )
                    }
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <span>{page.title}</span>
                      <span className="text-xs text-gray-500">{page.path}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          statusColors[page.status]
                        }`}
                      >
                        {page.status === 'completed'
                          ? '완료'
                          : page.status === 'in-progress'
                          ? '진행 중'
                          : '미처리'}
                      </span>
                      <span className="text-gray-400">
                        {expandedSection === page.path ? '▼' : '▶'}
                      </span>
                    </div>
                  </button>

                  {expandedSection === page.path && (
                    <div className="border-t p-4 bg-white">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        관련 API:
                      </div>
                      <div className="space-y-1">
                        {page.apis.map((api) => (
                          <div
                            key={api}
                            className="text-sm text-blue-600 ml-2 flex items-center gap-2"
                          >
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {api}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Summary Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">📡 API 현황</h2>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                <div className="text-lg font-bold text-green-600">
                  {allApis.filter(a => a.status === 'working').length}
                </div>
                <div className="text-xs text-gray-600">작동 중</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                <div className="text-lg font-bold text-yellow-600">
                  {allApis.filter(a => a.status === 'testing').length}
                </div>
                <div className="text-xs text-gray-600">테스트 중</div>
              </div>
              <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                <div className="text-lg font-bold text-red-600">
                  {allApis.filter(a => a.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-600">미구현</div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-bold text-gray-700 mb-2">
                  총 API: {allApis.length}개
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed API List */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">📡 API 상세 목록</h2>

          {/* Group by category */}
          {['Inbound', 'Outbound', 'Stock', 'Picking', 'Returns', 'Shipping', 'Reports', 'Barcode', 'Users', 'Config', 'Warehouse', 'Dashboard', 'Auth'].map(
            (category) => {
              const categoryApis = allApis.filter((api) =>
                api.path.includes(category.toLowerCase())
              )
              if (categoryApis.length === 0) return null

              return (
                <div key={category} className="mb-4">
                  <button
                    onClick={() =>
                      setExpandedApiGroup(
                        expandedApiGroup === category ? null : category
                      )
                    }
                    className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded font-semibold flex items-center justify-between transition"
                  >
                    <span>{category}</span>
                    <span className="text-xs bg-gray-300 px-2 py-1 rounded">
                      {categoryApis.length}
                    </span>
                    <span className="text-gray-600">
                      {expandedApiGroup === category ? '▼' : '▶'}
                    </span>
                  </button>

                  {expandedApiGroup === category && (
                    <div className="space-y-2 mt-2 pl-2">
                      {categoryApis.map((api) => (
                        <div
                          key={api.path}
                          className={`p-3 rounded text-sm ${
                            apiStatusColors[api.status]
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-mono font-bold text-xs">
                              {api.method}
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                apiStatusBadges[api.status]
                              }`}
                            >
                              {api.status === 'working'
                                ? '작동 중'
                                : api.status === 'testing'
                                ? '테스트'
                                : '미구현'}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-gray-700">
                            {api.path}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {api.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-gray-50 rounded border">
          <h3 className="font-bold mb-2">🔤 범례</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
              완료 / 작동 중
            </div>
            <div>
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-2"></span>
              진행 중 / 테스트
            </div>
            <div>
              <span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span>
              미처리 / 미구현
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
