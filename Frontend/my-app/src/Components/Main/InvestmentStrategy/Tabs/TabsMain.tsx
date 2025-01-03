import React, { useState } from "react";
import { Box, Button, Card, CardContent, Container, Tab, Tabs, Typography } from "@mui/material";
import Technical from "./Technical";
import Fundamental from "./Fundamental";
import MonasheeS3 from "./MonasheeS3";
import InvestScreenerMain from "./Screener/InvestScreenerMain";

interface SelectedValues {
  MonasheeSpecific: Record<string, string>;
  Technicals: Record<string, string>;
  Fundamentals: Record<string, string>;
}

const TabsMain: React.FC<{ filtersData: any }> = ({ filtersData }) => {
  const [value, setValue] = useState(0); // Track the selected tab

  // State to store user-selected values for all tabs
  const [selectedValues, setSelectedValues] = useState({
    MonasheeSpecific: {},
    Technicals: {},
    Fundamentals: {},
  });

  // State to store the applied values
  const [appliedValues, setAppliedValues] = useState<SelectedValues | null>(null);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue); // Update the selected tab
  };

  const handleFilterChange = (tab: keyof SelectedValues, filterName: string, value: any) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [tab]: {
        ...prevState[tab],
        [filterName]: value,
      },
    }));
  };

  const handleApply = () => {
    setAppliedValues(selectedValues); // Set the applied values
  };

  const handleReset = () => {
    setSelectedValues({
      MonasheeSpecific: {},
      Technicals: {},
      Fundamentals: {},
    });
    setAppliedValues(null); // Clear the applied values
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ width: "100%", padding: 2 }}>
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
                backgroundColor: "#000000",
                borderRadius: 1,
                "& .MuiTab-root": {
                  fontWeight: "bold",
                  color: "#828282",
                  transition: "color 0.3s ease",
                },
                "& .Mui-selected": {
                  color: "#e17400 !important",
                  transition: "color 0.3s ease",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#e17400 !important",
                },
                "& .MuiButtonBase-root-MuiTab-root": {
                  backgroundColor: "#e17400 !important",
                },
              }}
            >
              <Tab label="Monashee Specific" aria-label="Monashee Specific Filters" />
              <Tab label="Fundamentals" aria-label="Fundamentals Filters" />
              <Tab label="Technical" aria-label="Technical Filters" />
            </Tabs>

            <Box sx={{ marginTop: 2 }}>
              {value === 0 && (
                <MonasheeS3
                  data={filtersData["Monashee Specific"]}
                  selectedValues={selectedValues.MonasheeSpecific}
                  onValueChange={(name, value) => handleFilterChange("MonasheeSpecific", name, value)}
                />
              )}
              {value === 1 && (
                <Fundamental
                  data={filtersData.Fundamentals}
                  selectedValues={selectedValues.Fundamentals}
                  onValueChange={(name, value) => handleFilterChange("Fundamentals", name, value)}
                />
              )}
              {value === 2 && (
                <Technical
                  data={filtersData.Technicals}
                  selectedValues={selectedValues.Technicals}
                  onValueChange={(name, value) => handleFilterChange("Technicals", name, value)}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                sx={{ mr: 2, bgcolor: "#002060" }}
                onClick={handleApply}
              >
                Apply
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Pass appliedValues as props to ScreenerMain */}
        <InvestScreenerMain appliedValues={appliedValues} />
      </Box>
    </Container>
  );
};

export default TabsMain;
