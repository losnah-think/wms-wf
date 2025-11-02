'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const pathname = usePathname()

  // 현재 경로에서 로케일 제거
  const currentPath = pathname.replace(`/${locale}`, '')

  return (
    <div className="flex pt-14">
      {/* 사이드바 */}
      <aside className="w-72 h-[calc(100vh-56px)] bg-white border-r border-zinc-200 overflow-y-auto fixed left-0 top-14 z-40">
        {/* WMS 로고 */}
        <div className="h-14 px-2.5 flex justify-between items-center border-b border-zinc-200">
          <div className="flex justify-center items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-[10px] overflow-hidden flex justify-center items-center">
              <div className="w-6 h-6 relative">
                <div className="w-5 h-1.5 left-0 top-2 absolute bg-sky-600 rounded-[1.10px]" />
                <div className="w-5 h-1.5 left-6 top-0 absolute bg-sky-600 rounded-[1.10px]" />
                <div className="w-3.5 h-4 left-2 top-4 absolute">
                  <div className="w-3.5 h-2 origin-top-left rotate-[-60deg] bg-sky-600 rounded-[0.77px]" />
                </div>
              </div>
            </div>
            <div className="text-sky-600 text-2xl font-bold">WMS</div>
          </div>
          <div className="w-6 h-6 relative overflow-hidden">
            <div className="w-3 h-2.5 left-[6px] top-[7px] absolute outline outline-2 outline-offset-[-1px] outline-zinc-500" />
          </div>
        </div>

        {/* 메뉴 */}
        <div className="p-5 flex flex-col gap-7">
          {/* 창고관리 섹션 */}
          <div className="flex flex-col gap-4">
            <div className="px-4 py-[5px] flex justify-between items-center cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 relative overflow-hidden">
                  <div className="w-4 h-5 left-[3px] top-[2px] absolute outline outline-2 outline-offset-[-1px] outline-zinc-500" />
                </div>
                <div style={{ color: '#6B7178', fontSize: 20, fontFamily: 'Pretendard', fontWeight: '700', lineHeight: '30px' }}>창고관리</div>
              </div>
              <div className="w-6 h-6 relative overflow-hidden">
                <div className="w-3 h-1.5 left-[6px] top-[9px] absolute outline outline-2 outline-offset-[-1px] outline-zinc-500" />
              </div>
            </div>
            <div className="py-2 bg-neutral-50 rounded-[10px] flex flex-col gap-1">
              {/* 창고 정보 관리 */}
              <a
                href={`/${locale}/warehouse-info`}
                className={`pl-5 pr-4 py-1 flex items-center gap-3 transition-colors ${
                  currentPath === '/warehouse-info'
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <div className="w-3.5 h-2.5 left-[2.50px] top-[5px] absolute outline outline-2 outline-offset-[-1px] outline-sky-600" />
                </div>
                <span style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard',
                  fontWeight: currentPath === '/warehouse-info' ? '600' : '400',
                  lineHeight: '27px',
                  color: currentPath === '/warehouse-info' ? '#007BED' : '#6B7178'
                }}>
                  창고 정보 관리
                </span>
              </a>
              {/* 존/로케이션 관리 */}
              <a
                href={`/${locale}/warehouse/location`}
                className={`pl-5 pr-4 py-1 flex items-center gap-3 transition-colors ${
                  currentPath === '/warehouse/location'
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <div className="w-5 h-5 left-[0.83px] top-[0.83px] absolute outline outline-[1.60px] outline-offset-[-0.80px] outline-zinc-500" />
                </div>
                <span style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard',
                  fontWeight: currentPath === '/warehouse/location' ? '600' : '400',
                  lineHeight: '27px',
                  color: currentPath === '/warehouse/location' ? '#007BED' : '#6B7178'
                }}>
                  존/로케이션 관리
                </span>
              </a>
              {/* 창고 레이아웃 관리 */}
              <a
                href={`/${locale}/warehouse/layout`}
                className={`pl-5 pr-4 py-1 flex items-center gap-3 transition-colors ${
                  currentPath === '/warehouse/layout'
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <div className="w-3.5 h-4 left-[2.50px] top-[1.67px] absolute outline outline-[1.60px] outline-offset-[-0.80px] outline-zinc-500" />
                </div>
                <span style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard',
                  fontWeight: currentPath === '/warehouse/layout' ? '600' : '400',
                  lineHeight: '27px',
                  color: currentPath === '/warehouse/layout' ? '#007BED' : '#6B7178'
                }}>
                  창고 레이아웃 관리
                </span>
              </a>
              {/* 위치 바코드 관리 */}
              <a
                href={`/${locale}/warehouse/barcode`}
                className={`pl-5 pr-4 py-1 flex items-center gap-3 transition-colors ${
                  currentPath === '/warehouse/barcode'
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <div className="w-4 h-3 left-[1.67px] top-[4.17px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-zinc-500" />
                </div>
                <span style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard',
                  fontWeight: currentPath === '/warehouse/barcode' ? '600' : '400',
                  lineHeight: '27px',
                  color: currentPath === '/warehouse/barcode' ? '#007BED' : '#6B7178'
                }}>
                  위치 바코드 관리
                </span>
              </a>
            </div>
          </div>

          {/* 재고 관리 섹션 */}
          <div className="flex flex-col gap-4">
            <div className="px-4 py-[5px] flex justify-between items-center cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 relative overflow-hidden">
                  <div className="w-4 h-5 left-[3px] top-[2px] absolute outline outline-2 outline-offset-[-0.90px] outline-zinc-500" />
                </div>
                <div style={{ color: '#6B7178', fontSize: 20, fontFamily: 'Pretendard', fontWeight: '700', lineHeight: '30px' }}>재고 관리</div>
              </div>
              <div className="w-6 h-6 relative overflow-hidden">
                <div className="w-3 h-1.5 left-[6px] top-[9px] absolute outline outline-2 outline-offset-[-1px] outline-zinc-500" />
              </div>
            </div>
            <div className="py-2 bg-neutral-50 rounded-[10px] flex flex-col gap-1">
              {/* 현황 */}
              <a
                href={`/${locale}/stock-status`}
                className={`pl-5 pr-4 py-1 flex items-center gap-3 transition-colors ${
                  currentPath === '/stock-status'
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <div className="w-2.5 h-3.5 left-[5px] top-[3.33px] absolute outline outline-[1.60px] outline-offset-[-0.80px] outline-zinc-500" />
                </div>
                <span style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard',
                  fontWeight: currentPath === '/stock-status' ? '600' : '400',
                  lineHeight: '27px',
                  color: currentPath === '/stock-status' ? '#007BED' : '#6B7178'
                }}>
                  현황
                </span>
              </a>
              {/* 이동 */}
              <a
                href={`/${locale}/stock-move`}
                className={`pl-5 pr-4 py-1 flex items-center gap-3 transition-colors ${
                  currentPath === '/stock-move'
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <div className="w-4 h-4 left-[1.67px] top-[1.67px] absolute outline outline-[1.60px] outline-offset-[-0.80px] outline-zinc-500" />
                </div>
                <span style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard',
                  fontWeight: currentPath === '/stock-move' ? '600' : '400',
                  lineHeight: '27px',
                  color: currentPath === '/stock-move' ? '#007BED' : '#6B7178'
                }}>
                  이동
                </span>
              </a>
              {/* 조정(조사) */}
              <a
                href={`/${locale}/stock-audit`}
                className={`pl-5 pr-4 py-1 flex items-center gap-3 transition-colors ${
                  currentPath === '/stock-audit'
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <div className="w-3.5 h-4 left-[2.50px] top-[1.67px] absolute outline outline-[1.60px] outline-offset-[-0.80px] outline-zinc-500" />
                </div>
                <span style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard',
                  fontWeight: currentPath === '/stock-audit' ? '600' : '400',
                  lineHeight: '27px',
                  color: currentPath === '/stock-audit' ? '#007BED' : '#6B7178'
                }}>
                  조정(조사)
                </span>
              </a>
              {/* 환경설정 */}
              <a
                href={`/${locale}/stock-settings`}
                className={`pl-5 pr-4 py-1 flex items-center gap-3 transition-colors ${
                  currentPath === '/stock-settings'
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="w-5 h-5 relative overflow-hidden">
                  <div className="w-3.5 h-4 left-[2.50px] top-[1.67px] absolute outline outline-[1.60px] outline-offset-[-0.80px] outline-zinc-500" />
                </div>
                <span style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard',
                  fontWeight: currentPath === '/stock-settings' ? '600' : '400',
                  lineHeight: '27px',
                  color: currentPath === '/stock-settings' ? '#007BED' : '#6B7178'
                }}>
                  환경설정
                </span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="ml-72 w-[calc(100%-288px)]">
        {children}
      </main>
    </div>
  )
}
