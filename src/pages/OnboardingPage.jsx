import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { ApiError } from "../api/client.js";

const GENDERS = ["남성", "여성", "기타", "비공개"];

export default function OnboardingPage() {
  const { user, completeOnboarding, skipOnboarding } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ age: "", gender: "", hobbies: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);

  if (!user) return null;

  function update(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await completeOnboarding({
        age: form.age ? Number(form.age) : null,
        gender: form.gender || null,
        hobbies: form.hobbies || null,
      });
      toast("프로필이 저장되었습니다. 환영합니다!", "ok");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "프로필 저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    setError("");
    setSkipping(true);
    try {
      await skipOnboarding();
      toast("나중에 마이페이지에서 프로필을 채울 수 있어요", "ok");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "요청에 실패했습니다");
    } finally {
      setSkipping(false);
    }
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <div className="kicker">Welcome</div>
        <h1>
          {user.nickname}님, 반가워요!
          <br />
          <span className="onboarding-sub">프로필을 완성해 보세요</span>
        </h1>
        <p className="onboarding-desc">
          나이, 성별, 취미를 입력하면 비슷한 관심사를 가진 사람들과 모임을 찾기 쉬워요. 지금은 건너뛰어도 괜찮아요.
        </p>

        {error && <div className="auth-banner err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="ob-age">나이</label>
            <input
              id="ob-age"
              type="number"
              min={14}
              max={100}
              value={form.age}
              onChange={update("age")}
              placeholder="예: 28"
            />
            <span className="field-hint">14~100세</span>
          </div>

          <div className="field">
            <label htmlFor="ob-gender">성별</label>
            <select id="ob-gender" value={form.gender} onChange={update("gender")}>
              <option value="">선택해주세요</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="ob-hobbies">취미</label>
            <input
              id="ob-hobbies"
              type="text"
              value={form.hobbies}
              onChange={update("hobbies")}
              placeholder="예: 독서, 등산, 요가"
              maxLength={255}
            />
            <span className="field-hint">쉼표(,)로 구분해서 입력해주세요</span>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || skipping}>
            {loading ? "저장 중..." : "프로필 저장하고 시작하기"}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-ghost-skip btn-block"
          disabled={loading || skipping}
          onClick={handleSkip}
        >
          {skipping ? "건너뛰는 중..." : "나중에 할게요"}
        </button>
      </div>
    </div>
  );
}
