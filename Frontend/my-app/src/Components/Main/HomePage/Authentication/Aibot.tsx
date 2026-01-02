import React from 'react';
import { useNavigate } from 'react-router-dom';

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '10px', // align vertically with scroll-to-top button
  right: '110px', // sit to the left of the scroll-to-top button without overlap
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // keep bubble centered over the avatar
  gap: '10px',
  zIndex: 1200,
  cursor: 'pointer',
};

const bubbleStyle: React.CSSProperties = {
  position: 'relative',
  backgroundColor: '#0b284f',
  color: '#ffffff',
  padding: '10px 12px',
  borderRadius: '14px',
  fontWeight: 600,
  fontSize: '14px',
  lineHeight: 1.3,
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
  minHeight: '32px',
  minWidth: '170px', // prevent horizontal shifting while typing
  textAlign: 'center',
};

const bubbleTailStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-6px',
  left: '50%',
  width: '12px',
  height: '12px',
  backgroundColor: '#0b284f',
  transform: 'translateX(-50%) rotate(45deg)',
};

const avatarStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '3px solid #0b284f',
  boxShadow: '0 10px 22px rgba(0, 0, 0, 0.28)',
  backgroundColor: '#ffffff',
};

const videoStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const Aibot: React.FC = () => {
  const navigate = useNavigate();
  const videoSrc = `${process.env.PUBLIC_URL || ''}/images/aibot.mp4`;

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
      <div style={bubbleStyle}>
        Hi, I am Gen AI Assistant
        <span aria-hidden="true" style={bubbleTailStyle} />
      </div>
      <div style={avatarStyle} aria-label="Gen AI assistant">
        <video
          src={videoSrc}
          style={videoStyle}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>
  );
};

export default Aibot;
