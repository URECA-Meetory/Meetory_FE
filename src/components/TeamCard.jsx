import Gauge from "./Gauge.jsx";

export default function TeamCard({ team, onOpen, onApply, onInquiry, applyDisabled }) {
  const isOpen = team.status === "모집중" && team.currentMembers < team.maxMembers;

  return (
    <div className="team-card" onClick={() => onOpen(team.teamId)}>
      <div className="body">
        <div className="title-row">
          <span className="title">{team.title}</span>
          <span className="badge badge-cat">{team.category}</span>
          <span className={`badge ${isOpen ? "badge-open" : "badge-closed"}`}>{isOpen ? team.status : "모집완료"}</span>
        </div>
        <div className="summary">{team.summary}</div>
      </div>
      <div className="side">
        <Gauge current={team.currentMembers} max={team.maxMembers} />
        <div className="side-actions">
          <button
            className="btn btn-inquiry btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onInquiry(team.teamId, team.title);
            }}
          >
            문의하기
          </button>
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
    </div>
  );
}
