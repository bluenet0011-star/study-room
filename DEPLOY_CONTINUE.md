# 💻 새 컴퓨터에서 배포/개발 이어가기 가이드

이 가이드는 **이미 다른 컴퓨터에서 Vercel 배포까지 완료한 프로젝트**를 **새로운 컴퓨터**에서 이어서 작업하고 배포하는 방법을 설명합니다.

---

## 📋 사전 준비 (필수)

새 컴퓨터에서도 작업을 하려면 기본 도구들이 설치되어 있어야 합니다.

### 1. 필수 프로그램 설치
아래 프로그램들이 설치되어 있는지 확인하고, 없으면 설치해주세요.

- **Node.js**: [https://nodejs.org](https://nodejs.org) (LTS 버전 추천)
- **Git**: [https://git-scm.com](https://git-scm.com)
- **VS Code**: [https://code.visualstudio.com](https://code.visualstudio.com)

### 2. 프로젝트 의존성 설치
새 컴퓨터로 파일을 가져왔다면, 아직 라이브러리들이 설치되지 않은 상태일 수 있습니다. ( `node_modules` 폴더는 보통 복사하지 않기 때문입니다.)

1. **VS Code**에서 프로젝트 폴더를 엽니다.
2. **터미널**을 엽니다 (`Ctrl` + `` ` ``).
3. 아래 명령어를 입력하여 필요한 라이브러리를 설치합니다:
   ```bash
   npm install
   ```
   *완료될 때까지 잠시 기다려주세요.*

---

## 🚀 배포 방법 1: Git Push (권장)

가장 쉽고 추천하는 방법입니다. 코드를 수정하고 GitHub에 올리면 **Vercel이 자동으로 감지하여 배포**합니다.

> **확인**: 터미널에 `git remote -v`를 입력했을 때 `origin https://github.com/...` 주소가 나온다면 이미 연결된 상태입니다.

### 사용 방법:

1. **코드 수정**: 원하는 기능을 수정하거나 추가합니다.
2. **저장 및 GitHub 업로드**:
   다음 명령어들을 차례로 입력합니다.
   ```bash
   # 변경사항 확인
   git status

   # 변경사항 담기
   git add .

   # 커밋 (메시지는 상황에 맞게 수정)
   git commit -m "새 컴퓨터에서 작업 내용 수정"

   # GitHub에 업로드 (자동으로 배포 시작됨)
   git push
   ```
3. **배포 확인**: [Vercel 대시보드](https://vercel.com/dashboard)에 접속하면 자동으로 배포가 진행되는 것을 볼 수 있습니다.

---

## 🛠️ 배포 방법 2: Vercel CLI (수동 배포)

GitHub를 거치지 않고 **내 컴퓨터에서 바로 Vercel로 배포**하고 싶을 때 사용합니다.

### 1. Vercel CLI 설치
터미널에 다음 명령어를 입력합니다:
```bash
npm install -g vercel
```

### 2. Vercel 로그인
```bash
npx vercel login
```
*화면 안내에따라 브라우저에서 로그인을 완료해주세요.*

### 3. 프로젝트 연결 (Link)
내 컴퓨터의 폴더를 Vercel의 기존 프로젝트와 연결합니다.
```bash
npx vercel link
```
- 질문이 나오면 다음과 같이 대답합니다:
  - `Set up “...”(경로)?` → `Y` (Yes)
  - `Which scope should contain your project?` → 본인 계정 선택 (엔터)
  - `Link to existing project?` → `Y` (Yes)
  - `What’s the name of your existing project?` → 기존 프로젝트 이름 입력 (예: `study-room-system`)

### 4. 배포하기
- **테스트 배포** (미리보기):
  ```bash
  npx vercel
  ```
- **실제 배포** (서비스 적용):
  ```bash
  npx vercel --prod
  ```

---

## ⚡ 꿀팁: 환경 변수 가져오기

새 컴퓨터에는 `.env` 파일(비밀키 등)이 없을 수 있습니다. Vercel에 저장된 환경 변수를 내 컴퓨터로 가져오면 개발이 편리해집니다.

```bash
npx vercel env pull .env.production.local
```
이 명령어를 실행하면 Vercel에 설정해둔 `DATABASE_URL` 등을 자동으로 다운로드하여 로컬 파일로 만들어줍니다.

---

## 요약

1. **`npm install`**로 라이브러리 설치하기.
2. 평소에는 **코드 수정** → **`git push`**만 하면 끝!
3. 급할 때는 **`npx vercel --prod`** 사용 가능.
