export default function Modal({ children, onClose, wide = false }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-card ${wide ? "wide" : ""}`}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
