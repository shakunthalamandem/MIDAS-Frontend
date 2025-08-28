import React, { useState, useEffect } from 'react';
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
  ticker?: string;
  pricing_date?: string;
  deal_type?: string;
  t1d_pred?: number | null;      // Prediction score
  confidence?: number | null;    // Confidence (0–100)
}

interface AIMLModelPredictionInfoProps {
  data: AIMLModelPredictionData;
}

const AIMLModelPredictionInfo: React.FC<AIMLModelPredictionInfoProps> = ({ data }) => {
  const [formData, setFormData] = useState<AIMLModelPredictionData>(data);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  // 🔹 Mapper (API → AIMLModelPredictionData)
  const mapApiResponseToPredictionData = (apiData: any): Partial<AIMLModelPredictionData> => {
    return {
      t1d_pred: apiData.t1d_pred,
      confidence: apiData.confidence,
    };
  };

  // 🔹 Fetch prediction from API
  const fetchPrediction = async () => {
    try {
      const payload = {
        ticker: data.ticker,
        pricing_date: data.pricing_date,
        deal_type: data.deal_type,
      };

      const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const mapped = mapApiResponseToPredictionData(result.data);

        setFormData((prev) => ({
          ...prev,
          ...mapped,
        }));
      } else {
        console.error('Failed to fetch AI/ML model prediction');
      }
    } catch (error) {
      console.error('Error fetching AI/ML prediction:', error);
    }
  };

  // 🔹 Trigger on data change
  useEffect(() => {
    setFormData(data);
    if (data?.ticker && data?.pricing_date && data?.deal_type) {
      fetchPrediction();
    }
  }, [data]);

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
          background: 'linear-gradient(135deg, #e0ebff, #d4e2fc)',
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
              {renderField('T1D Prediction', formData.t1d_pred)}
            </Grid>
          </Grid>



            <Grid item xs={12}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #e0eeecff, #e0eeecff)",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body1"
                    color="#002060"
                    fontWeight="bold"
                    gutterBottom
                  >
                   Confidence
                  </Typography>
                   <BlueSlider
                value={formData.confidence || 0}
                valueLabelDisplay="on"
                step={1}
                min={0}
                max={100}
                disabled
              />
                </CardContent>
              </Card>
            </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIMLModelPredictionInfo;
