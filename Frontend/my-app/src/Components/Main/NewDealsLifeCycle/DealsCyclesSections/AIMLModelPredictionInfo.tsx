import React, { useState, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  IconButton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
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
  const [formData, setFormData] = useState<AIMLModelPredictionData>(data);
  const [editable, setEditable] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: keyof AIMLModelPredictionData, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const method = data.id ? 'PATCH' : 'POST';
      const response = await fetch(
        `${apiUrl}/api/aiml_model_prediction/${data.id || ''}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        alert('Saved successfully!');
        setEditable(false);
      } else {
        alert('Failed to save data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderField = (label: string, name: keyof AIMLModelPredictionData) => (
    <>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      <TextField
        name={name}
        value={formData[name] ?? ''}
        onChange={handleChange}
        fullWidth
        size="small"
        variant="standard"
        disabled={!editable}
        InputProps={{
          disableUnderline: !editable,
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
            <IconButton
              onClick={() => (editable ? handleSave() : setEditable(true))}
            >
              {editable ? (
                <SaveIcon sx={{ color: '#002060' }} />
              ) : (
                <EditIcon sx={{ color: '#002060' }} />
              )}
            </IconButton>
          </Box>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12}>
              {renderField('T1D Prediction', 't1d_pred')}
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
                value={formData.confidence || 0}
                onChange={(_, value) =>
                  handleSliderChange('confidence', value as number)
                }
                valueLabelDisplay="on"
                step={1}
                min={0}
                max={100}
                disabled={!editable}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIMLModelPredictionInfo;
