import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

type TickerInputProps = {
  competitor: string;
  onSubmit: (ticker: string) => void;
};

const TickerInputComponent: React.FC<TickerInputProps> = ({ competitor, onSubmit }) => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!ticker) {
      setError("Please enter a ticker.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(ticker);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} >
      <Box display="flex" alignItems="center" gap={2}  mb ={4} flexWrap="wrap">
        <Typography
          variant="h6"
          color="#002060"
          fontWeight={600}
          sx={{ whiteSpace: "nowrap" }}
        >
          Comparative Trading Multiples & Performance Metrics
        </Typography>

        <TextField
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          variant="outlined"
          size="small"
        />

        <Button
          variant="contained"
         
          onClick={handleSubmit}
          disabled={loading}
          sx={{ backgroundColor: "#002060", color: "#fff" }}
        >
          {loading ? <CircularProgress size={20} /> : "Submit"}
        </Button>
      </Box>

      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default TickerInputComponent;
