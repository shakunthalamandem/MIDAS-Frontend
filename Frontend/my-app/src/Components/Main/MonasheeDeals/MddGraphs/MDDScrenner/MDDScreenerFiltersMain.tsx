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
import { Formik, Form, Field } from "formik";
import DealSpecificTab from "./DealSpecificTab";
import GeneralTab from "./GeneralTab";
import MonasheeSpecificTab from "./MonasheeSpecificTab";
import MDDScreenerDataTable from "../../MDDSettings/MDDScreenerDataTable";
// import SummaryCard from "./SummaryCard";

// Define the structure for filters data (same as your initial code)
interface FilterData {
  screener: {
    year_range: { options: number[]; label: string; description: string };
    deal_type: { options: string[]; label: string; description: string };
    region: { options: string[]; label: string; description: string };
    sector: { options: string[]; label: string; description: string };
    t1d_returns: { options: string[]; label: string; description: string };
    t1m_returns: { options: string[]; label: string; description: string };
    deal_size: { options: string[]; label: string; description: string };
  };
  DealSpecific: {
    percentage_primary: { type: string; description: string; options: string[] };
    selected_bank: { type: string; description: string; api: string; key: string };
    sponsor: { type: string; description: string; options: string[] };
    fo_discount: {
      type: string;
      description: string;
      fields: {
        type: string;
        operator: string;
        label: string;
        placeholder: string;
      }[];
    };
    tplus_1d_issueprice: {
      type: string;
      description: string;
      fields: {
        type: string;
        operator: string;
        label: string;
        placeholder: string;
      }[];
    };
  };
  MonahseeSpecific: {
    allocation_deal_size: {
      type: string;
      description: string;
      fields: {
        type: string;
        operator: string;
        label: string;
        placeholder: string;
      }[];
    };
    allocation_ioi: {
      type: string;
      description: string;
      fields: {
        type: string;
        operator: string;
        label: string;
        placeholder: string;
      }[];
    };
    average_hold_period: {
      type: string;
      description: string;
      fields: {
        type: string;
        operator: string;
        label: string;
        placeholder: string;
      }[];
    };
    deal_caption: {
      type: string;
      description: string;
      api: string;
      key: string;
    };
  };
}

interface MDDScreenerFiltersMainProps {
  filtersData: FilterData;
}

const MDDScreenerFiltersMain: React.FC<MDDScreenerFiltersMainProps> = ({
  filtersData,
}) => {
  const [value, setValue] = useState<number>(0); // Tab index state
  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: (string | number)[];
  } | null>(null); // Applied filters

  useEffect(() => {
    // Initialize applied filters when filtersData changes
    if (filtersData) {
      const initialValues: { [key: string]: (string | number)[] } = {};
      Object.keys(filtersData.screener || {}).forEach((key) => {
        initialValues[key] = [];
      });
      Object.keys(filtersData.DealSpecific || {}).forEach((key) => {
        initialValues[key] = [];
      });
      Object.keys(filtersData.MonahseeSpecific || {}).forEach((key) => {
        initialValues[key] = [];
      });
      setAppliedFilters(initialValues);
    }
  }, [filtersData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue); // Switch tab
  };

  const handleApply = (values: { [key: string]: any }) => {
    setAppliedFilters(values); // Save selected values as applied filters
    // Trigger API call here with values
    // Example: apiCall(values);
  };

  const handleReset = () => {
    // Reset form to initial state
    setAppliedFilters({});
  };

  // Returns the filtered data for the specific tab
  const getFilteredDataForTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return filtersData.screener;
      case 1:
        return filtersData.DealSpecific;
      case 2:
        return filtersData.MonahseeSpecific;
      default:
        return {}; // Return empty object for invalid tab index
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
              <Tab
                label="Monashee Specific"
                aria-label="Monashee Specific Filters"
              />
            </Tabs>
            <Box sx={{ paddingTop: 2 }}>
              <Formik
                initialValues={appliedFilters || {}}
                enableReinitialize
                onSubmit={handleApply}
              >
                {({ values, handleChange }) => (
                  <Form>
                    {value === 0 && (
                      <GeneralTab filtersData={getFilteredDataForTab(0)} />
                    )}
                    {value === 1 && (
                      <DealSpecificTab filtersData={getFilteredDataForTab(1)} />
                    )}
                    {value === 2 && (
                      <MonasheeSpecificTab
                        filtersData={getFilteredDataForTab(2)}
                      />
                    )}
                    <Grid
                      container
                      justifyContent="center"
                      spacing={2}
                      sx={{ mt: 2 }}
                    >
                      <Grid item>
                        <Button
                          variant="contained"
                          type="submit"
                          sx={{ bgcolor: "#002060" }}
                          disabled={
                            !filtersData || !Object.keys(filtersData).length
                          }
                        >
                          Apply
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="secondary"
                          type="button"
                          onClick={handleReset}
                          disabled={
                            !filtersData || !Object.keys(filtersData).length
                          }
                        >
                          Reset
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Box>
          </CardContent>
        </Card>
        <Box mt={4} mb={4}>
          <MDDScreenerDataTable sectorwiseData={appliedFilters || {}} />
          {/* <SummaryCard sectorwiseData={appliedFilters || {}} /> */}
        </Box>
      </Box>
    </Container>
  );
};

export default MDDScreenerFiltersMain;
