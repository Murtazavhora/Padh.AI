import React, { useState, useRef, useEffect } from 'react';
import './AssistantPage.css';
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';
import { 
  FiSend, FiMic, FiPaperclip, FiUser, FiCpu, 
  FiDownload, FiPrinter, FiShare2, FiCopy,
  FiArrowLeft, FiMenu, FiPlus, FiSearch, FiClock,
  FiMessageSquare, FiTrash2, FiX
} from 'react-icons/fi';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function AssistantPage({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const sidebarRef = useRef(null);

  // FORCE SCROLL TO TOP IMMEDIATELY WHEN COMPONENT MOUNTS
  useEffect(() => {
    // Method 1: Scroll window to top
    window.scrollTo(0, 0);
    
    // Method 2: Also try scrolling the document element
    document.documentElement.scrollTop = 0;
    
    // Method 3: Scroll the body element
    document.body.scrollTop = 0;
    
    // Method 4: Use a small delay to ensure it runs after render
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }, 10);
    
    console.log('AssistantPage mounted - scrolled to top');
  }, []);

  // Mock conversation history
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Study Tips for Exams', preview: 'How can I improve my memory...', date: 'Today', messages: 12 },
    { id: 2, title: 'Math Homework Help', preview: 'Can you explain calculus...', date: 'Yesterday', messages: 8 },
    { id: 3, title: 'Essay Writing', preview: 'What are the key elements...', date: '2 days ago', messages: 15 },
    { id: 4, title: 'Physics Concepts', preview: 'Explain quantum mechanics...', date: '3 days ago', messages: 6 },
    { id: 5, title: 'Language Learning', preview: 'Best ways to learn Spanish...', date: '1 week ago', messages: 10 },
  ]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your 24/7 learning assistant. How can I help you today?",
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest('.nav-icon-btn')) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('API key not configured.');

      const chatHistory = updatedMessages
        .filter(m => m.sender === 'user' || m.sender === 'assistant')
        .slice(-10)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.fileContext
            ? `${m.text}\n\n[File content for reference]:\n${m.fileContext}`
            : m.text
        }));

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are Padh.AI, a smart and friendly learning assistant for students. Give short, direct, and to-the-point answers. Use 2-3 sentences max unless the user asks for a detailed explanation. Be clear, accurate, and student-friendly. Avoid unnecessary filler or pleasantries.'
            },
            ...chatHistory
          ],
          temperature: 0.5,
          max_tokens: 512,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Request failed (${response.status})`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: reply || 'Sorry, I could not generate a response.',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Error: ${err.message}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileMessage = {
        id: Date.now(),
        text: `Uploaded file: ${file.name}`,
        sender: 'user',
        type: 'file',
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fileMessage]);

      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        const preview = content.length > 4000 ? content.substring(0, 4000) : content;
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: `I've received your file "${file.name}". You can now ask me questions about its content.`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fileContext: preview
        }]);
      };
      reader.readAsText(file);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    alert('Message copied to clipboard!');
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your 24/7 learning assistant. How can I help you today?",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowHistory(false);
  };

  const handleSelectConversation = (conv) => {
    setMessages([
      {
        id: 1,
        text: `Continuing conversation: ${conv.title}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 2,
        text: `I see you were discussing ${conv.title}. How can I help you further?`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowHistory(false);
  };

  const handleDeleteConversation = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      setConversations(conversations.filter(conv => conv.id !== id));
    }
  };

  const handleDownloadChat = () => {
    const chatContent = messages.map(msg => 
      `[${msg.timestamp}] ${msg.sender === 'user' ? 'You' : 'Assistant'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintChat = () => {
    const printWindow = window.open('', '_blank');
    const chatHtml = messages.map(msg => `
      <div style="margin-bottom: 20px; padding: 15px; background: ${msg.sender === 'user' ? '#1a1a1a' : '#111111'}; border-radius: 8px; border-left: 3px solid ${msg.sender === 'user' ? '#4D9FFF' : '#facc15'};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong style="color: ${msg.sender === 'user' ? '#4D9FFF' : '#facc15'};">${msg.sender === 'user' ? 'You' : 'Assistant'}</strong>
          <span style="color: #666; font-size: 12px;">${msg.timestamp}</span>
        </div>
        <p style="margin: 0; color: #fff; line-height: 1.6;">${msg.text}</p>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Chat History</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; background: #000; color: #fff; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { color: #facc15; margin: 0; }
            .header p { color: #666; margin: 5px 0 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Chat History</h1>
            <p>${new Date().toLocaleDateString()} • ${messages.length} messages</p>
          </div>
          ${chatHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShareChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.sender === 'user' ? 'You' : 'Assistant'} (${msg.timestamp}): ${msg.text}`
    ).join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'Chat History',
        text: chatContent,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(chatContent);
      alert('Chat copied to clipboard!');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="assistant-page">
        <div className="assistant-container">
          {/* Top Navigation Bar */}
          <div className="assistant-nav-bar">
            <div className="nav-left">
              <button className="nav-icon-btn" onClick={onBack} title="Back to Dashboard">
                <FiArrowLeft />
              </button>
              <button 
                className={`nav-icon-btn ${showHistory ? 'active' : ''}`} 
                onClick={() => setShowHistory(!showHistory)}
                title="History"
              >
                <FiMenu />
              </button>
              <button className="nav-icon-btn" onClick={handleNewChat} title="New Chat">
                <FiPlus />
              </button>
            </div>

            {/* Search Bar */}
            <div className="nav-center">
              <div className="search-container">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-search" onClick={() => setSearchQuery('')}>
                    <FiX />
                  </button>
                )}
              </div>
              {searchQuery && filteredConversations.length > 0 && (
                <div className="search-results">
                  {filteredConversations.slice(0, 5).map(conv => (
                    <div
                      key={conv.id}
                      className="search-result-item"
                      onClick={() => {
                        handleSelectConversation(conv);
                        setSearchQuery('');
                      }}
                    >
                      <FiMessageSquare />
                      <div className="search-result-details">
                        <div className="search-result-title">{conv.title}</div>
                        <div className="search-result-preview">{conv.preview}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="nav-right">
              <button className="nav-icon-btn" onClick={handleDownloadChat} title="Download Chat">
                <FiDownload />
              </button>
              <button className="nav-icon-btn" onClick={handlePrintChat} title="Print Chat">
                <FiPrinter />
              </button>
              <button className="nav-icon-btn" onClick={handleShareChat} title="Share Chat">
                <FiShare2 />
              </button>
            </div>
          </div>

          {/* History Sidebar */}
          <div ref={sidebarRef} className={`history-sidebar ${showHistory ? 'show' : ''}`}>
            <div className="history-header">
              <h3>Chat History</h3>
              <button className="close-history" onClick={() => setShowHistory(false)}>
                <FiX />
              </button>
            </div>
            
            <div className="history-list">
              {filteredConversations.length > 0 ? (
                filteredConversations.map(conv => (
                  <div
                    key={conv.id}
                    className="history-item"
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <FiMessageSquare className="history-icon" />
                    <div className="history-details">
                      <div className="history-title">{conv.title}</div>
                      <div className="history-preview">{conv.preview}</div>
                      <div className="history-meta">
                        <FiClock className="meta-icon" />
                        <span>{conv.date}</span>
                        <span className="dot">•</span>
                        <span>{conv.messages} messages</span>
                      </div>
                    </div>
                    <button 
                      className="history-delete" 
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      title="Delete conversation"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <FiSearch />
                  <p>No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="assistant-main">
            <div className="assistant-chat">
              {/* Messages */}
              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-wrapper ${message.sender}`}
                  >
                    <div className="message-avatar">
                      {message.sender === 'user' ? <FiUser /> : <FiCpu />}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {message.sender === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <span className="message-time">{message.timestamp}</span>
                      </div>
                      <div className="message-text">
                        {message.type === 'file' ? (
                          <div className="file-attachment">
                            <FiPaperclip />
                            <div className="file-info">
                              <span className="file-name">{message.fileName}</span>
                              <span className="file-size">{message.fileSize}</span>
                            </div>
                          </div>
                        ) : (
                          <p>{message.text}</p>
                        )}
                      </div>
                      <button 
                        className="message-copy"
                        onClick={() => handleCopyMessage(message.text)}
                        title="Copy message"
                      >
                        <FiCopy />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="message-wrapper assistant">
                    <div className="message-avatar">
                      <FiCpu />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                
                <button 
                  type="button" 
                  className="input-action-btn"
                  onClick={handleFileUpload}
                  title="Attach file"
                >
                  <FiPaperclip />
                </button>
                
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask me anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />
                
                <button 
                  type="button" 
                  className="input-action-btn"
                  title="Voice input"
                >
                  <FiMic />
                </button>
                
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!inputMessage.trim()}
                >
                  <FiSend />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AssistantPage;