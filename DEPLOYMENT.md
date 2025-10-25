# WMS Workflow System - Deployment Guide

## Vercel 배포 가이드

### 1. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

**Settings → Environment Variables**

```
DATABASE_URL: postgresql://neondb_owner:npg_WrHU1f6sMxaP@ep-falling-fog-a1m4jhjg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Environments**: Production, Preview, Development 모두 체크

### 2. 빌드 및 배포

모든 환경 변수 설정 후:

```bash
# CLI를 통한 재배포
vercel deploy --prod --force

# 또는 대시보드에서 Redeploy 버튼 클릭
```

### 3. 배포 상태 확인

- Vercel Deployments 페이지에서 배포 상태 확인
- 배포 완료 후 API 테스트:
  ```bash
  curl https://wms-wireframe.vercel.app/api/inbound/schedule?view=list&page=1&limit=1
  ```

### 4. 로컬 개발

로컬에서 테스트할 때는:

```bash
# .env 파일이 자동으로 로드됨
npm run dev

# API 테스트
curl http://localhost:3000/api/inbound/schedule?view=list&page=1&limit=1
```

## 주요 변경사항

- ✅ 로컬 개발 환경: DATABASE_URL 자동 로드
- ✅ 프로덕션: Vercel 환경 변수 설정 필요
- ✅ Prisma: postinstall에서 자동으로 client 생성
- ✅ Next.js: 빌드 전에 prisma generate 실행

---

**Status**: 로컬 완벽 ✅ | 프로덕션 DATABASE_URL 설정 필요 ⚠️
