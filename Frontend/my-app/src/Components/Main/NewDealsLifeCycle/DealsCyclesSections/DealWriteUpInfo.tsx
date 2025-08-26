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

interface DealWriteUpData {
  id?: number | string;
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
      const method = data.id ? 'PATCH' : 'POST';
      const response = await fetch(
        `${apiUrl}/api/deal_writeup/${data.id || ''}`,
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

  const renderField = (
    label: string,
    name: keyof DealWriteUpData,
    multiline = false,
    canEdit: boolean = false
  ) => (
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
        disabled={!editable || !canEdit}
        multiline={multiline}
        minRows={multiline ? 3 : 1}
        InputProps={{
          disableUnderline: !editable || !canEdit,
          sx: {
            '&.Mui-disabled': {
              WebkitTextFillColor: '#b1062e',
            },
            '& input.Mui-disabled, & textarea.Mui-disabled': {
              WebkitTextFillColor: '#b1062e',
            },
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
            {/* Always read-only */}
            <Grid item xs={12} sm={6}>
              {renderField('Average Sector Return (%)', 'average_sector_return')}
            </Grid>
    {/* Editable */}
            <Grid item xs={12} sm={6}>
              {renderField('Monashee Score', 'monashee_score', false, true)}
            </Grid>
            <Grid item xs={12}>
              {renderField('Valuation', 'valuation')}
            </Grid>
            <Grid item xs={12}>
              {renderField('Differentiated Summary', 'differentiated_summary', true)}
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
