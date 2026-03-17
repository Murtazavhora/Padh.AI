import React, { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "./RecommendedPage.css";

function RecommendedPage({ onBack }) {

  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [savedStatus, setSavedStatus] = useState({});
  const [sessionId, setSessionId] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'bullet' }, { 'list': 'ordered' }],
      ['clean']
    ],
  };

  const formats = ['bold', 'italic', 'underline', 'list', 'bullet'];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setAnswers({});

    try {
      const response = await fetch(`${API_BASE_URL}/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        setQuestions([
          `Explain ${topic}`,
          `Advantages of ${topic}`,
          `Limitations of ${topic}`,
          `Real world use of ${topic}`,
          `Best practices of ${topic}`
        ]);
      } else {
        setQuestions(data.questions);
        const newSessionId = Date.now().toString();
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setQuestions([
        `Explain ${topic}`,
        `Advantages of ${topic}`,
        `Limitations of ${topic}`,
        `Real world use of ${topic}`,
        `Best practices of ${topic}`
      ]);
    }
    setLoading(false);
  };

  const handleGenerateMore = async () => {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-more`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          previous_count: questions.length 
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        const moreQuestions = [
          `Advanced concepts in ${topic}`,
          `Future of ${topic}`,
          `Common misconceptions about ${topic}`,
          `Key innovations in ${topic}`,
          `${topic} vs alternatives`
        ];
        setQuestions(prev => [...prev, ...moreQuestions]);
      } else {
        setQuestions(prev => [...prev, ...data.questions]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const moreQuestions = [
        `Advanced concepts in ${topic}`,
        `Future of ${topic}`,
        `Common misconceptions about ${topic}`,
        `Key innovations in ${topic}`,
        `${topic} vs alternatives`
      ];
      setQuestions(prev => [...prev, ...moreQuestions]);
    }
    setLoading(false);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
    setSavedStatus(prev => ({ ...prev, [index]: 'saving' }));
    
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [index]: 'saved' }));
      
      if (sessionId && questions.length > 0) {
        saveToBackend();
      }
    }, 1000);
  };

  const saveToBackend = async () => {
    try {
      await fetch(`${API_BASE_URL}/save-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          topic,
          questions,
          answers
        })
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const clearTopic = () => {
    setTopic("");
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleDownload = async () => {
    if (!questions.length) return alert('Please generate questions first');
    
    try {
      const response = await fetch(`${API_BASE_URL}/export-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          questions,
          answers,
          format: 'txt'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const blob = new Blob([data.content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        // Fallback to client-side download
        let content = `${topic.toUpperCase()} - Learning Notes\n`;
        content += `Date: ${new Date().toLocaleDateString()}\n\n`;
        
        questions.forEach((q, i) => {
          const plainAnswer = answers[i] ? stripHtml(answers[i]) : 'No answer provided';
          content += `Q${i+1}: ${q}\nA: ${plainAnswer}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${topic.toLowerCase().replace(/\s+/g, '_')}_notes.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch (error) {
      console.error('Export failed:', error);
      // Fallback to client-side download
      let content = `${topic.toUpperCase()} - Learning Notes\n`;
      content += `Date: ${new Date().toLocaleDateString()}\n\n`;
      
      questions.forEach((q, i) => {
        const plainAnswer = answers[i] ? stripHtml(answers[i]) : 'No answer provided';
        content += `Q${i+1}: ${q}\nA: ${plainAnswer}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${topic.toLowerCase().replace(/\s+/g, '_')}_notes.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  const handlePrint = () => {
    if (!questions.length) return alert('Please generate questions first');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>${topic} - Notes</title>
      <style>body{font-family:Inter;padding:40px;max-width:800px;margin:0 auto;background:#0a0a0f;color:#e6e6e6}</style>
      </head><body>
      <h1 style="color:#FFC83D">${topic}</h1>
      <p>${new Date().toLocaleDateString()}</p><hr/>
      ${questions.map((q, i) => `
        <h3>Q${i+1}: ${q}</h3>
        <div>${answers[i] || 'No answer provided'}</div>
        ${i < questions.length-1 ? '<hr/>' : ''}
      `).join('')}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShare = () => {
    if (!questions.length) return alert('Please generate questions first');
    
    let content = `${topic} - Notes\n${new Date().toLocaleDateString()}\n\n`;
    questions.forEach((q, i) => {
      const plainAnswer = answers[i] ? stripHtml(answers[i]) : 'No answer';
      content += `Q${i+1}: ${q}\nA: ${plainAnswer}\n\n`;
    });

    if (navigator.share) {
      navigator.share({ title: `${topic} - Notes`, text: content }).catch(console.error);
    } else {
      navigator.clipboard.writeText(content);
      alert('Copied to clipboard!');
    }
  };

  const handleUploadPDF = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        if (data.success) {
          alert(`PDF uploaded successfully! Suggested topics: ${data.suggested_topics.join(', ')}`);
          if (data.suggested_topics && data.suggested_topics.length > 0) {
            setTopic(data.suggested_topics[0]);
          }
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('PDF upload failed. Please try again.');
      }
    };
    fileInput.click();
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="rec-page">
      {/* LEFT PANEL - 27% */}
      <div className="rec-left-panel">
        {/* Topic Section */}
        <div className="rec-topic-section">
          <div className="rec-topic-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span>LEARNING TOPIC</span>
          </div>
          
          <div className="rec-topic-input-wrapper">
            <input
              type="text"
              className="rec-topic-input"
              placeholder="Enter a topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            {topic && (
              <button className="rec-topic-clear" onClick={clearTopic}>
                ×
              </button>
            )}
          </div>
          
          <div className="rec-topic-actions">
            <button 
              className="rec-btn-primary"
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
            >
              {loading ? 'Generating...' : 'Generate Questions'}
            </button>
            <button className="rec-btn-secondary" onClick={handleUploadPDF}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Upload PDF
            </button>
          </div>
        </div>

        {/* Questions Counter */}
        {questions.length > 0 && (
          <div className="rec-questions-count">
            <div className="rec-count-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Questions Answered</span>
            </div>
            <div className="rec-count-badge">{answeredCount} / {questions.length}</div>
          </div>
        )}

        {/* Generate More Button */}
        {questions.length > 0 && (
          <div className="rec-generate-more-wrapper">
            <button 
              className="rec-generate-more" 
              onClick={handleGenerateMore}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              {loading ? 'Generating...' : 'Generate More Questions'}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="rec-bottom-actions">
          <div className="rec-action-row">
            <button className="rec-action-btn" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <path d="M6 9V3h12v6"/>
                <rect x="6" y="15" width="12" height="6" rx="2"/>
              </svg>
              Print
            </button>
            <button className="rec-action-btn" onClick={handleDownload}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </button>
            <button className="rec-action-btn" onClick={handleShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
          </div>

          <button className="rec-back-bottom" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - 73% */}
      <div className="rec-right-panel">
        {loading && !questions.length && (
          <div className="rec-loading-state">
            <div className="rec-spinner"></div>
            <h3>Generating questions...</h3>
            <p>Our AI is preparing personalized questions for you</p>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="rec-empty-state">
            <div className="rec-empty-icon">📝</div>
            <h3>No Questions Generated</h3>
            <p>Enter a topic and click Generate to start</p>
          </div>
        )}

        {questions.length > 0 && (
          <div className="rec-questions-grid">
            {questions.map((q, i) => (
              <div key={i} className="rec-question-card">
                <span className="rec-question-badge">Question {i + 1}</span>
                <p className="rec-question-content">{q}</p>
                
                <div className="rec-answer-editor">
                  <div className="rec-editor-header">
                    <span className="rec-editor-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Your Answer
                    </span>
                    {savedStatus[i] && (
                      <div className="rec-autosave">
                        <span className="rec-autosave-pulse"></span>
                        {savedStatus[i] === 'saving' ? 'Saving...' : 'Saved'}
                      </div>
                    )}
                  </div>
                  
                  <ReactQuill
                    theme="snow"
                    value={answers[i] || ''}
                    onChange={(value) => handleAnswerChange(i, value)}
                    modules={modules}
                    formats={formats}
                    placeholder="Write your answer here... Use the toolbar to format."
                  />
                  
                  <div className="rec-word-count">
                    {answers[i]?.length || 0} characters
                  </div>
                </div>
              </div>
            ))}
            
            {/* Generate More button at the bottom of questions */}
            {questions.length > 0 && (
              <div className="rec-more-questions">
                <button 
                  className="rec-more-btn" 
                  onClick={handleGenerateMore}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  {loading ? 'Generating...' : 'Load More Questions'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendedPage;