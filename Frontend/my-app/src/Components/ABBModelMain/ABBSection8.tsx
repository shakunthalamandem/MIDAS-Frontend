import React from 'react';
import { ABBSectionProps } from './ABBSection.types';

const ABBSection8: React.FC<ABBSectionProps> = ({ title, description, highlights = [] }) => (
  <section>
    <h2>{title}</h2>
    <p>{description}</p>
    {highlights.length > 0 && (
      <ul>
        {highlights.map((highlight, index) => (
          <li key={`${index}-${highlight}`}>{highlight}</li>
        ))}
      </ul>
    )}
  </section>
);

export default ABBSection8;
