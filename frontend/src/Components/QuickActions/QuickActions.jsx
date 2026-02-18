import './QuickActions.css';
import {
  FiUpload,
  FiFileText,
  FiCheckSquare,
  FiCpu,
  FiChevronRight,
  FiZap
} from 'react-icons/fi';
import { useCallback, useRef } from 'react';

function QuickActions({ onNavigate }) {
  const fileInputRef = useRef(null);

  const handleCardClick = useCallback((action) => {
    console.log(`✨ ${action} clicked`);
    
    switch(action) {
      case 'upload':
        handleUpload();
        break;
      case 'summary':
        if (onNavigate) {
          onNavigate('summary');
        }
        break;
      case 'quiz':
        if (onNavigate) {
          onNavigate('quiz');
        }
        break;
      case 'assistant':
        if (onNavigate) {
          onNavigate('assistant');
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, [onNavigate]);

  const handleUpload = useCallback(() => {
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
      input.multiple = false;
      
      input.onchange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
          const fileName = file.name;
          const fileType = fileName.split('.').pop().toLowerCase();
          const fileSize = file.size;
          
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(fileSize) / Math.log(1024));
          const formattedSize = Math.round(fileSize / Math.pow(1024, i)) + ' ' + sizes[i];
          
          if (window.addRecentDocument) {
            window.addRecentDocument(fileName, fileType, formattedSize);
          }
          
          console.log(`📄 Uploaded: ${fileName} (${formattedSize})`);
        }
        input.remove();
      };
      
      fileInputRef.current = input;
    }
    
    fileInputRef.current.click();
  }, []);

  const handleTryNow = useCallback(() => {
    console.log('🎯 Try now clicked');
    if (onNavigate) {
      onNavigate('recommended'); // Navigate to recommended page
    }
  }, [onNavigate]);

  const quickActions = [
    { 
      id: 'upload', 
      title: 'Upload', 
      desc: 'Add documents', 
      icon: FiUpload
    },
    { 
      id: 'summary', 
      title: 'Summary', 
      desc: 'AI insights', 
      icon: FiFileText
    },
    { 
      id: 'quiz', 
      title: 'Quiz', 
      desc: 'Test yourself', 
      icon: FiCheckSquare
    },
    { 
      id: 'assistant', 
      title: 'Assistant', 
      desc: '24/7 help', 
      icon: FiCpu
    }
  ];

  return (
    <div className="quick-actions-wrapper">
      <section className="quick-actions">
        <div className="qa-container">
          <div className="qa-sections-wrapper">
            {/* Quick Actions Section */}
            <div className="qa-section">
              <div className="qa-header">
                <div className="header-left">
                  <h2 className="qa-title">Quick Actions</h2>
                </div>
                <span className="header-badge">{quickActions.length}</span>
              </div>

              <div className="qa-scroll-container">
                <div className="qa-cards">
                  {quickActions.map(({ id, title, desc, icon: Icon }) => (
                    <div
                      key={id}
                      className={`qa-card ${id}`}
                      onClick={() => handleCardClick(id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${title} - ${desc}`}
                    >
                      <div className="card-top">
                        <div className="card-icon-wrapper">
                          <Icon className="qa-icon" />
                        </div>
                        <FiChevronRight className="card-arrow" />
                      </div>
                      <div className="card-text">
                        <h3 className="card-title">{title}</h3>
                        <p className="card-desc">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Section - Dashboard version (unchanged) */}
            <div className="recommended-section">
              <div className="qa-header">
                <div className="header-left">
                  <h2 className="qa-title">Recommended</h2>
                </div>
                <span className="header-badge">New</span>
              </div>

              <div className="recommended-card">
                <div className="recommended-content">
                  <div className="recommended-icon">
                    <FiZap />
                  </div>
                  
                  <div className="recommended-text">
                    <h3 className="recommended-title">Anti-Lazy AI</h3>
                    <p className="recommended-tagline">Learn actively</p>
                  </div>
                </div>
                
                <div className="recommended-footer">
                  <p className="recommended-desc">
                    Smart questioning for better learning
                  </p>
                  <button 
                    className="try-now-btn"
                    onClick={handleTryNow}
                  >
                    Try
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default QuickActions;