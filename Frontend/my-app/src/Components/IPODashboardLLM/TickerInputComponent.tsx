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
};

const TickerInputComponent: React.FC<TickerInputProps> = ({ competitor }) => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!ticker) {
      setError("Please enter a ticker.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) throw new Error("API URL not set");

      const response = await fetch(`${apiUrl}/api/get_ai_comps_metrics/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker, competitor }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setResponseData(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
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
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Submit"}
        </Button>
      </Box>

      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}

      {responseData && (
        <Box>
          <Typography variant="subtitle1">API Response:</Typography>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default TickerInputComponent;
