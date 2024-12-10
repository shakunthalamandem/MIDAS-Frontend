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

  const handleApply = () => {
    console.log("Apply clicked");
  };

  const handleReset = () => {
    setValue(0);
    console.log("Reset clicked");
  };

  const yourFiltersData: { [key: string]: { options: (string | number)[]; label: string; description?: string } }[] = [
    {
      year: {
        options: [2020, 2021, 2022],
        label: "Year",
        description: "Select the year",
      },
    },
    {
      deal_type: {
        options: ["Equity", "Debt", "Hybrid"],
        label: "Deal Type",
        description: "Select the deal type",
      },
    },
  ];
  

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
        <CardContent>
          <Typography variant="h5" color="#002060" gutterBottom>
            MDD Screener Filters
          </Typography>
          <Tabs
            value={value}
            onChange={handleTabChange}
            centered
            sx={{
              "& .MuiTab-root": {
                fontWeight: "bold",
                color: "#828282",
                transition: "color 0.3s ease",
              },
              "& .Mui-selected": {
                color: "#AE0226",
                transition: "color 0.3s ease",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#AE0226",
              },
            }}
          >
            <Tab label="General" aria-label="General Filters" />
            <Tab label="Deal Specific" aria-label="Deal Specific Filters" />
            <Tab label="Monashee Specific" aria-label="Monashee Specific Filters" />
          </Tabs>
          <Box sx={{ paddingTop: 2 }}>
            {value === 0 && <GeneralTab filtersData={yourFiltersData} />}
            {value === 1 && <DealSpecificTab />}
            {value === 2 && <MonasheeSpecificTab />}
          </Box>
          <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            <Grid item>
              <Button variant="contained" onClick={handleApply} sx={{ bgcolor: "#002060" }}>
                Apply
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="secondary" onClick={handleReset}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MDDScreenerFiltersMain;
