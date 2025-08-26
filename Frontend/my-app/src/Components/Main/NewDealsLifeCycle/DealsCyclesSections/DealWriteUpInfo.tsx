import React, { useState, ChangeEvent, useEffect } from 'react';
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

interface DealWriteUpData {
  id?: number | string;
  ticker: string;
  pricing_date: string; // YYYY-MM-DD
  deal_type: string;
  average_sector_return?: number | null;
  monashee_score?: number | null;
  valuation?: string;
  differentiated_summary?: string;
  deal_writeup_rating?: number;
}

interface DealWriteUpInfoProps {
  data: DealWriteUpData;
}

const DealWriteUpInfo: React.FC<DealWriteUpInfoProps> = ({ data }) => {
  const [formData, setFormData] = useState<DealWriteUpData>(data);
  const [editable, setEditable] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  const mapApiResponseToDealWriteUpData = (apiData: any): Partial<DealWriteUpData> => {
    return {
      ticker: apiData.ticker,
      pricing_date: apiData.pricing_date,
      deal_type: apiData.deal_type,
      average_sector_return: apiData.average_sector_return,
      monashee_score: apiData.monashee_score,
      valuation: apiData.valuation,
      differentiated_summary: apiData.differentiated_summary,
      deal_writeup_rating: apiData.deal_writeup_rating,
    };
  };

  const fetchDealWriteUpInfo = async () => {
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
        const mapped = mapApiResponseToDealWriteUpData(result.data);

        setFormData((prev) => ({
          ...prev,
          ...mapped,
        }));
      } else {
        console.error('Failed to fetch deal write-up info');
      }
    } catch (error) {
      console.error('Error fetching deal write-up info:', error);
    }
  };

  useEffect(() => {
    setFormData(data);
    if (data?.ticker && data?.pricing_date && data?.deal_type) {
      fetchDealWriteUpInfo();
    }
  }, [data]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: keyof DealWriteUpData, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload: Partial<DealWriteUpData> = {
        id: data.id,
        ticker: data.ticker,
        pricing_date: data.pricing_date,
        deal_type: data.deal_type,
      };

      Object.keys(formData).forEach((key) => {
        const k = key as keyof DealWriteUpData;
        if (formData[k] !== data[k] && formData[k] !== undefined) {
          payload[k] = formData[k] as any;
        }
      });

      const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

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

  // Helper for truncating text
  const truncateText = (text: string, maxWords = 8) => {
    const words = text.split(' ');
    return words.length > maxWords
      ? words.slice(0, maxWords).join(' ') + '...'
      : text;
  };

  const renderField = (
    label: string,
    name: keyof DealWriteUpData,
    multiline = false,
    canEdit: boolean = false
  ) => {
    const value = formData[name] ?? '';

    return (
      <>
        <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
          {label}
        </Typography>
        {editable && canEdit ? (
          <TextField
            name={name}
            value={value}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="standard"
            multiline={multiline}
            minRows={multiline ? 3 : 1}
            InputProps={{
              sx: { color: '#002060' },
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{ color: '#b1062e', whiteSpace: 'pre-line' }}
          >
            {typeof value === 'string' ? truncateText(value) : value}
          </Typography>
        )}
      </>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, #bcc9ecff, #c5d1f0ff)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          p: 2,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="#002060" fontWeight="bold">
              Deal Write-Up Info
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
            <Grid item xs={12} sm={6}>
              {renderField('Average Sector Return (%)', 'average_sector_return')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('Monashee Score', 'monashee_score', false, true)}
            </Grid>
            <Grid item xs={12}>
              {renderField('Valuation', 'valuation', true, true)}
            </Grid>
            <Grid item xs={12}>
              {renderField('Differentiated Summary', 'differentiated_summary', true, true)}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="#002060" fontWeight={500} gutterBottom>
                Deal Write-Up Rating
              </Typography>
              <BlueSlider
                value={formData.deal_writeup_rating || 0}
                onChange={(_, value) =>
                  handleSliderChange('deal_writeup_rating', value as number)
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

export default DealWriteUpInfo;
