import React, { ChangeEvent } from 'react';
import { Typography, TextField, InputAdornment } from '@mui/material';
import { DealWriteUpData } from './types';

interface FieldRendererProps {
  label: string;
  name: keyof DealWriteUpData;
  value: any;
  editable: boolean;
  canEdit?: boolean;
  adornment?: string;
  multiline?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  label,
  name,
  value,
  editable,
  canEdit = false,
  adornment,
  multiline = false,
  onChange,
}) => {
  const isValueAvailable = value !== null && value !== undefined && value !== '';
  const displayValue = isValueAvailable ? value : 'Not Available';

  return (
    <>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      {editable && canEdit ? (
        <TextField
          name={name}
          value={isValueAvailable ? value : ''}
          onChange={onChange}
          fullWidth
          size="small"
          variant="standard"
          multiline={multiline}
          minRows={multiline ? 3 : 1}
          InputProps={{
            endAdornment:
              adornment && isValueAvailable ? (
                <InputAdornment position="end">{adornment}</InputAdornment>
              ) : undefined,
            sx: { color: '#002060' },
          }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: isValueAvailable ? '#b1062e' : '#999',
            whiteSpace: 'pre-line',
            fontStyle: isValueAvailable ? 'normal' : 'italic',
          }}
        >
          {displayValue}
          {isValueAvailable && adornment ? ` ${adornment}` : ''}
        </Typography>
      )}
    </>
  );
};

export default FieldRenderer;
