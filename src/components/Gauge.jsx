export default function Gauge({ current, max }) {
  const ratio = max > 0 ? Math.min(current / max, 1) : 0;
  const cls = ratio >= 1 ? "full" : ratio >= 0.7 ? "hot" : "";
  return (
    <div className="gauge-wrap">
      <div className={`gauge ${cls}`}>
        <i style={{ width: `${ratio * 100}%` }} />
      </div>
      <span className="gauge-num">
        {current}/{max}
      </span>
    </div>
  );
}
