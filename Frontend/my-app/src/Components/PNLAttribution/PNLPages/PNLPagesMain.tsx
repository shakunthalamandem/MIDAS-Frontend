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
import EFStrategywise from './EFStrategywise';
import EFSectorwise from './EFSectorwise';
import EFRegionwise from './EFRegionwise';
import DealTypeTable from '../DealTypeTable';
import EquityPNLSectorWiseTable from '../EquityPNLSectorWiseTable';

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

        const defaultFilters = {
          funds: [],  // Empty funds by default
          from_date: data.from_date || '2025-01-01',
          to_date: data.to_date || '',
        };

        setTempFilters(defaultFilters);
        setFilters(defaultFilters); //

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

    const selected = typeof value === 'string' ? value.split(',') : value;

    if (selected.includes('All')) {
      if (tempFilters.funds.length === options?.funds.length) {
        // Unselect all
        setTempFilters((prev) => ({ ...prev, funds: [] }));
      } else {
        // Select all
        setTempFilters((prev) => ({ ...prev, funds: options?.funds || [] }));
      }
    } else {
      // Regular selection
      const allSelected = options?.funds.every((fund) => selected.includes(fund));
      setTempFilters((prev) => ({
        ...prev,
        funds: allSelected ? options?.funds || [] : selected,
      }));
    }
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
    if (!options) return;
    const defaultFilters = {
      funds: [], from_date: options.from_date || '2025-01-01',
      to_date: options.to_date || '',
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
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
    <>
    <Container maxWidth="xl">
      <Box p={2}  mb={2} sx={{   background: 'linear-gradient(to right, #c9ffbf,rgb(253, 210, 217))' 


}} borderRadius={2} boxShadow={2}>
        <Typography variant="h5" gutterBottom color="#002060" align='center' fontWeight="bold" mb={2}>
    Equity Distribution        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="funds-label">Funds</InputLabel>
              <Select
                labelId="funds-label"
                name="funds"
                multiple
                value={
                  options?.funds &&
                    tempFilters.funds.length === options.funds.length
                    ? ['All']
                    : tempFilters.funds
                }
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="Funds" />}
                renderValue={(selected) => {
                  const selectedItems =
                    selected.includes('All') && options?.funds
                      ? options.funds
                      : selected;

                  if (selectedItems.length <= 1) {
                    return selectedItems.join(', ');
                  } else {
                    const visible = selectedItems.slice(0, 1).join(', ');
                    const remainingCount = selectedItems.length - 1;
                    return `${visible}, +${remainingCount} more`;
                  }
                }}

                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                <MenuItem value="All">
                  <Checkbox
                    checked={
                      !!options?.funds &&
                      tempFilters.funds.length === options.funds.length
                    }
                    indeterminate={
                      !!options?.funds &&
                      tempFilters.funds.length > 0 &&
                      tempFilters.funds.length < options.funds.length
                    }
                  />

                  <ListItemText primary="All" />
                </MenuItem>
                {options?.funds.map((fund) => (
                  <MenuItem key={fund} value={fund}>
                    <Checkbox checked={tempFilters.funds.includes(fund)} />
                    <ListItemText primary={fund} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="From Date"
              type="date"
              name="from_date"
              value={tempFilters.from_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="To Date"
              type="date"
              name="to_date"
              value={tempFilters.to_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={handleApply}
              fullWidth
              sx={{ bgcolor: '#002060', color: '#fff' }}
            >
              Apply
            </Button>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button variant="outlined" fullWidth onClick={handleCancel}>
              Cancel
            </Button>
          </Grid>
        </Grid>

        {filters && (
          <Box mt={5}>
            <Grid container spacing={2}>
              {/* Uncomment and add your tables here */}
              {/* <Grid item xs={12} md={4}>
                <PnlTables selectedFilters={filters} />
                  </Grid> */}
              <Grid item xs={12} md={4}>
                <EFSectorwise selectedFilters={filters} />
              </Grid>
              <Grid item xs={12} md={4}>
                <EFStrategywise selectedFilters={filters} />
              </Grid>
              <Grid item xs={12} md={4}>
                <EFRegionwise selectedFilters={filters} />
              </Grid>
            </Grid>
          </Box>


        )}
<Typography
  color="textSecondary"
  align="center"
  mt={2}
  sx={{ fontStyle: 'italic' }}
>
  Note: Hedging includes Hedging, Hedging_Converts, Hedging_HY, Hedging_Other
</Typography>

      
      </Box>
    </Container>
      <DealTypeTable />
        <EquityPNLSectorWiseTable />
    </>
  );
};

export default PNLPagesMain;
