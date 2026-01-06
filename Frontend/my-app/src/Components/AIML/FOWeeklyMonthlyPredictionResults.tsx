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

const FOWeeklyMonthlyPredictionResults: React.FC<
  WeeklyMonthlyPredictionResultsProps
> = ({
  result,
  onWeeklyMonthlyRepredict,
  initialT1dClosePrice,
  issuePrice,
}) => {
  const [prices, setPrices] = useState<{
    low: number | "";
    high: number | "";
    vwap: number | "";
    close: number | "";
  }>({
    low: "",
    high: "",
    vwap: "",
    close: "",
  });

  const [closeReturn, setCloseReturn] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(result);

  /* -------------------- Prefill -------------------- */

  useEffect(() => {
    setPredictionResult(result);

    if (
      initialT1dClosePrice != null &&
      issuePrice != null &&
      issuePrice !== 0
    ) {
      setPrices((p) => ({ ...p, close: initialT1dClosePrice }));
      const ret =
        ((initialT1dClosePrice - issuePrice) / issuePrice) * 100;
      setCloseReturn(Number(ret.toFixed(2)));
    }
  }, [result, initialT1dClosePrice, issuePrice]);

  /* -------------------- Return calc -------------------- */

  useEffect(() => {
    if (
      typeof prices.close === "number" &&
      issuePrice != null &&
      issuePrice !== 0
    ) {
      const ret =
        ((prices.close - issuePrice) / issuePrice) * 100;
      setCloseReturn(Number(ret.toFixed(2)));
    } else {
      setCloseReturn(null);
    }
  }, [prices.close, issuePrice]);

  /* -------------------- Predict -------------------- */

  const handleRepredict = async () => {
    if (typeof prices.close !== "number" || closeReturn == null) return;

    setIsLoading(true);
    try {
      const newResult = await onWeeklyMonthlyRepredict({
        t1dClosePrice: prices.close,
        t1dCloseReturn: closeReturn,
        t1dLowPrice:
          prices.low !== "" ? Number(prices.low) : undefined,
        t1dHighPrice:
          prices.high !== "" ? Number(prices.high) : undefined,
        t1dVWAPPrice:
          prices.vwap !== "" ? Number(prices.vwap) : undefined,
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
        {yes ? <CheckCircleIcon sx={{ mr: 1 }} /> : <CancelIcon sx={{ mr: 1 }} />}
        {yes ? "Yes" : "No"}
      </Box>
    );
  };

  const renderConfidence = (confidence?: number | null) => {
    if (confidence == null) return <Box color="text.disabled">N/A</Box>;

    let color = "#f44336";
    if (confidence >= 60) color = "#4caf50";
    else if (confidence >= 40) color = "#ff9800";

    return (
      <LinearProgress
        variant="determinate"
        value={confidence}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(0,0,0,0.05)",
          "& .MuiLinearProgress-bar": { backgroundColor: color },
        }}
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
                  close:
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value),
                }))
              }
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Close Return:{" "}
              {closeReturn != null ? `${closeReturn}%` : "—"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleRepredict}
              disabled={isLoading || closeReturn == null}
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

export default FOWeeklyMonthlyPredictionResults;
