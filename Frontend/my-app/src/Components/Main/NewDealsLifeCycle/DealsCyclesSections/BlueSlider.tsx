import React from 'react';
import Slider, { SliderProps } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

// Styled MUI Slider
const StyledSlider = styled(Slider)(() => ({
  color: '#002060',
  height: 6,
  padding: '35px 0',
  '& .MuiSlider-thumb': {
    height: 16,
    width: 16,
    backgroundColor: '#002060',
    border: '2px solid white',
    transition: '0.3s ease-in-out',
    '&:hover': {
      boxShadow: '0 0 0 6px rgba(0, 32, 96, 0.2)',
    },
  },
  // Track (filled part) becomes transparent so rail shows
  '& .MuiSlider-track': {
    border: 'none',
    backgroundColor: 'transparent',
  },
  // Rail (entire bar) has the gradient
  '& .MuiSlider-rail': {
    opacity: 1,
    background: 'linear-gradient(to right, red 0%, orange 50%, green 100%)',
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: '#c35305',
    color: '#fff',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
}));

// Export a functional component with all props passed through
const BlueSlider: React.FC<SliderProps> = (props) => {
  return <StyledSlider {...props} />;
};

export default BlueSlider;
