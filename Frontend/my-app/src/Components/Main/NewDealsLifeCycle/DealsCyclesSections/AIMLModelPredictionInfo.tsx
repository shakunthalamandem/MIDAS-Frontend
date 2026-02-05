import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
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
  t1d_pred?: string | null;
  t1w_pred?: string | null;
  t1m_pred?: string | null;
  confidence?: number | null;
}

interface AIMLModelPredictionInfoProps {
  data: AIMLModelPredictionData;
}

const AIMLModelPredictionInfo: React.FC<AIMLModelPredictionInfoProps> = ({ data }) => {
  const [formData, setFormData] = useState<AIMLModelPredictionData>(data);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  // 🔹 Mapper (API → AIMLModelPredictionData)
const mapApiResponseToPredictionData = (apiData: any): Partial<AIMLModelPredictionData> => ({
  t1d_pred: apiData.t1d_pred,
  t1w_pred: apiData.t1w_pred,
  t1m_pred: apiData.t1m_pred,
  confidence: apiData.confidence,
});


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

    if (!response.ok) {
      console.error('Failed to fetch AI/ML model prediction');
      return;
    }

    const result = await response.json();

    // Make sure to access result.data
    const mapped = mapApiResponseToPredictionData(result.data);

    setFormData((prev) => ({
      ...prev,
      ...mapped,
    }));

  } catch (error) {
    console.error('Error fetching AI/ML prediction:', error);
  }
};


  // 🔹 Trigger on data change
useEffect(() => {
  setFormData(data);
  if (data?.ticker && data?.deal_type) { // remove pricing_date check
    fetchPrediction();
  }
}, [data]);



  // 🔹 Reusable field renderer
  const renderField = (label: string, value: string | number | null | undefined) => {
    const isValueAvailable = value !== null && value !== undefined && value !== "";
    const displayValue = isValueAvailable ? value : "Not Available";

    return (
      <>
        <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isValueAvailable ? "#b1062e" : "#999",
            fontStyle: isValueAvailable ? "normal" : "italic",
            py: 0.5,
          }}
        >
          {displayValue}
        </Typography>
      </>
    );
  };

  // 🔹 Return classification section
  const renderReturnClassification = () => {
    if (formData.deal_type === "IPO") {
      return (
        <Box mt={2}>
          <Typography variant="body1" color="#000000">
            Classifies the expected return into categories:
          </Typography>
          <br></br>


          <Typography variant="body2">📉 <b>Low Return</b>: Return &lt; 3%</Typography>
          <Typography variant="body2">⚖️ <b>Neutral Return</b>: Return between 3% to 8%</Typography>
          <Typography variant="body2">📈 <b>Positive Return</b>: Return &gt; 8%</Typography>
        </Box>
      );
    } else if (formData.deal_type === "FO") {
      return (
        <Box mt={2}>
          <Typography variant="body2" color="#000000">
            Classifies the expected return into categories:
          </Typography>
          <Typography variant="body2">📉 <b>Negative</b>: Return &lt;  1.8%</Typography>
          {/* <Typography variant="body2">⚖️ <b>Neutral</b>: Return between -1% to 1%</Typography> */}
          <Typography variant="body2">📈 <b>Positive</b>: Return &gt; 1.8%</Typography>
        </Box>
      );
    }
    return null;
  };

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
            {/* Conditional Return Classification */}
            <Grid item xs={12}>
              {renderReturnClassification()}
            </Grid>

            {/* T1D Prediction */}
            <Grid item xs={12}>
              {renderField('T+1D Close from Issue Price', formData.t1d_pred)}
            </Grid>
            <Grid item xs={12}>
              {renderField('T+1W from T+1D Close', formData.t1w_pred)}
            </Grid>
            <Grid item xs={12}>
              {renderField('T+1M from T+1D Close', formData.t1m_pred)}
            </Grid>

            {/* Confidence Slider */}
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
                    AI / ML Model Prediction Rating
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
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIMLModelPredictionInfo;
