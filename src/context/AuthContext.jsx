import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi, clearSession, getStoredUser, storeSession } from "../api/client.js";

const AuthContext = createContext(null);
const TAB_KEY = "meetory.currentTab";

export function AuthProvider({ children }) {
  // 새로고침 후에도 저장된 세션이 있으면 로그인 상태를 복원한다.
  const [user, setUser] = useState(() => getStoredUser());

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    storeSession(data.accessToken, data.userId, data.nickname);
    sessionStorage.setItem(TAB_KEY, "teams");
    setUser({ userId: data.userId, nickname: data.nickname });
    return data;
  }, []);

  const signup = useCallback(async (email, password, nickname) => {
    await authApi.signup({ email, password, nickname });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 서버 로그아웃이 실패하더라도 클라이언트 세션은 정리한다.
    } finally {
      clearSession();
      sessionStorage.removeItem(TAB_KEY);
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, login, signup, logout }), [user, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}