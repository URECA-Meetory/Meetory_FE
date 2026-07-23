import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import TeamMatchPage from "./pages/TeamMatchPage.jsx";
import BoardPage from "./pages/BoardPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import TeamManagePage from "./pages/TeamManagePage.jsx";
import UserMenu from "./components/UserMenu.jsx";

const TABS = [
  { key: "teams", label: "팀 매칭" },
  { key: "board", label: "게시판" },
];

function Shell() {
  const { user, initializing, authenticating } = useAuth();
  const [tab, setTab] = useState("teams");
  const prevUserId = useRef(null);

  // 로그인할 때마다 항상 팀 매칭 탭으로 이동
  useEffect(() => {
    const currentId = user?.userId ?? null;
    if (currentId && currentId !== prevUserId.current) {
      setTab("teams");
    }
    prevUserId.current = currentId;
  }, [user]);

  if (initializing || authenticating) {
    return (
      <div className="center-loading" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
        <span>{authenticating ? "로그인 중..." : "세션 확인 중..."}</span>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (user.onboardingCompleted === false) return <OnboardingPage />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="wordmark">Meetory</span>
          <span className="tagline">MEETUP MATCHING</span>
        </div>

        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <UserMenu onNavigate={setTab} />
      </header>

      {tab === "teams" && <TeamMatchPage />}
      {tab === "board" && <BoardPage />}
      {tab === "mypage" && <MyPage />}
      {tab === "manage" && <TeamManagePage />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ToastProvider>
  );
}
