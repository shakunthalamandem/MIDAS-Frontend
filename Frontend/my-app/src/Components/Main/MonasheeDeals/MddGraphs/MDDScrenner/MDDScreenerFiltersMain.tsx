// src/components/FilterTabs/FilterTabs.tsx

import React, { useState } from "react";
import { Tab, Tabs, Box, Typography, Card, CardContent, Grid, Button } from "@mui/material";
import DealSpecificTab from "./DealSpecificTab";
import GeneralTab from "./GeneralTab";
import MonasheeSpecificTab from "./MonasheeSpecificTab";

const MDDScreenerFiltersMain: React.FC = () => {
  const [value, setValue] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
        <CardContent>
          <Typography variant="h5" color="#002060" component="div" gutterBottom>
           MDD Screener Filters          </Typography>
           <Tabs 
            value={value} 
            onChange={handleTabChange} 
            centered
            sx={{
              "& .MuiTab-root": {
                fontWeight: 'bold',            // Make the tab label bold
                color: '#828282',                 // Default color for inactive tabs (black or any color you prefer)
                transition: 'color 0.3s ease', // Smooth color transition for inactive tabs
              },
              "& .Mui-selected": {
                color: '#AE0226',             // Set the color of the active (selected) tab label to #AE0226
                transition: 'color 0.3s ease', // Smooth color transition when selected
              },
              "& .MuiTabs-flexContainer": {
                transition: 'background-color 0.3s ease', // Optional background color transition
              },
              // Customize the tab indicator (bottom line) color
              indicatorColor: 'transparent', // Hide the default indicator
              "& .MuiTabIndicator-root": {
                backgroundColor: '#AE0226',   // Change the indicator color to #AE0226
              },
            }}
          >
          <Tab label="General" />
            <Tab label="Deal Specific" />
            <Tab label="Monashee Specific" />
          </Tabs>

          <Box sx={{ paddingTop: 2 }}>
            {value === 0 && <GeneralTab />}
            {value === 1 && <DealSpecificTab />}
            {value === 2 && <MonasheeSpecificTab />}
          </Box>
       
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                // onClick={handleSubmit}
                sx={{ mr: 2, bgcolor: "#002060" }}
              >
                Apply
              </Button>
              <Button variant="outlined" color="secondary"
            //    onClick={handleCancel}
               >
                Reset
              </Button>
            </Box>
            </CardContent>
            </Card>
    </Box>
  );
};

export default MDDScreenerFiltersMain;
