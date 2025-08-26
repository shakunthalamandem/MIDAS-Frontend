import React, { useState, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  IconButton,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { motion } from 'framer-motion';
import BlueSlider from './BlueSlider';

interface DealColorData {
  id?: number | string;
  ticker: string;
  pricing_date: string; // YYYY-MM-DD
  deal_type: string;
  allocation_as_percentage_of_ioi?: number | null;
  average_ioi?: number | null;
  allocation_as_percentage_of_deal_size?: number | null;
  average_allocation?: number | null;
  times_covered?: string;
  deal_color_rating?: number;
}

interface DealColorInfoProps {
  data: DealColorData;
}

const DealColorInfo: React.FC<DealColorInfoProps> = ({ data }) => {
  const [formData, setFormData] = useState<DealColorData>(data);
  const [editable, setEditable] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: keyof DealColorData, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const method = data.id ? 'PATCH' : 'POST';
      const response = await fetch(
        `${apiUrl}/api/unified_deal_ratings/${data.id || ''}`,
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
    name: keyof DealColorData,
    adornment?: string,
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
        InputProps={{
          disableUnderline: !editable || !canEdit,
          sx: {
            '&.Mui-disabled': {
              WebkitTextFillColor: '#b1062e',
            },
            '& input.Mui-disabled': {
              WebkitTextFillColor: '#b1062e',
            },
          },
          endAdornment: adornment ? (
            <InputAdornment position="end">{adornment}</InputAdornment>
          ) : undefined,
          style: { color: '#002060' },
        }}
      />
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, #f0f4ff, #dce3f5)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          p: 2,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="#002060" fontWeight="bold">
              Deal Colour Info
            </Typography>
            <IconButton onClick={() => (editable ? handleSave() : setEditable(true))}>
              {editable ? (
                <SaveIcon sx={{ color: '#002060' }} />
              ) : (
                <EditIcon sx={{ color: '#002060' }} />
              )}
            </IconButton>
          </Box>

          <Grid container spacing={2} mt={2}>
            {/* Always readonly fields */}
            <Grid item xs={12} sm={6}>
              {renderField('Ticker', 'ticker')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('Pricing Date', 'pricing_date')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('Deal Type', 'deal_type')}
            </Grid>
                        <Grid item xs={12} sm={6} >
              <Typography variant="body2" color="#002060" fontWeight={500} gutterBottom>
                Times Covered
              </Typography>
              <RadioGroup
                row
                value={formData.times_covered || ''}
                onChange={handleChange}
                name="times_covered"
              >
                <FormControlLabel value="1x-5x" control={<Radio disabled={!editable} />} label="1x-5x" />
                <FormControlLabel value="5x-10x" control={<Radio disabled={!editable} />} label="5x-10x" />
                <FormControlLabel value=">10x" control={<Radio disabled={!editable} />} label=">10x" />
              </RadioGroup>
            </Grid>
               <Grid item xs={12} sm={6}>
              {renderField('Average Allocation as % of Deal_Size', 'average_allocation')}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('Avg Allocation as % of IoI', 'average_ioi')}
            </Grid>
   {/* Editable fields */}
            <Grid item xs={12} sm={6}>
              {renderField(
                'Allocation as % of Deal Size',
                'allocation_as_percentage_of_deal_size',
                '%',
                true
              )}
            </Grid>
         
            <Grid item xs={12} sm={6}>
              {renderField(
                'Allocation as % of IOI',
                'allocation_as_percentage_of_ioi',
                '%',
                true
              )}
            </Grid>




            <Grid item xs={12}>
              <BlueSlider
                value={formData.deal_color_rating || 0}
                onChange={(_, value) =>
                  handleSliderChange('deal_color_rating', value as number)
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

export default DealColorInfo;
