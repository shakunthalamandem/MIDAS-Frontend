import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, FormControl,
  InputLabel, MenuItem, Select, TextField, Typography, Grid
} from '@mui/material';
import axios from 'axios';

// Define types
type DealType = 'IPO' | 'FO';
type Region = 'US' | 'Non-US';
type Target = 'T1M' | 'T1D';

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
  "average_sector_return_category"
];

const FO_FIELDS = [
  "deal_size_category", "sponsor_yn_category", "discount_from_announcement_price_category",
  "percentage_primary_category", "allocation_deal_size_percentage_category",
  "allocation_percentage_category", "selected_bank_category", "average_sector_return_category"
];

const sponsorOptions = ['Y', 'N', '0'];
const bankOptions = ['Credit Suisse', 'Morgan Stanley', 'Goldman Sachs'];

const MlEquityMain: React.FC = () => {
  const [dealType, setDealType] = useState<DealType>('IPO');
  const [region, setRegion] = useState<Region>('US');
  const [target, setTarget] = useState<Target>('T1M');
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
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>ML Equity Predictor</Typography>

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
              <MenuItem value="T1M">T1M</MenuItem>
              <MenuItem value="T1D">T1D</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Form Inputs */}
      <Grid container spacing={2} mb={4}>
        {fields.map((key) => {
          if (key === 'sponsor_yn_category' || key === 'selected_bank_category') {
            const options = key === 'sponsor_yn_category' ? sponsorOptions : bankOptions;
            return (
              <Grid item xs={12} md={6} key={key}>
                <FormControl fullWidth>
                  <InputLabel>{key.replace(/_/g, ' ')}</InputLabel>
                  <Select
                    value={formData[key] ?? ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    label={key.replace(/_/g, ' ')}
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
                label={key.replace(/_/g, ' ')}
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
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Prediction Result</Typography>
            <Typography><strong>Prediction:</strong> {result.prediction}</Typography>
            <Typography><strong>Lower Bound:</strong> {result.lower_bound}</Typography>
            <Typography><strong>Upper Bound:</strong> {result.upper_bound}</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MlEquityMain;