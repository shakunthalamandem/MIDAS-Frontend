import React from 'react';
import { Typography, TextField, Button } from '@mui/material';

interface DifferentiatedSummaryFieldProps {
  summary?: string | null;
  editable: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const DifferentiatedSummaryField: React.FC<DifferentiatedSummaryFieldProps> = ({
  summary,
  editable,
  expanded,
  onToggle,
  onChange,
}) => {
  const isAvailable = summary !== null && summary !== undefined && summary !== '';
  const displayValue = isAvailable ? summary : 'Not Available';
  const truncated = isAvailable ? summary!.slice(0, 150) : 'Not Available';
  const isTruncated = isAvailable && summary!.length > 150;

  return (
    <>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        Differentiated Summary
      </Typography>
      {editable ? (
        <TextField
          name="differentiated_summary"
          value={isAvailable ? summary : ''}
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

export default DifferentiatedSummaryField;
