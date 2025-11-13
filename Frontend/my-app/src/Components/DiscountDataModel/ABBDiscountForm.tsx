import React, { FormEvent } from 'react';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';

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
}) => {
  const orderedFields = [
    { key: 'ticker', label: 'Ticker', type: 'text', required: true },
    { key: 'tradeDate', label: 'Launch Date', type: 'date', required: true },
    ...discountFields.map((field) => ({ key: field.key, label: field.label, type: 'select' })),
    ...blockDealFields.map((field) => ({ key: field.key, label: field.label, type: 'number' })),
  ] as Array<{
    key: keyof DiscountFormValues;
    label: string;
    type: 'text' | 'date' | 'select' | 'number';
    required?: boolean;
  }>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          {/* Responsive, equal-width field grid */}
          <Box
            sx={{
              display: 'grid',
              // Each field gets at least 220px; they auto-flow to keep rows aligned
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 2,
              alignItems: 'start',
            }}
          >
            {orderedFields.map((field) => {
              const commonProps = {
                fullWidth: true,
                variant: 'standard' as const, // keep your existing style; change to 'outlined' if you prefer
                label: field.label,
                value: formValues[field.key],
                onChange: handleFieldChange(field.key),
                required: field.required,
                InputLabelProps: {
                  shrink: true,
                  sx: { color: '#1d2b54', fontWeight: 600 },
                },
                sx: {
                  ...formFieldBase,
                  minWidth: 0,
                },
              };

              if (field.type === 'select') {
                return (
                  <TextField
                    key={String(field.key)}
                    select
                    {...commonProps}
                    SelectProps={{
                      displayEmpty: true,
                      sx: {
                        '& .MuiOutlinedInput-input, & .MuiInputBase-input': {
                          paddingTop: 1.25,
                          paddingBottom: 1.25,
                        },
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
                );
              }

              return (
                <TextField
                  key={String(field.key)}
                  type={
                    field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'
                  }
                  {...commonProps}
                />
              );
            })}
          </Box>
        </Grid>

        {/* Submit button aligned to the right, placed last */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={loading || isSubmitDisabled}
              sx={{
                background: '#0b2b57',
                borderRadius: '18px',
                px: 3.5,
                py: 1.25,
                boxShadow: '0 12px 30px rgba(11,43,87,0.18)',
                textTransform: 'none',
                fontWeight: 600,
                color: '#fff',
                '&:hover': { background: '#0a264d' },
              }}
            >
              {loading ? 'Processing...' : 'Submit to ABB API'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ABBDiscountForm;
