import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { boardApi, ApiError } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAuth } from "../context/AuthContext.jsx"; // 👈 로그인 정보 가져오기

export default function BoardDetailModal({ boardId, currentNickname, onClose, onChanged }) {
  const toast = useToast();
  const { user } = useAuth(); // 👈 유저 정보

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 💬 댓글 전용 상태
  const [commentContent, setCommentContent] = useState("");
  const [commenting, setCommenting] = useState(false);

  const isAuthor = detail && currentNickname && detail.writerNickname === currentNickname;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await boardApi.detail(boardId);
        if (!cancelled) {
          setDetail(data);
          setForm({ title: data.title, content: data.content });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "게시글을 불러오지 못했습니다");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await boardApi.update(boardId, form);
      toast("게시글이 수정되었습니다", "ok");
      setEditing(false);
      onChanged();
      const data = await boardApi.detail(boardId);
      setDetail(data);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "수정에 실패했습니다", "err");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("이 게시글을 삭제할까요?")) return;
    setDeleting(true);
    try {
      await boardApi.remove(boardId);
      toast("게시글이 삭제되었습니다", "ok");
      onChanged();
      onClose();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "삭제에 실패했습니다", "err");
    } finally {
      setDeleting(false);
    }
  }

  // 💬 댓글 작성 함수
  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!user) {
      toast("로그인 후 댓글을 작성할 수 있습니다.", "err");
      return;
    }
    if (!commentContent.trim()) return;

    setCommenting(true);
    try {
      await boardApi.createComment(boardId, { content: commentContent });
      setCommentContent("");
      // 성공하면 글 상세 내용을 다시 불러와 댓글 목록 갱신
      const data = await boardApi.detail(boardId);
      setDetail(data);
      toast("댓글이 등록되었습니다.", "ok");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "댓글 등록에 실패했습니다", "err");
    } finally {
      setCommenting(false);
    }
  }

  // 💬 댓글 삭제 함수
  async function handleDeleteComment(commentId) {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await boardApi.deleteComment(boardId, commentId);
      const data = await boardApi.detail(boardId);
      setDetail(data);
      toast("댓글이 삭제되었습니다.", "ok");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "댓글 삭제에 실패했습니다", "err");
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

      {!loading && detail && !editing && (
        <>
          <div className="modal-title">{detail.title}</div>
          <div className="board-detail-meta">
            <span>{detail.writerNickname}</span>
            <span>{formatDate(detail.createdAt)}</span>
          </div>
          <div className="modal-desc board-detail-body">{detail.content}</div>
          <div className="modal-actions">
            {isAuthor && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                  수정
                </button>
                <button type="button" className="btn btn-danger-outline btn-sm" disabled={deleting} onClick={handleDelete}>
                  {deleting ? "삭제 중..." : "삭제"}
                </button>
              </>
            )}
            <button type="button" className="btn btn-primary" onClick={onClose}>
              닫기
            </button>
          </div>

          {/* 💬 새로 추가된 댓글 영역 */}
          <hr className="divider" style={{ margin: "24px 0 16px 0" }} />
          <div style={{ background: "var(--bg-soft)", padding: "16px", borderRadius: "8px" }}>
            <div className="section-label" style={{ marginBottom: "12px" }}>
              댓글 {detail.comments?.length || 0}개
            </div>
            
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
              {detail.comments?.map(comment => (
                <li key={comment.id} style={{ marginBottom: "12px", borderBottom: "1px solid var(--line-strong)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--ink-soft)" }}>{comment.writerNickname}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{formatDate(comment.createdAt)}</span>
                      {user && user.userId === comment.writerId && (
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ background: "none", border: "none", color: "var(--coral)", fontSize: "12px", cursor: "pointer", padding: 0 }}
                        >✕</button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text)", wordBreak: "break-all" }}>
                    {comment.content}
                  </div>
                </li>
              ))}
              {(!detail.comments || detail.comments.length === 0) && (
                <p style={{ fontSize: "13px", color: "var(--text-faint)", textAlign: "center", padding: "10px 0" }}>등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
              )}
            </ul>

            <form onSubmit={handleCommentSubmit} style={{ display: "flex", gap: "8px" }}>
              <input 
                type="text" 
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={user ? "댓글을 남겨보세요." : "로그인 후 댓글을 작성할 수 있습니다."}
                disabled={!user || commenting}
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  borderRadius: "6px", 
                  border: "1px solid var(--line-strong)",
                  background: "var(--surface)",
                  color: "var(--text)"
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!user || !commentContent.trim() || commenting}
                style={{ whiteSpace: "nowrap" }}
              >
                {commenting ? "등록 중..." : "등록"}
              </button>
            </form>
          </div>
        </>
      )}

      {!loading && detail && editing && (
        <form onSubmit={handleSave}>
          <div className="modal-title">글 수정</div>
          <div className="field" style={{ marginTop: 18 }}>
            <label htmlFor="eb-title">제목</label>
            <input id="eb-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required maxLength={200} />
          </div>
          <div className="field">
            <label htmlFor="eb-content">내용</label>
            <textarea id="eb-content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required rows={8} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  // 시간까지 표시되도록 옵션 변경 (선택사항)
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}