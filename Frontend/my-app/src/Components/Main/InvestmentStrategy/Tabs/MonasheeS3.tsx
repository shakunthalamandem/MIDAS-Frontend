import React from 'react';
import {
  TextField,
  FormControl,
  Box,
  Grid,
  Tooltip,
  Typography,
  MenuItem,
  Select,

} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Field } from 'formik';

interface FilterOption {
  label: string;
  description: string;
  options?: string[];
  fields?: {
    type: string;
    operator: string;
    label: string;
    placeholder: string;
  }[];
}

interface MonasheeS3Props {
  data: Record<string, FilterOption>; // Define the structure of the `data` prop
  selectedValues: Record<string, string>; // Selected values for the filters
  onValueChange: (filterName: string, value: string) => void; // Handler to update parent state
}

const MonasheeS3: React.FC<MonasheeS3Props> = ({ data, selectedValues, onValueChange }) => {

  // Render dropdown filter
  const renderDropdown = (key: string, filter: FilterOption) => (
    <Grid item xs={12} sm={6} md={3} key={key}>
      <Box>
        <Typography
          sx={{
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {filter.label}
          {filter.description && (
            <Tooltip title={filter.description} arrow>
              <InfoIcon sx={{ ml: 1, fontSize: '1rem', color: '#cfcfcf' }} />
            </Tooltip>
          )}
        </Typography>
        <FormControl fullWidth margin="normal">
          <Field name={key}>
            {({ field, form }: any) => (
              <Select
                value={field.value || ''}
                onChange={(e) => form.setFieldValue(key, e.target.value)}
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    padding: '8px',
                    fontSize: '0.875rem',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '4px',
                  },
                  maxWidth: '150px',
                }}
              >
                {filter.options?.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Field>
        </FormControl>
      </Box>
    </Grid>
  );

  // Render input filter (for min/max range, for example)
  const renderInput = (key: string, filter: FilterOption) => (
    <Grid item xs={12} sm={6} md={3} key={key}>
      <Box>
        <Typography
          sx={{
            fontSize: '0.75rem',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {filter.label}
          {filter.description && (
            <Tooltip title={filter.description} arrow>
              <InfoIcon sx={{ ml: 1, fontSize: '1rem', color: '#cfcfcf' }} />
            </Tooltip>
          )}
        </Typography>
        {filter.fields?.map((fieldConfig, index) => (
          <Field name={`${key}[${index}]`} key={index}>
            {({ field, form }: any) => (
              <TextField
                {...field}
                type="number"
                label={fieldConfig.label}
                placeholder={fieldConfig.placeholder || 'Enter a value'}
                fullWidth
                margin="normal"
                variant="outlined"
                size="small"
                value={field.value || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : null;
                  const currentValues = form.values[key] || [null, null];
                  const updatedValues = [...currentValues];
                  updatedValues[index] = value;
                  form.setFieldValue(
                    key,
                    updatedValues.map((v, i) => (v === '' ? null : v))
                  );
                }}
                sx={{
                  maxWidth: '100px',
                  '& input': {
                    textAlign: 'center',
                  },
                  marginBottom: '20px',
                  marginRight: '20px',
                }}
                inputProps={{
                  min: -100,
                  max: 100,
                  step: 1,
                }}
              />
            )}
          </Field>
        ))}
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Grid
        container
        spacing={2}
        sx={{
          backgroundColor: '#f7f8f8',
          maxHeight: '370px',
          overflowY: 'auto',
          padding: 2,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(data).map(([key, filter]) => {
          if (filter.options) {
            return renderDropdown(key, filter);
          } else if (filter.fields) {
            return renderInput(key, filter);
          }
          return null;
        })}
      </Grid>
    </Box>
  );
};

export default MonasheeS3;
