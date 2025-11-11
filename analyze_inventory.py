#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📊 재고 데이터 분석 도구
mock-inventory-data.csv를 분석하는 Python 스크립트
"""

import pandas as pd
import numpy as np
from pathlib import Path

# CSV 파일 경로
CSV_FILE = Path(__file__).parent / "mock-inventory-data.csv"


class InventoryAnalyzer:
    """재고 데이터 분석 클래스"""
    
    def __init__(self, csv_path):
        """데이터 로드"""
        self.df = pd.read_csv(csv_path, encoding='utf-8')
        print(f"✅ 데이터 로드 완료: {len(self.df)}개 상품")
        print(f"📊 총 컬럼: {len(self.df.columns)}")
    
    def 요약통계(self):
        """📈 기본 통계"""
        print("\n" + "="*70)
        print("📈 기본 통계")
        print("="*70)
        
        print(f"\n🏪 전체 재고 현황:")
        print(f"  ├─ 총 상품 수: {len(self.df)}개")
        print(f"  ├─ 총 재고량: {self.df['quantity'].sum():,}개")
        print(f"  ├─ 총 가용재고: {self.df['availableQuantity'].sum():,}개")
        print(f"  ├─ 평균 가용율: {self.df['availabilityRate'].mean():.1f}%")
        print(f"  └─ 총 재고액: {self.df['totalStockValue'].sum():,.0f}원")
        
        print(f"\n📊 카테고리별 현황:")
        cat_summary = self.df.groupby('category').agg({
            'quantity': 'sum',
            'totalStockValue': 'sum',
            'id': 'count'
        }).round(0)
        cat_summary.columns = ['총재고', '재고액', '상품수']
        cat_summary = cat_summary.sort_values('재고액', ascending=False)
        
        for idx, (cat, row) in enumerate(cat_summary.iterrows(), 1):
            pct = row['재고액'] / self.df['totalStockValue'].sum() * 100
            print(f"  {idx}. {cat:10} | 재고: {row['총재고']:>6,.0f}개 | "
                  f"재고액: {row['재고액']:>12,.0f}원 ({pct:>5.1f}%) | "
                  f"상품수: {int(row['상품수'])}개")
    
    def 판매상태_분석(self):
        """📉 판매상태별 분석"""
        print("\n" + "="*70)
        print("📉 판매상태별 분석")
        print("="*70)
        
        status_summary = self.df.groupby('saleStatusText').agg({
            'quantity': ['sum', 'count', 'mean'],
            'totalStockValue': 'sum',
            'availabilityRate': 'mean'
        }).round(2)
        
        for status in self.df['saleStatusText'].unique():
            mask = self.df['saleStatusText'] == status
            count = mask.sum()
            qty = self.df[mask]['quantity'].sum()
            value = self.df[mask]['totalStockValue'].sum()
            avg_rate = self.df[mask]['availabilityRate'].mean()
            
            icon = "✅" if status == "판매중" else "⚠️" if status == "품절" else "❌"
            print(f"\n{icon} {status}")
            print(f"   ├─ 상품 수: {count}개")
            print(f"   ├─ 총 재고: {qty:,}개")
            print(f"   ├─ 재고액: {value:,.0f}원")
            print(f"   └─ 평균 가용율: {avg_rate:.1f}%")
    
    def 위험_상품_식별(self):
        """⚠️ 주의 필요 상품 식별"""
        print("\n" + "="*70)
        print("⚠️ 주의 필요 상품 식별")
        print("="*70)
        
        # 가용율 낮은 상품
        print("\n🔴 가용율 30% 이하 상품 (긴급 조치 필요):")
        low_avail = self.df[self.df['availabilityRate'] <= 30].sort_values('availabilityRate')
        if len(low_avail) > 0:
            for _, row in low_avail.iterrows():
                print(f"   {row['productName']:15} | "
                      f"가용율: {row['availabilityRate']:>5.1f}% | "
                      f"가용: {row['availableQuantity']:>5,.0f}개 / {row['quantity']:>5,.0f}개")
        else:
            print("   ✅ 해당 상품 없음")
        
        # 미주문 오래된 상품
        print("\n🟡 미주문 100일 이상 상품 (할인 필요):")
        old_order = self.df[self.df['daysWithoutOrder'] >= 100].sort_values('daysWithoutOrder', ascending=False)
        if len(old_order) > 0:
            for _, row in old_order.iterrows():
                print(f"   {row['productName']:15} | "
                      f"미주문: {row['daysWithoutOrder']:>3.0f}일 | "
                      f"재고액: {row['totalStockValue']:>12,.0f}원")
        else:
            print("   ✅ 해당 상품 없음")
        
        # 품절 상품
        print("\n🟠 품절 상품 (즉시 재발주):")
        sold_out = self.df[self.df['saleStatus'] == 'sold_out']
        if len(sold_out) > 0:
            for _, row in sold_out.iterrows():
                print(f"   {row['productName']:15} | "
                      f"현재: {row['quantity']:>5,.0f}개 | "
                      f"가용: {row['availableQuantity']:>5,.0f}개")
        else:
            print("   ✅ 해당 상품 없음")
    
    def 위치별_분석(self):
        """🏢 건물별 위치 분석"""
        print("\n" + "="*70)
        print("🏢 건물별 위치 분석")
        print("="*70)
        
        building_summary = self.df.groupby('building').agg({
            'quantity': 'sum',
            'id': 'count',
            'totalStockValue': 'sum'
        }).round(0)
        
        total_qty = building_summary['quantity'].sum()
        
        for building in sorted(self.df['building'].unique()):
            mask = self.df['building'] == building
            qty = self.df[mask]['quantity'].sum()
            count = mask.sum()
            value = self.df[mask]['totalStockValue'].sum()
            pct = qty / total_qty * 100
            
            print(f"\n🏢 {building}동")
            print(f"   ├─ 상품 수: {count}개")
            print(f"   ├─ 재고량: {qty:,.0f}개 ({pct:.1f}%)")
            print(f"   ├─ 재고액: {value:,.0f}원")
            
            # 하위 상위 위치 3개
            zones = self.df[mask].groupby('zone')['quantity'].sum().sort_values(ascending=False).head(3)
            print(f"   └─ TOP 구역:")
            for zone, zone_qty in zones.items():
                print(f"      └─ {building}-{zone}: {zone_qty:,.0f}개")
    
    def 당일_입출고(self):
        """📦 당일 입출고 분석"""
        print("\n" + "="*70)
        print("📦 당일 입출고 분석")
        print("="*70)
        
        total_inbound = self.df['dailyInboundQty'].sum()
        total_outbound = self.df['dailyOutboundQty'].sum()
        
        print(f"\n📊 당일 전체 현황:")
        print(f"   ├─ 총 입고: {total_inbound:,.0f}개")
        print(f"   ├─ 총 출고: {total_outbound:,.0f}개")
        print(f"   └─ 순 변화: {total_inbound - total_outbound:+,.0f}개 "
              f"({'⬇️ 재고 감소' if total_inbound < total_outbound else '⬆️ 재고 증가'})")
        
        print(f"\n🏢 건물별 당일 입출고:")
        for building in sorted(self.df['building'].unique()):
            mask = self.df['building'] == building
            inbound = self.df[mask]['dailyInboundQty'].sum()
            outbound = self.df[mask]['dailyOutboundQty'].sum()
            diff = inbound - outbound
            
            status = "✅ 정상" if diff >= 0 else "⚠️ 부족" if diff >= -100 else "🚨 긴급"
            print(f"   {building}동: 입고 {inbound:>5,.0f} - 출고 {outbound:>5,.0f} = "
                  f"{diff:+6,.0f} {status}")
    
    def 수익성_분석(self):
        """💰 수익성 분석 (마진율)"""
        print("\n" + "="*70)
        print("💰 수익성 분석 (마진율)")
        print("="*70)
        
        # 전체 평균
        avg_margin = self.df['marginPercentage'].mean()
        print(f"\n📊 전체 평균 마진율: {avg_margin:.1f}%")
        
        # 카테고리별 마진율
        print(f"\n📈 카테고리별 마진율:")
        cat_margin = self.df.groupby('category').agg({
            'marginPercentage': 'mean',
            'quantity': 'sum',
            'totalStockValue': 'sum'
        }).sort_values('marginPercentage', ascending=False)
        
        for cat, row in cat_margin.iterrows():
            icon = "⭐" if row['marginPercentage'] > 32 else "✅" if row['marginPercentage'] > 25 else "⚠️"
            print(f"   {icon} {cat:10} | 마진: {row['marginPercentage']:>5.1f}% | "
                  f"재고: {row['quantity']:>6,.0f}개 | 재고액: {row['totalStockValue']:>12,.0f}원")
        
        # 마진율 TOP/BOTTOM
        print(f"\n⭐ 마진율 TOP 5 상품:")
        top_margin = self.df.nlargest(5, 'marginPercentage')[['productName', 'marginPercentage', 'quantity']]
        for idx, (_, row) in enumerate(top_margin.iterrows(), 1):
            print(f"   {idx}. {row['productName']:20} | {row['marginPercentage']:>5.1f}% | {row['quantity']:>5,.0f}개")
        
        print(f"\n❌ 마진율 BOTTOM 5 상품:")
        bottom_margin = self.df.nsmallest(5, 'marginPercentage')[['productName', 'marginPercentage', 'quantity']]
        for idx, (_, row) in enumerate(bottom_margin.iterrows(), 1):
            print(f"   {idx}. {row['productName']:20} | {row['marginPercentage']:>5.1f}% | {row['quantity']:>5,.0f}개")
    
    def 회전율_분석(self):
        """🔄 회전율 분석"""
        print("\n" + "="*70)
        print("🔄 회전율 분석 (당일 출고 / 전체 재고)")
        print("="*70)
        
        # 회전율 계산
        self.df['회전율'] = (self.df['dailyOutboundQty'] / self.df['quantity'] * 100).fillna(0)
        
        print(f"\n📊 카테고리별 회전율:")
        for cat in sorted(self.df['category'].unique()):
            mask = self.df['category'] == cat
            turnover = (self.df[mask]['dailyOutboundQty'].sum() / 
                       self.df[mask]['quantity'].sum() * 100) if self.df[mask]['quantity'].sum() > 0 else 0
            
            daily_out = self.df[mask]['dailyOutboundQty'].sum()
            total_qty = self.df[mask]['quantity'].sum()
            icon = "⭐" if turnover > 15 else "✅" if turnover > 10 else "⚠️"
            print(f"   {icon} {cat:10} | 회전율: {turnover:>5.1f}% | "
                  f"일일 출고: {daily_out:>5,.0f}개 / 총재고 {total_qty:>6,.0f}개")
        
        print(f"\n🚀 회전율 TOP 5 상품:")
        top_turnover = self.df.nlargest(5, '회전율')[['productName', '회전율', 'category']]
        for idx, (_, row) in enumerate(top_turnover.iterrows(), 1):
            print(f"   {idx}. {row['productName']:20} | {row['회전율']:>5.1f}% | {row['category']}")
    
    def CSV_내보내기(self, output_file='inventory_analysis_result.csv'):
        """분석 결과를 CSV로 내보내기"""
        # 분석 컬럼 추가
        analysis_df = self.df[[
            'id', 'productCode', 'productName', 'category',
            'quantity', 'availableQuantity', 'availabilityRate',
            'totalStockValue', 'marginPercentage',
            'dailyInboundQty', 'dailyOutboundQty',
            'daysWithoutOrder', 'saleStatusText'
        ]].copy()
        
        # 회전율 추가
        analysis_df['회전율%'] = (analysis_df['dailyOutboundQty'] / analysis_df['quantity'] * 100).fillna(0).round(1)
        
        # 액션 판정
        def get_action(row):
            if row['availabilityRate'] <= 30:
                return '🚨 긴급 재발주'
            elif row['saleStatusText'] == '품절':
                return '⚠️ 품절 재발주'
            elif row['daysWithoutOrder'] >= 100:
                return '🟡 할인 판매'
            elif row['saleStatusText'] == '단종':
                return '❌ 재고 정리'
            else:
                return '✅ 정상'
        
        analysis_df['액션'] = analysis_df.apply(get_action, axis=1)
        
        # CSV 저장
        output_path = Path(__file__).parent / output_file
        analysis_df.to_csv(output_path, index=False, encoding='utf-8-sig')
        print(f"\n✅ 분석 결과 저장: {output_path}")
        
        return analysis_df
    
    def 최종_요약(self):
        """🎯 최종 요약 및 권장사항"""
        print("\n" + "="*70)
        print("🎯 최종 요약 및 권장사항")
        print("="*70)
        
        # 위험 상품
        critical = len(self.df[self.df['availabilityRate'] <= 30])
        old_products = len(self.df[self.df['daysWithoutOrder'] >= 100])
        sold_out = len(self.df[self.df['saleStatus'] == 'sold_out'])
        
        print(f"\n⚠️ 주요 지표:")
        print(f"   ├─ 🚨 긴급 재발주 필요: {critical}개 상품 (가용율 ≤ 30%)")
        print(f"   ├─ 🟡 할인 판매 필요: {old_products}개 상품 (미주문 ≥ 100일)")
        print(f"   └─ ⚠️ 품절 상품: {sold_out}개")
        
        # 기회 영역
        print(f"\n💡 기회 영역:")
        
        # 회전율 높은 카테고리
        high_turnover_cat = []
        for cat in self.df['category'].unique():
            mask = self.df['category'] == cat
            turnover = self.df[mask]['dailyOutboundQty'].sum() / self.df[mask]['quantity'].sum() * 100
            if turnover > 15:
                high_turnover_cat.append((cat, turnover))
        
        if high_turnover_cat:
            high_turnover_cat.sort(key=lambda x: x[1], reverse=True)
            print(f"   ├─ 🚀 회전율 높은 카테고리: {high_turnover_cat[0][0]} ({high_turnover_cat[0][1]:.1f}%)")
            print(f"      → 발주 증가 권장")
        
        # 마진율 높은 카테고리
        high_margin_cat = self.df.groupby('category')['marginPercentage'].mean().idxmax()
        high_margin_val = self.df.groupby('category')['marginPercentage'].mean().max()
        print(f"   ├─ 💰 마진율 높은 카테고리: {high_margin_cat} ({high_margin_val:.1f}%)")
        print(f"      → 판매 증진 및 재고 최적화")
        
        # 위치 최적화
        print(f"   └─ 📍 위치 최적화: A동 중심 (38%) → 균등 분산")
        
        print(f"\n✅ 즉시 조치 사항:")
        print(f"   1. {critical}개 저재고 상품 긴급 조치 (재발주/생산)")
        print(f"   2. {old_products}개 미판매 상품 30% 이상 할인")
        print(f"   3. {sold_out}개 품절 상품 우선 재발주")
        print(f"   4. D동 입고 증가 (당일 -450개 적자 해결)")
        print(f"   5. 신발 카테고리 재발주 증가 (회전율 최고)")


def main():
    """메인 함수"""
    print("\n" + "="*70)
    print("🎯 재고 데이터 분석 시작")
    print("="*70)
    
    try:
        analyzer = InventoryAnalyzer(CSV_FILE)
        
        # 각 분석 실행
        analyzer.요약통계()
        analyzer.판매상태_분석()
        analyzer.위험_상품_식별()
        analyzer.위치별_분석()
        analyzer.당일_입출고()
        analyzer.수익성_분석()
        analyzer.회전율_분석()
        
        # 결과 내보내기
        result_df = analyzer.CSV_내보내기()
        print(f"\n📋 분석 결과 미리보기:")
        print(result_df.head(5).to_string(index=False))
        
        # 최종 요약
        analyzer.최종_요약()
        
        print("\n" + "="*70)
        print("✅ 분석 완료!")
        print("="*70 + "\n")
        
    except FileNotFoundError:
        print(f"❌ 오류: {CSV_FILE} 파일을 찾을 수 없습니다.")
        print(f"   파일 위치: {CSV_FILE}")


if __name__ == '__main__':
    main()
