import React from 'react';
import './SectionTwo.css';

const SectionTwo: React.FC = () => (
  <div className="section-two">
    <div className="section-image left fade-in">
      <img src="your-image-url.jpg" alt="Image" />
    </div>
    <div className="section-content right fade-in">
      <h2>Title of Section</h2>
      <p>Right side content goes here. Information, description, etc.</p>
    </div>
  </div>
);

export default SectionTwo;
