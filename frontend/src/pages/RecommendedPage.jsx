import { useState } from "react";
import "./RecommendedPage.css";

const API = "http://localhost:8000/api";

export default function App() {
  const [topic, setTopic] = useState("");
  const [newQuestions, setNewQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [file, setFile] = useState(null);
  const [activeMode, setActiveMode] = useState("topic");
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [maxReached, setMaxReached] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);

  const makeQuestions = async () => {
    if (activeMode === "topic" && !topic.trim()) return;
    if (activeMode === "pdf" && !file) return;
    
    setLoading(true);
    try {
      let res;
      if (activeMode === "topic") {
        res = await fetch(`${API}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic })
        });
      } else {
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch(`${API}/generate-pdf`, {
          method: "POST",
          body: formData
        });
      }
      const data = await res.json();
      setAllQuestions(data.questions);
      setNewQuestions(data.questions);
      setIndex(0);
      setAnswer("");
      setEvaluationResult(null);
      setAnswers([]);
      setResults([]);
      setMaxReached(0);
      setShowQuiz(true);
    } catch (e) { 
      console.error(e); 
    }
    setLoading(false);
  };

  const generateMoreQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/generate-more`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: topic,
          current_questions: allQuestions
        })
      });
      const data = await res.json();
      const updatedQuestions = [...allQuestions, ...data.questions];
      setAllQuestions(updatedQuestions);
      setNewQuestions(updatedQuestions);
    } catch (e) { 
      console.error(e); 
    }
    setLoading(false);
  };

  const submit = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`${API}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestions[index],
          answer: answer
        })
      });
      const data = await res.json();
      setEvaluationResult(data);
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

  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setAnswer(answers[nextIndex] || "");
    setEvaluationResult(results[nextIndex] || null);
    if (nextIndex + 1 > maxReached) setMaxReached(nextIndex + 1);
  };

  const retry = () => {
    setAnswer("");
    setEvaluationResult(null);
    const updatedResults = [...results];
    updatedResults[index] = null;
    setResults(updatedResults);
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setNewQuestions([]);
    setAllQuestions([]);
    setIndex(0);
    setAnswer("");
    setEvaluationResult(null);
    setAnswers([]);
    setResults([]);
    setMaxReached(0);
    setTopic("");
    setFile(null);
  };

  const goToQuestion = (i) => {
    setIndex(i);
    setAnswer(answers[i] || "");
    setEvaluationResult(results[i] || null);
  };

  const completedCount = answers.filter(a => a && a.trim()).length;
  const progress = newQuestions.length ? (completedCount / newQuestions.length) * 100 : 0;

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

          {/* Mode Toggle - Topic Search | Upload Document */}
          <div className="rec-mode-toggle">
            <button 
              className={`rec-mode-toggle-btn ${activeMode === 'topic' ? 'active' : ''}`}
              onClick={() => setActiveMode('topic')}
            >
              Topic Search
            </button>
            <button 
              className={`rec-mode-toggle-btn ${activeMode === 'pdf' ? 'active' : ''}`}
              onClick={() => setActiveMode('pdf')}
            >
              Upload Document
            </button>
          </div>

          {/* Input Area - Bigger width */}
          <div className="rec-input-area">
            {activeMode === 'topic' ? (
              <div className="rec-search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="e.g., Artificial Intelligence, React.js, Climate Change..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && makeQuestions()}
                />
                <button onClick={makeQuestions} disabled={loading || !topic.trim()}>
                  {loading ? 'Generating...' : 'Generate →'}
                </button>
              </div>
            ) : (
              <div className="rec-pdf-area">
                <label className="rec-upload-area">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    hidden
                  />
                  <div className="rec-upload-content">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>{file ? file.name : 'Click or drag PDF here'}</span>
                    {file && <span className="rec-file-size">{(file.size / 1024).toFixed(0)} KB</span>}
                  </div>
                </label>
                <button onClick={makeQuestions} disabled={loading || !file}>
                  {loading ? 'Processing...' : 'Generate →'}
                </button>
              </div>
            )}
          </div>

          {/* Promotional Cards - Small, full border radius */}
          <div className="rec-promo-grid">
            <div className="rec-promo-card">
              <span className="rec-promo-icon">🤖</span>
              <div className="rec-promo-text">
                <h4>AI-Powered</h4>
              </div>
            </div>
            <div className="rec-promo-card">
              <span className="rec-promo-icon">📊</span>
              <div className="rec-promo-text">
                <h4>Instant Feedback</h4>
              </div>
            </div>
            <div className="rec-promo-card">
              <span className="rec-promo-icon">🎯</span>
              <div className="rec-promo-text">
                <h4>Adaptive Learning</h4>
              </div>
            </div>
          </div>
        </div>
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
              {newQuestions.map((_, i) => (
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
            <div className="rec-progress-text">{completedCount} / {newQuestions.length} Completed</div>
            <div className="rec-progress-bar">
              <div className="rec-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="rec-quiz-main">
          <div className="rec-question-card">
            <div className="rec-question-badge">Question {index + 1}</div>
            <h2 className="rec-question-text">{newQuestions[index]}</h2>
            
            <textarea
              className="rec-answer-input"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setEvaluationResult(null);
              }}
              placeholder="Write your answer here..."
            />

            {evaluating && (
              <div className="rec-evaluating">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Evaluating your answer...</span>
              </div>
            )}

            {!evaluationResult && !evaluating ? (
              <button className="rec-submit-btn" onClick={submit} disabled={!answer.trim()}>
                Submit Answer <i className="fa-solid fa-paper-plane"></i>
              </button>
            ) : evaluationResult && (
              <div className="rec-evaluation">
                <div className="rec-score-card">
                  <div className="rec-score-circle">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2a2a" strokeWidth="4"/>
                      <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - evaluationResult.percentage / 100)}`}
                        transform="rotate(-90 50 50)"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="rec-score-text">
                      <span className="rec-score-value">{evaluationResult.percentage}</span>
                      <span className="rec-score-unit">%</span>
                    </div>
                  </div>
                  <div className="rec-score-badge">{evaluationResult.correctness}</div>
                </div>

                <div className="rec-feedback-list">
                  <div className="rec-feedback-item missing">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <div>
                      <strong>What's Missing</strong>
                      <p>{evaluationResult.wrong}</p>
                    </div>
                  </div>
                  <div className="rec-feedback-item correct">
                    <i className="fa-solid fa-check-circle"></i>
                    <div>
                      <strong>Correct Answer</strong>
                      <p>{evaluationResult.correct_answer}</p>
                    </div>
                  </div>
                  <div className="rec-feedback-item feedback">
                    <i className="fa-solid fa-lightbulb"></i>
                    <div>
                      <strong>Feedback</strong>
                      <p>{evaluationResult.feedback}</p>
                    </div>
                  </div>
                </div>

                <div className="rec-action-buttons">
                  <button className="rec-btn-retry" onClick={retry}>
                    <i className="fa-solid fa-rotate-left"></i> Try Again
                  </button>
                  {index < newQuestions.length - 1 ? (
                    <button className="rec-btn-next" onClick={next}>
                      Next Question <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  ) : (
                    <div className="rec-finish-group">
                      {newQuestions.length >= 5 && (
                        <button className="rec-btn-more" onClick={generateMoreQuestions}>
                          <i className="fa-solid fa-plus"></i> More Questions
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