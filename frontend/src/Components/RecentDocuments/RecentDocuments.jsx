import { useState, useEffect } from 'react';
import { FiFile, FiChevronRight } from 'react-icons/fi';
import './RecentDocuments.css';

const RecentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [allDocuments, setAllDocuments] = useState([]);

  // Load all documents from localStorage on component mount
  useEffect(() => {
    const savedDocs = localStorage.getItem('recentDocuments');
    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs);
      setAllDocuments(parsedDocs);
      // Show only first 3 by default
      setDocuments(parsedDocs.slice(0, 3));
    }
  }, []);

  // Function to add a new document
  const addDocument = (fileName) => {
    const newDoc = {
      id: Date.now(),
      name: fileName,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Add new document at the beginning
    const updatedDocs = [newDoc, ...allDocuments];
    setAllDocuments(updatedDocs);
    localStorage.setItem('recentDocuments', JSON.stringify(updatedDocs));
    
    // Update displayed documents based on current view
    if (showAll) {
      setDocuments(updatedDocs); // Show all
    } else {
      setDocuments(updatedDocs.slice(0, 3)); // Show only first 3
    }
  };

  // Function to format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Function to handle document click
  const handleDocumentClick = (doc) => {
    console.log('Opening document:', doc.name);
    alert(`Opening: ${doc.name}\n\nThis would open/download the document in a real implementation.`);
  };

  // Toggle between showing 3 documents and all documents
  const toggleViewAll = () => {
    if (showAll) {
      // Switch back to showing only 3
      setDocuments(allDocuments.slice(0, 3));
      setShowAll(false);
    } else {
      // Show all documents
      setDocuments(allDocuments);
      setShowAll(true);
    }
  };

  // Export the addDocument function so QuickActions can use it
  useEffect(() => {
    window.addRecentDocument = addDocument;
  }, [allDocuments, showAll]);

  // Get documents to display
  const displayDocs = showAll ? documents : [...documents];
  
  // If not showing all and less than 3 documents, add empty slots
  if (!showAll && displayDocs.length < 3) {
    while (displayDocs.length < 3) {
      displayDocs.push({ id: `empty-${displayDocs.length}`, empty: true });
    }
  }

  return (
    <div className="recent-docs-wrapper">
      <section className="recent-docs">
        {/* Header matching QuickActions exactly */}
        <div className="qa-header">
          <h2 className="qa-title">Recent Documents</h2>
        </div>

        <div className="recent-card">
          {/* Document List */}
          <div className="recent-list">
            {displayDocs.length > 0 ? (
              displayDocs.map((doc, index) => (
                <div 
                  key={doc.id || index}
                  className={`recent-row ${doc.empty ? 'empty-row' : ''}`}
                  onClick={() => !doc.empty && handleDocumentClick(doc)}
                >
                  <div className="doc-content">
                    <div className="doc-icon-text">
                      <div className="doc-icon-wrapper">
                        <FiFile className="doc-icon" />
                      </div>
                      <div className="doc-details">
                        {doc.empty ? (
                          <>
                            <span className="doc-name empty-name">No document uploaded</span>
                            <span className="doc-date empty-date">Upload a document</span>
                          </>
                        ) : (
                          <>
                            <span className="doc-name">{doc.name}</span>
                            <span className="doc-date">{formatDate(doc.date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!doc.empty && <FiChevronRight className="doc-arrow" />}
                </div>
              ))
            ) : (
              // Only show empty state when there are truly no documents
              <div className="no-documents">
                <div className="doc-icon-wrapper empty-icon">
                  <FiFile className="doc-icon" />
                </div>
                <span>No documents uploaded yet</span>
                <p className="no-docs-hint">Upload your first document using the "Upload Document" button</p>
              </div>
            )}
          </div>

          {/* Footer with View All button - Inside the card like Recommended section */}
          {allDocuments.length > 0 && (
            <div className="recent-footer">
              <p className="recent-desc">
                {showAll ? 'Showing all documents' : 'View all your uploaded documents'}
              </p>
              <button 
                className="view-all-btn"
                onClick={toggleViewAll}
              >
                {showAll ? 'Show Less' : 'View All'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RecentDocuments;
