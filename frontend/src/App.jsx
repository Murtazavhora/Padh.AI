import { useState } from 'react';
import Header from './Components/Header/Header';
import HeadingLayout from './Components/HeadingLayout/HeadingLayout';
import MainLayout from './Components/MainLayout/MainLayout';
import Footer from './Components/Footer/Footer';
import SummaryPage from './pages/SummaryPage';
import RecommendedPage from './pages/RecommendedPage';

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
            <Header />
            <HeadingLayout />
            <MainLayout onNavigate={handleNavigate} />
            <Footer />
          </>
        );
      case 'summary':
        return <SummaryPage onBack={handleBack} />;
      case 'recommended':
        return <RecommendedPage onBack={handleBack} />;
      default:
        return null;
    }
  };

  return renderContent();
}

export default App;

