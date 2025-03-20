import { Box, Typography } from '@mui/material';
import React from 'react'
interface NewDealFormMainTableProps {
  selecteditems: any; // Replace 'any' with the appropriate type for 'selecteditems'
}

const NewDealFormMainTable: React.FC<NewDealFormMainTableProps> = ({ selecteditems }) => {
    return (
      <Box sx={{ marginTop: 3, padding: 2, border: '1px solid #ccc' }}>
        <Typography variant="h6">Selected Deal Data</Typography>
        <pre>{JSON.stringify(selecteditems, null, 2)}</pre>
      </Box>
    );
  };

export default NewDealFormMainTable