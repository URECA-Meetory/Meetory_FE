import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  authApi,
  clearSession,
  getAuthEpoch,
  getStoredUser,
  getToken,
  nextAuthEpoch,
  setUnauthorizedHandler,
  storeSession,
  userApi,
} from "../api/client.js";

const AuthContext = createContext(null);

function normalizeUser(source) {
  const fromProfile = "id" in source;
  return {
    userId: fromProfile ? source.id : source.userId,
    nickname: source.nickname,
    email: source.email ?? null,
    age: source.age ?? null,
    gender: source.gender ?? null,
    hobbies: source.hobbies ?? null,
    onboardingCompleted: source.onboardingCompleted === true,
    role: source.role ?? null,
    createdAt: source.createdAt ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const bootstrapStarted = useRef(false);

  const clearAuth = useCallback(() => {
    nextAuthEpoch();
    clearSession();
    setUser(null);
  }, []);

  const applyProfile = useCallback((profile) => {
    const nextUser = normalizeUser(profile);
    storeSession(getToken(), nextUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const syncProfile = useCallback(async () => {
    const profile = await userApi.getProfile({ skipAuthRedirect: true });
    return applyProfile(profile);
  }, [applyProfile]);

  const establishSession = useCallback(
    async (loginData) => {
      const partialUser = normalizeUser(loginData);
      storeSession(loginData.accessToken, partialUser);
      setUser(partialUser);
      try {
        return await syncProfile();
      } catch {
        return partialUser;
      }
    },
    [syncProfile]
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (getToken()) clearAuth();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  useEffect(() => {
    if (bootstrapStarted.current) return;
    bootstrapStarted.current = true;

    const epoch = getAuthEpoch();

    (async () => {
      if (!getToken()) {
        setInitializing(false);
        return;
      }

      try {
        const profile = await userApi.getProfile({ skipAuthRedirect: true });
        if (getAuthEpoch() !== epoch) return;
        applyProfile(profile);
      } catch {
        if (getAuthEpoch() !== epoch) return;
        const stored = getStoredUser();
        if (stored?.userId) {
          setUser(normalizeUser(stored));
        } else {
          clearAuth();
        }
      } finally {
        if (getAuthEpoch() === epoch) setInitializing(false);
      }
    })();
  }, [applyProfile, clearAuth]);

  const login = useCallback(
    async (email, password) => {
      nextAuthEpoch();
      setAuthenticating(true);
      try {
        const data = await authApi.login({ email, password });
        return await establishSession(data);
      } catch (error) {
        clearAuth();
        throw error;
      } finally {
        setAuthenticating(false);
        setInitializing(false);
      }
    },
    [establishSession, clearAuth]
  );

  const signupAndLogin = useCallback(
    async (email, password, nickname) => {
      nextAuthEpoch();
      setAuthenticating(true);
      try {
        await authApi.signup({ email, password, nickname });
        const data = await authApi.login({ email, password });
        return await establishSession(data);
      } catch (error) {
        clearAuth();
        throw error;
      } finally {
        setAuthenticating(false);
        setInitializing(false);
      }
    },
    [establishSession, clearAuth]
  );

  const signup = useCallback(async (email, password, nickname) => {
    await authApi.signup({ email, password, nickname });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 서버 로그아웃 실패 시에도 클라이언트 세션은 정리
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const applyOnboardingProfile = useCallback(
    (profile) => applyProfile({ ...profile, onboardingCompleted: true }),
    [applyProfile]
  );

  const finishOnboardingLocally = useCallback(() => {
    const base = user ?? getStoredUser();
    if (!base?.userId || !getToken()) return null;
    const nextUser = { ...normalizeUser(base), onboardingCompleted: true };
    storeSession(getToken(), nextUser);
    setUser(nextUser);
    return nextUser;
  }, [user]);

  const revertOnboardingLocally = useCallback(
    (snapshot) => {
      if (!snapshot) return;
      storeSession(getToken(), snapshot);
      setUser(snapshot);
    },
    []
  );

  const completeOnboarding = useCallback(
    async (payload) => {
      nextAuthEpoch();
      const snapshot = user ? normalizeUser(user) : null;
      const local = finishOnboardingLocally();
      if (!local) throw new Error("로그인 세션이 없습니다.");

      try {
        const profile = await userApi.completeOnboarding(payload);
        return applyOnboardingProfile(profile);
      } catch (error) {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 404 || error.status === 0)
        ) {
          return local;
        }
        revertOnboardingLocally(snapshot);
        throw error;
      }
    },
    [user, finishOnboardingLocally, applyOnboardingProfile, revertOnboardingLocally]
  );

  const skipOnboarding = useCallback(async () => {
    nextAuthEpoch();
    const snapshot = user ? normalizeUser(user) : null;
    const local = finishOnboardingLocally();
    if (!local) throw new Error("로그인 세션이 없습니다.");

    try {
      const profile = await userApi.skipOnboarding();
      return applyOnboardingProfile(profile);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 404 || error.status === 0)
      ) {
        return local;
      }
      revertOnboardingLocally(snapshot);
      throw error;
    }
  }, [user, finishOnboardingLocally, applyOnboardingProfile, revertOnboardingLocally]);

  const updateNickname = useCallback(async (nickname) => {
    const profile = await userApi.updateNickname(nickname);
    return applyProfile(profile);
  }, [applyProfile]);

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
      authenticating,
      login,
      signup,
      signupAndLogin,
      logout,
      completeOnboarding,
      skipOnboarding,
      updateNickname,
      updatePassword,
      deleteAccount,
    }),
    [
      user,
      initializing,
      authenticating,
      login,
      signup,
      signupAndLogin,
      logout,
      completeOnboarding,
      skipOnboarding,
      updateNickname,
      updatePassword,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
