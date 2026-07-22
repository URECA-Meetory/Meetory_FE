import { useEffect, useMemo, useState } from "react";
import TeamCard from "../components/TeamCard.jsx";
import CreateTeamModal from "../components/CreateTeamModal.jsx";
import TeamDetailModal from "../components/TeamDetailModal.jsx";
import { teamApi, ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const CATEGORY_FILTERS = ["전체", "스터디", "독서", "운동", "취미", "기타"];

export default function TeamMatchPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("전체");
  const [showCreate, setShowCreate] = useState(false);
  const [openTeamId, setOpenTeamId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await teamApi.list();
      setTeams(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "모임 목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (category === "전체" ? teams : teams.filter((t) => t.category === category)),
    [teams, category]
  );

  async function quickApply(teamId) {
    if (!user) {
      toast("로그인 후 신청할 수 있습니다.", "err");
      return;
    }
    try {
      await teamApi.apply(teamId);
      toast("모임 신청이 완료되었습니다", "ok");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "신청에 실패했습니다", "err");
    }
  }

  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="eyebrow">Team Matching</div>
          <h1>모집중인 모임</h1>
          <p className="sub">관심 있는 모임의 설명을 눌러 자세히 살펴보세요.</p>
        </div>
        <div className="fab-row">
          <button className="btn btn-secondary btn-sm" onClick={load}>
            새로고침
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (!user) {
                toast("로그인 후 모임을 개설할 수 있습니다.", "err");
                return;
              }
              setShowCreate(true);
            }}
          >
            + 모임 개설
          </button>
        </div>
      </div>

      <div className="filter-row">
        {CATEGORY_FILTERS.map((c) => (
          <button key={c} className={`chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="center-loading">
          <div className="spinner" /> 모임을 불러오는 중...
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <div className="glyph">!</div>
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="glyph">＋</div>
          {teams.length === 0 ? "아직 개설된 모임이 없습니다. 첫 모임을 만들어보세요." : "해당 카테고리의 모임이 없습니다."}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="team-list">
          {filtered.map((team) => (
            <TeamCard key={team.teamId} team={team} onOpen={setOpenTeamId} onApply={quickApply} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            toast("모임이 개설되었습니다", "ok");
            load();
          }}
        />
      )}

      {openTeamId && (
        <TeamDetailModal teamId={openTeamId} onClose={() => setOpenTeamId(null)} onChanged={load} />
      )}
    </main>
  );
}
