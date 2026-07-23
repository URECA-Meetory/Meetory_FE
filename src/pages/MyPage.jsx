import { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { messageApi, ApiError } from "../api/client.js";
import MessageThreadPanel from "../components/MessageThreadPanel.jsx";

export default function MyPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [inbox, setInbox] = useState({ unread: [], read: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openThreadId, setOpenThreadId] = useState(null);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await messageApi.inbox();
      setInbox(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "쪽지함을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  if (!user) return null;

  const initial = user.nickname?.charAt(0) ?? "?";

  async function handleLogout() {
    await logout();
    toast("로그아웃 되었습니다", "ok");
  }

  return (
    <main className="view">
      <div className="view-head center-head">
        <div>
          <div className="eyebrow">My Page</div>
          <h1>마이페이지</h1>
          <p className="sub">내 계정 정보와 받은 쪽지를 확인할 수 있어요.</p>
        </div>
      </div>

      <div className="mypage-grid">
        <div className="mypage-card">
          <div className="mypage-row">
            <div className="avatar-badge">{initial}</div>
            <div>
              <h2>{user.nickname}</h2>
              <div className="uid">USER ID · {user.userId}</div>
            </div>
          </div>

          <div className="info-list">
            <div className="row">
              <span>닉네임</span>
              <span>{user.nickname}</span>
            </div>
            <div className="row">
              <span>회원 번호</span>
              <span>{user.userId}</span>
            </div>
          </div>

          <button className="btn btn-danger-outline btn-block" style={{ marginTop: 24 }} onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        <div className="mypage-card inbox-card">
          <div className="inbox-head">
            <Mail size={18} />
            <h2>받은 쪽지</h2>
          </div>

          {loading && (
            <div className="center-loading">
              <div className="spinner" /> 불러오는 중...
            </div>
          )}
          {!loading && error && <div className="auth-banner err">{error}</div>}

          {!loading && !error && (
            <>
              <div className="inbox-section">
                <div className="inbox-section-label">
                  <Mail size={13} /> 안 읽은 쪽지 ({inbox.unread.length})
                </div>
                {inbox.unread.length === 0 ? (
                  <p className="inline-msg">안 읽은 쪽지가 없습니다.</p>
                ) : (
                  <ul className="inbox-list">
                    {inbox.unread.map((t) => (
                      <li key={t.threadId} className="inbox-item unread" onClick={() => setOpenThreadId(t.threadId)}>
                        <span className="dot" />
                        <div className="inbox-item-body">
                          <div className="inbox-item-title">{t.title}</div>
                          <div className="inbox-item-meta">
                            {t.otherNickname} · {t.teamTitle}
                          </div>
                          <div className="inbox-item-preview">{t.lastMessagePreview}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="inbox-section">
                <div className="inbox-section-label">
                  <MailOpen size={13} /> 읽은 쪽지 ({inbox.read.length})
                </div>
                {inbox.read.length === 0 ? (
                  <p className="inline-msg">읽은 쪽지가 없습니다.</p>
                ) : (
                  <ul className="inbox-list">
                    {inbox.read.map((t) => (
                      <li key={t.threadId} className="inbox-item" onClick={() => setOpenThreadId(t.threadId)}>
                        <div className="inbox-item-body">
                          <div className="inbox-item-title">{t.title}</div>
                          <div className="inbox-item-meta">
                            {t.otherNickname} · {t.teamTitle}
                          </div>
                          <div className="inbox-item-preview">{t.lastMessagePreview}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {openThreadId && (
        <MessageThreadPanel threadId={openThreadId} onClose={() => setOpenThreadId(null)} onChanged={loadInbox} />
      )}
    </main>
  );
}
