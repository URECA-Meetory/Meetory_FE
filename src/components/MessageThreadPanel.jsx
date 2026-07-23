import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { messageApi, ApiError } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

// 쪽지 클릭 시 뜨는 채팅형 팝업.
// 카카오톡/인스타 DM 처럼 말풍선이 좌/우로 쌓이고, 하단 입력창 + 전송 버튼으로 답장한다.
// (실시간 아님 - 전송 시 서버에 저장 후 다시 목록을 새로고침해서 보여주는 방식)
export default function MessageThreadPanel({ threadId, onClose, onChanged }) {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await messageApi.threadDetail(threadId);
      setDetail(d);
      onChanged?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "쪽지를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [detail]);

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setSending(true);
    try {
      await messageApi.reply(threadId, { content: text });
      setDraft("");
      await load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "전송에 실패했습니다", "err");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="chat-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="chat-panel">
        <div className="chat-header">
          <div className="chat-header-text">
            <div className="chat-header-title">{detail?.title ?? "쪽지"}</div>
            {detail && (
              <div className="chat-header-sub">
                {detail.teamTitle} · {detail.otherNickname}님과의 대화
              </div>
            )}
          </div>
          <button className="chat-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <div className="chat-body">
          {loading && (
            <div className="center-loading">
              <div className="spinner" /> 불러오는 중...
            </div>
          )}
          {!loading && error && <div className="auth-banner err">{error}</div>}

          {!loading && detail && (
            <>
              {detail.messages.map((m) => (
                <div key={m.messageId} className={`chat-row ${m.mine ? "mine" : "theirs"}`}>
                  {!m.mine && <div className="chat-avatar">{detail.otherNickname?.charAt(0) ?? "?"}</div>}
                  <div className="chat-bubble-wrap">
                    <div className="chat-bubble">{m.content}</div>
                    <div className="chat-time">{formatTime(m.createdAt)}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="메시지를 입력하세요"
            disabled={sending}
          />
          <button type="submit" className="chat-send-btn" disabled={sending || !draft.trim()} aria-label="보내기">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
