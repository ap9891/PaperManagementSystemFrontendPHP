import React from 'react';
import './DisposablePlates.css';

const DisposablePlates = () => {
  return (
    <div className="polythene-container">
      <div className="content-wrapper">
        <h1 className="page-title">Disposable Plates</h1>
        
        <div className="alert">
          <div className="alert-icon">🚧</div>
          <div className="alert-content">
            <h2>Under Development</h2>
            <p>This page is currently under construction. Check back soon for information about our polythene raw materials.</p>
          </div>
        </div>
        
        <div className="info-card">
          <div className="construction-icon">
            🏗️
          </div>
          
          <p className="info-text">
            We're working hard to bring you detailed information about our polythene raw materials, including:
          </p>
          
          <ul className="feature-list">
            <li>Material specifications and grades</li>
            <li>Quality certifications</li>
            <li>Application guidelines</li>
            <li>Technical documentation</li>
          </ul>
          
          <p className="contact-text">
            For immediate inquiries about our polythene raw materials, please contact our sales team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisposablePlates;