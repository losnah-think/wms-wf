import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // inboundApproval 모델이 스키마에 정의되지 않음
  return NextResponse.json(
    { error: 'Not Implemented', message: 'inboundApproval model not found in schema' },
    { status: 501 }
  )
}

export async function POST(request: NextRequest) {
  // inboundApproval 모델이 스키마에 정의되지 않음
  return NextResponse.json(
    { error: 'Not Implemented', message: 'inboundApproval model not found in schema' },
    { status: 501 }
  )
}

export async function PUT(request: NextRequest) {
  // inboundApproval 모델이 스키마에 정의되지 않음
  return NextResponse.json(
    { error: 'Not Implemented', message: 'inboundApproval model not found in schema' },
    { status: 501 }
  )
}
