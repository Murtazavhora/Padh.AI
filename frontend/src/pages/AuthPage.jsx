import { useState } from "react";

export default function AuthPage({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const handleAuth = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? "login" : "signup";
     
      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Something went wrong");
        setLoading(false);
        return;
      }
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_id", data.user_id);
      }
      alert(data.message || "Success");
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Borel&family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        .padh-root {
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* BACKGROUND — study desk/books */
        .padh-bg {
          position: fixed; inset: 0; z-index: 0;
          background-image: url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80');
          background-size: cover;
          background-position: center;
        }
        .padh-bg-overlay {
          position: fixed; inset: 0; z-index: 1;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.82) 0%,
            rgba(0,0,0,0.70) 40%,
            rgba(0,0,0,0.60) 100%
          );
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }

        /* NAVBAR */
        .padh-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 40px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%);
        }

        /* BRAND */
        .brand.padh,
        .brand.dot,
        .brand.ai {
          font-family: 'Borel', cursive;
          font-size: clamp(24px, 6vw, 31px);
          font-weight: 400;
          line-height: 1.2;
          display: inline-block;
        }
        .brand.padh { color: #FACC15; }
        .brand.dot  { color: #FFFFFF; }
        .brand.ai   { color: #D9D9D9; text-transform: uppercase; }

        .padh-about-btn {
          font-size: 15px; color: #ffffff; cursor: pointer;
          font-weight: 400; background: none; border: none;
          font-family: 'Inter', sans-serif;
        }
        .padh-about-btn span { color: #FACC15; }

        .padh-nav .brand.dot {
          position: relative;
          top: -5px;
        }

        /* MAIN */
        .padh-main {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          min-height: 100vh;
          padding: 90px 60px 40px 60px;
          gap: 40px;
        }

        /* LEFT */
        .padh-left { flex: 1; max-width: 580px; color: #fff; }

        .padh-headline {
          font-size: clamp(34px, 4.5vw, 54px);
          font-weight: 800; line-height: 1.1; margin-bottom: 20px; color: #ffffff;
        }
        .padh-headline-teal { color: #2DD4BF; }

        .padh-desc {
          font-size: 16px; color: rgba(255,255,255,0.8);
          line-height: 1.75; margin-bottom: 14px; max-width: 500px;
        }
        .padh-desc-highlight {
          color: #2DD4BF;
          font-weight: 600;
        }

        .padh-teal-line {
          width: 56px; height: 3px; background: #2DD4BF;
          border-radius: 2px; margin-bottom: 44px;
        }

        /* FEATURES */
        .padh-features { display: flex; gap: 0; align-items: flex-start; }
        .padh-feature {
          display: flex; align-items: flex-start; gap: 14px;
          flex: 1; padding-right: 24px; position: relative;
        }
        .padh-feature:not(:last-child)::after {
          content: ''; position: absolute; right: 0; top: 4px; bottom: 4px;
          width: 1px; background: rgba(255,255,255,0.2);
        }
        .padh-feature:not(:first-child) { padding-left: 24px; }
        .padh-feature:last-child { padding-right: 0; }

        .padh-feat-icon {
          width: 44px; height: 44px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .padh-feat-icon svg { width: 22px; height: 22px; }
        .icon-bg-teal   { background: rgba(45,212,191,0.18); }
        .icon-bg-green  { background: rgba(74,222,128,0.18); }
        .icon-bg-purple { background: rgba(167,139,250,0.18); }

        .padh-feat-title { font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px; }
        .padh-feat-desc  { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; }

        
        
        /* ===================== AUTH CARD — GLASSMORPHISM ===================== */
        .padh-right {
          flex-shrink: 0;
          width: 420px;
          filter: drop-shadow(0 0 50px rgba(45,212,191,0.15));
        }

        .padh-card {
          background: rgba(15, 20, 30, 0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          padding: 40px 36px 36px;
          box-shadow:
            0 0 0 1px rgba(45,212,191,0.08),
            0 32px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .padh-card-icon-wrap {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(45,212,191,0.15);
          border: 1.5px solid rgba(45,212,191,0.35);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 0 28px rgba(45,212,191,0.25);
        }
        .padh-card-icon-wrap svg { width: 36px; height: 36px; color: #2DD4BF; }

        .padh-card-title {
          font-size: 23px; font-weight: 800; color: #ffffff;
          text-align: center; margin-bottom: 6px;
          letter-spacing: -0.3px;
        }
        .padh-card-sub {
          font-size: 13.5px; color: rgba(255,255,255,0.5);
          text-align: center; margin-bottom: 30px;
        }

        /* FIELD LABELS */
        .padh-field-label {
          display: block; font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.8); margin-bottom: 8px;
        }
        .padh-field-wrap {
          position: relative; display: flex; align-items: center; margin-bottom: 18px;
        }

        .padh-field-icon {
          position: absolute; left: 14px; color: rgba(255,255,255,0.4);
          display: flex; align-items: center; pointer-events: none;
        }
        .padh-field-icon svg { width: 17px; height: 17px; }

        /* INPUTS — dark glass style */
        .padh-input {
          width: 100%; padding: 13px 14px 13px 44px;
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          background: rgba(255,255,255,0.07);
          color: #ffffff;
          font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .padh-input:focus {
          border-color: #2DD4BF;
          background: rgba(255,255,255,0.10);
          box-shadow: 0 0 0 3px rgba(45,212,191,0.18);
        }
        .padh-input::placeholder { color: rgba(255,255,255,0.28); }

        .padh-eye {
          position: absolute; right: 13px; background: none; border: none;
          cursor: pointer; color: rgba(255,255,255,0.4);
          display: flex; align-items: center; padding: 0;
          transition: color 0.2s;
        }
        .padh-eye:hover { color: #2DD4BF; }
        .padh-eye svg { width: 18px; height: 18px; }

        .padh-forgot-row { display: flex; justify-content: flex-end; margin-top: -10px; margin-bottom: 24px; }
        .padh-forgot {
          font-size: 13px; color: #2DD4BF; cursor: pointer; font-weight: 500;
          background: none; border: none; font-family: 'Inter', sans-serif;
          transition: opacity 0.2s;
        }
        .padh-forgot:hover { opacity: 0.75; }

        /* LOGIN BUTTON — gradient + glow */
        .padh-btn-login {
          width: 100%; padding: 15px;
          background: linear-gradient(90deg, #2DD4BF 0%, #0ea5e9 100%);
          color: #000000; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 800; font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          letter-spacing: 0.2px;
          box-shadow:
            0 0 24px rgba(45,212,191,0.45),
            0 6px 20px rgba(0,0,0,0.35);
          transition: box-shadow 0.25s, transform 0.15s, opacity 0.2s;
        }
        .padh-btn-login:hover {
          box-shadow:
            0 0 36px rgba(45,212,191,0.65),
            0 8px 28px rgba(0,0,0,0.4);
          transform: translateY(-2px);
        }
        .padh-btn-login:active { transform: scale(0.98); }
        .padh-btn-login:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .padh-btn-arrow svg { width: 20px; height: 20px; }

        .padh-switch-row {
          text-align: center; margin-top: 22px;
          font-size: 14px; color: rgba(255,255,255,0.45);
        }
        .padh-switch-link {
          color: #2DD4BF; font-weight: 700; cursor: pointer;
          background: none; border: none; font-size: 14px;
          font-family: 'Inter', sans-serif; margin-left: 4px;
          transition: opacity 0.2s;
        }
        .padh-switch-link:hover { opacity: 0.75; }

        /* ===================== HEADLINE BRAND SIZE ===================== */
        .padh-headline .brand.padh,
        .padh-headline .brand.dot,
        .padh-headline .brand.ai {
          font-size: clamp(40px, 5.5vw, 55px);
          line-height: 1;
          position: relative;
          top: 18px;
        }
        .padh-headline .brand.dot { top: 4px; }

        /* ===================== ABOUT MODAL ===================== */
        .padh-modal-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.65);
          display: flex; align-items: center; justify-content: center; padding: 24px;
          backdrop-filter: blur(4px);
        }
        .padh-modal {
          background: #0f141e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; padding: 44px 48px;
          max-width: 560px; width: 100%; position: relative;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(45,212,191,0.08);
        }
        .padh-modal-close {
          position: absolute; top: 18px; right: 20px;
          background: none; border: none; font-size: 20px; cursor: pointer;
          color: rgba(255,255,255,0.4); line-height: 1; transition: color 0.2s;
        }
        .padh-modal-close:hover { color: #ffffff; }
        .padh-modal-brand { margin-bottom: 18px; }
        .padh-modal-headline {
          font-size: 22px; font-weight: 800; color: #ffffff;
          margin-bottom: 14px; line-height: 1.3;
        }
        .padh-modal-body {
          font-size: 15px; color: rgba(255,255,255,0.65);
          line-height: 1.75; margin-bottom: 24px;
        }
        .padh-modal-features { display: flex; flex-direction: column; gap: 12px; }
        .padh-modal-feat { display: flex; align-items: flex-start; gap: 12px; }
        .padh-modal-feat-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #2DD4BF; flex-shrink: 0; margin-top: 7px;
        }
        .padh-modal-feat-text {
          font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.6;
        }
        .padh-modal-feat-text strong { color: #ffffff; font-weight: 700; }
        .padh-modal-footer {
          margin-top: 28px; padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
          font-size: 13.5px; color: rgba(255,255,255,0.35); text-align: center;
        }
      `}</style>

      <div className="padh-root">
        <div className="padh-bg" />
        <div className="padh-bg-overlay" />

        {/* Navbar */}
        <nav className="padh-nav">
          <div>
            <div>
              <span className="brand padh">Padh</span>
              <span className="brand dot">.</span>
              <span className="brand ai">AI</span>
            </div>
            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.45)', marginTop:'-20px', letterSpacing:'0.3px', fontFamily:"cursive"}}>
              Your AI Learning Companion
            </div>
          </div>
          <button className="padh-about-btn" onClick={() => setShowAbout(true)}>
            About <span>Padh.AI</span>
          </button>
        </nav>

        {/* Main */}
        <div className="padh-main">

          {/* LEFT */}
          <div className="padh-left">
            <h1 className="padh-headline">
              You focus.<br />
              <span className="padh-headline-teal">
                <span className="brand padh">Padh</span>
                <span className="brand dot">.</span>
                <span className="brand ai">AI</span>
              </span> handles the chaos.
            </h1>

            <p className="padh-desc">
              Upload your study materials, get smart summaries,<br />
              practice with quizzes, and learn conceptually<br />
              with AI that{" "}
              <span className="padh-desc-highlight">guides you — not replaces you.</span>
            </p>

            <div className="padh-teal-line" />

            <div className="padh-features">
              <div className="padh-feature">
                <div className="padh-feat-icon icon-bg-teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2"/>
                    <line x1="8" y1="8" x2="16" y2="8"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                    <line x1="8" y1="16" x2="12" y2="16"/>
                  </svg>
                </div>
                <div>
                  <div className="padh-feat-title">Smart Summaries</div>
                  <div className="padh-feat-desc">Extract key points<br/>in seconds</div>
                </div>
              </div>

              <div className="padh-feature">
                <div className="padh-feat-icon icon-bg-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/>
                  </svg>
                </div>
                <div>
                  <div className="padh-feat-title">Interactive Quizzes</div>
                  <div className="padh-feat-desc">Practice and test<br/>your knowledge</div>
                </div>
              </div>

              <div className="padh-feature">
                <div className="padh-feat-icon icon-bg-purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3Z"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3Z"/>
                  </svg>
                </div>
                <div>
                  <div className="padh-feat-title">Conceptual Learning</div>
                  <div className="padh-feat-desc">Think deeper with<br/>guided questions</div>
                </div>
              </div>
            </div>
          </div>

          {/* AUTH CARD */}
          <div className="padh-right">
            <div className="padh-card">

              <div className="padh-card-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3.33 2 8.67 2 12 0v-5"/>
                </svg>
              </div>

              <div className="padh-card-title">
                {isLogin ? "Welcome " : "Create Account"}
              </div>
              <div className="padh-card-sub">
                {isLogin
                  ? "Login to continue your learning journey"
                  : "Join and start your learning journey"}
              </div>

              <label className="padh-field-label">Email Address</label>
              <div className="padh-field-wrap">
                <span className="padh-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input
                  className="padh-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <label className="padh-field-label">Password</label>
              <div className="padh-field-wrap">
                <span className="padh-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  className="padh-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 44 }}
                />
                <button className="padh-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {isLogin && (
                <div className="padh-forgot-row">
                  <button className="padh-forgot">Forgot password?</button>
                </div>
              )}

              <button
                className="padh-btn-login"
                onClick={handleAuth}
                disabled={loading}
              >
                <span>{loading ? "Please wait..." : isLogin ? "Login" : "Sign up"}</span>
                {!loading && (
                  <span className="padh-btn-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                )}
              </button>

              <div className="padh-switch-row">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button className="padh-switch-link" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Sign up" : "Login"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About Modal */}
        {showAbout && (
          <div className="padh-modal-backdrop" onClick={() => setShowAbout(false)}>
            <div className="padh-modal" onClick={(e) => e.stopPropagation()}>
              <button className="padh-modal-close" onClick={() => setShowAbout(false)}>&#x2715;</button>

              <div className="padh-modal-brand">
                <span className="brand padh">Padh</span>
                <span className="brand dot">.</span>
                <span className="brand ai">AI</span>
              </div>

              <div className="padh-modal-headline">Your AI-powered study companion</div>

              <p className="padh-modal-body">
                Padh.AI is built for students who want to study smarter, not harder.
                Upload your notes, textbooks, or PDFs and let our AI do the heavy lifting —
                so you can focus on actually understanding the material.
              </p>

              <div className="padh-modal-features">
                {[
                  ["Smart Summaries", "Instantly condense lengthy documents into clear, concise notes tailored to what matters most."],
                  ["Interactive Quizzes", "Auto-generated quizzes from your own material to actively test and reinforce your understanding."],
                  ["Conceptual Learning", "AI-guided questions that push you to think deeper and connect ideas, not just memorize facts."],
                  ["AI Assistant", "Ask anything about your uploaded material and get instant, contextual answers grounded in your content."],
                ].map(([title, desc]) => (
                  <div className="padh-modal-feat" key={title}>
                    <div className="padh-modal-feat-dot" />
                    <div className="padh-modal-feat-text">
                      <strong>{title}</strong> — {desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="padh-modal-footer">
                Built for students, by people who have been there. Study with purpose.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}