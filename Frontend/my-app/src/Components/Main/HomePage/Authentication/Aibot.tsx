import React from 'react';
import { useNavigate } from 'react-router-dom';
import aibotImage from '../../../../Assets/images/ai_bot4.jpg';

const ARROW_RIGHT_OFFSET = '20px'; // must match arrow's right
const ARROW_BOTTOM_OFFSET = '10px'; // must match arrow's bottom
const ARROW_SIZE_PX = 52; // approx arrow size (adjust only if needed)
const GAP_ABOVE_ARROW_PX = 8;

// ✅ Increase to move bot further RIGHT
const HORIZONTAL_NUDGE_PX = 18;

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  right: ARROW_RIGHT_OFFSET,
  bottom: `calc(${ARROW_BOTTOM_OFFSET} + ${ARROW_SIZE_PX + GAP_ABOVE_ARROW_PX}px)`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '6px', // ✅ closer like your crop
  zIndex: 1200,
  cursor: 'pointer',
  transform: `translateX(${HORIZONTAL_NUDGE_PX}px)`,
};


const avatarStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '3px solid #c7b8b8',
  boxShadow: '0 10px 22px rgba(0, 0, 0, 0.28)',
  backgroundColor: '#ffffff',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  transform: 'scale(1.35)',
  transformOrigin: 'center',
};

const Aibot: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      style={containerStyle}
      onClick={() => navigate('/gen_ai_tool')}
      role="button"
      aria-label="Open Gen AI tool"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/gen_ai_tool');
        }
      }}
    >
      <div
        style={avatarStyle}
        aria-label="Gen AI assistant"
      >
        <img src={aibotImage} alt="Midas AI assistant" style={imageStyle} />
      </div>
    </div>
  );
};

export default Aibot;
