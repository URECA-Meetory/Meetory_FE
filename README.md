# Meetory Frontend

STS(Spring Tools) + Gradle로 만든 Meetory 백엔드(Spring Boot, 포트 8080)와
연동하는 React(Vite) 프론트엔드입니다.

## 실행 방법

```bash
npm install
npm run dev
```

- 개발 서버: http://localhost:5173
- `/api`로 시작하는 모든 요청은 `vite.config.js`의 proxy 설정을 통해
  `http://localhost:8080`(Spring Boot)으로 자동 전달됩니다.
  → 백엔드에 별도 CORS 설정을 추가할 필요가 없습니다.
- 백엔드 주소가 다르다면 `VITE_API_TARGET` 환경변수로 바꿀 수 있습니다.
  ```bash
  VITE_API_TARGET=http://localhost:9090 npm run dev
  ```

먼저 STS에서 Spring Boot 애플리케이션(MeetoryApplication)을 8080 포트로 실행한 뒤,
이 프론트엔드를 `npm run dev`로 띄우면 됩니다.

## 화면 구성

| 화면 | 설명 |
| --- | --- |
| 로그인 / 회원가입 | 토글형 카드 UI. `/api/auth/login`, `/api/auth/signup` 사용 |
| 팀 매칭 | 잡코리아 공고 스타일 패널 목록. 카테고리 필터, 모임 개설, 설명 클릭 시 상세 팝업(정원 게이지, 팀원 목록, 리더 전용 신청 수락/거절) |
| 게시판 | 자리만 잡아둔 빈 화면 (추후 구현 예정) |
| 마이페이지 | 로그인된 유저 정보 표시, 로그아웃 |

## 백엔드 API 매핑

| 기능 | 메서드/경로 | 인증 |
| --- | --- | --- |
| 회원가입 | `POST /api/auth/signup` | - |
| 로그인 | `POST /api/auth/login` | - |
| 로그아웃 | `POST /api/auth/logout` | Bearer |
| 모임 목록 | `GET /api/teams` | - |
| 모임 상세 | `GET /api/teams/{teamId}` | - |
| 모임 개설 | `POST /api/teams` | Bearer |
| 모임 신청 | `POST /api/teams/{teamId}/apply` | Bearer |
| 팀원 목록 | `GET /api/teams/{teamId}/members` | - |
| 대기 신청 목록 (리더 전용) | `GET /api/teams/{teamId}/applications` | Bearer |
| 신청 수락 | `POST /api/teams/{teamId}/applications/{memberId}/approve` | Bearer |
| 신청 거절 | `POST /api/teams/{teamId}/applications/{memberId}/reject` | Bearer |

로그인 응답(`accessToken`, `userId`, `nickname`)은 `localStorage`에 저장되고,
이후 요청 시 `Authorization: Bearer {accessToken}` 헤더로 자동 첨부됩니다
(`src/api/client.js`의 `request()` 참고).

## 폴더 구조

```
src/
  api/client.js          모든 백엔드 호출을 모아둔 fetch 래퍼
  context/
    AuthContext.jsx       로그인 상태 (user, login, signup, logout)
    ToastContext.jsx       우측 하단 토스트 알림
  components/
    TeamCard.jsx           목록 패널 카드
    TeamDetailModal.jsx     상세 팝업 (팀원/신청 관리 포함)
    CreateTeamModal.jsx     모임 개설 폼
    Gauge.jsx               정원 게이지(시그니처 UI)
    Modal.jsx               공용 모달 셸
  pages/
    AuthPage.jsx            로그인/회원가입
    TeamMatchPage.jsx       팀 매칭 탭
    BoardPage.jsx           게시판 탭 (빈 화면)
    MyPage.jsx              마이페이지 탭
  styles/
    tokens.css              색상/타이포/모션 디자인 토큰
    global.css               전체 스타일
```

## 다음 단계 아이디어

- 게시판: `Board`, `Post` 엔티티 추가 후 `BoardPage.jsx`에 목록/글쓰기/댓글 UI 연결
- 마이페이지: "내가 신청한 모임", "내가 개설한 모임" 목록을 보여주는 API 추가
- 리프레시 토큰 / accessToken 만료 처리
