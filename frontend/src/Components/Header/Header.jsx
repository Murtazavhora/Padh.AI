import { useState } from 'react';
import { 
  FiUser, FiSettings, FiFileText, 
  FiBookOpen, FiHeadphones, FiBell, FiCalendar, 
  FiHelpCircle, FiUserPlus, FiLogOut, 
  FiChevronRight, FiChevronDown
} from 'react-icons/fi';
import './Header.css';

// Import the upload image
import uploadImage from '../../assets/update.png';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const [openSections, setOpenSections] = useState({
    learning: false, // Learning section starts closed
    other: false     // Other section starts closed
  });

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
    // Don't close sidebar immediately for better UX
    // The sidebar will close when the user clicks the overlay or hamburger again
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
            onClick={() => handleItemClick('upload')}
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