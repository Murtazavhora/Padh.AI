import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { IoMdSend } from "react-icons/io";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left Section */}
        <div className="footer-left">
          <h2 className="footer-logo">
            <span className="logo-padh">Padh</span>
            <span className="logo-dot">.</span>
            <span className="logo-ai">AI</span>
          </h2>
          <p className="footer-description">
            Padh.ai organizes scattered academic resources into structured learning paths.
            We use AI to guide understanding, not just provide answers — with smart summaries,
            PYQs, and quizzes that reduce cognitive overload.
          </p>
          <div className="contact-info">
            <p><MdEmail /> padh.ai@gmail.com</p>
            <p><MdLocationOn /> MIT ADT University</p>
          </div>
          <p className="footer-copy">© 2026 Padh.AI. All Rights reserved.</p>
        </div>

        {/* Links Column */}
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Quick Actions</a></li>
            <li><a href="#">Recommended</a></li>
            <li><a href="#">Recent Documents</a></li>
            <li><a href="#">Calendar</a></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="footer-column">
          <h4>Other</h4>
          <ul>
            <li><a href="#">Your Profile</a></li>
            <li><a href="#">Account Settings</a></li>
            <li><a href="#">Notification</a></li>
            <li><a href="#">Help & Support</a></li>
            <li><a href="#">Invite Friend</a></li>
          </ul>
        </div>

        {/* Social Column */}
        <div className="footer-column social-column">
          <h4>Connect With Us</h4>
          <p className="social-text">Follow us on Social Media for updates and news</p>
          <div className="social-icons">
            <a href="#" className="social-icon"><FaFacebookF /></a>
            <a href="#" className="social-icon"><FaInstagram /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
            <a href="#" className="social-icon"><FaYoutube /></a>
            <a href="#" className="social-icon"><FaLinkedinIn /></a>
          </div>
          
          {/* Simplified Feedback Section */}
          <div className="feedback-section">
            <h5>Your Feedback Matters</h5>
            <div className="feedback-input-group">
              <textarea 
                placeholder="Share your feedback, suggestions, or report an issue..." 
                className="feedback-textarea"
                rows="3"
              ></textarea>
            </div>
            <button className="feedback-submit">
              <IoMdSend className="send-icon" /> Send Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <span className="separator">|</span>
          <a href="#">Terms of Use</a>
          <span className="separator">|</span>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;