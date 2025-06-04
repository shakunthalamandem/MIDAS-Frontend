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
  LinearProgress,
} from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BarChartIcon from "@mui/icons-material/BarChart";

interface PredictionResultsProps {
  result: {
    main_model: {
      prediction: string;
      accuracy: number;
    };
    positive_model: {
      prediction: string;
      accuracy: number;
    };
    negative_model: {
      prediction: string;
      accuracy: number;
    };
  };
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ result }) => {
  // Determine outcome category based on main model result
  const getOutcomeCategory = (): "Negative" | "Neutral" | "Positive" => {
    const resultText = result.main_model.prediction.toLowerCase();
    if (resultText.includes("negative")) return "Negative";
    if (resultText.includes("neutral")) return "Neutral";
    if (resultText.includes("positive")) return "Positive";
    return "Neutral"; // Default case
  };

  const outcomeCategory = getOutcomeCategory();
  
  // Convert string prediction to boolean
  const isPositive = result.positive_model.prediction.toLowerCase() === "true";
  const isNegative = result.negative_model.prediction.toLowerCase() === "true";

  const renderOutcome = () => {
    switch (outcomeCategory) {
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

  const renderConfidenceLevel = (confidence: number) => {
    // Determine color based on confidence level
    let color = "#f44336"; // red - low confidence
    if (confidence >= 70) color = "#4caf50"; // green - high confidence
    else if (confidence >= 50) color = "#ff9800"; // orange - moderate confidence

    return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {confidence.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={confidence}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(0,0,0,0.05)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        />
      </Box>
    );
  };

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
        We present predictions from <strong>Three specialized models</strong>. These are designed to provide insight into the potential
        return profile of an upcoming equity deal under current market conditions.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <TableContainer>
        <Table>
          <TableBody>
            <TableRow sx={{ bgcolor: "#f0f4f8" }}>
              <TableCell sx={{ fontWeight: 600, width: "20%" }}>Model</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Explanation</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "20%" }}>Result</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "20%" }}>Accuracy</TableCell>
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
              <TableCell>
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  {renderConfidenceLevel(result.main_model.accuracy)}
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>High Positive Return Likelihood</TableCell>
              <TableCell>
                Binary classifier predicting the likelihood of a strong gain.
                <br />
                <strong>Threshold:</strong> Return &gt; 3%
              </TableCell>
              <TableCell>{renderBinaryResult(isPositive)}</TableCell>
              <TableCell>{renderConfidenceLevel(result.positive_model.accuracy)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>High Negative Return Risk</TableCell>
              <TableCell>
                Binary classifier estimating risk of significant loss.
                <br />
                <strong>Threshold:</strong> Return &lt; -2%
              </TableCell>
              <TableCell>{renderBinaryResult(isNegative)}</TableCell>
              <TableCell>{renderConfidenceLevel(result.negative_model.accuracy)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PredictionResults;