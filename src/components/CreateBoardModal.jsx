import { useState } from "react";
import Modal from "./Modal.jsx";
import { boardApi, ApiError } from "../api/client.js";

export default function CreateBoardModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await boardApi.create(form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "글 작성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-title">새 글 작성</div>
      {error && <div className="auth-banner err" style={{ marginTop: 14 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
        <div className="field">
          <label htmlFor="cb-title">제목</label>
          <input id="cb-title" value={form.title} onChange={update("title")} required autoFocus maxLength={200} />
        </div>
        <div className="field">
          <label htmlFor="cb-content">내용</label>
          <textarea id="cb-content" value={form.content} onChange={update("content")} required rows={8} />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
