import React from "react";
import { Grid, Box, Typography, Card, CardContent, Button, Container, Tabs, Tab } from "@mui/material";
import GeneralTab from "./GeneralTab";  // Assumes these components are defined
import DealSpecificTab from "./DealSpecificTab";
import MonasheeSpecificTab from "./MonasheeSpecificTab";
import MDDScreenerDataTable from "../../MDDSettings/MDDScreenerDataTable";

// Define the type for the props that MDDScreenerFiltersMain expects
interface MDDScreenerFiltersMainProps {
  filtersData: {
    screener: any[];
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
              {value === 0 && <GeneralTab filtersData={filtersData.screener} />}
              {value === 1 && <DealSpecificTab filtersData={filtersData.DealSpecific} />}
              {value === 2 && <MonasheeSpecificTab filtersData={filtersData.MonasheeSpecific} />}
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
