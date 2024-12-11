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

// Define the structure for filters data
interface FilterData {
  [key: string]: {
    options: (string | number)[];  // Options for filters (could be strings or numbers)
    label: string;                 // Label for the filter
    description?: string;         // Optional description for the filter
  };
}

interface MDDScreenerFiltersMainProps {
  filtersData: FilterData;
}

const MDDScreenerFiltersMain: React.FC<MDDScreenerFiltersMainProps> = ({ filtersData }) => {
  const [value, setValue] = useState<number>(0);  // Tab index state
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: (string | number)[] }>({}); // Selected filters
  const [appliedFilters, setAppliedFilters] = useState<{ [key: string]: (string | number)[] } | null>(null); // Applied filters

  useEffect(() => {
    // Initialize selected values with empty arrays for all filters
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};
    Object.keys(filtersData || {}).forEach((key) => {
      initialSelectedValues[key] = []; // Initialize each filter as an empty array
    });
    setSelectedValues(initialSelectedValues);
    setAppliedFilters(initialSelectedValues);
  }, [filtersData]);  // Runs whenever filtersData is updated

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);  // Switch tab
  };

  const handleApply = () => {
    console.log("Applied Filters:", selectedValues);  // Debugging applied filters
    setAppliedFilters(selectedValues);  // Save the selected values as applied filters
  };

  const handleReset = () => {
    // Reset selected filters and applied filters to their initial empty state
    const resetValues: { [key: string]: (string | number)[] } = {};
    Object.keys(filtersData || {}).forEach((key) => {
      resetValues[key] = [];
    });
    setSelectedValues(resetValues);
    setAppliedFilters(resetValues);
    setValue(0);  // Reset to first tab
    console.log("Filters Reset");
  };

  // Returns the filtered data for the specific tab
  const getFilteredDataForTab = (tabIndex: number) => {
    if (!filtersData) return {};  // If no filter data, return an empty object

    switch (tabIndex) {
      case 0:
        return {
          year_range: filtersData.year_range,
          dealType: filtersData.dealType,
          region: filtersData.region,
          sector: filtersData.sector,
        };
      case 1:
        return {
          Primary: filtersData.Primary,
          LeadBank: filtersData.LeadBank,
          Sponsor: filtersData.Sponsor,
          FollowOnDiscount: filtersData.FollowOnDiscount,
          TPlus1DayToIndexPercent: filtersData.TPlus1DayToIndexPercent,
        };
      case 2:
        return {
          AllocationPercentOfDealSize: filtersData.AllocationPercentOfDealSize,
          AllocationPercentOfIOI: filtersData.AllocationPercentOfIOI,
          HoldPeriod: filtersData.HoldPeriod,
          DealCaption: filtersData.DealCaption,
        };
      default:
        return {};  // Return empty object for invalid tab index
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
              {value === 0 && <GeneralTab filtersData={getFilteredDataForTab(0)} />}
              {value === 1 && <DealSpecificTab filtersData={getFilteredDataForTab(1)} />}
              {value === 2 && <MonasheeSpecificTab filtersData={getFilteredDataForTab(2)} />}
            </Box>
            <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={handleApply}
                  sx={{ bgcolor: "#002060" }}
                  disabled={!filtersData || !Object.keys(filtersData).length}
                >
                  Apply
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                  disabled={!filtersData || !Object.keys(filtersData).length}
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
