import React from 'react';
import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';

interface Props {
  data: any;
  editable: boolean;
  onChange: (data: any) => void;
}

const TechnicalMarketData: React.FC<Props> = ({ data, editable, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Technical Market Data</Typography>
        <Grid container spacing={2}>
          {Object.entries(data).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <TextField
                label={key.replace(/_/g, ' ').toUpperCase()}
                name={key}
                value={value || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                disabled={!editable}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TechnicalMarketData;