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
  screener: {
    year_range: { options: number[]; label: string; description: string };
    dealType: { options: string[]; label: string; description: string };
    region: { options: string[]; label: string; description: string };
    sector: { options: string[]; label: string; description: string };
    t1_return: { options: string[]; label: string; description: string };
    t1m_returns: { options: string[]; label: string; description: string };
    deal_value: { options: string[]; label: string; description: string };
  };
  DealSpecific: {
    Primary: { type: string; description: string; options: string[] };
    LeadBank: { type: string; description: string; api: string; key: string };
    Sponsor: { type: string; description: string; options: string[] };
    FollowOnDiscount: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
    TPlus1DayToIndexPercent: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
  };
  MonahseeSpecific: {
    AllocationPercentOfDealSize: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
    AllocationPercentOfIOI: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
    HoldPeriod: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
    DealCaption: { type: string; description: string; api: string; key: string };
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
    Object.keys(filtersData.screener || {}).forEach((key) => {
      initialSelectedValues[key] = []; // Initialize each filter as an empty array
    });
    Object.keys(filtersData.DealSpecific || {}).forEach((key) => {
      initialSelectedValues[key] = [];
    });
    Object.keys(filtersData.MonahseeSpecific || {}).forEach((key) => {
      initialSelectedValues[key] = [];
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
    Object.keys(filtersData.screener || {}).forEach((key) => {
      resetValues[key] = [];
    });
    Object.keys(filtersData.DealSpecific || {}).forEach((key) => {
      resetValues[key] = [];
    });
    Object.keys(filtersData.MonahseeSpecific || {}).forEach((key) => {
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
        return filtersData.screener;
      case 1:
        return filtersData.DealSpecific;
      case 2:
        return filtersData.MonahseeSpecific;
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
