# 🚀 입주 가이드 (배포 매뉴얼)

안티그래비티에서 완성된 **'스마트 자습실 시스템 V4'**를 실제 인터넷에 올리는 절차입니다.
현재 코드는 **PostgreSQL (Supabase)** 환경에 맞춰 자동 설정되었습니다.

---

## 📚 배포 가이드 선택

배포 경험에 따라 적합한 가이드를 선택하세요:

- **🔰 초보자용 (추천)**: [DEPLOY_GUIDE_BEGINNER.md](./DEPLOY_GUIDE_BEGINNER.md)
  - 프로그래밍 경험이 없어도 따라할 수 있는 완전한 단계별 가이드
  - 스크린샷 설명, 문제 해결, FAQ 포함
  - 소요 시간: 약 20분

- **⚡ 빠른 참조**: [DEPLOY_QUICK_REFERENCE.md](./DEPLOY_QUICK_REFERENCE.md)
  - 경험자를 위한 핵심 명령어와 체크리스트
  - 소요 시간: 약 10분

- **📖 기본 가이드**: 아래 내용 (현재 문서)
  - 중급 사용자를 위한 표준 배포 절차

---

---

## 1단계: 깃허브(GitHub)로 이사하기

내 컴퓨터의 코드를 인터넷 저장소로 옮깁니다.

1. **GitHub 저장소 생성**
   - [GitHub](https://github.com)에 로그인 후 우측 상단의 `+` -> `New repository` 클릭
   - Repository name: `school-seat-app` (예시)
   - `Create repository` 클릭

2. **코드 업로드 (터미널 명령어)**
   - VS Code 터미널을 열고 다음 명령어를 순서대로 입력하세요.
     *(이미 git이 초기화되어 있다면 중간부터 하셔도 됩니다)*

   ```bash
   git init
   git add .
   git commit -m "V4 Final Release"
   git branch -M main
   git remote add origin https://github.com/[내아이디]/school-seat-app.git
   git push -u origin main
   ```
   *(로그인 창이 뜨면 브라우저를 통해 승인해주세요)*

---

## 2단계: 데이터베이스 개설 (Supabase)

학생 명단과 신청 정보를 저장할 클라우드 DB를 만듭니다.

1. **프로젝트 생성**
   - [Supabase](https://supabase.com) 가입 -> `New Project`
   - Name: `SchoolDB`
   - Password: **강력한 비밀번호** (꼭 기억해두세요!)
   - Region: `Seoul` (있으면 선택, 없으면 Tokyo) -> `Create new project`

2. **중요: 연결 주소 복사**
   - 프로젝트가 만들어지면 `Project Settings` (톱니바퀴) -> `Database` 메뉴로 이동
   - **Connection String** 섹션에서 `URI` 탭 선택
   - 주소를 복사합니다.
     - 형식: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
   - **[YOUR-PASSWORD]** 부분을 아까 설정한 비밀번호로 바꿔두세요. (메모장에 적어두기)

---

## 3단계: 입주 및 간판 달기 (Vercel)

1. **Vercel 프로젝트 생성**
   - [Vercel](https://vercel.com) 로그인 -> `Add New ...` -> `Project`
   - GitHub의 `school-seat-app` 옆 `Import` 클릭

2. **환경 변수 설정 (가장 중요!)**
   - `Environment Variables` 탭 클릭
   - 다음 항목을 추가합니다.

   | Key | Value |
   |-----|-------|
   | **DATABASE_URL** | (아까 메모한 Supabase 연결 주소) |
   | **NEXTAUTH_SECRET** | (아무 영어+숫자 조합 길게 입력, 예: `mysecretkey1234`) |
   | **NEXTAUTH_URL** | (비워두거나, 배포 후 생성된 주소 입력) |
   | **NEXT_PUBLIC_VAPID_PUBLIC_KEY** | (선택: 웹 푸시 알림용, `npx web-push generate-vapid-keys`로 생성) |
   | **VAPID_PRIVATE_KEY** | (선택: 웹 푸시 알림용 Private Key) |
   | **VAPID_SUBJECT** | (선택: `mailto:admin@example.com`) |

3. **Deploy 클릭**
   - `Deploy` 버튼을 누르면 약 1~2분 후 배포가 완료됩니다.

---

## 💡 선생님을 위한 추가 팁

1. **DB 테이블 생성은요?**
   - Vercel이 배포될 때 자동으로 테이블을 생성하도록 설정되어 있지 않을 수 있습니다.
   - 배포 후 사이트가 에러가 난다면, Vercel 대시보드의 `Settings` -> `Build & Development Command`에서
   - Build Command를: `npx prisma db push && next build` 로 수정하고 재배포(Redeploy) 하시면 해결됩니다.

2. **로컬(내 컴퓨터)에서 테스트하려면?**
   - `.env` 파일을 열고 `DATABASE_URL`을 Supabase 주소로 바꾸면, 내 컴퓨터에서도 실제 클라우드 DB를 테스트해볼 수 있습니다.
