import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Box,
  Divider,
} from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BarChartIcon from "@mui/icons-material/BarChart";

interface PredictionResultsProps {
  result: {
    outcomeCategory: "Negative" | "Neutral" | "Positive";
    highPositiveLikelihood: boolean;
    highNegativeRisk: boolean;
  };
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ result }) => {
  const renderOutcome = () => {
    switch (result.outcomeCategory) {
      case "Negative":
        return (
          <Box display="flex" alignItems="center" color="error.main">
            <TrendingDownIcon sx={{ mr: 1 }} />
            Negative Deal (&lt; -1%)
          </Box>
        );
      case "Neutral":
        return (
          <Box display="flex" alignItems="center" color="text.secondary">
            <TrendingFlatIcon sx={{ mr: 1 }} />
            Neutral Deal (-1% to 1%)
          </Box>
        );
      case "Positive":
        return (
          <Box display="flex" alignItems="center" color="success.main">
            <TrendingUpIcon sx={{ mr: 1 }} />
            Positive Deal (&gt; 1%)
          </Box>
        );
      default:
        return "N/A";
    }
  };

  const renderBinaryResult = (value: boolean) => (
    <Box display="flex" alignItems="center" color={value ? "success.main" : "error.main"}>
      {value ? (
        <>
          <CheckCircleIcon sx={{ mr: 1 }} /> Yes
        </>
      ) : (
        <>
          <CancelIcon sx={{ mr: 1 }} /> No
        </>
      )}
    </Box>
  );

  return (
    <Paper
      sx={{
        p: 3,
        mt: 4,
        bgcolor: "#f9fafb", // light gray background
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <BarChartIcon sx={{ color: "primary.main", mr: 1 }} />
        <Typography variant="h6" color="primary">
          📊 Model Prediction Results
        </Typography>
      </Box>

      <Typography variant="body1" gutterBottom>
        Using a <strong>Random Forest algorithm</strong> trained on approximately <strong>4,000 historical equity deals</strong>,
        we present predictions from three specialized models. These are designed to provide insight into the potential
        return profile of an upcoming equity deal under current market conditions.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <TableContainer>
        <Table>
          <TableBody>
            <TableRow sx={{ bgcolor: "#f0f4f8" }}>
              <TableCell sx={{ fontWeight: 600, width: "25%" }}>Model</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Explanation</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "25%" }}>Result</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>General Deal Outcome Classification</TableCell>
              <TableCell>
                Categorizes the deal into:
                <br />📉 <strong>Negative:</strong> Return &lt; -1%
                <br />⚖️ <strong>Neutral:</strong> -1% ≤ Return ≤ 1%
                <br />📈 <strong>Positive:</strong> Return &gt; 1%
              </TableCell>
              <TableCell>{renderOutcome()}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>High Positive Return Likelihood</TableCell>
              <TableCell>
                Binary classifier predicting the likelihood of a strong gain.
                <br />
                <strong>Threshold:</strong> Return &gt; 5%
              </TableCell>
              <TableCell>{renderBinaryResult(result.highPositiveLikelihood)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>High Negative Return Risk</TableCell>
              <TableCell>
                Binary classifier estimating risk of significant loss.
                <br />
                <strong>Threshold:</strong> Return &lt; -5%
              </TableCell>
              <TableCell>{renderBinaryResult(result.highNegativeRisk)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PredictionResults;
