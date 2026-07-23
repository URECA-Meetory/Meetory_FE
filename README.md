# Meetory Frontend

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![SpringBoot](https://img.shields.io/badge/API-SpringBoot-6DB33F)
![License](https://img.shields.io/badge/Project-URECA-blue)

> **Meetory (Meetup + Story)**  
> 관심사가 같은 사람들과 모임을 만들고, 참여하며 새로운 이야기를 만들어가는 커뮤니티 플랫폼입니다.

React(Vite) 기반의 Meetory Frontend입니다.  
Spring Boot Backend와 REST API를 통해 통신하며 모임 생성, 참여, 로그인, 마이페이지 등의 기능을 제공합니다.

---

# Tech Stack

### Frontend

- React
- Vite
- JavaScript (ES6+)
- Context API
- CSS

### Backend

- Spring Boot
- Spring Security
- JPA
- MySQL

---

# 실행 방법

## 1. 프로젝트 설치

```bash
npm install
```

## 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버

```
http://localhost:5173
```

---

# Backend 실행

먼저 Spring Boot 서버를 실행합니다.

```
MeetoryApplication
```

기본 주소

```
http://localhost:8080
```

---

# API Proxy

프론트에서는 `/api`로 시작하는 요청을 자동으로 Spring Boot 서버로 전달합니다.

```
/api/**
        ↓
http://localhost:8080
```

별도의 CORS 설정 없이 개발 가능합니다.

백엔드 주소를 변경하려면

```bash
VITE_API_TARGET=http://localhost:9090 npm run dev
```

---

# 주요 기능

## 로그인 / 회원가입

- 회원가입
- 로그인
- JWT Access Token 저장
- 자동 로그인 상태 유지
- 로그아웃


---

## 모임 모집

- 모임 목록 조회
- 카테고리 필터
- 모임 생성
- 상세 조회
- 팀원 목록 조회
- 정원 게이지 표시
- 모임 신청
- 리더 전용 신청 승인 / 거절
<img width="1900" height="900" alt="image" src="https://github.com/user-attachments/assets/227d55fe-1091-4c92-baf5-e8bda15188fa" />
<img width="1900" height="900" alt="image" src="https://github.com/user-attachments/assets/57aa874c-e25e-4220-87d1-797dacef748b" />
<img width="1900" height="900" alt="image" src="https://github.com/user-attachments/assets/ae4cda00-0f34-419f-80c9-69307b8e7496" />

---

## 게시판

현재 UI만 구성되어 있으며 추후 구현 예정입니다.

---

## 마이페이지 & 쪽지함

- 로그인한 사용자 정보 조회
- 로그아웃
- 안 읽은 쪽지
- 읽은 쪽지
- 쪽지 송신 및 수신 기능
<img width="1917" height="907" alt="image" src="https://github.com/user-attachments/assets/68281801-bfbb-4328-9501-2e0c33c39357" />

---

# API 연동

| 기능 | Method | URL |
|------|--------|-----|
| 회원가입 | POST | `/api/auth/signup` |
| 로그인 | POST | `/api/auth/login` |
| 로그아웃 | POST | `/api/auth/logout` |
| 모임 목록 | GET | `/api/teams` |
| 모임 상세 | GET | `/api/teams/{teamId}` |
| 모임 생성 | POST | `/api/teams` |
| 모임 신청 | POST | `/api/teams/{teamId}/apply` |
| 팀원 조회 | GET | `/api/teams/{teamId}/members` |
| 신청 목록 | GET | `/api/teams/{teamId}/applications` |
| 신청 승인 | POST | `/api/teams/{teamId}/applications/{memberId}/approve` |
| 신청 거절 | POST | `/api/teams/{teamId}/applications/{memberId}/reject` |

---

# 인증 방식

로그인 성공 시

```
accessToken
userId
nickname
```

를 `localStorage`에 저장합니다.

이후 모든 인증이 필요한 요청에는

```
Authorization: Bearer {accessToken}
```

헤더가 자동으로 추가됩니다.

관련 코드는

```
src/api/client.js
```

에서 관리합니다.

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
│   ├── CreateTeamModal.jsx
│   ├── Gauge.jsx
│   ├── Modal.jsx
│   ├── TeamCard.jsx
│   └── TeamDetailModal.jsx
│
├── context
│   ├── AuthContext.jsx
│   └── ToastContext.jsx
│
├── pages
│   ├── AuthPage.jsx
│   ├── BoardPage.jsx
│   ├── MyPage.jsx
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

# 프로젝트 특징

- React Context를 이용한 로그인 상태 관리
- Fetch Wrapper를 이용한 API 통신
- JWT 기반 인증
- Toast 알림 시스템
- 공용 Modal 컴포넌트
- 정원 Gauge UI
- 잡코리아 스타일의 모임 리스트 UI
- 반응형 레이아웃

---

# 향후 개발 계획

- 게시판 CRUD
- 댓글 기능
- 내가 만든 모임
- 내가 신청한 모임
- 프로필 수정
- Refresh Token 적용
- Access Token 자동 재발급
- 이미지 업로드
- 검색 기능
- 무한 스크롤
- 알림 기능

---

# 개발 환경

| 항목 | 버전 |
|------|------|
| Node.js | 20+ 권장 |
| npm | 10+ |
| React | Vite 기반 |
| Backend | Spring Boot |
| Database | MySQL |
