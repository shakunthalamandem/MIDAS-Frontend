import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Snackbar,
  Alert,
  Stack,
  Paper,
  Card,
  CardContent,
  Fade,
  Grow,
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
  const showSnackbar = (
    msg: string,
    severity: "success" | "error" = "success"
  ) => setSnackbar({ open: true, message: msg, severity });

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
    } catch {
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
      await axios.post(`${apiUrl}/api/ipo_ai_compititors_update/`, payload, {
        headers: getAuthHeaders(),
      });
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
      {/* Header */}
      <Typography
        variant="body1"
        sx={{
          fontWeight: 200,
          color: "primary.main",
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <AutoAwesome fontSize="small" /> AI Suggested Tickers
        {comparativeTickers.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            ({comparativeTickers.length})
          </Typography>
        )}
      </Typography>

      {/* Ticker list */}
      <Box mb={2}>
        {loading ? (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={100}
                height={50}
                sx={{ borderRadius: "12px" }}
              />
            ))}
          </Stack>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : comparativeTickers.length > 0 ? (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={2}
            sx={{
              animation: glowTrigger ? "pulseBg 2s ease-out" : "none",
              "@keyframes pulseBg": {
                "0%": { backgroundColor: "transparent" },
                "50%": { backgroundColor: "rgba(25,118,210,0.05)" },
                "100%": { backgroundColor: "transparent" },
              },
              p: 1,
              borderRadius: 2,
            }}
          >
            {comparativeTickers.map((ticker, idx) => (
              <Grow in={true} key={idx} timeout={400 + idx * 100}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    minWidth: 100,
                    px: 2,
                    py: 1,
                    borderColor: "primary.main",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                      transform: "translateY(-3px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0.5, "&:last-child": { pb: 0.5 } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, textAlign: "center" }}
                    >
                      {ticker}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            ))}
          </Stack>
        ) : (
          <Typography>No AI comparable tickers found.</Typography>
        )}
      </Box>

      {/* Action buttons */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "rgba(25,118,210,0.05)",
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          Not satisfied? Try fetching recommendations from other AI models for
          better accuracy.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Update />}
            onClick={handleUpdate}
            disabled={updating}
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            {updating ? "Updating..." : "Get Other AI Recommendations"}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            {deleting ? "Deleting..." : "Delete AI Suggestions"}
          </Button>
        </Stack>
      </Paper>

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
