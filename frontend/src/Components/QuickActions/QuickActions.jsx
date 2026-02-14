import './QuickActions.css';
import {
  FiUpload,
  FiFileText,
  FiCheckSquare,
  FiCpu,
  FiChevronRight,
  FiZap,
  FiTrendingUp
} from 'react-icons/fi';

function QuickActions() {
  const handleCardClick = (action) => {
    console.log(`Clicked: ${action}`);
    
    if (action === 'Upload Document') {
      handleUpload();
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const fileName = file.name;
        const fileType = fileName.split('.').pop().toLowerCase();
        
        if (window.addRecentDocument) {
          window.addRecentDocument(fileName, fileType);
        }
        
        // Simple console log - no alert popups
        console.log(`📄 Uploaded: ${fileName}`);
      }
    };
    
    input.click();
  };

  return (
    <div className="quick-actions-wrapper">
      <section className="quick-actions">
        <div className="qa-container">
          {/* Quick Actions Section */}
          <div className="qa-section">
            <div className="qa-header">
              <div className="header-left">
                <h2 className="qa-title">Quick Actions</h2>
              </div>
              <span className="header-badge">4 items</span>
            </div>

            <div className="qa-scroll-container">
              <div className="qa-cards">
                {/* Upload Card */}
                <div 
                  className="qa-card upload"
                  onClick={() => handleCardClick('Upload Document')}
                >
                  <div className="card-top">
                    <div className="card-icon-wrapper">
                      <FiUpload className="qa-icon" />
                    </div>
                    <FiChevronRight className="card-arrow" />
                  </div>
                  <div className="card-text">
                    <h3 className="card-title">Upload</h3>
                    <p className="card-desc">Add new documents</p>
                  </div>
                </div>

                {/* Summary Card */}
                <div 
                  className="qa-card summary"
                  onClick={() => handleCardClick('AI Summary')}
                >
                  <div className="card-top">
                    <div className="card-icon-wrapper">
                      <FiFileText className="qa-icon" />
                    </div>
                    <FiChevronRight className="card-arrow" />
                  </div>
                  <div className="card-text">
                    <h3 className="card-title">Summary</h3>
                    <p className="card-desc">AI-powered insights</p>
                  </div>
                </div>

                {/* Quiz Card */}
                <div 
                  className="qa-card quiz"
                  onClick={() => handleCardClick('Practice Quiz')}
                >
                  <div className="card-top">
                    <div className="card-icon-wrapper">
                      <FiCheckSquare className="qa-icon" />
                    </div>
                    <FiChevronRight className="card-arrow" />
                  </div>
                  <div className="card-text">
                    <h3 className="card-title">Quiz</h3>
                    <p className="card-desc">Test knowledge</p>
                  </div>
                </div>

                {/* Assistant Card */}
                <div 
                  className="qa-card assistant"
                  onClick={() => handleCardClick('AI Assistant')}
                >
                  <div className="card-top">
                    <div className="card-icon-wrapper">
                      <FiCpu className="qa-icon" />
                    </div>
                    <FiChevronRight className="card-arrow" />
                  </div>
                  <div className="card-text">
                    <h3 className="card-title">Assistant</h3>
                    <p className="card-desc">24/7 AI help</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Section */}
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
                  <p className="recommended-tagline">Learn by thinking, not copying</p>
                </div>
              </div>
              
              <div className="recommended-footer">
                <p className="recommended-desc">
                  Transform your learning with intelligent questioning
                </p>
                <button className="try-now-btn">
                  Try
                </button>
              </div>
            </div>

            {/* Minimal stats */}
            {/* <div className="stats-mini">
              <div className="stat-item">
                <span className="stat-dot"></span>
                <span className="stat-label">Docs</span>
                <span className="stat-value">1.2k</span>
              </div>
              <div className="stat-item">
                <span className="stat-dot"></span>
                <span className="stat-label">Quiz</span>
                <span className="stat-value">856</span>
              </div>
              <div className="stat-item">
                <span className="stat-dot"></span>
                <span className="stat-label">Active</span>
                <span className="stat-value">24/7</span>
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}

export default QuickActions;