import { useState, useEffect } from 'react';
import { 
  FiUser, FiSettings, FiFileText, 
  FiBookOpen, FiHeadphones, FiBell, FiCalendar, 
  FiHelpCircle, FiUserPlus, FiLogOut, 
  FiChevronRight, FiChevronDown
} from 'react-icons/fi';
import './Header.css';

// Import the upload image
import uploadImage from '../../assets/update.png';

function Header({ onNavigate, currentView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const [openSections, setOpenSections] = useState({
    learning: false,
    other: false
  });

  // Update active item based on current view
  useEffect(() => {
    if (currentView === 'summary') {
      setActiveItem('summary');
    } else if (currentView === 'quiz') {
      setActiveItem('quiz');
    } else if (currentView === 'assistant') {
      setActiveItem('assistant');
    } else if (currentView === 'recommended') {
      setActiveItem('recommended');
    } else if (currentView === 'home') {
      setActiveItem('');
    }
  }, [currentView]);

  const handleMenuClick = () => {
    if (!menuOpen) {
      setClicked(true);
      setTimeout(() => setClicked(false), 400);
    }
    setMenuOpen(!menuOpen);
  };

  const closeSidebar = () => {
    setMenuOpen(false);
  };

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
    
    // Handle navigation for different items - navigates immediately
    if (itemName === 'summary' && onNavigate) {
      onNavigate('summary');
    }
    
    if (itemName === 'quiz' && onNavigate) {
      onNavigate('quiz');
    }
    
    if (itemName === 'assistant' && onNavigate) {
      onNavigate('assistant');
    }
    
    if (itemName === 'upload-doc') {
      console.log('Upload document clicked');
      // Trigger file upload
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
          
          // Format file size
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
      
      input.click();
    }
    
    if (itemName === 'profile') {
      console.log('Profile clicked - navigate to profile page');
      // If you have a profile page, uncomment below
      // if (onNavigate) onNavigate('profile');
    }
    
    if (itemName === 'settings') {
      console.log('Settings clicked - navigate to settings page');
      // if (onNavigate) onNavigate('settings');
    }
    
    if (itemName === 'notifications') {
      console.log('Notifications clicked - open notifications panel');
      // You can implement a notifications panel or modal here
    }
    
    if (itemName === 'calendar') {
      console.log('Calendar clicked - navigate to calendar page');
      // if (onNavigate) onNavigate('calendar');
    }
    
    if (itemName === 'help') {
      console.log('Help clicked - open help center');
      // You can open a help modal or navigate to help page
    }
    
    if (itemName === 'invite') {
      console.log('Invite clicked - open invite modal');
      // You can implement an invite friends modal here
      // For example, copy referral link to clipboard
      navigator.clipboard.writeText('https://padh.ai/join?ref=user123');
      alert('Invite link copied to clipboard!');
    }
    
    if (itemName === 'logout') {
      console.log('Logout clicked');
      // Handle logout logic here
      // Clear user data, redirect to login, etc.
      if (window.confirm('Are you sure you want to logout?')) {
        // Clear localStorage
        localStorage.clear();
        // Redirect to login page or home
        window.location.href = '/';
      }
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLearningHeaderClick = () => {
    toggleSection('learning');
    setActiveItem('learning');
  };

  const handleOtherHeaderClick = () => {
    toggleSection('other');
    setActiveItem('other');
  };

  // Learning items data
  const learningItems = [
    { id: 'upload-doc', icon: FiFileText, text: 'Upload Document' },
    { id: 'summary', icon: FiFileText, text: 'Generate Summary' },
    { id: 'quiz', icon: FiBookOpen, text: 'Practice Quiz' },
    { id: 'assistant', icon: FiHeadphones, text: 'AI Assistant' }
  ];

  // Other items data
  const otherItems = [
    { id: 'notifications', icon: FiBell, text: 'Notifications' },
    { id: 'calendar', icon: FiCalendar, text: 'Calendar' },
    { id: 'help', icon: FiHelpCircle, text: 'Help & Support' },
    { id: 'invite', icon: FiUserPlus, text: 'Invite Friends' }
  ];

  return (
    <>
      {/* Header */}
      <header className="header">
        {/* Hamburger Button */}
        <div
          className={`menu-btn ${menuOpen ? 'open' : ''} ${clicked ? 'clicked' : ''}`}
          onClick={handleMenuClick}
        >
          <div className="menu-btn__inner">
            <span className="menu-btn__line top"></span>
            <span className="menu-btn__line bottom"></span>
          </div>
        </div>

        {/* Logo - Padh.AI */}
        <div className="logo-wrapper">
          <div className="logo">
            <span className="padh">Padh</span>
            <span className="ai">.AI</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${menuOpen ? 'active' : ''}`}>
        <div className="sidebar-content">
          {/* Upload Card - Just Image as Button */}
          <div 
            className="upload-card-btn"
            onClick={() => handleItemClick('upload-doc')}
          >
            <img src={uploadImage} alt="Upload Document" className="upload-card-img" />
          </div>

          {/* Account Section - Regular items (no dropdown) */}
          <div className="sidebar-section">
            <h4 className="section-title">Account</h4>
            <ul className="sidebar-list">
              <li 
                className={`sidebar-item ${activeItem === 'profile' ? 'active' : ''}`}
                onClick={() => handleItemClick('profile')}
              >
                <FiUser className="item-icon" />
                <span className="item-text">Your Profile</span>
                <FiChevronRight className="arrow-icon" />
              </li>
              <li 
                className={`sidebar-item ${activeItem === 'settings' ? 'active' : ''}`}
                onClick={() => handleItemClick('settings')}
              >
                <FiSettings className="item-icon" />
                <span className="item-text">Account Settings</span>
                <FiChevronRight className="arrow-icon" />
              </li>
            </ul>
          </div>

          {/* Learning Section - With Dropdown */}
          <div className="sidebar-section">
            <div 
              className={`section-header ${activeItem === 'learning' ? 'active' : ''}`}
              onClick={handleLearningHeaderClick}
            >
              <div className="section-header-left">
                <FiBookOpen className="section-header-icon" />
                <span className="section-header-title">Learning</span>
              </div>
              <FiChevronDown className={`section-header-arrow ${openSections.learning ? 'rotated' : ''}`} />
            </div>
            
            <div className={`section-dropdown ${openSections.learning ? 'open' : ''}`}>
              {learningItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`dropdown-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <IconComponent className="dropdown-item-icon" />
                    <span className="dropdown-item-text">{item.text}</span>
                    <FiChevronRight className="dropdown-arrow" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other Section - With Dropdown */}
          <div className="sidebar-section">
            <div 
              className={`section-header ${activeItem === 'other' ? 'active' : ''}`}
              onClick={handleOtherHeaderClick}
            >
              <div className="section-header-left">
                <FiBell className="section-header-icon" />
                <span className="section-header-title">Other</span>
              </div>
              <FiChevronDown className={`section-header-arrow ${openSections.other ? 'rotated' : ''}`} />
            </div>
            
            <div className={`section-dropdown ${openSections.other ? 'open' : ''}`}>
              {otherItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`dropdown-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <IconComponent className="dropdown-item-icon" />
                    <span className="dropdown-item-text">{item.text}</span>
                    <FiChevronRight className="dropdown-arrow" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logout - Centered Content */}
          <div className="sidebar-bottom">
            <div 
              className={`logout-btn ${activeItem === 'logout' ? 'active' : ''}`}
              onClick={() => handleItemClick('logout')}
            >
              <div className="logout-content">
                <FiLogOut className="logout-icon" />
                <span className="logout-text">Logout</span>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div className="sidebar-footer">
            <p className="footer-text">New features coming soon</p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
    </>
  );
}

export default Header;