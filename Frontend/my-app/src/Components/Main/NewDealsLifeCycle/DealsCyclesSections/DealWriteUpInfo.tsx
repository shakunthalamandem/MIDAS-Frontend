import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  IconButton,
  Grid,
  InputAdornment,
  Button,
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
  const [valuationExpanded, setValuationExpanded] = useState(false);
  const [differentiatedSummaryExpanded, setDifferentiatedSummaryExpanded] = useState(false);

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

  const renderField = (
    label: string,
    name: keyof DealWriteUpData,
    adornment?: string,
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
              endAdornment:
                adornment && value !== '' && value !== null ? (
                  <InputAdornment position="end">{adornment}</InputAdornment>
                ) : undefined,
              sx: { color: '#002060' },
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{ color: '#b1062e', whiteSpace: 'pre-line' }}
          >
            {value}
            {value !== '' && value !== null && adornment ? ` ${adornment}` : ''}
          </Typography>
        )}
      </>
    );
  };

  const renderValuationField = () => {
    const valuation = formData.valuation ?? '';
    const truncatedValuation = valuation.slice(0, 150); // Show first 150 characters
    const isTruncated = valuation.length > 150;

    return (
      <>
        <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
          Valuation
        </Typography>
        {editable ? (
          <TextField
            name="valuation"
            value={formData.valuation}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="standard"
            multiline
            minRows={3}
            sx={{ color: '#002060' }}
          />
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{ color: '#b1062e', whiteSpace: 'pre-line' }}
            >
              {valuationExpanded || !isTruncated
                ? valuation
                : `${truncatedValuation}...`}
            </Typography>
            {isTruncated && (
              <Button
                onClick={() => setValuationExpanded(!valuationExpanded)}
                sx={{ color: '#002060', textTransform: 'none' }}
              >
                {valuationExpanded ? 'Show Less' : 'Read More'}
              </Button>
            )}
          </>
        )}
      </>
    );
  };

  const renderDifferentiatedSummaryField = () => {
    const differentiatedSummary = formData.differentiated_summary ?? '';
    const truncatedDifferentiatedSummary = differentiatedSummary.slice(0, 150); // Show first 150 characters
    const isTruncated = differentiatedSummary.length > 150;

    return (
      <>
        <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
          Differentiated Summary
        </Typography>
        {editable ? (
          <TextField
            name="differentiated_summary"
            value={formData.differentiated_summary}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="standard"
            multiline
            minRows={3}
            sx={{ color: '#002060' }}
          />
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{ color: '#b1062e', whiteSpace: 'pre-line' }}
            >
              {differentiatedSummaryExpanded || !isTruncated
                ? differentiatedSummary
                : `${truncatedDifferentiatedSummary}...`}
            </Typography>
            {isTruncated && (
              <Button
                onClick={() => setDifferentiatedSummaryExpanded(!differentiatedSummaryExpanded)}
                sx={{ color: '#002060', textTransform: 'none' }}
              >
                {differentiatedSummaryExpanded ? 'Show Less' : 'Read More'}
              </Button>
            )}
          </>
        )}
      </>
    );
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
              {renderField(
                'Last 10 days Avg Sector Return(%)',
                'average_sector_return',
                '%'
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('Monashee Score', 'monashee_score', undefined, false, true)}
            </Grid>
            <Grid item xs={12}>
              {renderValuationField()}
            </Grid>
            <Grid item xs={12}>
              {renderDifferentiatedSummaryField()}
            </Grid>
    
          </Grid>

            <Grid item xs={12}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #e0eeecff, #e0eeecff)",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  mt: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="body1"
                    color="#002060"
                    fontWeight="bold"
                    gutterBottom
                  >
 Deal Write-Up Rating                  </Typography>
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
                </CardContent>
              </Card>
            </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DealWriteUpInfo;
