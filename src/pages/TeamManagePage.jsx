import { useEffect, useState } from "react";
import { teamApi, ApiError } from "../api/client.js";
import TeamManageModal from "../components/TeamManageModal.jsx";

export default function TeamManagePage() {
  const [teams, setTeams] = useState([]);
  const [pendingMap, setPendingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTeamId, setOpenTeamId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await teamApi.myTeams();
      setTeams(data);

      const pendingCounts = await Promise.all(
        data.map(async (team) => {
          const applications = await teamApi.applications(team.teamId);
          return [team.teamId, applications.length];
        })
      );

      setPendingMap(Object.fromEntries(pendingCounts));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "모임 목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="view">
      <div className="view-head center-head">
        <div>
          <div className="eyebrow">My Meetup</div>
          <h1>모임 관리</h1>
          <p className="sub">내가 속한 모임의 멤버와 신청을 관리하세요.</p>
        </div>
      </div>

      <div className="manage-wrap">
        {loading && (
          <div className="center-loading">
            <div className="spinner" /> 불러오는 중...
          </div>
        )}

        {!loading && error && <div className="empty-state">{error}</div>}

        {!loading && !error && teams.length === 0 && (
          <div className="empty-state">
            <div className="glyph">＋</div>
            아직 속한 모임이 없습니다. 모임 모집에서 관심있는 모임에 신청해보세요.
          </div>
        )}

        {!loading && !error && teams.length > 0 && (
          <div className="team-list">
            {teams.map((t) => {
              const pendingCount = pendingMap[t.teamId] ?? 0;
              const hasPending = pendingCount > 0;

              return (
                <div
                  key={t.teamId}
                  className={`team-card manage-item ${hasPending ? "has-pending" : ""}`}
                  onClick={() => setOpenTeamId(t.teamId)}
                >
                  <div className="body">
                    <div className="title-row">
                      <span className="title">{t.title}</span>
                      <div className="manage-badges">
                        <span className="badge badge-cat">{t.category}</span>
                        {t.leader && <span className="badge badge-leader">리더</span>}
                        {hasPending && <span className="badge badge-pending">신청 {pendingCount}건</span>}
                        <span className={`badge ${t.status === "모집중" ? "badge-open" : "badge-closed"}`}>{t.status}</span>
                      </div>
                    </div>
                    <div className="meta meta-right">
                      <span>인원 {t.currentMembers}/{t.maxMembers}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {openTeamId && (
        <TeamManageModal teamId={openTeamId} onClose={() => setOpenTeamId(null)} onChanged={load} />
      )}
    </main>
  );
}

function formatJoined(value) {
  if (!value) return "-";
  const joined = new Date(value);
  if (Number.isNaN(joined.getTime())) return "-";
  const days = Math.floor((Date.now() - joined.getTime()) / 86400000);
  if (days <= 0) return "오늘 가입";
  if (days < 30) return `${days}일째`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}개월째`;
  return `${Math.floor(months / 12)}년째`;
}