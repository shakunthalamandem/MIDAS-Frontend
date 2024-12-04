import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Checkbox,
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

// Function to format numbers into human-readable formats like "M" for millions and "B" for billions
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

const DealAllocationGraph: React.FC<DealAllocationGraphProps> = ({ responseData, apiName }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("normal"); // Tracks if normal or weighted is selected

  // Handle closing the dialog
  const handleDialogClose = () => {
    setDialogOpen(false);
    window.location.reload(); // Refresh the page
  };

  // Automatically open the dialog if responseData contains a message
  useEffect(() => {
    if (responseData?.message) {
      setDialogOpen(true);
    }
  }, [responseData]);

  // Dynamic key mapping based on the API name
  const allocationKeyMap: { [key: string]: string } = {
    mdd_deals_graph: "count",
    mdd_deals_volume: "deal_size",
    avg_deal_size: "deal_size",
    mdd_allocation_percentage: "allocation_deal_size_percentage",
    mdd_allocation_ioi: "allocation_percentage",
  };

  const allocationKey = allocationKeyMap[apiName] || "deal_size"; // Default to "deal_size"

  // Format the chart data, considering allocation data or other data based on the API
  const formatChartData = (data: any) => {
    if (!data || typeof data !== "object") return [];

    // Collect only "FO" and "IPO" deal types
    const allowedDealTypes = new Set(["FO", "IPO"]);

    return Object.keys(data).map((quarter) => {
      const sectors = data[quarter];
      const chartRow: any = { quarter };

      // If the selected API is related to allocation, apply the checkbox logic
      allowedDealTypes.forEach((dealType) => {
        // For allocation-related APIs, apply checkbox selection logic
        if (apiName === "mdd_allocation_percentage" || apiName === "mdd_allocation_ioi") {
          const allocationKeyForDealType =
            selectedValue === "normal" ? "allocation_percentage" : "weighted_allocation_percentage";
          chartRow[dealType] = sectors[dealType]?.[allocationKeyForDealType]
            ? parseFloat(sectors[dealType][allocationKeyForDealType])
            : 0;
        } else {
          // For non-allocation APIs, use the appropriate key without checkbox filtering
          chartRow[dealType] = sectors[dealType]?.[allocationKey]
            ? parseFloat(sectors[dealType][allocationKey])
            : 0;
        }
      });

      return chartRow;
    });
  };

  const chartData = responseData && !responseData.message ? formatChartData(responseData) : [];

  return (
    <div>
      {chartData.length === 0 && !responseData?.message ? (
        <Typography
          variant="body1"
          align="center"
          sx={{ mt: 5, color: "#002060", fontWeight: "bold" }}
        >
          No Data Available for the above filters. Please change the selected filters to show the
          plots.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
            <XAxis dataKey="quarter" />
            <YAxis tickFormatter={(value) => formatValue(value, apiName)} />
            <Tooltip formatter={(value) => formatValue(Number(value), apiName)} />
            <Legend />
            {Object.keys(chartData[0] || {})
              .filter((key) => key !== "quarter")
              .map((dealType) => (
                <Bar
                  key={dealType}
                  dataKey={dealType}
                  stackId="a"
                  fill={{
                    FO: "#8884d8",
                    IPO: "#82ca9d",
                  }[dealType] || "#ccc"}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Checkboxes for selecting normal or weighted values */}
      {(apiName === "mdd_allocation_percentage" || apiName === "mdd_allocation_ioi") && (
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedValue === "normal"}
                onChange={() => setSelectedValue("normal")}
              />
            }
            label="Normal"
            sx={{ marginRight: "10px" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedValue === "weighted"}
                onChange={() => setSelectedValue("weighted")}
              />
            }
            label="Weighted"
          />
        </div>
      )}

      {/* Popup Dialog */}
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

export default DealAllocationGraph;
