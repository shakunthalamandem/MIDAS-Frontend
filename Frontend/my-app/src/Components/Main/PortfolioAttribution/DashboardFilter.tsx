import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button,
  TextField,
  Grid,
  Container,
  Checkbox,
  SelectChangeEvent,
  Card,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardAttribution from './DashboardAttribution';

interface FilterOptions {
  funds: string[];
  regions: string[];
  deal_types: string[];
  as_of_date_str: string;
}

interface Filters {
  funds: string[];
  broad_region: string[];
  deal_type: string[];
  as_of_date: string;
}

const DashboardFilter: React.FC = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Filters | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<Filters | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('access_token');

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }

        const response = await axios.get(`${apiUrl}/api/pnl/filters/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        const data = response.data as FilterOptions;
        setFilterOptions(data);

        const allFilters: Filters = {
          funds: data.funds,
          broad_region: data.regions,
          deal_type: data.deal_types,
          as_of_date: data.as_of_date_str,
        };

        setSelectedFilters(allFilters);
        setAppliedFilters(allFilters);
      } catch (error) {
        console.error('Error fetching filter options:', error);
        // navigate('/error');
      }
    };

    fetchFilterOptions();
  }, [navigate]);

  const handleMultiSelectChange = (
    event: SelectChangeEvent<string[]>,
    field: keyof Filters
  ) => {
    const value = event.target.value as string[];

    const allValues =
      field === 'funds'
        ? filterOptions?.funds || []
        : field === 'broad_region'
        ? filterOptions?.regions || []
        : filterOptions?.deal_types || [];

    if (value.includes('All')) {
      const alreadySelectedAll = selectedFilters?.[field].length === allValues.length;
      setSelectedFilters({
        ...selectedFilters!,
        [field]: alreadySelectedAll ? [] : allValues,
      });
    } else {
      setSelectedFilters({
        ...selectedFilters!,
        [field]: value,
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFilters({
      ...selectedFilters!,
      as_of_date: e.target.value,
    });
  };

  const handleApplyFilters = () => {
    const filtersForPayload: Filters = {
      funds: selectedFilters?.funds || [],
      broad_region: selectedFilters?.broad_region || [],
      deal_type: selectedFilters?.deal_type || [],
      as_of_date: selectedFilters?.as_of_date || '',
    };

    setAppliedFilters(filtersForPayload);
    console.log('Applied Filters:', filtersForPayload);
  };

  const handleResetFilters = () => {
    if (!filterOptions) return;

    const allFilters: Filters = {
      funds: filterOptions.funds,
      broad_region: filterOptions.regions,
      deal_type: filterOptions.deal_types,
      as_of_date: filterOptions.as_of_date_str,
    };

    setSelectedFilters(allFilters);
    setAppliedFilters(allFilters);
  };

  return (
    <Container sx={{ paddingTop: 2 }}>
      {filterOptions && selectedFilters ? (
        <Card sx={{ m: 2, p: 2 }}>
          <Typography
            variant="h5"
            align="center"
            style={{ color: '#002060', marginBottom: '16px' }}
          >
            Dashboard Filters
          </Typography>
          <Grid container spacing={3}>
            {/* Fund Dropdown */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Fund</InputLabel>
                <Select
                  multiple
                  value={selectedFilters.funds}
                  onChange={(e) => handleMultiSelectChange(e, 'funds')}
                  renderValue={(selected) =>
                    selected.length === filterOptions.funds.length ? 'All' : selected.join(', ')
                  }
                  label="Fund"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 250,
                      },
                    },
                  }}
                >
                  <MenuItem value="All">
                    <Checkbox
                      checked={selectedFilters.funds.length === filterOptions.funds.length}
                    />
                    All
                  </MenuItem>
                  {filterOptions.funds.map((fund) => (
                    <MenuItem key={fund} value={fund}>
                      <Checkbox checked={selectedFilters.funds.includes(fund)} />
                      {fund}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Region Dropdown */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Region</InputLabel>
                <Select
                  multiple
                  value={selectedFilters.broad_region}
                  onChange={(e) => handleMultiSelectChange(e, 'broad_region')}
                  renderValue={(selected) =>
                    selected.length === filterOptions.regions.length ? 'All' : selected.join(', ')
                  }
                  label="Region"
                >
                  <MenuItem value="All">
                    <Checkbox
                      checked={selectedFilters.broad_region.length === filterOptions.regions.length}
                    />
                    All
                  </MenuItem>
                  {filterOptions.regions.map((region) => (
                    <MenuItem key={region} value={region}>
                      <Checkbox checked={selectedFilters.broad_region.includes(region)} />
                      {region}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Deal Type Dropdown */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Deal Type</InputLabel>
                <Select
                  multiple
                  value={selectedFilters.deal_type}
                  onChange={(e) => handleMultiSelectChange(e, 'deal_type')}
                  renderValue={(selected) =>
                    selected.length === filterOptions.deal_types.length ? 'All' : selected.join(', ')
                  }
                  label="Deal Type"
                >
                  <MenuItem value="All">
                    <Checkbox
                      checked={selectedFilters.deal_type.length === filterOptions.deal_types.length}
                    />
                    All
                  </MenuItem>
                  {filterOptions.deal_types.map((dealType) => (
                    <MenuItem key={dealType} value={dealType}>
                      <Checkbox checked={selectedFilters.deal_type.includes(dealType)} />
                      {dealType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* As Of Date Picker */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth variant="outlined" size="small"
                label="As Of Date"
                type="date"
                value={selectedFilters.as_of_date}
                onChange={handleDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Buttons in a new row and centered */}
            <Grid item xs={12}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    sx={{ bgcolor: "#002060" }}
                  >
                    Apply
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      ) : (
        <div>Loading filter options...</div>
      )}

      {/* Pass applied filters to DashboardAttribution */}
      <DashboardAttribution selectedFilters={appliedFilters || { funds: [], broad_region: [], deal_type: [], as_of_date: '' }} />
    </Container>
  );
};

export default DashboardFilter;
