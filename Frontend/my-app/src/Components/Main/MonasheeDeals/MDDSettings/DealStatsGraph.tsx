import React, { useState, useEffect } from "react";
import "./DealStats.css";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  RadioGroup,
  FormControlLabel,
  Radio,
  ToggleButtonGroup,
  ToggleButton,
  CardContent,
  Card,
  Container,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DealAllocationGraphProps {
  responseData: any; // The response data from the API
}

const formatValue = (value: number, selectedOption: string): string => {
  if (selectedOption === "deal_size" || selectedOption === "avg_deal_size") {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed()}B`;
    } else if (absValue >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed()}M`;
    } else if (absValue >= 1_000) {
      return `$${(value / 1_000).toFixed()}K`;
    }
    return `$${value.toFixed()}`;
  } else if (
    selectedOption === "mdd_allocation_percentage" ||
    selectedOption === "mdd_allocation_ioi"
  ) {
    return `${value.toFixed(2)}%`;
  }
  return value.toFixed(0);
};

const DealStatsGraph: React.FC<DealAllocationGraphProps> = ({
  responseData,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("count");
  const [selectedValue, setSelectedValue] = useState("weighted");

  const dealStatsOptions = [
    { label: "Deals Count", key: "count" },
    { label: "Deal Volume", key: "deal_size" },
    { label: "Average Deal Size", key: "avg_deal_size" },
    { label: "Allocation as % of Deal Size", key: "mdd_allocation_percentage" },
    { label: "Allocation as % of IOI", key: "mdd_allocation_ioi" },
  ];

  const handleDialogClose = () => {
    setDialogOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    if (responseData?.message) {
      setDialogOpen(true);
    }
  }, [responseData]);

  const formatChartData = (data: any) => {
    if (!data || typeof data !== "object") return [];

    const allowedDealTypes = new Set(["FO", "IPO"]);

    return Object.keys(data).map((quarter) => {
      const sectors = data[quarter];
      const chartRow: any = { quarter };

      allowedDealTypes.forEach((dealType) => {
        let allocationKeyForDealType: string;

        if (selectedOption === "mdd_allocation_ioi") {
          allocationKeyForDealType =
            selectedValue === "normal"
              ? "allocation_percentage"
              : "weighted_allocation_percentage";
        } else if (selectedOption === "mdd_allocation_percentage") {
          allocationKeyForDealType =
            selectedValue === "normal"
              ? "allocation_deal_size_percentage"
              : "weighted_allocation_deal_size_percentage";
        } else {
          allocationKeyForDealType = selectedOption;
        }

        chartRow[`${dealType}_${selectedOption}`] = sectors[dealType]?.[
          allocationKeyForDealType
        ]
          ? parseFloat(sectors[dealType][allocationKeyForDealType])
          : 0;
      });

      return chartRow;
    });
  };

  const chartData =
    responseData && !responseData.message ? formatChartData(responseData) : [];

  return (
    <div>
      <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box className="deal-stats-container">
        <RadioGroup
          row
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="radio-group"
        >
          {dealStatsOptions.map((option) => (
            <FormControlLabel
              key={option.key}
              value={option.key}
              control={<Radio className="custom-radio" />}
              label={option.label}
              className={`radio-option ${selectedOption === option.key ? "selected" : ""}`}
            />
          ))}
        </RadioGroup>
      </Box>

      {chartData.length === 0 && !responseData?.message ? (
        <Box sx={{ textAlign: "center", padding: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No Data Available for the selected filters.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please change the selected filters to show the Plot.
          </Typography>
        </Box>
      ) : (
        <Box mt={5}>
          <Card
            sx={{ borderRadius: 2, boxShadow: 3, backgroundColor: "#e6ebf5" }}
          >
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <XAxis dataKey="quarter" />
                  <YAxis
                    tickFormatter={(value) =>
                      formatValue(value, selectedOption)
                    }
                  />
               <Tooltip
  formatter={(value: number, name: string, props: any) => {
    const tooltipMapping: { [key: string]: string } = {
      FO_count: "FO",
      IPO_count: "IPO",
      FO_deal_size: "FO",
      IPO_deal_size: "IPO",
      FO_avg_deal_size: "FO",
      IPO_avg_deal_size: "IPO",
      FO_mdd_allocation_ioi: "FO",
      IPO_mdd_allocation_ioi: "IPO",
      FO_mdd_allocation_percentage: "FO",
      IPO_mdd_allocation_percentage: "IPO",
    };

    const formattedName = tooltipMapping[name] || name;
    return [`${formatValue(value, selectedOption)}`, formattedName];
  }}
  labelFormatter={(label) => <span style={{ fontWeight: 'bold', color: '#002060' }}>Year: {label}</span>}
/>

                  <Legend
                    formatter={(value) => {
                      const legendMapping: { [key: string]: string } = {
                        FO_count: "FO",
                        IPO_count: "IPO",
                        FO_deal_size: "FO",
                        IPO_deal_size: "IPO",
                        FO_avg_deal_size: "FO",
                        IPO_avg_deal_size: "IPO",
                        FO_mdd_allocation_ioi: "FO",
                        IPO_mdd_allocation_ioi: "IPO",
                        FO_mdd_allocation_percentage: "FO",
                        IPO_mdd_allocation_percentage: "IPO",
                      };
                      return legendMapping[value] || value;
                    }}
                  />
                  {/* Render Bars based on selectedOption */}
                  {selectedOption === "count" && (
                    <>
                      <Bar dataKey="FO_count" fill="#8884d8" stackId="a" />
                      <Bar dataKey="IPO_count" fill="#82ca9d" stackId="a" />
                    </>
                  )}
                  {selectedOption === "deal_size" && (
                    <>
                      <Bar dataKey="FO_deal_size" fill="#8884d8" stackId="a" />
                      <Bar dataKey="IPO_deal_size" fill="#82ca9d" stackId="a" />
                    </>
                  )}
                  {selectedOption === "avg_deal_size" && (
                    <>
                      <Bar
                        dataKey="FO_avg_deal_size"
                        fill="#8884d8"
                        stackId="a"
                      />
                      <Bar
                        dataKey="IPO_avg_deal_size"
                        fill="#82ca9d"
                        stackId="a"
                      />
                    </>
                  )}
                  {selectedOption === "mdd_allocation_ioi" && (
                    <>
                      <Bar
                        dataKey={`FO_mdd_allocation_ioi`}
                        fill="#8884d8"
                        stackId="a"
                      />
                      <Bar
                        dataKey={`IPO_mdd_allocation_ioi`}
                        fill="#82ca9d"
                        stackId="a"
                      />
                    </>
                  )}
                  {selectedOption === "mdd_allocation_percentage" && (
                    <>
                      <Bar
                        dataKey={`FO_mdd_allocation_percentage`}
                        fill="#8884d8"
                        stackId="a"
                      />
                      <Bar
                        dataKey={`IPO_mdd_allocation_percentage`}
                        fill="#82ca9d"
                        stackId="a"
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>


          <Box
  sx={{
    display: "flex",
    justifyContent: "center", // Centers items horizontally
    alignItems: "center", // Centers items vertically
    gap: "40px",
    padding: "15px",
    borderRadius: "8px",
    background: "linear-gradient(to right, rgba(255, 0, 150, 0.2), rgba(0, 204, 255, 0.2))",
    mt: "5px", // Margin top of 5px
  }}
>
  {/* Radio Group to ensure only one can be selected, with "Deal Type" as default */}
  <RadioGroup row name="dealOptions" defaultValue="dealType">
    <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <FormLabel sx={{ fontWeight: "bold", marginRight: "10px" }}>Deal Type</FormLabel>
      <FormControlLabel
        control={<Radio sx={{ color: "green", "&.Mui-checked": { color: "red" } }} />}
        value="dealType"
        label=""
      />
    </FormControl>

    <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <FormLabel sx={{ fontWeight: "bold", marginRight: "10px" }}>Sector</FormLabel>
      <FormControlLabel
        control={<Radio sx={{ color: "green", "&.Mui-checked": { color: "red" } }} />}
        value="sector"
        label=""
      />
    </FormControl>

    <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <FormLabel sx={{ fontWeight: "bold", marginRight: "10px" }}>Region</FormLabel>
      <FormControlLabel
        control={<Radio sx={{ color: "green", "&.Mui-checked": { color: "red" } }} />}
        value="region"
        label=""
      />
    </FormControl>

    <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <FormLabel sx={{ fontWeight: "bold", marginRight: "10px" }}>Deal Caption</FormLabel>
      <FormControlLabel
        control={<Radio sx={{ color: "green", "&.Mui-checked": { color: "red" } }} />}
        value="dealCaption"
        label=""
      />
    </FormControl>
  </RadioGroup>
</Box>


     </Box>
      )}
      {/* Show Normal/Weighted options if selectedOption is for allocation */}
      {(selectedOption === "mdd_allocation_ioi" ||
        selectedOption === "mdd_allocation_percentage") && (
        <div className="toggle-container">
          <ToggleButtonGroup
            value={selectedValue}
            exclusive
            onChange={(_, value) => value && setSelectedValue(value)}
            aria-label="allocation toggle"
            className="toggle-group"
          >
            <ToggleButton
              value="normal"
              aria-label="normal"
              className="toggle-button"
              style={{
                fontSize: "14px",
                padding: "5px 10px",
                color: "#444444",
                background: "transparent",
                border: "2px solid #444444",
                transition: "all 0.3s ease",
                borderRadius: "5px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#b90066";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.border = "2px solid #b90066";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#444444";
                e.currentTarget.style.border = "2px solid #444444";
              }}
            >
              Simple
            </ToggleButton>
            <ToggleButton
              value="weighted"
              aria-label="weighted"
              className="toggle-button"
              style={{
                fontSize: "14px",
                padding: "5px 10px",
                color: "#444444",
                background: "transparent",
                border: "2px solid #444444",
                transition: "all 0.3s ease",
                borderRadius: "5px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#b90066";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.border = "2px solid #b90066";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#444444";
                e.currentTarget.style.border = "2px solid #444444";
              }}
            >
              Weighted
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">No Data Available</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Please change the filters. No data available for the given filters.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
      </Container>

    </div>
  );
};

export default DealStatsGraph;
