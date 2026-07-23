import { useEffect, useState } from "react";
import Modal from "../components/Modal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { ApiError } from "../api/client.js";

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MyPage() {
  const { user, logout, updateNickname, updatePassword, deleteAccount } = useAuth();
  const toast = useToast();

  const [banner, setBanner] = useState(null);
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameLoading, setNicknameLoading] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user?.nickname) setNicknameInput(user.nickname);
  }, [user?.nickname]);

  if (!user) return null;

  const initial = user.nickname?.charAt(0)?.toUpperCase() ?? "?";

  function showBanner(message, type) {
    setBanner({ message, type });
  }

  function toggleNicknameEdit() {
    if (nicknameOpen) {
      setNicknameOpen(false);
      return;
    }
    setNicknameInput(user.nickname);
    setNicknameOpen(true);
    setBanner(null);
  }

  async function handleNicknameSave() {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      showBanner("닉네임을 입력해주세요.", "err");
      return;
    }
    setNicknameLoading(true);
    try {
      await updateNickname(trimmed);
      setNicknameOpen(false);
      toast("닉네임이 변경되었습니다", "ok");
    } catch (err) {
      showBanner(err instanceof ApiError ? err.message : "닉네임 변경에 실패했습니다", "err");
    } finally {
      setNicknameLoading(false);
    }
  }

  function togglePasswordEdit() {
    if (passwordOpen) {
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      return;
    }
    setPasswordOpen(true);
    setBanner(null);
  }

  async function handlePasswordSave() {
    const { currentPassword, newPassword } = passwordForm;
    if (!currentPassword || !newPassword) {
      showBanner("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.", "err");
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 20) {
      showBanner("새 비밀번호는 8~20자로 입력해주세요.", "err");
      return;
    }
    setPasswordLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast("비밀번호가 변경되었습니다", "ok");
    } catch (err) {
      showBanner(err instanceof ApiError ? err.message : "비밀번호 변경에 실패했습니다", "err");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      showBanner("비밀번호를 입력해주세요.", "err");
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteOpen(false);
      toast("계정이 삭제되었습니다", "ok");
    } catch (err) {
      showBanner(err instanceof ApiError ? err.message : "계정 삭제에 실패했습니다", "err");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    toast("로그아웃 되었습니다", "ok");
  }

  return (
    <main className="view">
      <div className="view-head center-head">
        <div>
          <div className="eyebrow">My Page</div>
          <h1>마이페이지</h1>
          <p className="sub">내 계정 정보를 확인하고 수정할 수 있어요.</p>
        </div>
      </div>

      <div className="mypage-card">
        {banner && (
          <div className={`auth-banner ${banner.type === "err" ? "err" : "ok"}`}>{banner.message}</div>
        )}

        <div className="mypage-row">
          <div className="avatar-badge">{initial}</div>
          <div>
            <h2>{user.nickname}</h2>
            <div className="uid">USER ID · {user.userId}</div>
          </div>
        </div>

        <div className="info-list">
          <div className="row">
            <span>이메일</span>
            <span>{user.email ?? "-"}</span>
          </div>
          <div className="row">
            <span>닉네임</span>
            <span>{user.nickname}</span>
          </div>
          <div className="row">
            <span>나이</span>
            <span>{user.age != null ? `${user.age}세` : "-"}</span>
          </div>
          <div className="row">
            <span>성별</span>
            <span>{user.gender ?? "-"}</span>
          </div>
          <div className="row">
            <span>취미</span>
            <span>{user.hobbies ?? "-"}</span>
          </div>
          <div className="row">
            <span>회원 번호</span>
            <span>{user.userId}</span>
          </div>
          <div className="row">
            <span>가입일</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={toggleNicknameEdit}>
            {nicknameOpen ? "취소" : "닉네임 변경"}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={togglePasswordEdit}>
            {passwordOpen ? "취소" : "비밀번호 변경"}
          </button>
        </div>

        {nicknameOpen && (
          <div className="profile-edit-panel">
            <div className="field">
              <label htmlFor="nick-input">새 닉네임</label>
              <input
                id="nick-input"
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={30}
                autoFocus
              />
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={nicknameLoading}
              onClick={handleNicknameSave}
            >
              {nicknameLoading ? "저장 중..." : "저장"}
            </button>
          </div>
        )}

        {passwordOpen && (
          <div className="profile-edit-panel">
            <div className="field">
              <label htmlFor="cur-pw">현재 비밀번호</label>
              <input
                id="cur-pw"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="new-pw">새 비밀번호</label>
              <input
                id="new-pw"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                minLength={8}
                maxLength={20}
              />
              <span className="field-hint">8~20자로 입력해주세요</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={passwordLoading}
              onClick={handlePasswordSave}
            >
              {passwordLoading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </div>
        )}

        <div className="mypage-footer">
          <button type="button" className="btn btn-danger-outline btn-block" onClick={handleLogout}>
            로그아웃
          </button>
          <button type="button" className="btn btn-ghost-danger btn-block" onClick={() => setDeleteOpen(true)}>
            계정 삭제
          </button>
        </div>
      </div>

      {deleteOpen && (
        <Modal onClose={() => !deleteLoading && setDeleteOpen(false)}>
          <div className="modal-title">정말 계정을 삭제하시겠습니까?</div>
          <p className="modal-desc">삭제하면 모든 데이터가 영구적으로 제거됩니다. 되돌릴 수 없어요.</p>
          <div className="field">
            <label htmlFor="delete-pw">비밀번호 확인</label>
            <input
              id="delete-pw"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={deleteLoading}
              onClick={() => setDeleteOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn-danger-outline"
              disabled={deleteLoading}
              onClick={handleDeleteAccount}
            >
              {deleteLoading ? "삭제 중..." : "계정 삭제"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
