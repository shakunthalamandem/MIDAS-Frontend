import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Box,
  Divider,
  LinearProgress,
  Container,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface PredictionModel {
  prediction: string | null;
  Accuracy: number;
}

interface WeeklyMonthlyPredictionResultsProps {
  result: Record<string, PredictionModel> | null;
  onWeeklyMonthlyRepredict: (t1dCloseReturn: number) => Promise<Record<string, PredictionModel>>;
}

const WeeklyMonthlyPredictionResults: React.FC<WeeklyMonthlyPredictionResultsProps> = ({ result, onWeeklyMonthlyRepredict }) => {

  const [t1dCloseReturn, setT1dCloseReturn] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState(result);

  useEffect(() => {
    setPredictionResult(result);
  }, [result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setT1dCloseReturn(value === "" ? "" : parseFloat(value));
  };

  const handleRepredict = async () => {
    if (typeof t1dCloseReturn === "number" && onWeeklyMonthlyRepredict) {
      setIsLoading(true);
      try {
        // Call the passed-in repredict function and update the state with new results
        const newResult = await onWeeklyMonthlyRepredict(t1dCloseReturn);
        setPredictionResult(newResult);
      } catch (error) {
        console.error("Reprediction failed:", error);
        // Optionally, show a snackbar or error message to the user
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- Rendering Helpers ---

  const getOutcomeCategory = (prediction: string | null | undefined): "Negative" | "Neutral" | "Positive" => {
    if (!prediction || typeof prediction !== "string") return "Neutral";
    const lower = prediction.toLowerCase();
    if (lower.includes("negative")) return "Negative";
    if (lower.includes("neutral")) return "Neutral";
    if (lower.includes("positive")) return "Positive";
    return "Neutral";
  };

  const renderOutcome = (prediction: string | null | undefined) => {
    if (!prediction) {
      return <Box display="flex" alignItems="center" color="text.disabled">N/A</Box>;
    }
    const outcomeCategory = getOutcomeCategory(prediction);
    switch (outcomeCategory) {
      case "Negative":
        return <Box display="flex" alignItems="center" color="error.main"><TrendingDownIcon sx={{ mr: 1 }} /> Negative Deal</Box>;
      case "Neutral":
        return <Box display="flex" alignItems="center" color="text.secondary"><TrendingFlatIcon sx={{ mr: 1 }} /> Neutral Deal</Box>;
      case "Positive":
        return <Box display="flex" alignItems="center" color="success.main"><TrendingUpIcon sx={{ mr: 1 }} /> Positive Deal</Box>;
      default:
        return <Box display="flex" alignItems="center" color="text.disabled">N/A</Box>;
    }
  };

  const renderBinaryResult = (value: string | null | undefined) => {
    if (!value) {
      return <Box display="flex" alignItems="center" color="text.disabled">N/A</Box>;
    }
    const isTrue = value.toLowerCase() === "true";
    return (
      <Box display="flex" alignItems="center" color={isTrue ? "success.main" : "error.main"}>
        {isTrue ? <><CheckCircleIcon sx={{ mr: 1 }} /> Yes</> : <><CancelIcon sx={{ mr: 1 }} /> No</>}
      </Box>
    );
  };

  const renderConfidenceLevel = (confidence: number | null | undefined) => {
    if (confidence == null || isNaN(confidence)) {
      return <Box display="flex" alignItems="center" color="text.disabled">N/A</Box>;
    }

    let color: "success" | "warning" | "error" = "error";
    if (confidence >= 70) color = "success";
    else if (confidence >= 50) color = "warning";

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" value={confidence} color={color} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${confidence.toFixed(1)}%`}</Typography>
        </Box>
      </Box>
    );
  };

  // --- Data for Table Rows ---
  const rowConfig = [
    { key: 'main', label: 'General Deal Outcome Classification', explanation: 'Categorizes the deal into: Negative, Neutral, or Positive return ranges.' },
    { key: 'positive', label: 'High Positive Return Likelihood', explanation: 'Binary classifier predicting a strong gain (e.g., Return > 5%).' },
    { key: 'negative', label: 'High Negative Return Risk', explanation: 'Binary classifier estimating significant loss risk (e.g., Return < -3%).' },
  ];

  const timeFrames = ['Weekly', 'Monthly'];

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3, bgcolor: 'background.default' }}>
        {/* Header and Repredict Section */}
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={2} mb={2}>
          <Box display="flex" alignItems="center">
            <BarChartIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography variant="h6" component="h2" color="primary.main" fontWeight="bold">
              Weekly & Monthly Prediction Results
            </Typography>
          </Box>
          <Box display="flex" alignItems="flex-end" gap={2}>
            <TextField
              label="T + 1 Day Close Return (%)"
              variant="outlined"
              size="small"
              type="number"
              value={t1dCloseReturn}
              onChange={handleInputChange}
              sx={{ minWidth: '220px' }}
            />
            <Button
              variant="contained"
              onClick={handleRepredict}
              disabled={isLoading || t1dCloseReturn === ""}
              sx={{ height: '40px' }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Repredict"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 'bold', bgcolor: 'grey.100' } }}>
                <TableCell>Model</TableCell>
                <TableCell sx={{ minWidth: 250 }}>Explanation</TableCell>
                {timeFrames.map((frame, index) => (
                  <React.Fragment key={frame}>
                    {/* FIX: Replaced non-standard theme colors with safe RGBA values */}
                    <TableCell sx={{ bgcolor: index === 0 ? 'rgba(227, 242, 253, 0.7)' : 'rgba(237, 231, 246, 0.7)' }}>AM {frame} Result</TableCell>
                    <TableCell sx={{ bgcolor: index === 0 ? 'rgba(227, 242, 253, 0.7)' : 'rgba(237, 231, 246, 0.7)', minWidth: 180 }}>{frame} Accuracy</TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
  {rowConfig.map((row) => {
    // Create mapped keys from API
    const modelKeys = {
      weekly: `t1w_${row.key}`,
      monthly: `t1m_${row.key}`,
    };

    // Determine if both values are null (skip rendering this row)
    const isWeeklyNull =
      !predictionResult?.[modelKeys.weekly]?.prediction &&
      predictionResult?.[modelKeys.weekly]?.Accuracy == null;

    const isMonthlyNull =
      !predictionResult?.[modelKeys.monthly]?.prediction &&
      predictionResult?.[modelKeys.monthly]?.Accuracy == null;

    if (isWeeklyNull && isMonthlyNull) return null; // ❌ Skip row

    return (
      <TableRow key={row.key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>{row.label}</TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">{row.explanation}</Typography>
        </TableCell>
        {timeFrames.map((frame, index) => {
          const apiKey = frame === 'weekly' ? modelKeys.weekly : modelKeys.monthly;
          const modelData = predictionResult?.[apiKey];
          const cellBgColor = index === 0 ? 'rgba(227, 242, 253, 0.4)' : 'rgba(237, 231, 246, 0.4)';

          if (!modelData) {
            return (
              <React.Fragment key={apiKey}>
                <TableCell sx={{ bgcolor: cellBgColor }}><Box color="text.disabled">N/A</Box></TableCell>
                <TableCell sx={{ bgcolor: cellBgColor }}><Box color="text.disabled">N/A</Box></TableCell>
              </React.Fragment>
            );
          }

          const renderResult = row.key === 'main'
            ? renderOutcome(modelData.prediction)
            : renderBinaryResult(modelData.prediction);

          return (
            <React.Fragment key={apiKey}>
              <TableCell sx={{ bgcolor: cellBgColor, fontWeight: 'medium' }}>{renderResult}</TableCell>
              <TableCell sx={{ bgcolor: cellBgColor }}>{renderConfidenceLevel(modelData.Accuracy)}</TableCell>
            </React.Fragment>
          );
        })}
      </TableRow>
    );
  })}
</TableBody>

          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default WeeklyMonthlyPredictionResults;
