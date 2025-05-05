import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";

type PredictionResultProps = {
  result: {
    prediction: string;
    lower_bound: string;
    upper_bound: string;
  };
};

const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  const getLabel = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case "positive deal":
        return "Slightly Positive";
      case "negative deal":
        return "Slightly Negative";
      case "neutral deal":
        return "Neutral";
      default:
        return prediction;
    }
  };

  const getColor = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case "positive deal":
        return "#2e7d32"; // Green
      case "negative deal":
        return "#c62828"; // Red
      case "neutral deal":
        return "#ef6c00"; // Orange
      default:
        return "#333";
    }
  };

  const color = getColor(result.prediction);

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 320,
        height: "100%",
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color }}>
          Prediction Summary
        </Typography>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#e3f2fd" }}>
                  Expected to Provide
                </TableCell>
                <TableCell sx={{ color }}>{getLabel(result.prediction)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#e3f2fd" }}>
                  High Confidence Return Range
                </TableCell>
                <TableCell sx={{ color }}>
                  {result.lower_bound}% to {result.upper_bound}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default PredictionResult;
