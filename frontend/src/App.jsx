import { useState } from 'react';
import Header from './Components/Header/Header';
import HeadingLayout from './Components/HeadingLayout/HeadingLayout';
import MainLayout from './Components/MainLayout/MainLayout';
import Footer from './Components/Footer/Footer';
import SummaryPage from './pages/SummaryPage';
import RecommendedPage from './pages/RecommendedPage';
import QuizPage from './pages/QuizPage';
import AssistantPage from './pages/AssistantPage';
// import ProfilePage from './pages/ProfilePage';
// import SettingsPage from './pages/SettingsPage';
// import CalendarPage from './pages/CalendarPage';
// import NotificationsPage from './pages/NotificationsPage';
// import HelpPage from './pages/HelpPage';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  const renderContent = () => {
    switch(currentView) {
      case 'home':
        return (
          <>
            <HeadingLayout />
            <MainLayout onNavigate={handleNavigate} />
            <Footer />
          </>
        );
      case 'summary':
        return <SummaryPage onBack={handleBack} />;
      case 'recommended':
        return <RecommendedPage onBack={handleBack} />;
      case 'quiz':
        return <QuizPage onBack={handleBack} />;
      case 'assistant':
        return <AssistantPage onBack={handleBack} />;
      case 'profile':
        return <ProfilePage onBack={handleBack} />;
      case 'settings':
        return <SettingsPage onBack={handleBack} />;
      case 'calendar':
        return <CalendarPage onBack={handleBack} />;
      case 'notifications':
        return <NotificationsPage onBack={handleBack} />;
      case 'help':
        return <HelpPage onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Header is always rendered */}
      <Header onNavigate={handleNavigate} currentView={currentView} />
      {renderContent()}
    </>
  );
}

export default App;