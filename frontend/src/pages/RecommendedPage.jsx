import { useState, useEffect, useRef } from "react";
import "./RecommendedPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {
  // State
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
  const [maxReached, setMaxReached] = useState(0);
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
      const res = await fetch(`${API_BASE}/api/documents/`, {
        headers: { Authorization: `Bearer ${token}` }
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

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
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
      const res = await fetch(`${API_BASE}/api/conceptual/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: topic || "",
          document_id: selectedDoc?.id || null,
          difficulty_level: 1
        })
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
      setMaxReached(0);
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
      const res = await fetch(`${API_BASE}/api/conceptual/generate-more`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: topic || "",
          document_id: selectedDoc?.id || null,
          current_questions: allQuestions || [],
          difficulty_level: nextLevel
        })
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
      const res = await fetch(`${API_BASE}/api/conceptual/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: questions[index],
          answer
        })
      });

      const data = await res.json();
      setEvaluation(data);
      
      const updatedAnswers = [...answers];
      updatedAnswers[index] = answer;
      setAnswers(updatedAnswers);
      
      const updatedResults = [...results];
      updatedResults[index] = data;
      setResults(updatedResults);
      
      if (index + 1 > maxReached) setMaxReached(index + 1);
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
    setMaxReached(0);
    setTopic("");
    setSelectedDoc(null);
    setDifficulty(1);
  };

  const goToQuestion = (i) => {
    setIndex(i);
    setAnswer(answers[i] || "");
    setEvaluation(results[i] || null);
  };

  const completedCount = answers.filter(a => a && a.trim()).length;
  const progress = questions.length ? (completedCount / questions.length) * 100 : 0;

  // Landing Page
  if (!showQuiz) {
    return (
      <div className="rec-app">
        <div className="rec-container">
          <div className="rec-hero">
            <h1 className="rec-hero-title">Test your understanding</h1>
            <p className="rec-hero-subtitle">
              Generate AI-powered questions and get instant feedback
            </p>
          </div>

          <div className="rec-mode-toggle">
            <button 
              className={`rec-mode-toggle-btn ${mode === 'topic' ? 'active' : ''}`}
              onClick={() => setMode('topic')}
            >
              Topic Search
            </button>
            <button 
              className={`rec-mode-toggle-btn ${mode === 'pdf' ? 'active' : ''}`}
              onClick={() => setMode('pdf')}
            >
              Upload Document
            </button>
          </div>

          <div className="rec-input-area">
            {mode === 'topic' ? (
              <div className="rec-search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="e.g., Artificial Intelligence, React.js..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateQuestions()}
                />
                <button onClick={generateQuestions} disabled={loading || !topic.trim()}>
                  {loading ? 'Generating...' : 'Generate →'}
                </button>
              </div>
            ) : (
              <div className="rec-pdf-area">
                <div className="rec-upload-area" onClick={() => setShowModal(true)}>
                  <div className="rec-upload-content">
                    <i className="fa-solid fa-file-pdf"></i>
                    <span>{selectedDoc ? selectedDoc.file_name : 'Click to choose or upload document'}</span>
                  </div>
                </div>
                <button onClick={generateQuestions} disabled={loading || !selectedDoc}>
                  {loading ? 'Processing...' : 'Generate →'}
                </button>
              </div>
            )}
          </div>

          <div className="rec-promo-grid">
            <div className="rec-promo-card">
              <span className="rec-promo-icon">🤖</span>
              <div className="rec-promo-text"><h4>AI-Powered</h4></div>
            </div>
            <div className="rec-promo-card">
              <span className="rec-promo-icon">📊</span>
              <div className="rec-promo-text"><h4>Instant Feedback</h4></div>
            </div>
            <div className="rec-promo-card">
              <span className="rec-promo-icon">🎯</span>
              <div className="rec-promo-text"><h4>Adaptive Learning</h4></div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="rec-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="rec-modal-content" onClick={e => e.stopPropagation()}>
              <div className="rec-modal-header">
                <h3>Select Document</h3>
                <button className="rec-modal-close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <div className="rec-document-list">
                <label className="rec-modal-upload-btn">
                  <input type="file" accept=".pdf" onChange={handleFileChange} hidden />
                  <i className="fa-solid fa-plus"></i> Upload New PDF
                </label>
                {documents.map(doc => (
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

  // Quiz Page
  return (
    <div className="rec-app">
      <div className="rec-container">
        <div className="rec-quiz-header">
          <button className="rec-back-home" onClick={resetQuiz}>
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
          
          <div className="rec-question-nav-wrapper">
            <div className="rec-question-nav">
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`rec-q-dot ${index === i ? 'active' : ''} ${answers[i] ? 'done' : ''}`}
                  onClick={() => goToQuestion(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          
          <div className="rec-quiz-progress">
            <div className="rec-progress-text">{completedCount} / {questions.length} Completed</div>
            <div className="rec-progress-bar">
              <div className="rec-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="rec-quiz-main">
          <div className="rec-question-card">
            <div className="rec-question-badge">Question {index + 1} (Level {difficulty})</div>
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

            {!evaluation && !evaluating ? (
              <button className="rec-submit-btn" onClick={submitAnswer} disabled={!answer.trim()}>
                Submit Answer <i className="fa-solid fa-paper-plane"></i>
              </button>
            ) : evaluation && (
              <div className="rec-evaluation">
                <h3 className="evaluation-heading">Evaluation Result</h3>
                
                <div className="rec-score-card">
                  <div className="rec-score-circle">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2a2a" strokeWidth="4"/>
                      <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - (evaluation.percentage || 0) / 100)}`}
                        transform="rotate(-90 50 50)"
                        strokeLinecap="round"
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
                  <div className="rec-feedback-item">
                    <i className="fa-solid fa-lightbulb"></i>
                    <div>
                      <strong>AI Feedback</strong>
                      <p>{evaluation.feedback}</p>
                    </div>
                  </div>
                  
                  {evaluation.wrong && (
                    <div className="rec-feedback-item">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      <div>
                        <strong>What's Missing / Incorrect</strong>
                        <p>{evaluation.wrong}</p>
                      </div>
                    </div>
                  )}
                  
                  {evaluation.correct_answer && (
                    <div className="rec-feedback-item">
                      <i className="fa-solid fa-check-circle"></i>
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
                        <button className="rec-btn-more" onClick={generateMore} disabled={loading}>
                          <i className="fa-solid fa-arrow-up-right-dots"></i> 
                          {loading ? 'Leveling up...' : 'More (Next Level)'}
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
    </div>
  );
}