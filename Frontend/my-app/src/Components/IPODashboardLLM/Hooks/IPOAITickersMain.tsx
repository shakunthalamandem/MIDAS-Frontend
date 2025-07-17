import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Button,
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

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

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
    } catch (err: any) {
      console.error("Error fetching comparative tickers:", err);
      setError("Failed to load comparative tickers.");
    } finally {
      setLoading(false);
    }
  };

  // POST to update data
  const handleUpdate = async () => {
    try {
      const payload = {
        ticker: selectedData?.ticker_name,
        company_name: selectedData?.company_name,
        updated_data: {
          note: "Updated by user", // Replace with your actual update fields
        },
      };

      await axios.post(
        `${apiUrl}/api/ipo_ai_compititors_update/`,
        payload,
        { headers: getAuthHeaders() }
      );

      fetchComparativeTickers(); // Refresh list
    } catch (err) {
      console.error("Error updating comparative tickers:", err);
    }
  };

  // POST to delete data
  const handleDelete = async () => {
    try {
      const payload = {
        ticker: selectedData?.ticker_name,
      };

      await axios.post(
        `${apiUrl}/api/ipo_ai_compititors_delete/`,
        payload,
        { headers: getAuthHeaders() }
      );

      setComparativeTickers([]); // Clear list after delete
    } catch (err) {
      console.error("Error deleting comparative tickers:", err);
    }
  };

  useEffect(() => {
    if (selectedData?.ticker_name) {
      fetchComparativeTickers();
    }
  }, [selectedData]);

  return (
    <Box mt={2}>
      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          sx={{ mr: 2 }}
        >
          Update
        </Button>
        <Button variant="outlined" color="error" onClick={handleDelete}>
          Delete
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
    </Box>
  );
};

export default IPOAITickersMain;
