import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";

type TickerInputProps = {
  competitor: string; // passed from parent
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
      const response = await axios.post("http://192.168.1.36:8000/api/get_ai_comps_metrics/", {
        ticker,
        competitor,
      });

      setResponseData(response.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, margin: "auto", mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Enter Ticker Symbol
      </Typography>
      <Box display="flex" gap={2} flexDirection="column">
        <TextField
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}

        {responseData && (
          <Box mt={2}>
            <Typography variant="subtitle1">API Response:</Typography>
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TickerInputComponent;
