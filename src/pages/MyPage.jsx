import { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { messageApi, ApiError } from "../api/client.js";
import MessageThreadPanel from "../components/MessageThreadPanel.jsx";

const PAGE_SIZE = 5;

export default function MyPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [inbox, setInbox] = useState({ unread: [], read: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openThreadId, setOpenThreadId] = useState(null);
  const [unreadExpanded, setUnreadExpanded] = useState(false);
  const [readExpanded, setReadExpanded] = useState(false);

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

  const unreadVisible = unreadExpanded ? inbox.unread : inbox.unread.slice(0, PAGE_SIZE);
  const readVisible = readExpanded ? inbox.read : inbox.read.slice(0, PAGE_SIZE);

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
        {/* 왼쪽: 내 정보 */}
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

        {/* 오른쪽: 쪽지함 */}
        <div className="mypage-card inbox-card">
          <div className="inbox-head">
            <Mail size={18} />
            <h2>쪽지함</h2>
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
                  <>
                    <div className="msg-list">
                      {unreadVisible.map((t) => (
                        <div key={t.threadId} className="msg-card unread" onClick={() => setOpenThreadId(t.threadId)}>
                          <div className="msg-card-body">
                            <span className="msg-card-title">{t.title}</span>
                            <span className="badge badge-cat">{t.teamTitle}</span>
                          </div>
                          <span className="dot" />
                        </div>
                      ))}
                    </div>
                    {inbox.unread.length > PAGE_SIZE && (
                      <button className="btn-more" onClick={() => setUnreadExpanded((v) => !v)}>
                        {unreadExpanded ? "접기" : `더보기 (${inbox.unread.length - PAGE_SIZE})`}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="inbox-section">
                <div className="inbox-section-label">
                  <MailOpen size={13} /> 읽은 쪽지 ({inbox.read.length})
                </div>
                {inbox.read.length === 0 ? (
                  <p className="inline-msg">읽은 쪽지가 없습니다.</p>
                ) : (
                  <>
                    <div className="msg-list">
                      {readVisible.map((t) => (
                        <div key={t.threadId} className="msg-card" onClick={() => setOpenThreadId(t.threadId)}>
                          <div className="msg-card-body">
                            <span className="msg-card-title">{t.title}</span>
                            <span className="badge badge-cat">{t.teamTitle}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {inbox.read.length > PAGE_SIZE && (
                      <button className="btn-more" onClick={() => setReadExpanded((v) => !v)}>
                        {readExpanded ? "접기" : `더보기 (${inbox.read.length - PAGE_SIZE})`}
                      </button>
                    )}
                  </>
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