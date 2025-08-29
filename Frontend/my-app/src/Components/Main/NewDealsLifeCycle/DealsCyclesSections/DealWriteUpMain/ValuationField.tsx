import React from 'react';
import { Typography, TextField, Button } from '@mui/material';

interface ValuationFieldProps {
  valuation?: string | null;
  editable: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ValuationField: React.FC<ValuationFieldProps> = ({
  valuation,
  editable,
  expanded,
  onToggle,
  onChange,
}) => {
  const isAvailable = valuation !== null && valuation !== undefined && valuation !== '';
  const displayValue = isAvailable ? valuation : 'Not Available';
  const truncated = isAvailable ? valuation!.slice(0, 150) : 'Not Available';
  const isTruncated = isAvailable && valuation!.length > 150;

  return (
    <>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        Valuation
      </Typography>
      {editable ? (
        <TextField
          name="valuation"
          value={isAvailable ? valuation : ''}
          onChange={onChange}
          fullWidth
          size="small"
          variant="standard"
          multiline
          minRows={3}
          sx={{ color: '#002060' }}
        />
      ) : (
        <>
          <Typography
            variant="body2"
            sx={{
              color: isAvailable ? '#b1062e' : '#999',
              whiteSpace: 'pre-line',
              fontStyle: isAvailable ? 'normal' : 'italic',
            }}
          >
            {expanded || !isTruncated ? displayValue : `${truncated}...`}
          </Typography>
          {isTruncated && (
            <Button onClick={onToggle} sx={{ color: '#136000ff', textTransform: 'none' }}>
              {expanded ? 'Show Less' : 'Read More'}
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default ValuationField;
