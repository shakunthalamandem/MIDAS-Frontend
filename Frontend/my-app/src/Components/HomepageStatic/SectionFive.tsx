import React from 'react';
import './SectionFive.css';

interface Card {
  logo: string;
  heading: string;
  description: string;
}

const SectionFive: React.FC = () => {
  const cards: Card[] = [
    { logo: 'logo1.png', heading: 'Card 1', description: 'Description for card 1' },
    { logo: 'logo2.png', heading: 'Card 2', description: 'Description for card 2' },
    { logo: 'logo3.png', heading: 'Card 3', description: 'Description for card 3' },
  ];

  return (
    <div className="section-five">
      {cards.map((card, index) => (
        <div key={index} className="card fade-in">
          <img src={card.logo} alt={card.heading} className="card-logo" />
          <h3>{card.heading}</h3>
          <p>{card.description}</p>
        </div>
      ))}
    </div>
  );
};

export default SectionFive;
