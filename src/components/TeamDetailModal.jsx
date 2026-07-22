import { useEffect, useState, useCallback } from "react";
import Modal from "./Modal.jsx";
import Gauge from "./Gauge.jsx";
import { teamApi, ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function TeamDetailModal({ teamId, onClose, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState(null);

  const isLeader = user && detail && user.userId === detail.leaderId;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await teamApi.detail(teamId);
      setDetail(d);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "정보를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApply() {
    if (!user) {
      setApplyMsg({ ok: false, text: "로그인 후 신청할 수 있습니다." });
      return;
    }
    setApplying(true);
    setApplyMsg(null);
    try {
      await teamApi.apply(teamId);
      toast("모임 신청이 완료되었습니다", "ok");
      onChanged();
      await load();
    } catch (err) {
      const text = err instanceof ApiError ? err.message : "신청에 실패했습니다";
      setApplyMsg({ ok: false, text });
    } finally {
      setApplying(false);
    }
  }

  return (
    <Modal onClose={onClose}>
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
            <dt>카테고리</dt>
            <dd>{detail.category}</dd>
            <dt>개설자</dt>
            <dd>{detail.leaderNickname}</dd>
            <dt>인원</dt>
            <dd>
              <Gauge current={detail.currentMembers} max={detail.maxMembers} />
            </dd>
            <dt>상태</dt>
            <dd>
              <span className={`badge ${detail.status === "모집중" ? "badge-open" : "badge-closed"}`}>{detail.status}</span>
            </dd>
            <dt>개설일</dt>
            <dd>{formatDate(detail.createdAt)}</dd>
          </div>

          <div className="modal-desc">{detail.description}</div>

          <div className="modal-actions" style={{ flexDirection: "column", alignItems: "flex-end" }}>
            {isLeader ? (
              <p className="inline-msg">내가 개설한 모임입니다. 멤버·신청 관리는 모임 관리에서 확인하세요.</p>
            ) : (
              <>
                {applyMsg && <div className={`inline-msg ${applyMsg.ok ? "ok" : "err"}`}>{applyMsg.text}</div>}
                <button
                  className="btn btn-primary"
                  disabled={detail.status !== "모집중" || applying}
                  onClick={handleApply}
                >
                  {applying ? "신청 중..." : detail.status === "모집중" ? "신청하기" : "모집 마감"}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}