import React from 'react';
import { ABBSectionProps } from './ABBSection.types';

const ABBSection2: React.FC<ABBSectionProps> = ({ title, description, highlights = [] }) => (
  <section className="abb-section-card">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    {highlights.length > 0 && (
      <div className="abb-section-chips">
        {highlights.map((highlight, index) => (
          <span className="abb-chip" key={`${index}-${highlight}`}>
            {highlight}
          </span>
        ))}
      </div>
    )}
  </section>
);

export default ABBSection2;
