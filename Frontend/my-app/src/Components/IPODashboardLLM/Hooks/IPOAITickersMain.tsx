import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";

interface Props {
  selectedData: {
    ticker_name?: string;
    company_name?: string;
    exchange?: string;
  };
}

const IPOAITickersMain: React.FC<Props> = ({ selectedData }) => {
  const [comparativeTickers, setComparativeTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("info");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  const fetchComparativeTickers = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ticker: selectedData?.ticker_name,
        company_name: selectedData?.company_name,
        exchange: selectedData?.exchange,
      };

      const response = await axios.post(
        `${apiUrl}/api/ipo_ai_compititors/`,
        payload,
        { headers: getAuthHeaders() }
      );

      const data = response.data as { comps: { comp_ticker: string }[] };
      const comps = data.comps || [];
      const tickers = comps.map((item) => item.comp_ticker);
      setComparativeTickers(tickers);
    } catch (err: any) {
      console.error("Error fetching comparative tickers:", err);
      setError("Failed to load comparative tickers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedData?.ticker_name) {
      fetchComparativeTickers();
    }
  }, [selectedData]);

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${apiUrl}/api/ipo_ai_compititors/`,
        {
          ticker: selectedData?.ticker_name,
          company_name: selectedData?.company_name,
          exchange: selectedData?.exchange,
        },
        { headers: getAuthHeaders() }
      );
      await fetchComparativeTickers();
      showSnackbar("Comparative tickers regenerated successfully.", "success");
    } catch (err) {
      console.error("Error regenerating tickers:", err);
      showSnackbar("Failed to regenerate comparative tickers.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.request({
        url: `${apiUrl}/api/ipo_ai_compititors/`,
        method: "DELETE",
        headers: getAuthHeaders(),
        data: {
          ticker: selectedData?.ticker_name,
        },
      });
      setComparativeTickers([]);
      showSnackbar("Comparative tickers deleted successfully.", "success");
    } catch (err) {
      console.error("Error deleting tickers:", err);
      showSnackbar("Failed to delete comparative tickers.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box mt={2}>
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegenerate}
          disabled={loading}
        >
          Regenerate
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : comparativeTickers.length > 0 ? (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {comparativeTickers.map((ticker, idx) => (
            <Chip key={idx} label={ticker} color="primary" />
          ))}
        </Box>
      ) : (
        <Typography>No comparable tickers found.</Typography>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IPOAITickersMain;
