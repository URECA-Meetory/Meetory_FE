import { useEffect, useState } from "react";
import Modal from "../components/Modal.jsx";
import { boardApi, ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function BoardPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 모달 상태 관리
  const [showCreate, setShowCreate] = useState(false);
  const [openBoardId, setOpenBoardId] = useState(null);

  // 게시글 목록 불러오기
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

  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="eyebrow">Board</div>
          <h1>자유 게시판</h1>
          <p className="sub">다양한 주제로 자유롭게 이야기를 나누어 보세요.</p>
        </div>
        <div className="fab-row">
          <button className="btn btn-secondary btn-sm" onClick={load}>새로고침</button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (!user) {
                toast("로그인 후 글을 작성할 수 있습니다.", "err");
                return;
              }
              setShowCreate(true);
            }}
          >
            + 새 글 쓰기
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
          아직 작성된 게시글이 없습니다. 첫 글의 주인공이 되어보세요!
        </div>
      )}

      {!loading && !error && boards.length > 0 && (
        <div className="team-list">
          {boards.map((board) => (
            <div 
              key={board.id} 
              className="team-card" 
              onClick={() => setOpenBoardId(board.id)}
            >
              <div className="body">
                <div className="title-row">
                  <span className="title">{board.title}</span>
                </div>
                <div className="meta">
                  <span>작성자: {board.writerNickname}</span>
                  <span>작성일: {formatDate(board.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 새 글 작성 모달 */}
      {showCreate && (
        <BoardFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            toast("게시글이 등록되었습니다.", "ok");
            load();
          }}
        />
      )}

      {/* 게시글 상세/수정 모달 */}
      {openBoardId && (
        <BoardDetailModal
          boardId={openBoardId}
          onClose={() => setOpenBoardId(null)}
          onChanged={load}
        />
      )}
    </main>
  );
}

// ---------------- 모달 컴포넌트들 ----------------

// 글쓰기 / 수정 통합 폼 모달
function BoardFormModal({ onClose, onSuccess, initialData = null }) {
  const [form, setForm] = useState({ 
    title: initialData ? initialData.title : "", 
    content: initialData ? initialData.content : "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isUpdate = !!initialData;

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isUpdate) {
        await boardApi.update(initialData.id, form);
      } else {
        await boardApi.create(form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "요청에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-title">{isUpdate ? "글 수정하기" : "새 글 작성"}</div>
      {error && <div className="auth-banner err" style={{ marginTop: 14 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
        <div className="field">
          <label htmlFor="b-title">제목</label>
          <input id="b-title" value={form.title} onChange={update("title")} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="b-content">내용</label>
          <textarea id="b-content" value={form.content} onChange={update("content")} required rows={8} />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "처리 중..." : isUpdate ? "수정완료" : "등록하기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// 게시글 상세조회 모달
function BoardDetailModal({ boardId, onClose, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 전환

  async function loadDetail() {
    setLoading(true);
    setError("");
    try {
      const data = await boardApi.detail(boardId);
      setDetail(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "정보를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [boardId]);

  async function handleDelete() {
    if (!confirm("정말로 이 글을 삭제하시겠습니까?")) return;
    try {
      await boardApi.delete(boardId);
      toast("게시글이 삭제되었습니다.", "ok");
      onChanged(); // 리스트 새로고침
      onClose(); // 모달 닫기
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "삭제에 실패했습니다", "err");
    }
  }

  // 본인이 쓴 글인지 확인
  const isWriter = user && detail && user.nickname === detail.writerNickname;

  if (isEditing && detail) {
    return (
      <BoardFormModal 
        initialData={detail} 
        onClose={() => setIsEditing(false)} 
        onSuccess={() => {
          setIsEditing(false);
          toast("게시글이 수정되었습니다.", "ok");
          onChanged();
          loadDetail(); // 상세 데이터 최신화
        }} 
      />
    );
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
            <dt>작성자</dt>
            <dd>{detail.writerNickname}</dd>
            <dt>작성일</dt>
            <dd>{formatDate(detail.createdAt)}</dd>
          </div>
          
          <hr className="divider" />
          <div className="modal-desc" style={{ fontSize: "15px", color: "var(--ink)" }}>
            {detail.content}
          </div>

          <div className="modal-actions">
            {isWriter && (
              <>
                <button className="btn btn-danger-outline" onClick={handleDelete}>삭제</button>
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>수정</button>
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

// 날짜 포맷팅 헬퍼 함수
function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ko-KR", { 
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}