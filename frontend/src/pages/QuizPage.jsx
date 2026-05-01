import React, { useState, useEffect } from 'react';
import './QuizPage.css';
import {
  FiCheck,
  FiRotateCcw,
  FiArrowRight,
  FiArrowLeft,
  FiUpload,
  FiFile,
  FiChevronRight,
  FiStar,
  FiCpu,
  FiUsers,
  FiBookOpen,
  FiTarget,
  FiClock,
  FiGrid,
  FiAward,
  FiTrendingUp
} from 'react-icons/fi';

const BACKEND_URL = 'http://localhost:8000/api/quiz';

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

  // Backend state
  const [quizId, setQuizId] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [quizStats, setQuizStats] = useState(null);

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [winningLine, setWinningLine] = useState([]);
  const [playerXWins, setPlayerXWins] = useState(0);
  const [playerOWins, setPlayerOWins] = useState(0);
  const [draws, setDraws] = useState(0);

  // 10 demo questions
  const dummyQuizQuestions = [
    { id: 1, question: "What is the capital of France?", options: ['London', 'Paris', 'Berlin', 'Madrid'], correct: 1 },
    { id: 2, question: "How many continents are there on Earth?", options: ['5', '6', '7', '8'], correct: 2 },
    { id: 3, question: "Which planet is known as the Red Planet?", options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1 },
    { id: 4, question: "What is the largest ocean on Earth?", options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3 },
    { id: 5, question: "How many hours are in a day?", options: ['12', '24', '36', '48'], correct: 1 },
    { id: 6, question: "Which gas do plants absorb from the atmosphere?", options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 2 },
    { id: 7, question: "What is H2O commonly known as?", options: ['Salt', 'Water', 'Oxygen', 'Hydrogen'], correct: 1 },
    { id: 8, question: "Which is the fastest land animal?", options: ['Lion', 'Horse', 'Cheetah', 'Tiger'], correct: 2 },
    { id: 9, question: "How many days are there in a leap year?", options: ['365', '366', '364', '367'], correct: 1 },
    { id: 10, question: "Which part of the plant conducts photosynthesis?", options: ['Root', 'Stem', 'Leaf', 'Flower'], correct: 2 }
  ];

  useEffect(() => {
    loadDocuments();

    const handleDocumentsUpdated = (e) => {
      loadDocuments();
    };

    window.addEventListener('documentsUpdated', handleDocumentsUpdated);

    return () => {
      window.removeEventListener('documentsUpdated', handleDocumentsUpdated);
    };
  }, []);

  const API_BASE = 'http://localhost:8000';

