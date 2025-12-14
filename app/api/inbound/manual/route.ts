import { NextRequest, NextResponse } from 'next/server';

// STK-003: 입고 처리 (수동)
export async function POST(request: NextRequest) {
  // supplier 모델이 스키마에 정의되지 않음
  return NextResponse.json(
    { error: 'Not Implemented', message: 'supplier model not found in schema' },
    { status: 501 }
  );
}
