import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import './SectionTwo.css';

const SectionTwo: React.FC = () => (
  <Card className="section-card">
    {/* Left Image */}
    <CardMedia
      className="section-image"
      image="your-image-url.jpg"
      title="Descriptive Alt Text"
    />
    {/* Right Content */}
    <CardContent className="section-content">
      <Typography className="section-title" variant="h5" gutterBottom>
        Title of Section
      </Typography>
      <Typography className="section-text" variant="body1">
        Right-side content goes here. Information, description, etc.
      </Typography>
    </CardContent>
  </Card>
);

export default SectionTwo;
