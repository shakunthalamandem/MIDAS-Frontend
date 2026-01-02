import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  minWidth: '170px',
  textAlign: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
};

const bubbleTailStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-6px',
  right: '10px', // ✅ tail near right edge like your crop
  width: '12px',
  height: '12px',
  backgroundColor: '#0b284f',
  transform: 'rotate(45deg)',
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

  const tooltipFullText = 'Hi, I am Gen AI Assistant';
  const [typedTooltip, setTypedTooltip] = useState<string>('');

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let idx = 0;

    const clearTimers = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      intervalRef.current = null;
      timeoutRef.current = null;
    };

    const startTyping = () => {
      clearTimers();
      setTypedTooltip('');
      idx = 0;

      intervalRef.current = window.setInterval(() => {
        idx += 1;
        setTypedTooltip(tooltipFullText.slice(0, idx));

        if (idx >= tooltipFullText.length) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          timeoutRef.current = window.setTimeout(startTyping, 1200);
        }
      }, 50);
    };

    startTyping();

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {typedTooltip}
        <span aria-hidden="true" style={bubbleTailStyle} />
      </div>

      <div style={avatarStyle} aria-label="Gen AI assistant">
        <video src={videoSrc} style={videoStyle} autoPlay loop muted playsInline />
      </div>
    </div>
  );
};

export default Aibot;
