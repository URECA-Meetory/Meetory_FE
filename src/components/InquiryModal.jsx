import { useState } from "react";
import Modal from "./Modal.jsx";
import { messageApi, ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

// 팀 매칭 화면 "문의하기" 버튼 -> 모임 리더에게 보내는 최초 쪽지 팝업.
// 닫기(X)는 공용 Modal 컴포넌트의 우측 상단 버튼을 그대로 사용한다.
export default function InquiryModal({ teamId, teamTitle, onClose, onSent }) {
  const { user } = useAuth();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await messageApi.sendInquiry(teamId, { title, content });
      toast("쪽지를 보냈습니다", "ok");
      onSent?.();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "쪽지 전송에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-title">모임장에게 문의하기</div>
      <p className="inquiry-target">{teamTitle}</p>

      {error && (
        <div className="auth-banner err" style={{ marginTop: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
        <div className="field">
          <label htmlFor="iq-sender">보낸 사람</label>
          <input id="iq-sender" value={user?.nickname ?? ""} disabled />
        </div>
        <div className="field">
          <label htmlFor="iq-title">쪽지 제목</label>
          <input
            id="iq-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예) 모집 정원 관련 문의드려요"
            required
            maxLength={100}
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="iq-content">쪽지 내용</label>
          <textarea
            id="iq-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="궁금하신 내용을 편하게 남겨주세요."
            required
            rows={5}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "보내는 중..." : "보내기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
