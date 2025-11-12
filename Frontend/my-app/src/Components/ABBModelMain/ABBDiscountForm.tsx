import React, { FormEvent } from 'react';
import { Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';

import {
  DiscountFormValues,
  discountFields,
  blockDealFields,
  formFieldBase,
  yesNoOptions,
} from './ABBDiscountConfig';

interface ABBDiscountFormProps {
  formValues: DiscountFormValues;
  handleFieldChange: (field: keyof DiscountFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  isSubmitDisabled: boolean;
}

const ABBDiscountForm: React.FC<ABBDiscountFormProps> = ({
  formValues,
  handleFieldChange,
  handleSubmit,
  loading,
  isSubmitDisabled,
}) => (
  <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          variant="standard"
          label="Ticker"
          value={formValues.ticker}
          onChange={handleFieldChange('ticker')}
          required
          InputLabelProps={{
            shrink: true,
            sx: { color: '#1d2b54', fontWeight: 600 },
          }}
          sx={formFieldBase}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          variant="standard"
          type="date"
          label="Launch Date"
          value={formValues.tradeDate}
          onChange={handleFieldChange('tradeDate')}
          required
          InputLabelProps={{
            shrink: true,
            sx: { color: '#1d2b54', fontWeight: 600 },
          }}
          sx={formFieldBase}
        />
      </Grid>
    </Grid>

    <Box
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 2,
        mt: 3,
        overflowX: 'auto',
        pb: 1,
        '&::-webkit-scrollbar': {
          height: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cfd5ec',
          borderRadius: 2,
        },
      }}
    >
      {discountFields.map((field) => (
        <TextField
          key={field.key}
          select
          variant="standard"
          label={field.label}
          value={formValues[field.key]}
          onChange={handleFieldChange(field.key)}
          InputLabelProps={{
            shrink: true,
            sx: { color: '#1d2b54', fontWeight: 600 },
          }}
          SelectProps={{
            displayEmpty: true,
          }}
          sx={{
            ...formFieldBase,
            flex: '1 1 18%',
            minWidth: { xs: 150, md: 170 },
            '& .MuiSelect-select': {
              paddingTop: 1.25,
              paddingBottom: 1.25,
            },
          }}
        >
          <MenuItem value="" disabled>
            Select option
          </MenuItem>
          {yesNoOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      ))}
    </Box>

    <Grid container spacing={2} sx={{ mt: 2 }}>
      {blockDealFields.map((field) => (
        <Grid item key={field.key} xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            variant="standard"
            label={field.label}
            type="number"
            value={formValues[field.key]}
            onChange={handleFieldChange(field.key)}
            InputLabelProps={{
              shrink: true,
              sx: { color: '#1d2b54', fontWeight: 600 },
            }}
            sx={formFieldBase}
          />
        </Grid>
      ))}
    </Grid>

    <Box
      sx={{
        display: 'flex',
        justifyContent: { xs: 'center', md: 'flex-start' },
        alignItems: 'center',
        gap: 2,
        mt: { xs: 3, md: 4 },
        flexWrap: 'wrap',
      }}
    >
      <Button
        variant="contained"
        type="submit"
        disabled={loading || isSubmitDisabled}
        sx={{
          background: '#0b2b57',
          borderRadius: '18px',
          paddingX: 3.5,
          paddingY: 1.25,
          boxShadow: '0 12px 30px rgba(11,43,87,0.18)',
          textTransform: 'none',
          fontWeight: 600,
          color: '#fff',
          '&:hover': {
            background: '#0a264d',
          },
        }}
      >
        {loading ? 'Processing...' : 'Submit to ABB API'}
      </Button>

      <Box sx={{ flexGrow: 1, maxWidth: 320, pl: { md: 4 } }}>
        <Typography variant="body2" sx={{ color: '#1d2b54' }}>
          The payload contains the discount flags above plus the ticker, launch date, and block deal details submitted.
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default ABBDiscountForm;
