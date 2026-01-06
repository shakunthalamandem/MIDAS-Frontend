import React, { useEffect, useState } from "react";
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

/* -------------------- Types -------------------- */

interface PredictionModel {
  prediction: string | null;
  accuracy?: number | null;
  confidence?: number | null;
  range?: string | null;
  model?: string | null;
  explanation?: string | null;
}

interface WeeklyMonthlyPredictionResultsProps {
  result: Record<string, PredictionModel> | null;
  onWeeklyMonthlyRepredict: (params: {
    t1dClosePrice: number;
    t1dCloseReturn: number;
    t1dLowPrice?: number;
    t1dHighPrice?: number;
    t1dVWAPPrice?: number;
  }) => Promise<Record<string, PredictionModel>>;
  initialT1dClosePrice?: number | null;
  issuePrice?: number | null;
}

/* -------------------- Component -------------------- */

const IPOWeeklyMonthlyPredictionResults: React.FC<
  WeeklyMonthlyPredictionResultsProps
> = ({
  result,
  onWeeklyMonthlyRepredict,
  initialT1dClosePrice,
  issuePrice,
}) => {
  const [prices, setPrices] = useState<{
    close: number | "";
    low: number | "";
    high: number | "";
    vwap: number | "";
  }>({
    close: "",
    low: "",
    high: "",
    vwap: "",
  });

  const [t1dCloseReturn, setT1dCloseReturn] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(result);

  /* -------------------- Prefill -------------------- */

  useEffect(() => {
    setPredictionResult(result);

    setPrices((prev) => ({
      close: prev.close !== "" ? prev.close : (initialT1dClosePrice ?? ""),
      low: prev.low,
      high: prev.high,
      vwap: prev.vwap,
    }));
  }, [result, initialT1dClosePrice]);

  /* -------------------- Return calc -------------------- */

  useEffect(() => {
    if (issuePrice && prices.close !== "") {
      const ret = ((Number(prices.close) - issuePrice) / issuePrice) * 100;
      setT1dCloseReturn(Number(ret.toFixed(2)));
    } else {
      setT1dCloseReturn(null);
    }
  }, [prices.close, issuePrice]);

  /* -------------------- Predict -------------------- */

  const handleRepredict = async () => {
    if (prices.close === "" || t1dCloseReturn == null) return;

    setIsLoading(true);
    try {
      const newResult = await onWeeklyMonthlyRepredict({
        t1dClosePrice: Number(prices.close),
        t1dCloseReturn,
        t1dLowPrice: prices.low !== "" ? Number(prices.low) : undefined,
        t1dHighPrice: prices.high !== "" ? Number(prices.high) : undefined,
        t1dVWAPPrice: prices.vwap !== "" ? Number(prices.vwap) : undefined,
      });

      setPredictionResult(newResult);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- Helpers -------------------- */

  const getOutcomeCategory = (
    prediction?: string | null
  ): "Negative" | "Neutral" | "Positive" => {
    if (!prediction) return "Neutral";
    const p = prediction.toLowerCase();
    if (p.includes("negative")) return "Negative";
    if (p.includes("positive")) return "Positive";
    return "Neutral";
  };

  const renderOutcome = (prediction?: string | null) => {
    const type = getOutcomeCategory(prediction);
    if (type === "Negative")
      return (
        <Box display="flex" alignItems="center" color="error.main">
          <TrendingDownIcon sx={{ mr: 1 }} /> Negative
        </Box>
      );
    if (type === "Positive")
      return (
        <Box display="flex" alignItems="center" color="success.main">
          <TrendingUpIcon sx={{ mr: 1 }} /> Positive
        </Box>
      );
    return (
      <Box display="flex" alignItems="center" color="text.secondary">
        <TrendingFlatIcon sx={{ mr: 1 }} /> Neutral
      </Box>
    );
  };

  const renderBinary = (value?: string | null) => {
    if (!value) return <Box color="text.disabled">N/A</Box>;
    const yes = value.toLowerCase() === "true";
    return (
      <Box
        display="flex"
        alignItems="center"
        color={yes ? "success.main" : "error.main"}
      >
        {yes ? (
          <CheckCircleIcon sx={{ mr: 1 }} />
        ) : (
          <CancelIcon sx={{ mr: 1 }} />
        )}
        {yes ? "Yes" : "No"}
      </Box>
    );
  };

  const renderConfidence = (confidence?: number | null) => {
    if (confidence == null) return <Box color="text.disabled">N/A</Box>;
    return (
      <LinearProgress
        variant="determinate"
        value={confidence}
        sx={{ height: 8, borderRadius: 4 }}
      />
    );
  };

  const showTable =
    predictionResult && Object.keys(predictionResult).length > 0;

  /* -------------------- UI -------------------- */

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              bgcolor: "#002060",
              color: "#fff",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
            }}
          >
            3
          </Box>
          <BarChartIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6" fontWeight={700} color="primary">
            1 Week & 1 Month from 1st Day Close – Model Predictions
          </Typography>
        </Box>

        {/* Inputs + CTA */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr) auto",
            },
            gap: 2,
            alignItems: "end",
          }}
        >
          <TextField
            label="1st Day Low"
            size="small"
            type="number"
            value={prices.low}
            onChange={(e) =>
              setPrices((p) => ({
                ...p,
                low: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          />

          <TextField
            label="1st Day High"
            size="small"
            type="number"
            value={prices.high}
            onChange={(e) =>
              setPrices((p) => ({
                ...p,
                high: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          />

          <TextField
            label="1st Day VWAP"
            size="small"
            type="number"
            value={prices.vwap}
            onChange={(e) =>
              setPrices((p) => ({
                ...p,
                vwap: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          />

          <Box>
            <TextField
              label="1st Day Close"
              size="small"
              type="number"
              value={prices.close}
              onChange={(e) =>
                setPrices((p) => ({
                  ...p,
                  close: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Close Return:{" "}
              {t1dCloseReturn != null ? `${t1dCloseReturn}%` : "—"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleRepredict}
              disabled={isLoading || t1dCloseReturn == null}
              sx={{ minWidth: 140, height: 40 }}
            >
              {isLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Predict"
              )}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Results Table */}
        {showTable ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>Explanation</TableCell>
                  <TableCell>Week</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell>Confidence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["main_model", "Outcome"],
                  ["positive_model", "High Positive"],
                  ["negative_model", "High Negative"],
                ].map(([key, label]) => (
                  <TableRow key={key}>
                    <TableCell>{label}</TableCell>
                    <TableCell>
                      {predictionResult?.[`t1w_${key}`]?.explanation ?? "—"}
                    </TableCell>
                    <TableCell>
                      {key === "main_model"
                        ? renderOutcome(
                            predictionResult?.[`t1w_${key}`]?.prediction
                          )
                        : renderBinary(
                            predictionResult?.[`t1w_${key}`]?.prediction
                          )}
                    </TableCell>
                    <TableCell>
                      {renderConfidence(
                        predictionResult?.[`t1w_${key}`]?.confidence
                      )}
                    </TableCell>
                    <TableCell>
                      {key === "main_model"
                        ? renderOutcome(
                            predictionResult?.[`t1m_${key}`]?.prediction
                          )
                        : renderBinary(
                            predictionResult?.[`t1m_${key}`]?.prediction
                          )}
                    </TableCell>
                    <TableCell>
                      {renderConfidence(
                        predictionResult?.[`t1m_${key}`]?.confidence
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography align="center" color="text.secondary">
            Enter prices to generate Weekly & Monthly predictions.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default IPOWeeklyMonthlyPredictionResults;
