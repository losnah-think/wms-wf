'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import styles from './error-showcase.module.css'

interface ErrorPreview {
  code: number
  icon: string
  title: string
  description: string
}

export default function ErrorShowcase() {
  const t = useTranslations()
  const [selectedError, setSelectedError] = useState<number>(404)

  const errors: ErrorPreview[] = [
    { code: 400, icon: '❌', title: t('error.400.title'), description: t('error.400.description') },
    { code: 401, icon: '🔐', title: t('error.401.title'), description: t('error.401.description') },
    { code: 403, icon: '🚫', title: t('error.403.title'), description: t('error.403.description') },
    { code: 404, icon: '🔍', title: t('error.404.title'), description: t('error.404.description') },
    { code: 408, icon: '⏱️', title: t('error.408.title'), description: t('error.408.description') },
    { code: 409, icon: '⚠️', title: t('error.409.title'), description: t('error.409.description') },
    { code: 410, icon: '🗑️', title: t('error.410.title'), description: t('error.410.description') },
    { code: 422, icon: '📋', title: t('error.422.title'), description: t('error.422.description') },
    { code: 429, icon: '⏳', title: t('error.429.title'), description: t('error.429.description') },
    { code: 500, icon: '💥', title: t('error.500.title'), description: t('error.500.description') },
    { code: 502, icon: '🌉', title: t('error.502.title'), description: t('error.502.description') },
    { code: 503, icon: '🔧', title: t('error.503.title'), description: t('error.503.description') },
    { code: 504, icon: '⏲️', title: t('error.504.title'), description: t('error.504.description') },
  ]

  const selectedErrorData = errors.find((e) => e.code === selectedError)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🚨 {t('error.showcase')}</h1>
        <p>{t('error.showcaseDescription')}</p>
        <Link href="/" className={styles.backLink}>
          ← {t('error.backHome')}
        </Link>
      </header>

      <div className={styles.content}>
        {/* 사이드바 - 에러 목록 */}
        <aside className={styles.sidebar}>
          <h2>HTTP Status Codes</h2>
          <div className={styles.errorList}>
            {errors.map((error) => (
              <button
                key={error.code}
                className={`${styles.errorItem} ${
                  selectedError === error.code ? styles.errorItemActive : ''
                }`}
                onClick={() => setSelectedError(error.code)}
              >
                <span className={styles.errorItemIcon}>{error.icon}</span>
                <span className={styles.errorItemCode}>{error.code}</span>
              </button>
            ))}
          </div>

          <h2 style={{ marginTop: '40px' }}>WMS Error Codes</h2>
          <div className={styles.wmsCodeList}>
            <div className={styles.wmsCodeGroup}>
              <strong>재고 관련</strong>
              <ul>
                <li>WMS-1001: 재고 없음</li>
                <li>WMS-1002: 부족</li>
                <li>WMS-1003: 형식 오류</li>
                <li>WMS-1004: 잠금</li>
                <li>WMS-1005: 유통기한</li>
              </ul>
            </div>
            <div className={styles.wmsCodeGroup}>
              <strong>주문 관련</strong>
              <ul>
                <li>WMS-2001: 주문 없음</li>
                <li>WMS-2002: 잠금</li>
                <li>WMS-2003: 배송됨</li>
                <li>WMS-2004: 부분배송</li>
                <li>WMS-2005: 취소</li>
              </ul>
            </div>
            <div className={styles.wmsCodeGroup}>
              <strong>배송 관련</strong>
              <ul>
                <li>WMS-3001: 배송업체</li>
                <li>WMS-3002: 주소</li>
                <li>WMS-3003: 무게</li>
                <li>WMS-3004: 실패</li>
              </ul>
            </div>
            <div className={styles.wmsCodeGroup}>
              <strong>권한/인증</strong>
              <ul>
                <li>WMS-4001: 미인증</li>
                <li>WMS-4002: 권한 부족</li>
                <li>WMS-4003: 세션 만료</li>
                <li>WMS-4004: IP 차단</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* 메인 미리보기 영역 */}
        <main className={styles.preview}>
          {selectedErrorData && (
            <div className={styles.errorPreview}>
              <div className={styles.previewIcon}>{selectedErrorData.icon}</div>
              <h2 className={styles.previewCode}>{selectedErrorData.code}</h2>
              <h3 className={styles.previewTitle}>{selectedErrorData.title}</h3>
              <p className={styles.previewDescription}>{selectedErrorData.description}</p>

              <div className={styles.previewMetadata}>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>{t('error.errorId')}:</span>
                  <code className={styles.metadataValue}>WMS-{selectedErrorData.code}-A1B2C3D4</code>
                </div>
              </div>

              <div className={styles.previewActions}>
                <button className={styles.actionButton}>{t('error.retry')}</button>
                <button className={styles.actionButtonSecondary}>{t('error.backHome')}</button>
                <button className={styles.actionButtonSecondary}>{t('error.backDashboard')}</button>
              </div>

              <div className={styles.previewSupport}>
                <p>
                  {t('error.needHelp')} <a href="mailto:support@example.com">{t('error.contactSupport')}</a>
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 상세 정보 섹션 */}
      <section className={styles.details}>
        <h2>📋 {t('error.detailedInfo')}</h2>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>🔍 400 - Bad Request</h3>
            <p>잘못된 요청 형식입니다. 입력값을 다시 확인해주세요.</p>
            <ul>
              <li>SKU 형식 오류</li>
              <li>필수 필드 누락</li>
              <li>데이터 타입 불일치</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>🔐 401 - Unauthorized</h3>
            <p>인증이 필요합니다. 로그인을 진행해주세요.</p>
            <ul>
              <li>로그인 필요</li>
              <li>토큰 만료</li>
              <li>유효하지 않은 자격증명</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>🚫 403 - Forbidden</h3>
            <p>이 리소스에 접근할 권한이 없습니다.</p>
            <ul>
              <li>권한 부족</li>
              <li>특정 창고 접근 제한</li>
              <li>관리자 전용 기능</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>🔍 404 - Not Found</h3>
            <p>찾는 리소스가 존재하지 않습니다.</p>
            <ul>
              <li>삭제된 주문</li>
              <li>존재하지 않는 상품</li>
              <li>잘못된 경로</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>⏱️ 408 - Request Timeout</h3>
            <p>요청 처리 시간이 초과되었습니다.</p>
            <ul>
              <li>배송 조회 타임아웃</li>
              <li>API 응답 지연</li>
              <li>네트워크 문제</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>⚠️ 409 - Conflict</h3>
            <p>요청 처리 중 충돌이 발생했습니다.</p>
            <ul>
              <li>주문이 이미 처리 중</li>
              <li>중복된 데이터</li>
              <li>리소스 상태 충돌</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>🗑️ 410 - Gone</h3>
            <p>리소스가 영구적으로 삭제되었습니다.</p>
            <ul>
              <li>완료된 배송</li>
              <li>취소된 주문</li>
              <li>만료된 데이터</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>📋 422 - Unprocessable Entity</h3>
            <p>데이터 검증에 실패했습니다.</p>
            <ul>
              <li>재고 부족</li>
              <li>유효하지 않은 주소</li>
              <li>무게 제한 초과</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>⏳ 429 - Too Many Requests</h3>
            <p>너무 많은 요청이 발생했습니다.</p>
            <ul>
              <li>API 레이트 제한 초과</li>
              <li>대량 작업 요청</li>
              <li>DDoS 방어</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>💥 500 - Server Error</h3>
            <p>서버에서 예기치 않은 오류가 발생했습니다.</p>
            <ul>
              <li>DB 쿼리 오류</li>
              <li>서버 프로세스 에러</li>
              <li>예상치 못한 예외</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>🌉 502 - Bad Gateway</h3>
            <p>게이트웨이 연결 오류입니다.</p>
            <ul>
              <li>DB 연결 실패</li>
              <li>외부 API 오류</li>
              <li>프록시 오류</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>🔧 503 - Service Unavailable</h3>
            <p>서비스가 일시적으로 사용 불가능합니다.</p>
            <ul>
              <li>서버 점검 중</li>
              <li>배포 진행 중</li>
              <li>리소스 부족</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>⏲️ 504 - Gateway Timeout</h3>
            <p>게이트웨이 응답 시간이 초과되었습니다.</p>
            <ul>
              <li>백엔드 응답 지연</li>
              <li>DB 쿼리 타임아웃</li>
              <li>네트워크 지연</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 처리 가이드 섹션 */}
      <section className={styles.guide}>
        <h2>📖 에러별 처리 가이드</h2>

        <div className={styles.guideTable}>
          <table>
            <thead>
              <tr>
                <th>에러 코드</th>
                <th>원인</th>
                <th>사용자 조치</th>
                <th>관리자 조치</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>400</td>
                <td>잘못된 입력</td>
                <td>입력값 재확인</td>
                <td>로그 검토</td>
              </tr>
              <tr>
                <td>401</td>
                <td>인증 없음</td>
                <td>로그인</td>
                <td>토큰 검증</td>
              </tr>
              <tr>
                <td>403</td>
                <td>권한 없음</td>
                <td>관리자 문의</td>
                <td>권한 설정</td>
              </tr>
              <tr>
                <td>404</td>
                <td>없는 리소스</td>
                <td>다른 페이지로</td>
                <td>리소스 확인</td>
              </tr>
              <tr>
                <td>422</td>
                <td>검증 실패</td>
                <td>필드 확인</td>
                <td>규칙 검토</td>
              </tr>
              <tr>
                <td>500</td>
                <td>서버 에러</td>
                <td>나중에 재시도</td>
                <td>에러 로그 분석</td>
              </tr>
              <tr>
                <td>503</td>
                <td>점검 중</td>
                <td>나중에 방문</td>
                <td>점검 진행</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
