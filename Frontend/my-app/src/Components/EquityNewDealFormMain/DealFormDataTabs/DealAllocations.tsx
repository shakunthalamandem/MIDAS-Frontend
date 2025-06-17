import React from 'react';
import { Card, CardContent, Grid, TextField, Typography, InputAdornment } from '@mui/material';
import { PieChart } from 'lucide-react';
import { FormSectionProps } from '../../../types/NewDealFormData';

const DealAllocations: React.FC<FormSectionProps> = ({ data, editable, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PieChart size={20} />
          Deal Allocations
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Sponsor"
              name="sponsor"
              value={data.sponsor || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Percentage Primary"
              name="percentage_primary"
              value={data.percentage_primary || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Price (Local Currency)"
              name="price_local_currency"
              value={data.price_local_currency || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Discount Percentage"
              name="discount_percentage"
              value={data.discount_percentage || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Final Indication Amount (USD)"
              name="final_indication_amount_usd"
              value={data.final_indication_amount_usd || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Final Indication Deal Percentage"
              name="final_indication_deal_percentage"
              value={data.final_indication_deal_percentage || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Allocation Amount (USD)"
              name="allocation_amount_usd"
              value={data.allocation_amount_usd || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Allocation Deal Size Percentage"
              name="allocation_deal_size_percentage"
              value={data.allocation_deal_size_percentage || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Allocation Percentage"
              name="allocation_percentage"
              value={data.allocation_percentage || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Invitation Bank"
              name="invitation_bank"
              value={data.invitation_bank || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DealAllocations;