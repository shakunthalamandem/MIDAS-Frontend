import React, { useEffect, useState } from "react";
import {
  Tab,
  Tabs,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Container,
} from "@mui/material";
import DealSpecificTab from "./DealSpecificTab";
import GeneralTab from "./GeneralTab";
import MonasheeSpecificTab from "./MonasheeSpecificTab";
import MDDScreenerDataTable from "../../MDDSettings/MDDScreenerDataTable";

interface FilterData {
  [key: string]: {
    options: (string | number)[];
    label: string;
    description?: string;
  };
}

interface MDDScreenerFiltersMainProps {
  filtersData: FilterData[];
}

const MDDScreenerFiltersMain: React.FC<MDDScreenerFiltersMainProps> = ({
  filtersData,
}) => {
  const [value, setValue] = useState<number>(0);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: (string | number)[]; // Store selected filter options
  }>({});
  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: (string | number)[]; // Applied filters to pass to the table
  } | null>(null);

  useEffect(() => {
    // Initialize selected values with default values
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};
    setSelectedValues(initialSelectedValues);
    setAppliedFilters(initialSelectedValues); // Show initial filters on page render
  }, [filtersData]); //
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleApply = () => {
    console.log("Apply clicked", filtersData);
  };

  const handleReset = () => {
    setValue(0);
    console.log("Reset clicked");
  };
  console.log("Filters Data in MDDScreenerFiltersMain:", filtersData); // Debug here

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>

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
            {value === 0 && filtersData && <GeneralTab filtersData={filtersData} />}
            {value === 1 && <DealSpecificTab />}
            {value === 2 && <MonasheeSpecificTab />}
          </Box>
          <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleApply}
                sx={{ bgcolor: "#002060" }}
              >
                Apply
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Box mt={4}>
        <MDDScreenerDataTable sectorwiseData={appliedFilters || selectedValues} />
      </Box>
    </Box>
    </Container>

  );
};

export default MDDScreenerFiltersMain;
