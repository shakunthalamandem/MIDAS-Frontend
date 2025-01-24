import React, { useState } from "react";
import { Box, Button, Card, CardContent, Container, Tab, Tabs, Typography } from "@mui/material";
import Technical from "./Technical";
import Fundamental from "./Fundamental";
import MonasheeS3 from "./MonasheeS3";
import InvestScreenerAPI from "./Screener/InvestScreenerAPI";

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
  
        <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2,mt:3 }}>
          <CardContent>

                 <Tabs
                    value={value}
                    onChange={handleChange}
                    centered
                    TabIndicatorProps={{
                      style: { display: "none" },
                    }}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      margin: "10px 0",
                      "& .MuiTab-root": {
                        backgroundColor: "#E3E6F0", // Neutral background for unselected tabs
                        color: "#002060", // Dark blue text for contrast
                        borderRadius: "12px",
                        padding: "10px 20px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        margin: "0 5px",
                        textTransform: "none", // Avoid all caps
                        transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#DCE6F0", // Slightly lighter shade on hover
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        },
                      },
                      "& .Mui-selected": {
                        backgroundColor: "#013e3a", // Vibrant orange for selected tab
                        color: "#ffffff !important", // White text for selected tab
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Stronger shadow for selected tab
                      },
                    }}
                  >
              <Tab label="Monashee Specific" aria-label="Monashee Specific Filters" />
              <Tab label="Fundamental" aria-label="Fundamentals Filters" />
              <Tab label="Technical" aria-label="Technical Filters" />
            </Tabs>

            <Box sx={{ marginTop: 4 }}>
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
        <InvestScreenerAPI appliedValues={appliedValues} />
      </Box>
    </Container>
  );
};

export default TabsMain;