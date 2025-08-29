import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { motion } from 'framer-motion';
import BlueSlider from './BlueSlider';
import DifferentiatedSummaryField from './DealWriteUpMain/DifferentiatedSummaryField';
import FieldRenderer from './DealWriteUpMain/FieldRenderer';
import { DealWriteUpData } from './DealWriteUpMain/types';
import { useDealWriteUpInfo } from './DealWriteUpMain/useDealWriteUpInfo';
import ValuationField from './DealWriteUpMain/ValuationField';


interface DealWriteUpInfoProps {
  data: DealWriteUpData;
}

const DealWriteUpInfo: React.FC<DealWriteUpInfoProps> = ({ data }) => {
  const [formData, setFormData] = useState<DealWriteUpData>(data);
  const [editable, setEditable] = useState(false);
  const [valuationExpanded, setValuationExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || '';
  const token = localStorage.getItem('access_token');

  const { fetchDealWriteUpInfo, saveDealWriteUpInfo } = useDealWriteUpInfo({
    apiUrl,
    token,
    setFormData,
  });

  useEffect(() => {
    setFormData(data);
    if (data?.ticker && data?.deal_type) {
      fetchDealWriteUpInfo(data);
    }
  }, [data, fetchDealWriteUpInfo]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const success = await saveDealWriteUpInfo(data, formData);
    if (success) setEditable(false);
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
            <IconButton onClick={() => (editable ? handleSave() : setEditable(true))}>
              {editable ? <SaveIcon sx={{ color: '#002060' }} /> : <EditIcon sx={{ color: '#002060' }} />}
            </IconButton>
          </Box>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6}>
              <FieldRenderer
                label="Last 10 days Avg Sector Return(%)"
                name="average_sector_return"
                value={formData.average_sector_return}
                editable={editable}
                adornment="%"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FieldRenderer
                label="Monashee Score"
                name="monashee_score"
                value={formData.monashee_score}
                editable={editable}
                canEdit
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <ValuationField
                valuation={formData.valuation}
                editable={editable}
                expanded={valuationExpanded}
                onToggle={() => setValuationExpanded(!valuationExpanded)}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <DifferentiatedSummaryField
                summary={formData.differentiated_summary}
                editable={editable}
                expanded={summaryExpanded}
                onToggle={() => setSummaryExpanded(!summaryExpanded)}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #e0eeecff, #e0eeecff)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  mt: 2,
                }}
              >
                <CardContent>
                  <Typography variant="body1" color="#002060" fontWeight="bold" gutterBottom>
                    Deal Write-Up Rating
                  </Typography>
                  <BlueSlider
                    value={formData.deal_writeup_rating || 0}
                    onChange={(_, value) =>
                      setFormData((prev) => ({ ...prev, deal_writeup_rating: value as number }))
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
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DealWriteUpInfo;
