import { useCallback, useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import Gauge from "./Gauge.jsx";
import { teamApi, ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function TeamManageModal({ teamId, onClose, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();

  const [detail, setDetail] = useState(null);
  const [members, setMembers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLeader = user && detail && user.userId === detail.leaderId;

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [d, m] = await Promise.all([teamApi.detail(teamId), teamApi.members(teamId)]);
      setDetail(d);
      setMembers(m);
      if (user && user.userId === d.leaderId) {
        const apps = await teamApi.applications(teamId);
        setApplications(apps);
      } else {
        setApplications([]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "정보를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, [teamId, user]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function respond(memberId, action) {
    try {
      if (action === "approve") await teamApi.approve(teamId, memberId);
      else await teamApi.reject(teamId, memberId);
      toast(action === "approve" ? "신청을 수락했습니다" : "신청을 거절했습니다", "ok");
      onChanged();
      await loadAll();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "처리에 실패했습니다", "err");
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await teamApi.leave(teamId);
      toast("모임에서 탈퇴했습니다", "ok");
      setConfirmLeave(false);
      onChanged();
      onClose();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "탈퇴에 실패했습니다", "err");
    } finally {
      setLeaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await teamApi.remove(teamId);
      toast("모임이 삭제되었습니다. 멤버에게 안내 쪽지가 발송되었습니다.", "ok");
      setConfirmDelete(false);
      onChanged();
      onClose();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "모임 삭제에 실패했습니다", "err");
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

          {!isLeader && (
            <div className="modal-actions">
              <button className="btn btn-danger-outline" onClick={() => setConfirmLeave(true)}>
                모임 탈퇴
              </button>
            </div>
          )}

          {isLeader && (
            <div className="modal-actions">
              <button className="btn btn-danger-outline" onClick={() => setConfirmDelete(true)}>
                모임 삭제
              </button>
            </div>
          )}

          <hr className="divider" />
          <div className="section-label">멤버 목록 ({members.length})</div>
          {members.length === 0 ? (
            <p className="inline-msg">아직 팀원이 없습니다.</p>
          ) : (
            <ul className="member-list">
              {members.map((m) => (
                <li key={m.memberId}>
                  <span>
                    {m.nickname} <span className="m-id">#{m.userId}</span>
                  </span>
                  <span className="m-date">가입일 {formatDate(m.joinedAt)}</span>
                </li>
              ))}
            </ul>
          )}

          {isLeader && (
            <>
              <hr className="divider" />
              <div className="section-label">신청 관리</div>
              {applications.length === 0 ? (
                <p className="inline-msg">대기중인 신청이 없습니다.</p>
              ) : (
                <ul className="apply-list">
                  {applications.map((a) => (
                    <li key={a.memberId}>
                      <span className="a-who">
                        <span className="a-name">{a.nickname}</span>
                        <span className="a-email">{a.email}</span>
                      </span>
                      <span className="a-actions">
                        <button className="icon-btn approve" title="수락" onClick={() => respond(a.memberId, "approve")}>
                          ✓
                        </button>
                        <button className="icon-btn reject" title="거절" onClick={() => respond(a.memberId, "reject")}>
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}

      {confirmDelete && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDelete(false);
          }}
        >
          <div className="modal-card confirm-card">
            <div className="modal-title">모임을 삭제하시겠습니까?</div>
            <p className="modal-desc">
              삭제하면 멤버는 자동으로 탈퇴되며, 마이페이지 쪽지함으로 안내 메시지가 발송됩니다. 되돌릴 수 없습니다.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
                돌아가기
              </button>
              <button className="btn btn-danger-outline" disabled={deleting} onClick={handleDelete}>
                {deleting ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmLeave && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmLeave(false);
          }}
        >
          <div className="modal-card confirm-card">
            <div className="modal-title">모임을 탈퇴하시겠습니까?</div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmLeave(false)}>
                돌아가기
              </button>
              <button className="btn btn-danger-outline" disabled={leaving} onClick={handleLeave}>
                {leaving ? "탈퇴 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
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