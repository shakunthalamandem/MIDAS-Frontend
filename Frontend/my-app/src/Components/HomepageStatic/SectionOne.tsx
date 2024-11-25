import React from 'react';
import './SectionOne.css'; // Import the CSS file for animations and styles

const SectionOne: React.FC = () => (
  <div className="section-one">
    <div className="section-content left">
      <h1 className="fade-in">Background Banner</h1>
      <p className="fade-in">Left side content goes here. Description, info, etc.</p>
    </div>
    <div className="section-image right fade-in">
      <img src="your-image-url.jpg" alt="Banner" />
    </div>
  </div>
);

export default SectionOne;
