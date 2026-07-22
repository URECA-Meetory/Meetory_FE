import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function UserMenu({ onNavigate }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;
  const initial = user.nickname?.charAt(0) ?? "?";

  async function confirmLogout() {
    setLoggingOut(true);
    try {
      await logout();
      toast("로그아웃 되었습니다", "ok");
    } finally {
      setLoggingOut(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="user-menu">
      <button className="user-menu-trigger" type="button">
        <span className="user-menu-avatar">{initial}</span>
        <span className="user-menu-name">{user.nickname}</span>
        <span className="user-menu-caret">▾</span>
      </button>

      <div className="user-menu-dropdown">
        <div className="user-menu-dropdown-inner">
          <button type="button" onClick={() => onNavigate("mypage")}>
            마이페이지
          </button>
          <button type="button" onClick={() => onNavigate("manage")}>
            모임 관리
          </button>
          <button type="button" className="danger" onClick={() => setConfirmOpen(true)}>
            로그아웃
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
        >
          <div className="modal-card confirm-card">
            <div className="modal-title">로그아웃 하시겠습니까?</div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmOpen(false)}>
                돌아가기
              </button>
              <button className="btn btn-danger-outline" disabled={loggingOut} onClick={confirmLogout}>
                {loggingOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}