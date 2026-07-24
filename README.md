# Meetory Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![SpringBoot](https://img.shields.io/badge/API-SpringBoot-6DB33F?logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)

> **Meetory (Meetup + Story)**  
> 관심사가 같은 사람들과 모임을 만들고 참여하며 새로운 이야기를 만들어가는 커뮤니티 플랫폼입니다.

React + Vite 기반으로 개발된 Frontend 프로젝트이며 Spring Boot Backend와 REST API를 통해 통신합니다.

---

# 📌 목차

- 프로젝트 소개
- 기술 스택
- 주요 기능
- 프로젝트 구조
- 실행 방법
- API 연동
- 인증 방식
- 팀원 소개
- 향후 개발 계획

---

# 프로젝트 소개

Meetory는 관심사가 같은 사람들을 연결해주는 모임 플랫폼입니다.

사용자는

- 회원가입
- 로그인
- 온보딩
- 모임 생성
- 모임 참여
- 게시판 이용
- 모임 관리
- 마이페이지
- 쪽지 기능

등을 사용할 수 있습니다.

---

# Tech Stack

## Frontend

- React 19
- Vite 8
- JavaScript (ES6+)
- Context API
- Fetch API
- CSS3
- Lucide React

## Backend

- Spring Boot
- Spring Security
- JPA
- MySQL
- JWT

---

# 주요 기능

## 🔐 로그인 / 회원가입

- 회원가입
- 로그인
- JWT 인증
- 자동 로그인
- 로그아웃

---

## 👤 온보딩

최초 로그인 이후

- 나이 입력
- 성별 선택
- 관심사 선택

사용자 정보를 입력할 수 있습니다.

---

## 👥 모임 모집

- 모임 목록 조회
- 카테고리 필터
- 모임 생성
- 모임 상세 조회
- 팀원 조회
- 모집 인원 Gauge
- 모임 신청

<p align="center">
<img src="https://github.com/user-attachments/assets/227d55fe-1091-4c92-baf5-e8bda15188fa" width="100%">
</p>

<p align="center">
<img src="https://github.com/user-attachments/assets/57aa874c-e25e-4220-87d1-797dacef748b" width="49%">
<img src="https://github.com/user-attachments/assets/ae4cda00-0f34-419f-80c9-69307b8e7496" width="49%">
</p>

---

## ⚙️ 모임 관리

리더 전용 기능

- 신청자 조회
- 신청 승인
- 신청 거절
- 현재 팀원 조회
- 팀 관리 페이지

<p align="center">
<img src="https://github.com/user-attachments/assets/db98d4dd-e169-4d79-a251-01772789781c" width="49%">
<img src="https://github.com/user-attachments/assets/164236c2-134d-4bf0-8be4-9f5bb6b7771e" width="49%">
</p>

---

## 📝 게시판

- 게시글 목록
- 게시글 작성
- 게시글 상세 조회

(Backend API 연동 진행 중)

---

## 💬 마이페이지 / 쪽지

- 내 정보 조회
- 로그아웃
- 읽은 쪽지
- 안 읽은 쪽지
- 쪽지 송수신

<p align="center">
<img src="https://github.com/user-attachments/assets/24cceae5-727b-460e-9f2e-bf3dcbadc98d" width="49%">
<img src="https://github.com/user-attachments/assets/abe46b35-f215-4e0a-ae3b-245b7cfdaabc" width="49%">
</p>

---

# 프로젝트 구조

```
src
│
├── api
│   └── client.js
│
├── assets
│
├── components
│   ├── BoardDetailModal.jsx
│   ├── CreateBoardModal.jsx
│   ├── CreateTeamModal.jsx
│   ├── Gauge.jsx
│   ├── Modal.jsx
│   ├── TeamCard.jsx
│   ├── TeamDetailModal.jsx
│   ├── TeamManageModal.jsx
│   └── UserMenu.jsx
│
├── context
│   ├── AuthContext.jsx
│   └── ToastContext.jsx
│
├── pages
│   ├── AuthPage.jsx
│   ├── BoardPage.jsx
│   ├── MyPage.jsx
│   ├── OnboardingPage.jsx
│   ├── TeamManagePage.jsx
│   └── TeamMatchPage.jsx
│
├── styles
│   ├── global.css
│   └── tokens.css
│
├── App.jsx
├── main.jsx
└── vite.config.js
```

---

# 실행 방법

## 프로젝트 설치

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

브라우저

```
http://localhost:5173
```

---

# Backend 실행

Spring Boot 서버 실행

```
MeetoryApplication
```

기본 주소

```
http://localhost:8080
```

---

# API Proxy

Frontend

```
/api/**
```

↓

Backend

```
http://localhost:8080
```

Backend 주소 변경

```bash
VITE_API_TARGET=http://localhost:9090 npm run dev
```

---

# API 연동

| 기능 | Method | URL |
|------|--------|-----|
| 회원가입 | POST | `/api/auth/signup` |
| 로그인 | POST | `/api/auth/login` |
| 로그아웃 | POST | `/api/auth/logout` |
| 온보딩 | POST | `/api/users/onboarding` |
| 모임 목록 | GET | `/api/teams` |
| 모임 생성 | POST | `/api/teams` |
| 모임 상세 | GET | `/api/teams/{teamId}` |
| 모임 신청 | POST | `/api/teams/{teamId}/apply` |
| 팀원 조회 | GET | `/api/teams/{teamId}/members` |
| 신청 승인 | POST | `/api/teams/{teamId}/applications/{memberId}/approve` |
| 신청 거절 | POST | `/api/teams/{teamId}/applications/{memberId}/reject` |
| 게시글 목록 | GET | `/api/boards` |
| 게시글 작성 | POST | `/api/boards` |

---

# 인증 방식

로그인 성공 시

```
accessToken
userId
nickname
```

을 LocalStorage에 저장합니다.

인증이 필요한 요청은

```
Authorization: Bearer {accessToken}
```

헤더를 자동으로 추가합니다.

---

# 프로젝트 특징

- React Context 기반 인증 관리
- JWT 인증 방식
- Fetch API Wrapper
- 공통 Modal 컴포넌트
- Toast 알림
- Gauge UI
- 반응형 레이아웃
- Hero Banner
- User Menu
- 재사용 가능한 컴포넌트 구조

---

# 👥 팀원

| 이름 | 담당 |
|------|------|
| **이수현** | 로그인 / 회원가입 / 온보딩 / 마이페이지(개인정보) |
| **정문구** | 게시판 |
| **조성원** | 메인 화면 / 모임 모집 / 모임 관리 / 마이페이지(쪽지함) |

---

# 향후 개발 계획

- 게시판 CRUD 고도화
- 댓글 기능
- 검색 기능
- 이미지 업로드
- Refresh Token
- Access Token 자동 재발급
- 실시간 알림
- 무한 스크롤
- 프로필 수정
- 모임 추천 기능

---

# 개발 환경

| 항목 | 버전 |
|------|------|
| Node.js | 20+ |
| npm | 10+ |
| React | 19 |
| Vite | 8 |
| Backend | Spring Boot |
| Database | MySQL |
