import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DealAllocationGraphProps {
  responseData: any; // The response data from the API
}

const formatValue = (value: number, selectedOption: string): string => {
  if (selectedOption === "mdd_deals_volume" || selectedOption === "avg_deal_size") {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (absValue >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (absValue >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  } else if (selectedOption === "mdd_allocation_percentage" || selectedOption === "mdd_allocation_ioi") {
    return `${value.toFixed(2)}%`;
  }
  return value.toFixed(0);
};

const DealStatsGraph: React.FC<DealAllocationGraphProps> = ({ responseData }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("count");
  const [selectedValue, setSelectedValue] = useState("normal");

  const dealStatsOptions = [
    { label: "Deals Count", key: "count" },
    { label: "Deal Size", key: "deal_size" },
    { label: "Average Deal Size", key: "avg_deal_size" },
    { label: "MDD Allocation Percentage", key: "mdd_allocation_percentage" },
    { label: "Allocation Percentage", key: "allocation_percentage" },
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
            selectedValue === "normal" ? "allocation_percentage" : "weighted_allocation_percentage";
        } else if (selectedOption === "mdd_allocation_percentage") {
          allocationKeyForDealType =
            selectedValue === "normal"
              ? "allocation_deal_size_percentage"
              : "weighted_allocation_deal_size_percentage";
        } else {
          allocationKeyForDealType = selectedOption;
        }

        chartRow[`${dealType}_${selectedOption}`] = sectors[dealType]?.[allocationKeyForDealType]
          ? parseFloat(sectors[dealType][allocationKeyForDealType])
          : 0;
      });

      return chartRow;
    });
  };

  const chartData = responseData && !responseData.message ? formatChartData(responseData) : [];

  return (
    <div>
      <div>
        <Typography variant="h6">Select a Deal Stats Option</Typography>
        <RadioGroup
          row
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          {dealStatsOptions.map((option) => (
            <FormControlLabel
              key={option.key}
              value={option.key}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </div>

      {/* Show Normal/Weighted options if selectedOption is for allocation */}
      {(selectedOption === "mdd_allocation_ioi" || selectedOption === "mdd_allocation_percentage") && (
        <Box sx={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
          <ToggleButtonGroup
            value={selectedValue}
            exclusive
            onChange={(e, value) => value && setSelectedValue(value)}
            aria-label="allocation toggle"
          >
            <ToggleButton value="normal" aria-label="normal">
              Normal
            </ToggleButton>
            <ToggleButton value="weighted" aria-label="weighted">
              Weighted
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis tickFormatter={(value) => formatValue(value, selectedOption)} />
            <Tooltip
              formatter={(value: number, name: string, props: any) =>
                formatValue(value, selectedOption)
              }
              labelFormatter={(label) => `Quarter: ${label}`}
            />
            <Legend />
            <Bar dataKey="FO_count" fill="#8884d8" stackId="a" />
            <Bar dataKey="IPO_count" fill="#82ca9d" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
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
    </div>
  );
};

export default DealStatsGraph;
