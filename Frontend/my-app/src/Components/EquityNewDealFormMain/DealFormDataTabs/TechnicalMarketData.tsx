import React from 'react';
import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { BarChart3 } from 'lucide-react';
import { FormSectionProps } from '../../../types/NewDealFormData';


const TechnicalMarketData: React.FC<FormSectionProps> = ({ data, editable, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChart3 size={20} />
          Technical Market Data
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="3-Month ADTV Local (USD)"
              name="three_month_adtv_local_usd"
              value={data.three_month_adtv_local_usd || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="3-Month ADTV Local (Shares)"
              name="three_month_adtv_local_shares"
              value={data.three_month_adtv_local_shares || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Beta SX5E"
              name="beta_sx5e"
              value={data.beta_sx5e || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="3-Month Volatility"
              name="three_month_volatility"
              value={data.three_month_volatility || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="RSI 14D"
              name="rsi_14d"
              value={data.rsi_14d || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="RSI 30D"
              name="rsi_30d"
              value={data.rsi_30d || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="DMI 14D"
              name="dmi_14d"
              value={data.dmi_14d || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="MACD 9D"
              name="macd_9d"
              value={data.macd_9d || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Stock Relative to MA 50D"
              name="stock_relative_to_ma_50d"
              value={data.stock_relative_to_ma_50d || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={!editable}
              variant={editable ? 'outlined' : 'filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Stock Relative to MA 100D"
              name="stock_relative_to_ma_100d"
              value={data.stock_relative_to_ma_100d || ''}
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

export default TechnicalMarketData;