import React from 'react';
import './ImageSection.css';

function ImageSection() {
  return (
    <section className="image-section">
      {/* Single Circle - Blue Gradient Background */}
      <div className="circular-background">
        <div className="single-circle"></div>
      </div>

      {/* Content - Images at the Very Top */}
      <div className="content">
        {/* Optional: Uncomment if you want a section title */}
        {/* <div className="section-title">Featured</div> */}
        
        <div className="images-container">
          {/* Image 1 - AI-Powered Learning */}
          <div className="image-container">
            <img 
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="AI-Powered Learning"
              loading="lazy"
            />
            <div className="image-overlay"></div>
            <div className="image-caption">AI-Powered Learning</div>
          </div>

          {/* Image 2 - Reduce Cognitive Load */}
          <div className="image-container">
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Reduce Cognitive Load"
              loading="lazy"
            />
            <div className="image-overlay"></div>
            <div className="image-caption">Reduce Cognitive Load</div>
          </div>

          {/* Image 3 - Efficient Learning */}
          <div className="image-container">
            <img 
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Efficient Learning"
              loading="lazy"
            />
            <div className="image-overlay"></div>
            <div className="image-caption">Efficient Learning</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImageSection;