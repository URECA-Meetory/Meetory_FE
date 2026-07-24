# Meetory Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![SpringBoot](https://img.shields.io/badge/API-SpringBoot-6DB33F?logo=springboot&logoColor=white)

> Meetory의 화면(SPA)을 담당하는 React + Vite 프론트엔드입니다. Spring Boot Backend와 REST API로 통신합니다.
>
> 서비스 전체 소개는 [Organization README](./README-organization.md)를, API 명세/도메인 모델 등 백엔드 세부 사항은 [Backend README](./README-backend.md)를 참고해 주세요.

---

## 목차

- [주요 화면](#주요-화면)
- [프로젝트 구조](#프로젝트-구조)
- [실행 방법](#실행-방법)
- [API 연동](#api-연동)
- [인증 방식](#인증-방식)
- [주요 컴포넌트 / 페이지 설명](#주요-컴포넌트--페이지-설명)
- [프론트엔드 특징](#프론트엔드-특징)
- [개발 환경](#개발-환경)

---

## 주요 화면

| 화면 | 설명 |
| --- | --- |
| 로그인 / 회원가입 | 토글형 카드 UI. 이메일 중복 확인, 회원가입, 로그인 |
| 온보딩 | 최초 로그인 후 나이 / 성별 / 관심사 입력(건너뛰기 가능) |
| 팀 매칭 | 잡코리아 공고 스타일 패널 목록. 카테고리 필터, 모임 개설, 설명 클릭 시 상세 팝업(정원 게이지, 팀원 목록, 리더 전용 신청 수락/거절), 모임장 문의(쪽지) |
| 모임 관리 | 리더 전용 - 내가 속한 모임 목록, 신청자 승인/거절, 팀원 조회 |
| 게시판 | 게시글 목록/작성/상세 |
| 마이페이지 | 로그인된 유저 정보, 닉네임/비밀번호 변경, 받은 쪽지함(안읽음/읽음), 로그아웃 |

---

## 프로젝트 구조

```
src
│
├── api
│   └── client.js               # 백엔드 호출을 모아둔 fetch 래퍼
│
├── assets
│
├── components
│   ├── BoardDetailModal.jsx     게시글 상세 팝업
│   ├── CreateBoardModal.jsx     게시글 작성 팝업
│   ├── CreateTeamModal.jsx      모임 개설 폼
│   ├── Gauge.jsx                정원 게이지(시그니처 UI)
│   ├── Modal.jsx                공용 모달 셸
│   ├── TeamCard.jsx             목록 패널 카드
│   ├── TeamDetailModal.jsx      모임 상세 팝업
│   ├── TeamManageModal.jsx      모임 관리(신청 수락/거절, 팀원) 팝업
│   └── UserMenu.jsx             우측 상단 유저 메뉴(드롭다운)
│
├── context
│   ├── AuthContext.jsx          로그인 상태 (user, login, signup, logout)
│   └── ToastContext.jsx         우측 하단 토스트 알림
│
├── pages
│   ├── AuthPage.jsx             로그인 / 회원가입
│   ├── BoardPage.jsx            게시판 탭
│   ├── MyPage.jsx               마이페이지(개인정보 + 쪽지함)
│   ├── OnboardingPage.jsx       온보딩(나이/성별/관심사)
│   ├── TeamManagePage.jsx       모임 관리 탭
│   └── TeamMatchPage.jsx        팀 매칭 탭
│
├── styles
│   ├── global.css
│   └── tokens.css               색상/타이포/모션 디자인 토큰
│
├── App.jsx
├── main.jsx
└── vite.config.js
```

---

## 실행 방법

### 사전 준비

- Node.js 20+
- 백엔드(Spring Boot, 기본 포트 8080)가 함께 실행되어 있어야 합니다. 실행 방법은 [Backend README](./README-backend.md)를 참고하세요.

### 설치 및 개발 서버 실행

```bash
npm install
npm run dev
```

- 개발 서버: `http://localhost:5173`
- `/api`로 시작하는 모든 요청은 `vite.config.js`의 proxy 설정을 통해 `http://localhost:8080`(Spring Boot)으로 자동 전달됩니다. → 백엔드에 별도 CORS 설정을 추가하지 않아도 로컬 개발이 가능합니다.
- 백엔드 주소가 다르다면 `VITE_API_TARGET` 환경변수로 바꿀 수 있습니다.
  ```bash
  VITE_API_TARGET=http://localhost:9090 npm run dev
  ```

### 그 외 스크립트

```bash
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint       # oxlint 실행
```

---

## API 연동

`src/api/client.js`가 모든 백엔드 호출을 도메인별(`authApi`, `userApi`, `teamApi`, `messageApi`, `boardApi`)로 모아둔 fetch 래퍼입니다. 백엔드 공통 응답 규격 `ApiResponse<T> = { success, message, data }`를 그대로 사용하며, 실패 시 `ApiResponse.message`를 담은 `ApiError`를 던집니다.

전체 엔드포인트 목록과 요청/응답 상세는 [Backend README의 API 명세](./README-backend.md#api-명세)를 참고해 주세요. 프론트에서 사용하는 대표 API는 다음과 같습니다.

| 기능 | Method | URL |
|------|--------|-----|
| 로그인 | POST | `/api/auth/login` |
| 회원가입 | POST | `/api/auth/signup` |
| 온보딩 | PUT | `/api/users/me/onboarding` |
| 모임 목록 | GET | `/api/teams` |
| 모임 개설 | POST | `/api/teams` |
| 모임 신청 | POST | `/api/teams/{teamId}/apply` |
| 신청 승인 / 거절 | POST | `/api/teams/{teamId}/applications/{memberId}/approve`, `/reject` |
| 쪽지함 조회 | GET | `/api/messages/threads` |
| 게시글 목록 / 작성 | GET / POST | `/api/boards` |

---

## 인증 방식

- 로그인 성공 시 응답으로 받은 `accessToken`, `userId`, `nickname`을 `localStorage`에 저장합니다.
- 인증이 필요한 요청에는 `Authorization: Bearer {accessToken}` 헤더가 `api/client.js`에서 자동으로 추가됩니다.
- `AuthContext`가 앱 전역의 로그인 상태를 관리하며, 로그인 시마다 팀 매칭 탭으로 자동 이동하도록 처리되어 있습니다.
- 로그아웃 시 백엔드 로그아웃 API 호출과 별개로 클라이언트 세션(`localStorage`)은 항상 정리됩니다.

---

## 주요 컴포넌트 / 페이지 설명

- **`api/client.js`** — 인증 토큰 첨부, 에러 파싱(`ApiError`)을 포함한 공용 fetch 래퍼
- **`context/AuthContext.jsx`** — 로그인 상태, 로그인/회원가입/로그아웃 액션 제공
- **`context/ToastContext.jsx`** — 성공/실패 토스트 알림
- **`components/Gauge.jsx`** — 모임 정원 대비 현재 인원을 보여주는 시그니처 UI(70% 이상 경고색, 100% 마감색)
- **`components/TeamDetailModal.jsx` / `TeamManageModal.jsx`** — 모임 상세 열람과 리더의 신청 관리(승인/거절)를 각각 담당
- **`pages/OnboardingPage.jsx`** — 최초 로그인 사용자에게 노출되는 추가 정보 입력 화면

---

## 프론트엔드 특징

- React Context 기반 인증/토스트 상태 관리
- JWT 인증 방식과 자동 헤더 첨부
- Fetch API 기반 공통 래퍼(`api/client.js`)로 도메인별 API 모듈화
- 공통 Modal 컴포넌트 및 재사용 가능한 UI(Gauge, Toast 등)
- 잡코리아 공고 스타일의 패널형 모임 목록 UI
- 반응형 레이아웃

---

## 개발 환경

| 항목 | 버전 |
|------|------|
| Node.js | 20+ |
| npm | 10+ |
| React | 19 |
| Vite | 8 |
| Backend | Spring Boot 4 (localhost:8080) |
| Database | MySQL 8 |
