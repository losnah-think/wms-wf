import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PIC-004: 바코드 검증
 * 피킹한 상품 바코드로 오류 감지
 * 
 * 입력: 할당ID, 바코드데이터 (필수), 기대상품ID (필수)
 * 출력: 검증결과 (정상/오류/경고), 스캔상품ID, 불일치여부, 메시지
 * 
 * 프로세스:
 * 1. 작업자가 피킹한 상품 바코드 스캔
 * 2. 바코드에서 상품ID 추출
 * 3. 주문서상 기대 상품ID와 비교
 * 4. 일치 → '정상' 반환 및 진행
 * 5. 불일치 → '오류' 반환 및 알림
 * 6. 검증 기록 저장
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignmentId, barcodeData, expectedProductId } = body

    // 필수값 검증
    if (!assignmentId || !barcodeData || !expectedProductId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: assignmentId, barcodeData, expectedProductId',
        },
        { status: 400 }
      )
    }

    // 바코드에서 상품ID 추출 (바코드 형식: PROD-{상품ID}-{체크디지트})
    const barcodePattern = /^PROD-(.+)-\d+$/
    const match = barcodeData.match(barcodePattern)

    if (!match) {
      return NextResponse.json({
        success: true,
        data: {
          verificationResult: 'error',
          scannedProductId: null,
          isMatched: false,
          message: '유효하지 않은 바코드 형식입니다.',
          errorType: 'INVALID_BARCODE',
        },
      })
    }

    const scannedProductId = match[1]

    // 바코드가 실제 상품인지 확인
    const scannedProduct = await prisma.product.findUnique({
      where: { id: scannedProductId },
      select: {
        id: true,
        code: true,
        name: true,
        barcode: true,
      },
    })

    if (!scannedProduct) {
      return NextResponse.json({
        success: true,
        data: {
          verificationResult: 'error',
          scannedProductId: scannedProductId,
          isMatched: false,
          message: '존재하지 않는 상품입니다.',
          errorType: 'PRODUCT_NOT_FOUND',
        },
      })
    }

    // 바코드 체크디지트 검증
    const checksumDigit = parseInt(barcodeData.split('-').pop() || '0')
    const calculatedChecksum = calculateChecksum(scannedProductId)

    if (checksumDigit !== calculatedChecksum) {
      return NextResponse.json({
        success: true,
        data: {
          verificationResult: 'error',
          scannedProductId: scannedProductId,
          isMatched: false,
          message: '바코드 체크디지트 검증 실패 (손상된 바코드)',
          errorType: 'INVALID_CHECKSUM',
        },
      })
    }

    // 기대 상품과 스캔한 상품 비교
    const isMatched = scannedProductId === expectedProductId

    if (!isMatched) {
      return NextResponse.json({
        success: true,
        data: {
          verificationResult: 'error',
          scannedProductId: scannedProductId,
          expectedProductId: expectedProductId,
          isMatched: false,
          message: `상품이 일치하지 않습니다. (기대: ${expectedProductId}, 스캔: ${scannedProductId})`,
          errorType: 'PRODUCT_MISMATCH',
          scannedProductName: scannedProduct.name,
          scannedProductCode: scannedProduct.code,
        },
      })
    }

    // 성공 - 검증 기록 저장
    try {
      // 로그 기록 (콘솔에만 저장)
      console.log(`[BARCODE_VERIFICATION] Product: ${scannedProductId}, Assignment: ${assignmentId}, Barcode: ${barcodeData}`)
    } catch (error) {
      console.error('Error saving verification record:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        verificationResult: 'success',
        scannedProductId: scannedProductId,
        expectedProductId: expectedProductId,
        isMatched: true,
        message: '바코드 검증 성공. 상품이 일치합니다.',
        scannedProductName: scannedProduct.name,
        scannedProductCode: scannedProduct.code,
      },
    })
  } catch (error) {
    console.error('Error verifying barcode:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify barcode',
      },
      { status: 500 }
    )
  }
}

/**
 * 체크디지트 계산 함수
 * Luhn 알고리즘 사용
 */
function calculateChecksum(productId: string): number {
  let sum = 0
  let isEven = false

  for (let i = productId.length - 1; i >= 0; i--) {
    let digit = parseInt(productId[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return (10 - (sum % 10)) % 10
}
