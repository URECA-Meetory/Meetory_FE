import { useState } from "react";
import Modal from "./Modal.jsx";
import { teamApi, ApiError } from "../api/client.js";

const CATEGORIES = ["스터디", "독서", "운동", "취미", "기타"];

export default function CreateTeamModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", category: "스터디", description: "", maxMembers: 5 });
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
      await teamApi.create({ ...form, maxMembers: Number(form.maxMembers) });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "모임 개설에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-title">새 모임 개설하기</div>
      {error && <div className="auth-banner err" style={{ marginTop: 14 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
        <div className="field">
          <label htmlFor="ct-title">모임 이름</label>
          <input id="ct-title" value={form.title} onChange={update("title")} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="ct-cat">카테고리</label>
          <select id="ct-cat" value={form.category} onChange={update("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ct-max">최대 인원</label>
          <input id="ct-max" type="number" min={2} max={100} value={form.maxMembers} onChange={update("maxMembers")} required />
        </div>
        <div className="field">
          <label htmlFor="ct-desc">모임 소개</label>
          <textarea id="ct-desc" value={form.description} onChange={update("description")} required />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "개설 중..." : "개설하기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
