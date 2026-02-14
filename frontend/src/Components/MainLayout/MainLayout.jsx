import React from 'react';
import './MainLayout.css';
import QuickActions from '../QuickActions/QuickActions';
import RecentDocuments from '../RecentDocuments/RecentDocuments';
import ImageSection from "../ImageSection/ImageSection";

function MainLayout() {
  return (
    <div className="main-layout-wrapper">
      <div className="main-layout-container">
        
        {/* Left Side - Quick Actions */}
        <div className="quick-actions-panel">
          <QuickActions />
        </div>

        {/* Right Side - Image Section + Recent Documents */}
        <div className="recent-docs-panel">
          <ImageSection />      {/* ✅ Now on top */}
          <RecentDocuments />   {/* ✅ Now below */}
        </div>

      </div>
    </div>
  );
}

export default MainLayout;
