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

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = "GET", body, auth = false, skipAuthRedirect = false } = {}) {
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
      onUnauthorized();
    }
    const message = json?.message || `요청에 실패했습니다 (${res.status})`;
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
  getProfile: () => request("/users/me", { auth: true }),
  updateNickname: (nickname) =>
    request("/users/me", { method: "PATCH", body: { nickname }, auth: true }),
  updatePassword: (currentPassword, newPassword) =>
    request("/users/me/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
      auth: true,
    }),
  deleteAccount: (password) =>
    request("/users/me", { method: "DELETE", body: { password }, auth: true, skipAuthRedirect: true }),
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

export { ApiError };
