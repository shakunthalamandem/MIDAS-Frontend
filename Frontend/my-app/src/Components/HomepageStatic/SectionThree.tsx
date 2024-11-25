import React from 'react';
import './SectionThree.css';

const SectionThree: React.FC = () => (
  <div className="section-three">
    <div className="section-content left fade-in">
      <h2>Title of Section</h2>
      <p>Left side content goes here. Information, description, etc.</p>
    </div>
    <div className="section-image right fade-in">
      <img src="your-image-url.jpg" alt="Image" />
    </div>
  </div>
);

export default SectionThree;
