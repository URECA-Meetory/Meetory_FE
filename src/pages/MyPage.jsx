import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function MyPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  if (!user) return null;

  const initial = user.nickname?.charAt(0) ?? "?";

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
          <p className="sub">내 계정 정보를 확인할 수 있어요.</p>
        </div>
      </div>

      <div className="mypage-card">
        <div className="mypage-row">
          <div className="avatar-badge">{initial}</div>
          <div>
            <h2>{user.nickname}</h2>
            <div className="uid">USER ID · {user.userId}</div>
          </div>
        </div>

        <div className="info-list">
          <div className="row">
            <span>닉네임</span>
            <span>{user.nickname}</span>
          </div>
          <div className="row">
            <span>회원 번호</span>
            <span>{user.userId}</span>
          </div>
        </div>

        <button className="btn btn-danger-outline btn-block" style={{ marginTop: 24 }} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </main>
  );
}