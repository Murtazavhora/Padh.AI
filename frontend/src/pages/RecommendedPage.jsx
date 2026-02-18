import React, { useState, useRef, useEffect } from 'react';
import './RecommendedPage.css';
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';
import { 
  FiBold, FiItalic, FiUnderline, FiSun, FiList,
  FiDownload, FiPrinter, FiShare2, FiTrash2, FiFileText,
  FiMessageSquare
} from 'react-icons/fi';

function RecommendedPage({ onBack }) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [activeTextarea, setActiveTextarea] = useState(null);
  const [activeMode, setActiveMode] = useState('questions'); // 'questions' or 'blank'
  const [blankNoteContent, setBlankNoteContent] = useState('');
  
  const textareaRefs = useRef({});
  const blankNoteRef = useRef(null);

  // General question templates that work for any topic
  const questionTemplates = [
    (topic) => `What is the main concept behind "${topic}"?`,
    (topic) => `Can you explain the origin or history of "${topic}"?`,
    (topic) => `What are the key components or elements of "${topic}"?`,
    (topic) => `How does "${topic}" work in practical applications?`,
    (topic) => `What are the advantages or benefits of "${topic}"?`,
    (topic) => `What are the limitations or challenges of "${topic}"?`,
    (topic) => `Can you provide real-world examples of "${topic}"?`,
    (topic) => `How is "${topic}" related to other concepts in its field?`,
    (topic) => `What are the future prospects or developments in "${topic}"?`,
    (topic) => `Summarize the most important points about "${topic}" in your own words.`
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, []);

  // Track active textarea for formatting
  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === 'TEXTAREA') {
        setActiveTextarea(e.target);
      }
    };

    document.addEventListener('focusin', handleFocus);

    return () => {
      document.removeEventListener('focusin', handleFocus);
    };
  }, []);

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setActiveMode('questions');
    
    setTimeout(() => {
      const generatedQuestions = questionTemplates.map(template => template(topic));
      setQuestions(generatedQuestions);
      setIsGenerating(false);
    }, 1500);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleBlankNoteChange = (value) => {
    setBlankNoteContent(value);
  };

  const wrapSelectedText = (formatType, targetTextarea = null) => {
    const textarea = targetTextarea || activeTextarea;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let before = '';
    let after = '';
    
    switch(formatType) {
      case 'bold':
        before = '**';
        after = '**';
        break;
      case 'italic':
        before = '*';
        after = '*';
        break;
      case 'underline':
        before = '__';
        after = '__';
        break;
      case 'highlight':
        before = '==';
        after = '==';
        break;
      case 'bullet':
        if (selectedText.includes('\n')) {
          const lines = selectedText.split('\n');
          const bulletedLines = lines.map(line => {
            if (line.trim() && !line.trim().startsWith('•')) {
              return `• ${line}`;
            }
            return line;
          });
          before = bulletedLines.join('\n');
          after = '';
          
          const newText = text.substring(0, start) + before + text.substring(end);
          
          if (textarea === blankNoteRef.current) {
            setBlankNoteContent(newText);
          } else {
            const index = parseInt(textarea.getAttribute('data-index'));
            setAnswers(prev => ({
              ...prev,
              [index]: newText
            }));
          }
          
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start + before.length);
          }, 10);
          return;
        } else {
          if (selectedText.length === 0) {
            before = '• ';
            after = '';
          } else {
            before = '• ';
            after = '';
          }
        }
        break;
      default:
        return;
    }
    
    let newText;
    let newCursorPos;
    
    if (selectedText.length === 0) {
      newText = text.substring(0, start) + before + after + text.substring(end);
      newCursorPos = start + before.length;
    } else {
      newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      newCursorPos = end + before.length + after.length;
    }
    
    if (textarea === blankNoteRef.current) {
      setBlankNoteContent(newText);
    } else {
      const index = parseInt(textarea.getAttribute('data-index'));
      setAnswers(prev => ({
        ...prev,
        [index]: newText
      }));
    }
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText.length === 0) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        textarea.setSelectionRange(
          start + before.length,
          end + before.length
        );
      }
    }, 10);
  };

  const stripFormatting = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/__/g, '')
      .replace(/==/g, '')
      .replace(/• /g, '');
  };

  const formatForDisplay = (text) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      let formattedLine = line;
      
      if (formattedLine.startsWith('• ')) {
        formattedLine = '<span class="rec-bullet">•</span> ' + formattedLine.substring(2);
      }
      
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<span class="rec-bold">$1</span>');
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<span class="rec-italic">$1</span>');
      formattedLine = formattedLine.replace(/__(.*?)__/g, '<span class="rec-underline">$1</span>');
      formattedLine = formattedLine.replace(/==(.*?)==/g, '<span class="rec-highlight">$1</span>');
      
      return <div key={lineIndex} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  const handleBold = () => wrapSelectedText('bold');
  const handleItalic = () => wrapSelectedText('italic');
  const handleUnderline = () => wrapSelectedText('underline');
  const handleHighlight = () => wrapSelectedText('highlight');
  const handleBullet = () => wrapSelectedText('bullet');

  const handleDownload = () => {
    if (!questions.length && !blankNoteContent) {
      alert('Please generate questions or create blank notes first');
      return;
    }

    let content = `ACTIVE LEARNING NOTES\n`;
    content += `====================\n\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Mode: ${activeMode === 'questions' ? 'Question & Answer' : 'Blank Notes'}\n`;
    content += `\n-----------------------------------\n\n`;

    if (activeMode === 'blank') {
      content += `BLANK NOTES\n`;
      content += `===========\n\n`;
      content += `${stripFormatting(blankNoteContent) || 'No content'}\n`;
    } else {
      content += `Topic: ${topic}\n\n`;
      questions.forEach((q, i) => {
        content += `QUESTION ${i + 1}:\n`;
        content += `${q}\n\n`;
        content += `ANSWER:\n`;
        content += `${stripFormatting(answers[i]) || 'No answer provided'}\n`;
        content += `\n-----------------------------------\n\n`;
      });
    }

    content += `\nNotes created with Active Learning - ${new Date().toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!questions.length && !blankNoteContent) {
      alert('Please generate questions or create blank notes first');
      return;
    }

    const printWindow = window.open('', '_blank');
    
    let content = '';
    if (activeMode === 'blank') {
      content = blankNoteContent;
    } else {
      content = questions.map((q, i) => {
        return `QUESTION ${i + 1}: ${q}\nANSWER: ${answers[i] || 'No answer provided'}`;
      }).join('\n\n');
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Learning Notes - ${new Date().toLocaleDateString()}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace;
              padding: 40px; 
              line-height: 1.6; 
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              color: #000000;
            }
            h1 { color: #000; font-size: 28px; margin-bottom: 8px; }
            .rec-header { text-align: center; margin-bottom: 40px; }
            .rec-footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
            .rec-bold { font-weight: bold; }
            .rec-italic { font-style: italic; }
            .rec-underline { text-decoration: underline; }
            .rec-highlight { background-color: #facc15; padding: 0 2px; }
            .rec-bullet-point { display: block; margin-left: 20px; position: relative; }
            .rec-bullet-point::before { content: "•"; position: absolute; left: -15px; color: #facc15; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="rec-header">
            <h1>ACTIVE LEARNING NOTES</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Mode: ${activeMode === 'questions' ? 'Question & Answer' : 'Blank Notes'}</p>
          </div>
          
          ${activeMode === 'blank' ? 
            `<div class="rec-answer">${content.replace(/\*\*(.*?)\*\*/g, '<span class="rec-bold">$1</span>')
              .replace(/\*(.*?)\*/g, '<span class="rec-italic">$1</span>')
              .replace(/__(.*?)__/g, '<span class="rec-underline">$1</span>')
              .replace(/==(.*?)==/g, '<span class="rec-highlight">$1</span>')
              .split('\n').map(line => {
                if (line.includes('• ')) {
                  return `<div class="rec-bullet-point">${line.replace('• ', '')}</div>`;
                }
                return line;
              }).join('\n')}</div>` :
            questions.map((q, i) => {
              let formattedAnswer = (answers[i] || 'No answer provided')
                .replace(/\*\*(.*?)\*\*/g, '<span class="rec-bold">$1</span>')
                .replace(/\*(.*?)\*/g, '<span class="rec-italic">$1</span>')
                .replace(/__(.*?)__/g, '<span class="rec-underline">$1</span>')
                .replace(/==(.*?)==/g, '<span class="rec-highlight">$1</span>');
              
              const answerLines = formattedAnswer.split('\n');
              formattedAnswer = answerLines.map(line => {
                if (line.includes('• ')) {
                  return `<div class="rec-bullet-point">${line.replace('• ', '')}</div>`;
                }
                return line;
              }).join('\n');
              
              return `
                <h2>QUESTION ${i + 1}</h2>
                <p><strong>${q}</strong></p>
                <div class="rec-answer">${formattedAnswer}</div>
                ${i < questions.length - 1 ? '<hr/>' : ''}
              `;
            }).join('')}
          
          <div class="rec-footer">
            Notes created with Active Learning - ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleShare = () => {
    if (!questions.length && !blankNoteContent) {
      alert('Please generate questions or create blank notes first');
      return;
    }

    let content = `Active Learning Notes - ${new Date().toLocaleDateString()}\n`;
    content += `Mode: ${activeMode === 'questions' ? 'Question & Answer' : 'Blank Notes'}\n\n`;
    
    if (activeMode === 'blank') {
      content += stripFormatting(blankNoteContent);
    } else {
      questions.forEach((q, i) => {
        content += `Q${i + 1}: ${q}\n`;
        content += `A: ${stripFormatting(answers[i]) || 'No answer provided'}\n\n`;
      });
    }

    if (navigator.share) {
      navigator.share({
        title: `Learning Notes - ${new Date().toLocaleDateString()}`,
        text: content,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(content);
      alert('Notes copied to clipboard!');
    }
  };

  const switchToQuestions = () => {
    setActiveMode('questions');
  };

  const switchToBlankNotes = () => {
    setActiveMode('blank');
  };

  const clearAll = () => {
    setTopic('');
    setQuestions([]);
    setAnswers({});
    setBlankNoteContent('');
    setActiveMode('questions');
    setActiveTextarea(null);
  };

  return (
    <>
      <Header />
      <div className="rec-page">
        <div className="rec-container">
          {/* Header Row */}
          <div className="rec-header-row">
            <h1 className="rec-page-title">Active Learning</h1>
            <button className="rec-back-button" onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* Learning Philosophy */}
          <div className="rec-philosophy">
            <p className="rec-philosophy-text">
              Instead of directly solving problems for students, the platform reduces over-dependency on AI 
              by guiding learners through questions rather than providing answers. Think, research, and create 
              your own understanding.
            </p>
          </div>

          {/* Mode Toggle Buttons */}
          <div className="rec-mode-toggle">
            <button 
              className={`rec-mode-btn ${activeMode === 'questions' ? 'active' : ''}`}
              onClick={switchToQuestions}
              disabled={!questions.length && activeMode !== 'questions'}
            >
              <FiMessageSquare /> Questions Mode
            </button>
            <button 
              className={`rec-mode-btn ${activeMode === 'blank' ? 'active' : ''}`}
              onClick={switchToBlankNotes}
            >
              <FiFileText /> Blank Notes Mode
            </button>
          </div>

          {/* Topic Input - Only show in Questions Mode */}
          {activeMode === 'questions' && (
            <div className="rec-action-row">
              <form onSubmit={handleTopicSubmit} className="rec-topic-form">
                <input
                  type="text"
                  className="rec-topic-input"
                  placeholder="Enter a topic to generate questions..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
                <div className="rec-topic-buttons">
                  <button 
                    type="submit" 
                    className="rec-generate-btn"
                    disabled={!topic.trim() || isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </form>
              
              <div className="rec-action-buttons-group">
                <button 
                  type="button" 
                  className="rec-clear-btn"
                  onClick={clearAll}
                >
                  <FiTrash2 /> Clear All
                </button>
              </div>
            </div>
          )}

          {/* Blank Notes - Show in Blank Mode */}
          {activeMode === 'blank' && (
            <div className="rec-action-row">
              <div className="rec-blank-header">
                <h3 className="rec-blank-title">Blank Notes</h3>
                <p className="rec-blank-subtitle">Create your own notes freely</p>
              </div>
              <button 
                type="button" 
                className="rec-clear-btn"
                onClick={clearAll}
              >
                <FiTrash2 /> Clear All
              </button>
            </div>
          )}

          {/* Content Area - Shows based on active mode */}
          {(activeMode === 'questions' && questions.length > 0) || (activeMode === 'blank') ? (
            <div className="rec-questions-section">
              <div className="rec-questions-header">
                <h2 className="rec-questions-title">
                  {activeMode === 'blank' ? 'Blank Notes' : `Questions for "${topic}"`}
                </h2>
                <p className="rec-questions-subtitle">
                  {activeMode === 'blank' 
                    ? 'Create your own notes freely. Use the toolbar to format text.'
                    : 'Answer these questions in your own words. Select text and use the toolbar to format it.'}
                </p>
              </div>

              {/* Formatting Toolbar */}
              <div className="rec-formatting-toolbar">
                <div className="rec-toolbar-group">
                  <button 
                    className={`rec-style-btn ${activeTextarea ? 'rec-active' : ''}`}
                    onClick={handleBold}
                    type="button"
                    title="Bold (Select text first)"
                  >
                    <FiBold />
                  </button>
                  <button 
                    className={`rec-style-btn ${activeTextarea ? 'rec-active' : ''}`}
                    onClick={handleItalic}
                    type="button"
                    title="Italic (Select text first)"
                  >
                    <FiItalic />
                  </button>
                  <button 
                    className={`rec-style-btn ${activeTextarea ? 'rec-active' : ''}`}
                    onClick={handleUnderline}
                    type="button"
                    title="Underline (Select text first)"
                  >
                    <FiUnderline />
                  </button>
                  <button 
                    className={`rec-style-btn ${activeTextarea ? 'rec-active' : ''}`}
                    onClick={handleHighlight}
                    type="button"
                    title="Highlight (Select text first)"
                  >
                    <FiSun />
                  </button>
                  <button 
                    className={`rec-style-btn ${activeTextarea ? 'rec-active' : ''}`}
                    onClick={handleBullet}
                    type="button"
                    title="Bullet Points"
                  >
                    <FiList />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="rec-scrollable-content">
                {activeMode === 'blank' ? (
                  <div className="rec-question-item">
                    <textarea
                      ref={blankNoteRef}
                      className="rec-answer-input rec-blank-note-input"
                      placeholder="Start writing your notes here... Select text and use the toolbar above to format it."
                      value={blankNoteContent}
                      onChange={(e) => handleBlankNoteChange(e.target.value)}
                      rows="15"
                    />
                    
                    {blankNoteContent && (
                      <div className="rec-formatted-preview">
                        <div className="rec-preview-label">Preview:</div>
                        <div className="rec-preview-content">
                          {formatForDisplay(blankNoteContent)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rec-questions-list">
                    {questions.map((question, index) => (
                      <div key={index} className="rec-question-item">
                        <div className="rec-question-text">
                          <span className="rec-question-number">{index + 1}.</span>
                          <p>{question}</p>
                        </div>
                        <textarea
                          ref={el => textareaRefs.current[index] = el}
                          className="rec-answer-input"
                          placeholder="Write your answer here..."
                          value={answers[index] || ''}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          data-index={index}
                          rows="6"
                        />
                        
                        {answers[index] && (
                          <div className="rec-formatted-preview">
                            <div className="rec-preview-label">Preview:</div>
                            <div className="rec-preview-content">
                              {formatForDisplay(answers[index])}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="rec-footer-buttons">
                <button 
                  className="rec-action-btn rec-download"
                  onClick={handleDownload}
                >
                  <FiDownload /> Download
                </button>
                <button 
                  className="rec-action-btn rec-print"
                  onClick={handlePrint}
                >
                  <FiPrinter /> Print
                </button>
                <button 
                  className="rec-action-btn rec-share"
                  onClick={handleShare}
                >
                  <FiShare2 /> Share
                </button>
              </div>
            </div>
          ) : activeMode === 'questions' && !questions.length && (
            <div className="rec-empty-state">
              <FiMessageSquare className="rec-empty-icon" />
              <h3>No Questions Yet</h3>
              <p>Enter a topic above and click Generate to start learning</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RecommendedPage;