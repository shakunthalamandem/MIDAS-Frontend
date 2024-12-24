import React, { useState } from 'react';
import Technical from './Technical';
import Fundamental from './Fundamental';
import MonasheeS3 from './MonasheeS3';
import { Box, Button, Card, CardContent, Container, Tab, Tabs, Typography } from '@mui/material';

const TabsMain = () => {
  const [value, setValue] = useState(0); // Track the selected tab

  const handleChange:any = (event:any, newValue:any) => {
    setValue(newValue); // Update the selected tab
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ width: '100%', padding: 2 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
          <CardContent>
            <Typography variant="h5" color="#002060" gutterBottom>
              Investment Strategies Screener
            </Typography>
            <Tabs
              value={value}
              onChange={handleChange}
              centered
              sx={{
                backgroundColor: '#000000', // Background color for tabs
                borderRadius: 1, // Optional: Add rounded corners
                "& .MuiTab-root": {
                  fontWeight: 'bold',
                  color: '#828282',
                  transition: 'color 0.3s ease',
                },
                "& .Mui-selected": {
                  color: '#8f00f7',
                  transition: 'color 0.3s ease',
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: '#8f00f7',
                },
              }}
            >
              <Tab label="Fundamentals" aria-label="Fundamentals Filters" />
              <Tab label="Technical" aria-label="Technical Filters" />
              <Tab label="Monashee Specific S3" aria-label="Monashee Specific S3 Filters" />
            </Tabs>

            <Box sx={{ marginTop: 2 }}>
              {value === 0 && <Fundamental />}
              {value === 1 && <Technical />}
              {value === 2 && <MonasheeS3 />}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                // onClick={handleSubmit}
                sx={{ mr: 2, bgcolor: "#002060" }}
              >
                Apply
              </Button>
              <Button variant="outlined" color="secondary" >
                Reset
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default TabsMain;
