import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import TeamMatchPage from "./pages/TeamMatchPage.jsx";
import BoardPage from "./pages/BoardPage.jsx";
import MyPage from "./pages/MyPage.jsx";

const TABS = [
  { key: "teams", label: "팀 매칭" },
  { key: "board", label: "게시판" },
  { key: "mypage", label: "마이페이지" },
];

function Shell() {
  const { user } = useAuth();
  const [tab, setTab] = useState("teams");

  if (!user) return <AuthPage />;

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

        <div className="user-pill">
          <span className="dot" />
          {user.nickname}
        </div>
      </header>

      {tab === "teams" && <TeamMatchPage />}
      {tab === "board" && <BoardPage />}
      {tab === "mypage" && <MyPage />}
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
