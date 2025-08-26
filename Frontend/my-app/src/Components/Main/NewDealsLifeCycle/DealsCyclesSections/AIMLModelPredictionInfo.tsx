import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import BlueSlider from './BlueSlider';

interface AIMLModelPredictionData {
  id?: number | string;
  t1d_pred?: number | null;      // Prediction score
  confidence?: number | null;    // Confidence (0–100)
}

interface AIMLModelPredictionInfoProps {
  data: AIMLModelPredictionData;
}

const AIMLModelPredictionInfo: React.FC<AIMLModelPredictionInfoProps> = ({ data }) => {
  const renderField = (label: string, value: string | number | null | undefined) => (
    <>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      <TextField
        value={value ?? ''}
        fullWidth
        size="small"
        variant="standard"
        disabled
        InputProps={{
          sx: {
            '&.Mui-disabled': { WebkitTextFillColor: '#b1062e' },
            '& input.Mui-disabled': { WebkitTextFillColor: '#b1062e' },
          },
          style: { color: '#002060' },
        }}
      />
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, #a7b5dfff, #acbbdfff)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          p: 2,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="#002060" fontWeight="bold">
              AI/ML Model Prediction
            </Typography>
          </Box>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12}>
              {renderField('T1D Prediction', data.t1d_pred)}
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="#002060"
                fontWeight={500}
                gutterBottom
              >
                Confidence
              </Typography>
              <BlueSlider
                value={data.confidence || 0}
                valueLabelDisplay="on"
                step={1}
                min={0}
                max={100}
                disabled
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIMLModelPredictionInfo;
