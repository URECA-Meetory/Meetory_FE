import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  authApi,
  clearSession,
  getStoredUser,
  getToken,
  setUnauthorizedHandler,
  storeSession,
  userApi,
} from "../api/client.js";

const AuthContext = createContext(null);

function toUser(profile) {
  return {
    userId: profile.id,
    nickname: profile.nickname,
    email: profile.email,
    role: profile.role,
    createdAt: profile.createdAt,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  const [initializing, setInitializing] = useState(() => !!getToken());

  const clearAuth = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearAuth);
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  useEffect(() => {
    if (!getToken()) {
      setInitializing(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const profile = await userApi.getProfile();
        if (cancelled) return;
        const nextUser = toUser(profile);
        storeSession(getToken(), nextUser);
        setUser(nextUser);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearAuth]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    storeSession(data.accessToken, { userId: data.userId, nickname: data.nickname });
    setUser({ userId: data.userId, nickname: data.nickname });

    const profile = await userApi.getProfile();
    const fullUser = toUser(profile);
    storeSession(data.accessToken, fullUser);
    setUser(fullUser);
    return fullUser;
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
      clearAuth();
    }
  }, [clearAuth]);

  const updateNickname = useCallback(async (nickname) => {
    const profile = await userApi.updateNickname(nickname);
    const nextUser = toUser(profile);
    storeSession(getToken(), nextUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    await userApi.updatePassword(currentPassword, newPassword);
  }, []);

  const deleteAccount = useCallback(async (password) => {
    await userApi.deleteAccount(password);
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      signup,
      logout,
      updateNickname,
      updatePassword,
      deleteAccount,
    }),
    [user, initializing, login, signup, logout, updateNickname, updatePassword, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
