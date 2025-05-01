import React, { useState } from 'react';
import {
  Grid,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';

// Define types for the form data structure and row configuration
type Row = {
  label: string;
  key: string;
  type?: 'select' | 'text' | 'number' | 'date';
  options?: string[]; // Options are only for select fields
};

const initialFormData = {
  pricing_date: '',
  issuer_name: '',
  ticker: '',
  region: 'US',
  deal_type: 'IPO',
  fo_type: 'Marketed',
  sector: '',
  deal_size_amount_usd: 0,
  deal_size_shares: 16000000,
  deal_captain: '',
  lead_bank: '',
  sponsor: 'Y',
  primary_percent: 0,
  price_local_currency: 80,
  discount_percentage: 6.9,
  last_close_price: 85.95,
  initial_range: 'No launch range',
  final_indication_amount_usd: 144.8,
  final_indication_shares: 1600000,
  final_indication_deal_percentage: 10,
  allocation_amount_usd: 19.9,
  allocation_shares: 220000,
  allocation_percent_deal_size: 1.38,
  allocation_percent_ioi: 13.8,
};

const DealForm = () => {
  const [formData, setFormData] = useState(initialFormData);

  const handleSave = async () => {
    try {
      const response = await axios.post('/api/create_deal_form', formData);
      console.log('Saved:', response.data);
      alert('Deal data saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Error saving deal data.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string | undefined; value: unknown; }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const formatValue = (value: any) =>
    typeof value === 'number'
      ? isNaN(value)
        ? 'N/A'
        : `$${value.toLocaleString()}`
      : value || 'N/A';

  const tableLeft: Row[] = [
    { label: 'Pricing Date', key: 'pricing_date', type: 'date' },
    { label: 'Issuer Name', key: 'issuer_name' },
    { label: 'Ticker', key: 'ticker' },
    { label: 'Region', key: 'region', type: 'select', options: ['US', 'EMEA', 'APAC', 'non-US America'] },
    { label: 'Deal Type', key: 'deal_type', type: 'select', options: ['IPO', 'FO'] },
    { label: 'FO Type', key: 'fo_type', type: 'select', options: ['Marketed', 'Overnight', 'Block'] },
    { label: 'Sector', key: 'sector', type: 'select', options: ['Tech', 'Health', 'Finance', 'Energy', 'Consumer'] },
    { label: 'Deal Size Amount (USD)', key: 'deal_size_amount_usd', type: 'number' },
    { label: 'Deal Size Shares', key: 'deal_size_shares', type: 'number' },
    { label: 'Deal Captain', key: 'deal_captain', type: 'select', options: ['Captain A', 'Captain B', 'Captain C'] },
    { label: 'Lead Bank', key: 'lead_bank' },
    { label: 'Sponsors (Y/N)', key: 'sponsor', type: 'select', options: ['Y', 'N'] },
    { label: 'Primary %', key: 'primary_percent', type: 'number' },
  ];

  const tableRight: Row[] = [
    { label: 'Price (Local Currency)', key: 'price_local_currency' },
    { label: 'Discount %', key: 'discount_percentage' },
    { label: 'Last Close Price', key: 'last_close_price' },
    { label: 'Initial Range', key: 'initial_range' },
    { label: 'Final Indication Amount (USD)', key: 'final_indication_amount_usd' },
    { label: 'Final Indication Shares', key: 'final_indication_shares' },
    { label: 'Final Indication Deal %', key: 'final_indication_deal_percentage' },
    { label: 'Allocation Amount (USD)', key: 'allocation_amount_usd' },
    { label: 'Allocation Shares', key: 'allocation_shares' },
    { label: 'Allocation % of Deal Size', key: 'allocation_percent_deal_size' },
    { label: 'Allocation % of IOI', key: 'allocation_percent_ioi' },
  ];

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      {/* Header section */}
      

      {/* Card container for both tables */}
      <Card sx={{ marginTop: 4 }}>
        
        <CardContent>
        <Box sx={{  padding: 2 }}>
        <Typography
          variant="h5"
          gutterBottom
          color="#002060"
          align="center"
          sx={{ fontWeight: 'bold' }}
        >
          Basic Info
        </Typography>
      </Box>
          <Grid container spacing={2} maxWidth="lg">

            <Grid item xs={12} sx={{ textAlign: 'right', marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Grid>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableLeft.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? '#f3f3f3' : '#fff',
                          '&:hover': { backgroundColor: '#e0f7fa' },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            border: '1px solid #ccc',
                            height: '4px', // Reduced height
                            padding: '4px 8px', // Reduced padding for better compactness
                            fontSize: '0.85rem', // Smaller text size
                          }}
                        >
                          {row.label}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #ccc', width: '200px' }}>
                          {row.type === 'select' ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleSelectChange}
                            >
                              {row.options!.map((opt: string) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || 'text'}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Table 2 - Right Column */}
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableRight.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? '#f3f3f3' : '#fff',
                          '&:hover': { backgroundColor: '#e0f7fa' },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            width: '300px',
                            height: '4px', // Reduced height
                            border: '1px solid #ccc',
                            padding: '4px 8px', // Reduced padding for better compactness
                            fontSize: '0.85rem', // Smaller text size
                          }}
                        >
                          {row.label}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #ccc' }}>
                          {row.type === 'select' ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleSelectChange}
                            >
                              {row.options!.map((opt: string) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || 'text'}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          {/* Save Button */}
          
        </CardContent>
      </Card>
    </Container>
  );
};

export default DealForm;