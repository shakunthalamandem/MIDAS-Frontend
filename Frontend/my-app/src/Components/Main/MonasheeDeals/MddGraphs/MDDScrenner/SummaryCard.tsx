import React from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";

interface SummaryCardProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const SummaryCard: React.FC<SummaryCardProps> = ({ sectorwiseData }) => {
  // Example summary calculation based on the provided data
  const calculateSummary = () => {
    const summary = {
      deal_size: 0,
      fo_discount: 0,
      t1m_excess_returns: 0,
      t1d_return_from_bloomberg: 0,
      allocation_deal_size_percentage: 0,
      allocation_ioi: 0,
      average_hold_period: 0,
      t1d_issueprice: 0,
    };

    // Add calculation logic based on sectorwiseData
    if (sectorwiseData) {
      summary.deal_size = Object.values(sectorwiseData).length; // Example: Count of data
      summary.fo_discount = 5.0; // Replace with actual logic
      summary.t1m_excess_returns = 10.5; // Replace with actual logic
      summary.t1d_return_from_bloomberg = 2.3; // Replace with actual logic
      summary.allocation_deal_size_percentage = 50.0; // Replace with actual logic
      summary.allocation_ioi = 75.0; // Replace with actual logic
      summary.average_hold_period = 365; // Replace with actual logic
      summary.t1d_issueprice = 150.0; // Replace with actual logic
    }

    return summary;
  };

  const summary = calculateSummary();

  return (
    <Card style={{ marginTop: "20px", padding: "15px" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom style={{ fontWeight: "bold" }}>
          Summary
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(summary).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Typography variant="body2">
                <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong>{" "}
                {typeof value === "number" ? value.toFixed(2) : value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
