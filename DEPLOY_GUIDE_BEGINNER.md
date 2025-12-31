# 🚀 초보자를 위한 완벽 배포 가이드

이 가이드는 프로그래밍 경험이 없는 분들도 **스마트 자습실 시스템**을 인터넷에 배포할 수 있도록 모든 단계를 자세히 설명합니다.

---

## 📋 목차

1. [배포란 무엇인가요?](#배포란-무엇인가요)
2. [필요한 준비물](#필요한-준비물)
3. [1단계: GitHub에 코드 업로드하기](#1단계-github에-코드-업로드하기)
4. [2단계: Supabase 데이터베이스 설정하기](#2단계-supabase-데이터베이스-설정하기)
5. [3단계: Vercel로 웹사이트 배포하기](#3단계-vercel로-웹사이트-배포하기)
6. [4단계: 배포 확인 및 테스트](#4단계-배포-확인-및-테스트)
7. [문제 해결 (트러블슈팅)](#문제-해결-트러블슈팅)
8. [자주 묻는 질문 (FAQ)](#자주-묻는-질문-faq)

---

## 배포란 무엇인가요?

**배포(Deploy)**란 여러분의 컴퓨터에만 있는 프로그램을 **인터넷에 올려서 누구나 접속할 수 있게 만드는 과정**입니다.

### 배포 과정 개요

```
내 컴퓨터의 코드 
    ↓
GitHub (코드 저장소)
    ↓
Vercel (웹 호스팅)
    ↓
인터넷에서 접속 가능! 🎉
```

![배포 프로세스](C:/Users/user/.gemini/antigravity/brain/f8560ee7-904a-412f-a5e5-cbebe05b3663/deployment_process_diagram_1766973304680.png)

### 사용할 서비스들

1. **GitHub** - 코드를 저장하는 곳 (무료)
2. **Supabase** - 데이터베이스 (학생 정보, 좌석 정보 저장) (무료)
3. **Vercel** - 웹사이트를 인터넷에 올려주는 곳 (무료)

> [!NOTE]
> 모든 서비스는 무료 플랜으로 충분히 사용 가능합니다!

---

## 필요한 준비물

배포를 시작하기 전에 다음을 준비해주세요:

### ✅ 체크리스트

- [ ] **이메일 주소** (Gmail 추천)
- [ ] **인터넷 연결**
- [ ] **웹 브라우저** (Chrome, Edge, Firefox 등)
- [ ] **Git 설치** (아래에서 설명)
- [ ] **VS Code 또는 터미널** (명령어 입력용)

### Git 설치 확인 및 설치

#### Windows 사용자

1. **Git 설치 확인**
   - `Win + R` 키를 누르고 `cmd` 입력 후 엔터
   - 다음 명령어 입력:
     ```bash
     git --version
     ```
   - 버전이 표시되면 이미 설치되어 있습니다!
   - `'git'은(는) 내부 또는 외부 명령...` 같은 오류가 나오면 설치가 필요합니다.

2. **Git 설치하기**
   - [https://git-scm.com/download/win](https://git-scm.com/download/win) 접속
   - 다운로드된 파일 실행
   - 모든 옵션은 기본값으로 두고 `Next` → `Install` 클릭
   - 설치 완료 후 컴퓨터 재시작

#### Mac 사용자

터미널을 열고 다음 명령어 입력:
```bash
git --version
```
설치되어 있지 않으면 자동으로 설치 안내가 나옵니다.

---

## 1단계: GitHub에 코드 업로드하기

GitHub는 코드를 저장하고 관리하는 온라인 저장소입니다.

### 1-1. GitHub 계정 만들기

1. **GitHub 웹사이트 접속**
   - [https://github.com](https://github.com) 접속
   
2. **회원가입**
   - 우측 상단의 `Sign up` 클릭
   - 이메일 주소 입력
   - 비밀번호 생성 (최소 15자 또는 8자 + 숫자 + 특수문자)
   - 사용자 이름(Username) 입력 (예: `myschool2024`)
   - 이메일 인증 완료

> [!IMPORTANT]
> **사용자 이름(Username)**은 나중에 사용하므로 꼭 기억해두세요!

### 1-2. GitHub 저장소(Repository) 만들기

1. **새 저장소 생성**
   - GitHub 로그인 후 우측 상단의 `+` 버튼 클릭
   - `New repository` 선택

2. **저장소 설정**
   - **Repository name**: `study-room-system` (원하는 이름 입력)
   - **Description**: `스마트 자습실 좌석 관리 시스템` (선택사항)
   - **Public** 또는 **Private** 선택
     - Public: 누구나 코드를 볼 수 있음
     - Private: 나만 볼 수 있음 (추천)
   - **나머지는 체크하지 않음**
   - `Create repository` 클릭

3. **저장소 주소 복사**
   - 생성된 페이지에서 HTTPS 주소 복사
   - 형식: `https://github.com/[사용자이름]/study-room-system.git`

### 1-3. 코드를 GitHub에 업로드하기

#### VS Code 사용하는 경우

1. **VS Code에서 프로젝트 폴더 열기**
   - VS Code 실행
   - `File` → `Open Folder`
   - `study-room` 폴더 선택

2. **터미널 열기**
   - VS Code 상단 메뉴: `Terminal` → `New Terminal`
   - 또는 단축키: `` Ctrl + ` `` (백틱)

3. **Git 명령어 입력**
   
   아래 명령어를 **하나씩** 입력하고 엔터를 누르세요:

   ```bash
   # Git 초기화 (이미 되어있다면 건너뛰기)
   git init
   ```

   ```bash
   # 모든 파일을 추가
   git add .
   ```

   ```bash
   # 커밋 (저장) - 메시지는 자유롭게 수정 가능
   git commit -m "첫 배포 준비 완료"
   ```

   ```bash
   # 브랜치 이름을 main으로 변경
   git branch -M main
   ```

   ```bash
   # GitHub 저장소 연결 (아래 주소를 본인의 주소로 변경!)
   git remote add origin https://github.com/[사용자이름]/study-room-system.git
   ```

   ```bash
   # GitHub에 업로드
   git push -u origin main
   ```

4. **GitHub 로그인**
   - 명령어 실행 중 로그인 창이 나타나면
   - 브라우저에서 GitHub 계정으로 로그인
   - 권한 승인

5. **업로드 확인**
   - GitHub 저장소 페이지를 새로고침
   - 파일들이 보이면 성공! ✅

> [!TIP]
> 명령어 입력 시 오류가 발생하면 [문제 해결](#문제-해결-트러블슈팅) 섹션을 참고하세요.

#### 명령 프롬프트(CMD) 사용하는 경우

1. **프로젝트 폴더로 이동**
   - `Win + R` 키 누르기
   - `cmd` 입력 후 엔터
   - 다음 명령어로 프로젝트 폴더로 이동:
     ```bash
     cd C:\Users\user\OneDrive\문서\antigravity\study-room
     ```

2. **위의 Git 명령어들을 동일하게 실행**

---

## 2단계: Supabase 데이터베이스 설정하기

데이터베이스는 학생 정보, 좌석 배치, 신청 내역 등을 저장하는 곳입니다.

### 2-1. Supabase 계정 만들기

1. **Supabase 웹사이트 접속**
   - [https://supabase.com](https://supabase.com) 접속

2. **회원가입**
   - `Start your project` 클릭
   - GitHub 계정으로 로그인 (추천) 또는 이메일로 가입
   - 이메일 인증 완료

### 2-2. 새 프로젝트 만들기

1. **프로젝트 생성**
   - 로그인 후 `New Project` 클릭
   - 또는 `+ New project` 버튼 클릭

2. **프로젝트 설정**
   - **Name**: `SchoolStudyRoom` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 입력
     - 예: `MySchool2024!@#$`
     - **⚠️ 중요: 이 비밀번호를 메모장에 꼭 저장하세요!**
   - **Region**: 
     - `Seoul (ap-northeast-2)` (있으면 선택)
     - 없으면 `Tokyo (ap-northeast-1)` 선택
   - **Pricing Plan**: `Free` (무료) 선택
   - `Create new project` 클릭

3. **프로젝트 생성 대기**
   - 약 1~2분 소요됩니다
   - "Setting up project..." 메시지가 사라질 때까지 기다리세요

### 2-3. 데이터베이스 연결 주소 복사하기

1. **설정 메뉴 열기**
   - 좌측 사이드바 하단의 `⚙️ Settings` (톱니바퀴) 클릭
   - `Database` 메뉴 클릭

2. **연결 문자열 복사**
   - 페이지를 아래로 스크롤
   - **Connection string** 섹션 찾기
   - `URI` 탭 선택
   - 주소가 다음과 같은 형식으로 표시됩니다:
     ```
     postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
     ```
   - 복사 버튼 클릭

3. **비밀번호 입력**
   - `[YOUR-PASSWORD]` 부분을 아까 설정한 비밀번호로 **직접 교체**
   - 예시:
     ```
     postgresql://postgres.xxxxxxxxxxxx:MySchool2024!@#$@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
     ```
   - **⚠️ 이 전체 주소를 메모장에 저장하세요!**

> [!CAUTION]
> 데이터베이스 주소와 비밀번호는 절대 다른 사람과 공유하지 마세요!

---

## 3단계: Vercel로 웹사이트 배포하기

Vercel은 웹사이트를 인터넷에 올려주는 서비스입니다.

### 3-1. Vercel 계정 만들기

1. **Vercel 웹사이트 접속**
   - [https://vercel.com](https://vercel.com) 접속

2. **회원가입**
   - `Sign Up` 클릭
   - `Continue with GitHub` 선택 (추천)
   - GitHub 계정으로 로그인
   - Vercel 권한 승인

### 3-2. GitHub 저장소 연결하기

1. **새 프로젝트 만들기**
   - Vercel 대시보드에서 `Add New...` 클릭
   - `Project` 선택

2. **저장소 가져오기**
   - `Import Git Repository` 섹션에서
   - 본인의 GitHub 저장소 `study-room-system` 찾기
   - `Import` 버튼 클릭

> [!NOTE]
> 저장소가 보이지 않으면 `Adjust GitHub App Permissions` 클릭하여 권한을 추가하세요.

### 3-3. 환경 변수 설정하기 (가장 중요!)

환경 변수는 데이터베이스 주소, 비밀 키 등 민감한 정보를 안전하게 저장하는 방법입니다.

1. **Configure Project 페이지에서**
   - `Environment Variables` 섹션 찾기
   - 펼쳐서 열기

2. **필수 환경 변수 3개 추가**

   #### ① DATABASE_URL
   
   - **Key (이름)**: `DATABASE_URL`
   - **Value (값)**: 아까 메모한 Supabase 연결 주소 전체 붙여넣기
     ```
     postgresql://postgres.xxxxxxxxxxxx:MySchool2024!@#$@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
     ```
   - `Add` 버튼 클릭

   #### ② NEXTAUTH_SECRET
   
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: 무작위 문자열 (최소 32자 추천)
     - 예: `my-super-secret-key-for-authentication-2024`
     - 또는 아래 사이트에서 생성: [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
   - `Add` 버튼 클릭

   #### ③ NEXTAUTH_URL
   
   - **Key**: `NEXTAUTH_URL`
   - **Value**: 일단 비워두거나 `https://your-app.vercel.app` 입력
     - 배포 후 실제 주소로 업데이트 예정
   - `Add` 버튼 클릭

   #### ④ 푸시 알림 설정 (중요!)
   
   푸시 알림 기능을 위해 다음 3개의 변수도 추가해야 합니다. 값은 로컬 `.env` 파일에 있는 내용을 그대로 복사하세요.

   - **NEXT_PUBLIC_VAPID_PUBLIC_KEY**
   - **VAPID_PRIVATE_KEY**
   - **VAPID_SUBJECT** (값: `mailto:admin@example.com`)
   - `Add` 버튼 클릭

3. **환경 변수 확인**
   - 3개의 환경 변수가 모두 추가되었는지 확인
   - Environment: `Production`, `Preview`, `Development` 모두 체크되어 있는지 확인

### 3-4. 빌드 설정 (선택사항)

1. **Build and Output Settings**
   - `Build Command`: 기본값 유지 또는 다음으로 변경
     ```
     npx prisma generate && npx prisma db push && next build
     ```
   - `Output Directory`: 기본값 (`.next`) 유지
   - `Install Command`: 기본값 (`npm install`) 유지

> [!TIP]
> 빌드 명령어에 `prisma db push`를 추가하면 배포 시 자동으로 데이터베이스 테이블이 생성됩니다.

### 3-5. 배포하기!

1. **Deploy 버튼 클릭**
   - 모든 설정을 확인했으면
   - 페이지 하단의 `Deploy` 버튼 클릭

2. **배포 진행 상황 확인**
   - 빌드 로그가 실시간으로 표시됩니다
   - 약 2~5분 소요
   - 진행 단계:
     - `Queued` → `Building` → `Deploying` → `Ready`

3. **배포 완료!**
   - 축하 메시지와 함께 웹사이트 주소가 표시됩니다
   - 예: `https://study-room-system.vercel.app`
   - `Visit` 버튼을 클릭하여 사이트 확인

---

## 4단계: 배포 확인 및 테스트

### 4-1. 웹사이트 접속 확인

1. **배포된 주소로 접속**
   - Vercel에서 제공한 주소 클릭
   - 예: `https://study-room-system.vercel.app`

2. **정상 작동 확인**
   - 페이지가 정상적으로 로드되는지 확인
   - 로그인 페이지가 보이는지 확인

### 4-2. NEXTAUTH_URL 업데이트

1. **Vercel 프로젝트 설정으로 이동**
   - Vercel 대시보드에서 프로젝트 선택
   - `Settings` 탭 클릭
   - 좌측 메뉴에서 `Environment Variables` 선택

2. **NEXTAUTH_URL 수정**
   - `NEXTAUTH_URL` 찾기
   - 우측의 `...` (점 3개) 클릭 → `Edit` 선택
   - 실제 배포된 주소로 변경
     ```
     https://study-room-system.vercel.app
     ```
   - `Save` 클릭

3. **재배포**
   - 상단의 `Deployments` 탭 클릭
   - 가장 최근 배포 항목의 `...` 클릭
   - `Redeploy` 선택
   - 확인 후 재배포 완료 대기

### 4-3. 데이터베이스 테이블 확인

1. **Supabase 대시보드 접속**
   - [https://supabase.com](https://supabase.com) 로그인
   - 프로젝트 선택

2. **테이블 확인**
   - 좌측 메뉴에서 `Table Editor` 클릭
   - 다음 테이블들이 생성되었는지 확인:
     - `User`
     - `Student`
     - `Seat`
     - `Application`
     - 등등...

3. **테이블이 없는 경우**
   - Vercel 프로젝트의 `Settings` → `General`
   - `Build & Development Settings` 섹션
   - Build Command를 다음으로 변경:
     ```
     npx prisma generate && npx prisma db push && next build
     ```
   - 재배포 실행

### 4-4. 관리자 계정 생성

1. **초기 관리자 계정 만들기**
   - 배포된 사이트 접속
   - 회원가입 페이지로 이동
   - 관리자 계정 정보 입력:
     - 이메일: `admin@school.com`
     - 비밀번호: 강력한 비밀번호
     - 이름: `관리자`

2. **관리자 권한 부여 (Supabase에서)**
   - Supabase 대시보드 → `Table Editor`
   - `User` 테이블 선택
   - 방금 생성한 사용자 찾기
   - `role` 필드를 `ADMIN`으로 변경
   - 저장

3. **로그인 테스트**
   - 관리자 계정으로 로그인
   - 관리자 페이지 접근 확인

---

## 문제 해결 (트러블슈팅)

### Git 관련 오류

#### 오류: `git is not recognized`

**원인**: Git이 설치되지 않았거나 환경 변수에 등록되지 않음

**해결**:
1. Git 재설치: [https://git-scm.com](https://git-scm.com)
2. 설치 후 컴퓨터 재시작
3. 터미널/CMD 재실행

#### 오류: `fatal: not a git repository`

**원인**: Git이 초기화되지 않은 폴더

**해결**:
```bash
git init
```

#### 오류: `remote origin already exists`

**원인**: 이미 원격 저장소가 연결되어 있음

**해결**:
```bash
# 기존 원격 저장소 제거
git remote remove origin

# 새로 추가
git remote add origin https://github.com/[사용자이름]/study-room-system.git
```

### Vercel 배포 오류

#### 오류: `Build failed`

**원인**: 환경 변수 누락 또는 코드 오류

**해결**:
1. Vercel 프로젝트 → `Settings` → `Environment Variables`
2. 필수 환경 변수 3개 확인:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. 누락된 변수 추가 후 재배포

#### 오류: `Prisma Client could not be generated`

**원인**: Prisma 설정 문제

**해결**:
1. Build Command 변경:
   ```
   npx prisma generate && next build
   ```
2. 재배포

#### 오류: `Database connection failed`

**원인**: DATABASE_URL이 잘못되었거나 Supabase 연결 문제

**해결**:
1. Supabase 프로젝트가 활성화되어 있는지 확인
2. DATABASE_URL의 비밀번호 부분 확인
3. Supabase 대시보드에서 연결 문자열 다시 복사
4. Vercel 환경 변수 업데이트

### 데이터베이스 오류

#### 문제: 테이블이 생성되지 않음

**해결**:
1. **방법 1: Vercel에서 자동 생성**
   - Build Command에 `prisma db push` 추가:
     ```
     npx prisma generate && npx prisma db push && next build
     ```

2. **방법 2: 로컬에서 수동 생성**
   - 로컬 `.env` 파일에 Supabase DATABASE_URL 추가
   - 터미널에서 실행:
     ```bash
     npx prisma db push
     ```

#### 문제: 데이터가 저장되지 않음

**확인 사항**:
1. Supabase 프로젝트가 일시 중지되지 않았는지 확인
2. 무료 플랜 제한 확인 (500MB)
3. 네트워크 연결 확인

---

## 자주 묻는 질문 (FAQ)

### Q1. 배포 비용이 얼마나 드나요?

**A**: 모든 서비스를 무료로 사용할 수 있습니다!

- **GitHub**: 무료 (Public/Private 저장소 무제한)
- **Supabase**: 무료 플랜 (500MB 데이터베이스, 충분함)
- **Vercel**: 무료 플랜 (개인/소규모 프로젝트에 충분)

### Q2. 도메인 주소를 바꿀 수 있나요?

**A**: 네, 가능합니다!

1. **Vercel 무료 도메인 변경**
   - Vercel 프로젝트 → `Settings` → `Domains`
   - 원하는 이름 입력 (예: `myschool-study.vercel.app`)

2. **커스텀 도메인 연결** (선택사항, 유료)
   - 도메인 구매 (예: `myschool.com`)
   - Vercel에서 도메인 연결 설정

### Q3. 학생 수가 많으면 어떻게 하나요?

**A**: 무료 플랜으로도 충분합니다!

- Supabase 무료: 최대 500MB (학생 수천 명 가능)
- Vercel 무료: 월 100GB 대역폭 (일반 학교 충분)
- 초과 시 유료 플랜으로 업그레이드 가능

### Q4. 코드를 수정하면 어떻게 재배포하나요?

**A**: 간단합니다!

1. 로컬에서 코드 수정
2. Git 명령어로 업로드:
   ```bash
   git add .
   git commit -m "수정 내용 설명"
   git push
   ```
3. Vercel이 자동으로 재배포! (약 2분 소요)

### Q5. 데이터베이스 백업은 어떻게 하나요?

**A**: Supabase에서 자동 백업됩니다.

- 무료 플랜: 7일간 백업 보관
- 수동 백업: Supabase 대시보드에서 SQL 덤프 다운로드 가능

### Q6. 보안은 안전한가요?

**A**: 네, 안전합니다!

- HTTPS 자동 적용 (암호화 통신)
- 환경 변수로 민감 정보 보호
- Supabase의 Row Level Security 사용 가능
- 정기적인 비밀번호 변경 권장

### Q7. 여러 학교에서 사용할 수 있나요?

**A**: 네, 가능합니다!

- 각 학교마다 별도 프로젝트 생성
- 또는 멀티테넌시 구조로 개발 (고급)

### Q8. 모바일 앱으로도 만들 수 있나요?

**A**: 현재는 웹 버전이지만, 모바일에서도 사용 가능합니다!

- 반응형 디자인으로 모바일 최적화
- PWA (Progressive Web App)로 설치 가능
- 네이티브 앱 개발은 별도 작업 필요

---

## 🎉 축하합니다!

배포가 완료되었습니다! 이제 인터넷 어디서나 여러분의 스마트 자습실 시스템에 접속할 수 있습니다.

### 다음 단계

1. **학생 데이터 입력**
   - 관리자 페이지에서 학생 정보 등록
   - Excel 파일로 일괄 업로드 가능

2. **좌석 배치 설정**
   - 자습실 좌석 레이아웃 구성
   - 좌석 번호 및 위치 설정

3. **사용자 안내**
   - 학생들에게 웹사이트 주소 공유
   - 사용 방법 안내

4. **모니터링**
   - Vercel 대시보드에서 접속 통계 확인
   - Supabase에서 데이터베이스 상태 확인

---

## 📞 추가 도움이 필요하신가요?

- **GitHub 문서**: [https://docs.github.com](https://docs.github.com)
- **Supabase 문서**: [https://supabase.com/docs](https://supabase.com/docs)
- **Vercel 문서**: [https://vercel.com/docs](https://vercel.com/docs)
- **Next.js 문서**: [https://nextjs.org/docs](https://nextjs.org/docs)

---

> [!TIP]
> 이 가이드를 북마크해두고 필요할 때마다 참고하세요!

**작성일**: 2025-12-29  
**버전**: 1.0.0
