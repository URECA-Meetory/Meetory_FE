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

export function storeSession(accessToken, user) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
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

let onUnauthorized = null;
let authEpoch = 0;

export function nextAuthEpoch() {
  authEpoch += 1;
  return authEpoch;
}

export function getAuthEpoch() {
  return authEpoch;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = "GET", body, auth = false, skipAuthRedirect = false } = {}) {
  const requestEpoch = getAuthEpoch();
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError("로그인이 필요합니다. 다시 로그인해주세요.", 401);
    }
    headers["Authorization"] = "Bearer " + token;
  }

  let res;
  try {
    res = await fetch("/api" + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("서버에 연결할 수 없습니다. 백엔드(8080)가 실행 중인지 확인해주세요.", 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* 본문이 없는 응답 (204 등) */
  }

  if (!res.ok) {
    if (res.status === 401 && auth && !skipAuthRedirect && onUnauthorized) {
      if (requestEpoch === getAuthEpoch()) {
        onUnauthorized();
      }
    }
    let message = json?.message || `요청에 실패했습니다 (${res.status})`;
    if (res.status === 401 && !auth && (path === "/boards" || path.startsWith("/boards/"))) {
      message = "게시판 API 인증 오류입니다. IDE 백엔드를 끄고 최신 백엔드(8080)를 실행해주세요.";
    } else if (res.status === 401 && path.startsWith("/users/me")) {
      message = "로그인 세션이 만료되었거나 백엔드 버전이 맞지 않습니다. localStorage를 지우고 최신 백엔드로 다시 로그인해주세요.";
    }
    throw new ApiError(message, res.status);
  }
  return json?.data;
}

// ---------------- Auth ----------------
export const authApi = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST", auth: true, skipAuthRedirect: true }),
};

// ---------------- Profile ----------------
export const userApi = {
  getProfile: ({ skipAuthRedirect = false } = {}) =>
    request("/users/me", { auth: true, skipAuthRedirect }),
  updateNickname: (nickname) =>
    request("/users/me", { method: "PATCH", body: { nickname }, auth: true }),
  updatePassword: (currentPassword, newPassword) =>
    request("/users/me/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
      auth: true,
    }),
  completeOnboarding: (payload, { skipAuthRedirect = true } = {}) =>
    request("/users/me/onboarding", { method: "PUT", body: payload, auth: true, skipAuthRedirect }),
  skipOnboarding: ({ skipAuthRedirect = true } = {}) =>
    request("/users/me/onboarding/skip", { method: "POST", auth: true, skipAuthRedirect }),
  deleteAccount: (password) =>
    request("/users/me", { method: "DELETE", body: { password }, auth: true, skipAuthRedirect: true }),
};

// ---------------- Boards ----------------
export const boardApi = {
  list: () => request("/boards"),
  detail: (boardId) => request(`/boards/${boardId}`),
  create: (payload) =>
    request("/boards", { method: "POST", body: payload, auth: true, skipAuthRedirect: true }),
  update: (boardId, payload) =>
    request(`/boards/${boardId}`, { method: "PUT", body: payload, auth: true, skipAuthRedirect: true }),
  remove: (boardId) =>
    request(`/boards/${boardId}`, { method: "DELETE", auth: true, skipAuthRedirect: true }),
  createComment: (boardId, payload) =>
    request(`/boards/${boardId}/comments`, { method: "POST", body: payload, auth: true, skipAuthRedirect: true }),
  deleteComment: (boardId, commentId) =>
    request(`/boards/${boardId}/comments/${commentId}`, { method: "DELETE", auth: true, skipAuthRedirect: true }),
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
  remove: (teamId) =>
    request(`/teams/${teamId}`, { method: "DELETE", auth: true, skipAuthRedirect: true }),
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

export { ApiError };

export async function checkBackendHealth() {
  try {
    const data = await request("/health");
    const features = data?.features ?? [];
    return {
      ok: data?.status === "ok",
      version: data?.version ?? null,
      hasBoards: features.includes("boards"),
      hasOnboarding: features.includes("onboarding"),
    };
  } catch {
    return { ok: false, version: null, hasBoards: false, hasOnboarding: false };
  }
}
