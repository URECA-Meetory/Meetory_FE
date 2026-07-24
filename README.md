# <a name="meetory-frontend"></a>Meetory Frontend
React Vite JavaScript SpringBoot MySQL

**Meetory (Meetup + Story)**\
관심사가 같은 사람들과 모임을 만들고 참여하며 새로운 이야기를 만들어가는 커뮤니티 플랫폼입니다.

React + Vite 기반으로 개발된 Frontend 프로젝트이며 Spring Boot Backend와 REST API를 통해 통신합니다.

-----
# <a name="목차"></a>📌 목차
- 프로젝트 소개
- 기술 스택
- 주요 기능
- 프로젝트 구조
- 실행 방법
- API 연동
- 인증 방식
- 팀원 소개
- 향후 개발 계획
-----
# <a name="프로젝트-소개"></a>프로젝트 소개
Meetory는 관심사가 같은 사람들을 연결해주는 모임 플랫폼입니다.

사용자는 다음 기능을 이용할 수 있습니다.

- 회원가입
- 이메일 중복 확인
- 로그인
- 온보딩
- 모임 생성
- 모임 참여
- 모임 탈퇴
- 모임 관리
- 게시판
- 마이페이지
- 쪽지 기능
-----
# <a name="tech-stack"></a>Tech Stack
## <a name="frontend"></a>Frontend
- React 19
- Vite 8
- JavaScript ES6+
- Context API
- Fetch API
- CSS3
- Lucide React
## <a name="backend"></a>Backend
- Spring Boot 4.1
- Spring Security
- Spring Data JPA
- MySQL
- JWT
-----
# <a name="주요-기능"></a>주요 기능
## <a name="로그인-회원가입"></a>🔐 로그인 / 회원가입
- 이메일 중복 확인
- 회원가입
- 로그인
- JWT 인증
- 자동 로그인
- 로그아웃

로그인 성공 시 Backend에서 발급한 JWT Access Token을 저장하고, 이후 API 요청에 자동으로 인증 헤더를 추가합니다.

-----
## <a name="온보딩"></a>👤 온보딩
최초 로그인 이후 사용자는 다음 정보를 입력할 수 있습니다.

- 나이
- 성별
- 관심사

또한 온보딩을 건너뛸 수 있습니다.

-----
## <a name="모임-모집"></a>👥 모임 모집
- 모임 목록 조회
- 카테고리 필터
- 모임 생성
- 모임 상세 조회
- 팀원 조회
- 모집 인원 Gauge
- 모임 신청
- 모임 탈퇴



-----
## <a name="모임-관리"></a>⚙️ 모임 관리
모임 리더는 다음 기능을 사용할 수 있습니다.

- 내가 속한 모임 조회
- 신청자 조회
- 신청 승인
- 신청 거절
- 현재 팀원 조회



-----
## <a name="게시판"></a>📝 게시판
- 게시글 목록
- 게시글 작성
- 게시글 상세 조회
- 게시글 수정
- 게시글 삭제

Backend의 /api/boards REST API와 연동됩니다.

-----
## <a name="마이페이지-쪽지"></a>💬 마이페이지 / 쪽지
- 내 정보 조회
- 닉네임 변경
- 비밀번호 변경
- 회원 탈퇴
- 로그아웃
- 쪽지함 조회
- 읽지 않은 쪽지 확인
- 대화 상세 조회
- 쪽지 답장



-----
# <a name="프로젝트-구조"></a>프로젝트 구조
src\
│\
├── api\
│   └── client.js\
│\
├── assets\
│   ├── hero.png\
│   ├── react.svg\
│   └── vite.svg\
│\
├── components\
│   ├── BoardDetailModal.jsx\
│   ├── CreateBoardModal.jsx\
│   ├── CreateTeamModal.jsx\
│   ├── Gauge.jsx\
│   ├── Modal.jsx\
│   ├── TeamCard.jsx\
│   ├── TeamDetailModal.jsx\
│   ├── TeamManageModal.jsx\
│   └── UserMenu.jsx\
│\
├── context\
│   ├── AuthContext.jsx\
│   └── ToastContext.jsx\
│\
├── pages\
│   ├── AuthPage.jsx\
│   ├── BoardPage.jsx\
│   ├── MyPage.jsx\
│   ├── OnboardingPage.jsx\
│   ├── TeamManagePage.jsx\
│   └── TeamMatchPage.jsx\
│\
├── styles\
│   ├── global.css\
│   └── tokens.css\
│\
├── App.jsx\
├── App.css\
├── index.css\
└── main.jsx

-----
# <a name="실행-방법"></a>실행 방법
## <a name="프로젝트-설치"></a>프로젝트 설치
npm install

-----
## <a name="개발-서버-실행"></a>개발 서버 실행
npm run dev

브라우저

http://localhost:5173

-----
## <a name="production-build"></a>Production Build
npm run build

-----
## <a name="lint"></a>Lint
npm run lint

-----
## <a name="preview"></a>Preview
npm run preview

