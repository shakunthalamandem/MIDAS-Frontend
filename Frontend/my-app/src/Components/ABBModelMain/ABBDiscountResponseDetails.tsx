import React from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';

const formatLabel = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

interface ABBDiscountResponseDetailsProps {
  payload: Record<string, unknown> | null;
}

const ABBDiscountResponseDetails: React.FC<ABBDiscountResponseDetailsProps> = ({ payload }) => {
  const detail =
    payload && Array.isArray(payload.data) && payload.data.length ? payload.data[0] : payload;
  if (!detail || typeof detail !== 'object') return null;

  const entries = Object.entries(detail).filter(([, value]) => value !== undefined && value !== null);
  if (!entries.length) return null;

  return (
    <Card
      sx={{
        borderRadius: '24px',
        mt: 4,
        border: '1px solid rgba(2,32,96,0.15)',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(226,240,255,0.8))',
        boxShadow: '0 15px 40px rgba(2,32,96,0.18)',
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0b2b57' }}>
          Live ABB Response
        </Typography>
        <Grid container spacing={2}>
          {entries.slice(0, 8).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Typography variant="caption" sx={{ color: '#344155' }}>
                {formatLabel(key)}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#0b2b57' }}>
                {formatValue(value)}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ABBDiscountResponseDetails;
