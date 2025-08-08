import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Chip,
  Skeleton,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { AutoAwesome, Update, Delete } from "@mui/icons-material";

interface Props {
  selectedData: {
    ticker_name?: string;
    company_name?: string;
    exchange?: string;
  };
}

const IPOAITickersMain: React.FC<Props> = ({ selectedData }) => {
  const [comparativeTickers, setComparativeTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [glowTrigger, setGlowTrigger] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });
  const showSnackbar = (msg: string, severity: "success" | "error" = "success") =>
    setSnackbar({ open: true, message: msg, severity });

  const fetchComparativeTickers = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ticker: selectedData?.ticker_name,
        company_name: selectedData?.company_name,
        exchange: selectedData?.exchange,
      };
      const res = await axios.post<{ comps?: any[] }>(
        `${apiUrl}/api/ipo_ai_compititors/`,
        payload,
        { headers: getAuthHeaders() }
      );
      const comps = res.data?.comps || [];
      setComparativeTickers(comps.map((c: any) => c.comp_ticker));
      setGlowTrigger(true);
      setTimeout(() => setGlowTrigger(false), 2000);
      showSnackbar("AI tickers loaded successfully.");
    } catch (err) {
      setError("Failed to load AI tickers.");
      showSnackbar("Failed to load AI tickers.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const payload = {
        ticker: selectedData?.ticker_name,
        company_name: selectedData?.company_name,
        exchange: selectedData?.exchange,
      };
      await axios.post(
        `${apiUrl}/api/ipo_ai_compititors_update/`,
        payload,
        { headers: getAuthHeaders() }
      );
      showSnackbar("AI tickers updated.");
      fetchComparativeTickers();
    } catch {
      showSnackbar("Failed to update.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.post(
        `${apiUrl}/api/ipo_ai_compititors_delete/`,
        { ticker: selectedData?.ticker_name },
        { headers: getAuthHeaders() }
      );
      setComparativeTickers([]);
      showSnackbar("AI tickers deleted.");
    } catch {
      showSnackbar("Failed to delete.", "error");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (selectedData?.ticker_name) fetchComparativeTickers();
  }, [selectedData]);

  return (
    <Box>
      {/* Action buttons */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Update />}
          onClick={handleUpdate}
          disabled={updating}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          {updating ? "Updating..." : "Update"}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={handleDelete}
          disabled={deleting}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </Stack>

      {/* Content */}
      {loading ? (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={80} height={32} />
          ))}
        </Stack>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : comparativeTickers.length > 0 ? (
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{
            animation: glowTrigger ? "glowPulse 2s ease-out" : "none",
            "@keyframes glowPulse": {
              "0%": { boxShadow: "0 0 0px rgba(0, 150, 255, 0)" },
              "50%": { boxShadow: "0 0 20px rgba(0, 150, 255, 0.5)" },
              "100%": { boxShadow: "0 0 0px rgba(0, 150, 255, 0)" },
            },
            borderRadius: "8px",
            p: 1,
          }}
        >
          {comparativeTickers.map((ticker, idx) => (
            <Chip
              key={idx}
              label={ticker}
              variant="outlined"
              color="primary"
              icon={<AutoAwesome fontSize="small" />}
              sx={{
                borderRadius: "16px",
                transition: "all 0.2s",
                "&:hover": { backgroundColor: "primary.main", color: "white" },
              }}
            />
          ))}
        </Stack>
      ) : (
        <Typography>No AI comparable tickers found.</Typography>
      )}

      {/* Snackbar */}
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
