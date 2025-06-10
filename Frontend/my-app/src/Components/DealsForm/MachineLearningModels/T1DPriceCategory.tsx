import React, { useState } from 'react';
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Box,
} from '@mui/material';

const T1DPriceCategory = (): JSX.Element => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [price, setPrice] = useState<string>('');

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setIsChecked(event.target.checked);
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPrice(event.target.value);
  };


  const handleRepredict = (): void => {
    console.log('Repredicting with price:', price);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
    
      <FormControlLabel
        control={
          <Checkbox
            checked={isChecked}
            onChange={handleCheckboxChange}
            sx={{
              color: '#002060', 
              '&.Mui-checked': {
                color: '#002060',
              },
            }}
          />
        }
        label="Do you have the T + 1Day Open Category Price for the deal ?"
      />
      {isChecked && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Enter Price"
            variant="outlined"
            value={price}
            onChange={handlePriceChange}
            size="small"
            sx={{ mr: 2 }}
          />
        
          <Button variant="outlined" onClick={handleRepredict} sx={{ backgroundColor: '#002060', color: '#fff' }}>
            Repredict
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default T1DPriceCategory;