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
    <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: 2,
              alignItems: 'flex-start',
            }}
          >
            {orderedFields.map((field) => {
              const commonProps = {
                fullWidth: true,
                variant: 'standard' as const,
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
                    key={field.key}
                    select
                    {...commonProps}
                    SelectProps={{
                      displayEmpty: true,
                      sx: {
                        '& .MuiOutlinedInput-input': {
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
                  key={field.key}
                  type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                  {...commonProps}
                />
              );
            })}
          </Box>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 3,
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
      </Box>
    </Box>
  );
};

export default ABBDiscountForm;
