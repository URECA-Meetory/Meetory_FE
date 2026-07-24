import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { boardApi, ApiError } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export default function BoardDetailModal({ boardId, currentNickname, onClose, onChanged }) {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}
