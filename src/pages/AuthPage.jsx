import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { ApiError } from "../api/client.js";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <span className="wordmark">Meetory</span>
        <div>
          <h1>
            <br />
            <br />
            <br />
            <br />
            사람을 만나고, 
            <br />
            함께 추억을 만들어가는 공간
            <br />
            <span className="em">모든 만남에는 하나의 이야기가 있습니다.</span>
            <br />
            <br />
            <br />
          </h1>
          <div className="auth-stat-row" style={{ marginTop: 40,  justifySelf: "end" }}>
            <div>
              <div className="stat-num">01</div>
              <div className="stat-label">모임 개설 및 신청</div>
            </div>
            <div>
              <div className="stat-num">02</div>
              <div className="stat-label">수락/거절 및 문의</div>
            </div>
            <div>
              <div className="stat-num">03</div>
              <div className="stat-label">모임 참여</div>
            </div>
          </div>
        </div>
        <div />
      </div>

      <div className="auth-panel">
        {mode === "login" ? <LoginCard onSwitch={() => setMode("signup")} /> : <SignupCard onSwitch={() => setMode("login")} />}
      </div>
    </div>
  );
}

function LoginCard({ onSwitch }) {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      toast(`${data.nickname}님, 환영합니다`, "ok");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="kicker">Sign in</div>
      <h2>다시 만나서 반가워요</h2>

      {error && <div className="auth-banner err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="li-email">이메일</label>
          <input id="li-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="li-pw">비밀번호</label>
          <input id="li-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="auth-switch">
        아직 계정이 없으신가요? <button onClick={onSwitch}>회원가입</button>
      </div>
    </div>
  );
}

function SignupCard({ onSwitch }) {
  const { signupAndLogin } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "", nickname: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signupAndLogin(form.email, form.password, form.nickname);
      toast(`${user.nickname}님, 환영합니다!`, "ok");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "회원가입에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="kicker">Create account</div>
      <h2>모임을 시작해보세요</h2>

      {error && <div className="auth-banner err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="su-email">이메일</label>
          <input id="su-email" type="email" value={form.email} onChange={update("email")} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="su-pw">비밀번호</label>
          <input id="su-pw" type="password" value={form.password} onChange={update("password")} required minLength={8} maxLength={20} />
          <span className="field-hint">8~20자로 입력해주세요</span>
        </div>
        <div className="field">
          <label htmlFor="su-nick">닉네임</label>
          <input id="su-nick" type="text" value={form.nickname} onChange={update("nickname")} required maxLength={30} />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <div className="auth-switch">
        이미 계정이 있으신가요? <button onClick={onSwitch}>로그인</button>
      </div>
    </div>
  );
}
