import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  Container,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import PnlTables from '../PNLPages/PnlTables';

interface FilterOptions {
  funds: string[];
  from_date: string;
  to_date: string;
}

const PNLPagesMain = () => {
  const [filters, setFilters] = useState<any>(null);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [tempFilters, setTempFilters] = useState({
    funds: [] as string[],
    from_date: '',
    to_date: '',
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('access_token');

        if (!apiUrl) throw new Error('API URL is not defined');

        const response = await fetch(`${apiUrl}/api/pnl_tables_filters/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch filter options');

        const data = await response.json();
        setOptions(data);

        setTempFilters({
          funds: [],
          from_date: data.from_date || '2025-01-01',
          to_date: data.to_date || '',
        });
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);



const handleMultiSelectChange = (event: SelectChangeEvent<string[]>) => {
  const {
    target: { value },
  } = event;
  setTempFilters((prev) => ({
    ...prev,
    funds: typeof value === 'string' ? value.split(',') : value,
  }));
};

  const handleApply = () => {
    setFilters(tempFilters);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setTempFilters((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  const handleCancel = () => {
    setTempFilters({
      funds: [],
      from_date: options?.from_date || '2025-01-01',
      to_date: options?.to_date || '',
    });
    setFilters(null);
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
        <Typography mt={2}>Loading filters...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={3} bgcolor="#fafafa" borderRadius={2} boxShadow={2}>
        <Typography variant="h5" gutterBottom color='#002060'>
          P&L & Risk
        </Typography>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="funds-label">Funds</InputLabel>
              <Select
                labelId="funds-label"
                name="funds"
                multiple
                value={tempFilters.funds}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="Funds" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options?.funds.map((fund) => (
                  <MenuItem key={fund} value={fund}>
                    <Checkbox checked={tempFilters.funds.indexOf(fund) > -1} />
                    <ListItemText primary={fund} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
     <TextField
  fullWidth
  size="small"
  label="From Date"
  type="date"
  name="from_date"
  value={tempFilters.from_date}
  onChange={handleInputChange}  // ✅ FIXED
  InputLabelProps={{ shrink: true }}
/>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
<TextField
  fullWidth
  size="small"
  label="To Date"
  type="date"
  name="to_date"
  value={tempFilters.to_date}
  onChange={handleInputChange}  // ✅ FIXED
  InputLabelProps={{ shrink: true }}
/>
          </Grid>

          <Grid item xs={12} sm={12} md={12} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={handleApply} sx={{ mr: 2 }}>
              Apply
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Grid>
        </Grid>

        {filters && (
          <Box mt={3}>
            <PnlTables selectedFilters={filters} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PNLPagesMain;
