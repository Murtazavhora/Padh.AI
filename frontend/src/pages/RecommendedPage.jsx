import { useState, useEffect, useRef } from "react";
import "./RecommendedPage.css";
import Footer from '../Components/Footer/Footer';

const API = "http://localhost:8000/api";

export default function App() {
  const [topic, setTopic] = useState("");
  const [newQuestions, setNewQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("");
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [maxReached, setMaxReached] = useState(0);

  const makeQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      setNewQuestions(data.questions);
      setIndex(0);
      setAnswer("");
      setEvaluationResult(null);
      setAnswers([]);
      setResults([]);
      setMaxReached(0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const generateFromPDF = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/generate-pdf`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setNewQuestions(data.questions);
      setIndex(0);
      setAnswers([]);
      setResults([]);
      setMaxReached(0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const submit = async () => {
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
  };

  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setAnswer(answers[nextIndex] || "");
    setEvaluationResult(results[nextIndex] || null);
    if (nextIndex > maxReached) setMaxReached(nextIndex);
  };

  const retry = () => {
    setAnswer("");
    setEvaluationResult(null);
    const updatedResults = [...results];
    updatedResults[index] = null;
    setResults(updatedResults);
  };

  const finish = () => {
    setTopic("");
    setNewQuestions([]);
    setIndex(0);
    setAnswer("");
    setEvaluationResult(null);
    setMode("");
    setAnswers([]);
    setResults([]);
    setMaxReached(0);
  };

  return (
    <>
      <div id="rec-page-root">
        <div className="rec-full-page">
          <div className="rec-left-side">
            {!mode && (
              <div className="mode">
                <h2 className="title">Select Input Type</h2>
                <div className="mode-options">
                  <button className="btn1" onClick={() => setMode("topic")}> <i className="fa-solid fa-pen-to-square"></i> Use Topic </button>
                  <button className="btn1" onClick={() => setMode("pdf")}> <i className="fa-solid fa-cloud-arrow-up"></i> Upload PDF </button>
                </div>
              </div>
            )}

            {mode === "topic" && (
              <div className="rec-topic-group">
                <h2 className="title">Enter Topic</h2>
                <div className="rec-combined-input">
                  <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. OSI Model" />
                  <button className="rec-btn-attached" onClick={makeQuestions}> Generate </button>
                </div>
              </div>
            )}





            {mode === "pdf" && (
              <div className="input-group">
                <h2 className="title">Select Document</h2>
                <div className="rec-combined-upload">
                  <label className="rec-file-label">
                    <input className="rec-file-hidden" type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <i className="fa-solid fa-cloud-arrow-up rec-upload-icon"></i>
                    <span>{file ? file.name.substring(0, 10) + ".." : "Select PDF"}</span>
                  </label>
                  <button className="rec-btn-process" onClick={generateFromPDF}> <span className="button__text">Process</span> </button>
                </div>
              </div>
            )}




            {newQuestions.length > 0 && (
              <div className="left-ques">
                <h3 className="title">Your Attempt:</h3>
                <div className="rec-circle-grid">
                  {Array.from({ length: maxReached + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rec-nav-circle ${index === i ? "active" : ""} ${answers[i] ? "done" : ""}`}
                      onClick={() => {
                        setIndex(i);
                        setAnswer(answers[i] || "");
                        setEvaluationResult(results[i] || null);
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {loading && <p className="msg">Processing, Please Wait .....</p>}
          </div>

          <div className="rec-right-side">
            {newQuestions.length > 0 ? (
              <div className="content">
                <h1 className="heading-ques">Question {index + 1}</h1>
                <p className="text-ques">{newQuestions[index]}</p>

                <textarea
                  className="textarea"
                  value={answer}
                  placeholder="Type your answer here..."
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setEvaluationResult(null);
                  }}
                />

                {!evaluationResult ? (
                  <button className="btn-n" onClick={submit}>Submit</button>
                ) : (
                  <div className="evaluation-rec">
                    <div className="score-eval">
                      <span className="evaluation-c"><b>Correctness:</b> {evaluationResult.correctness}</span>
                      <span className="evaluation-s"><b>Score:</b> {evaluationResult.percentage}%</span>
                    </div>
                    <div className="feedback">
                      <div className="evaluation-m"><b>What is Missing:</b> {evaluationResult.wrong}</div>
                      <div className="evaluation-a"><b>Correct Answer:</b> {evaluationResult.correct_answer}</div>
                      <div className="evaluation-f"><b>Feedback:</b> {evaluationResult.feedback}</div>
                    </div>

                    <div className="rec-action-row">
                      <button className="btn-r" onClick={retry}>Retry</button>
                      {index < newQuestions.length - 1 ? (
                        <button className="btn-n" onClick={next}>Next</button>
                      ) : (
                        <button className="btn-f" onClick={finish}>Finish</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* This shows when no questions are generated yet */
              <div className="rec-empty-state">
                <div className="empty-content">
                  <h2 className="empty-heading">Start learning today</h2>
                  <p className="empty-description">
                    <span className="highlight">Smart questioning for better learning</span>, where you will get the AI-based evaluation on your every answer and will also be able to prepare in a better way for any topic. Instead of relying on direct answers from AI or any other source, this <span className="highlight">think and answer</span> method will help you get well-prepared for any topic.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}