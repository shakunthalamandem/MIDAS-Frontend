import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

// Define types for result data
interface ModelData {
  prediction: number;
  Accuracy: number;
}

type ResultData = {
  [key: string]: ModelData | undefined;
};

// Define prop types
interface PredictionResults2Props {
  result: ResultData;
  modelVersions: string[];
  onRepredict?: boolean;
  price?: number;
  handlePriceChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRepredict?: () => void;
  isLoading?: boolean;
}

const PredictionResults2: React.FC<PredictionResults2Props> = ({
  result,
  modelVersions,
  onRepredict,
  price,
  handlePriceChange,
  handleRepredict,
  isLoading,
}) => {
  const modelTypes: string[] = ["main"]; // Only keep "main"

  const rowLabels: Record<string, string> = {
    main: "General Deal Outcome Classification",
  };

  const rowExplanations: Record<string, string> = {
    main: `Categorizes the deal into:\n📉 Negative: Return < -1%\n⚖️ Neutral: -1% ≤ Return ≤ 1%\n📈 Positive: Return > 1%`,
  };

  const getModelKey = (version: string, type: string): string => `${version}_${type}`;

  const renderOutcome = (value: number): string => {
    if (value > 0.01) return "📈 Positive";
    if (value < -0.01) return "📉 Negative";
    return "⚖️ Neutral";
  };

  const renderConfidenceLevel = (value: number | null | undefined): string => {
    if (value == null) return "N/A";
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <Paper
      sx={{
        p: 3,
        mt: 4,
        bgcolor: "#f9fafb",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center">
          <BarChartIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6" color="primary">
            📊 Model Prediction Results
          </Typography>
        </Box>

        {onRepredict && (
          <Box display="flex" alignItems="center">
            <TextField
              label="T+1 Day Open Return"
              variant="outlined"
              value={price}
              onChange={handlePriceChange}
              size="small"
              sx={{
                mr: 2,
                width: "194px",
                position: "relative",
                top: "18px",
                backgroundColor: "#ede7f6",
                borderRadius: "4px",
              }}
              type="number"
            />
            <Button
              variant="outlined"
              onClick={handleRepredict}
              disabled={isLoading}
              sx={{
                position: "relative",
                top: "18px",
                backgroundColor: "#ede7f6",
                color: "#002060",
                border: "1px solid #B99976",
                "&:disabled": { backgroundColor: "#002060", color: "#ccc" },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "Repredict"
              )}
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <TableContainer>
        <Table>
          <TableBody>
            <TableRow sx={{ bgcolor: "#f0f4f8" }}>
              <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Explanation</TableCell>
              {modelVersions.map((version: string, idx: number) => (
                <React.Fragment key={version}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: idx === 0 ? "#e3f2fd" : "#ede7f6",
                    }}
                  >
                    T + 1D Closing Result
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: idx === 0 ? "#e3f2fd" : "#ede7f6",
                    }}
                  >
                    T + 1D Closing Accuracy
                  </TableCell>
                </React.Fragment>
              ))}
            </TableRow>

            <TableRow>
              <TableCell>{rowLabels["main"]}</TableCell>
              <TableCell>
                <Typography variant="body2" whiteSpace="pre-line">
                  {rowExplanations["main"]}
                </Typography>
              </TableCell>
              {modelVersions.map((version: string, idx: number) => {
                const key = getModelKey(version, "main");
                const modelData = result[key];
                const cellColor = idx === 0 ? "#e3f2fd" : "#ede7f6";

                if (!modelData) {
                  return (
                    <React.Fragment key={version}>
                      <TableCell sx={{ bgcolor: cellColor }}>
                        <Box color="text.disabled">N/A</Box>
                      </TableCell>
                      <TableCell sx={{ bgcolor: cellColor }}>
                        <Box color="text.disabled">N/A</Box>
                      </TableCell>
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={version}>
                    <TableCell sx={{ bgcolor: cellColor }}>
                      {renderOutcome(modelData.prediction)}
                    </TableCell>
                    <TableCell sx={{ bgcolor: cellColor }}>
                      {renderConfidenceLevel(modelData.Accuracy)}
                    </TableCell>
                  </React.Fragment>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PredictionResults2;
