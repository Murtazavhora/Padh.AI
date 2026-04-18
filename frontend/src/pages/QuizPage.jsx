import React, { useState, useEffect } from 'react';
import './QuizPage.css';
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';
import { 
  FiCheck, FiRotateCcw, FiArrowRight, 
  FiUpload, FiFile, FiChevronRight, FiStar,
  FiCpu, FiUsers
} from 'react-icons/fi';

const BACKEND_URL = 'http://localhost:5000/api/quiz';

function QuizPage({ onBack }) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [inputMode, setInputMode] = useState('topic');
  const [showGame, setShowGame] = useState(false);
  const [gameMode, setGameMode] = useState('vsAI');
  const [gameDifficulty, setGameDifficulty] = useState('easy');
  const [quizError, setQuizError] = useState('');

  // New backend state
  const [quizId, setQuizId] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [quizStats, setQuizStats] = useState(null);

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [winningLine, setWinningLine] = useState([]);
  const [playerXWins, setPlayerXWins] = useState(0);
  const [playerOWins, setPlayerOWins] = useState(0);
  const [draws, setDraws] = useState(0);

  const dummyQuizQuestions = [
    { id: 1, question: "What is the capital of France?", options: ['London', 'Paris', 'Berlin', 'Madrid'], correct: 1 },
    { id: 2, question: "How many continents are there on Earth?", options: ['5', '6', '7', '8'], correct: 2 },
    { id: 3, question: "Which planet is known as the Red Planet?", options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1 },
    { id: 4, question: "What is the largest ocean on Earth?", options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3 },
    { id: 5, question: "How many hours are in a day?", options: ['12', '24', '36', '48'], correct: 1 }
  ];

  useEffect(() => {
    loadDocuments();
    
    const handleDocumentsUpdated = (e) => {
      setUploadedDocuments(e.detail);
    };

    window.addEventListener('documentsUpdated', handleDocumentsUpdated);
    
    return () => {
      window.removeEventListener('documentsUpdated', handleDocumentsUpdated);
    };
  }, []);

  const loadDocuments = () => {
    const savedDocs = localStorage.getItem('recentDocuments');
    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs);
      setUploadedDocuments(parsedDocs);
    }
  };

  const handleTrialQuiz = () => {
    setIsGenerating(true);
    setInputMode('trial');
    setSelectedDocument(null);
    setShowDocumentSelector(false);
    setShowGame(false);
    setQuizId(null);
    setDifficultyLevel(1);
    setQuizStats(null);
    
    setTimeout(() => {
      setQuestions(dummyQuizQuestions);
      setIsGenerating(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    }, 1000);
  };

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setInputMode('topic');
    setSelectedDocument(null);
    setShowDocumentSelector(false);
    setShowGame(false);
    setQuizError('');
    setQuestions([]);
    setQuizStats(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!response.ok) throw new Error('Backend error');

      const data = await response.json();
      setQuestions(data.questions);
      setQuizId(data.quiz_id);
      setDifficultyLevel(data.difficulty_level || 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    } catch (err) {
      setQuizError('Failed to generate quiz. Make sure backend is running on port 5000.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDocumentSelect = async (doc) => {
    setSelectedDocument(doc);
    setShowDocumentSelector(false);
    setInputMode('document');
    setIsGenerating(true);
    setShowGame(false);
    setQuizError('');
    setQuestions([]);
    setQuizStats(null);

    if (!doc.content || doc.content.trim().length === 0) {
      setQuizError('No readable content in this document. Please re-upload the file.');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: doc.content.substring(0, 8000) }),
      });

      if (!response.ok) throw new Error('Backend error');

      const data = await response.json();
      setQuestions(data.questions);
      setQuizId(data.quiz_id);
      setDifficultyLevel(data.difficulty_level || 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    } catch (err) {
      setQuizError('Failed to generate quiz. Make sure backend is running on port 5000.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadClick = () => {
    setShowDocumentSelector(!showDocumentSelector);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Demo quiz: local scoring
    if (inputMode === 'trial') {
      let correctCount = 0;
      questions.forEach(question => {
        if (selectedAnswers[question.id] === question.correct) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResults(true);
      if (correctCount >= Math.ceil(questions.length * 0.8)) {
        setShowGame(true);
        resetGame();
      }
      return;
    }

    // Backend scoring
    try {
      const answersWithStringKeys = {};
      Object.entries(selectedAnswers).forEach(([k, v]) => {
        answersWithStringKeys[String(k)] = v;
      });

      const response = await fetch(`${BACKEND_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: quizId,
          questions: questions,
          answers: answersWithStringKeys,
        }),
      });

      if (!response.ok) throw new Error('Submit failed');

      const data = await response.json();
      setScore(data.score);
      setQuizStats(data);
      setShowResults(true);

      if (data.unlock_game) {
        setShowGame(true);
        resetGame();
      }
    } catch (err) {
      setQuizError('Failed to submit quiz results.');
    }
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    setQuizError('');

    const nextDifficulty = Math.min(difficultyLevel + 1, 3);

    try {
      let body = { difficulty_level: nextDifficulty };
      if (inputMode === 'topic') {
        body.topic = topic.trim();
      } else if (inputMode === 'document' && selectedDocument) {
        body.content = selectedDocument.content.substring(0, 8000);
      }

      const response = await fetch(`${BACKEND_URL}/generate-more`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Generate more failed');

      const data = await response.json();
      setQuestions(data.questions);
      setQuizId(data.quiz_id);
      setDifficultyLevel(data.difficulty_level || nextDifficulty);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
      setShowGame(false);
      setQuizStats(null);
    } catch (err) {
      setQuizError('Failed to generate more questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setShowGame(false);
    setQuizStats(null);
  };

  const handleNewQuiz = () => {
    setTopic('');
    setQuestions([]);
    setSelectedDocument(null);
    setInputMode('topic');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setShowDocumentSelector(false);
    setShowGame(false);
    setQuizId(null);
    setDifficultyLevel(1);
    setQuizStats(null);
  };

  // Tic Tac Toe game functions
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    
    if (!squares.includes(null)) {
      return { winner: 'draw', line: [] };
    }
    
    return { winner: null, line: [] };
  };

  const getAIMove = (squares, difficulty) => {
    const emptySquares = squares.reduce((acc, square, index) => {
      if (!square) acc.push(index);
      return acc;
    }, []);

    if (emptySquares.length === 0) return null;

    switch(difficulty) {
      case 'easy':
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
      case 'medium':
        if (Math.random() < 0.5) {
          return getOptimalMove(squares);
        }
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
      case 'hard':
        return getOptimalMove(squares);
      default:
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }
  };

  const getOptimalMove = (squares) => {
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'O';
        const { winner } = calculateWinner(testBoard);
        if (winner === 'O') return i;
      }
    }

    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'X';
        const { winner } = calculateWinner(testBoard);
        if (winner === 'X') return i;
      }
    }

    if (!squares[4]) return 4;

    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !squares[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    const emptySquares = squares.reduce((acc, square, index) => {
      if (!square) acc.push(index);
      return acc;
    }, []);
    
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  const handleSquareClick = (index) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const { winner: gameWinner, line } = calculateWinner(newBoard);
    
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line || []);
      
      if (gameWinner === 'X') setPlayerXWins(prev => prev + 1);
      else if (gameWinner === 'O') setPlayerOWins(prev => prev + 1);
      else if (gameWinner === 'draw') setDraws(prev => prev + 1);
      
      setGameHistory([...gameHistory, { 
        winner: gameWinner, 
        date: new Date().toLocaleTimeString(),
      }]);
    } else {
      setIsXNext(!isXNext);
      
      if (gameMode === 'vsAI' && !isXNext && !gameWinner) {
        setTimeout(() => {
          const aiMove = getAIMove(newBoard, gameDifficulty);
          if (aiMove !== null) {
            const aiBoard = [...newBoard];
            aiBoard[aiMove] = 'O';
            setBoard(aiBoard);
            
            const { winner: aiWinner, line: aiLine } = calculateWinner(aiBoard);
            
            if (aiWinner) {
              setWinner(aiWinner);
              setWinningLine(aiLine || []);
              if (aiWinner === 'O') setPlayerOWins(prev => prev + 1);
              setGameHistory([...gameHistory, { 
                winner: aiWinner, 
                date: new Date().toLocaleTimeString(),
              }]);
            } else {
              setIsXNext(true);
            }
          }
        }, 500);
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  const resetStats = () => {
    setPlayerXWins(0);
    setPlayerOWins(0);
    setDraws(0);
    setGameHistory([]);
    resetGame();
  };

  const renderSquare = (index) => {
    const isWinning = winningLine.includes(index);
    return (
      <button 
        className={`game-square ${board[index] ? 'filled' : ''} 
          ${board[index] === 'X' ? 'x-move' : ''} 
          ${board[index] === 'O' ? 'o-move' : ''}
          ${isWinning ? 'winning-square' : ''}`}
        onClick={() => handleSquareClick(index)}
        disabled={winner !== null}
      >
        {board[index]}
      </button>
    );
  };

  const progress = questions.length > 0 
    ? ((Object.keys(selectedAnswers).length / questions.length) * 100) 
    : 0;

  return (
    <>
      <Header />
      <div className="quiz-page">
        <div className="quiz-container">
          {/* Header Row */}
          <div className="quiz-header-row">
            <h1 className="quiz-page-title">Quiz Mode</h1>
            <button className="quiz-back-button" onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* Quiz Intro */}
          <div className="quiz-intro">
            <p className="quiz-intro-text">
              Test your knowledge with interactive quizzes. Score 80% or higher to unlock Tic Tac Toe.
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="quiz-action-row">
            <button 
              className="quiz-trial-btn"
              onClick={handleTrialQuiz}
              disabled={isGenerating}
            >
              Try Demo Quiz
            </button>

            <div className="quiz-input-group">
              <form onSubmit={handleTopicSubmit} className="quiz-topic-form">
                <input
                  type="text"
                  className="quiz-topic-input"
                  placeholder="Enter topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
                <button 
                  type="submit" 
                  className="quiz-generate-btn"
                  disabled={!topic.trim() || isGenerating}
                >
                  {isGenerating ? '...' : 'Generate'}
                </button>
              </form>
              
              <button 
                className={`quiz-doc-btn ${showDocumentSelector ? 'active' : ''}`}
                onClick={handleUploadClick}
                disabled={isGenerating}
              >
                <FiUpload /> 
                <span>Docs</span>
              </button>
            </div>
          </div>

          {/* Document Selector */}
          {showDocumentSelector && (
            <div className="quiz-document-selector">
              <h3 className="quiz-document-title">Uploaded Documents</h3>
              {uploadedDocuments.length > 0 ? (
                <div className="quiz-document-list">
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`quiz-document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                      onClick={() => handleDocumentSelect(doc)}
                    >
                      <div className="quiz-doc-icon">
                        <FiFile />
                      </div>
                      <div className="quiz-doc-info">
                        <span className="quiz-doc-name">{doc.name}</span>
                        <span className="quiz-doc-meta">{doc.date}</span>
                      </div>
                      <FiChevronRight className="quiz-doc-arrow" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="quiz-doc-empty">
                  <p>No documents uploaded.</p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {quizError && (
            <div className="quiz-error">
              <span className="quiz-error-icon">⚠️</span>
              <span>{quizError}</span>
            </div>
          )}

          {/* Quiz Content */}
          {questions.length > 0 && !showResults && (
            <div className="quiz-content">
              <div className="quiz-source-indicator">
                {inputMode === 'trial' && <span className="quiz-source-badge">Demo Quiz</span>}
                {inputMode === 'document' && selectedDocument && (
                  <span className="quiz-source-badge">{selectedDocument.name}</span>
                )}
                {inputMode === 'topic' && topic && (
                  <span className="quiz-source-badge">{topic}</span>
                )}
              </div>

              <div className="quiz-progress">
                <div className="quiz-progress-bar">
                  <div className="quiz-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="quiz-progress-text">
                  {Object.keys(selectedAnswers).length}/{questions.length}
                </span>
              </div>

              <div className="quiz-question-card">
                <div className="quiz-question-header">
                  <span className="quiz-question-number">
                    Q{currentQuestionIndex + 1}/{questions.length}
                  </span>
                  <h3 className="quiz-question-text">
                    {questions[currentQuestionIndex].question}
                  </h3>
                </div>

                <div className="quiz-options">
                  {questions[currentQuestionIndex].options.map((option, index) => {
                    const isSelected = selectedAnswers[questions[currentQuestionIndex].id] === index;
                    return (
                      <button
                        key={index}
                        className={`quiz-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(questions[currentQuestionIndex].id, index)}
                      >
                        <span className="quiz-option-letter">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="quiz-option-text">{option}</span>
                        {isSelected && <FiCheck className="quiz-option-check" />}
                      </button>
                    );
                  })}
                </div>

                <div className="quiz-navigation">
                  <button 
                    className="quiz-nav-btn"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button 
                      className="quiz-submit-btn"
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length !== questions.length}
                    >
                      Submit
                    </button>
                  ) : (
                    <button 
                      className="quiz-nav-btn next"
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Next <FiArrowRight />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {showResults && (
            <div className="quiz-results">
              <div className="quiz-score-card">
                <h2 className="quiz-score-title">Score</h2>
                <div className="quiz-score-display">
                  <span className="quiz-score-number">{score}</span>
                  <span className="quiz-score-total">/{questions.length}</span>
                </div>
                <div className="quiz-score-percentage">
                  {Math.round((score / questions.length) * 100)}%
                </div>
                
                {/* Backend stats: XP, Level, Badges */}
                {quizStats && (
                  <div className="quiz-backend-stats" style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                    {quizStats.xp_earned !== undefined && (
                      <div style={{ marginBottom: '4px' }}>
                        ⚡ <strong>{quizStats.xp_earned} XP earned</strong>
                        {quizStats.level && <span style={{ marginLeft: '8px' }}>· Level: <strong>{quizStats.level}</strong></span>}
                      </div>
                    )}
                    {quizStats.badges && quizStats.badges.length > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        🏅 {quizStats.badges.join(' · ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="quiz-performance">
                  {score === questions.length ? (
                    <p className="quiz-performance-text perfect">Perfect Score! <FiStar /></p>
                  ) : score >= Math.ceil(questions.length * 0.8) ? (
                    <p className="quiz-performance-text good">Great! Tic Tac Toe unlocked <FiStar /></p>
                  ) : (
                    <p className="quiz-performance-text needs-work">Score 80% to unlock game</p>
                  )}
                </div>

                {/* Tic Tac Toe Game */}
                {showGame && (
                  <div className="game-section">
                    <div className="game-header">
                      <h3 className="game-title">Tic Tac Toe</h3>
                    </div>
                    
                    <div className="game-mode-selector">
                      <button 
                        className={`mode-btn ${gameMode === 'vsAI' ? 'active' : ''}`}
                        onClick={() => setGameMode('vsAI')}
                      >
                        <FiCpu /> vs AI
                      </button>
                      <button 
                        className={`mode-btn ${gameMode === 'twoPlayer' ? 'active' : ''}`}
                        onClick={() => setGameMode('twoPlayer')}
                      >
                        <FiUsers /> 2 Player
                      </button>
                    </div>

                    {gameMode === 'vsAI' && (
                      <div className="difficulty-selector">
                        <button 
                          className={`difficulty-btn ${gameDifficulty === 'easy' ? 'active' : ''}`}
                          onClick={() => setGameDifficulty('easy')}
                        >
                          Easy
                        </button>
                        <button 
                          className={`difficulty-btn ${gameDifficulty === 'medium' ? 'active' : ''}`}
                          onClick={() => setGameDifficulty('medium')}
                        >
                          Medium
                        </button>
                        <button 
                          className={`difficulty-btn ${gameDifficulty === 'hard' ? 'active' : ''}`}
                          onClick={() => setGameDifficulty('hard')}
                        >
                          Hard
                        </button>
                      </div>
                    )}

                    <div className="game-stats">
                      <div className="stat-box">
                        <span className="stat-label">X</span>
                        <span className="stat-value">{playerXWins}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">Draws</span>
                        <span className="stat-value">{draws}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">O</span>
                        <span className="stat-value">{playerOWins}</span>
                      </div>
                    </div>
                    
                    <div className="game-board">
                      <div className="game-status">
                        {winner ? (
                          winner === 'draw' ? (
                            <span className="game-status-text">Draw</span>
                          ) : (
                            <span className={`game-status-text ${winner === 'X' ? 'x-win' : 'o-win'}`}>
                              Winner: {winner}
                            </span>
                          )
                        ) : (
                          <span className="game-status-text">
                            {gameMode === 'vsAI' && !isXNext ? 'AI thinking...' : `Player ${isXNext ? 'X' : 'O'}`}
                          </span>
                        )}
                      </div>
                      
                      <div className="game-grid">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderSquare(index))}
                      </div>
                      
                      <div className="game-controls">
                        <button className="game-reset-btn" onClick={resetGame}>
                          <FiRotateCcw /> New Game
                        </button>
                        <button className="game-reset-stats-btn" onClick={resetStats}>
                          Reset Stats
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="quiz-results-actions">
                  <button className="quiz-results-btn reset" onClick={handleResetQuiz}>
                    <FiRotateCcw /> Try Again
                  </button>
                  <button className="quiz-results-btn new" onClick={handleNewQuiz}>
                    New Quiz
                  </button>
                  {inputMode !== 'trial' && (
                    <button 
                      className="quiz-results-btn new" 
                      onClick={handleGenerateMore}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Loading...' : `Generate More (Level ${Math.min(difficultyLevel + 1, 3)})`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default QuizPage;