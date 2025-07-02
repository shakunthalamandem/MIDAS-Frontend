import React, { useState } from 'react';
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
} from '@mui/material';
import PnlTables from '../PNLPages/PnlTables';

const PNLPagesMain = () => {
  const [filters, setFilters] = useState<any>(null);
  const [tempFilters, setTempFilters] = useState({
    funds: '',
    fromDate: '',
    toDate: '',
  });

  const handleChange = (
    e: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTempFilters({
      ...tempFilters,
      [name]: value,
    });
  };

  const handleApply = () => {
    setFilters(tempFilters);
  };

  const handleCancel = () => {
    setTempFilters({ funds: '', fromDate: '', toDate: '' });
    setFilters(null);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        P&L Dashboard Filters
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="funds-label">Funds</InputLabel>
            <Select
              labelId="funds-label"
              name="funds"
              value={tempFilters.funds}
              label="Funds"
              onChange={handleChange}
            >
              <MenuItem value="Fund A">Fund A</MenuItem>
              <MenuItem value="Fund B">Fund B</MenuItem>
              <MenuItem value="Fund C">Fund C</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="From Date"
            type="date"
            name="fromDate"
            value={tempFilters.fromDate}
            // onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="To Date"
            type="date"
            name="toDate"
            value={tempFilters.toDate}
            // onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            sx={{ mr: 1 }}
          >
            Apply
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </Grid>
      </Grid>

      {filters && <PnlTables selectedFilters={filters} />}
    </Box>
  );
};

export default PNLPagesMain;
