import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface FormData {
  deal_captain: string;
  team: string;
  participants: string[];
  ticker: string;
  company: {
    name: string;
    description: string;
  };
  vendor_issuer: {
    type: string;
    from: string[];
  };
}

interface BackgroundProps {
  data: FormData;
}

const Background: React.FC<BackgroundProps> = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Background Information</Typography>
        <Typography variant="body1">Company: {data.company.name}</Typography>
        <Typography variant="body1">Description: {data.company.description}</Typography>
      </CardContent>
    </Card>
  );
};

export default Background;
