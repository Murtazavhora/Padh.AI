import React, { useState, useEffect } from 'react';
import './SummaryPage.css';
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function SummaryPage({ onBack }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [summaryText, setSummaryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

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

  const handleDocumentSelect = (doc) => {
    setSelectedDoc(doc);
    setSummaryText('');
    setError('');
  };

  const handleDeleteDocument = (e, docId) => {
    e.stopPropagation();
    const updatedDocs = uploadedDocuments.filter(doc => doc.id !== docId);
    setUploadedDocuments(updatedDocs);
    localStorage.setItem('recentDocuments', JSON.stringify(updatedDocs));
    window.dispatchEvent(new CustomEvent('documentsUpdated', { detail: updatedDocs }));

    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
      setSummaryText('');
      setError('');
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedDoc) return;

    if (!selectedDoc.content || selectedDoc.content.trim().length === 0) {
      setError('No readable content found in this document. Please re-upload the file.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSummaryText('');

    try {
      const response = await fetch(`${API_BASE}/api/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_name: selectedDoc.name,
          content: selectedDoc.content,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || `Request failed (${response.status})`);
      }

      setSummaryText(data.summary || '');
    } catch (err) {
      setError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderFormattedSummary = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="summary-list">
            {listItems.map((item, i) => (
              <li key={i} className="summary-list-item">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h-${index}`} className="summary-heading">{trimmed.replace('## ', '')}</h3>
        );
      } else if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={`h1-${index}`} className="summary-heading-main">{trimmed.replace('# ', '')}</h2>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        listItems.push(trimmed.substring(2));
      } else if (/^\d+\.\s/.test(trimmed)) {
        listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      } else if (trimmed === '') {
        flushList();
      } else {
        flushList();
        const formatted = trimmed
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
        elements.push(
          <p key={`p-${index}`} className="summary-paragraph" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
    });

    flushList();
    return elements;
  };

  const handleDownload = () => {
    if (!summaryText) {
      alert('Please generate a summary first');
      return;
    }
    
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${selectedDoc?.name?.split('.')[0] || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!summaryText) {
      alert('Please generate a summary first');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Summary - ${selectedDoc?.name || 'Document'}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px; 
              line-height: 1.6; 
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { color: #000; font-size: 24px; margin-bottom: 8px; }
            .doc-name { color: #666; font-size: 14px; margin-bottom: 32px; }
            .summary { white-space: pre-line; color: #333; }
          </style>
        </head>
        <body>
          <h1>Document Summary</h1>
          <p class="doc-name">Source: ${selectedDoc?.name || 'Document'}</p>
          <div class="summary">${summaryText.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleShare = () => {
    if (!summaryText) {
      alert('Please generate a summary first');
      return;
    }
    
    if (navigator.share) {
      navigator.share({
        title: `Summary - ${selectedDoc?.name || 'Document'}`,
        text: summaryText,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(summaryText);
      alert('Summary copied to clipboard!');
    }
  };

  return (
    <>
      <Header />
      <div className="summary-page">
        <div className="summary-container">
          {/* Header Row */}
          <div className="header-row">
            <div className="summary-header">
              <h1 className="summary-title">Document Summary</h1>
              <p className="summary-subtitle">Select a document to generate AI-powered summary</p>
            </div>
            
            <button className="back-button" onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="summary-layout">
            {/* Left Panel - Document List */}
            <div className="documents-panel">
              <div className="panel-header">
                <h2 className="panel-title">Uploaded Documents</h2>
                <span className="doc-count">{uploadedDocuments.length}</span>
              </div>

              <div className="documents-list">
                {uploadedDocuments.length > 0 ? (
                  uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`document-item ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
                      onClick={() => handleDocumentSelect(doc)}
                    >
                      <div className="doc-icon">📄</div>
                      <div className="doc-info">
                        <span className="doc-name">{doc.name}</span>
                        <span className="doc-meta">{doc.date} • {doc.size || '0 KB'}</span>
                      </div>
                      <button
                        className="doc-delete-btn"
                        onClick={(e) => handleDeleteDocument(e, doc.id)}
                        title="Remove document"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-documents">
                    <div className="empty-icon">📁</div>
                    <h3 className="empty-title">No Documents</h3>
                    <p className="empty-text">
                      Upload documents using the Upload button in Quick Actions
                    </p>
                  </div>
                )}
              </div>

              <button
                className={`generate-btn ${!selectedDoc || uploadedDocuments.length === 0 || isGenerating ? 'disabled' : ''}`}
                onClick={handleGenerateSummary}
                disabled={!selectedDoc || isGenerating || uploadedDocuments.length === 0}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Summary'
                )}
              </button>
            </div>

            {/* Right Panel - Summary Output */}
            <div className="summary-panel">
              <div className="summary-output">
                <div className="output-header">
                  <h2 className="output-title">Generated Summary</h2>
                  {selectedDoc && (
                    <span className="doc-badge" title={selectedDoc?.name}>
                      {selectedDoc?.name.length > 25 
                        ? selectedDoc?.name.substring(0, 25) + '...' 
                        : selectedDoc?.name}
                    </span>
                  )}
                </div>
                <div className="output-content">
                  {error && (
                    <div className="summary-error">
                      <span className="error-icon">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}
                  {summaryText ? (
                    <div className="summary-formatted">
                      {renderFormattedSummary(summaryText)}
                    </div>
                  ) : (
                    <div className="empty-summary">
                      <div className="empty-icon">📝</div>
                      <p className="empty-summary-text">
                        {isGenerating ? (
                          <span className="generating-text">Generating summary using AI...</span>
                        ) : selectedDoc ? (
                          'Click "Generate Summary" to create AI summary'
                        ) : (
                          'Select a document to generate a summary'
                        )}
                      </p>
                      {isGenerating && (
                        <div className="generating-indicator">
                          <div className="loading-bar">
                            <div className="loading-progress"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className={`action-btn download ${!summaryText ? 'disabled' : ''}`} 
                  onClick={handleDownload}
                  disabled={!summaryText}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  Download
                </button>
                <button 
                  className={`action-btn print ${!summaryText ? 'disabled' : ''}`} 
                  onClick={handlePrint}
                  disabled={!summaryText}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <path d="M6 9V3h12v6"/>
                    <rect x="6" y="15" width="12" height="6" rx="2"/>
                  </svg>
                  Print
                </button>
                <button 
                  className={`action-btn share ${!summaryText ? 'disabled' : ''}`} 
                  onClick={handleShare}
                  disabled={!summaryText}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SummaryPage;