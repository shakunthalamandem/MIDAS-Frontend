// PredictionResult.tsx
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface PredictionResultProps {
  result: {
    prediction: string;
    lower_bound: string;
    upper_bound: string;
  };
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  return (
    <Card variant="outlined" sx={{ width: "100%", textAlign: "center" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="#002060">
          Prediction Result
        </Typography>
        <Typography style={{ display: "inline", marginRight: "30px" }}>
          <strong>Prediction:</strong> {result.prediction}
        </Typography>
        <Typography style={{ display: "inline", marginRight: "30px" }}>
          <strong>Lower Bound:</strong> {result.lower_bound}
        </Typography>
        <Typography style={{ display: "inline" }}>
          <strong>Upper Bound:</strong> {result.upper_bound}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PredictionResult;
