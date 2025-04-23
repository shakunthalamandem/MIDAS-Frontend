import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, FormControl,
  InputLabel, MenuItem, Select, TextField, Typography, Grid, Container
} from '@mui/material';
import axios from 'axios';

type DealType = 'IPO' | 'FO';
type Region = 'US' | 'Non-US';
type Target = 'T+1 Month Return' | 'T+1 Day Return';

type FormDataType = {
  [key: string]: string;
};

type PredictionResult = {
  prediction: string;
  lower_bound: string;
  upper_bound: string;
};

const IPO_FIELDS = [
  "deal_size_category", "percentage_primary_category", "allocation_deal_size_percentage_category",
  "allocation_percentage_category", "issue_offer_price_category", "number_of_shares_offered_category",
  "allocation_price_category", "allocated_shares_category", "subscription_bid_shares_category",
  "total_shares_offered_category", "selected_bank_category", "sponsor_yn_category",
  "sector_category"
];

const FO_FIELDS = [
  "deal_size_category", "sponsor_yn_category", "discount_from_announcement_price_category",
  "percentage_primary_category", "allocation_deal_size_percentage_category",
  "allocation_percentage_category", "selected_bank_category", "sector_category"
];

const sponsorOptions = ['Y', 'N', '0'];
const bankOptions = ['Credit Suisse', 'Morgan Stanley', 'Goldman Sachs'];
const sectorOptions = [
  'Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer Discretionary',
  'Consumer Staples', 'Industrials', 'Materials', 'Real Estate', 'Utilities',
  'Communication Services'
];

const MlEquityMain: React.FC = () => {
  const [dealType, setDealType] = useState<DealType>('IPO');
  const [region, setRegion] = useState<Region>('US');
  const [target, setTarget] = useState<Target>('T+1 Day Return');
  const [formData, setFormData] = useState<FormDataType>({});
  const [result, setResult] = useState<PredictionResult | null>(null);

  const fields = dealType === 'IPO' ? IPO_FIELDS : FO_FIELDS;

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePredict = async () => {
    try {
      const payload = {
        deal_type: dealType,
        region,
        target,
        ...formData
      };

      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/model_prediction/`, payload);

      setResult(response.data as PredictionResult);
    } catch (error) {
      console.error('Prediction failed:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={5} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
          ML Equity Predictor
        </Typography>

        {/* Filters */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Deal Type</InputLabel>
              <Select value={dealType} onChange={e => setDealType(e.target.value as DealType)} label="Deal Type">
                <MenuItem value="IPO">IPO</MenuItem>
                <MenuItem value="FO">FO</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select value={region} onChange={e => setRegion(e.target.value as Region)} label="Region">
                <MenuItem value="US">US</MenuItem>
                <MenuItem value="Non-US">Non-US</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Target</InputLabel>
              <Select value={target} onChange={e => setTarget(e.target.value as Target)} label="Target">
                <MenuItem value="T+1 Month Return">T+1 Month Return</MenuItem>
                <MenuItem value="T+1 Day Return">T+1 Day Return</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Form Inputs */}
        <Grid container spacing={2} mb={4}>
          {fields.map((key) => {
            const label = key.replace(/_/g, ' ');
            let options: string[] | null = null;

            if (key === 'sponsor_yn_category') options = sponsorOptions;
            else if (key === 'selected_bank_category') options = bankOptions;
            else if (key === 'sector_category') options = sectorOptions;

            if (options) {
              return (
                <Grid item xs={12} md={6} key={key}>
                  <FormControl fullWidth>
                    <InputLabel>{label}</InputLabel>
                    <Select
                      value={formData[key] ?? ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      label={label}
                    >
                      {options.map(option => (
                        <MenuItem value={option} key={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              );
            }

            return (
              <Grid item xs={12} md={6} key={key}>
                <TextField
                  label={label}
                  value={formData[key] ?? ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            );
          })}
        </Grid>

        {/* Predict Button */}
        <Box mb={4}>
          <Button variant="contained" color="primary" onClick={handlePredict} size="large">
            Predict
          </Button>
        </Box>

        {/* Result */}
        {result && (
          <Card variant="outlined" sx={{ width: '100%', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Prediction Result</Typography>
              <Typography><strong>Prediction:</strong> {result.prediction}</Typography>
              <Typography><strong>Lower Bound:</strong> {result.lower_bound}</Typography>
              <Typography><strong>Upper Bound:</strong> {result.upper_bound}</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default MlEquityMain;