const loadDocuments = async () => {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/documents/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to load documents");

    const data = await res.json();

    const parsedDocs = data.map(doc => ({
      id: doc.id,
      name: doc.file_name,
      date: new Date(doc.created_at).toLocaleDateString(),
    }));

    setUploadedDocuments(parsedDocs);
  } catch (err) {
    console.error(err);
    setQuizError("Failed to load documents");
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
    setQuizError('');

    setTimeout(() => {
      setQuestions(dummyQuizQuestions);
      setIsGenerating(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    }, 700);
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
      setQuestions(data.questions || []);
      setQuizId(data.quiz_id);
      setDifficultyLevel(data.difficulty_level || 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    } catch (err) {
      setQuizError('Failed to generate quiz. Make sure backend is running on port 8000.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDocumentSelect = async (doc) => {
    
    setShowDocumentSelector(false);
    setInputMode('document');
    setIsGenerating(true);
    setShowGame(false);
    setQuizError('');
    setQuestions([]);
    setQuizStats(null);


    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ document_id: doc.id }),
      });

      if (!response.ok) throw new Error('Backend error');

      const data = await response.json();
      setSelectedDocument(doc);
      setQuestions(data.questions || []);
      setQuizId(data.quiz_id);
      setDifficultyLevel(data.difficulty_level || 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
    } catch (err) {
      setQuizError('Failed to generate quiz. Make sure backend is running on port 8000.');
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

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
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
        body.document_id = selectedDocument.id;
      } else if (inputMode === 'trial') {
        setQuestions(dummyQuizQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
        setShowGame(false);
        setQuizStats(null);
        setIsGenerating(false);
        return;
      }

      const token = localStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/generate-more`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Generate more failed');

      const data = await response.json();
      setQuestions(data.questions || []);
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
    setQuizError('');
  };

  const handleBack = () => {
  // 🧠 Case 1: User is inside quiz (questions screen)
  if (questions.length > 0 && !showResults) {
    setQuestions([]);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    return;
  }

  // 🧠 Case 2: User is on results screen
  if (showResults) {
    setShowResults(false);
    setQuestions([]);
    return;
  }

  // 🧠 Case 3: User is on setup screen → go to dashboard
  if (onBack) {
    onBack();
  }
};

  // Tic Tac Toe
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

    switch (difficulty) {
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

  // VS AI MODE: player is always X, AI is always O
  if (gameMode === 'vsAI') {
    if (!isXNext) return; // block clicks while AI turn

    const playerBoard = [...board];
    playerBoard[index] = 'X';
    setBoard(playerBoard);

    const { winner: playerWinner, line: playerLine } = calculateWinner(playerBoard);

    if (playerWinner) {
      setWinner(playerWinner);
      setWinningLine(playerLine || []);

      if (playerWinner === 'X') setPlayerXWins(prev => prev + 1);
      else if (playerWinner === 'O') setPlayerOWins(prev => prev + 1);
      else if (playerWinner === 'draw') setDraws(prev => prev + 1);

      setGameHistory(prev => [
        ...prev,
        {
          winner: playerWinner,
          date: new Date().toLocaleTimeString(),
        }
      ]);
      return;
    }

    // AI turn starts
    setIsXNext(false);

    setTimeout(() => {
      const aiMove = getAIMove(playerBoard, gameDifficulty);
      if (aiMove === null) {
        setIsXNext(true);
        return;
      }

      const aiBoard = [...playerBoard];
      aiBoard[aiMove] = 'O';
      setBoard(aiBoard);

      const { winner: aiWinner, line: aiLine } = calculateWinner(aiBoard);

      if (aiWinner) {
        setWinner(aiWinner);
        setWinningLine(aiLine || []);

        if (aiWinner === 'X') setPlayerXWins(prev => prev + 1);
        else if (aiWinner === 'O') setPlayerOWins(prev => prev + 1);
        else if (aiWinner === 'draw') setDraws(prev => prev + 1);

        setGameHistory(prev => [
          ...prev,
          {
            winner: aiWinner,
            date: new Date().toLocaleTimeString(),
          }
        ]);
      } else {
        setIsXNext(true); // back to player turn
      }
    }, 450);

    return;
  }

  // TWO PLAYER MODE
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

    setGameHistory(prev => [
      ...prev,
      {
        winner: gameWinner,
        date: new Date().toLocaleTimeString(),
      }
    ]);
  } else {
    setIsXNext(prev => !prev);
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
  useEffect(() => {
  if (showGame) {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  }
}, [gameMode, gameDifficulty, showGame]);

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

  const isQuizActive = questions.length > 0 && !showResults;
  const showSetup = !isQuizActive && !showResults;

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionId = currentQuestion?.id;
  const currentSelectedAnswer = currentQuestionId !== undefined
    ? selectedAnswers[currentQuestionId]
    : undefined;

  const sourceLabel =
    inputMode === 'trial'
      ? 'Demo Quiz'
      : inputMode === 'document' && selectedDocument
        ? selectedDocument.name
        : topic || 'Topic Quiz';

  const difficultyLabel =
    difficultyLevel === 1 ? 'Beginner' :
      difficultyLevel === 2 ? 'Intermediate' :
        'Advanced';

  const answeredCount = Object.keys(selectedAnswers).length;
  const percentageScore = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <>
      <div className="quiz-page">
        <div className="quiz-container">
          {/* Top Header */}
          <div className="quiz-shell-header">
            <div className="quiz-shell-header-left">
              <div className="quiz-shell-title-wrap">
                <h1 className="quiz-shell-title">AI Quiz</h1>
                <span className="quiz-shell-topic-badge">{sourceLabel}</span>
              </div>
              <p className="quiz-shell-subtitle">
                Test your understanding and track your progress
              </p>
            </div>

            <button className="quiz-back-button premium" onClick={handleBack}>
              <FiArrowLeft />
              Back
            </button>
          </div>

          {/* Setup Screen */}
          {showSetup && (
            <div className="quiz-setup-shell">
              <div className="quiz-setup-card hero">
                <div className="quiz-setup-hero-content">
                  <div className="quiz-setup-badge">Padh.AI Quiz Mode</div>
                  <h2 className="quiz-setup-title">
                    Practice smarter with topic-based and document-based quizzes
                  </h2>
                  <p className="quiz-setup-description">
                    Generate 10-question quizzes from a topic or from uploaded documents.
                    Score 80% or higher to unlock the gamified reward experience.
                  </p>
                </div>
              </div>

              <div className="quiz-setup-grid">
                <div className="quiz-setup-main">
                  <div className="quiz-setup-card">
                    <div className="quiz-section-head">
                      <h3>Choose Quiz Mode</h3>
                      <span>Start with what you want to learn</span>
                    </div>

                    <div className="quiz-action-row upgraded">
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
                            placeholder="Enter topic (e.g. NLP, LangChain, OS)..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isGenerating}
                          />
                          <button
                            type="submit"
                            className="quiz-generate-btn"
                            disabled={!topic.trim() || isGenerating}
                          >
                            {isGenerating ? 'Generating...' : 'Generate'}
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
                            <p>No documents uploaded yet.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="quiz-setup-sidebar">
                  <div className="quiz-side-card">
                    <div className="quiz-side-card-title">How it works</div>
                    <ul className="quiz-info-list">
                      <li>Generate a 10-question quiz</li>
                      <li>Answer every question to enable submit</li>
                      <li>Score 80%+ to unlock the game</li>
                      <li>Generate harder questions after completion</li>
                    </ul>
                  </div>

                  <div className="quiz-side-card">
                    <div className="quiz-side-card-title">Quiz Features</div>
                    <div className="quiz-feature-mini-grid">
                      <div className="quiz-mini-stat">
                        <span className="quiz-mini-stat-value">10</span>
                        <span className="quiz-mini-stat-label">Questions</span>
                      </div>
                      <div className="quiz-mini-stat">
                        <span className="quiz-mini-stat-value">3</span>
                        <span className="quiz-mini-stat-label">Levels</span>
                      </div>
                      <div className="quiz-mini-stat">
                        <span className="quiz-mini-stat-value">RAG</span>
                        <span className="quiz-mini-stat-label">Docs</span>
                      </div>
                      <div className="quiz-mini-stat">
                        <span className="quiz-mini-stat-value">XP</span>
                        <span className="quiz-mini-stat-label">Gamified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {quizError && (
            <div className="quiz-error">
              <span className="quiz-error-icon">⚠️</span>
              <span>{quizError}</span>
            </div>
          )}

          {/* Active Quiz Screen */}
          {isQuizActive && currentQuestion && (
            <div className="quiz-workspace">
              {/* LEFT MAIN */}
              <div className="quiz-main-panel">
                <div className="quiz-main-card">
                  <div className="quiz-main-card-top">
                    <div className="quiz-main-card-top-left">
                      <span className="quiz-question-progress-label">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>
                    </div>
                    <div className="quiz-main-card-top-right">
                      <span className="quiz-complete-label">{Math.round(progress)}% Completed</span>
                    </div>
                  </div>

                  <div className="quiz-progress">
                    <div className="quiz-progress-bar">
                      <div className="quiz-progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <div className="quiz-question-card upgraded">
                    <div className="quiz-question-meta-row">
                      <span className="quiz-difficulty-chip">{difficultyLabel}</span>
                      <span className="quiz-bookmark-placeholder">Question Focus</span>
                    </div>

                    <h3 className="quiz-question-text">
                      {currentQuestion.question}
                    </h3>

                    <div className="quiz-options">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === index;
                        return (
                          <button
                            key={index}
                            className={`quiz-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(currentQuestion.id, index)}
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

                    <div className="quiz-answer-preview">
                      <div className="quiz-answer-preview-left">
                        <span className="quiz-answer-preview-label">Your Answer</span>
                        <span className="quiz-answer-preview-value">
                          {currentSelectedAnswer !== undefined
                            ? currentQuestion.options[currentSelectedAnswer]
                            : 'Select an option to continue'}
                        </span>
                      </div>

                      {currentSelectedAnswer !== undefined && (
                        <button
                          className="quiz-change-answer-btn"
                          onClick={() =>
                            setSelectedAnswers(prev => {
                              const copy = { ...prev };
                              delete copy[currentQuestion.id];
                              return copy;
                            })
                          }
                        >
                          Change Answer
                        </button>
                      )}
                    </div>

                    <div className="quiz-navigation upgraded">
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
                          Submit Quiz
                        </button>
                      ) : (
                        <button
                          className="quiz-nav-btn next"
                          onClick={handleNextQuestion}
                        >
                          Next <FiArrowRight />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="quiz-guidance-card">
                  <div className="quiz-guidance-icon">💡</div>
                  <div className="quiz-guidance-content">
                    <h4>Think Before You Submit!</h4>
                    <p>
                      Read carefully, understand deeply, and answer on your own.
                      AI is here to guide, not replace your learning.
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="quiz-sidebar-panel">
                <div className="quiz-side-card sticky-top">
                  <div className="quiz-side-card-title">Quiz Progress</div>

                  <div className="quiz-progress-ring-wrap">
                    <div
                      className="quiz-progress-ring"
                      style={{
                        background: `conic-gradient(#f6b61e ${progress}%, rgba(255,255,255,0.08) ${progress}% 100%)`
                      }}
                    >
                      <div className="quiz-progress-ring-inner">
                        <span className="quiz-progress-ring-value">{Math.round(progress)}%</span>
                        <span className="quiz-progress-ring-label">Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="quiz-side-stats">
                    <div className="quiz-side-stat">
                      <span className="quiz-side-stat-value">{answeredCount}</span>
                      <span className="quiz-side-stat-label">Answered</span>
                    </div>
                    <div className="quiz-side-stat">
                      <span className="quiz-side-stat-value">{questions.length}</span>
                      <span className="quiz-side-stat-label">Total</span>
                    </div>
                    <div className="quiz-side-stat">
                      <span className="quiz-side-stat-value">{difficultyLevel}</span>
                      <span className="quiz-side-stat-label">Level</span>
                    </div>
                  </div>
                </div>

                <div className="quiz-side-card">
                  <div className="quiz-side-card-title">
                    <FiGrid /> Question Navigator
                  </div>

                  <div className="quiz-navigator-grid">
                    {questions.map((q, index) => {
                      const isAnswered = selectedAnswers[q.id] !== undefined;
                      const isCurrent = index === currentQuestionIndex;

                      return (
                        <button
                          key={q.id}
                          className={`quiz-nav-chip ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}`}
                          onClick={() => handleJumpToQuestion(index)}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="quiz-nav-legend">
                    <span><i className="legend-dot answered"></i> Answered</span>
                    <span><i className="legend-dot current"></i> Current</span>
                    <span><i className="legend-dot unanswered"></i> Unanswered</span>
                  </div>
                </div>

                <div className="quiz-side-card">
                  <div className="quiz-side-card-title">Quiz Details</div>

                  <div className="quiz-detail-list">
                    <div className="quiz-detail-row">
                      <span><FiBookOpen /> Source</span>
                      <strong>{sourceLabel}</strong>
                    </div>
                    <div className="quiz-detail-row">
                      <span><FiTarget /> Difficulty</span>
                      <strong>{difficultyLabel}</strong>
                    </div>
                    <div className="quiz-detail-row">
                      <span><FiTrendingUp /> Question Type</span>
                      <strong>MCQ</strong>
                    </div>
                    <div className="quiz-detail-row">
                      <span><FiClock /> Mode</span>
                      <strong>Self-paced</strong>
                    </div>
                    <div className="quiz-detail-row">
                      <span><FiAward /> Total Questions</span>
                      <strong>{questions.length}</strong>
                    </div>
                  </div>
                </div>

                <div className="quiz-side-actions">
                  <button
                    className="quiz-side-primary"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length !== questions.length}
                  >
                    Finish Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="quiz-results-shell">
              <div className="quiz-results-layout">
                <div className="quiz-results-main">
                  <div className="quiz-results-card primary">
                    <div className="quiz-results-head">
                      <div>
                        <h2 className="quiz-score-title">Quiz Completed</h2>
                        <p className="quiz-results-subtitle">
                          Here’s how you performed in this round
                        </p>
                      </div>
                      <span className="quiz-results-badge">{sourceLabel}</span>
                    </div>

                    <div className="quiz-score-hero">
                      <div className="quiz-score-display">
                        <span className="quiz-score-number">{score}</span>
                        <span className="quiz-score-total">/{questions.length}</span>
                      </div>
                      <div className="quiz-score-percentage">{percentageScore}%</div>
                    </div>

                    {quizStats && (
                      <div className="quiz-backend-stats-grid">
                        <div className="quiz-stat-pill">
                          ⚡ <strong>{quizStats.xp_earned ?? 0} XP</strong>
                        </div>
                        <div className="quiz-stat-pill">
                          🧠 <strong>Level {quizStats.level ?? difficultyLevel}</strong>
                        </div>
                        {quizStats.badges && quizStats.badges.length > 0 && (
                          <div className="quiz-stat-pill wide">
                            🏅 <strong>{quizStats.badges.join(' · ')}</strong>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="quiz-performance">
                      {score === questions.length ? (
                        <p className="quiz-performance-text perfect">Perfect Score! Outstanding work <FiStar /></p>
                      ) : score >= Math.ceil(questions.length * 0.8) ? (
                        <p className="quiz-performance-text good">Great job! Gamified reward unlocked <FiStar /></p>
                      ) : (
                        <p className="quiz-performance-text needs-work">Keep practicing — score 80% to unlock the game</p>
                      )}
                    </div>

                    <div className="quiz-results-actions">
                      <button className="quiz-results-btn reset" onClick={handleBack}>
                        Back
                      </button>

                      <button
                        className="quiz-results-btn new"
                        onClick={handleGenerateMore}
                        disabled={isGenerating}
                      >
                        {isGenerating
                          ? 'Loading...'
                          : inputMode === 'trial'
                            ? 'Generate More'
                            : `Generate More (Level ${Math.min(difficultyLevel + 1, 3)})`}
                      </button>
                    </div>
                  </div>

                  {showGame && (
                    <div className="quiz-results-card">
                      <div className="game-section">
                        <div className="game-header">
                          <h3 className="game-title">Reward Unlocked: Tic Tac Toe Challenge</h3>
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
                                {gameMode === 'vsAI'
                                  ? (isXNext ? 'Your Turn (X)' : 'Thinking.... (O)')
                                  : `Player ${isXNext ? 'X' : 'O'} Turn`}
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
                    </div>
                  )}
                </div>

                <div className="quiz-results-sidebar">
                  <div className="quiz-side-card">
                    <div className="quiz-side-card-title">Performance Snapshot</div>
                    <div className="quiz-progress-ring-wrap">
                      <div
                        className="quiz-progress-ring"
                        style={{
                          background: `conic-gradient(#f6b61e ${percentageScore}%, rgba(255,255,255,0.08) ${percentageScore}% 100%)`
                        }}
                      >
                        <div className="quiz-progress-ring-inner">
                          <span className="quiz-progress-ring-value">{percentageScore}%</span>
                          <span className="quiz-progress-ring-label">Score</span>
                        </div>
                      </div>
                    </div>

                    <div className="quiz-side-stats">
                      <div className="quiz-side-stat">
                        <span className="quiz-side-stat-value">{score}</span>
                        <span className="quiz-side-stat-label">Correct</span>
                      </div>
                      <div className="quiz-side-stat">
                        <span className="quiz-side-stat-value">{questions.length - score}</span>
                        <span className="quiz-side-stat-label">Wrong</span>
                      </div>
                      <div className="quiz-side-stat">
                        <span className="quiz-side-stat-value">{difficultyLevel}</span>
                        <span className="quiz-side-stat-label">Level</span>
                      </div>
                    </div>
                  </div>

                  <div className="quiz-side-card">
                    <div className="quiz-side-card-title">Next Step</div>
                    <p className="quiz-side-note">
                      Try a harder round with adaptive difficulty and continue improving your retention.
                    </p>
                    <button
                      className="quiz-side-primary"
                      onClick={handleGenerateMore}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Loading...' : 'Generate More Questions'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'none' }}>
                <button onClick={handleNewQuiz}>Hidden Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default QuizPage;