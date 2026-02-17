import React from "react";
import "./ImageSection.css";

function ImageSection() {
  return (
    <div className="image-section">
      <div className="image-grid">

        <div className="card">
          <img
            src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Student using AI learning platform on laptop"
          />
          <div className="overlay">
            <h3>AI That Guides, Not Gives</h3>
            <p>Interactive learning with smart hints and progressive problem-solving</p>
          </div>
        </div>

        <div className="card">
          <img
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Organized study materials and notes"
          />
          <div className="overlay">
            <h3>Resource Organization</h3>
            <p>From chaos to clarity — all your study materials in one structured place</p>
          </div>
        </div>

        <div className="card">
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Student solving practice questions on tablet"
          />
          <div className="overlay">
            <h3>Deeper Understanding</h3>
            <p>Interactive quizzes and PYQs that reinforce concepts, not just test memory</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ImageSection;



