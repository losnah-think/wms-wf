import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // inboundSchedule 모델이 스키마에 정의되지 않음
  return NextResponse.json(
    { error: 'Not Implemented', message: 'inboundSchedule model not found in schema' },
    { status: 501 }
  )
}

