import Gauge from "./Gauge.jsx";

export default function TeamCard({ team, onOpen, onApply, applyDisabled }) {
  const isOpen = team.status === "모집중";

  return (
    <div className="team-card" onClick={() => onOpen(team.teamId)}>
      <div className="body">
        <div className="title-row">
          <span className="title">{team.title}</span>
          <span className="badge badge-cat">{team.category}</span>
          <span className={`badge ${isOpen ? "badge-open" : "badge-closed"}`}>{team.status}</span>
        </div>
        <div className="summary">{team.summary}</div>
        <div className="meta">
          <span>개설자 {team.leaderNickname}</span>
        </div>
      </div>
      <div className="side">
        <Gauge current={team.currentMembers} max={team.maxMembers} />
        <button
          className="btn btn-primary btn-sm"
          disabled={!isOpen || applyDisabled}
          onClick={(e) => {
            e.stopPropagation();
            onApply(team.teamId);
          }}
        >
          {isOpen ? "신청하기" : "모집 마감"}
        </button>
      </div>
    </div>
  );
}
