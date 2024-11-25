import React, { useState, useEffect } from 'react';
import './SectionFour.css';

const SectionFour: React.FC = () => {
  const [counts] = useState({
    dealCount1: 100,
    dealCount2: 200,
    dealCount3: 300,
    dealCount4: 400,
  });

  return (
    <div className="section-four">
      {Object.entries(counts).map(([key, value], index) => (
        <div key={index} className="deal-box fade-in">
          <h3>{key.replace('dealCount', 'Deal ')}</h3>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
};

export default SectionFour;
