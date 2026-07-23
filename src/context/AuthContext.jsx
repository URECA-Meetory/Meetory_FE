import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi, clearSession, storeSession } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 앱을 새로 열 때마다 항상 로그인 화면부터 시작하도록,
  // localStorage에 저장된 세션을 자동으로 복원하지 않는다.
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    storeSession(data.accessToken, data.userId, data.nickname);
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