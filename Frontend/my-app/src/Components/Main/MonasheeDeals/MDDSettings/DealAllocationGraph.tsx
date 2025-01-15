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
        let allocationKeyForDealType = "";
      
        // Check the API name and adjust the allocation key based on selectedValue
        if (apiName === "mdd_allocation_ioi") {
          // For "mdd_allocation_ioi", use either allocation_percentage or weighted_allocation_percentage
          allocationKeyForDealType =
            selectedValue === "normal" ? "allocation_percentage" : "weighted_allocation_percentage";
        } else if (apiName === "mdd_allocation_percentage") {
          // For "mdd_allocation_percentage", use either allocation_deal_size_percentage or weighted_allocation_deal_size_percentage
          allocationKeyForDealType =
            selectedValue === "normal" ? "allocation_deal_size_percentage" : "weighted_allocation_deal_size_percentage";
        } else {
          // For other APIs, use the allocationKey as defined earlier
          allocationKeyForDealType = allocationKey;
        }
      
        // Set the value for the deal type in the chartRow
        chartRow[dealType] = sectors[dealType]?.[allocationKeyForDealType]
          ? parseFloat(sectors[dealType][allocationKeyForDealType])
          : 0;
      });

      // Calculate total for each quarter (IPO + FO)
      chartRow["Total"] = chartRow["IPO"] + chartRow["FO"];
      return chartRow;
    });
  };

  const chartData = responseData && !responseData.message ? formatChartData(responseData) : [];

  return (
    <div>
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
            <YAxis tickFormatter={(value) => formatValue(value, apiName)} />{/* Format Y-axis ticks */}

            {/* Tooltip displaying IPO, FO, and Total */}
            <Tooltip
  formatter={(value: number, name: string, props: any) => {
    // Calculate the total for the current data point (IPO + FO)
    const totalValue = props.payload?.IPO + props.payload?.FO;
    return [
      `${formatValue(Number(value), apiName)}`, // Format individual value (either IPO or FO)
      name
    ];
  }}
  content={({ active, payload }) => {
    if (active && payload && payload.length) {
      const { IPO, FO, quarter } = payload[0].payload;
      const total = IPO + FO; // Calculate total here
      return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
          <h4>{quarter}</h4>
          <p style={{ margin: 0,color:'#8884d8'}}>IPO: {formatValue(IPO, apiName)}</p>
          <p style={{ margin: 0,color:'#82ca9d'}} >FO: {formatValue(FO, apiName)}</p>
          <p style={{ margin: 0,color:'#002060' }}>Total Deals: {formatValue(total, apiName)}</p>
        </div>
      );
    }
    return null;
  }}
/>


            <Legend />

            {/* Only include IPO and FO in the chart */}
            <Bar dataKey="IPO" stackId="a" fill="#8884d8" />
            <Bar dataKey="FO" stackId="a" fill="#82ca9d" />
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
                sx={{
                  color: "#002060", // Set the checkbox tick color
                  "&.Mui-checked": {
                    color: "#002060", // Set the color when checkbox is checked
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: "bold", color: "#002060" }}>
                Simple Average
              </Typography>
            }
            sx={{ marginRight: "10px" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedValue === "weighted"}
                onChange={() => setSelectedValue("weighted")}
                sx={{
                  color: "#002060", // Set the checkbox tick color
                  "&.Mui-checked": {
                    color: "#a20000", // Set the color when checkbox is checked
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: "bold", color: "#002060" }}>
                Deal Size Weighted Average
              </Typography>
            }
          />
        </div>
      )}

      {/* Popup Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
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
