import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import Modal from "./Modal.jsx";
import { messageApi, ApiError } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

// 쪽지 클릭 시 뜨는 대화 모달. 모임 관리 모달과 동일한 Modal 컴포넌트를 사용하고,
// 내부는 카카오톡처럼 말풍선(닉네임 → 말풍선 → 말풍선 바깥 오른쪽 아래 작은 시간)으로 구성한다.
// 상대가 보낸 쪽지는 왼쪽, 내가 보낸 쪽지는 오른쪽에 배치한다.
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
    <Modal onClose={onClose} wide>
      {loading && (
        <div className="center-loading">
          <div className="spinner" /> 불러오는 중...
        </div>
      )}
      {!loading && error && <div className="auth-banner err">{error}</div>}

      {!loading && detail && (
        <>
          <div className="modal-title">{detail.title}</div>

          <div className="detail-grid">
            <dt>모임</dt>
            <dd>{detail.teamTitle}</dd>
            <dt>대화 상대</dt>
            <dd>{detail.otherNickname}</dd>
          </div>

          <hr className="divider" />
          <div className="section-label">대화 내용</div>

          <div className="chat-body-inline">
            {detail.messages.map((m) => (
              <div key={m.messageId} className={`chat-row ${m.mine ? "mine" : "theirs"}`}>
                <div className="chat-bubble-wrap">
                  <div className="chat-sender-name">{m.mine ? "나" : m.senderNickname}</div>
                  <div className="chat-bubble">{m.content}</div>
                  <div className="chat-time">{formatTime(m.createdAt)}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
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
        </>
      )}
    </Modal>
  );
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}