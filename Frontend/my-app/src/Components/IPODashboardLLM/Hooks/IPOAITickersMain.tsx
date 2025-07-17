import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Button,
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
  const [updating, setUpdating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch data from /api/ipo_ai_compititors/
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
      showSnackbar("Comparative tickers loaded successfully.");
    } catch (err: any) {
      console.error("Error fetching comparative tickers:", err);
      setError("Failed to load comparative tickers.");
      showSnackbar("Failed to load comparative tickers.", "error");
    } finally {
      setLoading(false);
    }
  };

  // POST to update data
  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const payload = {
        ticker: selectedData?.ticker_name,
        company_name: selectedData?.company_name,
       
      };

      await axios.post(
        `${apiUrl}/api/ipo_ai_compititors_update/`,
        payload,
        { headers: getAuthHeaders() }
      );

      showSnackbar("Comparative tickers updated.");
      fetchComparativeTickers(); // Refresh list
    } catch (err) {
      console.error("Error updating comparative tickers:", err);
      showSnackbar("Failed to update.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // POST to delete data
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const payload = {
        ticker: selectedData?.ticker_name,
      };

      await axios.post(
        `${apiUrl}/api/ipo_ai_compititors_delete/`,
        payload,
        { headers: getAuthHeaders() }
      );

      setComparativeTickers([]);
      showSnackbar("Comparative tickers deleted.");
    } catch (err) {
      console.error("Error deleting comparative tickers:", err);
      showSnackbar("Failed to delete.", "error");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (selectedData?.ticker_name) {
      fetchComparativeTickers();
    }
  }, [selectedData]);

  return (
    <Box mt={2}>
      <Box mb={2} display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? <CircularProgress size={20} /> : "Update"}
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <CircularProgress size={20} /> : "Delete"}
        </Button>
      </Box>

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

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IPOAITickersMain;
