# ⚡ 빠른 배포 참조 가이드

경험자를 위한 간단한 체크리스트입니다.

---

## 📋 배포 체크리스트

### ✅ 사전 준비
- [ ] Git 설치 확인
- [ ] GitHub 계정
- [ ] 이메일 주소

---

## 🚀 3단계 배포

### 1️⃣ GitHub 업로드 (2분)

```bash
# 프로젝트 폴더에서
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/[USERNAME]/[REPO].git
git push -u origin main
```

### 2️⃣ Supabase 설정 (3분)

1. [supabase.com](https://supabase.com) → New Project
2. 프로젝트 생성 (이름, 비밀번호, 지역 선택)
3. Settings → Database → Connection String (URI) 복사
4. `[YOUR-PASSWORD]`를 실제 비밀번호로 교체

**복사할 주소 형식:**
```
postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 3️⃣ Vercel 배포 (5분)

1. [vercel.com](https://vercel.com) → Add New → Project
2. GitHub 저장소 Import
3. **Environment Variables 추가:**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Supabase 연결 주소 (전체) |
| `NEXTAUTH_SECRET` | 무작위 문자열 (32자+) |
| `NEXTAUTH_URL` | `https://[your-app].vercel.app` |

4. **Build Command (권장):**
```bash
npx prisma generate && npx prisma db push && next build
```

5. Deploy 클릭

---

## 🔧 배포 후 설정

### NEXTAUTH_URL 업데이트

1. Vercel → Settings → Environment Variables
2. `NEXTAUTH_URL`을 실제 배포 주소로 변경
3. Redeploy

### 관리자 계정 생성

1. 배포된 사이트에서 회원가입
2. Supabase → Table Editor → User 테이블
3. 해당 사용자의 `role`을 `ADMIN`으로 변경

---

## 🔄 코드 업데이트 방법

```bash
# 코드 수정 후
git add .
git commit -m "Update description"
git push
# Vercel이 자동으로 재배포
```

---

## ⚠️ 자주 발생하는 오류

### Build Failed
→ 환경 변수 3개 모두 확인

### Database Connection Error
→ DATABASE_URL의 비밀번호 부분 확인

### Prisma Error
→ Build Command에 `npx prisma generate` 포함 확인

### 테이블 미생성
→ Build Command에 `npx prisma db push` 추가

---

## 📊 환경 변수 템플릿

```.env
# Supabase Database
DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="https://your-app.vercel.app"
```

---

## 🔗 유용한 링크

- **GitHub**: https://github.com
- **Supabase**: https://supabase.com
- **Vercel**: https://vercel.com
- **Secret Generator**: https://generate-secret.vercel.app/32

---

## 💡 프로 팁

1. **자동 배포**: GitHub에 push하면 Vercel이 자동 배포
2. **Preview 배포**: Pull Request 생성 시 자동 미리보기
3. **환경별 변수**: Production/Preview/Development 별도 설정 가능
4. **도메인 변경**: Vercel Settings → Domains
5. **로그 확인**: Vercel → Deployments → 최근 배포 클릭

---

**전체 소요 시간**: 약 10분  
**난이도**: ⭐⭐☆☆☆

> 더 자세한 설명은 `DEPLOY_GUIDE_BEGINNER.md` 참조
