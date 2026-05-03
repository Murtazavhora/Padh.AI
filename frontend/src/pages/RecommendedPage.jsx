import { useState, useEffect, useRef } from "react";
import "./RecommendedPage.css";

const API = "http://localhost:8000/api";

// ─── Illustration SVG (right-side panel) ────────────────────────────────────
function StudyIllustration() {
  return (
    <div className="rec-illustration">
      <div className="rec-illu-bg">
        <div className="rec-illu-inner">
          <div className="rec-illu-scene">
            {/* Floating bubbles */}
            <div className="rec-illu-bubble q">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="13" r="9" stroke="#9ca3af" strokeWidth="1.5" />
                <path d="M15 22v4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 11.5a3 3 0 1 1 3 3v2" stroke="#f5c75a" strokeWidth="2" strokeLinecap="round" />
                <circle cx="15" cy="18" r="1" fill="#f5c75a" />
              </svg>
            </div>
            <div className="rec-illu-bubble bulb">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2a7 7 0 0 1 4 12.8V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.2A7 7 0 0 1 12 2z"
                  stroke="#f5c75a" strokeWidth="1.5" />
                <path d="M9 21h6" stroke="#f5c75a" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="rec-illu-bubble pencil">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="#6ee7a0" strokeWidth="1.5">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </div>

            {/* Stacked books */}
            <div className="rec-illu-books">
              <div className="rec-illu-book" style={{ width: 130, height: 18, background: "#4b5563" }} />
              <div className="rec-illu-book" style={{ width: 142, height: 22, background: "#6b7280" }} />
              <div className="rec-illu-book" style={{ width: 136, height: 20, background: "#374151" }} />
            </div>

            {/* Plant */}
            <svg width="64" height="72" viewBox="0 0 64 72" fill="none" style={{ marginTop: 6 }}>
              <rect x="22" y="52" width="20" height="16" rx="3" fill="#374151" />
              <rect x="25" y="48" width="14" height="8" rx="2" fill="#4b5563" />
              <path d="M32 48c0 0-12-18-8-34 8 4 10 20 8 34z" fill="#2d6a4f" opacity="0.9" />
              <path d="M32 48c0 0 12-18 8-34-8 4-10 20-8 34z" fill="#40916c" opacity="0.9" />
              <path d="M32 48c0 0-8-10-14-8 2 8 12 10 14 8z" fill="#52b788" />
              <path d="M32 48c0 0 8-10 14-8-2 8-12 10-14 8z" fill="#74c69d" />
            </svg>

            {/* Open book */}
            <svg width="150" height="62" viewBox="0 0 150 62" fill="none" style={{ marginTop: 4 }}>
              <path d="M75 10 C55 10 12 15 12 52 L75 52 L138 52 C138 15 95 10 75 10z"
                fill="#1f2937" stroke="#374151" strokeWidth="1" />
              <line x1="75" y1="10" x2="75" y2="52" stroke="#4b5563" strokeWidth="1" />
              <line x1="28" y1="26" x2="66" y2="26" stroke="#6b7280" strokeWidth="1" />
              <line x1="24" y1="33" x2="67" y2="33" stroke="#6b7280" strokeWidth="1" />
              <line x1="26" y1="40" x2="66" y2="40" stroke="#6b7280" strokeWidth="1" />
              <line x1="83" y1="26" x2="122" y2="26" stroke="#6b7280" strokeWidth="1" />
              <line x1="81" y1="33" x2="124" y2="33" stroke="#6b7280" strokeWidth="1" />
              <line x1="82" y1="40" x2="123" y2="40" stroke="#6b7280" strokeWidth="1" />
              <path d="M12 52 C12 56 42 58 75 58 C108 58 138 56 138 52"
                fill="#111827" stroke="#374151" strokeWidth="1" />
              <rect x="73" y="50" width="4" height="10" rx="1" fill="#374151" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function App({ onBack }) {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [mode, setMode] = useState("topic");
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/documents/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    window.addEventListener("documentsUpdated", fetchDocuments);
    return () => window.removeEventListener("documentsUpdated", fetchDocuments);
  }, []);

  // File upload
  const uploadFile = async (file) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSelectedDoc({ id: data.id, file_name: file.name });
      window.dispatchEvent(new Event("documentsUpdated"));
      setShowModal(false);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  // Generate questions
  const generateQuestions = async () => {
    if (mode === "topic" && !topic.trim()) return;
    if (mode === "pdf" && !selectedDoc) return;
    setLoading(true);
    setDifficulty(1);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/conceptual/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic || "",
          document_id: selectedDoc?.id || null,
          difficulty_level: 1,
        }),
      });
      const data = await res.json();
      const newQuestions = data?.questions || [];
      setAllQuestions(newQuestions);
      setQuestions(newQuestions);
      setIndex(0);
      setAnswer("");
      setEvaluation(null);
      setAnswers([]);
      setResults([]);
      setShowQuiz(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Generate more questions
  const generateMore = async () => {
    if (difficulty >= 3) return;
    const nextLevel = difficulty + 1;
    setDifficulty(nextLevel);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/conceptual/generate-more`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic || "",
          document_id: selectedDoc?.id || null,
          current_questions: allQuestions || [],
          difficulty_level: nextLevel,
        }),
      });
      const data = await res.json();
      const more = data?.questions || [];
      const updated = [...allQuestions, ...more];
      setAllQuestions(updated);
      setQuestions(updated);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Submit answer
  const submitAnswer = async () => {
    setEvaluating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/conceptual/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: questions[index], answer }),
      });
      const data = await res.json();
      setEvaluation(data);
      const updatedAnswers = [...answers];
      updatedAnswers[index] = answer;
      setAnswers(updatedAnswers);
      const updatedResults = [...results];
      updatedResults[index] = data;
      setResults(updatedResults);
    } catch (e) {
      console.error(e);
    }
    setEvaluating(false);
  };

  // Navigation
  const nextQuestion = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setAnswer(answers[nextIndex] || "");
    setEvaluation(results[nextIndex] || null);
  };

  const retryQuestion = () => {
    setAnswer("");
    setEvaluation(null);
    const updatedResults = [...results];
    updatedResults[index] = null;
    setResults(updatedResults);
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuestions([]);
    setAllQuestions([]);
    setIndex(0);
    setAnswer("");
    setEvaluation(null);
    setAnswers([]);
    setResults([]);
    setTopic("");
    setSelectedDoc(null);
    setDifficulty(1);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    window.history.back();
  };

  const goToQuestion = (i) => {
    setIndex(i);
    setAnswer(answers[i] || "");
    setEvaluation(results[i] || null);
  };

  const completedCount = answers.filter((a) => a && a.trim()).length;
  const progress = questions.length ? (completedCount / questions.length) * 100 : 0;

  // ─── Landing Page ──────────────────────────────────────────────────────────
  if (!showQuiz) {
    return (
      <div className="rec-app">
        {/* Nav */}
        <nav className="rec-nav">
          <div className="rec-logo">Padh<span>.AI</span></div>
        </nav>

        {/* Two-column body */}
        <div className="rec-landing-body">
          {/* ── Left ── */}
          <div className="rec-landing-left">
            <p className="rec-hero-tag">Active Learning Platform</p>
            <h1 className="rec-hero-title">
              Test your <em>understanding</em>
            </h1>
            <p className="rec-hero-subtitle">
              Generate conceptual questions and challenge yourself.<br />
              Learn actively, think independently.
            </p>

            <p className="rec-section-label">Choose how you want to practice</p>
            <div className="rec-practice-cards">
              <div
                className="rec-practice-card"
                onClick={() => { setMode("topic"); }}
              >
                <div className="rec-card-icon topic">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <div>
                  <h3>Search by Topic</h3>
                  <p>Enter any topic and get conceptual questions to test your understanding.</p>
                </div>
                <div className="rec-card-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>

              <div
                className="rec-practice-card"
                onClick={() => { setMode("pdf"); setShowModal(true); }}
              >
                <div className="rec-card-icon doc">
                  <i className="fa-solid fa-file-lines"></i>
                </div>
                <div>
                  <h3>Upload Document</h3>
                  <p>Upload your notes or PDFs and generate questions from your study material.</p>
                </div>
                <div className="rec-card-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </div>

            {/* Active input area based on mode */}
            {mode === "topic" && (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "#1a1b1d", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "6px 6px 6px 16px",
                }}>
                  <input
                    type="text"
                    placeholder="e.g., Artificial Intelligence, React.js..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && generateQuestions()}
                    style={{
                      flex: 1, background: "transparent", border: "none",
                      padding: "10px 0", fontSize: 14, color: "#e5e7eb",
                      outline: "none", fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={generateQuestions}
                    disabled={loading || !topic.trim()}
                    style={{
                      background: loading || !topic.trim() ? "rgba(245,199,90,0.3)" : "#f5c75a",
                      border: "none", padding: "10px 22px", borderRadius: 10,
                      color: "#111112", fontWeight: 700, fontSize: 13,
                      cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
                      fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap",
                    }}
                  >
                    {loading ? "Generating..." : "Generate →"}
                  </button>
                </div>
              </div>
            )}

            {mode === "pdf" && selectedDoc && (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#1a1b1d", border: "1px solid rgba(245,199,90,0.2)",
                  borderRadius: 14, padding: "14px 16px", marginBottom: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#e5e7eb", fontSize: 14 }}>
                    <i className="fa-solid fa-file-pdf" style={{ color: "#f5c75a" }}></i>
                    {selectedDoc.file_name}
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      background: "transparent", border: "none", color: "#6b7280",
                      fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Change
                  </button>
                </div>
                <button
                  onClick={generateQuestions}
                  disabled={loading}
                  style={{
                    width: "100%", background: "#f5c75a", border: "none",
                    padding: "13px", borderRadius: 12, color: "#111112",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.2s",
                  }}
                >
                  {loading ? "Processing..." : "Generate Questions →"}
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Illustration ── */}
          <div className="rec-landing-right">
            <div className="rec-hero-panel">
              <button className="rec-back-btn rec-back-btn-hero" onClick={handleBack}>
                <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }}></i>
                Back
              </button>
              <div className="rec-hero-stage">
                <img src="/src/assets/study-hero.png" alt="" className="rec-hero-img" />
              </div>
            </div>
          </div>
        </div>

        {/* Document Modal */}
        {showModal && (
          <div className="rec-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="rec-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="rec-modal-header">
                <h3>Select Document</h3>
                <button className="rec-modal-close" onClick={() => setShowModal(false)}>
                  &times;
                </button>
              </div>
              <div className="rec-document-list">
                <label className="rec-modal-upload-btn">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    hidden
                    ref={fileInputRef}
                  />
                  <i className="fa-solid fa-plus"></i> Upload New PDF
                </label>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rec-doc-item"
                    onClick={() => { setSelectedDoc(doc); setShowModal(false); }}
                  >
                    <i className="fa-solid fa-file-lines"></i>
                    <span>{doc.file_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Quiz Page ─────────────────────────────────────────────────────────────
  return (
    <div className="rec-app">
      <nav className="rec-nav rec-quiz-nav">
        <button className="rec-back-btn" onClick={handleBack}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }}></i>
          Back
        </button>
        <div className="rec-logo">Padh<span>.AI</span></div>
      </nav>

      <div className="rec-quiz-container">
        {/* Quiz Header */}
        <div className="rec-quiz-header">
          <button className="rec-back-home" onClick={handleBack}>
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>

          <div className="rec-question-nav-wrapper">
            <div className="rec-question-nav">
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`rec-q-dot ${index === i ? "active" : ""} ${answers[i] ? "done" : ""}`}
                  onClick={() => goToQuestion(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="rec-quiz-progress">
            <div className="rec-progress-text">
              {completedCount} / {questions.length} Completed
            </div>
            <div className="rec-progress-bar">
              <div className="rec-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="rec-question-card">
          <div className="rec-question-badge">
            Question {index + 1} · Level {difficulty}
          </div>
          <h2 className="rec-question-text">{questions[index]}</h2>

          <textarea
            className="rec-answer-input"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setEvaluation(null);
            }}
            placeholder="Write your answer here..."
          />

          {evaluating && (
            <div className="rec-evaluating">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>Evaluating your answer...</span>
            </div>
          )}

          {!evaluation && !evaluating && (
            <button
              className="rec-submit-btn"
              onClick={submitAnswer}
              disabled={!answer.trim()}
            >
              Submit Answer <i className="fa-solid fa-paper-plane"></i>
            </button>
          )}

          {evaluation && (
            <div className="rec-evaluation">
              <div className="rec-score-card">
                <div className="rec-score-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="#f5c75a" strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (evaluation.percentage || 0) / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <div className="rec-score-text">
                    <span className="rec-score-value">{evaluation.percentage || 0}</span>
                    <span className="rec-score-unit">%</span>
                  </div>
                </div>
                <div className="rec-score-badge">{evaluation.correctness}</div>
              </div>

              <div className="rec-feedback-list">
                <div className="rec-feedback-item feedback">
                  <i className="fa-solid fa-lightbulb"></i>
                  <div>
                    <strong>AI Feedback</strong>
                    <p>{evaluation.feedback}</p>
                  </div>
                </div>

                {evaluation.wrong && (
                  <div className="rec-feedback-item missing">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <div>
                      <strong>What's Missing / Incorrect</strong>
                      <p>{evaluation.wrong}</p>
                    </div>
                  </div>
                )}

                {evaluation.correct_answer && (
                  <div className="rec-feedback-item correct">
                    <i className="fa-solid fa-circle-check"></i>
                    <div>
                      <strong>Model Answer</strong>
                      <p>{evaluation.correct_answer}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rec-action-buttons">
                <button className="rec-btn-retry" onClick={retryQuestion}>
                  <i className="fa-solid fa-rotate-left"></i> Try Again
                </button>

                {index < questions.length - 1 ? (
                  <button className="rec-btn-next" onClick={nextQuestion}>
                    Next Question <i className="fa-solid fa-arrow-right"></i>
                  </button>
                ) : (
                  <div className="rec-finish-group">
                    {difficulty < 3 && (
                      <button
                        className="rec-btn-more"
                        onClick={generateMore}
                        disabled={loading}
                      >
                        <i className="fa-solid fa-arrow-up-right-dots"></i>
                        {loading ? "Leveling up..." : "More (Next Level)"}
                      </button>
                    )}
                    <button className="rec-btn-finish" onClick={resetQuiz}>
                      <i className="fa-solid fa-flag-checkered"></i> Finish
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}