-----
# <a name="backend-실행"></a>Backend 실행
Spring Boot Backend를 먼저 실행합니다.

MeetoryApplication

Backend 기본 주소

http://localhost:8080

이후 Frontend 개발 서버를 실행합니다.

npm run dev

-----
# <a name="api-proxy"></a>API Proxy
Frontend의 /api/\*\* 요청은 Vite Proxy를 통해 Backend로 전달됩니다.

Frontend\
/api/\*\*\
`    `↓\
Vite Proxy\
`    `↓\
http://localhost:8080\
`    `↓\
Spring Boot Backend

Backend 주소 변경

VITE\_API\_TARGET=http://localhost:9090 npm run dev

-----
# <a name="api-연동"></a>API 연동
## <a name="auth"></a>Auth

|기능|Method|URL|
| :- | :- | :- |
|이메일 중복 확인|GET|/api/auth/check-email|
|회원가입|POST|/api/auth/signup|
|로그인|POST|/api/auth/login|
|로그아웃|POST|/api/auth/logout|

-----
## <a name="user"></a>User

|기능|Method|URL|
| :- | :- | :- |
|내 정보 조회|GET|/api/users/me|
|닉네임 변경|PATCH|/api/users/me|
|온보딩 저장|PUT|/api/users/me/onboarding|
|온보딩 건너뛰기|POST|/api/users/me/onboarding/skip|
|비밀번호 변경|PUT|/api/users/me/password|
|회원 탈퇴|DELETE|/api/users/me|

-----
## <a name="team"></a>Team

|기능|Method|URL|
| :- | :- | :- |
|모임 목록|GET|/api/teams|
|모임 상세|GET|/api/teams/{teamId}|
|모임 생성|POST|/api/teams|
|내가 속한 모임|GET|/api/teams/my|
|모임 신청|POST|/api/teams/{teamId}/apply|
|모임 탈퇴|DELETE|/api/teams/{teamId}/leave|
|팀원 조회|GET|/api/teams/{teamId}/members|
|신청자 조회|GET|/api/teams/{teamId}/applications|
|신청 승인|POST|/api/teams/{teamId}/applications/{memberId}/approve|
|신청 거절|POST|/api/teams/{teamId}/applications/{memberId}/reject|

-----
## <a name="board"></a>Board

|기능|Method|URL|
| :- | :- | :- |
|게시글 목록|GET|/api/boards|
|게시글 상세|GET|/api/boards/{boardId}|
|게시글 작성|POST|/api/boards|
|게시글 수정|PUT|/api/boards/{boardId}|
|게시글 삭제|DELETE|/api/boards/{boardId}|

-----
## <a name="message"></a>Message

|기능|Method|URL|
| :- | :- | :- |
|모임 문의|POST|/api/messages/teams/{teamId}/inquiry|
|쪽지함 조회|GET|/api/messages/threads|
|대화 상세 조회|GET|/api/messages/threads/{threadId}|
|답장 전송|POST|/api/messages/threads/{threadId}/reply|

-----
# <a name="인증-방식"></a>인증 방식
로그인 성공 시 다음 정보를 저장합니다.

accessToken\
userId\
nickname

인증이 필요한 요청은 다음 헤더를 사용합니다.

Authorization: Bearer {accessToken}

src/api/client.js의 공통 Request Wrapper에서 Access Token을 자동으로 추가합니다.

Request\
`  `↓\
accessToken 확인\
`  `↓\
Authorization Header 추가\
`  `↓\
Backend API 요청

-----
# <a name="상태-관리"></a>상태 관리
## <a name="authcontext"></a>AuthContext
로그인 상태를 전역으로 관리합니다.

주요 기능

- 현재 사용자 정보
- 로그인
- 회원가입
- 로그아웃
- 인증 상태 확인
-----
## <a name="toastcontext"></a>ToastContext
사용자에게 다음과 같은 알림을 제공합니다.

- 성공 메시지
- 오류 메시지
- API 처리 결과 안내
-----
# <a name="프로젝트-특징"></a>프로젝트 특징
- React Context 기반 인증 관리
- JWT 인증 방식
- Fetch API Wrapper
- Vite Proxy 기반 Backend 연동
- 공통 Modal 컴포넌트
- Toast 알림
- Gauge UI
- 반응형 레이아웃
- Hero Banner
- User Menu
- 재사용 가능한 컴포넌트 구조
-----
# <a name="팀원"></a>👥 팀원

|이름|담당|
| :- | :- |
|**이수현**|로그인 / 회원가입 / 온보딩 / 마이페이지 개인정보|
|**정문구**|게시판|
|**조성원**|메인 화면 / 모임 모집 / 모임 관리 / 마이페이지 쪽지함|

-----
# <a name="향후-개발-계획"></a>향후 개발 계획
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
-----
# <a name="개발-환경"></a>개발 환경

|항목|버전|
| :- | :- |
|Node.js|20+|
|npm|10+|
|React|19|
|Vite|8|
|Java|21|
|Spring Boot|4\.1|
|MySQL|8\.x|

