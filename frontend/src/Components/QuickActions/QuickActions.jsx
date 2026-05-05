import './QuickActions.css';
import {
  FiUpload,
  FiFileText,
  FiCheckSquare,
  FiCpu,
  FiChevronRight,
  FiZap
} from 'react-icons/fi';
import robotImage from '../../assets/robot.png';
import { useCallback } from 'react';

function QuickActions({ onNavigate }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const buildApiUrl = useCallback((path) => {
    const base = API_BASE.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (base.endsWith('/api')) {
      return `${base}${cleanPath}`;
    }
    return `${base}/api${cleanPath}`;
  }, [API_BASE]);

  // -------------------------------
  // NAVIGATION HANDLER
  // -------------------------------
  const handleCardClick = useCallback((action) => {
    switch(action) {
      case 'upload':
        handleUpload();
        break;
      case 'summary':
        onNavigate && onNavigate('summary');
        break;
      case 'quiz':
        onNavigate && onNavigate('quiz');
        break;
      case 'assistant':
        onNavigate && onNavigate('assistant');
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, [onNavigate]);

  // -------------------------------
  // UPLOAD HANDLER (RESOLVED)
  // -------------------------------
  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff';
    input.multiple = false;

    input.onchange = async (event) => {
      try {
        const file = event.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please login first.');
          return;
        }

        const fileName = file.name;
        const fileSize = file.size || 0;

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = fileSize > 0 ? Math.floor(Math.log(fileSize) / Math.log(1024)) : 0;
        const safeIndex = Math.min(i, sizes.length - 1);
        const formattedSize = fileSize > 0
          ? Math.round(fileSize / Math.pow(1024, safeIndex)) + ' ' + sizes[safeIndex]
          : '0 Bytes';

        // SEND TO BACKEND
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch(buildApiUrl('/upload'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json().catch(() => ({}));

        if (!uploadRes.ok) {
          throw new Error(uploadData.detail || `Upload failed (${uploadRes.status})`);
        }

        // SUCCESS
        alert(uploadData.message || 'Document uploaded successfully');
        console.log(`📄 Uploaded: ${fileName} (${formattedSize})`);

        // trigger refresh
        window.dispatchEvent(new Event('documentsUpdated'));

      } catch (err) {
        console.error('Upload error:', err);
        alert(err.message || 'Upload failed. Please try again.');
      } finally {
        input.remove();
      }
    };

    input.click();
  }, [buildApiUrl]);

  const handleTryNow = useCallback(() => {
    if (onNavigate) {
      onNavigate('recommended');
    }
  }, [onNavigate]);

  // -------------------------------
  // UI
  // -------------------------------
  const quickActions = [
    { id: 'upload', title: 'Upload', desc: 'Add documents', icon: FiUpload },
    { id: 'summary', title: 'Summary', desc: 'AI insights', icon: FiFileText },
    { id: 'quiz', title: 'Quiz', desc: 'Test yourself', icon: FiCheckSquare },
    { id: 'assistant', title: 'Assistant', desc: '24/7 help', icon: FiCpu }
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

            {/* Recommended Section */}
            <div className="recommended-section">
              <div className="qa-header">
                <div className="header-left">
                  <h2 className="qa-title">Recommended</h2>
                </div>
                <span className="header-badge">New</span>
              </div>

              <div
                className="recommended-card recommended-card-hitarea"
                role="button"
                tabIndex={0}
                onClick={handleTryNow}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTryNow();
                  }
                }}
                aria-label="Open Anti-Lazy AI recommendation"
              >
                <div className="recommended-content">
                  <div className="recommended-icon">
                    <FiZap />
                  </div>

                  <div className="recommended-text">
                    <h3 className="recommended-title">Anti-Lazy AI</h3>
                    <p className="recommended-tagline">Learn actively</p>
                  </div>

                  <div className="recommended-art" aria-hidden="true">
                    <img src={robotImage} alt="" className="recommended-art-image" />
                  </div>
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