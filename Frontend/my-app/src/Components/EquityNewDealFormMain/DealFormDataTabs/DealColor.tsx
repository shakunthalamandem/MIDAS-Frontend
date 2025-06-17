import React from 'react';
import { Card, CardContent, Grid, TextField, Typography, InputAdornment } from '@mui/material';
import { Palette } from 'lucide-react';
import { FormSectionProps } from '../../../types/NewDealFormData';

const DealColor: React.FC<FormSectionProps> = ({ data, editable, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Palette size={20} />
          Deal Color & Additional Allocations
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Deal Colour"
              name="deal_colour"
              value={data.deal_colour || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Institutional Allocation %"
              name="institutional_allocation_percent"
              value={data.institutional_allocation_percent || ''}
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
              label="Retail Allocation %"
              name="retail_allocation_percent"
              value={data.retail_allocation_percent || ''}
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
              label="Long Only Allocation %"
              name="long_only_allocation_percent"
              value={data.long_only_allocation_percent || ''}
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
              label="Hedge Funds Allocation %"
              name="hedge_funds_allocation_percent"
              value={data.hedge_funds_allocation_percent || ''}
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
              label="International Allocation %"
              name="international_allocation_percent"
              value={data.international_allocation_percent || ''}
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
              label="Top 10 Allocation Concentration %"
              name="top_10_allocation_concentration_percent"
              value={data.top_10_allocation_concentration_percent || ''}
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
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DealColor;