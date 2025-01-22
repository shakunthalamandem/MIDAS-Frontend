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
  apiName: string; // The API name that determines the key
}

const formatValue = (value: number, apiName: string): string => {
  if (apiName === "mdd_deals_volume" || apiName === "avg_deal_size") {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (absValue >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (absValue >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  } else if (apiName === "mdd_allocation_percentage" || apiName === "mdd_allocation_ioi") {
    return `${value.toFixed(2)}%`;
  }
  return value.toFixed(0); // Default to integer for other APIs
};

const DealStatsGraph: React.FC<DealAllocationGraphProps> = ({ responseData, apiName }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("count"); // Tracks the selected option

  const dealStatsOptions = [
    { label: "Deals Count", key: "count" },
    { label: "Deal Size", key: "deal_size" },
    { label: "Average Deal Size", key: "avg_deal_size" },
    { label: "MDD Allocation Percentage", key: "mdd_allocation_percentage" },
    { label: "Allocation Percentage", key: "allocation_percentage" },
  ];

  const handleDialogClose = () => {
    setDialogOpen(false);
    window.location.reload(); // Refresh the page
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
        const allocationKey =
          selectedOption === "avg_deal_size" ? "weighted_avg_deal_size" : selectedOption;

        chartRow[`${dealType}_${selectedOption}`] = sectors[dealType]?.[allocationKey]
          ? parseFloat(sectors[dealType][allocationKey])
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
            <XAxis dataKey="quarter" />
            <YAxis tickFormatter={(value) => formatValue(value, apiName)} />
            <Tooltip />
            <Legend />
            {["FO", "IPO"].map((dealType) => (
              <Bar
                key={dealType}
                dataKey={`${dealType}_${selectedOption}`}
                stackId="a"
                fill="#8884d8"
              />
            ))}
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
