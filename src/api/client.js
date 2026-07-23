// 백엔드의 ApiResponse<T> = { success, message, data } 포맷을 그대로 사용한다.
// 개발 서버에서는 vite.config.js의 proxy 설정으로 /api 요청이 Spring Boot(8080)로 전달된다.

const TOKEN_KEY = "meetory.accessToken";
const USER_KEY = "meetory.user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function storeSession(accessToken, userId, nickname) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify({ userId, nickname }));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
  }

  let res;
  try {
    res = await fetch("/api" + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError("서버에 연결할 수 없습니다. 백엔드(8080)가 실행 중인지 확인해주세요.", 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* 본문이 없는 응답 (204 등) */
  }

  if (!res.ok) {
    const message = json?.message || `요청에 실패했습니다 (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return json?.data;
}

// ---------------- Auth ----------------
export const authApi = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST", auth: true }),
};

// ---------------- Teams ----------------
export const teamApi = {
  list: () => request("/teams"),
  myTeams: () => request("/teams/my", { auth: true }),
  detail: (teamId) => request(`/teams/${teamId}`),
  create: (payload) => request("/teams", { method: "POST", body: payload, auth: true }),
  apply: (teamId) => request(`/teams/${teamId}/apply`, { method: "POST", auth: true }),
  members: (teamId) => request(`/teams/${teamId}/members`, { auth: true }),
  applications: (teamId) => request(`/teams/${teamId}/applications`, { auth: true }),
  approve: (teamId, memberId) =>
    request(`/teams/${teamId}/applications/${memberId}/approve`, { method: "POST", auth: true }),
  reject: (teamId, memberId) =>
    request(`/teams/${teamId}/applications/${memberId}/reject`, { method: "POST", auth: true }),
  leave: (teamId) => request(`/teams/${teamId}/leave`, { method: "DELETE", auth: true }),
};

// ---------------- Messages (모임장 문의 쪽지) ----------------
export const messageApi = {
  // 팀 매칭 화면 "문의하기" -> 모임 리더에게 최초 쪽지 전송
  sendInquiry: (teamId, payload) =>
    request(`/messages/teams/${teamId}/inquiry`, { method: "POST", body: payload, auth: true }),
  // 마이페이지 - 내 쪽지함(안읽음/읽음)
  inbox: () => request("/messages/threads", { auth: true }),
  // 쪽지 클릭 -> 채팅형 대화 전체 (읽음 처리 포함)
  threadDetail: (threadId) => request(`/messages/threads/${threadId}`, { auth: true }),
  // 채팅 입력창 -> 전송(답장)
  reply: (threadId, payload) =>
    request(`/messages/threads/${threadId}/reply`, { method: "POST", body: payload, auth: true }),
};

// ---------------- Boards ----------------
export const boardApi = {
  list: () => request("/boards", { auth: true }),
  detail: (boardId) => request(`/boards/${boardId}`, { auth: true }),
  create: (payload) => request("/boards", { method: "POST", body: payload, auth: true }),
  update: (boardId, payload) => request(`/boards/${boardId}`, { method: "PUT", body: payload, auth: true }),
  delete: (boardId) => request(`/boards/${boardId}`, { method: "DELETE", auth: true }),
};

export { ApiError };
