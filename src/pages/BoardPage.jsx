import { useEffect, useState } from "react";
import { boardApi, ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import CreateBoardModal from "../components/CreateBoardModal.jsx";
import BoardDetailModal from "../components/BoardDetailModal.jsx";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

function preview(content, max = 120) {
  if (!content) return "";
  const oneLine = content.replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max)}…`;
}

export default function BoardPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [openBoardId, setOpenBoardId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await boardApi.list();
      setBoards(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "게시글 목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleCreateClick() {
    if (!user) {
      toast("로그인 후 글을 작성할 수 있습니다.", "err");
      return;
    }
    setShowCreate(true);
  }

  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="eyebrow">Board</div>
          <h1>자유 게시판</h1>
          <p className="sub">모임 이야기, 후기, 질문을 자유롭게 나눠보세요.</p>
        </div>
        <div className="fab-row">
          <button className="btn btn-secondary btn-sm" onClick={load}>
            새로고침
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleCreateClick}>
            + 글 작성
          </button>
        </div>
      </div>

      {loading && (
        <div className="center-loading">
          <div className="spinner" /> 게시글을 불러오는 중...
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <div className="glyph">!</div>
          {error}
        </div>
      )}

      {!loading && !error && boards.length === 0 && (
        <div className="empty-state">
          <div className="glyph">✎</div>
          아직 게시글이 없습니다. 첫 글을 작성해보세요.
        </div>
      )}

      {!loading && !error && boards.length > 0 && (
        <div className="board-list">
          {boards.map((board) => (
            <article key={board.id} className="board-card" onClick={() => setOpenBoardId(board.id)}>
              <div className="board-card-body">
                <h2 className="board-card-title">{board.title}</h2>
                <p className="board-card-preview">{preview(board.content)}</p>
                <div className="board-card-meta">
                  <span>{board.writerNickname}</span>
                  <span>{formatDate(board.createdAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBoardModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            toast("게시글이 등록되었습니다", "ok");
            load();
          }}
        />
      )}

      {openBoardId && (
        <BoardDetailModal
          boardId={openBoardId}
          currentNickname={user?.nickname}
          onClose={() => setOpenBoardId(null)}
          onChanged={load}
        />
      )}
    </main>
  );
}
