






import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import axios from 'axios';  // Ensure you have axios installed

interface Row {
  label: string;
  key: keyof DealColorData;
  type?: 'text' | 'number' | 'select' | 'date';
  options?: string[];
}

interface DealColorData {
  deal_color: string;
  institutional_allocation_percent: string;
  retail_allocation_percent: string;
  long_only_allocation_percent: string;
  hedge_funds_allocation_percent: string;
  local_allocation_percent: string;
  international_allocation_percent: string;
  top_10_allocation_concentration_percent: string;
  aftermarket_order: string;
  aftermarket_strategy: string;
  target_price_local: string;
  target_price_percentage_above_issue: string;
  stop_price_local: string;
  stop_price_percentage_below_issue: string;
}

interface DealColorProps {
  data?: DealColorData;  // Make the data prop optional
}

const tableLeft: Row[] = [
  { label: 'Deal Color', key: 'deal_color' },
  { label: 'Institutional Allocation (%)', key: 'institutional_allocation_percent', type: 'number' },
  { label: 'Retail Allocation (%)', key: 'retail_allocation_percent', type: 'number' },
  { label: 'Long Only Allocation (%)', key: 'long_only_allocation_percent', type: 'number' },
  { label: 'Hedge Funds Allocation (%)', key: 'hedge_funds_allocation_percent', type: 'number' },
  { label: 'Local Allocation (%)', key: 'local_allocation_percent', type: 'number' },
  { label: 'International Allocation (%)', key: 'international_allocation_percent', type: 'number' },
  { label: 'Top 10 Allocation Concentration (%)', key: 'top_10_allocation_concentration_percent', type: 'number' },
];

const tableRight: Row[] = [
  { label: 'Aftermarket Order', key: 'aftermarket_order' },
  { label: 'Aftermarket Strategy', key: 'aftermarket_strategy' },
  { label: 'Target Price (Local)', key: 'target_price_local', type: 'number' },
  { label: 'Target Price % Above Issue', key: 'target_price_percentage_above_issue', type: 'number' },
  { label: 'Stop Price (Local)', key: 'stop_price_local', type: 'number' },
  { label: 'Stop Price % Below Issue', key: 'stop_price_percentage_below_issue', type: 'number' },
];

const DealColor: React.FC<DealColorProps> = ({ data }) => {
  const [formData, setFormData] = useState<DealColorData>(() => {
    return data || {
      deal_color: '',
      institutional_allocation_percent: '',
      retail_allocation_percent: '',
      long_only_allocation_percent: '',
      hedge_funds_allocation_percent: '',
      local_allocation_percent: '',
      international_allocation_percent: '',
      top_10_allocation_concentration_percent: '',
      aftermarket_order: '',
      aftermarket_strategy: '',
      target_price_local: '',
      target_price_percentage_above_issue: '',
      stop_price_local: '',
      stop_price_percentage_below_issue: '',
    };
  });

  const [isEditable, setIsEditable] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('access_token');

      if (!apiUrl) throw new Error('API URL is not defined');
      if (!token) throw new Error('Access token is missing');

      const payload = { ...formData };

      const response = await axios.post(`${apiUrl}/api/update_data/`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Save API Response:', response.data);
      setSnackbarMessage('Data saved successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setIsEditable(false);  // Disable editing after save
    } catch (error) {
      console.error('Error saving data:', error);
      setSnackbarMessage('Error saving data.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const renderTable = (rows: Row[]) => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={row.key}
              sx={{
                backgroundColor: i % 2 === 0 ? '#f3f3f3' : '#fff',
                '&:hover': { backgroundColor: '#e0f7fa' },
              }}
            >
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ccc', fontSize: '0.85rem' }}>
                {row.label}
              </TableCell>
              <TableCell sx={{ border: '1px solid #ccc' }}>
                {row.type === 'select' && row.options ? (
                  <Select
                    fullWidth
                    size="small"
                    name={row.key}
                    value={formData[row.key]}
                    onChange={handleSelectChange}
                    disabled={!isEditable}
                  >
                    {row.options.map(opt => (
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
                    value={formData[row.key]}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={!isEditable}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ marginTop: 4 }}>
        <CardContent>
          <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom color="#002060" align="center" sx={{ fontWeight: 'bold' }}>
              Deal Color
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ textAlign: 'right', marginTop: 2 }}>
              <Button
                variant="contained"
                color={isEditable ? 'success' : 'primary'}
                onClick={isEditable ? handleSave : handleEdit}
              >
                {isEditable ? 'Save' : 'Edit'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>{renderTable(tableLeft)}</Grid>
            <Grid item xs={12} sm={6}>{renderTable(tableRight)}</Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DealColor;









