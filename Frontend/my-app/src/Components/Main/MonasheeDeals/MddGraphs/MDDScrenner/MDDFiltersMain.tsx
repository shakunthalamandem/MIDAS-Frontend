import React from "react";
import { Box, Typography, Tabs, Tab, Container, Card, CardContent, Button, Grid } from "@mui/material";
import GeneralTab from "./GeneralTab";  // Assuming you have these components
import DealSpecificTab from "./DealSpecificTab";
import MonasheeSpecificTab from "./MonasheeSpecificTab";
import MDDScreenerDataTable from "../../MDDSettings/MDDScreenerDataTable";

interface MDDScreenerFiltersMainProps {
  filtersData: {
    screener: {
      [key: string]: {
        options: (string | number)[];
        label: string;
        description?: string;
      };
    }[];
    DealSpecific: any;
    MonasheeSpecific: any;
  };
}

const MDDScreenerFiltersMain: React.FC<MDDScreenerFiltersMainProps> = ({ filtersData }) => {
  const [value, setValue] = React.useState(0);
  const [appliedFilters, setAppliedFilters] = React.useState<any>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleApply = () => {
    console.log("Applied Filters:", appliedFilters);
  };

  const handleReset = () => {
    setAppliedFilters({});
    console.log("Filters Reset");
  };

  // Get the filtered data for each tab
  const getFilteredDataForTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return filtersData.screener;
      case 1:
        return filtersData.DealSpecific;
      case 2:
        return filtersData.MonasheeSpecific;
      default:
        return {};
    }
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ width: "100%", padding: 2 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
          <CardContent>
            <Typography variant="h5" color="#002060" gutterBottom>
              MDD Screener Filters
            </Typography>
            <Tabs value={value} onChange={handleTabChange} centered>
              <Tab label="General" />
              <Tab label="Deal Specific" />
              <Tab label="Monashee Specific" />
            </Tabs>

            <Box sx={{ paddingTop: 2 }}>
              {value === 0 && <GeneralTab filtersData={getFilteredDataForTab(0)} />}
              {value === 1 && <DealSpecificTab filtersData={getFilteredDataForTab(1)} />}
              {value === 2 && <MonasheeSpecificTab filtersData={getFilteredDataForTab(2)} />}
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

        <Box mt={4}>
          <MDDScreenerDataTable sectorwiseData={appliedFilters} />
        </Box>
      </Box>
    </Container>
  );
};

export default MDDScreenerFiltersMain;
